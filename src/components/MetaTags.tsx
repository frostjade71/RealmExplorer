import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  canonical?: string;
}

export function MetaTags({
  title,
  description = "Discover the best Minecraft Servers and Realms. Vote for your favorites, list your community, and find your next adventure on the most modern discovery platform.",
  image = "https://realmexplorer.xyz/og-image.webp",
  url = "https://realmexplorer.xyz",
  type = "website",
  canonical
}: MetaTagsProps) {
  const siteTitle = "Realm Explorer";
  const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} | Find & Promote Minecraft Servers`;
  const currentUrl = url.startsWith('http') ? url : `https://realmexplorer.xyz${url}`;
  const canonicalUrl = canonical || currentUrl;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook / Discord */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
}
