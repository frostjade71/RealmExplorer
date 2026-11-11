import { useState } from 'react'

export function toStaticDiscordUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  try {
    let staticUrl = url

    // Convert avatar/banner gif into static png
    if (staticUrl.includes('cdn.discordapp.com/') && staticUrl.includes('.gif')) {
      staticUrl = staticUrl.replace(/\.gif(\?|$)/i, '.png$1')
    }

    if (staticUrl.includes('cdn.discordapp.com/avatar-decoration-presets/')) {
      if (staticUrl.includes('passthrough=true')) {
        staticUrl = staticUrl.replace('passthrough=true', 'passthrough=false')
      } else if (!staticUrl.includes('passthrough=')) {
        staticUrl += (staticUrl.includes('?') ? '&' : '?') + 'passthrough=false'
      }
    }

    return staticUrl
  } catch {
    return url ?? undefined
  }
}

export interface DiscordAvatarProps {
  src?: string | null
  alt?: string
  decorationUrl?: string | null
  sizeClassName?: string
  avatarClassName?: string
  className?: string
  goldFrameSrc?: string
  isExplorerPlus?: boolean
  fetchPriority?: 'high' | 'low' | 'auto'
  decoding?: 'async' | 'auto' | 'sync'
  loading?: 'eager' | 'lazy'
  width?: number
  height?: number
  showGoldRingIfExplorerPlus?: boolean
  forceStatic?: boolean
}

export function DiscordAvatar({
  src,
  alt = 'User avatar',
  decorationUrl,
  sizeClassName = 'w-8 h-8',
  avatarClassName = 'rounded-full',
  className = '',
  goldFrameSrc,
  isExplorerPlus = false,
  fetchPriority,
  decoding = 'async',
  loading = 'lazy',
  width,
  height,
  showGoldRingIfExplorerPlus = false,
  forceStatic = true,
}: DiscordAvatarProps) {
  const [imgError, setImgError] = useState(false)
  const defaultAvatar = 'https://cdn.discordapp.com/embed/avatars/0.png'

  const effectiveSrcRaw = forceStatic ? toStaticDiscordUrl(src) : src
  const displaySrc = imgError || !effectiveSrcRaw ? defaultAvatar : effectiveSrcRaw
  const effectiveDecorationUrl = forceStatic ? toStaticDiscordUrl(decorationUrl) : decorationUrl

  const effectiveAvatarClass = effectiveDecorationUrl ? 'rounded-full' : avatarClassName

  return (
    <div className={`relative flex-shrink-0 ${sizeClassName} ${className}`}>
      <img
        src={displaySrc}
        alt={alt}
        className={`w-full h-full object-cover ${effectiveAvatarClass} ${
          showGoldRingIfExplorerPlus && isExplorerPlus && effectiveDecorationUrl ? 'ring-2 ring-[#f2a929]/50' : ''
        }`}
        onError={() => setImgError(true)}
        fetchPriority={fetchPriority}
        decoding={decoding}
        loading={loading}
        width={width}
        height={height}
      />

      {effectiveDecorationUrl ? (
        <img
          src={effectiveDecorationUrl}
          alt="Discord Avatar Decoration"
          className="absolute -top-[16%] -left-[16%] w-[132%] h-[132%] object-contain pointer-events-none z-10 max-w-none select-none"
        />
      ) : isExplorerPlus && goldFrameSrc ? (
        <img
          src={goldFrameSrc}
          alt="Explorer+ Frame"
          fetchPriority={fetchPriority}
          loading={loading}
          className="absolute -top-[12%] -left-[12%] w-[124%] h-[124%] object-contain pointer-events-none z-10 max-w-none select-none"
        />
      ) : null}
    </div>
  )
}

