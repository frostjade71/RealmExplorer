import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
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
      navigate('/', { replace: true })
    }
    
    handleCallback()
  }, [navigate])

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white">
      <div className="text-xl">Authenticating...</div>
    </div>
  )
}
