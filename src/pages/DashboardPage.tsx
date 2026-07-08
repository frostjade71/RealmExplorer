import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createPortal } from 'react-dom'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUserServers, useServerAppeals, useUserProjects, useSavedProjects, useSavedServers } from '../hooks/queries'
import { useDeleteServerMutation, useSubmitAppealMutation, useDeleteProjectMutation, useToggleProjectSaveMutation, useToggleServerSaveMutation } from '../hooks/mutations'
import { LoadingSpinner, EmptyState } from '../components/FeedbackStates'
import { ServerCard } from '../components/ServerCard'
import { ProjectCard } from '../components/ProjectCard'
import { SponsorServerCard } from '../components/SponsorServerCard'
import { PlusCircle, Pencil, Trash2, Check, Palette, AlertCircle, Server as ServerIcon, Folder, Bookmark, BookmarkMinus } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion, AnimatePresence } from 'framer-motion'
import { RoleSelectionModal } from '../components/RoleSelectionModal'
import { ProjectSelectionModal } from '../components/ProjectSelectionModal'
import { AppealModal } from '../components/AppealModal'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import diamondIcon from '../assets/category/16469-diamond.png'
import snowBlocksBg from '../assets/sponsors/Key art Snow Blocks cr,Ilya Vdovyuk.jpg'
import heartIcon from '../assets/blog/minecraftheart.png'
import { supabase } from '../lib/supabase'
import type { Server } from '../types'
import directoryHero from '../assets/hero/directoryhero.jpg'

const successGif = '/upgrades/4364-verification-icon.gif'

