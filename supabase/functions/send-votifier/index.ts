import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { encode as base64Encode } from "https://deno.land/std@0.177.0/encoding/base64.ts"
import * as nodeCrypto from "node:crypto"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SERVICE_NAME = 'realmexplorer.xyz'
const TIMEOUT_MS = 8000

interface VotifierTarget {
  ip: string
  port: number
  token: string
  publicKey: string
}

interface Vote {
  username: string
  uuid: string
}

class VoteRejected extends Error {}

function withTimeout<T>(promise: Promise<T>, action: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out ${action}`)), TIMEOUT_MS)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

async function openConnection(target: VotifierTarget) {
  const pending = Deno.connect({ hostname: target.ip, port: target.port })
  try {
    return await withTimeout(pending, `connecting to ${target.ip}:${target.port}`)
  } catch (error) {
    pending.then(conn => conn.close()).catch(() => {})
    throw error
  }
}

async function writeAll(conn: Deno.Conn, data: Uint8Array) {
  let written = 0
  while (written < data.length) {
    written += await conn.write(data.subarray(written))
  }
}

function toPem(publicKey: string) {
  if (publicKey.includes("BEGIN PUBLIC KEY")) return publicKey
  // Ensure it has PEM headers if missing
  const body = publicKey.replace(/\s+/g, "") // remove all spaces
  const chunks = [];
  for (let i = 0; i < body.length; i += 64) {
    chunks.push(body.substring(i, i + 64));
  }
  return `-----BEGIN PUBLIC KEY-----\n${chunks.join('\n')}\n-----END PUBLIC KEY-----`;
}

async function sendV1(conn: Deno.Conn, target: VotifierTarget, vote: Vote) {
  // Votifier V1 protocol
  const timestamp = Date.now().toString();
  const payloadString = `VOTE\n${SERVICE_NAME}\n${vote.username}\n127.0.0.1\n${timestamp}\n`;

  const payloadBuf = new TextEncoder().encode(payloadString);
  const encrypted = nodeCrypto.publicEncrypt({
    key: toPem(target.publicKey),
    padding: nodeCrypto.constants.RSA_PKCS1_PADDING,
  }, payloadBuf);

  await writeAll(conn, encrypted);
  console.log(`Vote successfully sent via V1 to ${target.ip}:${target.port} for user ${vote.username}`)
}

async function sendV2(conn: Deno.Conn, target: VotifierTarget, vote: Vote, challenge: string) {
  // Votifier V2 protocol
  // Construct model
  const modelObj: Record<string, any> = {
    challenge: challenge,
    username: vote.username,
    address: '127.0.0.1',
    timestamp: Date.now(),
    serviceName: SERVICE_NAME
  }
  if (vote.uuid) {
    modelObj.uuid = vote.uuid;
  }

  const payloadString = JSON.stringify(modelObj)

  // Generate HMAC-SHA256 signature
  const keyBuf = new TextEncoder().encode(target.token)
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

  await writeAll(conn, finalBuf)

  // Read response from NuVotifier server
  const respBuf = new Uint8Array(512)
  const respBytes = await withTimeout(conn.read(respBuf), 'waiting for the Votifier response')
  if (respBytes) {
    const respStr = new TextDecoder().decode(respBuf.subarray(0, respBytes))
    let resp: Record<string, any> = {}
    try {
      resp = JSON.parse(respStr)
    } catch {
      // Not JSON or other parse error, log it
      console.log("Response from server:", respStr)
    }
    if (resp.status === 'error') {
      throw new VoteRejected(`Votifier rejected the vote: ${resp.errorMessage || resp.cause || resp.error || 'no reason given'}`)
    }
  }

  console.log(`Vote successfully sent via V2 to ${target.ip}:${target.port} for user ${vote.username}`)
}

async function deliver(target: VotifierTarget, vote: Vote, allowV2: boolean) {
  // Connect to NuVotifier via TCP
  const conn = await openConnection(target)

  try {
    // Read greeting: "VOTIFIER 2.0 <challenge>\n"
    const buf = new Uint8Array(256)
    const bytesRead = await withTimeout(conn.read(buf), 'waiting for the Votifier greeting')
    if (!bytesRead) throw new Error("Connection closed before greeting")

    const greeting = new TextDecoder().decode(buf.subarray(0, bytesRead))
    const parts = greeting.trim().split(' ')
    if (parts[0] !== 'VOTIFIER') {
      throw new Error("Invalid or unsupported Votifier greeting: " + greeting)
    }

    const offersV2 = parts.length >= 3 && parts[1].startsWith('2')

    if (allowV2 && target.token && offersV2) {
      await sendV2(conn, target, vote, parts[2].trim())
    } else if (target.publicKey) {
      await sendV1(conn, target, vote)
    } else if (offersV2) {
      throw new Error("Server requires Votifier V2 (Token), but no token was configured.")
    } else {
      throw new Error("Server requires Votifier V1 (RSA), but no public key was configured.")
    }
  } finally {
    conn.close()
  }
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

    const target: VotifierTarget = {
      ip: config.ip,
      port: config.port,
      token: (config.token ?? '').trim(),
      publicKey: (config.public_key ?? '').trim(),
    }

    if (!target.token && !target.publicKey) {
      throw new Error("Votifier is enabled, but no token or public key was configured.")
    }

    console.log(`Sending vote for ${mcUsername} to ${target.ip}:${target.port}`)

    // Optional: Fetch UUID from Mojang (used for V2 if available)
    let playerUuid = '';
    if (target.token) {
      try {
        const mojangRes = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(mcUsername)}`, {
          signal: AbortSignal.timeout(3000),
        });
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
    }

    const vote: Vote = { username: mcUsername, uuid: playerUuid }

    try {
      await deliver(target, vote, true)
    } catch (error) {
      if (!(error instanceof VoteRejected) || !target.publicKey) throw error
      console.error(`${error.message}. Retrying with the public key (V1).`)
      await deliver(target, vote, false)
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
