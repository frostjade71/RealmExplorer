import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'

export function DevEgressWarning() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLocal, setIsLocal] = useState(false)

  useEffect(() => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    setIsLocal(isLocalhost)
    
    if (isLocalhost) {
      // Show warning after a short delay
      const timer = setTimeout(() => setIsVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!isLocal) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className="fixed bottom-6 left-1/2 z-[9999] w-[90%] max-w-sm"
        >
          <div className="bg-zinc-950 border-2 border-orange-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
            
            <div className="flex-1">
              <h4 className="text-[10px] font-pixel text-white uppercase tracking-wider mb-1">Egress Protection Active</h4>
              <p className="text-[9px] text-zinc-400 font-headline leading-relaxed">
                Working on <span className="text-orange-400 font-bold">localhost</span> affects your production quota. Ensure <span className="text-white font-bold underline">"Disable Cache"</span> is OFF in DevTools to save bandwidth!
              </p>
            </div>

            <button 
              onClick={() => setIsVisible(false)}
              className="text-zinc-600 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
