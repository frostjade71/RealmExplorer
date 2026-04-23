import { useState } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUserServers } from '../hooks/queries'
import { useDeleteServerMutation } from '../hooks/mutations'
import { LoadingSpinner, EmptyState } from '../components/FeedbackStates'
import { ServerCard } from '../components/ServerCard'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion, AnimatePresence } from 'framer-motion'
import { RoleSelectionModal } from '../components/RoleSelectionModal'


export function DashboardPage() {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const { data: servers = [], isLoading: loading } = useUserServers(user?.id)
  const deleteMutation = useDeleteServerMutation()
  
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteId(id)
    setDeleteName(name)
  }

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId }, {
        onSuccess: () => setDeleteId(null)
      })
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-8 py-12">
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
              className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="text-red-500 mb-3 opacity-80">
                  <span className="material-symbols-outlined text-2xl">delete</span>
                </div>
                <h3 className="text-lg font-pixel text-white mb-2 uppercase tracking-wide">Delete Listing?</h3>
                <p className="text-zinc-500 font-headline text-xs leading-relaxed">
                  Permanently remove <span className="text-zinc-300 font-bold">"{deleteName}"</span>?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="py-3 rounded-xl bg-zinc-800 text-white font-headline font-bold hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="py-3 rounded-xl bg-red-500 text-white font-headline font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <FramerIn delay={0.1} className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="font-pixel text-xs md:text-lg text-white mb-2 uppercase tracking-wide">Your Listings</h1>
          <div className="h-px w-full bg-zinc-800"></div>
        </div>
        
         <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-shrink-0 self-end sm:self-auto">
          <button 
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center gap-2 bg-[#4EC44E] text-[#002202] px-5 py-2.5 rounded-lg font-headline font-bold hover:bg-[#85fc7e] transition-all shadow-lg shadow-green-500/20 text-xs md:text-sm"
          >
            <PlusCircle className="w-4 h-4 md:w-5 h-5" />
            New Listing
          </button>
        </motion.div>
      </FramerIn>

      <RoleSelectionModal 
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSelect={(role) => {
          setIsRoleModalOpen(false)
          navigate(`/submit?role=${role}`)
        }}
      />


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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 will-change-transform"
        >
          {servers.map(server => (
            <motion.div 
              key={server.id} 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="relative group"
            >
              <ServerCard 
                server={server} 
                showStatus={true} 
                showRole={false}
                hideVotes={true}
                hideRatings={true}
                actions={
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        navigate(`/submit/${server.id}`)
                      }}
                      className="text-[10px] md:text-xs font-bold text-blue-400 hover:text-blue-300 px-3 md:px-4 py-2 bg-blue-500/10 rounded-lg transition-colors border border-blue-500/20 flex items-center justify-center gap-2 hover:bg-blue-500/20"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteClick(server.id, server.name)
                      }}
                      className="p-2 text-red-500 hover:text-red-400 bg-red-500/10 rounded-lg transition-colors border border-red-500/20 flex items-center justify-center hover:bg-red-500/20"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                }
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatedPage>
  )
}
