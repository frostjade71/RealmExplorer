import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import cookieImg from '../assets/9598-mc-cookie.png'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 240 }}
          className="fixed bottom-6 right-3 sm:right-6 md:right-8 z-[9999] w-[calc(100%-1.5rem)] max-w-[310px] pointer-events-auto"
        >
          <div className="relative bg-[#313233] border-[3px] border-[#101010] shadow-[5px_5px_0_rgba(0,0,0,0.65)] p-2.5 sm:p-3 flex flex-col gap-2 rounded-none">
            <div className="absolute inset-0 border-t-2 border-l-2 border-white/20 pointer-events-none" />
            <div className="absolute inset-0 border-b-2 border-r-2 border-black/60 pointer-events-none" />

            <div className="relative z-10 flex gap-2.5 items-start">
              <div className="relative shrink-0 w-12 h-12 border-2 border-[#101010] bg-black/60 shadow-inner flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 border-t border-l border-white/10 border-b border-r border-black/60 pointer-events-none z-10" />
                <img
                  src={cookieImg}
                  alt="Cookie"
                  className="w-7 h-7 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                />
              </div>

              <div className="flex-1 min-w-0 pr-5">
                <h3 className="text-white font-pixel text-[10px] sm:text-[11px] uppercase tracking-wider leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  Cookie Policy
                </h3>
                <p className="text-zinc-300 font-headline text-[9px] sm:text-[10px] leading-tight mt-1 drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)]">
                  We use cookies for site traffic and auth sessions. By continuing, you agree to our{' '}
                  <Link to="/privacy" className="text-[#85fc7e] hover:underline font-bold">
                    Privacy Policy
                  </Link>.
                </p>
              </div>

              <button
                onClick={() => setIsVisible(false)}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#212223] hover:bg-[#2c2d2e] border border-[#101010] border-t-white/30 border-l-white/30 border-b-black/80 border-r-black/80 text-white/70 hover:text-white shadow-[1px_1px_0_rgba(0,0,0,0.5)] active:translate-y-0.5 flex items-center justify-center transition-all z-20"
                aria-label="Close"
              >
                <X size={12} />
              </button>
            </div>

            <div className="relative z-10 pt-0.5">
              <button
                onClick={handleAccept}
                className="w-full bg-[#206324] hover:bg-[#28792d] active:bg-[#1a521e] border-2 border-t-[#6be377]/40 border-l-[#6be377]/40 border-b-black/90 border-r-black/90 text-white font-pixel text-[8px] uppercase tracking-wider py-1.5 px-3 shadow-[2px_2px_0_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-1.5 font-bold transition-all drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
              >
                <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Accept & Continue</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
