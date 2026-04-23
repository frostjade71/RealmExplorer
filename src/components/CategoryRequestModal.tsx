import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, PlusCircle } from 'lucide-react'

interface CategoryRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (subject: string, description: string) => void
  isSubmitting?: boolean
}

import { createPortal } from 'react-dom'

export function CategoryRequestModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting 
}: CategoryRequestModalProps) {
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) return
    onSubmit(subject, description)
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
            className="relative bg-zinc-950 border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-realm-green/10 text-realm-green">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h2 className="font-pixel text-white text-base md:text-lg uppercase tracking-wider">Request Category</h2>
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
                  <label className="text-white/40 font-headline text-[10px] uppercase tracking-[0.2em] font-bold block ml-1">Category Name (Subject)</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Prison, Skywars, Survival..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white font-headline text-sm focus:outline-none focus:ring-2 focus:ring-realm-green/50 focus:border-realm-green/50 placeholder:text-white/20 transition-all shadow-inner"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white/40 font-headline text-[10px] uppercase tracking-[0.2em] font-bold block ml-1">What does this category do?</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the gameplay and features of this category..."
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-5 text-white font-body text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-realm-green/50 focus:border-realm-green/50 placeholder:text-white/20 resize-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-realm-green/5 border border-realm-green/10 rounded-xl text-realm-green/70">
                <PlusCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-[11px] font-headline leading-relaxed">
                  <span className="font-bold uppercase tracking-wider block mb-0.5 text-[10px]">Community Suggestion</span>
                  Requested categories are reviewed by staff and added if they provide value to the community.
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
                  disabled={!subject.trim() || !description.trim() || isSubmitting}
                  className={`flex-[2] py-4 rounded-xl font-headline font-bold flex items-center justify-center gap-3 transition-all text-[10px] uppercase tracking-widest ${
                    !subject.trim() || !description.trim() || isSubmitting
                      ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5'
                      : 'bg-realm-green text-zinc-950 hover:bg-[#85fc7e] shadow-lg shadow-green-500/20'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-current/20 border-t-current rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Request
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
