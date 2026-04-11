import { motion, AnimatePresence } from 'framer-motion'
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto pt-20 pb-10">
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
            className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center relative z-10 bg-zinc-900">
              <h2 className="font-pixel text-white text-base md:text-lg uppercase tracking-widest">What's your Role in This Server?</h2>
              <button 
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => (
                <button 
                  key={role.id} 
                  onClick={() => onSelect(role.id)}
                  className="relative bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:shadow-2xl transition-all group min-h-[160px] flex flex-col justify-end p-6 text-left"
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
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center mb-4 group-hover:bg-realm-green transition-all duration-300">
                      <span className="material-symbols-outlined text-white text-xl">
                        {role.icon}
                      </span>
                    </div>
                    <h3 className="font-pixel text-sm md:text-base mb-1 text-white drop-shadow-md">{role.title}</h3>
                    <p className="text-zinc-300 text-[10px] md:text-[11px] leading-relaxed line-clamp-2">{role.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-6 bg-zinc-950 border-t border-zinc-800 text-center">
              <p className="text-zinc-500 font-headline text-[10px] uppercase tracking-widest">
                Choose carefully. This cannot be changed later.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
