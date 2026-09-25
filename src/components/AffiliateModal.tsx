import { motion, AnimatePresence } from 'framer-motion'
import { X, Globe } from 'lucide-react'
import { SiDiscord } from 'react-icons/si'
import { createPortal } from 'react-dom'

interface AffiliateModalProps {
  isOpen: boolean
  onClose: () => void
  affiliateName: string
  websiteUrl: string
  discordUrl: string
  logoUrl?: string
}

export function AffiliateModal({
  isOpen,
  onClose,
  affiliateName,
  websiteUrl,
  discordUrl,
  logoUrl
}: AffiliateModalProps) {
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 transform-gpu" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden bg-zinc-950 border border-white/10 rounded-lg shadow-xl p-6 md:p-8"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                {logoUrl && (
                  <div className="w-10 h-10 flex-shrink-0">
                    <img src={logoUrl} alt={affiliateName} className="w-full h-full object-contain" />
                  </div>
                )}
                <h2 className="text-xl font-pixel text-white leading-tight pr-4 pt-1">
                  {affiliateName}
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="flex items-center justify-center transition-all w-8 h-8 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-white/60 font-headline text-xs leading-relaxed mb-8">
              Where would you like to go? You can visit their main website or join their Discord community directly.
            </p>

            <div className="flex flex-col gap-3">
              <a
                href={websiteUrl}
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
                className="flex items-center justify-center gap-3 w-full py-3.5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-headline font-bold text-xs uppercase tracking-widest transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              >
                <Globe className="w-4 h-4" />
                Website
              </a>
              <a
                href={discordUrl}
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
                className="flex items-center justify-center gap-3 w-full py-3.5 px-6 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/20 rounded-lg text-[#5865F2] font-headline font-bold text-xs uppercase tracking-widest transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              >
                <SiDiscord className="w-4 h-4" />
                Discord
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
  
  return document.getElementById('modal-root') ? createPortal(modalContent, document.getElementById('modal-root')!) : null
}
