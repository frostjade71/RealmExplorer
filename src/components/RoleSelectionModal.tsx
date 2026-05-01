import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import ownerBg from '../assets/role/LETS GOO2.jpg'
import messengerBg from '../assets/role/download (21)23.jpg'

interface RoleSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (role: string) => void
}

export function RoleSelectionModal({ isOpen, onClose, onSelect }: RoleSelectionModalProps) {
  const roles = [
    {
      id: 'Owner',
      title: 'Owner',
      desc: 'Founders, Owners, Admins of the server',
      bg: ownerBg,
      icon: 'crown'
    },
    {
      id: 'Messenger',
      title: 'Messenger',
      desc: 'Moderators, Helpers and Advertising Manager of the server',
      bg: messengerBg,
      icon: 'campaign'
    }
  ]

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center relative z-10 bg-zinc-900">
              <h2 className="font-pixel text-white text-xs md:text-sm uppercase tracking-widest">Select your Role</h2>
              <button 
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[70vh]">
              {roles.map((role) => (
                <button 
                  key={role.id} 
                  onClick={() => onSelect(role.id)}
                  className="relative bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:shadow-2xl transition-all group min-h-[120px] flex flex-col justify-end p-5 text-left"
                >
                  {/* Background Image with Overlay */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={role.bg} 
                      alt="" 
                      className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-all duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
                  </div>

                  <div className="relative z-10 pointer-events-none">
                    <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center mb-3 group-hover:bg-realm-green transition-all duration-300">
                      <span className="material-symbols-outlined text-white text-lg">
                        {role.icon}
                      </span>
                    </div>
                    <h3 className="font-pixel text-[11px] mb-1 text-white drop-shadow-md">{role.title}</h3>
                    <p className="text-zinc-300 text-[10px] leading-relaxed line-clamp-2">{role.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-5 bg-zinc-950 border-t border-zinc-800 text-center">
              <p className="text-zinc-500 font-headline text-[9px] uppercase tracking-widest">
                Choose carefully. This cannot be changed later.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
