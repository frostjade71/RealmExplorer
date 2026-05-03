import { useReports } from '../hooks/queries'
import { Link } from 'react-router-dom'
import { useUpdateReportStatusMutation, useDeleteReportMutation } from '../hooks/mutations'
import { LoadingSpinner } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Search, X, Trash2, Flag, Eye, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export function AdminReportsPage() {
  const { profile } = useAuth()
  const { data: reports = [], isLoading: loading } = useReports()
  const updateMutation = useUpdateReportStatusMutation()
  const deleteMutation = useDeleteReportMutation()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewing' | 'resolved' | 'rejected'>('all')

  const filteredReports = useMemo(() => {
    return reports.filter(req => {
      const matchesSearch = req.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (req.profiles?.discord_username?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                          (req.servers?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      
      const matchesStatus = statusFilter === 'all' ? true : req.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [reports, searchQuery, statusFilter])

  const handleUpdateStatus = (id: string, status: 'reviewing' | 'resolved' | 'rejected') => {
    updateMutation.mutate(
      { id, status, adminId: profile?.id, adminName: profile?.discord_username },
      {
        onSuccess: () => {
          toast.success(`Report ${status}`, {
            description: `The report status has been updated to ${status}.`
          })
        },
        onError: (err: any) => {
          toast.error('Action Failed', { description: err.message })
        }
      }
    )
  }

  const handleDeleteReport = (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this report? This action cannot be undone.')) return

    deleteMutation.mutate(
      { id, adminId: profile?.id, adminName: profile?.discord_username },
      {
        onSuccess: () => {
          toast.success('Report Deleted', {
            description: 'The report has been permanently removed.'
          })
        },
        onError: (err: any) => {
          toast.error('Deletion Failed', { description: err.message })
        }
      }
    )
  }

  if (loading) return <LoadingSpinner />

  return (
    <AnimatedPage>
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <Flag className="text-red-500 w-4 h-4" />
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold text-sm">Moderation</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">Manage Reports</h1>
          <p className="text-white/40 font-headline text-sm max-w-xl">Review and act on user reports regarding server listings.</p>
        </FramerIn>
        
        <FramerIn delay={0.1}>
          <div className="flex items-center justify-around lg:justify-start gap-4 sm:gap-6 bg-zinc-900 border border-white/10 px-4 sm:px-6 py-4 rounded-lg">
            <div className="text-center min-w-[70px]">
              <div className="text-red-500 font-pixel text-xl leading-none mb-1">
                {reports.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-[9px] sm:text-[10px] font-headline text-white/40 uppercase font-bold tracking-widest">Pending</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center min-w-[70px]">
              <div className="text-orange-500 font-pixel text-xl leading-none mb-1">
                {reports.filter(r => r.status === 'reviewing').length}
              </div>
              <div className="text-[9px] sm:text-[10px] font-headline text-white/40 uppercase font-bold tracking-widest">Reviewing</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center min-w-[70px]">
              <div className="text-white font-pixel text-xl leading-none mb-1">{reports.length}</div>
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
            placeholder="Search reports, servers, or reporters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-red-500 transition-all outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-1 bg-white/5 border border-white/10 p-1.5 rounded-lg">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'reviewing', label: 'Reviewing' },
            { id: 'resolved', label: 'Resolved' },
            { id: 'rejected', label: 'Rejected' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-4 py-2 rounded-lg text-[10px] font-headline font-bold uppercase tracking-widest transition-all ${
                statusFilter === f.id 
                  ? 'bg-red-500 text-white shadow-md' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </FramerIn>

      <FramerIn delay={0.2} className="bg-zinc-900/60 border border-white/5 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-headline text-sm border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/5 text-white/30 uppercase tracking-[0.2em] text-[10px] font-bold">
                <th className="px-6 py-5">Reporter</th>
                <th className="px-6 py-5">Server</th>
                <th className="px-6 py-5">Subject</th>
                <th className="px-6 py-5">Message</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <motion.tbody 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
              }}
              className="divide-y divide-white/[0.03]"
            >
              {filteredReports.map(req => (
                <motion.tr 
                  key={req.id} 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {req.profiles?.discord_avatar ? (
                          <img src={req.profiles.discord_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-white/20 text-lg">person</span>
                        )}
                      </div>
                      <div className="font-bold text-white text-xs">{req.profiles?.discord_username || 'Unknown'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-bold text-white text-[11px] whitespace-nowrap">
                    {req.servers?.slug ? (
                      <Link 
                        to={`/server/${req.servers.slug}`}
                        target="_blank"
                        className="hover:text-realm-green transition-colors underline underline-offset-4 decoration-white/10"
                      >
                        {req.servers.name}
                      </Link>
                    ) : (
                      req.servers?.name || 'Deleted Server'
                    )}
                  </td>
                  <td className="px-6 py-5 font-bold text-red-400 uppercase tracking-wider text-[10px]">
                    {req.subject}
                  </td>
                  <td className="px-6 py-5 text-white/60 max-w-xs truncate text-[11px] leading-relaxed italic">
                    "{req.message}"
                  </td>
                  <td className="px-6 py-5 text-white/30 text-[10px] font-mono whitespace-nowrap">
                    {format(new Date(req.created_at), 'MMM dd, HH:mm')}
                  </td>
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      req.status === 'resolved' ? 'bg-realm-green/10 text-realm-green border border-realm-green/20' :
                      req.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      req.status === 'reviewing' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      'bg-white/5 text-white/40 border border-white/10'
                    }`}>
                      <span className="w-1 h-1 rounded-lg bg-current" />
                      {req.status}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {req.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateStatus(req.id, 'reviewing')}
                          disabled={updateMutation.isPending}
                          className="p-2 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-zinc-950 transition-all border border-orange-500/20"
                          title="Review Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {(req.status === 'reviewing' || req.status === 'pending') && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(req.id, 'resolved')}
                            disabled={updateMutation.isPending}
                            className="p-2 rounded-lg bg-realm-green/10 text-realm-green hover:bg-realm-green hover:text-zinc-950 transition-all border border-realm-green/20"
                            title="Resolve Report"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                            disabled={updateMutation.isPending}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                            title="Reject Report"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleDeleteReport(req.id)}
                        disabled={deleteMutation.isPending}
                        className="p-2 rounded-lg bg-white/5 text-white/20 hover:bg-red-500 hover:text-white transition-all border border-white/10 hover:border-red-500/20"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/20 italic text-sm">
                    No reports found.
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
