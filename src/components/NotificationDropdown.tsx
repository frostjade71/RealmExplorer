import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Bell, CheckCheck, Inbox, ExternalLink, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '../hooks/queries'
import { 
  useMarkNotificationReadMutation, 
  useMarkAllNotificationsReadMutation,
  useClearAllNotificationsMutation 
} from '../hooks/mutations'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'

export function NotificationDropdown() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: notifications = [] } = useNotifications(user?.id)
  const markRead = useMarkNotificationReadMutation()
  const markAllRead = useMarkAllNotificationsReadMutation()
  const clearAll = useClearAllNotificationsMutation()
  const [isOpen, setIsOpen] = useState(false)
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => n.is_read === false).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (n: any) => {
    if (!n.is_read) {
      markRead.mutate(n.id)
    }
    
    // Redirect to /events for OTM notifications
    if (n.type === 'otm_podium' || n.type === 'otm_competitor') {
      navigate('/events')
      setIsOpen(false)
    } else if (n.related_id) {
      navigate(`/server/${n.related_id}`)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-realm-green' : 'text-white/60 group-hover:text-white'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-realm-green opacity-75"></span>
             <span className="relative inline-flex rounded-full h-4 w-4 bg-realm-green text-[9px] font-bold text-zinc-950 items-center justify-center">
               {unreadCount > 9 ? '9+' : unreadCount}
             </span>
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60]"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
              <h3 className="text-white font-bold text-sm font-headline">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAllRead.mutate(user!.id)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-realm-green/10 text-realm-green hover:bg-realm-green hover:text-zinc-950 transition-all text-[10px] font-bold"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3 h-3" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button 
                    onClick={() => setIsClearModalOpen(true)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold"
                    title="Clear all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto scrollbar-none">
              {notifications.length > 0 ? (
                <div className="divide-y divide-white/[0.03]">
                  {notifications.slice(0, 20).map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group relative ${!n.is_read ? 'bg-realm-green/[0.02]' : ''}`}
                    >
                      {!n.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-realm-green" />
                      )}
                      <div className="flex gap-3">
                        <div className={`mt-1 p-1.5 rounded-lg h-fit self-start ${
                          n.type === 'approval' ? 'bg-realm-green/10 text-realm-green' :
                          n.type === 'rejection' ? 'bg-red-500/10 text-red-500' :
                          n.type === 'staff_outreach' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-orange-500/10 text-orange-400'
                        }`}>
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className={`text-xs font-bold truncate ${!n.is_read ? 'text-white' : 'text-white/60'}`}>
                              {n.title}
                            </h4>
                            <span className="text-[9px] text-white/20 whitespace-nowrap">
                              {n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true }) : ''}
                            </span>
                          </div>
                          <p className={`text-[11px] leading-relaxed ${!n.is_read ? 'text-white/70 font-medium' : 'text-white/40'}`}>
                            {n.message}
                          </p>
                          {n.related_id && (
                             <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-realm-green/60 uppercase tracking-widest group-hover:text-realm-green transition-colors">
                               View <ExternalLink className="w-2.5 h-2.5" />
                             </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Inbox className="w-6 h-6 text-white/10" />
                  </div>
                  <h4 className="text-white/60 font-bold text-sm">All clear!</h4>
                  <p className="text-white/20 text-xs mt-1">No new notifications at the moment.</p>
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
               <div className="p-3 bg-black/20 border-t border-white/5 text-center">
                  <span className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">End of Notifications</span>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {createPortal(
        <AnimatePresence>
          {isClearModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsClearModalOpen(false)}
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
                  <h3 className="text-lg font-pixel text-white mb-2 uppercase tracking-wide">Clear All?</h3>
                  <p className="text-zinc-500 font-headline text-xs leading-relaxed">
                    Permanently remove all notifications?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setIsClearModalOpen(false)}
                    className="py-3 rounded-xl bg-zinc-800 text-white font-headline font-bold hover:bg-zinc-700 transition-colors text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      clearAll.mutate(user!.id, {
                        onSuccess: () => setIsClearModalOpen(false)
                      })
                    }}
                    disabled={clearAll.isPending}
                    className="py-3 rounded-xl bg-red-500 text-white font-headline font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 text-xs"
                  >
                    {clearAll.isPending ? 'Clearing...' : 'Clear All'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
