import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { filterLanding, landingPages, type LandingPage } from '../src/lib/landingPages'
import { DEFAULT_IMAGE, SITE_NAME, SITE_URL, listingTitle, plainText } from '../src/lib/seo'
import type { ServerCategory, ServerType } from '../src/types'

export const config = {
  runtime: 'edge',
}

interface PageMeta {
  title: string
  description: string
  path: string
  image: string
  card: 'summary' | 'summary_large_image'
  ogType: 'website' | 'article'
  jsonLd: object[]
  body: string
}

const DOCS_IMAGE = `${SITE_URL}/meta-preview/RE-docs.webp`

const staticPages: Record<string, PageMeta> = {
  servers: {
    title: `Browse All Minecraft Realms & Servers | ${SITE_NAME}`,
    description: 'Explore our directory of the best Minecraft servers and realms. Find your next adventure on Realm Explorer.',
    path: '/servers',
    image: DEFAULT_IMAGE,
    card: 'summary_large_image',
    ogType: 'website',
    jsonLd: [],
    body: landingLinks(),
  },
  docs: {
    title: `Documentation | ${SITE_NAME}`,
    description: 'Learn how to use Realm Explorer, list your servers, and explore the community.',
    path: '/docs',
    image: DOCS_IMAGE,
    card: 'summary_large_image',
    ogType: 'website',
    jsonLd: [],
    body: '',
  },
  'api-docs': {
    title: `Public API (Beta) | ${SITE_NAME}`,
    description: 'Integrate Realm Explorer\'s server directory into your website. Free, open, no API key required. Supports filtering, sorting, and pagination.',
    path: '/api-docs',
    image: DOCS_IMAGE,
    card: 'summary_large_image',
    ogType: 'website',
    jsonLd: [],
    body: '',
  },
}

export default async function handler(req: Request) {
  const index = await fetch(new URL('/index.html', req.url))
  if (!index.ok) return index

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return index

  let meta: PageMeta | null | undefined
  try {
    meta = await resolveMeta(createClient(supabaseUrl, supabaseKey), new URL(req.url).searchParams)
  } catch (error) {
    console.error('Error building page meta:', error)
    return index
  }
  if (meta === undefined) return index

  const html = await index.text()
  if (meta === null) {
    return new Response(html.replace('</head>', '  <meta name="robots" content="noindex" />\n  </head>'), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate' },
    })
  }

  return new Response(injectMeta(html, meta), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Vercel-CDN-Cache-Control': 'max-age=300, stale-while-revalidate=3600',
    },
  })
}

async function resolveMeta(supabase: SupabaseClient, params: URLSearchParams): Promise<PageMeta | null | undefined> {
  const route = params.get('route')
  const slug = params.get('slug') ?? ''

  if (route === 'servers') {
    const page = filterLanding(params.get('type') as ServerType | null, params.get('category') as ServerCategory | null)
    return page ? landingMeta(supabase, page) : staticPages.servers
  }
  if (route === 'static') return staticPages[slug]
  if (route === 'landing') {
    const page = landingPages.find(p => p.slug === slug)
    return page && landingMeta(supabase, page)
  }
  if (!slug) return undefined
  if (route === 'server') return serverMeta(supabase, slug)
  if (route === 'projects') return projectMeta(supabase, slug)
  if (route === 'blog') return blogMeta(supabase, slug)
  return undefined
}

async function serverMeta(supabase: SupabaseClient, slug: string): Promise<PageMeta | null> {
  const { data, error } = await supabase
    .from('public_servers')
    .select('name, description, type, icon_url')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const parent = landingPages.find(p => p.slug === (data.type === 'realm' ? 'minecraft-bedrock-realms' : 'minecraft-server-list'))!
  const path = `/server/${slug}`
  return {
    title: `${listingTitle(data.name, data.type)} | ${SITE_NAME}`,
    description:
      plainText(data.description, 160) ||
      `Join ${data.name} on Realm Explorer. Discover the best Minecraft servers and realms.`,
    path,
    image: data.icon_url || DEFAULT_IMAGE,
    card: 'summary',
    ogType: 'website',
    jsonLd: [breadcrumbs([[parent.heading, `/${parent.slug}`], [data.name, path]])],
    body: `<h1>${esc(data.name)}</h1>
      <p>${esc(plainText(data.description, 5000))}</p>
      <p><a href="/${parent.slug}">${esc(parent.heading)}</a></p>`,
  }
}

async function projectMeta(supabase: SupabaseClient, slug: string): Promise<PageMeta | null> {
  const { data, error } = await supabase
    .from('public_projects')
    .select('name, short_description, description, icon_url')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const path = `/projects/${slug}`
  return {
    title: `${data.name} | Minecraft Project | ${SITE_NAME}`,
    description:
      plainText(data.short_description, 160) ||
      plainText(data.description, 160) ||
      `${data.name} on Realm Explorer.`,
    path,
    image: data.icon_url || DEFAULT_IMAGE,
    card: 'summary',
    ogType: 'website',
    jsonLd: [breadcrumbs([['Projects', '/projects'], [data.name, path]])],
    body: `<h1>${esc(data.name)}</h1>
      <p>${esc(plainText(data.description || data.short_description, 5000))}</p>
      <p><a href="/projects">Minecraft Projects</a></p>`,
  }
}

