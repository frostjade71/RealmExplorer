import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const handleResetCooldowns = async () => {
    if (!confirm('Are you sure you want to reset ALL user cooldowns? This will allow every user to vote again immediately.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.rpc('reset_all_cooldowns')
      if (error) throw error
      
      // Invalidate all vote status queries globally
      await queryClient.invalidateQueries({ queryKey: ['voteStatus'] })
      
      toast.success('Cooldowns Reset', {
        description: 'All users can now vote again immediately.'
      })
    } catch (err: any) {
      console.error('Reset failed:', err)
      setError(err.message || 'Failed to reset cooldowns.')
      toast.error('Reset Failed', { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatedPage>
      <div className="mb-10 flex items-end justify-between">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-realm-green text-sm">settings</span>
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold text-sm">System Settings</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">Global Settings</h1>
          <p className="text-white/40 font-headline text-sm">Modify core platform parameters and manage server cooldowns.</p>
        </FramerIn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FramerIn delay={0.2}>
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-10 shadow-2xl relative overflow-hidden group backdrop-blur-md">
            {/* Background Icon Watermark */}
            <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none">
              <span className="material-symbols-outlined text-[200px] text-white">sync_alt</span>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-realm-green/10 flex items-center justify-center border border-realm-green/20">
                  <span className="material-symbols-outlined text-realm-green">refresh</span>
                </div>
                <div>
                  <h2 className="text-xl font-pixel text-white">Vote Cooldowns</h2>
                  <p className="text-[10px] font-headline text-white/40 uppercase tracking-widest font-bold">Global Reset</p>
                </div>
              </div>
              
              <p className="text-white/40 font-headline text-sm mb-10 leading-relaxed max-w-sm">
                Executing this will reset the 24-hour voting window for <strong className="text-white">all players</strong>. 
                This is usually done for global maintenance or fixing voting issues.
              </p>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResetCooldowns}
                  disabled={loading}
                  className={`w-full py-5 px-8 rounded-2xl font-headline font-bold flex items-center justify-center gap-3 transition-all duration-500 shadow-xl bg-white/5 border border-white/10 text-white hover:bg-realm-green hover:text-zinc-950 hover:border-realm-green`}
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin">sync</span>
                  ) : (
                    <span className="material-symbols-outlined">restart_alt</span>
                  )}
                  {loading ? 'Resetting cooldowns...' : 'Reset All Cooldowns'}
                </motion.button>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-headline font-bold uppercase tracking-wider"
                  >
                    <span className="material-symbols-outlined text-sm">warning</span>
                    {error}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </FramerIn>

        <FramerIn delay={0.3}>
          <div className="bg-white/[0.02] border border-dashed border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center text-center group hover:bg-white/[0.04] transition-colors min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
               <span className="material-symbols-outlined text-white/20 text-3xl">construction</span>
            </div>
            <h3 className="text-white/40 font-pixel text-sm mb-2">More Features Coming</h3>
            <p className="text-white/20 font-headline text-[10px] uppercase font-bold tracking-widest max-w-[200px]">
              New management tools are being regularly added to the dashboard.
            </p>
          </div>
        </FramerIn>
      </div>
    </AnimatedPage>
  )
}

