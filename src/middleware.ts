// Vercel Edge Middleware - uses standard Web Request/Response APIs

/**
 * Vercel Middleware to handle dynamic meta tags for server detail pages.
 */

export const config = {
  matcher: '/server/:slug*',
};

export async function middleware(request: Request) {
  const url = new URL(request.url);
  const slug = url.pathname.split('/').filter(Boolean).pop();

  if (!slug || slug === 'server') {
    return;
  }

  // DEBUG: Heartbeat check
  if (slug === 'test-debug') {
    return new Response('MIDDLEWARE IS WORKING', { status: 200 });
  }

  const userAgent = request.headers.get('user-agent') || '';
  const bots = [
    'discordbot',
    'twitterbot',
    'facebookexternalhit',
    'linkedinbot',
    'whatsapp',
    'telegrambot',
    'slackbot',
    'googlebot',
    'bingbot',
    'baiduspider',
    'yandexbot',
    'opengraph',
    'bot',
  ];
  
  const isBot = bots.some(bot => userAgent.toLowerCase().includes(bot));

  if (!isBot) {
    return;
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return;
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/public_servers?slug=eq.${slug}&select=name,description,banner_url,icon_url`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const server = data?.[0];

    if (!server) {
      return;
    }

    const title = `${server.name} | Realm Explorer`;
    const description = server.description 
      ? server.description.substring(0, 160).replace(/[#*`]/g, '') + '...'
      : `Join ${server.name} on Realm Explorer. Discover the best Minecraft Servers and Realms.`;
    
    let imageUrl = server.banner_url || server.icon_url || 'https://realmexplorer.xyz/meta-preview/RE-Banned_EAA0FDC.webp';
    if (imageUrl.startsWith('/')) {
      imageUrl = `https://realmexplorer.xyz${imageUrl}`;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${request.url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${request.url}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <link rel="canonical" href="${request.url}">
</head>
<body>
  <h1>${server.name}</h1>
  <p>${description}</p>
  <img src="${imageUrl}" alt="${server.name}">
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'public, s-maxage=3600',
        'X-Middleware-Served': 'true',
      },
    });

  } catch (error) {
    return;
  }
}
