import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const NETHERNET_TIMEOUT_MS = 5000
const BATCH_SIZE = 5

interface ListedServer {
  id: string
  ip_or_code: string | null
  port: number | null
  bedrock_ip: string | null
  bedrock_port: number | null
}

async function mcstatus(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`API returned ${response.status}`)
  return response.json()
}

async function nethernetStatus(host: string, port: number) {
  const attempts = ['https', 'http'].map(async (scheme) => {
    const response = await fetch(`${scheme}://${host}:${port}/v1/join`, {
      signal: AbortSignal.timeout(NETHERNET_TIMEOUT_MS),
    })
    if (!response.ok) {
      await response.body?.cancel()
      throw new Error(`Join endpoint returned ${response.status}`)
    }
    const data = await response.json()
    if (typeof data.players !== 'number') throw new Error('Join endpoint returned no player count')
    return { online: true, players: { online: data.players, max: data.maxPlayers } }
  })
  return Promise.any(attempts).catch(() => null)
}

async function bedrockStatus(host: string, port: number) {
  const suffix = port !== 19132 ? `:${port}` : ''
  const raknet = await mcstatus(`https://api.mcstatus.io/v2/status/bedrock/${host}${suffix}?query=false`).catch((err: Error) => err)
  if (!(raknet instanceof Error) && raknet.online) return raknet

  const nethernet = await nethernetStatus(host, port)
  if (nethernet) return nethernet
  if (raknet instanceof Error) throw raknet
  return raknet
}

async function updateServer(supabaseClient: ReturnType<typeof createClient>, server: ListedServer) {
  const hasJavaIp = server.ip_or_code && server.ip_or_code !== 'None' && !server.ip_or_code.startsWith('http')
  const hasBedrockIp = !!server.bedrock_ip

  if (!hasJavaIp && !hasBedrockIp) return 'skipped'

  try {
    let data
    if (hasJavaIp) {
      const port = server.port && server.port !== 25565 ? `:${server.port}` : ''
      data = await mcstatus(`https://api.mcstatus.io/v2/status/java/${server.ip_or_code}${port}?query=false`)
    } else {
      data = await bedrockStatus(server.bedrock_ip!, server.bedrock_port || 19132)
    }

    if (data.online) {
      const playersOnline = data.players?.online || 0
      const playersMax = data.players?.max || 0
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

      await supabaseClient
        .from('servers')
        .update({ online_players: playersOnline, max_players: playersMax })
        .eq('id', server.id)

      const { data: existing } = await supabaseClient
        .from('server_player_history')
        .select('max_players')
        .eq('server_id', server.id)
        .eq('record_date', today)
        .single()

      const currentMax = existing ? existing.max_players : 0

      if (playersOnline > currentMax || !existing) {
        const { error: upsertError } = await supabaseClient
          .from('server_player_history')
          .upsert(
            {
              server_id: server.id,
              record_date: today,
              max_players: playersOnline
            },
            { onConflict: 'server_id, record_date' }
          )

        if (upsertError) {
          console.error(`Failed to upsert for server ${server.id}:`, upsertError)
          return 'failed'
        }
      }
      return 'updated'
    }

    await supabaseClient
      .from('servers')
      .update({ online_players: -1, max_players: -1 })
      .eq('id', server.id)
    return 'updated'
  } catch (err) {
    console.error(`Error fetching stats for server ${server.id}:`, err)
    await supabaseClient
      .from('servers')
      .update({ online_players: -1, max_players: -1 })
      .eq('id', server.id)
    return 'failed'
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch all approved servers
    const { data: servers, error: serversError } = await supabaseClient
      .from('servers')
      .select('id, ip_or_code, port, bedrock_ip, bedrock_port')
      .eq('status', 'approved')
      .eq('type', 'server')

    if (serversError) throw serversError
    if (!servers || servers.length === 0) {
      return new Response(JSON.stringify({ message: 'No servers to update' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let updatedCount = 0
    let failedCount = 0

    // 2. Loop through servers and fetch player counts
    for (let i = 0; i < servers.length; i += BATCH_SIZE) {
      const results = await Promise.all(
        servers.slice(i, i + BATCH_SIZE).map(server => updateServer(supabaseClient, server))
      )
      updatedCount += results.filter(result => result === 'updated').length
      failedCount += results.filter(result => result === 'failed').length
    }

    return new Response(JSON.stringify({
      success: true,
      processed: servers.length,
      updated: updatedCount,
      failed: failedCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
