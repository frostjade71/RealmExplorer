import { createClient } from '@supabase/supabase-js'

export const config = {
  runtime: 'edge',
}

const TIMEOUT_MS = 5000

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed. Use GET.' }, 405)
  }

  const slug = new URL(req.url).searchParams.get('slug')
  if (!slug) {
    return json({ error: 'Bad Request. Send ?slug=<server slug>.' }, 400)
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return json({ error: 'Server misconfiguration.' }, 500)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data, error } = await supabase.rpc('get_server_details', { server_slug: slug })
  if (error) {
    console.error('Status lookup error:', error)
    return json({ error: 'Failed to look up server.' }, 500)
  }

  const server = data?.server
  if (!server || server.status !== 'approved' || server.type !== 'server') {
    return json({ error: 'Server not found.' }, 404)
  }

  const status = server.bedrock_ip
    ? await nethernetStatus(server.bedrock_ip, server.bedrock_port || 19132)
    : null

  return json(status ?? { online: false }, 200, 'public, s-maxage=30, stale-while-revalidate=60')
}

function nethernetStatus(host: string, port: number) {
  const attempts = ['https', 'http'].map(async (scheme) => {
    const response = await fetch(`${scheme}://${host}:${port}/v1/join`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!response.ok) {
      await response.body?.cancel()
      throw new Error(`Join endpoint returned ${response.status}`)
    }
    const info = await response.json()
    if (typeof info.players !== 'number') throw new Error('Join endpoint returned no player count')
    return {
      online: true,
      players: { online: info.players, max: typeof info.maxPlayers === 'number' ? info.maxPlayers : 0 },
      version: typeof info.version === 'string' ? info.version : undefined,
      name: typeof info.name === 'string' ? info.name : undefined,
    }
  })
  return Promise.any(attempts).catch(() => null)
}

function json(body: unknown, status: number, cacheControl = 'no-store') {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cacheControl },
  })
}
