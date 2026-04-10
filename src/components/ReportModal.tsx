import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flag, X, Send, AlertTriangle } from 'lucide-react'

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <Flag className="w-4 h-4 text-red-400" />
                </div>
                <h2 className="font-pixel text-white text-lg">Report Server</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Info Box */}
              <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-[11px] text-red-200/60 leading-relaxed italic">
                  Abuse of the reporting system may lead to an account ban. Please only report listings that violate our community guidelines.
                </p>
              </div>

              {/* Subject Dropdown */}
              <div className="space-y-2">
                <label className="text-zinc-400 font-headline text-[10px] uppercase tracking-widest block font-bold transition-colors">
                  Subject (Report Type)
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all appearance-none cursor-pointer"
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
                <label className="text-zinc-400 font-headline text-[10px] uppercase tracking-widest block font-bold">
                  Description
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Why do you want to report this server? Please provide details..."
                  className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 placeholder:text-zinc-600 resize-none transition-all"
                  required
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!subject || !message || isSubmitting}
                className={`w-full py-4 rounded-xl font-headline font-bold flex items-center justify-center gap-2 transition-all ${
                  !subject || !message || isSubmitting
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'
                    : 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Report
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
