import { useAuditLogs, useVoteLogs, usePaymentLogs } from '../hooks/queries'
import { LoadingSpinner } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { Search, X, History, User, Info, Calendar, Trash2, ThumbsUp, Sparkles } from 'lucide-react'
import { useClearAuditLogsMutation, useClearVoteLogsMutation, useClearOTMLogsMutation } from '../hooks/mutations'
import { useAuth } from '../contexts/AuthContext'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { toast } from 'sonner'

type LogTab = 'audit' | 'vote' | 'otm' | 'payment'

export function AdminAuditLogsPage() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<LogTab>('audit')
  const { data: logs = [], isLoading: loadingLogs } = useAuditLogs()
  const { data: voteLogs = [], isLoading: loadingVotes } = useVoteLogs()
  const { data: paymentLogs = [], isLoading: loadingPayments } = usePaymentLogs()
  const [searchQuery, setSearchQuery] = useState('')
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)
  
  const clearLogsMutation = useClearAuditLogsMutation()
  const clearVotesMutation = useClearVoteLogsMutation()
  const clearOTMLogsMutation = useClearOTMLogsMutation()

  const handleClear = () => {
    if (!profile) return

    const mutation = activeTab === 'audit' ? clearLogsMutation : activeTab === 'otm' ? clearOTMLogsMutation : clearVotesMutation
    
    mutation.mutate(
      { adminId: profile.id, adminName: profile.discord_username || 'Unknown' },
      {
        onSuccess: () => {
          toast.success(`${activeTab === 'audit' ? 'Audit' : activeTab === 'otm' ? 'OTM' : 'Vote'} logs cleared successfully`)
          setIsClearModalOpen(false)
        },
        onError: (err: any) => {
          toast.error('Failed to clear logs', { description: err.message })
        }
      }
    )
  }

  const filteredLogs = useMemo(() => {
    return logs.filter((log: any) => {
      // If we are in the main 'audit' tab, exclude OTM logs
      if (activeTab === 'audit' && log.action.startsWith('OTM_')) return false
      // If we are in 'otm' tab, only include OTM logs
      if (activeTab === 'otm' && !log.action.startsWith('OTM_')) return false
      
      const content = `${log.action} ${log.discord_username} ${JSON.stringify(log.details)}`.toLowerCase()
      return content.includes(searchQuery.toLowerCase())
    })
  }, [logs, searchQuery, activeTab])

  const filteredVoteLogs = useMemo(() => {
    return voteLogs.filter((vote: any) => {
      const username = vote.profiles?.discord_username || 'Unknown'
      const discordId = vote.profiles?.discord_id || ''
      const serverName = vote.servers?.name || 'Unknown'
      const content = `${username} ${discordId} ${serverName}`.toLowerCase()
      return content.includes(searchQuery.toLowerCase())
    })
  }, [voteLogs, searchQuery])

  const filteredPaymentLogs = useMemo(() => {
    return paymentLogs.filter((pay: any) => {
      const username = pay.profiles?.discord_username || 'Unknown'
      const orderId = pay.paypal_order_id || ''
      const amount = `${pay.amount} ${pay.currency}`
      const content = `${username} ${orderId} ${amount} ${pay.status}`.toLowerCase()
      return content.includes(searchQuery.toLowerCase())
    })
  }, [paymentLogs, searchQuery])

  const getActionColor = (action: string) => {
    if (action.includes('APPROVED') || action === 'OTM_VOTE') return 'text-realm-green bg-realm-green/10 border-realm-green/20'
    if (action.includes('REJECTED') || action.includes('RESET') || action.includes('CLEARED') || action === 'OTM_UNVOTE') return 'text-red-500 bg-red-500/10 border-red-500/20'
    if (action.includes('LOGIN')) return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    if (action.includes('ROLE')) return 'text-purple-400 bg-purple-400/10 border-purple-400/20'
    return 'text-white/40 bg-white/5 border-white/10'
  }

  const formatDetails = (details: any) => {
    if (!details || Object.keys(details).length === 0) return '-'
    return Object.entries(details).map(([key, val]) => (
      <div key={key} className="flex gap-2 text-[10px]">
        <span className="text-white/20 uppercase font-bold">{key}:</span>
        <span className="text-white/60">{String(val)}</span>
      </div>
    ))
  }

  const isLoading = activeTab === 'vote' ? loadingVotes : activeTab === 'payment' ? loadingPayments : loadingLogs
  const currentCount = activeTab === 'audit' 
    ? logs.filter((l: any) => !l.action.startsWith('OTM_')).length 
    : activeTab === 'otm'
      ? logs.filter((l: any) => l.action.startsWith('OTM_')).length
      : activeTab === 'payment'
        ? paymentLogs.length
        : voteLogs.length

  if (isLoading) return <LoadingSpinner />

  return (
    <AnimatedPage>
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <History className="text-realm-green w-4 h-4" />
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold">System Integrity</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">Logs & Activity</h1>
          <p className="text-white/40 font-headline text-sm max-w-xl">Review staff actions and community voting records.</p>
        </FramerIn>

        <div className="flex flex-wrap items-center gap-4">
          {activeTab !== 'payment' && (
            <FramerIn delay={0.1}>
              <button
                onClick={() => setIsClearModalOpen(true)}
                disabled={currentCount === 0}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all font-headline text-[10px] uppercase font-bold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                Clear {activeTab === 'audit' ? 'Audit' : activeTab === 'otm' ? 'OTM' : 'Vote'}
              </button>
            </FramerIn>
          )}

          <FramerIn delay={0.15}>
            <div className="bg-zinc-900 border border-white/10 px-6 py-3 sm:py-4 rounded-lg">
              <div className="text-left lg:text-right">
                <div className="text-white font-pixel text-lg leading-none mb-1">{currentCount}</div>
                <div className="text-[9px] sm:text-[10px] font-headline text-white/40 uppercase font-bold tracking-widest leading-none">Stored Events</div>
              </div>
            </div>
          </FramerIn>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8 bg-white/5 p-1 rounded-lg max-w-full lg:w-fit border border-white/10">
        <button
          onClick={() => { setActiveTab('audit'); setSearchQuery(''); }}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all font-headline text-[10px] uppercase font-bold tracking-[0.1em] ${
            activeTab === 'audit' ? 'bg-realm-green text-zinc-950 shadow-md' : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Audit Logs
        </button>
        <button
          onClick={() => { setActiveTab('otm'); setSearchQuery(''); }}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all font-headline text-[10px] uppercase font-bold tracking-[0.1em] ${
            activeTab === 'otm' ? 'bg-realm-green text-zinc-950 shadow-md' : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          OTM Vote Logs
        </button>
        <button
          onClick={() => { setActiveTab('vote'); setSearchQuery(''); }}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all font-headline text-[10px] uppercase font-bold tracking-[0.1em] ${
            activeTab === 'vote' ? 'bg-realm-green text-zinc-950 shadow-md' : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          Vote Logs
        </button>
        <button
          onClick={() => { setActiveTab('payment'); setSearchQuery(''); }}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all font-headline text-[10px] uppercase font-bold tracking-[0.1em] ${
            activeTab === 'payment' ? 'bg-amber-400 text-zinc-950 shadow-md' : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Payment Logs
        </button>
      </div>

      <ConfirmationModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClear}
        title={`Clear ${activeTab === 'audit' ? 'Audit' : activeTab === 'otm' ? 'OTM' : 'Vote'} Logs?`}
        message={`This action is permanent and will remove all recorded ${activeTab === 'audit' ? 'staff activity' : activeTab === 'otm' ? 'OTM vote records' : 'community votes'} from the database. ${activeTab === 'audit' ? 'A final log entry will record this purge.' : ''}`}
        confirmLabel="Wipe Everything"
        isDangerous={true}
        isLoading={clearLogsMutation.isPending || clearVotesMutation.isPending || clearOTMLogsMutation.isPending}
      />

      <FramerIn delay={0.2} className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input 
          type="text"
          placeholder={activeTab === 'audit' ? "Filter logs by username, action, or details..." : "Search by voter, Discord ID, or server..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-realm-green transition-all outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </FramerIn>

      <FramerIn delay={0.25} className="bg-zinc-900/60 border border-white/5 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-headline text-sm border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/5 text-white/30 uppercase tracking-[0.2em] text-[10px] font-bold">
                <th className="px-6 py-5">Timestamp</th>
                <th className="px-6 py-5">
                  {activeTab === 'audit' ? 'Staff Member' : activeTab === 'payment' ? 'Customer' : 'Voter'}
                </th>
                <th className="px-6 py-5">
                  {activeTab === 'audit' ? 'Action' : activeTab === 'payment' ? 'Transaction ID' : activeTab === 'otm' ? 'Event' : 'Server Name'}
                </th>
                <th className="px-6 py-5">
                  {activeTab === 'audit' ? 'Details' : activeTab === 'payment' ? 'Amount / Status' : activeTab === 'otm' ? 'Summary' : 'Discord ID'}
                </th>
              </tr>
            </thead>
            <AnimatePresence mode="wait">
              <motion.tbody 
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="divide-y divide-white/[0.03]"
              >
                {activeTab === 'payment' ? (
                  filteredPaymentLogs.map((pay: any) => (
                    <motion.tr key={pay.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-white/40">
                          <Calendar className="w-3 h-3" />
                          <span className="text-[11px] font-mono">
                            {new Date(pay.created_at).toLocaleString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-lg bg-amber-400/10 flex items-center justify-center border border-amber-400/20 group-hover:border-amber-400/30 transition-colors">
                              <User className="w-3 h-3 text-amber-400/60 transition-colors" />
                           </div>
                           <span className="font-bold text-white group-hover:text-amber-400 transition-colors">
                            {pay.profiles?.discord_username || 'Unknown'}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <code className="text-[10px] text-white/40 font-mono bg-white/5 px-2 py-1 rounded border border-white/10 group-hover:border-amber-400/20 transition-colors">
                          {pay.paypal_order_id}
                        </code>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="text-realm-green font-bold text-sm">${pay.amount}</span>
                          <span className="text-white/20 text-[10px]">{pay.currency}</span>
                          <span className={`ml-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${
                            pay.status === 'completed' ? 'bg-realm-green/10 text-realm-green' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {pay.status}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : activeTab === 'audit' || activeTab === 'otm' ? (
                  filteredLogs.map((log: any) => (
                    <motion.tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-white/40">
                          <Calendar className="w-3 h-3" />
                          <span className="text-[11px] font-mono">
                            {new Date(log.created_at).toLocaleString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-realm-green/30 transition-colors">
                              <User className="w-3 h-3 text-white/20 group-hover:text-realm-green/60 transition-colors" />
                           </div>
                           <span className="font-bold text-white group-hover:text-realm-green transition-colors">
                            {log.discord_username || 'System'}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${getActionColor(log.action)}`}>
                          {activeTab === 'otm' && log.details.category ? (
                            log.details.category === 'realm' ? 'ROTM' : 
                            log.details.category === 'server' ? 'SOTM' : 
                            log.details.category === 'builder' ? 'BOTM' : 
                            log.details.category === 'developer' ? 'DOTM' : 
                            log.details.category.toUpperCase()
                          ) : (
                            log.action.replace(/_/g, ' ')
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {activeTab === 'otm' ? (
                          <div className="text-sm font-headline">
                            <span className="text-white/40">Voted </span>
                            <span className="text-white font-bold">{log.details.competitor || 'Unknown'}</span>
                            <span className="text-white/40">, </span>
                            <span className="text-realm-green font-bold">{log.details.newCount || '0'}</span>
                            <span className="text-white/40"> now.</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {formatDetails(log.details)}
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  filteredVoteLogs.map((vote: any) => (
                    <motion.tr key={vote.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-white/40">
                          <Calendar className="w-3 h-3" />
                          <span className="text-[11px] font-mono">
                            {new Date(vote.created_at).toLocaleString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-lg bg-realm-green/10 flex items-center justify-center border border-realm-green/20 group-hover:bg-realm-green/20 transition-colors">
                              <User className="w-3 h-3 text-realm-green/60" />
                           </div>
                           <span className="font-bold text-white">
                            {vote.profiles?.discord_username || 'Anonymous'}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-white/60 font-medium">{vote.servers?.name || 'Unknown Server'}</span>
                      </td>
                      <td className="px-6 py-5">
                         <code className="text-[10px] text-white/20 font-mono bg-white/5 px-2 py-1 rounded border border-white/5">
                            {vote.profiles?.discord_id || 'N/A'}
                         </code>
                      </td>
                    </motion.tr>
                  ))
                )}
                {(activeTab === 'audit' ? filteredLogs.length : filteredVoteLogs.length) === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-white/20 italic font-headline">
                        <Info className="w-8 h-8 opacity-20" />
                        <span>No {activeTab} logs found matching your criteria.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>
      </FramerIn>
    </AnimatedPage>
  )
}
