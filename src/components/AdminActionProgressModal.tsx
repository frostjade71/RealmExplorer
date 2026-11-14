import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { LoadingSpinner } from './FeedbackStates'

interface AdminActionProgressModalProps {
  isOpen: boolean
  title: string
  subtitle?: string
  progress: number // 0 to 100
  message: string
  isCompleted?: boolean
  error?: string | null
  onClose?: () => void
}

export function AdminActionProgressModal({
  isOpen,
  title,
  subtitle,
  progress,
  message,
  isCompleted = false,
  error = null,
  onClose
}: AdminActionProgressModalProps) {
  if (typeof document === 'undefined') return null

  const modalRoot = document.getElementById('modal-root') || document.body
  const clampedProgress = Math.min(100, Math.max(0, progress))

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-sm bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <div className="text-center mb-4">
              <h2 className="text-xl font-pixel text-white tracking-wide">
                {title}
              </h2>
              {subtitle && (
                <p className="text-white/50 font-headline text-xs mt-1 truncate max-w-xs mx-auto">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center py-2 mb-4 min-h-[112px]">
              {error ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-2xl">error</span>
                </motion.div>
              ) : isCompleted ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center"
                >
                  <img
                    src="/upgrades/4364-verification-icon.gif"
                    alt="Verified"
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </motion.div>
              ) : (
                <div className="relative flex items-center justify-center">
                  <LoadingSpinner size="md" inline />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-headline">
                <span className="text-white/40 uppercase tracking-widest font-bold">
                  {error ? 'Status' : isCompleted ? 'Completed' : 'Progress'}
                </span>
                <span className={`font-mono font-bold ${
                  error ? 'text-red-400' : isCompleted ? 'text-realm-green' : 'text-white/80'
                }`}>
                  {clampedProgress}%
                </span>
              </div>

              <div className="w-full h-2.5 bg-white/5 border border-white/10 rounded-full p-0.5 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${
                    error ? 'bg-red-500' : 'bg-realm-green'
                  }`}
                  style={{ width: `${Math.max(4, clampedProgress)}%` }}
                />
              </div>

              <div className="pt-2 text-center min-h-[36px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={message || (error ? 'error' : 'progress')}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-center gap-2 text-xs font-headline"
                  >
                    {!isCompleted && !error && (
                      <span className="w-1.5 h-1.5 rounded-full bg-realm-green animate-pulse inline-block flex-shrink-0" />
                    )}
                    <span className={`font-medium ${
                      error ? 'text-red-400 font-semibold' : isCompleted ? 'text-realm-green font-bold' : 'text-white/80'
                    }`}>
                      {error ? error : message}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {error && onClose && (
              <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-headline text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, modalRoot)
}
