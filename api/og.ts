import { createClient } from '@supabase/supabase-js'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request) {
  const url = new URL(req.url)
  const path = url.pathname
  
  const parts = path.split('/')
  const type = parts[1]
  const slug = parts[2]
  
  if (!slug || (type !== 'server' && type !== 'projects')) {
     return fetch(new URL('/', req.url))
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
     return new Response('Missing Supabase credentials in Vercel environment variables', { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  
  let title = 'Realm Explorer'
  let description = 'Discover the best Minecraft Servers and Realms. Vote for your favorites and find your next adventure.'
  let image = 'https://realmexplorer.xyz/meta-preview/RE-Banned_EAA0FDC.webp'
  
  try {
    if (type === 'server') {
       const { data } = await supabase.from('servers').select('name, short_description, description, icon_url').eq('slug', slug).single()
       if (data) {
          title = `${data.name} | Realm Explorer`
          description = data.short_description || data.description?.substring(0, 160) || description
          image = data.icon_url || image
       }
    } else if (type === 'projects') {
       const { data } = await supabase.from('projects').select('name, short_description, description, icon_url').eq('slug', slug).single()
       if (data) {
          title = `${data.name} | Realm Explorer`
          description = data.short_description || data.description?.substring(0, 160) || description
          image = data.icon_url || image
       }
    }
  } catch (error) {
    console.error('Error fetching data for OG tags:', error)
  }
  
  const escapeHtml = (unsafe: string) => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;")
  }

  const safeTitle = escapeHtml(title)
  const safeDescription = escapeHtml(description)
  const safeImage = escapeHtml(image)
  const safeUrl = escapeHtml(url.href)

  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${safeTitle}</title>
        <meta name="title" content="${safeTitle}" />
        <meta name="description" content="${safeDescription}" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="${safeUrl}" />
        <meta property="og:title" content="${safeTitle}" />
        <meta property="og:description" content="${safeDescription}" />
        <meta property="og:image" content="${safeImage}" />
        
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content="${safeUrl}" />
        <meta property="twitter:title" content="${safeTitle}" />
        <meta property="twitter:description" content="${safeDescription}" />
        <meta property="twitter:image" content="${safeImage}" />
      </head>
      <body>
        <h1>${safeTitle}</h1>
        <p>${safeDescription}</p>
        <img src="${safeImage}" alt="Logo" />
        <p>This is a fast Edge-rendered Open Graph response for crawlers. If you are a human reading this, please disable bot-imitation in your browser to view the real site.</p>
      </body>
    </html>
  `
  
  return new Response(html, {
    headers: { 
      'Content-Type': 'text/html', 
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' 
    }
  })
}
