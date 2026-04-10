import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUserServers } from '../hooks/queries'
import { useDeleteServerMutation } from '../hooks/mutations'
import { LoadingSpinner, EmptyState } from '../components/FeedbackStates'
import { ServerCard } from '../components/ServerCard'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion, AnimatePresence } from 'framer-motion'

export function DashboardPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  
  const { data: servers = [], isLoading: loading } = useUserServers(user?.id)
  const deleteMutation = useDeleteServerMutation()
  
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')

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
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4 md:gap-6">
        <FramerIn className="flex items-center gap-4 md:gap-6">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-12 h-12 md:w-16 md:h-16 bg-zinc-800 rounded-xl md:rounded-2xl overflow-hidden border border-zinc-700 shadow-xl"
          >
             <img src={profile?.discord_avatar || ''} alt="avatar" className="w-full h-full object-cover" />
          </motion.div>
          <div>
            <h1 className="text-xl md:text-3xl font-pixel text-white mb-1 md:mb-2 text-wrap">Welcome, {profile?.discord_username}</h1>
            <p className="text-zinc-500 font-headline uppercase tracking-widest text-[9px] md:text-xs">
              Role: <span className="text-realm-green">{profile?.role}</span>
            </p>
          </div>
        </FramerIn>
        
        <FramerIn delay={0.2} className="self-end md:self-auto">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              to="/submit" 
              className="flex items-center gap-2 bg-[#4EC44E] text-[#002202] px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-headline font-bold hover:bg-[#85fc7e] transition-colors shadow-lg shadow-green-500/20 text-xs md:text-sm"
            >
              <PlusCircle className="w-4 h-4 md:w-5 md:h-5" />
              New Listing
            </Link>
          </motion.div>
        </FramerIn>
      </div>

      <FramerIn delay={0.3} className="mb-8">
        <h2 className="font-pixel text-xl text-white mb-4">Your Listings</h2>
        <div className="h-px w-full bg-zinc-800"></div>
      </FramerIn>

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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
                hideVotes={true}
                actions={
                  <div className="flex flex-col gap-1.5">
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        navigate(`/submit/${server.id}`)
                      }}
                      className="text-[11px] md:text-sm font-bold text-blue-400 hover:text-blue-300 px-4 py-2 bg-blue-500/10 rounded-lg transition-colors border border-blue-500/20 text-center min-w-[100px] flex items-center justify-center gap-2"
                    >
                      <Pencil className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      EDIT
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteClick(server.id, server.name)
                      }}
                      className="text-[11px] md:text-sm font-bold text-red-500 hover:text-red-400 px-4 py-2 bg-red-500/10 rounded-lg transition-colors border border-red-500/20 text-center min-w-[100px] flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      DELETE
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
