import { createClient } from '@supabase/supabase-js'

export const config = {
  runtime: 'edge',
}

const MAX_IDS = 100

export default async function handler(req: Request) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return json({ error: 'Method not allowed. Use GET or POST.' }, 405)
  }

  const key = req.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1]
  if (!key) {
    return json({ error: 'Missing key. Send the header "Authorization: Bearer <your key>".' }, 401)
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

  if (req.method === 'GET') {
    const { data, error } = await supabase.rpc('bedrock_votifier_pending', { p_key: key })
    if (error) {
      console.error('Bedrock Votifier pending error:', error)
      return json({ error: 'Failed to fetch votes.' }, 500)
    }
    if (data === null) {
      return json({ error: 'Invalid key.' }, 401)
    }
    return json({ success: true, votes: data }, 200)
  }

  const body = await req.json().catch(() => null)
  const ids: unknown = body?.ids
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_IDS || !ids.every(Number.isSafeInteger)) {
    return json({ error: `Bad Request. Send { "ids": [...] } with 1 to ${MAX_IDS} vote ids.` }, 400)
  }

  const { data, error } = await supabase.rpc('bedrock_votifier_claim', { p_key: key, p_ids: ids })
  if (error) {
    console.error('Bedrock Votifier claim error:', error)
    return json({ error: 'Failed to claim votes.' }, 500)
  }
  if (data === null) {
    return json({ error: 'Invalid key.' }, 401)
  }
  return json({ success: true, claimed: data }, 200)
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}
