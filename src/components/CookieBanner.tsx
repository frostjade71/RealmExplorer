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
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 right-4 md:right-8 z-[9999] w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-lg p-4 shadow-2xl flex flex-col gap-3">
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-3 right-3 p-1.5 text-zinc-500 hover:text-white transition-colors hover:bg-white/5 rounded-md"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Header: Icon & Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center shrink-0">
                <img src={cookieImg} alt="Cookie" className="w-5 h-5 object-contain" />
              </div>
              <h3 className="text-white font-pixel text-[10px] uppercase tracking-wider">
                Cookie Policy
              </h3>
            </div>
            
            {/* Body: Details */}
            <div className="flex-1">
              <p className="text-zinc-400 font-headline text-[10px] md:text-xs leading-relaxed pr-6">
                We use cookies to enhance your experience, analyze site traffic, and keep you logged in. By continuing, you agree to our <Link to="/privacy" className="text-realm-green hover:underline">Privacy Policy</Link>.
              </p>
            </div>

            {/* Footer: Buttons */}
            <div className="flex items-center pt-1">
              <button
                onClick={handleAccept}
                className="w-full bg-realm-green hover:bg-realm-green/80 text-black px-4 py-1.5 rounded-md font-pixel text-[8px] uppercase tracking-wide transition-all active:scale-95 whitespace-nowrap"
              >
                Accept & Continue
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
