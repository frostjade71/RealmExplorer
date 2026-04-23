import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X, Send } from 'lucide-react'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, comment: string) => void
  onRemove?: () => void
  isSubmitting?: boolean
  isRemoving?: boolean
  initialRating?: number
  initialComment?: string
}

export function RatingModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onRemove,
  isSubmitting,
  isRemoving,
  initialRating = 0,
  initialComment = ''
}: RatingModalProps) {
  const [rating, setRating] = useState(initialRating)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState(initialComment)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return
    onSubmit(rating, comment)
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
              <h2 className="font-pixel text-white text-base md:text-lg uppercase tracking-wider">
                {initialRating > 0 ? 'Edit Rating' : 'Rate Server'}
              </h2>
              <button 
                onClick={onClose}
                className="text-white/20 hover:text-white transition-colors p-2"
                disabled={isSubmitting || isRemoving}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto scrollbar-none">
              <div className="flex flex-col items-center gap-4 bg-white/5 p-6 rounded-xl border border-white/5">
                <p className="text-white/40 font-headline text-[10px] uppercase tracking-widest font-bold">Select Rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <motion.button
                      key={num}
                      type="button"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRating(num)}
                      onMouseEnter={() => setHoverRating(num)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                      disabled={isSubmitting || isRemoving}
                    >
                      <Star 
                        className={`w-8 h-8 md:w-10 md:h-10 transition-colors ${
                          (hoverRating || rating) >= num 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-zinc-800'
                        }`} 
                      />
                    </motion.button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-yellow-400 font-bold text-xs uppercase tracking-[0.2em] font-pixel mt-1">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Great"}
                    {rating === 5 && "Excellent"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-white/40 font-headline text-[10px] uppercase tracking-widest block font-bold">Your Message</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={isSubmitting || isRemoving}
                  placeholder="Tell others what you think of this server..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-realm-green/50 placeholder:text-white/10 resize-none transition-all disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={rating === 0 || isSubmitting || isRemoving}
                  className={`w-full py-4 rounded-xl font-headline font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-[10px] ${
                    rating === 0 || isSubmitting || isRemoving
                      ? 'bg-zinc-900 text-white/20 cursor-not-allowed border border-white/5'
                      : 'bg-realm-green text-zinc-950 hover:bg-[#85fc7e] shadow-lg shadow-green-500/20'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      {initialRating > 0 ? 'Update Rating' : 'Submit Rating'}
                    </>
                  )}
                </motion.button>

                {initialRating > 0 && onRemove && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={onRemove}
                    disabled={isSubmitting || isRemoving}
                    className="w-full py-4 rounded-xl font-headline font-bold flex items-center justify-center gap-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group uppercase tracking-widest text-[10px]"
                  >
                    {isRemoving ? (
                      <div className="w-5 h-5 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg opacity-60 group-hover:opacity-100 transition-opacity">delete</span>
                        Remove Rating
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

