import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, AlertCircle } from 'lucide-react'
import { createPortal } from 'react-dom'

interface AppealModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
  isSubmitting?: boolean
  serverName: string
}

export function AppealModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting,
  serverName
}: AppealModalProps) {
  const [reason, setReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return
    onSubmit(reason)
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-zinc-950 border border-white/10 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h2 className="font-pixel text-white text-base md:text-lg uppercase tracking-wider">Appeal Rejection</h2>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto scrollbar-none flex-grow">
              <div className="space-y-4">
                <div className="mb-2">
                  <p className="text-zinc-400 font-headline text-sm">
                    You are submitting an appeal for <strong className="text-white">{serverName}</strong>. Please explain what changes you have made or why you believe your server should be approved.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-white/40 font-headline text-[10px] uppercase tracking-[0.2em] font-bold block ml-1">Appeal Reason</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide details about your appeal..."
                    className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-5 text-white font-body text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-realm-green/50 focus:border-realm-green/50 placeholder:text-white/20 resize-none transition-all shadow-inner"
                    autoFocus
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/5 flex justify-end gap-3 mt-auto shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl font-headline font-bold text-xs uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !reason.trim()}
                  className="px-8 py-3 rounded-xl font-headline font-bold text-xs uppercase tracking-widest bg-blue-500 text-white hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Appeal'}
                  {!isSubmitting && <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
