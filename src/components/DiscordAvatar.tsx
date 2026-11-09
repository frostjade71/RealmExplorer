import { useState } from 'react'

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
  decoding,
  loading,
  width,
  height,
  showGoldRingIfExplorerPlus = false,
}: DiscordAvatarProps) {
  const [imgError, setImgError] = useState(false)
  const defaultAvatar = 'https://cdn.discordapp.com/embed/avatars/0.png'
  const displaySrc = imgError || !src ? defaultAvatar : src

  const effectiveAvatarClass = decorationUrl ? 'rounded-full' : avatarClassName

  return (
    <div className={`relative flex-shrink-0 ${sizeClassName} ${className}`}>
      <img
        src={displaySrc}
        alt={alt}
        className={`w-full h-full object-cover ${effectiveAvatarClass} ${
          showGoldRingIfExplorerPlus && isExplorerPlus && decorationUrl ? 'ring-2 ring-[#f2a929]/50' : ''
        }`}
        onError={() => setImgError(true)}
        fetchPriority={fetchPriority}
        decoding={decoding}
        loading={loading}
        width={width}
        height={height}
      />

      {decorationUrl ? (
        <img
          src={decorationUrl}
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

