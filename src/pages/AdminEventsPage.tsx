import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useAdminServers, useOTMWinners, useAdminUsers, useOTMSettings } from '../hooks/queries'
import { 
  useUpsertOTMWinnerMutation, 
  useDeleteOTMWinnerMutation,
  useUpdateOTMSettingsMutation
} from '../hooks/mutations'
import { LoadingSpinner } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion, AnimatePresence } from 'framer-motion'
import type { OTMCategory, OTMWinner, OTMConfig } from '../types'
import { Trophy, Calendar, Edit, X, Power, Timer, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
// logo imported from public/logoRE.png as /logoRE.png
import { useAuth } from '../contexts/AuthContext'

const MONTH_OPTIONS = Array.from({ length: 3 }).map((_, i) => {
  const d = new Date()
  d.setMonth(d.getMonth() - i)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

export function AdminEventsPage() {
  const { profile } = useAuth()
  const { data: servers = [], isLoading: loadingServers } = useAdminServers()
  const { data: winners = [], isLoading: loadingWinners } = useOTMWinners()
  const { data: settings, isLoading: loadingSettings } = useOTMSettings()
  const { data: users = [], isLoading: loadingUsers } = useAdminUsers()
  
  const upsertWinner = useUpsertOTMWinnerMutation()
  const deleteWinner = useDeleteOTMWinnerMutation()
  const updateSettings = useUpdateOTMSettingsMutation()

  const approvedServers = useMemo(() => servers.filter(s => s.status === 'approved'), [servers])

  // Modals and Editing State
  const [editingWinner, setEditingWinner] = useState<OTMWinner | null>(null)
  const [schedulingCategory, setSchedulingCategory] = useState<OTMCategory | null>(null)
  const [schedulingEndCategory, setSchedulingEndCategory] = useState<OTMCategory | null>(null)
  const [nextStartTime, setNextStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  // Winner Form State (Add)
  const [winnerForm, setWinnerForm] = useState<{
    month: string
    category: OTMCategory
    server_id: string | null
    user_id: string | null
    description: string
  }>({
    month: (() => {
      const d = new Date()
      d.setMonth(d.getMonth() - 1)
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    })(),
    category: 'realm' as OTMCategory,
    server_id: '',
    user_id: '',
    description: ''
  })

  const isPersonCategory = (cat: OTMCategory) => cat === 'developer' || cat === 'builder'

  const handleUpsertWinner = (e: React.FormEvent, data: any) => {
    e.preventDefault()
    
    let payload = { ...data }
    
    if (isPersonCategory(data.category) && data.user_id) {
      const selectedUser = users.find(u => u.id === data.user_id)
      if (selectedUser) {
        payload.winner_name = selectedUser.discord_username
        payload.winner_image_url = selectedUser.discord_avatar
        payload.winner_slug = selectedUser.discord_username
      }
      payload.server_id = null
    } else if (!isPersonCategory(data.category) && data.server_id) {
      const selectedServer = approvedServers.find(s => s.id === data.server_id)
      if (selectedServer) {
        payload.winner_name = selectedServer.name
        payload.winner_image_url = selectedServer.icon_url
        payload.winner_banner_url = selectedServer.banner_url
        payload.winner_slug = selectedServer.slug
      }
      payload.user_id = null
    }

    upsertWinner.mutate({ ...payload, adminId: profile?.id, adminName: profile?.discord_username }, {
      onSuccess: () => {
        setEditingWinner(null)
        toast.success('Winner Recorded', {
          description: `Successfully updated the OTM winner for ${data.month}.`
        })
      },
      onError: (err: any) => {
        toast.error('Failed to set winner', { description: err.message })
      }
    })
  }

  const handleToggleCompetition = (category: OTMCategory) => {
    if (!settings) return

    const currentStatus = settings.competition_status[category]
    
    if (currentStatus) {
      // Turning OFF - show scheduler
      setSchedulingCategory(category)
      setNextStartTime('')
    } else {
      // Turning ON - reset start time and enable
      const newConfig: OTMConfig = {
        ...settings,
        competition_status: { ...settings.competition_status, [category]: true },
        next_start_times: { ...settings.next_start_times, [category]: null }
      }
      updateSettings.mutate(newConfig, {
        onSuccess: () => toast.success(`${category.toUpperCase()} OTM Enabled`)
      })
    }
  }

  const handleScheduleConfirm = () => {
    if (!schedulingCategory || !settings) return

    const newConfig: OTMConfig = {
      ...settings,
      competition_status: { ...settings.competition_status, [schedulingCategory]: false },
      next_start_times: { ...settings.next_start_times, [schedulingCategory]: nextStartTime || null }
    }

    updateSettings.mutate(newConfig, {
      onSuccess: () => {
        toast.success(`${schedulingCategory.toUpperCase()} OTM Disabled`, {
          description: nextStartTime ? `Next session scheduled for ${new Date(nextStartTime).toLocaleString()}` : 'No restart date set.'
        })
        setSchedulingCategory(null)
      }
    })
  }
  
  const handleSetEndTimeConfirm = () => {
    if (!schedulingEndCategory || !settings) return

    const newConfig: OTMConfig = {
      ...settings,
      end_times: { ...settings.end_times, [schedulingEndCategory]: endTime || null }
    }

    updateSettings.mutate(newConfig, {
      onSuccess: () => {
        toast.success(`${schedulingEndCategory.toUpperCase()} End Date Updated`, {
          description: endTime ? `Competition will end on ${new Date(endTime).toLocaleString()}` : 'End date cleared.'
        })
        setSchedulingEndCategory(null)
      }
    })
  }

  if (loadingServers || loadingWinners || loadingSettings || loadingUsers) return <LoadingSpinner />

  return (
    <AnimatedPage>
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="text-realm-green w-4 h-4" />
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold text-sm">Event Management</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">OTM Control Center</h1>
          <p className="text-white/40 font-headline text-sm max-w-xl">Manage "Of The Month" winners and control competition visibility.</p>
        </FramerIn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* OTM Panel - NEW Section */}
        <FramerIn delay={0.1} className="space-y-6">
          <div className="bg-zinc-900/60 border border-white/5 rounded-lg p-6 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none">
              <Power className="w-40 h-40 text-white" />
            </div>
            
            <h2 className="text-xl font-pixel text-white mb-6 flex items-center gap-3 relative z-10">
              <Power className="w-5 h-5 text-realm-green" />
              OTM Panel
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {(['realm', 'server', 'developer', 'builder'] as OTMCategory[]).map((cat) => {
                const isActive = settings?.competition_status[cat]
                return (
                  <div key={cat} className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between group/item hover:border-realm-green/30 transition-all">
                    <div>
                      <h3 className="text-[10px] font-pixel text-white uppercase tracking-widest leading-none mb-1">{cat} of the month</h3>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-realm-green' : 'bg-zinc-600'}`} />
                        <span className={`text-[9px] font-headline font-bold uppercase tracking-widest ${isActive ? 'text-realm-green' : 'text-zinc-500'}`}>
                          {isActive ? 'ACTIVE' : 'OFFLINE'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 transition-all">
                      {isActive && (
                        <button
                          onClick={() => {
                            setSchedulingEndCategory(cat)
                            setEndTime(settings?.end_times?.[cat] || '')
                          }}
                          className={`p-2.5 rounded-lg border transition-all ${
                            settings?.end_times?.[cat] 
                            ? 'bg-realm-green border-realm-green text-zinc-950' 
                            : 'bg-white/5 border-white/10 text-white/40 hover:text-realm-green hover:border-realm-green/30'
                          }`}
                          title="Set End Date"
                        >
                          <Timer className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleCompetition(cat)}
                        className={`p-2.5 rounded-lg border transition-all ${
                          isActive 
                          ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' 
                          : 'bg-realm-green/10 border-realm-green/20 text-realm-green hover:bg-realm-green hover:text-zinc-950'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-white/5 rounded-lg p-6">
            <h2 className="text-xl font-pixel text-white mb-6 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-realm-green" />
              Set Monthly Winners
            </h2>
            
            <form onSubmit={(e) => handleUpsertWinner(e, winnerForm)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 ml-1">Month</label>
                  <select 
                    value={winnerForm.month}
                    onChange={e => setWinnerForm({...winnerForm, month: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green/50 appearance-none selection:bg-realm-green/30"
                  >
                    {MONTH_OPTIONS.map(m => <option key={m} value={m} className="bg-zinc-900 text-white">{m}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                    <select 
                     value={winnerForm.category}
                     onChange={e => setWinnerForm({...winnerForm, category: e.target.value as OTMCategory, server_id: '', user_id: ''})}
                     className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green/50 appearance-none"
                    >
                      <option value="realm" className="bg-zinc-900 text-white">Realm</option>
                      <option value="server" className="bg-zinc-900 text-white">Server</option>
                      <option value="developer" className="bg-zinc-900 text-white">Developer</option>
                      <option value="builder" className="bg-zinc-900 text-white">Builder</option>
                    </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 ml-1">
                  {isPersonCategory(winnerForm.category) ? 'Select User' : 'Linked Server'}
                </label>
                {isPersonCategory(winnerForm.category) ? (
                  <select 
                    value={winnerForm.user_id ?? ''}
                    required
                    onChange={e => setWinnerForm({...winnerForm, user_id: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green/50 appearance-none"
                  >
                    <option value="" className="bg-zinc-900 text-white">Select a user...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id} className="bg-zinc-900 text-white">{u.discord_username || u.id}</option>
                    ))}
                  </select>
                ) : (
                  <select 
                    value={winnerForm.server_id ?? ''}
                    required
                    onChange={e => setWinnerForm({...winnerForm, server_id: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green/50 appearance-none"
                  >
                    <option value="" className="bg-zinc-900 text-white">Select an approved server...</option>
                    {approvedServers.map(s => (
                      <option key={s.id} value={s.id} className="bg-zinc-900 text-white">{s.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <textarea 
                  placeholder="Winner Description (Optional)"
                  value={winnerForm.description}
                  onChange={e => setWinnerForm({...winnerForm, description: e.target.value})}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green/50 resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={upsertWinner.isPending}
                className="w-full py-3 rounded-lg bg-realm-green text-zinc-950 font-bold font-headline text-sm hover:bg-[#85fc7e] transition-colors disabled:opacity-50"
              >
                {upsertWinner.isPending ? 'Saving...' : 'Set Winner'}
              </button>
            </form>
          </div>
        </FramerIn>

        {/* Winners List Section */}
        <FramerIn delay={0.2} className="space-y-6">
          <div className="bg-zinc-900/60 border border-white/5 rounded-lg overflow-hidden h-full">
             <div className="px-6 py-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Historical Winners</span>
                <span className="text-[9px] font-pixel text-realm-green/60 uppercase tracking-widest">{winners.length} Total</span>
             </div>
             <div className="divide-y divide-white/[0.03] max-h-[700px] overflow-y-auto custom-scrollbar">
                {winners.map(w => (
                  <div key={w.id} className="px-6 py-4 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      {isPersonCategory(w.category) ? (
                        <img 
                          src={w.winner_image_url || "/logoRE.png"} 
                          alt="Winner" 
                          className="w-10 h-10 rounded-lg object-cover border border-white/10"
                        />
                      ) : (
                        <img 
                          src={w.servers?.icon_url || "/logoRE.png"} 
                          alt="Winner" 
                          className="w-10 h-10 rounded-lg object-cover border border-white/10"
                        />
                      )}
                      <div>
                        <div className="text-white font-bold text-sm leading-none mb-1">{w.winner_name || w.servers?.name}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-2">
                           <span className="text-realm-green/60">[{w.category}]</span> 
                           <span>{w.month}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingWinner(w)}
                        className="p-2 text-white hover:text-realm-green transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Delete this winner record?')) {
                            deleteWinner.mutate(w.id, {
                              onSuccess: () => toast.success('Winner Deleted'),
                              onError: (err: any) => toast.error('Delete Failed', { description: err.message })
                            })
                          }
                        }}
                        className="p-2 text-white hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {winners.length === 0 && (
                  <div className="px-6 py-8 text-center text-white/20 italic text-sm">No winners recorded.</div>
                )}
             </div>
          </div>
        </FramerIn>
      </div>

      {createPortal(
        <>
          {/* Competition End Date Modal */}
          <AnimatePresence>
            {schedulingEndCategory && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90">
                 <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-zinc-950 border border-white/10 w-full max-w-md rounded-lg shadow-2xl overflow-hidden p-8"
                >
                  <div className="flex flex-col items-center text-center">
                     <div className="w-16 h-16 rounded-lg bg-realm-green/10 flex items-center justify-center mb-6">
                        <Timer className="w-8 h-8 text-realm-green" />
                     </div>
                     <h2 className="text-xl font-pixel text-white mb-2 uppercase">Competition End Timer</h2>
                     <p className="text-zinc-500 font-headline text-xs mb-8 leading-relaxed">
                       Set a date for the current {schedulingEndCategory} OTM competition to end. This will show a live countdown to the voters.
                     </p>
      
                     <div className="w-full space-y-4 mb-8">
                        <div className="text-left">
                           <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 ml-1">Competition End Date</label>
                           <input 
                            type="datetime-local" 
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-6 py-4 text-white text-sm focus:outline-none focus:border-realm-green appearance-none color-scheme-dark"
                           />
                           <p className="mt-2 text-[9px] text-zinc-600 font-headline italic">Leaving this empty will remove the countdown timer from the public page.</p>
                        </div>
                     </div>
      
                     <div className="grid grid-cols-2 gap-3 w-full">
                        <button 
                          onClick={() => setSchedulingEndCategory(null)}
                          className="py-4 rounded-lg bg-white/5 border border-white/10 text-white font-headline font-bold text-sm hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSetEndTimeConfirm}
                          disabled={updateSettings.isPending}
                          className="py-4 rounded-lg bg-realm-green text-zinc-950 font-headline font-bold text-sm transition-all disabled:opacity-50"
                        >
                          {updateSettings.isPending ? 'Saving...' : 'Set End Date'}
                        </button>
                     </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Scheduler Modal */}
          <AnimatePresence>
            {schedulingCategory && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90">
                 <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-zinc-950 border border-white/10 w-full max-w-md rounded-lg shadow-2xl overflow-hidden p-8"
                >
                  <div className="flex flex-col items-center text-center">
                     <div className="w-16 h-16 rounded-lg bg-red-500/10 flex items-center justify-center mb-6">
                        <Timer className="w-8 h-8 text-red-500" />
                     </div>
                     <h2 className="text-xl font-pixel text-white mb-2 uppercase">Disable {schedulingCategory} OTM</h2>
                     <p className="text-zinc-500 font-headline text-xs mb-8 leading-relaxed">
                       Turning off this competition will hide participants from the public page. Set a date below to show a countdown timer to the community.
                     </p>
    
                     <div className="w-full space-y-4 mb-8">
                        <div className="text-left">
                           <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 ml-1">Next Competition Start</label>
                           <input 
                            type="datetime-local" 
                            value={nextStartTime}
                            onChange={e => setNextStartTime(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-6 py-4 text-white text-sm focus:outline-none focus:border-realm-green appearance-none color-scheme-dark"
                           />
                           <p className="mt-2 text-[9px] text-zinc-600 font-headline italic">Leaving this empty will show a "Starting Soon" status without a timer.</p>
                        </div>
                     </div>
    
                     <div className="grid grid-cols-2 gap-3 w-full">
                        <button 
                          onClick={() => setSchedulingCategory(null)}
                          className="py-4 rounded-lg bg-white/5 border border-white/10 text-white font-headline font-bold text-sm hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleScheduleConfirm}
                          disabled={updateSettings.isPending}
                          className="py-4 rounded-lg bg-realm-green text-zinc-950 font-headline font-bold text-sm transition-all disabled:opacity-50"
                        >
                          {updateSettings.isPending ? 'Saving...' : 'Confirm Disable'}
                        </button>
                     </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Edit Winner Modal */}
          <AnimatePresence>
            {editingWinner && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-lg shadow-2xl overflow-hidden"
                >
                  <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <h2 className="font-pixel text-white text-lg">Edit Winner</h2>
                    <button onClick={() => setEditingWinner(null)} className="text-zinc-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={(e) => handleUpsertWinner(e, editingWinner)} className="p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4 px-4 py-3 bg-white/5 border border-white/10 rounded-lg mb-4">
                        <div className="flex-1">
                          <label className="block text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Month</label>
                          <div className="text-white text-sm font-headline font-bold">{editingWinner.month}</div>
                        </div>
                        <div className="flex-1">
                          <label className="block text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Category</label>
                          <div className="text-realm-green text-sm font-pixel">{editingWinner.category.charAt(0).toUpperCase() + editingWinner.category.slice(1)}</div>
                        </div>
                      </div>
                     
                     <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-center">
                        <p className="text-zinc-500 text-xs font-headline uppercase tracking-widest">
                          Linked {isPersonCategory(editingWinner.category) ? 'User' : 'Server'}
                        </p>
                        <p className="text-white font-pixel mt-1">
                          {isPersonCategory(editingWinner.category) ? editingWinner.winner_name : editingWinner.servers?.name}
                        </p>
                     </div>
    
                     <textarea 
                        placeholder="Description"
                        value={editingWinner.description || ''}
                        onChange={e => setEditingWinner({...editingWinner, description: e.target.value})}
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none resize-none"
                     />
                     <button 
                      type="submit" 
                      disabled={upsertWinner.isPending}
                      className="w-full py-4 rounded-lg bg-realm-green text-zinc-950 font-bold hover:bg-[#85fc7e] transition-colors"
                     >
                       {upsertWinner.isPending ? 'Updating...' : 'Save Changes'}
                     </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>,
        document.getElementById('modal-root')!
      )}
    </AnimatedPage>
  )
}
