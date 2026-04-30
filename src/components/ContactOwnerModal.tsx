import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, AlertTriangle, Mail } from 'lucide-react'

interface ContactOwnerModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (subject: string, message: string) => void
  isSubmitting?: boolean
  title?: string
  submitLabel?: string
  type?: 'contact' | 'rejection'
}

import { createPortal } from 'react-dom'

export function ContactOwnerModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting,
  title = 'Contact Owner',
  submitLabel = 'Send Message',
  type = 'contact'
}: ContactOwnerModalProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    onSubmit(subject, message)
  }

  // Pre-fill subject if it's a rejection
  useState(() => {
    if (type === 'rejection' && !subject) {
      setSubject('Server Listing Rejected')
    }
  })

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
                <div className={`p-2 rounded-xl ${type === 'rejection' ? 'bg-red-500/10 text-red-500' : 'bg-realm-green/10 text-realm-green'}`}>
                  {type === 'rejection' ? <AlertTriangle className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                </div>
                <h2 className="font-pixel text-white text-base md:text-lg uppercase tracking-wider">{title}</h2>
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
                <div className="space-y-2">
                  <label className="text-white/40 font-headline text-[10px] uppercase tracking-[0.2em] font-bold block ml-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of the message..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white font-headline text-sm focus:outline-none focus:ring-2 focus:ring-realm-green/50 focus:border-realm-green/50 placeholder:text-white/20 transition-all shadow-inner"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white/40 font-headline text-[10px] uppercase tracking-[0.2em] font-bold block ml-1">Message Detail</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={type === 'rejection' ? "Explain why the server was rejected..." : "Type your message to the owner here..."}
                    className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-5 text-white font-body text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-realm-green/50 focus:border-realm-green/50 placeholder:text-white/20 resize-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className={`flex items-start gap-3 p-4 rounded-xl ${
                type === 'rejection' 
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                  : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
              }`}>
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs font-headline leading-relaxed">
                  <span className="font-bold uppercase tracking-wider block mb-0.5 text-[10px]">
                    {type === 'rejection' ? 'Rejection Notice' : 'Direct Message'}
                  </span>
                  {type === 'rejection' 
                    ? 'This message will be sent to the owner\'s Discord DMs. The server will be pulled from the directory until the issue is resolved.'
                    : 'This message will be sent directly to the owner\'s Discord DMs via the Realm Explorer bot.'}
                </p>
              </div>
            </form>

            <div className="p-6 bg-black/20 border-t border-white/5 shrink-0">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-xl font-headline font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all text-[10px] uppercase tracking-widest"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    const form = (e.currentTarget.closest('.relative') as HTMLElement).querySelector('form');
                    if (form) form.requestSubmit();
                  }}
                  disabled={!subject.trim() || !message.trim() || isSubmitting}
                  className={`flex-[2] py-4 rounded-xl font-headline font-bold flex items-center justify-center gap-3 transition-all text-[10px] uppercase tracking-widest ${
                    !subject.trim() || !message.trim() || isSubmitting
                      ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5'
                      : type === 'rejection'
                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
                        : 'bg-realm-green text-zinc-950 hover:bg-[#85fc7e] shadow-lg shadow-green-500/20'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-current/20 border-t-current rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      {submitLabel}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
