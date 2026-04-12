import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signInWithDiscord: () => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
  isModerator: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Effect 1: Listen for auth state changes — ONLY set session synchronously.
  // NEVER call supabase.from() inside this callback. It runs within Supabase's
  // internal navigator lock, and PostgREST needs that same lock to attach the
  // auth header — causing a deadlock on page refresh.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)

      // fire-and-forget session sync
      if (!session) {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Effect 2: When the user ID changes (login, logout, refresh), fetch profile.
  // This runs OUTSIDE the onAuthStateChange lock, so supabase.from() works fine.
  useEffect(() => {
    const userId = session?.user?.id

    if (!userId) {
      // No user — clear profile and mark as done loading
      setProfile(null)
      setLoading(false)
      return
    }

    let cancelled = false

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          console.error('Profile fetch error:', error.message)
        }

        if (!cancelled && data) {
          setProfile(data as unknown as Profile)
        }
      } catch (e) {
        console.error('Profile fetch failed:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProfile()

    return () => { cancelled = true }
  }, [session?.user?.id])

  async function signInWithDiscord() {
    // Determine the base site URL for redirects. Use env var if set (for production),
    // otherwise fallback to current origin (useful for local dev and preview deployments).
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin
    
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
        scopes: 'identify',
        queryParams: {
          scope: 'identify',
          prompt: 'consent'
        }
      }
    })
  }

  async function signOut() {
    // Save ref before clearing
    const currentProfile = profile

    // Clear UI immediately so user sees logged-out state
    setProfile(null)
    setSession(null)

    // Sign out from Supabase (clears localStorage token)
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Sign out error:', e)
    }

    // Fire-and-forget logout audit log
    if (currentProfile) {
      import('../lib/audit').then(({ logAction }) => {
        logAction('LOGOUT', {}, currentProfile.id, currentProfile.discord_username).catch(() => {})
      }).catch(() => {})
    }
  }

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signInWithDiscord,
      signOut,
      isAdmin: profile?.role === 'admin',
      isModerator: profile?.role === 'moderator' || profile?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