async function blogMeta(supabase: SupabaseClient, slug: string): Promise<PageMeta | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('title, content, image_url, created_at, updated_at')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const path = `/blog/${slug}`
  const image = data.image_url || DEFAULT_IMAGE
  return {
    title: `${data.title} | ${SITE_NAME} Blog`,
    description: plainText(data.content, 160) || `${data.title} on the Realm Explorer blog.`,
    path,
    image,
    card: 'summary_large_image',
    ogType: 'article',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: data.title,
        image,
        datePublished: data.created_at,
        dateModified: data.updated_at || data.created_at,
        mainEntityOfPage: `${SITE_URL}${path}`,
        publisher: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` },
      },
      breadcrumbs([['Blog', '/blog'], [data.title, path]]),
    ],
    body: `<h1>${esc(data.title)}</h1>
      <p>${esc(plainText(data.content, 5000))}</p>
      <p><a href="/blog">Realm Explorer Blog</a></p>`,
  }
}

async function landingMeta(supabase: SupabaseClient, page: LandingPage): Promise<PageMeta> {
  let query = supabase
    .from('public_servers')
    .select('id, name, slug')
    .eq('status', 'approved')
    .order('votes', { ascending: false })
    .limit(200)
  if (page.type) query = query.eq('type', page.type)
  if (page.category) query = query.eq('category', page.category)

  const { data, error } = await query
  if (error) throw error
  let listings = data ?? []

  if (page.platform) {
    const { data: platforms } = await supabase.rpc('public_server_platforms')
    if (platforms) {
      const ids = new Set(
        (platforms as { id: string; has_java: boolean; has_bedrock: boolean }[])
          .filter(p => (page.platform === 'bedrock' ? p.has_bedrock : p.has_java))
          .map(p => p.id),
      )
      listings = listings.filter(l => ids.has(l.id))
    }
  }
  listings = listings.slice(0, 50)

  const path = `/${page.slug}`
  return {
    title: `${page.title} | ${SITE_NAME}`,
    description: page.description,
    path,
    image: DEFAULT_IMAGE,
    card: 'summary_large_image',
    ogType: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: page.heading,
        itemListElement: listings.map((l, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: l.name,
          url: `${SITE_URL}/server/${l.slug}`,
        })),
      },
      breadcrumbs([[page.heading, path]]),
    ],
    body: `<h1>${esc(page.heading)}</h1>
      <p>${esc(page.intro)}</p>
      <ul>${listings.map(l => `<li><a href="/server/${esc(l.slug)}">${esc(l.name)}</a></li>`).join('')}</ul>
      ${page.sections.map(s => `<h2>${esc(s.heading)}</h2><p>${esc(s.text)}</p>`).join('')}
      ${landingLinks()}`,
  }
}

function landingLinks() {
  return `<ul>${landingPages.map(p => `<li><a href="/${p.slug}">${esc(p.heading)}</a></li>`).join('')}</ul>`
}

function breadcrumbs(trail: [name: string, path: string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [['Home', '/'], ...trail].map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: `${SITE_URL}${path}`,
    })),
  }
}

function injectMeta(html: string, meta: PageMeta) {
  const url = `${SITE_URL}${meta.path}`
  const title = esc(meta.title)
  const description = esc(meta.description)
  const image = esc(meta.image)
  const head = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" data-static-seo />`,
    `<link rel="canonical" href="${url}" data-static-seo />`,
    `<meta property="og:type" content="${meta.ogType}" data-static-seo />`,
    `<meta property="og:url" content="${url}" data-static-seo />`,
    `<meta property="og:title" content="${title}" data-static-seo />`,
    `<meta property="og:description" content="${description}" data-static-seo />`,
    `<meta property="og:image" content="${image}" data-static-seo />`,
    `<meta name="twitter:card" content="${meta.card}" data-static-seo />`,
    `<meta name="twitter:title" content="${title}" data-static-seo />`,
    `<meta name="twitter:description" content="${description}" data-static-seo />`,
    `<meta name="twitter:image" content="${image}" data-static-seo />`,
    ...meta.jsonLd.map(
      data => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`,
    ),
  ].join('\n    ')

  return html
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/\s*<(meta|link)\b[^>]*\bdata-static-seo\b[^>]*>/g, '')
    .replace('</head>', () => `  ${head}\n  </head>`)
    .replace('<div id="root"></div>', () => `<div id="root"></div>\n    <noscript>${meta.body}</noscript>`)
}

function esc(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
