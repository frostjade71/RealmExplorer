import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { useAuth } from '../contexts/AuthContext'
import { logAction } from '../lib/audit'
import { useResetOTMVotesMutation, useResetOTMCooldownsMutation } from '../hooks/mutations'
import { RotateCcw, Trash2, Clock, AlertTriangle, Type, MonitorPlay } from 'lucide-react'
import { HomepageIntroModal } from '../components/HomepageIntroModal'
import { ShowcaseCardsModal } from '../components/ShowcaseCardsModal'
export function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [loadingOTM, setLoadingOTM] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showOTMConfirm, setShowOTMConfirm] = useState(false)
  const [showOTMCooldownConfirm, setShowOTMCooldownConfirm] = useState(false)
  const [loadingOTMCooldown, setLoadingOTMCooldown] = useState(false)
  const [showIntroModal, setShowIntroModal] = useState(false)
  const [showShowcaseModal, setShowShowcaseModal] = useState(false)
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const resetOTMVotes = useResetOTMVotesMutation()
  const resetOTMCooldowns = useResetOTMCooldownsMutation()

  const handleResetCooldowns = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.rpc('reset_all_cooldowns')
      if (error) throw error
      
      // Invalidate all vote status queries globally
      await queryClient.invalidateQueries({ queryKey: ['voteStatus'] })

      // Log action
      await logAction('COOLDOWNS_RESET', { scope: 'global' }, profile?.id, profile?.discord_username)
      
      toast.success('Cooldowns Reset', {
        description: 'All users can now vote again immediately.'
      })
      setShowConfirmModal(false)
    } catch (err: any) {
      console.error('Reset failed:', err)
      setError(err.message || 'Failed to reset cooldowns.')
      toast.error('Reset Failed', { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleResetOTMVotes = async () => {
    setLoadingOTM(true)
    resetOTMVotes.mutate({ 
      adminId: profile?.id || '', 
      adminName: profile?.discord_username || 'Admin' 
    }, {
      onSuccess: () => {
        toast.success('OTM Votes Reset', {
          description: 'All historical OTM votes have been cleared.'
        })
        setShowOTMConfirm(false)
        setLoadingOTM(false)
      },
      onError: (err: any) => {
        toast.error('Reset Failed', { description: err.message })
        setLoadingOTM(false)
      }
    })
  }

  const handleResetOTMCooldowns = async () => {
    setLoadingOTMCooldown(true)
    resetOTMCooldowns.mutate({ 
      adminId: profile?.id || '', 
      adminName: profile?.discord_username || 'Admin' 
    }, {
      onSuccess: () => {
        toast.success('OTM Cooldowns Reset', {
          description: 'All users can now vote for OTM categories again immediately.'
        })
        setShowOTMCooldownConfirm(false)
        setLoadingOTMCooldown(false)
      },
      onError: (err: any) => {
        toast.error('Reset Failed', { description: err.message })
        setLoadingOTMCooldown(false)
      }
    })
  }

  return (
    <AnimatedPage>
      {/* Header */}
      <div className="mb-8">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-white/40 text-base">settings</span>
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold text-sm">System Maintenance</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">Global Settings</h1>
          <p className="text-white/40 font-headline text-sm max-w-xl">
            Execute global maintenance actions, reset voting cooldowns, or clear category logs.
          </p>
        </FramerIn>
      </div>

      {/* 4 Compact Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl">
        {/* Card 1: Server Vote Cooldowns */}
        <FramerIn delay={0.1}>
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-full hover:border-white/20 transition-all group">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-headline font-bold text-white text-sm leading-tight truncate">
                    Vote Cooldowns
                  </h3>
                  <span className="text-[9px] font-headline text-white/40 uppercase tracking-wider font-bold">
                    Global Reset
                  </span>
                </div>
              </div>
              
              <p className="text-white/40 font-body text-[11px] leading-relaxed mb-4">
                Resets the 24-hour voting timer for all players across all server listings immediately.
              </p>
            </div>

            <div>
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-md font-headline font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all bg-white/[0.03] hover:bg-realm-green hover:text-zinc-950 border border-white/10 hover:border-realm-green text-white/80"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Resetting...' : 'Reset Cooldowns'}
              </button>

              {error && (
                <div className="mt-2 flex items-center gap-1.5 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] font-headline font-bold">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span className="truncate">{error}</span>
                </div>
              )}
            </div>
          </div>
        </FramerIn>

        {/* Card 2: Wipe OTM Votes */}
        <FramerIn delay={0.15}>
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-full hover:border-white/20 transition-all group">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-headline font-bold text-white text-sm leading-tight truncate">
                    OTM Votes
                  </h3>
                  <span className="text-[9px] font-headline text-red-400/70 uppercase tracking-wider font-bold">
                    Historical Wipe
                  </span>
                </div>
              </div>
              
              <p className="text-white/40 font-body text-[11px] leading-relaxed mb-4">
                Permanently wipes all cast OTM category votes. Use when initiating a brand new voting season.
              </p>
            </div>

            <div>
              <button
                onClick={() => setShowOTMConfirm(true)}
                disabled={loadingOTM}
                className="w-full py-2.5 px-4 rounded-md font-headline font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-400"
              >
                <Trash2 className={`w-3.5 h-3.5 ${loadingOTM ? 'animate-spin' : ''}`} />
                {loadingOTM ? 'Wiping Votes...' : 'Reset OTM Votes'}
              </button>
            </div>
          </div>
        </FramerIn>

        {/* Card 3: Reset OTM Cooldowns */}
        <FramerIn delay={0.2}>
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-full hover:border-white/20 transition-all group">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-headline font-bold text-white text-sm leading-tight truncate">
                    OTM Cooldowns
                  </h3>
                  <span className="text-[9px] font-headline text-realm-green uppercase tracking-wider font-bold">
                    Category Lock Reset
                  </span>
                </div>
              </div>
              
              <p className="text-white/40 font-body text-[11px] leading-relaxed mb-4">
                Clears the active 24-hour OTM voting timer for all users while safely preserving existing vote totals.
              </p>
            </div>

            <div>
              <button
                onClick={() => setShowOTMCooldownConfirm(true)}
                disabled={loadingOTMCooldown}
                className="w-full py-2.5 px-4 rounded-md font-headline font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all bg-white/[0.03] hover:bg-realm-green hover:text-zinc-950 border border-white/10 hover:border-realm-green text-white/80"
              >
                <Clock className={`w-3.5 h-3.5 ${loadingOTMCooldown ? 'animate-spin' : ''}`} />
                {loadingOTMCooldown ? 'Resetting...' : 'Reset OTM Cooldowns'}
              </button>
            </div>
          </div>
        </FramerIn>
        {/* Card 4: Homepage Intro */}
        <FramerIn delay={0.25}>
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-full hover:border-white/20 transition-all group">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                  <Type className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-headline font-bold text-white text-sm leading-tight truncate">
                    Homepage Intro
                  </h3>
                  <span className="text-[9px] font-headline text-realm-green uppercase tracking-wider font-bold">
                    Text Editor
                  </span>
                </div>
              </div>
              
              <p className="text-white/40 font-body text-[11px] leading-relaxed mb-4">
                Customize the intro text above "Explore Every Realm" and assign colors to specific words.
              </p>
            </div>

            <div>
              <button
                onClick={() => setShowIntroModal(true)}
                className="w-full py-2.5 px-4 rounded-md font-headline font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all bg-white/[0.03] hover:bg-realm-green hover:text-zinc-950 border border-white/10 hover:border-realm-green text-white/80"
              >
                <Type className="w-3.5 h-3.5" />
                Edit Intro
              </button>
            </div>
          </div>
        </FramerIn>

        {/* Card 5: Showcase Cards */}
        <FramerIn delay={0.3}>
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-full hover:border-white/20 transition-all group">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                  <MonitorPlay className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-headline font-bold text-white text-sm leading-tight truncate">
                    Showcase Cards
                  </h3>
                  <span className="text-[9px] font-headline text-realm-green uppercase tracking-wider font-bold">
                    Homepage Carousel
                  </span>
                </div>
              </div>
              
              <p className="text-white/40 font-body text-[11px] leading-relaxed mb-4">
                Explicitly select up to 6 approved servers to be displayed in the showcase carousel on the homepage.
              </p>
            </div>

            <div>
              <button
                onClick={() => setShowShowcaseModal(true)}
                className="w-full py-2.5 px-4 rounded-md font-headline font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all bg-white/[0.03] hover:bg-realm-green hover:text-zinc-950 border border-white/10 hover:border-realm-green text-white/80"
              >
                <MonitorPlay className="w-3.5 h-3.5" />
                Select Servers
              </button>
            </div>
          </div>
        </FramerIn>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        key={`cooldowns-${showConfirmModal}`}
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleResetCooldowns}
        title="Reset All Cooldowns?"
        message="This will allow every user on the platform to vote again immediately. This action cannot be undone."
        confirmLabel="Reset All"
        isDangerous
        isLoading={loading}
        countdownSeconds={5}
      />

      <ConfirmationModal
        key={`otm-votes-${showOTMConfirm}`}
        isOpen={showOTMConfirm}
        onClose={() => setShowOTMConfirm(false)}
        onConfirm={handleResetOTMVotes}
        title="Reset OTM Votes?"
        message="This will permanently delete every OTM vote cast on the platform. This is irreversible."
        confirmLabel="Reset All Votes"
        isDangerous
        isLoading={loadingOTM}
        countdownSeconds={5}
      />

      <ConfirmationModal
        key={`otm-cooldowns-${showOTMCooldownConfirm}`}
        isOpen={showOTMCooldownConfirm}
        onClose={() => setShowOTMCooldownConfirm(false)}
        onConfirm={handleResetOTMCooldowns}
        title="Reset OTM Cooldowns?"
        message="This will allow all users to vote for OTM categories again immediately. Their previous votes will still be counted."
        confirmLabel="Reset Cooldowns"
        isDangerous
        isLoading={loadingOTMCooldown}
        countdownSeconds={5}
      />

      <HomepageIntroModal 
        isOpen={showIntroModal}
        onClose={() => setShowIntroModal(false)}
      />

      <ShowcaseCardsModal
        isOpen={showShowcaseModal}
        onClose={() => setShowShowcaseModal(false)}
      />
    </AnimatedPage>
  )
}
