import { useAuditLogs } from '../hooks/queries'
import { LoadingSpinner } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { Search, X, History, User, Info, Calendar, Trash2 } from 'lucide-react'
import { useClearAuditLogsMutation } from '../hooks/mutations'
import { useAuth } from '../contexts/AuthContext'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { toast } from 'sonner'

export function AdminAuditLogsPage() {
  const { profile } = useAuth()
  const { data: logs = [], isLoading: loading } = useAuditLogs()
  const [searchQuery, setSearchQuery] = useState('')
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)
  
  const clearLogsMutation = useClearAuditLogsMutation()

  const handleClearLogs = () => {
    if (!profile) return

    clearLogsMutation.mutate(
      { adminId: profile.id, adminName: profile.discord_username },
      {
        onSuccess: () => {
          toast.success('Audit logs cleared successfully')
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
      const content = `${log.action} ${log.discord_username} ${JSON.stringify(log.details)}`.toLowerCase()
      return content.includes(searchQuery.toLowerCase())
    })
  }, [logs, searchQuery])

  const getActionColor = (action: string) => {
    if (action.includes('APPROVED')) return 'text-realm-green bg-realm-green/10 border-realm-green/20'
    if (action.includes('REJECTED') || action.includes('RESET') || action.includes('CLEARED')) return 'text-red-500 bg-red-500/10 border-red-500/20'
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

  if (loading) return <LoadingSpinner />

  return (
    <AnimatedPage>
      <div className="mb-10 flex items-end justify-between">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <History className="text-realm-green w-4 h-4" />
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold">System Integrity</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">Audit Logs</h1>
          <p className="text-white/40 font-headline text-sm">Review staff actions and security events.</p>
        </FramerIn>

        <div className="flex items-center gap-4">
          <FramerIn delay={0.1}>
            <button
              onClick={() => setIsClearModalOpen(true)}
              disabled={logs.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all font-headline text-[10px] uppercase font-bold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              Clear Logs
            </button>
          </FramerIn>

          <FramerIn delay={0.15}>
            <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl backdrop-blur-md">
              <div className="text-right">
                <div className="text-white font-pixel text-lg leading-none">{logs.length}</div>
                <div className="text-[10px] font-headline text-white/40 uppercase font-bold tracking-widest mt-1">Stored Events</div>
              </div>
            </div>
          </FramerIn>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearLogs}
        title="Clear Audit Logs?"
        message="This action is permanent and will remove all recorded staff activity from the database. A final log entry will record this purge."
        confirmLabel="Wipe Everything"
        isDangerous={true}
        isLoading={clearLogsMutation.isPending}
      />

      <FramerIn delay={0.2} className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input 
          type="text"
          placeholder="Filter logs by username, action, or details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-realm-green transition-all outline-none backdrop-blur-md"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </FramerIn>

      <FramerIn delay={0.25} className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-headline text-sm border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/5 text-white/30 uppercase tracking-[0.2em] text-[10px] font-bold">
                <th className="px-6 py-5">Timestamp</th>
                <th className="px-6 py-5">Staff Member</th>
                <th className="px-6 py-5">Action</th>
                <th className="px-6 py-5">Details</th>
              </tr>
            </thead>
            <motion.tbody 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.02 }
                }
              }}
              className="divide-y divide-white/[0.03]"
            >
              {filteredLogs.map((log: any) => (
                <motion.tr 
                  key={log.id} 
                  variants={{
                    hidden: { opacity: 0, y: 5 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-white/40">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[11px] font-mono">
                        {new Date(log.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-realm-green/30 transition-colors">
                          <User className="w-3 h-3 text-white/20 group-hover:text-realm-green/60 transition-colors" />
                       </div>
                       <span className="font-bold text-white group-hover:text-realm-green transition-colors">
                        {log.discord_username || 'System'}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${getActionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      {formatDetails(log.details)}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-white/20 italic font-headline">
                      <Info className="w-8 h-8 opacity-20" />
                      <span>No audit logs found matching your criteria.</span>
                    </div>
                  </td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </FramerIn>
    </AnimatedPage>
  )
}
