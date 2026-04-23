import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, AlertTriangle, Flag } from 'lucide-react'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (subject: string, message: string) => void
  isSubmitting?: boolean
}

const REPORT_SUBJECTS = [
  'Inappropriate Content',
  'Fake Listing Information',
  'Broken Link / Connection Issue',
  'Scam or Phishing',
  'Other'
]

export function ReportModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting 
}: ReportModalProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !message) return
    onSubmit(subject, message)
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-zinc-950 border border-white/10 w-full max-w-md rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                   <Flag className="w-5 h-5" />
                </div>
                <h2 className="font-pixel text-white text-base md:text-lg uppercase tracking-wider">Report Server</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-white/20 hover:text-white transition-colors p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto scrollbar-none">
              {/* Info Box */}
              <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-[11px] text-red-200/40 leading-relaxed italic">
                  Abuse of the reporting system may lead to an account ban. Please only report listings that violate our community guidelines.
                </p>
              </div>

              {/* Subject Dropdown */}
              <div className="space-y-2">
                <label className="text-white/40 font-headline text-[10px] uppercase tracking-widest block font-bold transition-colors">
                  Subject (Report Type)
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled className="bg-zinc-900">Select a reason...</option>
                  {REPORT_SUBJECTS.map((s) => (
                    <option key={s} value={s} className="bg-zinc-900">{s}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-white/40 font-headline text-[10px] uppercase tracking-widest block font-bold">
                  Description
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Why do you want to report this server? Please provide details..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 placeholder:text-white/10 resize-none transition-all"
                  required
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={!subject || !message || isSubmitting}
                className={`w-full py-4 rounded-xl font-headline font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-[10px] ${
                  !subject || !message || isSubmitting
                    ? 'bg-zinc-900 text-white/20 cursor-not-allowed border border-white/5'
                    : 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Submit Report
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

