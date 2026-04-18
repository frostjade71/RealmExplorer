import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'
import { useIsMobile } from '../hooks/useMediaQuery'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'modern' | 'pixel'
  isDangerous?: boolean
  isLoading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'modern',
  isDangerous = false,
  isLoading = false
}: ConfirmationModalProps) {
  const isPixel = variant === 'pixel'
  const isMobile = useIsMobile()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 ${isMobile ? 'backdrop-blur-none' : 'backdrop-blur-sm'} transform-gpu`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`relative w-full max-w-sm overflow-hidden ${
              isPixel 
                ? 'bg-[#313233] border-4 border-[#101010] shadow-[8px_8px_0_rgba(0,0,0,0.5)] rounded-none' 
                : 'bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl'
            }`}
          >
            {/* Pixel Variant Bevels */}
            {isPixel && (
              <>
                <div className="absolute inset-0 border-t-2 border-l-2 border-white/10 pointer-events-none" />
                <div className="absolute inset-0 border-b-2 border-r-2 border-black/40 pointer-events-none" />
              </>
            )}

            <div className={`${isPixel ? 'p-6 md:p-8' : 'p-8'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`flex items-center justify-center border ${
                  isPixel
                    ? `w-10 h-10 border-2 border-[#101010] shadow-[2px_2px_0_rgba(0,0,0,0.3)] ${isDangerous ? 'bg-red-500 text-white' : 'bg-realm-green text-zinc-950'}`
                    : `w-12 h-12 rounded-2xl ${isDangerous ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-realm-green/10 border-realm-green/20 text-realm-green'}`
                }`}>
                  <AlertCircle className={isPixel ? 'w-5 h-5' : 'w-6 h-6'} />
                </div>
                <button 
                  onClick={onClose}
                  className={`flex items-center justify-center transition-all ${
                    isPixel
                      ? 'w-8 h-8 bg-black/20 border-2 border-[#101010] text-white/40 hover:text-white hover:bg-black/40'
                      : 'w-10 h-10 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white'
                  }`}
                >
                  <X className={isPixel ? 'w-4 h-4' : 'w-5 h-5'} />
                </button>
              </div>

              <h2 className={`mb-2 ${
                isPixel 
                  ? 'font-pixel text-white text-lg uppercase tracking-wider' 
                  : 'text-xl font-pixel text-white'
              }`}>
                {title}
              </h2>
              <p className={`leading-relaxed mb-8 ${
                isPixel 
                  ? 'font-headline text-white/70 text-[10px] md:text-xs tracking-wide' 
                  : 'text-white/40 font-headline text-xs'
              }`}>
                {message}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className={`flex-1 font-headline font-bold uppercase tracking-widest transition-all ${
                    isPixel
                      ? 'py-2 px-4 bg-white/5 border-2 border-[#101010] text-white/40 hover:text-white hover:bg-white/10 text-[9px] shadow-[2px_2px_0_rgba(0,0,0,0.4)]'
                      : 'py-3 px-6 rounded-xl text-white/40 hover:text-white hover:bg-white/5 text-[10px] border border-transparent hover:border-white/10'
                  }`}
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-[1.5] font-headline font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-widest ${
                    isPixel
                      ? `py-2 px-4 border-2 border-[#101010] text-[9px] shadow-[2px_2px_0_rgba(0,0,0,0.4)] ${isDangerous ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-realm-green text-zinc-950 hover:bg-[#85fc7e]'}`
                      : `py-3 px-6 rounded-xl text-[10px] shadow-xl ${isDangerous ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20' : 'bg-realm-green text-zinc-950 hover:bg-[#85fc7e] shadow-realm-green/20'}`
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-current/20 border-t-current rounded-full animate-spin" />
                  ) : (
                    confirmLabel
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

  )
}
