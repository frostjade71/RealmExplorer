import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBadges, useAdminServers, useAdminUsers, useAssignBadge, useUnassignBadge } from '../hooks/queries'
import type { Badge } from '../types'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { LoadingSpinner } from '../components/FeedbackStates'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { Search, X, Shield, Award, Calendar, Check, Trash2, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

export function AdminBadgesPage() {
  const queryClient = useQueryClient()
  const { data: badges = [], isLoading: badgesLoading } = useBadges()
  const { data: servers = [], isLoading: serversLoading } = useAdminServers()
  const { data: users = [], isLoading: usersLoading } = useAdminUsers()
  
  // Page Tab state
  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog')
  
  // Catalog filters
  const [badgeSearch, setBadgeSearch] = useState('')
  const [badgeTypeFilter, setBadgeTypeFilter] = useState<'all' | 'server' | 'user' | 'automatic'>('all')

  // History filters
  const [historySearch, setHistorySearch] = useState('')
  const [historyTargetFilter, setHistoryTargetFilter] = useState<'all' | 'server' | 'user'>('all')
  const [historyMonthFilter, setHistoryMonthFilter] = useState<string>('all')

  // Assignment Modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [targetSearch, setTargetSearch] = useState('')
  const [targetType, setTargetType] = useState<'server' | 'user'>('server')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date()
    return d.toLocaleString('default', { month: 'long', year: 'numeric' })
  })
  const [isAssigning, setIsAssigning] = useState(false)

  // Unassign Modal state
  const [assignmentToDelete, setAssignmentToDelete] = useState<{ id: string; badgeName: string; recipientName: string } | null>(null)

  const assignBadge = useAssignBadge()
  const unassignBadge = useUnassignBadge()

  // Generate 12 month options for assignment
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      return d.toLocaleString('default', { month: 'long', year: 'numeric' })
    })
  }, [])

  // Fetch currently assigned badges
  const { data: assignedBadges = [], isLoading: assignedLoading } = useQuery({
    queryKey: ['adminAssignedBadges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assigned_badges')
        .select('*, badge:badges(*)')
        .order('granted_at', { ascending: false })
      
      if (error) throw error
      return data as any[]
    }
  })

  // Format badge image URL helper
  const getBadgeImageUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return url.includes('/') ? `/${url}` : `/badges/${url}`
  }

  // Filtered Badges Catalog
  const filteredBadges = useMemo(() => {
    return badges.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(badgeSearch.toLowerCase()) ||
                            (b.description || '').toLowerCase().includes(badgeSearch.toLowerCase())
      
      const matchesType = badgeTypeFilter === 'all'
        ? true
        : badgeTypeFilter === 'automatic'
          ? b.type === 'automatic'
          : b.target_type === badgeTypeFilter && b.type !== 'automatic'

      return matchesSearch && matchesType
    })
  }, [badges, badgeSearch, badgeTypeFilter])

  // Filtered History
  const filteredHistory = useMemo(() => {
    return assignedBadges.filter(ab => {
      const targetName = ab.server_id 
        ? servers.find(s => s.id === ab.server_id)?.name || 'Unknown Server'
        : users.find(u => u.id === ab.user_id)?.discord_username || 'Unknown User'
      
      const badgeName = ab.badge?.name || ''
      const month = ab.month || ''

      const matchesSearch = targetName.toLowerCase().includes(historySearch.toLowerCase()) ||
                            badgeName.toLowerCase().includes(historySearch.toLowerCase()) ||
                            month.toLowerCase().includes(historySearch.toLowerCase())

      const matchesTarget = historyTargetFilter === 'all'
        ? true
        : historyTargetFilter === 'server'
          ? !!ab.server_id
          : !!ab.user_id

      const matchesMonth = historyMonthFilter === 'all' ? true : ab.month === historyMonthFilter

      return matchesSearch && matchesTarget && matchesMonth
    })
  }, [assignedBadges, historySearch, historyTargetFilter, historyMonthFilter, servers, users])

  // Distinct months in history for dropdown
  const availableHistoryMonths = useMemo(() => {
    const months = Array.from(new Set(assignedBadges.map(ab => ab.month).filter(Boolean))) as string[]
    return months.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  }, [assignedBadges])

  // Filtered targets in modal
  const filteredTargets = useMemo(() => {
    if (targetType === 'server') {
      return servers.filter(s => s.name.toLowerCase().includes(targetSearch.toLowerCase()))
    }
    return users.filter(u => (u.discord_username || '').toLowerCase().includes(targetSearch.toLowerCase()))
  }, [targetType, targetSearch, servers, users])

  const openAssignModal = (badge?: Badge) => {
    if (badge) {
      setSelectedBadge(badge)
      setTargetType(badge.target_type)
    } else {
      const firstManual = badges.find(b => b.type === 'manual') || badges[0] || null
      setSelectedBadge(firstManual)
      if (firstManual) setTargetType(firstManual.target_type)
    }
    setTargetSearch('')
    setIsAssignModalOpen(true)
  }

  const handleAssign = async (targetId: string) => {
    if (!selectedBadge) return

    setIsAssigning(true)
    try {
      await assignBadge.mutateAsync({
        badgeId: selectedBadge.id,
        ...(targetType === 'user' ? { userId: targetId } : { serverId: targetId }),
        month: selectedMonth
      })

      // Send notification to recipient
      const recipientId = targetType === 'user' 
        ? targetId 
        : servers.find(s => s.id === targetId)?.owner_id

      if (recipientId) {
        const targetServer = targetType === 'server' ? servers.find(s => s.id === targetId) : null
        const relatedId = targetType === 'user' 
          ? users.find(u => u.id === targetId)?.discord_username 
          : targetServer?.slug

        const typeLabel = targetServer ? (targetServer.type === 'server' ? 'Server' : 'Realm') : ''
        const nameLabel = targetServer ? targetServer.name : ''
        
        const message = targetType === 'user'
          ? `Congratulations! You have been awarded the "${selectedBadge.name}" badge for ${selectedMonth}!`
          : `Congratulations! Your ${typeLabel} ${nameLabel} was awarded the "${selectedBadge.name}" badge for ${selectedMonth}!`

        const { error: notifError } = await supabase.from('notifications').insert({
          user_id: recipientId,
          type: targetType === 'user' ? 'badge_award_user' : 'badge_award_server',
          title: 'New Badge Awarded!',
          message,
          related_id: relatedId || targetId
        } as any)

        if (notifError) {
          console.error('Notification insertion error:', notifError)
          toast.error('Badge assigned, but notification failed to send.')
        }
      }

      toast.success(`Badge "${selectedBadge.name}" awarded successfully!`, {
        description: `Granted for ${selectedMonth}.`
      })
      queryClient.invalidateQueries({ queryKey: ['adminAssignedBadges'] })
      setIsAssignModalOpen(false)
      setSelectedBadge(null)
      setTargetSearch('')
    } catch (error: any) {
      console.error('Badge assignment error:', error)
      toast.error(error.message || 'Failed to assign badge')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleConfirmUnassign = async () => {
    if (!assignmentToDelete) return

    try {
      await unassignBadge.mutateAsync(assignmentToDelete.id)
      toast.success('Badge assignment removed')
      queryClient.invalidateQueries({ queryKey: ['adminAssignedBadges'] })
      setAssignmentToDelete(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove assignment')
    }
  }

  const getTargetDetails = (ab: any) => {
    if (ab.server_id) {
      const s = servers.find(srv => srv.id === ab.server_id)
      return {
        name: s ? s.name : 'Unknown Server',
        sub: s?.slug ? `/server/${s.slug}` : 'Server Listing',
        icon: s?.icon_url || null,
        type: 'server' as const,
        slug: s?.slug
      }
    }
    if (ab.user_id) {
      const u = users.find(usr => usr.id === ab.user_id)
      return {
        name: u ? (u.discord_username || 'Unknown User') : 'Unknown User',
        sub: u?.id ? `ID: ${u.id.substring(0, 8)}...` : 'User Profile',
        icon: u?.discord_avatar || null,
        type: 'user' as const,
        slug: null
      }
    }
    return {
      name: 'Unknown',
      sub: '',
      icon: null,
      type: 'user' as const,
      slug: null
    }
  }

  if (badgesLoading || serversLoading || usersLoading) return <LoadingSpinner />

  const autoBadgesCount = badges.filter(b => b.type === 'automatic').length
  const serverBadgesCount = badges.filter(b => b.target_type === 'server').length
  const userBadgesCount = badges.filter(b => b.target_type === 'user').length

  return (
    <AnimatedPage>
      {/* Header & Quick Stats */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-white/40 text-base">military_tech</span>
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold text-sm">Reward System</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">Badge Management</h1>
          <p className="text-white/40 font-headline text-sm max-w-xl">
            Award and manage prestigious badges for standout servers, creators, and community members.
          </p>
        </FramerIn>
        
        <FramerIn delay={0.1} className="flex flex-wrap items-center gap-4">
          {/* Quick Stat Pill Counter */}
          <div className="flex items-center gap-4 sm:gap-6 bg-white/[0.02] backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl">
            <div className="text-center min-w-[55px]">
              <div className="text-white font-pixel text-lg leading-none mb-1">{badges.length}</div>
              <div className="text-[9px] font-headline text-white/40 uppercase font-bold tracking-widest">Badges</div>
            </div>
            <div className="w-px h-7 bg-white/10" />
            <div className="text-center min-w-[55px]">
              <div className="text-realm-green font-pixel text-lg leading-none mb-1">{assignedBadges.length}</div>
              <div className="text-[9px] font-headline text-white/40 uppercase font-bold tracking-widest">Awarded</div>
            </div>
            <div className="w-px h-7 bg-white/10" />
            <div className="text-center min-w-[55px]">
              <div className="text-blue-400 font-pixel text-lg leading-none mb-1">{autoBadgesCount}</div>
              <div className="text-[9px] font-headline text-white/40 uppercase font-bold tracking-widest">Auto</div>
            </div>
          </div>

          <button
            onClick={() => openAssignModal()}
            className="flex items-center gap-2 px-6 py-4 bg-realm-green text-zinc-950 rounded-xl font-headline font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-base">award_star</span>
            Award Badge
          </button>
        </FramerIn>
      </div>

      {/* Main Navigation Tabs */}
      <FramerIn delay={0.15} className="mb-6 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === 'catalog'
                ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4" />
            Badge Directory
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-white/60">
              {badges.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === 'history'
                ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Award className="w-4 h-4" />
            Award History
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-white/60">
              {assignedBadges.length}
            </span>
          </button>
        </div>
      </FramerIn>

      {/* TAB 1: BADGE CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Catalog Filter Bar */}
          <FramerIn delay={0.2} className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 relative min-w-[220px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Search badges by name or description..."
                value={badgeSearch}
                onChange={(e) => setBadgeSearch(e.target.value)}
                className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl pl-11 pr-10 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-realm-green transition-all outline-none"
              />
              {badgeSearch && (
                <button onClick={() => setBadgeSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white z-10">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1 bg-white/[0.02] backdrop-blur-xl border border-white/10 p-1.5 rounded-xl">
              {[
                { id: 'all', label: 'All', count: badges.length },
                { id: 'server', label: 'Servers', count: serverBadgesCount },
                { id: 'user', label: 'Users', count: userBadgesCount },
                { id: 'automatic', label: 'Auto (OTM)', count: autoBadgesCount },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setBadgeTypeFilter(f.id as any)}
                  className={`px-3.5 py-2 rounded-lg text-[10px] font-headline font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                    badgeTypeFilter === f.id
                      ? 'bg-realm-green text-zinc-950 shadow-md'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f.label}
                  <span className={`text-[9px] px-1 py-0.2 rounded ${badgeTypeFilter === f.id ? 'bg-black/20 text-zinc-950' : 'bg-white/5 text-white/30'}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </FramerIn>

          {/* Badges Grid */}
          <FramerIn delay={0.25}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredBadges.map((badge) => {
                const isAuto = badge.type === 'automatic'
                const isServerTarget = badge.target_type === 'server'

                return (
                  <div
                    key={badge.id}
                    className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-white/20 transition-all group"
                  >
                    <div>
                      {/* Badge Icon & Name */}
                      <div className="flex items-center gap-3.5 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform">
                          <img
                            src={getBadgeImageUrl(badge.image_url)}
                            alt={badge.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-headline font-bold text-white text-sm leading-snug group-hover:text-realm-green transition-colors truncate">
                            {badge.name}
                          </h3>
                          <p className="text-[10px] font-mono text-white/30 truncate mt-0.5">
                            {badge.slug}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mb-4 font-body">
                        {badge.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Card Action */}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                      {isAuto ? (
                        <div className="w-full py-2.5 px-3 rounded-xl bg-white/[0.02] border border-white/5 text-center text-[10px] font-headline uppercase font-bold text-white/30 tracking-widest">
                          Leaderboard Synced
                        </div>
                      ) : (
                        <button
                          onClick={() => openAssignModal(badge)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/[0.03] hover:bg-realm-green hover:text-zinc-950 border border-white/10 hover:border-realm-green text-[10px] font-headline font-bold uppercase tracking-widest text-white/70 transition-all group/btn"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          Award to {isServerTarget ? 'Server' : 'User'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              {filteredBadges.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 border-dashed">
                  <div className="flex flex-col items-center gap-3 text-white/20">
                    <Shield className="w-10 h-10 text-white/20" />
                    <p className="font-headline text-sm italic">No badges matching your filter</p>
                  </div>
                </div>
              )}
            </div>
          </FramerIn>
        </div>
      )}

      {/* TAB 2: AWARD HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* History Filter Bar */}
          <FramerIn delay={0.2} className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 relative min-w-[220px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Search history by recipient, badge name, or month..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl pl-11 pr-10 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-realm-green transition-all outline-none"
              />
              {historySearch && (
                <button onClick={() => setHistorySearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white z-10">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            {/* Target Type Filter */}
            <div className="flex items-center gap-1 bg-white/[0.02] backdrop-blur-xl border border-white/10 p-1.5 rounded-xl">
              {[
                { id: 'all', label: 'All' },
                { id: 'server', label: 'Servers' },
                { id: 'user', label: 'Users' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setHistoryTargetFilter(f.id as any)}
                  className={`px-3.5 py-2 rounded-lg text-[10px] font-headline font-bold uppercase tracking-widest transition-all ${
                    historyTargetFilter === f.id
                      ? 'bg-realm-green text-zinc-950 shadow-md'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Month Filter Dropdown */}
            {availableHistoryMonths.length > 0 && (
              <div className="w-48">
                <select
                  value={historyMonthFilter}
                  onChange={(e) => setHistoryMonthFilter(e.target.value)}
                  className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white font-headline font-bold focus:outline-none focus:border-realm-green transition-all appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-zinc-900 text-white">All Months</option>
                  {availableHistoryMonths.map(m => (
                    <option key={m} value={m} className="bg-zinc-900 text-white">{m}</option>
                  ))}
                </select>
              </div>
            )}
          </FramerIn>

          {/* History Table */}
          <FramerIn delay={0.25} className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-headline text-sm border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/10 text-white/30 uppercase tracking-[0.2em] text-[10px] font-bold">
                    <th className="px-6 py-5">Badge</th>
                    <th className="px-6 py-5">Recipient</th>
                    <th className="px-6 py-5">Target</th>
                    <th className="px-6 py-5">Award Period</th>
                    <th className="px-6 py-5">Awarded Date</th>
                    <th className="px-6 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {assignedLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-white/40">
                        <LoadingSpinner />
                      </td>
                    </tr>
                  ) : filteredHistory.map((ab) => {
                    const recipient = getTargetDetails(ab)
                    const badgeImg = getBadgeImageUrl(ab.badge?.image_url)

                    return (
                      <tr key={ab.id} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Badge */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
                              {badgeImg ? (
                                <img src={badgeImg} alt="" className="w-full h-full object-contain" />
                              ) : (
                                <Award className="w-4 h-4 text-white/40" />
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-white text-xs capitalize block">
                                {(ab.badge?.name || 'Unknown Badge').toLowerCase()}
                              </span>
                              <span className="text-[10px] text-white/30 font-mono">
                                {ab.badge?.slug || ''}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Recipient */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                              {recipient.icon ? (
                                <img src={recipient.icon} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-white/20 text-base">
                                  {recipient.type === 'server' ? 'dns' : 'person'}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              {recipient.type === 'server' && recipient.slug ? (
                                <Link
                                  to={`/server/${recipient.slug}`}
                                  target="_blank"
                                  className="font-bold text-white/80 hover:text-white text-xs transition-colors hover:underline underline-offset-2 flex items-center gap-1 truncate"
                                >
                                  {recipient.name}
                                  <ExternalLink className="w-3 h-3 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                              ) : (
                                <span className="font-bold text-white/80 text-xs truncate block">
                                  {recipient.name}
                                </span>
                              )}
                              <span className="text-[10px] text-white/30 font-mono block">
                                {recipient.sub}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Target Type */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-headline font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            recipient.type === 'server'
                              ? 'bg-sky-500/15 text-sky-400'
                              : 'bg-purple-500/15 text-purple-400'
                          }`}>
                            <span className="material-symbols-outlined text-[11px]">
                              {recipient.type === 'server' ? 'dns' : 'person'}
                            </span>
                            {recipient.type === 'server' ? 'Server' : 'User'}
                          </span>
                        </td>

                        {/* Month / Period */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-[10px] font-headline font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-white/60">
                            <Calendar className="w-3 h-3 text-white/40" />
                            {ab.month || 'N/A'}
                          </span>
                        </td>

                        {/* Awarded Date */}
                        <td className="px-6 py-4 text-white/30 text-[11px] font-mono whitespace-nowrap">
                          {format(new Date(ab.granted_at), 'MMM dd, yyyy')}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setAssignmentToDelete({
                              id: ab.id,
                              badgeName: ab.badge?.name || 'Badge',
                              recipientName: recipient.name
                            })}
                            className="p-2 rounded-lg bg-white/5 text-white/30 hover:bg-red-500 hover:text-white transition-all border border-white/5 hover:border-red-500/20 inline-flex items-center justify-center"
                            title="Remove Badge Assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}

                  {!assignedLoading && filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-white/20 italic text-sm">
                        No badge assignments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </FramerIn>
        </div>
      )}

      {/* AWARD BADGE MODAL */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-zinc-950 border border-white/10 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-realm-green/10 text-realm-green flex items-center justify-center border border-realm-green/20">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-headline font-bold text-white text-lg leading-tight">Award Badge</h2>
                    <p className="text-white/40 text-xs font-headline">Select a badge and choose the recipient.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* 1. Choose Badge */}
                <div className="space-y-2">
                  <label className="text-[10px] font-headline uppercase font-bold text-white/40 tracking-widest block">
                    1. Select Badge
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {badges.filter(b => b.type === 'manual').map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSelectedBadge(b)
                          setTargetType(b.target_type)
                        }}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                          selectedBadge?.id === b.id
                            ? 'bg-realm-green/15 border-realm-green text-white shadow-sm'
                            : 'bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center p-1 shrink-0">
                          <img src={getBadgeImageUrl(b.image_url)} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-headline font-bold capitalize block truncate">{b.name.toLowerCase()}</span>
                          <span className="text-[9px] uppercase font-mono text-white/30">{b.target_type}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Choose Month & Target Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline uppercase font-bold text-white/40 tracking-widest block">
                      2. Award Period
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-headline font-bold text-sm focus:outline-none focus:border-realm-green transition-all appearance-none cursor-pointer"
                    >
                      {monthOptions.map(m => (
                        <option key={m} value={m} className="bg-zinc-900 text-white">{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-headline uppercase font-bold text-white/40 tracking-widest block">
                      Target Type
                    </label>
                    <div className="flex items-center gap-2 h-[46px]">
                      <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-headline text-xs font-bold uppercase tracking-wider w-full justify-center">
                        <span className="material-symbols-outlined text-[16px] text-realm-green">
                          {targetType === 'server' ? 'dns' : 'person'}
                        </span>
                        {targetType === 'server' ? 'Server Recipient' : 'User Recipient'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Search & Select Target */}
                <div className="space-y-2">
                  <label className="text-[10px] font-headline uppercase font-bold text-white/40 tracking-widest block">
                    3. Search {targetType === 'server' ? 'Server' : 'User'}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none z-10" />
                    <input
                      type="text"
                      placeholder={`Type name of ${targetType === 'server' ? 'server' : 'user'}...`}
                      value={targetSearch}
                      onChange={(e) => setTargetSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-realm-green transition-all outline-none"
                    />
                  </div>

                  {/* Target Results List */}
                  <div className="max-h-52 overflow-y-auto space-y-1.5 pt-1 pr-1">
                    {targetSearch.length > 0 ? (
                      filteredTargets.length > 0 ? (
                        filteredTargets.map((target: any) => (
                          <div
                            key={target.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/10 transition-all group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                {targetType === 'server' ? (
                                  target.icon_url ? (
                                    <img src={target.icon_url} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <span className="material-symbols-outlined text-white/30 text-base">dns</span>
                                  )
                                ) : (
                                  target.discord_avatar ? (
                                    <img src={target.discord_avatar} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <span className="material-symbols-outlined text-white/30 text-base">person</span>
                                  )
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-headline font-bold text-white truncate">
                                  {targetType === 'server' ? target.name : target.discord_username}
                                </p>
                                <p className="text-[10px] text-white/30 font-mono truncate">
                                  {targetType === 'server' ? target.slug : target.discord_id || target.id}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAssign(target.id)}
                              disabled={isAssigning}
                              className="px-3.5 py-1.5 rounded-lg bg-realm-green text-zinc-950 font-headline font-bold text-[10px] uppercase tracking-wider hover:scale-105 active:scale-95 transition-all flex items-center gap-1 shrink-0 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Award
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-white/30 text-xs italic">
                          No {targetType}s matching "{targetSearch}"
                        </div>
                      )
                    ) : (
                      <div className="py-8 text-center text-white/30 text-xs italic">
                        Type in the search box above to find a {targetType}.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
                <div className="text-xs text-white/40">
                  Selected: <span className="text-white font-bold">{selectedBadge?.name || 'None'}</span> ({selectedMonth})
                </div>
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION MODAL FOR DELETING ASSIGNMENT */}
      <ConfirmationModal
        isOpen={!!assignmentToDelete}
        onClose={() => setAssignmentToDelete(null)}
        onConfirm={handleConfirmUnassign}
        title="Remove Badge Assignment"
        message={`Are you sure you want to remove the "${assignmentToDelete?.badgeName}" badge from ${assignmentToDelete?.recipientName}? This action cannot be undone.`}
        confirmLabel="Remove Award"
        isDangerous={true}
      />
    </AnimatedPage>
  )
}
