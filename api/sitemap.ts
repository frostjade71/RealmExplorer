import { createClient } from '@supabase/supabase-js'
import { landingPages } from '../src/lib/landingPages'
import { SITE_URL } from '../src/lib/seo'

export const config = {
  runtime: 'edge',
}

interface Entry {
  path: string
  lastmod?: string | null
}

const staticPaths = [
  '/',
  '/servers',
  '/projects',
  '/leaderboards',
  '/blog',
  '/docs',
  '/api-docs',
  '/about',
  '/team',
  '/upgrade',
  '/terms',
  '/privacy',
  '/copyright',
]

export default async function handler() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return new Response('Server misconfiguration.', { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const [servers, projects, posts] = await Promise.all([
    supabase.from('public_servers').select('slug, updated_at').eq('status', 'approved').limit(5000),
    supabase.from('public_projects').select('slug').limit(5000),
    supabase.from('blog_posts').select('slug, updated_at').eq('status', 'published').limit(5000),
  ])

  if (servers.error) {
    console.error('Sitemap query error:', servers.error)
    return new Response('Failed to build sitemap.', { status: 500 })
  }

  const entries: Entry[] = [
    ...staticPaths.map(path => ({ path })),
    ...landingPages.map(page => ({ path: `/${page.slug}` })),
    ...servers.data.map(s => ({ path: `/server/${s.slug}`, lastmod: s.updated_at })),
    ...(projects.data ?? []).map(p => ({ path: `/projects/${p.slug}` })),
    ...(posts.data ?? []).map(p => ({ path: `/blog/${p.slug}`, lastmod: p.updated_at })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(urlTag).join('\n')}
</urlset>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

function urlTag({ path, lastmod }: Entry) {
  const loc = `${SITE_URL}${path}`.replace(/&/g, '&amp;')
  const modified = lastmod ? `\n    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''
  return `  <url>\n    <loc>${loc}</loc>${modified}\n  </url>`
}
