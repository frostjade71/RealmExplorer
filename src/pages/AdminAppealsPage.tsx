import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useBanAppeals, useUpdateBanAppeal } from '../hooks/appeals'
import { sendLogNotification } from '../lib/discord'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { LoadingSpinner } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { Search, X, Check, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

import { supabase } from '../lib/supabase'

export function AdminAppealsPage() {
  const [filter, setFilter] = useState('pending')
  const { data: appeals = [], isLoading } = useBanAppeals()
  const { mutateAsync: updateAppeal } = useUpdateBanAppeal()
  const { profile } = useAuth()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 20

  const [processingId, setProcessingId] = useState<string | null>(null)

  const filteredAppeals = useMemo(() => {
    return appeals.filter((appeal: any) => {
      const query = searchQuery.toLowerCase()
      const matchesSearch = (
        appeal.discord_username?.toLowerCase().includes(query) ||
        appeal.discord_id?.toLowerCase().includes(query) ||
        appeal.appeal_reason?.toLowerCase().includes(query)
      )
      
      const matchesStatus = filter === 'all' || appeal.status === filter

      return matchesSearch && matchesStatus
    })
  }, [appeals, searchQuery, filter])

  const totalPages = Math.ceil(filteredAppeals.length / ITEMS_PER_PAGE)
  const paginatedAppeals = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAppeals.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredAppeals, currentPage])

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filter])

  // Scroll to top when page changes
  useEffect(() => {
    const main = document.querySelector('main')
    if (main) {
      main.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentPage])

  const handleUpdateStatus = async (id: string, status: string, discordUsername: string, discordId: string) => {
    try {
      setProcessingId(id)
      await updateAppeal({ id, status })
      
      // Auto unban if approved
      let unbanError = null;
      if (status === 'approved' && discordId) {
        try {
          const { error } = await supabase.functions.invoke('discord-notification', {
            body: {
              type: 'unban',
              payload: { discordId }
            }
          });
          if (error) throw error;
        } catch (e: any) {
          console.error("Unban failed:", e);
          unbanError = e.message;
        }
      }

      // Log admin action to standard logs channel
      await sendLogNotification({
        action: `Ban Appeal ${status.toUpperCase()}`,
        adminName: profile?.discord_username || 'Unknown',
        details: `Processed appeal for user: **${discordUsername}**`,
        color: status === 'approved' ? 0x00ff00 : 0xff0000
      })

      // Send verdict to the Appeals channel specifically
      await supabase.functions.invoke('discord-notification', {
        body: {
          type: 'appeal_log',
          payload: { 
            discordUsername, 
            discordId, 
            status, 
            adminName: profile?.discord_username || 'Unknown'
          }
        }
      })

      if (status === 'approved') {
        if (unbanError) {
          toast.warning('Appeal Approved (Unban Failed)', { 
            description: `The appeal was approved, but the bot could not unban the user. They might not be banned on Discord. Error: ${unbanError}` 
          })
        } else {
          toast.success('Appeal Approved', { 
            description: `User ${discordUsername} has been successfully unbanned from the Discord server.` 
          })
        }
      } else {
        toast.success(`Appeal marked as ${status}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update appeal')
    } finally {
      setProcessingId(null)
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <AnimatedPage>
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-realm-green text-sm">gavel</span>
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold text-sm">Staff Only</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">Ban Appeals</h1>
          <p className="text-white/40 font-headline text-sm max-w-xl">Review and manage Discord ban appeals from users.</p>
        </FramerIn>

        <FramerIn delay={0.1}>
          <div className="flex items-center justify-around lg:justify-start gap-4 sm:gap-6 bg-zinc-900 border border-white/10 px-4 sm:px-6 py-4 rounded-lg">
            <div className="text-center min-w-[70px]">
              <div className="text-realm-green font-pixel text-xl leading-none mb-1">
                {appeals.filter((a: any) => a.status === 'pending').length}
              </div>
              <div className="text-[9px] sm:text-[10px] font-headline text-white/40 uppercase font-bold tracking-widest">To Review</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center min-w-[70px]">
              <div className="text-white font-pixel text-xl leading-none mb-1">{appeals.length}</div>
              <div className="text-[9px] sm:text-[10px] font-headline text-white/40 uppercase font-bold tracking-widest">Total</div>
            </div>
          </div>
        </FramerIn>
      </div>

      <FramerIn delay={0.15} className="mb-6 flex flex-wrap gap-4 items-center sticky top-[72px] lg:top-0 z-30 bg-zinc-950 p-4 -mx-4 rounded-lg border border-white/5 lg:border-none lg:bg-transparent lg:p-0 lg:mx-0">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text"
            placeholder="Search by username or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-realm-green transition-all outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-1 bg-white/5 border border-white/10 p-1.5 rounded-lg">
          {[
            { id: 'pending', label: 'Pending' },
            { id: 'approved', label: 'Approved' },
            { id: 'denied', label: 'Denied' },
            { id: 'all', label: 'All' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-[10px] font-headline font-bold uppercase tracking-widest transition-all ${
                filter === f.id 
                  ? 'bg-realm-green text-zinc-950 shadow-md' 
                  : f.id === 'all'
                    ? 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </FramerIn>

      <FramerIn delay={0.2} className="bg-zinc-900/60 border border-white/5 rounded-lg overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left font-headline text-sm border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/5 text-white/30 uppercase tracking-[0.2em] text-[10px] font-bold">
                <th className="px-6 py-5">User Details</th>
                <th className="px-6 py-5">Appeal Reason</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <motion.tbody 
              key={`${currentPage}-${filter}-${searchQuery}`}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.03
                  }
                }
              }}
              className="divide-y divide-white/[0.03]"
            >
              {paginatedAppeals.map((appeal: any) => (
                <motion.tr 
                  key={appeal.id} 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-5 align-top">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden flex-shrink-0">
                        {appeal.profiles?.discord_avatar ? (
                          <img src={appeal.profiles.discord_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-white/20 text-xl">person</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white transition-colors">{appeal.discord_username}</div>
                        <div className="text-xs text-white/40 font-mono mt-0.5 flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 opacity-80">
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">ID</span>
                            <span>{appeal.discord_id}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                             <span className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">
                               Submitted {formatDistanceToNow(new Date(appeal.created_at), { addSuffix: true })}
                             </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 align-top w-2/5">
                    <div className="text-sm text-zinc-300 bg-black/20 p-3 rounded-lg border border-white/5 max-h-[150px] overflow-y-auto break-words whitespace-pre-wrap">
                      {appeal.appeal_reason}
                    </div>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      appeal.status === 'approved' ? 'bg-realm-green/10 text-realm-green border border-realm-green/20' :
                      appeal.status === 'denied' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                    }`}>
                      {appeal.status === 'approved' ? (
                        <Check className="w-3 h-3" />
                      ) : appeal.status === 'denied' ? (
                        <X className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {appeal.status}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right align-top">
                    <div className="flex justify-end gap-2 opacity-100 transition-opacity duration-300">
                      {appeal.status === 'pending' && (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpdateStatus(appeal.id, 'approved', appeal.discord_username, appeal.discord_id)
                            }}
                            disabled={processingId === appeal.id}
                            className="w-10 h-10 rounded-lg bg-realm-green/10 text-realm-green hover:bg-realm-green hover:text-zinc-950 flex items-center justify-center transition-all duration-300 border border-realm-green/20 group/btn disabled:opacity-50"
                            title="Approve Appeal"
                          >
                            <span className="material-symbols-outlined text-[20px] group-hover/btn:scale-110 transition-transform">check</span>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpdateStatus(appeal.id, 'denied', appeal.discord_username, appeal.discord_id)
                            }}
                            disabled={processingId === appeal.id}
                            className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-300 border border-red-500/20 group/btn disabled:opacity-50"
                            title="Deny Appeal"
                          >
                            <span className="material-symbols-outlined text-[20px] group-hover/btn:scale-110 transition-transform">close</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredAppeals.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-white/20 italic font-headline">
                      <span className="material-symbols-outlined text-4xl">inbox</span>
                      <span>
                        {filter === 'pending' 
                          ? 'No pending appeals to review.' 
                          : 'No appeals found matching these criteria.'}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </FramerIn>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-zinc-900/60 border border-white/5 rounded-lg px-6 py-4">
          <div className="text-[10px] font-headline font-bold uppercase tracking-widest text-white/40">
            Showing <span className="text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAppeals.length)}</span> of <span className="text-white">{filteredAppeals.length}</span> appeals
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                    if (pageNum + 2 > totalPages) pageNum = totalPages - 4 + i;
                  }
                }
                
                if (pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
                      currentPage === pageNum 
                        ? 'bg-realm-green text-zinc-950 shadow-lg shadow-realm-green/20' 
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </AnimatedPage>
  )
}