const SPONSOR_COLOR_OPTIONS = [
  { id: 'diamond', label: 'Diamond', preview: 'bg-gradient-to-r from-cyan-400 to-teal-400' },
  { id: 'royal_blue', label: 'Royal Blue', preview: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
  { id: 'emerald', label: 'Emerald Green', preview: 'bg-gradient-to-r from-emerald-500 to-green-400' },
  { id: 'dandelion', label: 'Yellow Dandelion', preview: 'bg-gradient-to-r from-yellow-400 to-amber-400' },
  { id: 'white', label: 'Pure White', preview: 'bg-gradient-to-r from-zinc-300 to-white' },
]

function SponsorSettingsItem({ server, onRefetch }: { server: Server, onRefetch: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState(server.sponsor_border_color || 'diamond')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('servers' as any)
        .update({ sponsor_border_color: selectedColor } as any)
        .eq('id', server.id)
      
      if (error) throw error
      toast.success('Border color updated!', {
        description: `${server.name} now uses the ${SPONSOR_COLOR_OPTIONS.find(c => c.id === selectedColor)?.label} theme.`
      })
      onRefetch()
    } catch (err: any) {
      toast.error('Failed to update color', { description: err.message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-4 hover:bg-zinc-800/30 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 border border-zinc-700">
          {server.icon_url ? (
            <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500 font-pixel text-[8px]">
              {server.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-pixel text-[10px] md:text-xs text-white truncate">{server.name}</h3>
          <p className="text-zinc-500 font-headline text-[9px]">
            Sponsored until {new Date(server.sponsored_until!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <span className="material-symbols-outlined text-zinc-500 text-lg">expand_more</span>
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-4 border-t border-zinc-800/50">
              <div className="flex items-center gap-1.5 mb-3 mt-1">
                <Palette className="w-3.5 h-3.5 text-zinc-500" />
                <p className="font-pixel text-[8px] text-zinc-400 uppercase tracking-wider">Change Border Color</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-4">
                {SPONSOR_COLOR_OPTIONS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border-2 transition-all ${
                      selectedColor === color.id
                        ? 'border-white/40 bg-zinc-800/80'
                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full ${color.preview} flex-shrink-0`} />
                    <span className="font-headline text-[10px] text-zinc-300 whitespace-nowrap">{color.label}</span>
                    {selectedColor === color.id && (
                      <Check className="w-3 h-3 text-realm-green ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-end mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isSaving || selectedColor === (server.sponsor_border_color || 'diamond')}
                  className="w-full sm:w-auto px-6 py-2 bg-realm-green text-[#002202] font-pixel text-[9px] uppercase tracking-wider rounded-lg hover:bg-[#85fc7e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-realm-green/20"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


export function DashboardPage() {
  const isMobile = useIsMobile()
  const { user, profile, hasPremiumPerks } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const actionParam = searchParams.get('action')
  const [activeTab, setActiveTab] = useState<'servers' | 'projects' | 'saved'>('servers')
  
  const { data: servers = [], isLoading: loadingServers, refetch } = useUserServers(user?.id)
  const { data: projects = [], isLoading: loadingProjects } = useUserProjects(user?.id)
  const { data: savedProjects = [] } = useSavedProjects(user?.id)
  const { data: savedServers = [] } = useSavedServers(user?.id)
  const limit = hasPremiumPerks ? 5 : 1
  const hasReachedLimit = servers.length >= limit
  const deleteServerMutation = useDeleteServerMutation()
  const deleteProjectMutation = useDeleteProjectMutation()
  const toggleSaveMutation = useToggleProjectSaveMutation()
  const toggleServerSaveMutation = useToggleServerSaveMutation()
  
  const handleUnsave = (projectId: string) => {
    if (!user) return
    toggleSaveMutation.mutate({
      projectId,
      userId: user.id,
      isSaving: false
    }, {
      onSuccess: () => {
        toast('Project Unsaved', { icon: <BookmarkMinus className="w-4 h-4 text-zinc-400" /> })
      }
    })
  }

  const handleUnsaveServer = (serverId: string) => {
    if (!user) return
    toggleServerSaveMutation.mutate({
      serverId,
      userId: user.id,
      isSaving: false
    }, {
      onSuccess: () => {
        toast('Server Unsaved', { icon: <BookmarkMinus className="w-4 h-4 text-zinc-400" /> })
      }
    })
  }

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')
  const [deleteType, setDeleteType] = useState<'server' | 'project'>('server')
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)

  // Sponsoring states
  const [selectedSponsorServerId, setSelectedSponsorServerId] = useState('')
  const [isSponsorProcessing, setIsSponsorProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const approvedServers = servers.filter(s => s.status === 'approved')

  // Appeal states
  const [appealServerId, setAppealServerId] = useState<string | null>(null)
  const [appealServerName, setAppealServerName] = useState('')
  const { data: appeals = [] } = useServerAppeals()
  const submitAppealMutation = useSubmitAppealMutation()

  const handleAppealSubmit = (reason: string) => {
    if (!appealServerId || !user?.id) return
    submitAppealMutation.mutate(
      { serverId: appealServerId, userId: user.id, reason },
      {
        onSuccess: () => {
          toast.success('Appeal Submitted', {
            description: 'Your appeal has been submitted for review.'
          })
          setAppealServerId(null)
        },
        onError: (err: any) => {
          toast.error('Submission Failed', { description: err.message })
        }
      }
    )
  }

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (deleteId || isRoleModalOpen || isProjectModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [deleteId, isRoleModalOpen])

  // Handle hash scrolling for #sponsor
  useEffect(() => {
    if (window.location.hash === '#sponsor' && servers.length > 0 && activeTab === 'servers') {
      const timer = setTimeout(() => {
        const element = document.getElementById('sponsor-section')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [servers, activeTab])

  // Handle upload project action query param
  useEffect(() => {
    if (actionParam === 'upload_project') {
      setIsProjectModalOpen(true)
      setActiveTab('projects')
      searchParams.delete('action')
      setSearchParams(searchParams, { replace: true })
    }
  }, [actionParam, searchParams, setSearchParams])

  const handleDeleteClick = (id: string, name: string, type: 'server' | 'project' = 'server') => {
    setDeleteId(id)
    setDeleteName(name)
    setDeleteType(type)
  }

  const confirmDelete = () => {
    if (deleteId) {
      const mutation = deleteType === 'project' ? deleteProjectMutation : deleteServerMutation
      mutation.mutate({ 
        id: deleteId, 
        adminId: user?.id, 
        adminName: profile?.discord_username 
      }, {
        onSuccess: () => setDeleteId(null)
      })
    }
  }

  const isDeleting = deleteServerMutation.isPending || deleteProjectMutation.isPending

  if (loadingServers || loadingProjects) return <LoadingSpinner />

  if (isSuccess) {
    return (
      <AnimatedPage className="min-h-[70vh] flex items-center justify-center px-4 py-12 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative bg-zinc-900 border border-realm-green/30 p-8 md:p-12 rounded-xl shadow-2xl overflow-hidden max-w-lg w-full mx-auto"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img src={directoryHero} alt="" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/90 via-zinc-950/70 to-zinc-950/90" />
          </div>

          <div className="relative z-10">
            <div className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center mx-auto mb-6">
              <img src={successGif} alt="Success" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-pixel text-xl md:text-2xl text-white mb-4 uppercase drop-shadow-lg">Payment Successful!</h1>
            <p className="text-zinc-300 font-headline text-xs md:text-sm mb-8 max-w-md mx-auto drop-shadow-md leading-relaxed">
              Your server has been successfully sponsored! It is now featured in the Sponsors section at the top of the directory page. Thank you for your support!
            </p>
            <button 
              onClick={() => setIsSuccess(false)}
              className="bg-realm-green text-zinc-950 px-6 md:px-8 py-3 rounded-lg font-headline font-bold text-[10px] md:text-sm uppercase tracking-widest hover:bg-realm-green/80 transition-all shadow-xl"
            >
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </AnimatedPage>
    )
  }

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {deleteId && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteId(null)}
                className={`absolute inset-0 bg-black/80 ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'}`}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-[320px] bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-2xl"
              >
                <div className="text-center mb-4">
                  <div className="text-red-500 mb-2 opacity-80">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </div>
                  <h3 className="text-base font-pixel text-white mb-1 uppercase tracking-wide">Delete Listing?</h3>
                  <p className="text-zinc-500 font-headline text-[10px] leading-relaxed">
                    Permanently remove <span className="text-zinc-300 font-bold">"{deleteName}"</span>?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setDeleteId(null)}
                    className="py-2.5 rounded-xl bg-zinc-800 text-white font-headline font-bold text-[10px] hover:bg-zinc-700 transition-colors uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="py-2.5 rounded-xl bg-red-500 text-white font-headline font-bold text-[10px] hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 uppercase tracking-widest"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <RoleSelectionModal 
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSelect={(role) => {
          setIsRoleModalOpen(false)
          navigate(`/submit?role=${role}`)
        }}
      />

      <ProjectSelectionModal 
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />

      <AppealModal
        isOpen={!!appealServerId}
        onClose={() => setAppealServerId(null)}
        onSubmit={handleAppealSubmit}
        isSubmitting={submitAppealMutation.isPending}
        serverName={appealServerName}
      />

      <AnimatedPage className="w-full max-w-7xl mx-auto px-8 py-12">
        <FramerIn delay={0.1} className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex gap-4 border-b border-zinc-800 w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('servers')}
              className={`font-headline font-bold text-sm md:text-base pb-3 px-2 transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'servers' ? 'border-realm-green text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              <ServerIcon className="w-4 h-4 md:w-5 md:h-5" />
              Servers
            </button>
            <button 
              onClick={() => setActiveTab('projects')}
              className={`font-headline font-bold text-sm md:text-base pb-3 px-2 transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'projects' ? 'border-blue-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              <Folder className="w-4 h-4 md:w-5 md:h-5" />
              Projects
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={`font-headline font-bold text-sm md:text-base pb-3 px-2 transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'saved' ? 'border-orange-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              <Bookmark className="w-4 h-4 md:w-5 md:h-5" />
              Saved
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-shrink-0">
              <button 
                onClick={() => setIsProjectModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-headline font-bold transition-all text-xs md:text-sm bg-blue-500 text-white hover:bg-blue-400"
              >
                <PlusCircle className="w-4 h-4 md:w-5 h-5" />
                New Project
              </button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-shrink-0 relative group/limit">
              <button 
                onClick={() => {
                  if (hasReachedLimit) {
                    if (!hasPremiumPerks) {
                      toast.info('Explorer+ Feature', {
                        description: 'Upgrade to Explorer+ to list up to 5 servers!'
                      })
                    } else {
                      toast.warning('Limit Reached', {
                        description: `You have reached the maximum limit of ${limit} listings.`
                      })
                    }
                  } else {
                    setIsRoleModalOpen(true)
                  }
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-headline font-bold transition-all text-xs md:text-sm ${
                  hasReachedLimit 
                    ? 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600' 
                    : 'bg-[#4EC44E] text-[#002202] hover:bg-[#85fc7e]'
                }`}
              >
                <PlusCircle className="w-4 h-4 md:w-5 h-5" />
                New Listing ({servers.length}/{limit})
              </button>
            </motion.div>
          </div>
        </FramerIn>


      {activeTab === 'servers' && (
        <>
      {servers.length === 0 ? (
        <FramerIn delay={0.4}>
          <EmptyState 
            title="No Listings Found" 
            message="You haven't submitted any servers or realms yet. Click 'New Listing' to get started." 
          />
        </FramerIn>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
                delayChildren: 0.4
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 will-change-transform"
        >
          {servers.map(server => {
            const isSponsored = server.is_sponsored && server.sponsored_until && new Date(server.sponsored_until) > new Date();
            const hasPendingAppeal = appeals.some((a: any) => a.server_id === server.id && a.status === 'pending');
            const cardProps = {
              server,
              showStatus: true,
              showRole: false,
              hideVotes: true,
              hideRatings: true,
              actions: (
                <div className="flex items-center gap-2 w-full">
                  {server.status === 'rejected' ? (
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (hasPendingAppeal) return
                        setAppealServerId(server.id)
                        setAppealServerName(server.name)
                      }}
                      disabled={hasPendingAppeal}
                      className={`text-[10px] md:text-xs font-bold px-3 md:px-4 py-2 rounded-md transition-colors border flex items-center justify-center gap-2 ${
                        hasPendingAppeal 
                          ? 'text-zinc-500 bg-zinc-800/50 border-zinc-700/50 cursor-not-allowed'
                          : 'text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20'
                      }`}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {hasPendingAppeal ? 'Appealed' : 'Appeal'}
                    </button>
                  ) : null}
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      navigate(`/submit/${server.id}`)
                    }}
                    className="text-[10px] md:text-xs font-bold text-blue-400 hover:text-blue-300 px-3 md:px-4 py-2 bg-blue-500/10 rounded-md transition-colors border border-blue-500/20 flex-1 flex items-center justify-center gap-2 hover:bg-blue-500/20"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit Server
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDeleteClick(server.id, server.name)
                    }}
                    className="p-2 text-red-500 hover:text-red-400 bg-red-500/10 rounded-md transition-colors border border-red-500/20 flex items-center justify-center hover:bg-red-500/20"
                    title="Delete Listing"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            };

            return (
              <motion.div 
                key={server.id} 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="relative group"
              >
                {isSponsored ? (
                  <SponsorServerCard {...cardProps} />
                ) : (
                  <ServerCard {...cardProps} />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
      </>
      )}

      {activeTab === 'projects' && (
        <>
        {projects.length === 0 ? (
          <FramerIn delay={0.4}>
            <EmptyState 
              title="No Projects Found" 
              message="You haven't submitted any projects yet. Click 'New Project' to get started." 
            />
          </FramerIn>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.4 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 will-change-transform"
          >
            {projects.map((project: any) => (
              <motion.div key={project.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="relative">
                <ProjectCard
                  project={project}
                  showStatus={true}
                  actions={
                    <div className="flex items-center gap-2 w-full">
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          navigate(`/submit/project?id=${project.id}`)
                        }}
                        className="text-[10px] md:text-xs font-bold text-blue-400 hover:text-blue-300 px-3 py-1.5 md:py-2 bg-blue-500/10 rounded-md border border-blue-500/20 flex-1 flex items-center justify-center gap-2 transition-colors hover:bg-blue-500/20"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit Project
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDeleteClick(project.id, project.name, 'project')
                        }}
                        className="p-1.5 md:p-2 text-red-500 hover:text-red-400 bg-red-500/10 rounded-md transition-colors border border-red-500/20 flex items-center justify-center hover:bg-red-500/20"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </div>
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        )}
        </>
      )}

      {activeTab === 'saved' && (
        <>
        {savedProjects.length === 0 && savedServers.length === 0 ? (
          <FramerIn delay={0.4}>
            <EmptyState 
              title="No Saved Items" 
              message="You haven't saved any servers or projects yet. Browse the directory and click the save icon to add items here." 
            />
          </FramerIn>
        ) : (
          <div className="space-y-4">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 will-change-transform"
            >
              {[
                ...savedServers.map((s: any) => ({ ...s, _isServer: true })),
                ...savedProjects.map((p: any) => ({ ...p, _isProject: true }))
              ].map((item: any) => (
                <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="relative">
                  <ProjectCard 
                    project={item} 
                    showStatus={false}
                    accentColor="orange"
                    actions={
                      <div className="flex items-center gap-2 w-full justify-end">
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (item._isServer) {
                              handleUnsaveServer(item.id)
                            } else {
                              handleUnsave(item.id)
                            }
                          }}
                          className="text-[10px] md:text-xs font-bold text-orange-400 hover:text-orange-300 px-3 py-1.5 md:py-2 bg-orange-500/10 rounded-md border border-orange-500/20 flex items-center justify-center gap-2 transition-colors hover:bg-orange-500/20"
                          title={`Unsave ${item._isServer ? 'Server' : 'Project'}`}
                        >
                          <BookmarkMinus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          Unsave
                        </button>
                      </div>
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
        </>
      )}

      {/* Your Sponsors Section */}
      {activeTab === 'servers' && (() => {
        const sponsoredServers = servers.filter(s => s.is_sponsored && s.sponsored_until && new Date(s.sponsored_until) > new Date())
        if (sponsoredServers.length === 0) return null

        return (
          <div className="mt-12 border-t border-zinc-800 pt-10">
            <FramerIn delay={0.5}>
              <div className="mb-6 flex items-center gap-3">
                <img src={diamondIcon} alt="" className="w-6 h-6 object-contain" />
                <h2 className="font-pixel text-xs md:text-sm text-white uppercase">Your Sponsors</h2>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              <div className="space-y-4">
                {sponsoredServers.map(server => (
                  <SponsorSettingsItem key={server.id} server={server} onRefetch={refetch} />
                ))}
              </div>
            </FramerIn>
          </div>
        )
      })()}

      {/* Sponsor Section */}
      {activeTab === 'servers' && (
      <div id="sponsor-section" className="mt-16 border-t border-zinc-800 pt-16 max-w-4xl mx-auto">
        <FramerIn delay={0.6}>
          <div className="text-center mb-10">
            <h2 className="font-pixel text-lg md:text-xl text-white uppercase mb-3 flex items-center justify-center gap-3">
              <img src={diamondIcon} alt="" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
              Sponsor Your Server
            </h2>
            <p className="text-zinc-500 font-headline text-xs md:text-sm">
              Pin your server/realm to the Sponsors section at the top of the directory page for maximum visibility.
            </p>
          </div>

          <div className="bg-[#313233] border-4 border-[#101010] p-6 md:p-8 shadow-[8px_8px_0_rgba(0,0,0,0.5)] relative overflow-hidden group">
            {/* Inner Highlight Borders */}
            <div className="absolute inset-0 border-t-4 border-l-4 border-white/10 pointer-events-none" />
            <div className="absolute inset-0 border-b-4 border-r-4 border-black/40 pointer-events-none" />
            
            {/* Background Image overlay */}
            <img src={snowBlocksBg} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none" alt="" />
            
            {/* Background Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/40 via-transparent to-zinc-950/40 pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-block bg-[#5ce1e6] text-zinc-950 px-3 py-1 border-2 border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.3)] font-headline font-black text-[10px] uppercase tracking-tighter mb-4">
                  Boost Exposure
                </div>
                <h3 className="font-pixel text-md text-white uppercase mb-2 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
                  30-Day Sponsorship Slot
                </h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-pixel text-[#5ce1e6] drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
                    {hasPremiumPerks ? '$6.99' : '$9.99'}
                  </span>
                  {!hasPremiumPerks && (
                    <span className="text-zinc-500 font-headline text-xs line-through">$14.99</span>
                  )}
                  {hasPremiumPerks && (
                    <span className="text-[#5ce1e6] font-headline text-xs px-2 py-0.5 bg-[#5ce1e6]/10 rounded border border-[#5ce1e6]/20">30% OFF</span>
                  )}
                  <span className="text-zinc-500 font-headline text-xs">/ 30 days</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-zinc-300 font-headline text-xs">
                    <Check className="w-4 h-4 text-realm-green" />
                    Featured in top Sponsors section
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300 font-headline text-xs">
                    <Check className="w-4 h-4 text-realm-green" />
                    Dynamic display to all visitors
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300 font-headline text-xs">
                    <Check className="w-4 h-4 text-realm-green" />
                    Extend or renew at any time
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300 font-headline text-xs">
                    <img src={heartIcon} alt="" className="w-4 h-4 object-contain" />
                    Supporting the platform wholeheartedly
                  </div>
                </div>
              </div>

              {/* Selector and PayPal integration */}
              <div className="bg-zinc-950/40 border-2 border-[#101010] p-5 relative rounded-lg flex flex-col justify-center">
                <div className="absolute inset-0 border-t border-l border-white/5 pointer-events-none" />
                
                {approvedServers.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-zinc-400 font-headline text-xs mb-2">
                      You don't have any approved server listings yet.
                    </p>
                    <p className="text-zinc-600 font-headline text-[10px] uppercase">
                      Submit and get a listing approved first!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-zinc-400 font-pixel text-[8px] uppercase tracking-wider mb-2">
                        Select Server to Sponsor:
                      </label>
                      <select 
                        value={selectedSponsorServerId}
                        onChange={(e) => setSelectedSponsorServerId(e.target.value)}
                        className="w-full bg-zinc-900 border-2 border-[#101010] px-3 py-2 text-white font-headline text-xs focus:border-amber-400/50 outline-none transition-all rounded"
                      >
                        <option value="" disabled>-- Choose a Listing --</option>
                        {approvedServers.map(s => {
                          const isCurrentlySponsored = s.is_sponsored && s.sponsored_until && new Date(s.sponsored_until) > new Date();
                          const sponsorLabel = isCurrentlySponsored 
                            ? ` (Sponsor active until ${new Date(s.sponsored_until!).toLocaleDateString()})`
                            : '';
                          return (
                            <option key={s.id} value={s.id}>
                              {s.name}{sponsorLabel}
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    {selectedSponsorServerId && (
                      <div className="relative mt-4">
                        {isSponsorProcessing && (
                          <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded">
                            <LoadingSpinner />
                            <p className="text-white font-pixel text-[8px] uppercase mt-4 animate-pulse">Processing Payment...</p>
                          </div>
                        )}
                        <div className="border-4 border-[#101010] p-1 bg-white/5 rounded">
                          <PayPalScriptProvider options={{ 
                            clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb",
                            currency: "USD",
                            intent: "capture"
                          }}>
                            <PayPalButtons 
                              style={{ 
                                layout: "vertical",
                                color: "gold",
                                shape: "rect",
                                label: "pay"
                              }}
                              onError={(err) => {
                                console.error("PayPal Sponsoring Error:", err);
                                toast.error("PayPal Error");
                              }}
                              disabled={isSponsorProcessing}
                              createOrder={async (_data, actions) => {
                                return actions.order.create({
                                  intent: "CAPTURE",
                                  purchase_units: [{
                                    amount: {
                                      currency_code: "USD",
                                      value: hasPremiumPerks ? "6.99" : "9.99"
                                    },
                                    description: `Sponsoring for server ${selectedSponsorServerId}`
                                  }]
                                });
                              }}
                              onApprove={async (data) => {
                                setIsSponsorProcessing(true);
                                try {
                                  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paypal-checkout`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                                    },
                                    body: JSON.stringify({
                                      orderId: data.orderID,
                                      userId: user?.id,
                                      serverId: selectedSponsorServerId
                                    })
                                  });

                                  const result = await response.json();
                                  
                                  if (result.success) {
                                    toast.success('Server Sponsored!', {
                                      description: 'Your server is now successfully sponsored for 30 days.'
                                    });
                                    setSelectedSponsorServerId('');
                                    setIsSuccess(true);
                                    refetch();
                                  } else {
                                    throw new Error(result.error || 'Failed to sponsor server');
                                  }
                                } catch (err: any) {
                                  console.error("PayPal Capture Error", err);
                                  toast.error(err.message || "Payment verification failed.");
                                } finally {
                                  setIsSponsorProcessing(false);
                                }
                              }}
                            />
                          </PayPalScriptProvider>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </FramerIn>
      </div>
      )}
    </AnimatedPage>
    </>
  )
}
