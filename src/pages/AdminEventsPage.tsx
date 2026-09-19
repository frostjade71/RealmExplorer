import { useState, useMemo } from 'react'
import { useAdminServers, useOTMWinners, useAdminUsers, useOTMSettings } from '../hooks/queries'
import { 
  useUpsertOTMWinnerMutation, 
  useDeleteOTMWinnerMutation,
  useUpdateOTMSettingsMutation
} from '../hooks/mutations'
import { LoadingSpinner } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { motion, AnimatePresence } from 'framer-motion'
import type { OTMCategory, OTMWinner, OTMConfig } from '../types'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { 
  Trophy, 
  Calendar, 
  Timer, 
  Power, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  X, 
  Server as ServerIcon, 
  Code2, 
  Hammer, 
  Globe,
  Clock,
  ExternalLink
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

const MONTH_OPTIONS = Array.from({ length: 12 }).map((_, i) => {
  const d = new Date()
  d.setMonth(d.getMonth() - i)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const CATEGORY_META: Record<OTMCategory, { label: string; icon: any; color: string; desc: string }> = {
  realm: {
    label: 'Realm of the Month',
    icon: Globe,
    color: 'text-white/60 bg-white/5 border-white/10',
    desc: 'Community Realms competition'
  },
  server: {
    label: 'Server of the Month',
    icon: ServerIcon,
    color: 'text-white/60 bg-white/5 border-white/10',
    desc: 'Dedicated Java & Bedrock servers'
  },
  developer: {
    label: 'Developer of the Month',
    icon: Code2,
    color: 'text-white/60 bg-white/5 border-white/10',
    desc: 'Add-on, mod & plugin creators'
  },
  builder: {
    label: 'Builder of the Month',
    icon: Hammer,
    color: 'text-white/60 bg-white/5 border-white/10',
    desc: 'World, map & structure architects'
  }
}

export function AdminEventsPage() {
  const { profile } = useAuth()
  const { data: servers = [], isLoading: loadingServers } = useAdminServers()
  const { data: winners = [], isLoading: loadingWinners } = useOTMWinners()
  const { data: settings, isLoading: loadingSettings } = useOTMSettings()
  const { data: users = [], isLoading: loadingUsers } = useAdminUsers()
  
  const upsertWinner = useUpsertOTMWinnerMutation()
  const deleteWinner = useDeleteOTMWinnerMutation()
  const updateSettings = useUpdateOTMSettingsMutation()

  // Navigation Tab
  const [activeTab, setActiveTab] = useState<'controls' | 'winners'>('controls')

  // History / Winners Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | OTMCategory>('all')
  const [monthFilter, setMonthFilter] = useState<string>('all')

  // Modal States
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [editingWinner, setEditingWinner] = useState<OTMWinner | null>(null)
  const [winnerToDelete, setWinnerToDelete] = useState<{ id: string; name: string; month: string; category: string } | null>(null)
  
  // Timer & Schedule States
  const [schedulingCategory, setSchedulingCategory] = useState<OTMCategory | null>(null)
  const [schedulingEndCategory, setSchedulingEndCategory] = useState<OTMCategory | null>(null)
  const [nextStartTime, setNextStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  // Winner Form State
  const [winnerForm, setWinnerForm] = useState<{
    month: string
    category: OTMCategory
    server_id: string
    user_id: string
    description: string
  }>({
    month: MONTH_OPTIONS[0],
    category: 'realm',
    server_id: '',
    user_id: '',
    description: ''
  })

  const approvedServers = useMemo(() => servers.filter(s => s.status === 'approved'), [servers])
  const isPersonCategory = (cat: OTMCategory) => cat === 'developer' || cat === 'builder'

  // Distinct months in winners history
  const availableMonths = useMemo(() => {
    const months = Array.from(new Set(winners.map(w => w.month).filter(Boolean))) as string[]
    return months.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  }, [winners])

  // Filtered Winners List
  const filteredWinners = useMemo(() => {
    return winners.filter(w => {
      const targetName = (w.winner_name || w.servers?.name || '').toLowerCase()
      const desc = (w.description || '').toLowerCase()
      const q = searchQuery.toLowerCase()
      
      const matchesSearch = targetName.includes(q) || desc.includes(q) || (w.month || '').toLowerCase().includes(q)
      const matchesCat = categoryFilter === 'all' ? true : w.category === categoryFilter
      const matchesMonth = monthFilter === 'all' ? true : w.month === monthFilter

      return matchesSearch && matchesCat && matchesMonth
    })
  }, [winners, searchQuery, categoryFilter, monthFilter])

  // Active competitions count
  const activeCompetitionsCount = useMemo(() => {
    if (!settings?.competition_status) return 0
    return Object.values(settings.competition_status).filter(Boolean).length
  }, [settings])

  const openRecordModal = (presetCategory?: OTMCategory) => {
    setWinnerForm({
      month: MONTH_OPTIONS[0],
      category: presetCategory || 'realm',
      server_id: '',
      user_id: '',
      description: ''
    })
    setIsRecordModalOpen(true)
  }

  const handleUpsertWinner = (e: React.FormEvent, isEditing = false) => {
    e.preventDefault()
    
    const formData = isEditing && editingWinner ? editingWinner : winnerForm
    let payload: any = { ...formData }
    
    if (isPersonCategory(formData.category) && formData.user_id) {
      const selectedUser = users.find(u => u.id === formData.user_id)
      if (selectedUser) {
        payload.winner_name = selectedUser.discord_username
        payload.winner_image_url = selectedUser.discord_avatar
        payload.winner_slug = selectedUser.discord_username
      }
      payload.server_id = null
    } else if (!isPersonCategory(formData.category) && formData.server_id) {
      const selectedServer = approvedServers.find(s => s.id === formData.server_id)
      if (selectedServer) {
        payload.winner_name = selectedServer.name
        payload.winner_image_url = selectedServer.icon_url
        payload.winner_banner_url = selectedServer.banner_url
        payload.winner_slug = selectedServer.slug
      }
      payload.user_id = null
    }

    upsertWinner.mutate(
      { ...payload, adminId: profile?.id, adminName: profile?.discord_username },
      {
        onSuccess: () => {
          setIsRecordModalOpen(false)
          setEditingWinner(null)
          toast.success(isEditing ? 'Winner Updated' : 'Winner Recorded', {
            description: `Successfully saved ${formData.category.toUpperCase()} winner for ${formData.month}.`
          })
        },
        onError: (err: any) => {
          toast.error('Failed to save winner', { description: err.message })
        }
      }
    )
  }

  const handleToggleCompetition = (category: OTMCategory) => {
    if (!settings) return

    const currentStatus = settings.competition_status[category]
    
    if (currentStatus) {
      // Turning OFF - prompt for next start schedule
      setSchedulingCategory(category)
      setNextStartTime(settings.next_start_times?.[category] || '')
    } else {
      // Turning ON - enable immediately
      const newConfig: OTMConfig = {
        ...settings,
        competition_status: { ...settings.competition_status, [category]: true },
        next_start_times: { ...settings.next_start_times, [category]: null }
      }
      updateSettings.mutate(newConfig, {
        onSuccess: () => toast.success(`${category.toUpperCase()} OTM Activated`)
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
        toast.success(`${schedulingCategory.toUpperCase()} OTM Deactivated`, {
          description: nextStartTime ? `Next start scheduled for ${new Date(nextStartTime).toLocaleString()}` : 'No restart timer set.'
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
        toast.success(`${schedulingEndCategory.toUpperCase()} End Date Saved`, {
          description: endTime ? `Countdown ends on ${new Date(endTime).toLocaleString()}` : 'End countdown cleared.'
        })
        setSchedulingEndCategory(null)
      }
    })
  }

  const handleConfirmDelete = () => {
    if (!winnerToDelete) return
    deleteWinner.mutate(winnerToDelete.id, {
      onSuccess: () => {
        toast.success('Winner Deleted')
        setWinnerToDelete(null)
      },
      onError: (err: any) => toast.error('Delete Failed', { description: err.message })
    })
  }

  if (loadingServers || loadingWinners || loadingSettings || loadingUsers) return <LoadingSpinner />

  return (
    <AnimatedPage>
      {/* Header & Quick Stats */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-white/40 text-base">military_tech</span>
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold text-sm">Event Management</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">OTM Control Center</h1>
          <p className="text-white/40 font-headline text-sm max-w-xl">
            Control live competition statuses, countdown timers, and manage official monthly winners.
          </p>
        </FramerIn>

        <FramerIn delay={0.1} className="flex flex-wrap items-center gap-4">
          {/* Status Counter */}
          <div className="flex items-center gap-4 sm:gap-6 bg-white/[0.02] backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl">
            <div className="text-center min-w-[55px]">
              <div className="text-realm-green font-pixel text-lg leading-none mb-1">
                {activeCompetitionsCount}
              </div>
              <div className="text-[9px] font-headline text-white/40 uppercase font-bold tracking-widest">Active OTM</div>
            </div>
            <div className="w-px h-7 bg-white/10" />
            <div className="text-center min-w-[55px]">
              <div className="text-white font-pixel text-lg leading-none mb-1">{winners.length}</div>
              <div className="text-[9px] font-headline text-white/40 uppercase font-bold tracking-widest">Winners</div>
            </div>
          </div>

          <button
            onClick={() => openRecordModal()}
            className="flex items-center gap-2 px-6 py-4 bg-realm-green text-zinc-950 rounded-xl font-headline font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Record Winner
          </button>
        </FramerIn>
      </div>

      {/* Tabs */}
      <FramerIn delay={0.15} className="mb-6 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('controls')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === 'controls'
                ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Power className="w-4 h-4" />
            Live Competitions & Timers
          </button>

          <button
            onClick={() => setActiveTab('winners')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === 'winners'
                ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Monthly Winners Directory
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-white/60">
              {winners.length}
            </span>
          </button>
        </div>
      </FramerIn>

      {/* TAB 1: COMPETITION CONTROLS */}
      {activeTab === 'controls' && (
        <FramerIn delay={0.2} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['realm', 'server', 'developer', 'builder'] as OTMCategory[]).map((cat) => {
              const meta = CATEGORY_META[cat]
              const Icon = meta.icon
              const isActive = settings?.competition_status[cat] ?? false
              const currentEndTime = settings?.end_times?.[cat]
              const currentNextStart = settings?.next_start_times?.[cat]

              return (
                <div
                  key={cat}
                  className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-white/20 transition-all group relative overflow-hidden"
                >
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-white/5 border-white/10 text-white/70 shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-headline font-bold text-white text-sm capitalize leading-tight truncate">
                            {meta.label}
                          </h3>
                          <p className="text-[11px] text-white/40 font-body mt-0.5 truncate">
                            {meta.desc}
                          </p>
                        </div>
                      </div>

                      {/* Status Indicator */}
                      <div 
                        title={isActive ? 'Competition Active' : 'Competition Disabled'} 
                        className="p-1 rounded-full shrink-0 flex items-center justify-center"
                      >
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-realm-green shadow-sm shadow-realm-green/50 animate-pulse' : 'bg-zinc-600'}`} />
                      </div>
                    </div>

                    {/* Schedule & Timer Info */}
                    <div className="my-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-white/40 font-headline uppercase text-[9px] tracking-wider flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          End Timer:
                        </span>
                        <span className="font-mono text-white/80 font-bold text-[11px] truncate ml-1">
                          {currentEndTime ? format(new Date(currentEndTime), 'MMM dd · HH:mm') : 'None'}
                        </span>
                      </div>

                      {!isActive && (
                        <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                          <span className="text-white/40 font-headline uppercase text-[9px] tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Next Start:
                          </span>
                          <span className="font-mono text-amber-400 font-bold text-[11px] truncate ml-1">
                            {currentNextStart ? format(new Date(currentNextStart), 'MMM dd · HH:mm') : 'Soon'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-white/5 flex items-center gap-2 relative z-10">
                    <button
                      onClick={() => {
                        setSchedulingEndCategory(cat)
                        setEndTime(settings?.end_times?.[cat] || '')
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white/80 font-headline font-bold text-[10px] uppercase tracking-wider transition-all"
                      title="Set End Timer"
                    >
                      <Timer className="w-3.5 h-3.5 text-realm-green" />
                      Timer
                    </button>

                    <button
                      onClick={() => handleToggleCompetition(cat)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md font-headline font-bold text-[10px] uppercase tracking-wider transition-all shadow-sm ${
                        isActive
                          ? 'bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30'
                          : 'bg-realm-green text-zinc-950 hover:bg-[#85fc7e] border border-realm-green'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {isActive ? 'Pause' : 'Start'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </FramerIn>
      )}

      {/* TAB 2: WINNERS DIRECTORY */}
      {activeTab === 'winners' && (
        <div className="space-y-6">
          {/* Winners Filter Bar */}
          <FramerIn delay={0.2} className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 relative min-w-[220px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Search winners by name, description, or month..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl pl-11 pr-10 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-realm-green transition-all outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white z-10">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-1 bg-white/[0.02] backdrop-blur-xl border border-white/10 p-1.5 rounded-xl">
              {[
                { id: 'all', label: 'All' },
                { id: 'realm', label: 'Realms' },
                { id: 'server', label: 'Servers' },
                { id: 'developer', label: 'Developers' },
                { id: 'builder', label: 'Builders' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setCategoryFilter(f.id as any)}
                  className={`px-3.5 py-2 rounded-lg text-[10px] font-headline font-bold uppercase tracking-widest transition-all ${
                    categoryFilter === f.id
                      ? 'bg-realm-green text-zinc-950 shadow-md'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Month Filter */}
            {availableMonths.length > 0 && (
              <div className="w-48">
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white font-headline font-bold focus:outline-none focus:border-realm-green transition-all appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-zinc-900 text-white">All Months</option>
                  {availableMonths.map(m => (
                    <option key={m} value={m} className="bg-zinc-900 text-white">{m}</option>
                  ))}
                </select>
              </div>
            )}
          </FramerIn>

          {/* Winners Table */}
          <FramerIn delay={0.25} className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-headline text-sm border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/10 text-white/30 uppercase tracking-[0.2em] text-[10px] font-bold">
                    <th className="px-6 py-5">Winner</th>
                    <th className="px-6 py-5">Category</th>
                    <th className="px-6 py-5">Month</th>
                    <th className="px-6 py-5">Description</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filteredWinners.map((w: any) => {
                    const isPerson = isPersonCategory(w.category)
                    const image = isPerson ? (w.winner_image_url || "/logoRE.png") : (w.servers?.icon_url || w.winner_image_url || "/logoRE.png")
                    const name = w.winner_name || w.servers?.name || 'Unknown'
                    const slug = w.winner_slug || w.servers?.slug

                    return (
                      <tr key={w.id} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Winner */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                              <img src={image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              {!isPerson && slug ? (
                                <Link
                                  to={`/server/${slug}`}
                                  target="_blank"
                                  className="font-bold text-white text-sm hover:text-realm-green transition-colors flex items-center gap-1.5 truncate"
                                >
                                  {name}
                                  <ExternalLink className="w-3 h-3 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                              ) : (
                                <span className="font-bold text-white text-sm truncate block">
                                  {name}
                                </span>
                              )}
                              <span className="text-[10px] text-white/30 font-mono block">
                                {isPerson ? 'Creator' : 'Server Listing'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-headline font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                            CATEGORY_META[w.category as OTMCategory]?.color || 'bg-white/10 text-white'
                          }`}>
                            {w.category}
                          </span>
                        </td>

                        {/* Month */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-[10px] font-headline font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/5 text-white/70">
                            <Calendar className="w-3 h-3 text-white/40" />
                            {w.month}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="px-6 py-4 text-xs text-white/50 max-w-xs truncate font-body">
                          {w.description || <span className="italic text-white/20">No description</span>}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingWinner(w)}
                              className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                              title="Edit Winner"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setWinnerToDelete({
                                id: w.id,
                                name,
                                month: w.month,
                                category: w.category
                              })}
                              className="p-2 rounded-lg bg-white/5 text-white/30 hover:bg-red-500 hover:text-white transition-all"
                              title="Delete Winner"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {filteredWinners.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-white/20 italic text-sm">
                        No recorded winners found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </FramerIn>
        </div>
      )}

      {/* MODAL: RECORD NEW WINNER */}
      <AnimatePresence>
        {isRecordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRecordModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-zinc-950 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-realm-green/10 text-realm-green flex items-center justify-center border border-realm-green/20">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-pixel text-white text-lg leading-tight uppercase">Record OTM Winner</h2>
                    <p className="text-white/40 text-xs font-headline">Select competition details and crown the winner.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRecordModalOpen(false)}
                  className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => handleUpsertWinner(e, false)} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                      Award Month
                    </label>
                    <select
                      value={winnerForm.month}
                      onChange={e => setWinnerForm({ ...winnerForm, month: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green transition-all appearance-none cursor-pointer"
                    >
                      {MONTH_OPTIONS.map(m => (
                        <option key={m} value={m} className="bg-zinc-900 text-white">{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                      Category
                    </label>
                    <select
                      value={winnerForm.category}
                      onChange={e => setWinnerForm({
                        ...winnerForm, 
                        category: e.target.value as OTMCategory, 
                        server_id: '', 
                        user_id: '' 
                      })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green transition-all appearance-none cursor-pointer capitalize"
                    >
                      <option value="realm" className="bg-zinc-900 text-white">Realm</option>
                      <option value="server" className="bg-zinc-900 text-white">Server</option>
                      <option value="developer" className="bg-zinc-900 text-white">Developer</option>
                      <option value="builder" className="bg-zinc-900 text-white">Builder</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                    {isPersonCategory(winnerForm.category) ? 'Select User (Discord)' : 'Select Approved Server'}
                  </label>
                  {isPersonCategory(winnerForm.category) ? (
                    <select
                      value={winnerForm.user_id}
                      required
                      onChange={e => setWinnerForm({ ...winnerForm, user_id: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-zinc-900 text-white">Choose a user...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id} className="bg-zinc-900 text-white">{u.discord_username || u.id}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={winnerForm.server_id}
                      required
                      onChange={e => setWinnerForm({ ...winnerForm, server_id: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-zinc-900 text-white">Choose an approved server...</option>
                      {approvedServers.map(s => (
                        <option key={s.id} value={s.id} className="bg-zinc-900 text-white">{s.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                    Winner Description (Optional)
                  </label>
                  <textarea
                    placeholder="Short victory note or achievement description..."
                    value={winnerForm.description}
                    onChange={e => setWinnerForm({ ...winnerForm, description: e.target.value })}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green transition-all resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRecordModalOpen(false)}
                    className="px-5 py-3 rounded-xl text-xs font-headline font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={upsertWinner.isPending}
                    className="px-6 py-3 rounded-xl bg-realm-green text-zinc-950 font-headline font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50"
                  >
                    {upsertWinner.isPending ? 'Saving...' : 'Confirm Winner'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT WINNER */}
      <AnimatePresence>
        {editingWinner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingWinner(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-zinc-950 border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <h2 className="font-pixel text-white text-lg uppercase">Edit Winner Details</h2>
                <button onClick={() => setEditingWinner(null)} className="text-white/40 hover:text-white p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => handleUpsertWinner(e, true)} className="p-6 space-y-4">
                <div className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex-1">
                    <span className="block text-[8px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Month</span>
                    <span className="text-white text-sm font-headline font-bold">{editingWinner.month}</span>
                  </div>
                  <div className="flex-1">
                    <span className="block text-[8px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Category</span>
                    <span className="text-realm-green text-sm font-headline font-bold uppercase">{editingWinner.category}</span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                  <span className="text-xs text-white/40 font-headline uppercase tracking-widest block mb-1">
                    Awarded Recipient
                  </span>
                  <p className="text-white font-headline font-bold text-base">
                    {isPersonCategory(editingWinner.category) ? editingWinner.winner_name : (editingWinner.servers?.name || editingWinner.winner_name)}
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Victory description..."
                    value={editingWinner.description || ''}
                    onChange={e => setEditingWinner({ ...editingWinner, description: e.target.value })}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green transition-all resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingWinner(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-headline font-bold uppercase tracking-widest text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={upsertWinner.isPending}
                    className="px-6 py-2.5 rounded-xl bg-realm-green text-zinc-950 font-headline font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    {upsertWinner.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: SET COMPETITION END DATE */}
      <AnimatePresence>
        {schedulingEndCategory && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-realm-green/10 text-realm-green flex items-center justify-center border border-realm-green/20">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-pixel text-white text-lg uppercase leading-tight">Competition End Timer</h2>
                  <p className="text-white/40 text-xs font-headline capitalize">{schedulingEndCategory} OTM Countdown</p>
                </div>
              </div>

              <p className="text-white/50 text-xs leading-relaxed mb-6 font-body">
                Set a date and time for the current {schedulingEndCategory} competition to conclude. A live countdown will be displayed to voters on the standings page.
              </p>

              <div className="space-y-2 mb-6">
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  End Date & Time
                </label>
                <input 
                  type="datetime-local" 
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green transition-all"
                />
                <p className="text-[10px] text-white/30 italic">Clear date to remove the live countdown.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setSchedulingEndCategory(null)}
                  className="py-3 rounded-xl bg-white/5 border border-white/10 text-white font-headline font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSetEndTimeConfirm}
                  disabled={updateSettings.isPending}
                  className="py-3 rounded-xl bg-realm-green text-zinc-950 font-headline font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {updateSettings.isPending ? 'Saving...' : 'Set End Timer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: DEACTIVATE & SCHEDULE NEXT START */}
      <AnimatePresence>
        {schedulingCategory && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-pixel text-white text-lg uppercase leading-tight">Deactivate {schedulingCategory} OTM</h2>
                  <p className="text-white/40 text-xs font-headline">Turn off live voting for this category</p>
                </div>
              </div>

              <p className="text-white/50 text-xs leading-relaxed mb-6 font-body">
                Deactivating hides the competition from public voting. Optionally schedule the next session start time to show a countdown to the community.
              </p>

              <div className="space-y-2 mb-6">
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Next Start Date (Optional)
                </label>
                <input 
                  type="datetime-local" 
                  value={nextStartTime}
                  onChange={e => setNextStartTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green transition-all"
                />
                <p className="text-[10px] text-white/30 italic">Leave empty to show "Starting Soon" status.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setSchedulingCategory(null)}
                  className="py-3 rounded-xl bg-white/5 border border-white/10 text-white font-headline font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleScheduleConfirm}
                  disabled={updateSettings.isPending}
                  className="py-3 rounded-xl bg-red-500 text-white font-headline font-bold text-xs uppercase tracking-wider hover:bg-red-600 transition-all disabled:opacity-50 shadow-md"
                >
                  {updateSettings.isPending ? 'Saving...' : 'Confirm Disable'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION MODAL: DELETE WINNER */}
      <ConfirmationModal
        isOpen={!!winnerToDelete}
        onClose={() => setWinnerToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Winner Record"
        message={`Are you sure you want to delete the ${winnerToDelete?.category.toUpperCase()} winner "${winnerToDelete?.name}" for ${winnerToDelete?.month}? This action cannot be undone.`}
        confirmLabel="Delete Winner"
        isDangerous={true}
      />
    </AnimatedPage>
  )
}
