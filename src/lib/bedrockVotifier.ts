const toHex = (bytes: Uint8Array) => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')

export function generateBedrockVotifierKey() {
  return `re_${toHex(crypto.getRandomValues(new Uint8Array(32)))}`
}

export async function hashBedrockVotifierKey(key: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key))
  return toHex(new Uint8Array(digest))
}
