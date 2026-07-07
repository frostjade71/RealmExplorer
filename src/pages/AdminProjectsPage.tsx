import { useAdminProjects } from '../hooks/queries'
import { useUpdateProjectStatusMutation } from '../hooks/mutations'
import type { ProjectStatus } from '../types'
import { LoadingSpinner } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Search, Check, X, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function AdminProjectsPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { data: projects = [], isLoading: loading } = useAdminProjects()
  const updateMutation = useUpdateProjectStatusMutation()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('review')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 20

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'review' 
          ? project.status === 'pending'
          : project.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [projects, searchQuery, statusFilter])

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE)
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredProjects, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const handleUpdateStatus = (id: string, newStatus: ProjectStatus) => {
    updateMutation.mutate(
      { id, status: newStatus, adminId: profile?.id, adminName: profile?.discord_username },
      {
        onSuccess: () => {
          toast.success(`Project ${newStatus}`, {
            description: `The project status has been updated to ${newStatus}.`
          })
        },
        onError: (err: any) => {
          toast.error('Status Update Failed', { description: err.message })
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
            <span className="material-symbols-outlined text-realm-green text-sm">inventory_2</span>
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold text-sm">Staff Only</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">Manage Projects</h1>
          <p className="text-white/40 font-headline text-sm max-w-xl">Review and moderate project submissions for the community.</p>
        </FramerIn>
        
        <FramerIn delay={0.1}>
          <div className="flex items-center justify-around lg:justify-start gap-4 sm:gap-6 bg-zinc-900 border border-white/10 px-4 sm:px-6 py-4 rounded-lg">
            <div className="text-center min-w-[70px]">
              <div className="text-realm-green font-pixel text-xl leading-none mb-1">
                {projects.filter(p => p.status === 'pending').length}
              </div>
              <div className="text-[9px] sm:text-[10px] font-headline text-white/40 uppercase font-bold tracking-widest">To Review</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center min-w-[70px]">
              <div className="text-white font-pixel text-xl leading-none mb-1">{projects.length}</div>
              <div className="text-[9px] sm:text-[10px] font-headline text-white/40 uppercase font-bold tracking-widest">Total</div>
            </div>
          </div>
        </FramerIn>
      </div>

      <FramerIn delay={0.15} className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center sticky top-[72px] lg:top-0 z-30 bg-zinc-950 p-4 -mx-4 rounded-lg border border-white/5 lg:border-none lg:bg-transparent lg:p-0 lg:mx-0">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text"
            placeholder="Search by name..."
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
            { id: 'review', label: 'Review' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-[10px] font-headline font-bold uppercase tracking-widest transition-all ${
                statusFilter === f.id 
                  ? 'bg-realm-green text-zinc-950 shadow-md' 
                  : f.id === 'all'
                    ? 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {f.label} {f.id === 'review' && projects.filter(p => p.status === 'pending').length > 0 && (
                <span className="ml-2 bg-zinc-950/20 text-zinc-950 px-2 py-0.5 rounded-full text-[10px]">
                  {projects.filter(p => p.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </FramerIn>

      <FramerIn delay={0.2} className="bg-zinc-900/60 border border-white/5 rounded-lg overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left font-headline text-sm border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/5 text-white/30 uppercase tracking-[0.2em] text-[10px] font-bold">
                <th className="px-6 py-5">Project Details</th>
                <th className="px-6 py-5">Type</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <motion.tbody 
              key={`${currentPage}-${statusFilter}`}
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
              {paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center border-dashed">
                    <span className="material-symbols-outlined text-4xl text-white/10 mb-4 block">inventory_2</span>
                    <p className="text-white/40 font-headline">No projects found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                paginatedProjects.map(project => (
                  <motion.tr 
                    key={project.id} 
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    onClick={() => navigate(`/projects/${project.slug || project.id}`)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden flex-shrink-0">
                          {project.icon_url ? (
                            <img src={project.icon_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-white/20 text-xl">inventory_2</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-realm-green transition-colors">{project.name}</div>
                          <div className="text-xs text-white/40 font-mono mt-0.5 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 opacity-80">
                              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">Owner ID</span>
                              <span>
                                {project.owner_id.split('-')[0]}...
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 border border-white/10 px-2 py-0.5 rounded-md bg-white/5">
                        {project.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-white/60 font-medium">
                      {project.category}
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        project.status === 'approved' ? 'bg-realm-green/10 text-realm-green border border-realm-green/20' :
                        project.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                      }`}>
                        {project.status === 'approved' ? (
                          <Check className="w-3 h-3" />
                        ) : project.status === 'rejected' ? (
                          <X className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {project.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-100 transition-opacity duration-300">
                        {project.status !== 'approved' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpdateStatus(project.id, 'approved')
                            }}
                            className="w-10 h-10 rounded-lg bg-realm-green/10 text-realm-green hover:bg-realm-green hover:text-zinc-950 flex items-center justify-center transition-all duration-300 border border-realm-green/20 group/btn"
                            title="Approve"
                          >
                            <span className="material-symbols-outlined text-[20px] group-hover/btn:scale-110 transition-transform">check</span>
                          </button>
                        )}
                        {project.status !== 'rejected' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpdateStatus(project.id, 'rejected')
                            }}
                            className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-300 border border-red-500/20 group/btn"
                            title="Reject"
                          >
                            <span className="material-symbols-outlined text-[20px] group-hover/btn:scale-110 transition-transform">close</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>
        </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8 pb-4">
                <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 p-2 rounded-xl">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-white/40 hover:text-white hover:bg-zinc-800 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="px-4 font-headline text-sm font-bold text-white">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-white/40 hover:text-white hover:bg-zinc-800 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
      </FramerIn>
    </AnimatedPage>
  )
}
