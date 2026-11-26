export const SITE_URL = 'https://www.realmexplorer.xyz'
export const SITE_NAME = 'Realm Explorer'
export const DEFAULT_TITLE = 'Minecraft Bedrock Realms & Servers List | Realm Explorer'
export const DEFAULT_DESCRIPTION =
  'Find the best Minecraft Bedrock realms and servers. Browse active realm codes and server IPs, vote for your favorites and list your own community on Realm Explorer.'
export const DEFAULT_IMAGE = `${SITE_URL}/meta-preview/RE-Banned_EAA0FDC.webp`

export function absoluteUrl(pathOrUrl: string) {
  return pathOrUrl.startsWith('http') ? pathOrUrl : `${SITE_URL}${pathOrUrl}`
}

export function listingTitle(name: string, type: string) {
  return `${name} | Minecraft ${type === 'realm' ? 'Realm' : 'Server'}`
}

export function plainText(markdown: string | null | undefined, maxLength: number) {
  const text = (markdown ?? '').replace(/[#*`_~[\]]/g, '').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3).trimEnd()}...`
}
