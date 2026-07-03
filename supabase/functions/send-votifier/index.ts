import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { encode as base64Encode } from "https://deno.land/std@0.177.0/encoding/base64.ts"
import * as nodeCrypto from "node:crypto"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { serverId, mcUsername } = await req.json()

    if (!serverId || !mcUsername) {
      throw new Error('serverId and mcUsername are required')
    }

    // Fetch the server votifier config
    const { data: config, error: fetchError } = await supabaseClient
      .from('server_votifier')
      .select('*')
      .eq('server_id', serverId)
      .maybeSingle()

    if (fetchError || !config) {
      // Votifier not configured or error fetching
      console.log('No votifier config found for server:', serverId)
      return new Response(JSON.stringify({ success: true, message: "No votifier configured" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log(`Sending vote for ${mcUsername} to ${config.ip}:${config.port}`)

    // Optional: Fetch UUID from Mojang (used for V2 if available)
    let playerUuid = '';
    try {
      const mojangRes = await fetch(`https://api.mojang.com/users/profiles/minecraft/${mcUsername}`);
      if (mojangRes.ok) {
        const mojangData = await mojangRes.json();
        if (mojangData && mojangData.id) {
          const rawId = mojangData.id;
          // Format with dashes
          playerUuid = `${rawId.substring(0, 8)}-${rawId.substring(8, 12)}-${rawId.substring(12, 16)}-${rawId.substring(16, 20)}-${rawId.substring(20)}`;
        }
      }
    } catch (e) {
      console.error("Failed to fetch UUID from Mojang:", e);
    }

    // Connect to NuVotifier via TCP
    const conn = await Deno.connect({
      hostname: config.ip,
      port: config.port,
    })

    try {
      // Read greeting: "VOTIFIER 2.0 <challenge>\n"
      const buf = new Uint8Array(256)
      let bytesRead = await conn.read(buf)
      if (!bytesRead) throw new Error("Connection closed before greeting")

      const greeting = new TextDecoder().decode(buf.subarray(0, bytesRead))
      const parts = greeting.trim().split(' ')
      
      if (parts.length >= 2 && parts[0] === 'VOTIFIER' && parts[1].startsWith('1.')) {
        // Votifier V1 protocol
        if (!config.public_key) {
          throw new Error("Server requires Votifier V1 (RSA), but no public key was configured.")
        }
        
        let pubKey = config.public_key.trim();
        // Ensure it has PEM headers if missing
        if (!pubKey.includes("BEGIN PUBLIC KEY")) {
          pubKey = pubKey.replace(/\s+/g, ""); // remove all spaces
          const chunks = [];
          for (let i = 0; i < pubKey.length; i += 64) {
            chunks.push(pubKey.substring(i, i + 64));
          }
          pubKey = `-----BEGIN PUBLIC KEY-----\n${chunks.join('\n')}\n-----END PUBLIC KEY-----`;
        }

        const serviceName = 'realmexplorer.xyz';
        const timestamp = Date.now().toString();
        const payloadString = `VOTE\n${serviceName}\n${mcUsername}\n127.0.0.1\n${timestamp}\n`;
        
        const payloadBuf = new TextEncoder().encode(payloadString);
        const encrypted = nodeCrypto.publicEncrypt({
          key: pubKey,
          padding: nodeCrypto.constants.RSA_PKCS1_PADDING,
        }, payloadBuf);
        
        await conn.write(encrypted);
        console.log(`Vote successfully sent via V1 to ${config.ip}:${config.port} for user ${mcUsername}`)
      } else if (parts.length >= 3 && parts[0] === 'VOTIFIER' && parts[1].startsWith('2')) {
        // Votifier V2 protocol
        if (!config.token) {
          throw new Error("Server requires Votifier V2 (Token), but no token was configured.")
        }
        const challenge = parts[2].trim()

        // Construct model
        const modelObj: Record<string, any> = {
          challenge: challenge,
          username: mcUsername,
          address: '127.0.0.1',
          timestamp: Date.now(),
          serviceName: 'realmexplorer.xyz'
        }
        if (playerUuid) {
          modelObj.uuid = playerUuid;
        }

        const payloadString = JSON.stringify(modelObj)

        // Generate HMAC-SHA256 signature
        const keyBuf = new TextEncoder().encode(config.token.trim())
        const cryptoKey = await crypto.subtle.importKey(
          "raw",
          keyBuf,
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        )
        
        const payloadBuf = new TextEncoder().encode(payloadString)
        const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, payloadBuf)
        const signatureBase64 = base64Encode(new Uint8Array(signatureBuffer))

        // Final JSON
        const packetJson = JSON.stringify({
          payload: payloadString,
          signature: signatureBase64
        })

        const packetBuf = new TextEncoder().encode(packetJson)
        const finalBuf = new Uint8Array(4 + packetBuf.length)
        const view = new DataView(finalBuf.buffer)
        view.setUint16(0, 0x733A, false) 
        view.setUint16(2, packetBuf.length, false)
        finalBuf.set(packetBuf, 4)

        await conn.write(finalBuf)
        
        // Read response from NuVotifier server
        const respBuf = new Uint8Array(512)
        const respBytes = await conn.read(respBuf)
        if (respBytes) {
          const respStr = new TextDecoder().decode(respBuf.subarray(0, respBytes))
          try {
            const resp = JSON.parse(respStr)
            if (resp.status === 'error') {
              throw new Error(`NuVotifier rejected vote: ${resp.cause} - ${resp.errorMessage}`)
            }
          } catch (e) {
            // Not JSON or other parse error, log it
            console.log("Response from server:", respStr)
          }
        }
        
        console.log(`Vote successfully sent via V2 to ${config.ip}:${config.port} for user ${mcUsername}`)
      } else {
        throw new Error("Invalid or unsupported Votifier greeting: " + greeting)
      }
    } finally {
      conn.close()
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("Votifier error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
