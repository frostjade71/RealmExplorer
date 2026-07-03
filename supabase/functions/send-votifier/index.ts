import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { encode as base64Encode } from "https://deno.land/std@0.177.0/encoding/base64.ts"

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
      const parts = greeting.split(' ')
      if (parts.length < 3 || parts[0] !== 'VOTIFIER' || parts[1] !== '2.0') {
        throw new Error("Invalid or unsupported Votifier greeting (Only NuVotifier v2 is supported)")
      }

      const challenge = parts[2].trim()

      // Construct model
      const modelObj = {
        challenge: challenge,
        username: mcUsername,
        address: '127.0.0.1',
        timestamp: Date.now(),
        serviceName: 'RealmExplorer'
      }

      const payloadString = JSON.stringify({ model: modelObj })

      // Generate HMAC-SHA256 signature
      const keyBuf = new TextEncoder().encode(config.token)
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

      // Send packet: 2-byte length + JSON string
      const packetBuf = new TextEncoder().encode(packetJson)
      const finalBuf = new Uint8Array(2 + packetBuf.length)
      const view = new DataView(finalBuf.buffer)
      view.setUint16(0, packetBuf.length, false) // Big endian
      finalBuf.set(packetBuf, 2)

      await conn.write(finalBuf)
      
      console.log(`Vote successfully sent to ${config.ip}:${config.port} for user ${mcUsername}`)
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
