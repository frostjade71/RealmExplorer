import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { useAuth } from '../contexts/AuthContext'
import { logAction } from '../lib/audit'
import { useResetOTMVotesMutation, useResetOTMCooldownsMutation } from '../hooks/mutations'

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [loadingOTM, setLoadingOTM] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showOTMConfirm, setShowOTMConfirm] = useState(false)
  const [showOTMCooldownConfirm, setShowOTMCooldownConfirm] = useState(false)
  const [loadingOTMCooldown, setLoadingOTMCooldown] = useState(false)
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
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-realm-green text-sm">settings</span>
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold text-sm">System Settings</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">Global Settings</h1>
          <p className="text-white/40 font-headline text-sm max-w-xl">Modify core platform parameters and manage server cooldowns.</p>
        </FramerIn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FramerIn delay={0.2}>
          <div className="bg-zinc-900/60 border border-white/5 rounded-lg p-6 relative overflow-hidden group">
            {/* Background Icon Watermark */}
            <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none">
              <span className="material-symbols-outlined text-[120px] text-white">sync_alt</span>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-realm-green/10 flex items-center justify-center border border-realm-green/20">
                  <span className="material-symbols-outlined text-realm-green">refresh</span>
                </div>
                <div>
                  <h2 className="text-lg font-pixel text-white">Vote Cooldowns</h2>
                  <p className="text-[10px] font-headline text-white/40 uppercase tracking-widest font-bold">Global Reset</p>
                </div>
              </div>
              
              <p className="text-white/40 font-headline text-xs mb-6 leading-relaxed max-w-sm">
                Executing this will reset the 24-hour voting window for <strong className="text-white">all players</strong>. 
                This is usually done for global maintenance or fixing voting issues.
              </p>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirmModal(true)}
                  disabled={loading}
                  className={`w-full py-3 px-6 rounded-lg font-headline font-bold flex items-center justify-center gap-2 transition-all duration-500 bg-white/5 border border-white/10 text-white text-xs hover:bg-realm-green hover:text-zinc-950 hover:border-realm-green`}
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">restart_alt</span>
                  )}
                  {loading ? 'Resetting cooldowns...' : 'Reset All Cooldowns'}
                </motion.button>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-headline font-bold uppercase tracking-wider"
                  >
                    <span className="material-symbols-outlined text-sm">warning</span>
                    {error}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </FramerIn>

        <FramerIn delay={0.25}>
          <div className="bg-zinc-900/60 border border-white/5 rounded-lg p-6 relative overflow-hidden group h-full">
            <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none text-red-500">
              <span className="material-symbols-outlined text-[120px]">delete_forever</span>
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <span className="material-symbols-outlined text-red-500">cleaning_services</span>
                </div>
                <div>
                  <h2 className="text-lg font-pixel text-white">OTM Votes</h2>
                  <p className="text-[10px] font-headline text-red-500/60 uppercase tracking-widest font-bold">Historical Wipe</p>
                </div>
              </div>
              
              <p className="text-white/40 font-headline text-xs mb-6 leading-relaxed flex-grow">
                This will <strong className="text-red-400">permanently delete</strong> every OTM vote ever cast. Use this only when starting a new major cycle or clearing test data.
              </p>

              <button
                onClick={() => setShowOTMConfirm(true)}
                disabled={loadingOTM}
                className="w-full py-3 px-6 rounded-lg font-headline font-bold flex items-center justify-center gap-2 transition-all duration-500 bg-red-500/10 border border-red-500/20 text-red-500 text-xs hover:bg-red-500 hover:text-white"
              >
                {loadingOTM ? (
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">delete_sweep</span>
                )}
                {loadingOTM ? 'Clearing Votes...' : 'Reset OTM Votes'}
              </button>
            </div>
          </div>
        </FramerIn>

        <FramerIn delay={0.3}>
          <div className="bg-zinc-900/60 border border-white/5 rounded-lg p-6 relative overflow-hidden group h-full">
            <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none text-realm-green">
              <span className="material-symbols-outlined text-[120px]">timer_off</span>
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-realm-green/10 flex items-center justify-center border border-realm-green/20">
                  <span className="material-symbols-outlined text-realm-green">history_toggle_off</span>
                </div>
                <div>
                  <h2 className="text-lg font-pixel text-white">OTM Cooldowns</h2>
                  <p className="text-[10px] font-headline text-realm-green uppercase tracking-widest font-bold">Category Lock Reset</p>
                </div>
              </div>
              
              <p className="text-white/40 font-headline text-xs mb-6 leading-relaxed flex-grow">
                This will reset the 24-hour OTM voting window for <strong className="text-white">all players</strong> without deleting their previous votes.
              </p>

              <button
                onClick={() => setShowOTMCooldownConfirm(true)}
                disabled={loadingOTMCooldown}
                className="w-full py-3 px-6 rounded-lg font-headline font-bold flex items-center justify-center gap-2 transition-all duration-500 bg-white/5 border border-white/10 text-white text-xs hover:bg-realm-green hover:text-zinc-950"
              >
                {loadingOTMCooldown ? (
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">timer_10_alt_1</span>
                )}
                {loadingOTMCooldown ? 'Resetting...' : 'Reset OTM Cooldowns'}
              </button>
            </div>
          </div>
        </FramerIn>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleResetCooldowns}
        title="Reset All Cooldowns?"
        message="This will allow every user on the platform to vote again immediately. This action cannot be undone."
        confirmLabel="Reset All"
        isDangerous
        isLoading={loading}
      />

      <ConfirmationModal
        isOpen={showOTMConfirm}
        onClose={() => setShowOTMConfirm(false)}
        onConfirm={handleResetOTMVotes}
        title="Reset OTM Votes?"
        message="This will permanently delete every OTM vote cast on the platform. This is irreversible."
        confirmLabel="Reset All Votes"
        isDangerous
        isLoading={loadingOTM}
      />

      <ConfirmationModal
        isOpen={showOTMCooldownConfirm}
        onClose={() => setShowOTMCooldownConfirm(false)}
        onConfirm={handleResetOTMCooldowns}
        title="Reset OTM Cooldowns?"
        message="This will allow all users to vote for OTM categories again immediately. Their previous votes will still be counted."
        confirmLabel="Reset Cooldowns"
        isDangerous
        isLoading={loadingOTMCooldown}
      />
    </AnimatedPage>
  )
}

