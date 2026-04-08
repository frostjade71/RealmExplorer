import { useAdminServers } from '../hooks/queries'
import { useUpdateServerStatusMutation, useSendMessageMutation } from '../hooks/mutations'
import type { ServerStatus, Server } from '../types'
import { LoadingSpinner } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ContactOwnerModal } from '../components/ContactOwnerModal'
import { useAuth } from '../contexts/AuthContext'

export function AdminServersPage() {
  const { profile } = useAuth()
  const { data: servers = [], isLoading: loading } = useAdminServers()
  const updateMutation = useUpdateServerStatusMutation()
  const sendMessageMutation = useSendMessageMutation()

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean
    server: Server | null
    type: 'contact' | 'rejection'
  }>({
    isOpen: false,
    server: null,
    type: 'contact'
  })

  const handleUpdateStatus = (id: string, newStatus: ServerStatus) => {
    updateMutation.mutate({ id, status: newStatus })
  }

  const openContactModal = (server: Server, type: 'contact' | 'rejection') => {
    setModalConfig({
      isOpen: true,
      server,
      type
    })
  }

  const handleModalSubmit = async (subject: string, message: string) => {
    if (!modalConfig.server || !profile) return

    try {
      // 1. Send the message
      await sendMessageMutation.mutateAsync({
        serverId: modalConfig.server.id,
        senderId: profile.id,
        subject,
        message,
        type: modalConfig.type
      })

      // 2. If it's a rejection, update the status
      if (modalConfig.type === 'rejection') {
        handleUpdateStatus(modalConfig.server.id, 'rejected')
      }

      setModalConfig({ ...modalConfig, isOpen: false })
    } catch (error) {
      console.error('Failed to process admin action:', error)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <AnimatedPage>
      <div className="mb-10 flex items-end justify-between">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-realm-green text-sm">storage</span>
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold text-sm">Staff Only</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">Manage Servers</h1>
          <p className="text-white/40 font-headline text-sm">Review and moderate user submissions for the community.</p>
        </FramerIn>
        
        <FramerIn delay={0.1}>
          <div className="flex items-center gap-6 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl backdrop-blur-md">
            <div className="text-center">
              <div className="text-realm-green font-pixel text-xl">
                {servers.filter(s => ['pending', 'Review Icon', 'Review Cover', 'Review Icon & Cover'].includes(s.status)).length}
              </div>
              <div className="text-[10px] font-headline text-white/40 uppercase font-bold tracking-widest">To Review</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-blue-400 font-pixel text-xl">{servers.filter(s => s.status === 'emailed').length}</div>
              <div className="text-[10px] font-headline text-white/40 uppercase font-bold tracking-widest">Emailed</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-white font-pixel text-xl">{servers.length}</div>
              <div className="text-[10px] font-headline text-white/40 uppercase font-bold tracking-widest">Total</div>
            </div>
          </div>
        </FramerIn>
      </div>

      <FramerIn delay={0.2} className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-headline text-sm border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/5 text-white/30 uppercase tracking-[0.2em] text-[10px] font-bold">
                <th className="px-6 py-5">Server Details</th>
                <th className="px-6 py-5">Type</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <motion.tbody 
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
              {servers.map(server => (
                <motion.tr 
                  key={server.id} 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="font-bold text-white group-hover:text-realm-green transition-colors">{server.name}</div>
                    <div className="text-xs text-white/40 font-mono mt-0.5">{server.ip_or_code}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 border border-white/10 px-2 py-0.5 rounded-md bg-white/5">
                      {server.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-white/60 font-medium">
                    {server.category}
                  </td>
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      server.status === 'approved' ? 'bg-realm-green/10 text-realm-green border border-realm-green/20' :
                      server.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      server.status === 'emailed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse' :
                      server.status.startsWith('Review') ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 animate-pulse' :
                      'bg-orange-500/10 text-orange-500 border border-orange-500/20 animate-pulse'
                    }`}>
                      <span className="w-1 h-1 rounded-full bg-current" />
                      {server.status}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {server.status !== 'approved' && (
                        <button 
                          onClick={() => handleUpdateStatus(server.id, 'approved')}
                          className="w-10 h-10 rounded-xl bg-realm-green/10 text-realm-green hover:bg-realm-green hover:text-zinc-950 flex items-center justify-center transition-all duration-300 border border-realm-green/20 group/btn"
                          title="Approve"
                        >
                          <span className="material-symbols-outlined text-[20px] group-hover/btn:scale-110 transition-transform">check</span>
                        </button>
                      )}
                      {server.status !== 'rejected' && (
                        <button 
                          onClick={() => openContactModal(server, 'rejection')}
                          className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-300 border border-red-500/20 group/btn"
                          title="Reject"
                        >
                          <span className="material-symbols-outlined text-[20px] group-hover/btn:scale-110 transition-transform">close</span>
                        </button>
                      )}
                      <button 
                        onClick={() => openContactModal(server, 'contact')}
                        className="w-10 h-10 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all duration-300 border border-white/10 group/btn"
                        title="Contact Owner"
                      >
                        <span className="material-symbols-outlined text-[20px] group-hover/btn:scale-110 transition-transform">mail</span>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {servers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/20 italic font-headline">No servers found in the database.</td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </FramerIn>

      <ContactOwnerModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onSubmit={handleModalSubmit}
        isSubmitting={sendMessageMutation.isPending || updateMutation.isPending}
        title={modalConfig.type === 'rejection' ? 'Reject Server Listing' : 'Contact Owner'}
        submitLabel={modalConfig.type === 'rejection' ? 'Reject & Send' : 'Send Message'}
        type={modalConfig.type}
      />
    </AnimatedPage>
  )
}

