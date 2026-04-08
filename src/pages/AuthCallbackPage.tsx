import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession()
      if (error) console.error('Error logging in:', error.message)
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
