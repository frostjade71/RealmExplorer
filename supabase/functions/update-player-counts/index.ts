import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    for (const server of servers) {
      const hasJavaIp = server.ip_or_code && server.ip_or_code !== 'None' && !server.ip_or_code.startsWith('http')
      const hasBedrockIp = !!server.bedrock_ip

      if (!hasJavaIp && !hasBedrockIp) continue

      let url = ''
      if (hasJavaIp) {
        const port = server.port && server.port !== 25565 ? `:${server.port}` : ''
        url = `https://api.mcsrvstat.us/3/${server.ip_or_code}${port}`
      } else if (hasBedrockIp) {
        const port = server.bedrock_port && server.bedrock_port !== 19132 ? `:${server.bedrock_port}` : ''
        url = `https://api.mcsrvstat.us/bedrock/3/${server.bedrock_ip}${port}`
      }

      if (!url) continue

      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`API returned ${response.status}`)
        const data = await response.json()

        if (data.online) {
          const playersOnline = data.players?.online || 0
          const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

          // 3. Upsert into server_player_history but ensure we only store the MAX
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
              failedCount++
            } else {
              updatedCount++
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching stats for server ${server.id}:`, err)
        failedCount++
      }
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
