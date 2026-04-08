import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer } from 'lucide-react'

interface VoteTimerProps {
  lastVoteTime: string
  onFinish?: () => void
}

export function VoteTimer({ lastVoteTime, onFinish }: VoteTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    const calculateTimeLeft = () => {
      const lastVote = new Date(lastVoteTime).getTime()
      const now = new Date().getTime()
      const cooldownFinish = lastVote + 24 * 60 * 60 * 1000
      const diff = cooldownFinish - now

      if (diff <= 0) {
        setTimeLeft('00:00:00')
        if (onFinish) onFinish()
        return
      }

      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m
          .toString()
          .padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      )
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [lastVoteTime, onFinish])

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-lg"
      >
        <Timer className="w-3 h-3 text-realm-green animate-pulse" />
        <span className="text-[10px] font-headline font-bold text-zinc-400 uppercase tracking-tighter">
          Cooldown: <span className="text-white font-pixel ml-1">{timeLeft}</span>
        </span>
      </motion.div>
    </AnimatePresence>
  )
}
