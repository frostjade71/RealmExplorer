import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import discordLoader from '../assets/icon_gif/450144-discord.gif'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const hasRun = useRef(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error logging in:', error.message)
      } else if (session?.user) {
        // Log successful login once here on the callback
        import('../lib/audit').then(({ logAction }) => {
          logAction('LOGIN', { method: 'oauth' }, session.user.id, null).catch(() => {})
        }).catch(() => {})
      }
      const storedNext = localStorage.getItem('authRedirectPath')
      const queryNext = new URLSearchParams(window.location.search).get('next')
      const next = storedNext || queryNext || '/dashboard'
      
      if (storedNext) {
        localStorage.removeItem('authRedirectPath')
      }
      
      setTimeout(() => {
        setIsFadingOut(true)
        setTimeout(() => {
          navigate(next, { replace: true })
        }, 500)
      }, 1200)
    }
    
    handleCallback()
  }, [navigate])

  return (
    <div className={`flex flex-col h-screen w-screen items-center justify-center bg-zinc-950 text-white gap-4 transition-opacity duration-500 ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
      <img src={discordLoader} alt="Loading..." className="w-12 h-12 md:w-20 md:h-20 object-contain" />
      <p className="text-zinc-400 font-headline text-sm md:text-xl animate-pulse tracking-wide">
        Logging in with Discord...
      </p>
    </div>
  )
}

