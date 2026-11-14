import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signInWithDiscord: (redirectToPath?: string) => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
  isModerator: boolean
  isExplorerPlus: boolean
  hasPremiumPerks: boolean
  refreshProfile: () => Promise<void>
  syncDiscord: () => Promise<boolean>
  shuffleCooldown: number
  startShuffleCooldown: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [shuffleCooldown, setShuffleCooldown] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    const until = localStorage.getItem('shuffle_cooldown_until')
    if (!until) return 0
    const remaining = Math.ceil((parseInt(until, 10) - Date.now()) / 1000)
    if (remaining <= 0) {
      try {
        localStorage.removeItem('shuffle_cooldown_until')
      } catch {}
      return 0
    }
    return remaining
  })

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

  const refreshProfile = async () => {
    const userId = session?.user?.id
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      if (data) {
        setProfile(data as unknown as Profile)
      }
    } catch (e) {
      console.error('Manual profile refresh failed:', e)
    }
  }

  const syncDiscord = async (): Promise<boolean> => {
    const userId = session?.user?.id
    if (!userId) return false
    try {
      const { syncDiscordProfile } = await import('../lib/discord')
      const result = await syncDiscordProfile({
        userId,
        discordId: profile?.discord_id || undefined,
        providerToken: (session as any)?.provider_token,
      })
      if (result?.success) {
        await refreshProfile()
        return true
      }
      return false
    } catch (e) {
      console.error('Failed to sync discord profile:', e)
      return false
    }
  }

  async function signInWithDiscord(redirectToPath?: string) {
    // Determine the base site URL for redirects. Use env var if set (for production),
    // otherwise fallback to current origin (useful for local dev and preview deployments).
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin
    
    if (redirectToPath) {
      localStorage.setItem('authRedirectPath', redirectToPath)
    }

    const redirectTo = `${siteUrl}/auth/callback`

    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo,
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

  // Shuffle Cooldown Logic (persists across page reloads via expiration timestamp)
  useEffect(() => {
    if (shuffleCooldown <= 0) return

    const updateCooldown = () => {
      const until = localStorage.getItem('shuffle_cooldown_until')
      if (!until) {
        setShuffleCooldown(0)
        return
      }
      const remaining = Math.max(0, Math.ceil((parseInt(until, 10) - Date.now()) / 1000))
      if (remaining <= 0) {
        try { localStorage.removeItem('shuffle_cooldown_until') } catch {}
        setShuffleCooldown(0)
      } else {
        setShuffleCooldown(prev => prev !== remaining ? remaining : prev)
      }
    }

    const timer = setInterval(updateCooldown, 500)
    return () => clearInterval(timer)
  }, [shuffleCooldown > 0])

  const startShuffleCooldown = () => {
    const hasPremium = profile?.role === 'explorer+' || profile?.role === 'admin'
    const durationSeconds = hasPremium ? 2 : 6
    const expiresAt = Date.now() + durationSeconds * 1000
    try {
      localStorage.setItem('shuffle_cooldown_until', expiresAt.toString())
    } catch {}
    setShuffleCooldown(durationSeconds)
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
      isModerator: profile?.role === 'moderator' || profile?.role === 'admin',
      isExplorerPlus: profile?.role === 'explorer+',
      hasPremiumPerks: profile?.role === 'explorer+' || profile?.role === 'admin',
      refreshProfile,
      syncDiscord,
      shuffleCooldown,
      startShuffleCooldown
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
