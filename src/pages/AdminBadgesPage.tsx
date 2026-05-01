import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBadges, useAdminServers, useAdminUsers, useAssignBadge, useUnassignBadge } from '../hooks/queries'
import type { Badge } from '../types'
import { Search, Shield, User, Server as ServerIcon, Plus, Trash2, Check, Award, Info } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export function AdminBadgesPage() {
  const queryClient = useQueryClient()
  const { data: badges = [] } = useBadges()
  const { data: servers = [] } = useAdminServers()
  const { data: users = [] } = useAdminUsers()
  
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [targetType, setTargetType] = useState<'server' | 'user'>('server')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date()
    return d.toLocaleString('default', { month: 'long', year: 'numeric' })
  })
  const [isAssigning, setIsAssigning] = useState(false)

  const assignBadge = useAssignBadge()
  const unassignBadge = useUnassignBadge()

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return d.toLocaleString('default', { month: 'long', year: 'numeric' })
  })

  // Fetch currently assigned badges (manual only)
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

  const filteredTargets = targetType === 'server' 
    ? servers.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : users.filter(u => (u.discord_username || '').toLowerCase().includes(searchQuery.toLowerCase()))

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
      } else {
        console.warn('No recipient ID found for notification. TargetType:', targetType, 'TargetID:', targetId)
      }

      toast.success(`Badge "${selectedBadge.name}" assigned successfully for ${selectedMonth}!`)
      queryClient.invalidateQueries({ queryKey: ['adminAssignedBadges'] })
      setSelectedBadge(null)
      setSearchQuery('')
    } catch (error: any) {
      console.error('Badge assignment error:', error)
      toast.error(error.message || 'Failed to assign badge')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUnassign = async (id: string) => {
    if (!confirm('Are you sure you want to remove this badge assignment?')) return

    try {
      await unassignBadge.mutateAsync(id)
      toast.success('Badge assignment removed')
      queryClient.invalidateQueries({ queryKey: ['adminAssignedBadges'] })
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove assignment')
    }
  }

  const getTargetName = (ab: any) => {
    if (ab.server_id) {
      const s = servers.find(srv => srv.id === ab.server_id)
      return s ? s.name : 'Unknown Server'
    }
    if (ab.user_id) {
      const u = users.find(usr => usr.id === ab.user_id)
      return u ? (u.discord_username || 'Unknown User') : 'Unknown User'
    }
    return 'Unknown'
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-pixel text-white mb-2 tracking-tighter">BADGE MANAGEMENT</h1>
          <p className="text-white/40 font-headline font-medium">Assign and manage prestigious badges for servers and community members.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Badges */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-pixel text-realm-green flex items-center gap-2">
            <Award size={20} /> AVAILABLE BADGES
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {badges.map((badge) => (
              <motion.button
                key={badge.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedBadge(badge)
                  setTargetType(badge.target_type)
                  setSearchQuery('')
                }}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 text-left ${
                  selectedBadge?.id === badge.id
                    ? 'bg-realm-green/10 border-realm-green text-realm-green shadow-[0_0_20px_rgba(133,252,126,0.1)]'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-12 h-12 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center shrink-0 p-2 overflow-hidden">
                   <img 
                    src={new URL(`../assets/badges/${badge.image_url}`, import.meta.url).href} 
                    alt={badge.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-white mb-1 flex items-center gap-2">
                    {badge.name}
                    {badge.type === 'automatic' && (
                      <span className="text-[10px] font-pixel bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Auto</span>
                    )}
                  </h3>
                  <p className="text-xs text-white/40 line-clamp-2">{badge.description}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    {badge.target_type === 'server' ? (
                      <ServerIcon size={12} className="opacity-40" />
                    ) : (
                      <User size={12} className="opacity-40" />
                    )}
                    <span className="text-[10px] uppercase font-pixel opacity-40">{badge.target_type}s</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Assignment Tool */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {selectedBadge ? (
              <motion.div
                key="assignment-tool"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-realm-green/5 blur-[80px] -z-10" />
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-realm-green/10 rounded-2xl border border-realm-green/20 flex items-center justify-center p-2 overflow-hidden">
                       <img 
                        src={new URL(`../assets/badges/${selectedBadge.image_url}`, import.meta.url).href} 
                        alt="" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-pixel text-white mb-1 uppercase tracking-tighter">Assigning {selectedBadge.name}</h2>
                      <p className="text-white/40 text-sm font-headline">Select a {selectedBadge.target_type} to grant this badge to.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedBadge(null)}
                    className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                  >
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                {selectedBadge.type === 'automatic' ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                    <Info className="text-blue-400 mb-4" size={32} />
                    <h3 className="text-lg font-pixel text-white mb-2 uppercase">AUTOMATIC BADGE</h3>
                    <p className="text-white/40 text-sm max-w-md px-6">
                      This badge is automatically synchronized based on current leaderboard standings. It cannot be manually assigned or removed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input
                          type="text"
                          placeholder={`Search ${selectedBadge.target_type}s...`}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-realm-green/50 transition-all font-headline font-medium"
                        />
                      </div>
                      <div className="w-full md:w-48">
                        <select
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="w-full h-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-realm-green/50 transition-all font-headline font-bold appearance-none cursor-pointer"
                        >
                          {monthOptions.map(m => (
                            <option key={m} value={m} className="bg-zinc-900 text-white">{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                      {searchQuery.length > 0 ? (
                        filteredTargets.length > 0 ? (
                          filteredTargets.map((target: any) => (
                            <button
                              key={target.id}
                              onClick={() => handleAssign(target.id)}
                              disabled={isAssigning}
                              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                {targetType === 'server' ? (
                                  <div className="w-10 h-10 bg-white/10 rounded-lg overflow-hidden border border-white/10">
                                    <img src={target.icon_url || ''} className="w-full h-full object-cover" alt="" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 bg-white/10 rounded-full overflow-hidden border border-white/10">
                                    <img src={target.discord_avatar || ''} className="w-full h-full object-cover" alt="" />
                                  </div>
                                )}
                                <div className="text-left">
                                  <p className="text-sm font-headline font-bold text-white">
                                    {targetType === 'server' ? target.name : target.discord_username}
                                  </p>
                                  <p className="text-[10px] text-white/40 uppercase font-pixel tracking-wider">
                                    {targetType === 'server' ? target.slug : target.discord_id}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-pixel text-realm-green uppercase">Assign</span>
                                <div className="w-8 h-8 bg-realm-green text-zinc-950 rounded-lg flex items-center justify-center">
                                  <Check size={16} strokeWidth={3} />
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="py-12 text-center text-white/20 font-pixel uppercase text-sm">No results found</div>
                        )
                      ) : (
                        <div className="py-12 text-center text-white/20 font-pixel uppercase text-sm">Type to search...</div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="recent-assignments"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-pixel text-white flex items-center gap-2">
                  <Shield size={20} /> RECENT ASSIGNMENTS
                </h2>

                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                          <th className="px-6 py-4 text-[10px] font-pixel text-white/40 uppercase tracking-widest">Badge</th>
                          <th className="px-6 py-4 text-[10px] font-pixel text-white/40 uppercase tracking-widest">Recipient</th>
                          <th className="px-6 py-4 text-[10px] font-pixel text-white/40 uppercase tracking-widest">Month</th>
                          <th className="px-6 py-4 text-[10px] font-pixel text-white/40 uppercase tracking-widest">Date</th>
                          <th className="px-6 py-4 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-headline">
                        {assignedLoading ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-white/20 font-pixel animate-pulse uppercase">Loading assignments...</td>
                          </tr>
                        ) : assignedBadges.length > 0 ? (
                          assignedBadges.map((ab) => (
                            <tr key={ab.id} className="hover:bg-white/5 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 p-1.5 overflow-hidden">
                                    <img 
                                      src={new URL(`../assets/badges/${ab.badge?.image_url}`, import.meta.url).href} 
                                      alt="" 
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <span className="font-bold text-sm text-white">{ab.badge?.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  {ab.server_id ? <ServerIcon size={14} className="text-realm-green" /> : <User size={14} className="text-blue-400" />}
                                  <span className="text-sm font-medium text-white/80">{getTargetName(ab)}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-pixel text-realm-green uppercase">{ab.month || 'N/A'}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs text-white/40">{new Date(ab.granted_at).toLocaleDateString()}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => handleUnassign(ab.id)}
                                  className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-white/20 font-pixel uppercase">No manual assignments yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
