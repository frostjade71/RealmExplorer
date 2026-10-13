import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { type ReactNode } from 'react'
import lockIcon from '../assets/lock/42567-greenroleiconids.png'

interface OTMClosedModalProps {
  children?: ReactNode
}

export function OTMClosedModal({ children }: OTMClosedModalProps) {
  return (
    <div className="relative min-h-[80vh]">
      {children && (
        <div
          className="pointer-events-none select-none"
          aria-hidden="true"
          tabIndex={-1}
          inert={true}
        >
          {children}
        </div>
      )}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-md" />
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md overflow-hidden bg-zinc-950/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40"
        >


          <div className="p-8 md:p-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6"
            >
              <img src={lockIcon} alt="Locked" className="w-16 h-16 object-contain" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="font-pixel text-white text-xl md:text-2xl mb-2 tracking-tight"
            >
              OTM Temporarily Closed
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-12 h-px bg-realm-green/40 mb-4"
            />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="font-headline text-white/40 text-xs md:text-sm leading-relaxed max-w-xs mb-8"
            >
              Voting is currently paused. Stay tuned for updates - we'll be back soon!
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-realm-green text-zinc-950 font-headline font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#85fc7e] transition-colors duration-200 shadow-lg shadow-realm-green/20"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return Home
              </Link>
            </motion.div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        </motion.div>
      </div>
    </div>
  )
}
