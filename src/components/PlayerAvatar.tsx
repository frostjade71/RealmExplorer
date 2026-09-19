import { useState, useEffect } from 'react'

const avatarCache = new Map<string, string>()

interface PlayerAvatarProps {
  username: string
  className?: string
  alt?: string
}

export function PlayerAvatar({ username, className = "", alt = "Minecraft Head" }: PlayerAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState(`https://minotar.net/helm/MHF_Steve/100.png`)

  useEffect(() => {
    const fetchAvatar = async () => {
      const cleanName = username.trim()
      if (!cleanName) {
        setAvatarUrl('https://minotar.net/helm/MHF_Steve/100.png')
        return
      }

      if (avatarCache.has(cleanName)) {
        setAvatarUrl(avatarCache.get(cleanName)!)
        return
      }

      let isBedrock = false
      let rawName = cleanName
      let preFetchedXuid: string | null = null

      if (/^[._*-]/.test(cleanName)) {
        isBedrock = true
        rawName = cleanName.substring(1)
      } 
      else if (!/^[a-zA-Z0-9_]{3,16}$/.test(cleanName)) {
        isBedrock = true
      } 
      else {
        try {
          const [javaRes, xuidRes] = await Promise.allSettled([
            fetch(`https://api.ashcon.app/mojang/v2/user/${cleanName}`),
            fetch(`https://api.geysermc.org/v2/xbox/xuid/${cleanName}`)
          ])
          
          if (javaRes.status === 'fulfilled' && !javaRes.value.ok) {
            isBedrock = true
            
            if (xuidRes.status === 'fulfilled' && xuidRes.value.ok) {
               const xuidData = await xuidRes.value.json()
               if (xuidData.xuid) {
                 preFetchedXuid = xuidData.xuid
               }
            }
          }
        } catch (e) {
        }
      }

      if (isBedrock) {
        try {
          let xuid = preFetchedXuid
          
          if (!xuid) {
            const xuidRes = await fetch(`https://api.geysermc.org/v2/xbox/xuid/${rawName}`)
            if (xuidRes.ok) {
              const xuidData = await xuidRes.json()
              xuid = xuidData.xuid
            }
          }

          if (xuid) {
            const hex = BigInt(xuid).toString(16).padStart(16, '0')
            const floodgateUuid = `00000000-0000-0000-${hex.substring(0, 4)}-${hex.substring(4)}`
            
            const bedrockUrl = `https://mc-heads.net/avatar/${floodgateUuid}/100.png`
            avatarCache.set(cleanName, bedrockUrl)
            setAvatarUrl(bedrockUrl)
            return
          }
        } catch (e) {
          console.error('Failed to fetch Bedrock avatar for', cleanName, e)
        }
      }
      
      const javaUrl = `https://minotar.net/helm/${cleanName}/100.png`
      avatarCache.set(cleanName, javaUrl)
      setAvatarUrl(javaUrl)
    }

    fetchAvatar()
  }, [username])

  return (
    <img 
      src={avatarUrl} 
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.src = 'https://minotar.net/helm/MHF_Steve/100.png'
      }}
    />
  )
}
