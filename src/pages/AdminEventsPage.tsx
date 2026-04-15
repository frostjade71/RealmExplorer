import { useState, useMemo } from 'react'
import { useAdminServers, useOTMWinners, useOTMCompetitors, useAdminUsers } from '../hooks/queries'
import { 
  useUpsertOTMWinnerMutation, 
  useAddOTMCompetitorMutation, 
  useDeleteOTMCompetitorMutation,
  useDeleteOTMWinnerMutation,
  useUpdateOTMCompetitorMutation 
} from '../hooks/mutations'
import { LoadingSpinner } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion, AnimatePresence } from 'framer-motion'
import type { OTMCategory, OTMWinner, OTMCompetitor } from '../types'
import { Trophy, Plus, Trash2, Calendar, Edit, X, User } from 'lucide-react'
import { toast } from 'sonner'
import logo from '../assets/rerealm.webp'
import { useAuth } from '../contexts/AuthContext'

const MONTH_OPTIONS = Array.from({ length: 3 }).map((_, i) => {
  const d = new Date()
  d.setMonth(d.getMonth() - i)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const COMPETITOR_MONTH_OPTIONS = [0, 1].map((i) => {
  const d = new Date()
  d.setMonth(d.getMonth() + i)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

export function AdminEventsPage() {
  const { profile } = useAuth()
  const { data: servers = [], isLoading: loadingServers } = useAdminServers()
  const { data: winners = [], isLoading: loadingWinners } = useOTMWinners()
  const { data: competitors = [], isLoading: loadingCompetitors } = useOTMCompetitors()
  const { data: users = [], isLoading: loadingUsers } = useAdminUsers()
  
  const [compFilter, setCompFilter] = useState<OTMCategory | 'all'>('all')

  const upsertWinner = useUpsertOTMWinnerMutation()
  const deleteWinner = useDeleteOTMWinnerMutation()
  const addCompetitor = useAddOTMCompetitorMutation()
  const updateCompetitor = useUpdateOTMCompetitorMutation()
  const deleteCompetitor = useDeleteOTMCompetitorMutation()

  const approvedServers = useMemo(() => servers.filter(s => s.status === 'approved'), [servers])

  // Modals and Editing State
  const [editingWinner, setEditingWinner] = useState<OTMWinner | null>(null)
  const [editingCompetitor, setEditingCompetitor] = useState<OTMCompetitor | null>(null)

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

  // Competitor Form State (Add)
  const [compForm, setCompForm] = useState<{
    month: string
    category: OTMCategory
    server_id: string | null
    user_id: string | null
  }>({
    month: (() => {
      const d = new Date()
      d.setMonth(d.getMonth() - 1)
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    })(),
    category: 'realm' as OTMCategory,
    server_id: '',
    user_id: ''
  })

  const isPersonCategory = (cat: OTMCategory) => cat === 'developer' || cat === 'builder'

  const handleUpsertWinner = (e: React.FormEvent, data: any) => {
    e.preventDefault()
    
    let payload = { ...data }
    
    // If it's a person category and a user is selected, map their details
    if (isPersonCategory(data.category) && data.user_id) {
      const selectedUser = users.find(u => u.id === data.user_id)
      if (selectedUser) {
        payload.winner_name = selectedUser.discord_username
        payload.winner_image_url = selectedUser.discord_avatar
      }
      payload.server_id = null
    } else if (!isPersonCategory(data.category) && data.server_id) {
      payload.winner_name = null
      payload.winner_image_url = null
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

  const handleUpdateCompetitor = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCompetitor) return
    
    const payload = { ...editingCompetitor }
    if (isPersonCategory(payload.category)) {
      payload.server_id = null
    } else {
      payload.user_id = null
    }

    updateCompetitor.mutate(payload, {
      onSuccess: () => {
        setEditingCompetitor(null)
        toast.success('Competitor Updated', {
          description: 'Poll entry details have been modified.'
        })
      },
      onError: (err: any) => {
        toast.error('Update Failed', { description: err.message })
      }
    })
  }

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = { ...compForm }
    if (isPersonCategory(payload.category)) {
      payload.server_id = null
    } else {
      payload.user_id = null
    }

    addCompetitor.mutate({ ...payload, adminId: profile?.id, adminName: profile?.discord_username }, {
      onSuccess: () => {
        toast.success('Competitor Added', {
          description: isPersonCategory(payload.category) ? 'The user has been added to the poll.' : 'The server has been added to the poll.'
        })
        setCompForm({ ...compForm, server_id: '', user_id: '' })
      },
      onError: (err: any) => {
        toast.error('Failed to add competitor', { description: err.message })
      }
    })
  }

  if (loadingServers || loadingWinners || loadingCompetitors || loadingUsers) return <LoadingSpinner />

  return (
    <AnimatedPage>
      <div className="mb-10">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="text-realm-green w-4 h-4" />
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold">Event Management</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">OTM Control Center</h1>
          <p className="text-white/40 font-headline text-sm">Manage "Of The Month" winners and curate the upcoming voting polls.</p>
        </FramerIn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Winners Section */}
        <FramerIn delay={0.1} className="space-y-6">
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green/50 appearance-none selection:bg-realm-green/30"
                  >
                    {MONTH_OPTIONS.map(m => <option key={m} value={m} className="bg-zinc-900 text-white">{m}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                    <select 
                     value={winnerForm.category}
                     onChange={e => setWinnerForm({...winnerForm, category: e.target.value as OTMCategory, server_id: '', user_id: ''})}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green/50 appearance-none"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green/50 appearance-none"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green/50 appearance-none"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green/50 resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={upsertWinner.isPending}
                className="w-full py-3 rounded-xl bg-realm-green text-zinc-950 font-bold font-headline text-sm hover:bg-[#85fc7e] transition-colors disabled:opacity-50"
              >
                {upsertWinner.isPending ? 'Saving...' : 'Set Winner'}
              </button>
            </form>
          </div>

          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
             <div className="px-6 py-4 border-b border-white/5 bg-black/20">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Recent Winners</span>
             </div>
             <div className="divide-y divide-white/[0.03]">
                {winners.map(w => (
                  <div key={w.id} className="px-6 py-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      {isPersonCategory(w.category) ? (
                        <img 
                          src={w.winner_image_url || logo} 
                          alt="Winner" 
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <img 
                          src={w.servers?.icon_url || logo} 
                          alt="Winner" 
                          className="w-10 h-10 rounded-lg object-cover border border-white/10"
                        />
                      )}
                      <div>
                        <div className="text-white font-bold text-sm">{w.winner_name || w.servers?.name}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest">{w.month} • {w.category}</div>
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

        {/* Competitors Section */}
        <FramerIn delay={0.2} className="space-y-6">
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-pixel text-white mb-6 flex items-center gap-3">
              <Plus className="w-5 h-5 text-realm-green" />
              Add Curated Competitors
            </h2>

            <form onSubmit={handleAddCompetitor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 ml-1">Event Month</label>
                   <select 
                    value={compForm.month}
                    onChange={e => setCompForm({...compForm, month: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green/50 appearance-none"
                   >
                     {COMPETITOR_MONTH_OPTIONS.map(m => <option key={m} value={m} className="bg-zinc-900 text-white">{m}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                   <select 
                    value={compForm.category}
                    onChange={e => setCompForm({...compForm, category: e.target.value as OTMCategory, server_id: '', user_id: ''})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green/50 appearance-none"
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
                   {isPersonCategory(compForm.category) ? 'Select User' : 'Select Server'}
                </label>
                {isPersonCategory(compForm.category) ? (
                   <select 
                    value={compForm.user_id ?? ''}
                    required
                    onChange={e => setCompForm({...compForm, user_id: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green/50 appearance-none"
                  >
                    <option value="" className="bg-zinc-900 text-white">Select a user...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id} className="bg-zinc-900 text-white">{u.discord_username || u.id}</option>
                    ))}
                  </select>
                ) : (
                  <select 
                    value={compForm.server_id ?? ''}
                    required
                    onChange={e => setCompForm({...compForm, server_id: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green/50 appearance-none"
                  >
                    <option value="" className="bg-zinc-900 text-white">Select an approved server...</option>
                    {approvedServers.map(s => (
                      <option key={s.id} value={s.id} className="bg-zinc-900 text-white">{s.name}</option>
                    ))}
                  </select>
                )}
              </div>


              <button 
                type="submit"
                disabled={addCompetitor.isPending}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold font-headline text-sm hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {addCompetitor.isPending ? 'Adding...' : 'Add to Curated List'}
              </button>
            </form>
          </div>

          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
             <div className="px-6 py-4 border-b border-white/5 bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Competitors</span>
                  <span className="text-[9px] font-bold text-realm-green/60 uppercase tracking-widest mt-0.5">{competitors.length} Total Records</span>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {(['all', 'realm', 'server', 'developer', 'builder'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setCompFilter(f)}
                      className={`px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                        compFilter === f 
                          ? 'bg-realm-green text-zinc-950 shadow-[0_0_15px_rgba(78,196,78,0.3)]' 
                          : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
             </div>
             <div className="divide-y divide-white/[0.03]">
                {competitors
                  .filter(c => compFilter === 'all' || c.category === compFilter)
                  .map(c => (
                  <div key={c.id} className="px-6 py-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      {isPersonCategory(c.category) ? (
                        <div className="flex items-center gap-4">
                           <img 
                            src={c.profiles?.discord_avatar || logo} 
                            alt="Comp" 
                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                          />
                          <div>
                            <div className="text-white font-bold text-sm">{c.profiles?.discord_username || 'Unknown Specialist'}</div>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest leading-none mt-0.5 flex items-center gap-1">
                               <User className="w-2.5 h-2.5" />
                               {c.category} • {c.month || 'Current Cycle'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <img 
                            src={c.servers?.icon_url || logo} 
                            alt="Comp" 
                            className="w-10 h-10 rounded-lg object-cover border border-white/10"
                          />
                          <div>
                            <div className="text-white font-bold text-sm">{c.servers?.name}</div>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest">
                              {c.month || 'Current Cycle'} • {c.category.charAt(0).toUpperCase() + c.category.slice(1)} OTM
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingCompetitor(c)}
                        className="p-2 text-white hover:text-realm-green transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Remove this competitor?')) {
                            deleteCompetitor.mutate(c.id, {
                              onSuccess: () => toast.success('Competitor Removed'),
                              onError: (err: any) => toast.error('Removal Failed', { description: err.message })
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
                {competitors.length === 0 && (
                  <div className="px-6 py-8 text-center text-white/20 italic text-sm">No curated competitors found.</div>
                )}
             </div>
          </div>
        </FramerIn>
      </div>

      {/* Edit Winner Modal */}
      <AnimatePresence>
        {editingWinner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <h2 className="font-pixel text-white text-lg">Edit Winner</h2>
                <button onClick={() => setEditingWinner(null)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={(e) => handleUpsertWinner(e, editingWinner)} className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl mb-4">
                    <div className="flex-1">
                      <label className="block text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Month</label>
                      <div className="text-white text-sm font-headline font-bold">{editingWinner.month}</div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Category</label>
                      <div className="text-realm-green text-sm font-pixel">{editingWinner.category.charAt(0).toUpperCase() + editingWinner.category.slice(1)}</div>
                    </div>
                  </div>
                 
                 <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none"
                 />
                 <button 
                  type="submit" 
                  disabled={upsertWinner.isPending}
                  className="w-full py-4 rounded-xl bg-realm-green text-zinc-950 font-bold hover:bg-[#85fc7e] transition-colors"
                 >
                   {upsertWinner.isPending ? 'Updating...' : 'Save Changes'}
                 </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Competitor Modal */}
      <AnimatePresence>
        {editingCompetitor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <h2 className="font-pixel text-white text-lg">Edit Competitor</h2>
                <button onClick={() => setEditingCompetitor(null)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateCompetitor} className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl mb-4">
                    <div className="flex-1">
                      <label className="block text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Cycle</label>
                      <div className="text-white text-sm font-headline font-bold">{editingCompetitor.month || 'Current Cycle'}</div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Category</label>
                      <div className="text-realm-green text-sm font-pixel">{editingCompetitor.category.charAt(0).toUpperCase() + editingCompetitor.category.slice(1)}</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                    <p className="text-zinc-500 text-xs font-headline uppercase tracking-widest">
                      Linked {isPersonCategory(editingCompetitor.category) ? 'User' : 'Server'}
                    </p>
                    <p className="text-white font-pixel mt-1">
                      {isPersonCategory(editingCompetitor.category) 
                        ? (editingCompetitor.profiles?.discord_username || 'Selected User') 
                        : (editingCompetitor.servers?.name || 'Selected Server')}
                    </p>
                 </div>

                 <button 
                  type="submit" 
                  disabled={updateCompetitor.isPending}
                  className="w-full py-4 rounded-xl bg-realm-green text-zinc-950 font-bold hover:bg-[#85fc7e] transition-colors"
                 >
                   {updateCompetitor.isPending ? 'Updating...' : 'Save Changes'}
                 </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  )
}
