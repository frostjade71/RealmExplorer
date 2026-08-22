import { createClient } from '@supabase/supabase-js'

export const config = {
  runtime: 'edge',
}

/**
 * Public API — Realm Explorer Server List
 *
 * Usage:
 *   GET /api/servers                        → all approved servers
 *   GET /api/servers?type=realm             → only realms
 *   GET /api/servers?type=server            → only servers
 *   GET /api/servers?category=smp           → only SMP
 *   GET /api/servers?featured=true          → only featured
 *   GET /api/servers?limit=10&offset=0      → pagination
 *   GET /api/servers?sort=votes             → sort by votes (desc)
 *   GET /api/servers?sort=newest            → sort by newest
 *   GET /api/servers?sort=name              → sort by name (A-Z)
 *
 * All filters can be combined.
 */
export default async function handler(req: Request) {
  // ── CORS ──────────────────────────────────────────────────────────────
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed. Use GET.' }, 405, corsHeaders)
  }

  // ── Supabase client ───────────────────────────────────────────────────
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return json({ error: 'Server misconfiguration.' }, 500, corsHeaders)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // ── Parse query parameters ────────────────────────────────────────────
  const url = new URL(req.url)
  const type = url.searchParams.get('type')        // 'server' | 'realm'
  const category = url.searchParams.get('category') // 'factions' | 'kitpvp' | 'skyblock' | 'smp' | 'modded' | 'other'
  const featured = url.searchParams.get('featured') // 'true'
  const sort = url.searchParams.get('sort') || 'votes' // 'votes' | 'newest' | 'name'
  const limit = clamp(parseInt(url.searchParams.get('limit') || '50', 10), 1, 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0)

  // ── Build query ───────────────────────────────────────────────────────

  let query = supabase
    .from('public_servers')
    .select(
      'id, name, slug, description, type, category, icon_url, banner_url, tags, votes, average_rating, rating_count, featured, website_url, discord_url, created_at',
      { count: 'exact' }
    )

  if (type && ['server', 'realm'].includes(type)) {
    query = query.eq('type', type)
  }
  if (category && ['factions', 'kitpvp', 'skyblock', 'smp', 'modded', 'other'].includes(category)) {
    query = query.eq('category', category)
  }
  if (featured === 'true') {
    query = query.eq('featured', true)
  }

  // Sorting
  switch (sort) {
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'name':
      query = query.order('name', { ascending: true })
      break
    case 'votes':
    default:
      query = query.order('votes', { ascending: false })
      break
  }

  // Pagination
  query = query.range(offset, offset + limit - 1)

  // ── Execute ───────────────────────────────────────────────────────────
  try {
    const { data, error, count } = await query

    if (error) {
      console.error('Supabase query error:', error)
      return json({ error: 'Failed to fetch servers.' }, 500, corsHeaders)
    }

    return json(
      {
        success: true,
        total: count ?? 0,
        limit,
        offset,
        data: data ?? [],
      },
      200,
      {
        ...corsHeaders,
        // Cache for 5 minutes at the edge, allow stale for 1 hour
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      }
    )
  } catch (err: any) {
    console.error('Unexpected error:', err)
    return json({ error: 'Internal server error.' }, 500, corsHeaders)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  })
}

function clamp(value: number, min: number, max: number) {
  if (isNaN(value)) return min
  return Math.min(Math.max(value, min), max)
}
