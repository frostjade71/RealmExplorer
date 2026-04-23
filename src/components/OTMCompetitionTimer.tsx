import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Timer, CalendarClock } from 'lucide-react'
import mcIcon from '../assets/OTM/9e8def35f04e0f96840b5d16e8a247f5f59b81be.webp'

interface OTMCompetitionTimerProps {
  category: string
  targetTime: string
  label?: string
  variant?: 'locked' | 'compact' | 'minimal'
}

export function OTMCompetitionTimer({ 
  category, 
  targetTime, 
  label = 'Next competition starts in...', 
  variant = 'locked' 
}: OTMCompetitionTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null)

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetTime).getTime()
      const now = new Date().getTime()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft(null)
        return
      }

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000)
      })
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [targetTime])

  if (!timeLeft) {
    if (variant === 'compact' || variant === 'minimal') return null
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-900/40 border border-white/5 rounded-3xl backdrop-blur-md">
        <Timer className="w-12 h-12 text-realm-green/40 mb-4 animate-pulse" />
        <h3 className="font-pixel text-white text-lg">Competition Starting Soon</h3>
        <p className="text-zinc-500 font-headline text-sm mt-2">The voting session for this category is currently in preparation.</p>
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2 whitespace-nowrap">
        {[
          { label: 'd', value: timeLeft.d },
          { label: 'h', value: timeLeft.h },
          { label: 'm', value: timeLeft.m },
          { label: 's', value: timeLeft.s }
        ].filter(u => (u.label !== 'd' || u.value > 0)).map((unit) => (
          <div key={unit.label} className="flex items-center gap-0.5 shrink-0 whitespace-nowrap">
            <span className="text-[10px] font-pixel text-white">
              {unit.value.toString().padStart(2, '0')}
            </span>
            <span className="text-[7px] font-headline text-zinc-500 uppercase font-bold">{unit.label}</span>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 transition-all whitespace-nowrap">
        <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
          <Timer className="w-3.5 h-3.5 text-realm-green animate-pulse" />
          <span className="text-[10px] font-pixel text-white/60 tracking-widest uppercase">Closes in:</span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
          {[
            { label: 'd', value: timeLeft.d },
            { label: 'h', value: timeLeft.h },
            { label: 'm', value: timeLeft.m },
            { label: 's', value: timeLeft.s }
          ].filter(u => variant === 'compact' ? (u.label !== 'd' || u.value > 0) : true).map((unit) => (
            <div key={unit.label} className="flex items-center gap-0.5 shrink-0 whitespace-nowrap">
              <span className="text-xs font-pixel text-white">
                {unit.value.toString().padStart(2, '0')}
              </span>
              <span className="text-[7px] font-headline text-zinc-500 uppercase font-bold">{unit.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative p-8 md:p-12 rounded-xl bg-zinc-950/40 border border-white/5 overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-lg max-w-2xl mx-auto">
      <div className="absolute inset-0 bg-gradient-to-b from-realm-green/5 to-transparent pointer-events-none" />
      
      {/* Background Icon Watermark */}
      <div className="absolute -bottom-10 -right-10 opacity-[0.03] pointer-events-none rotate-12">
        <CalendarClock className="w-64 h-64 text-white" />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="inline-flex items-center gap-2 bg-zinc-800/90 border-t-2 border-l-2 border-white/20 border-r-2 border-b-2 border-black/50 px-3 py-1 mb-6 md:mb-8 text-[#85fc7e] shadow-[2px_2px_0px_rgba(0,0,0,0.4)] backdrop-blur-sm">
           <img src={mcIcon} alt="Mine" className="w-5 h-5 object-contain" />
           <span className="text-[8px] md:text-[9px] font-pixel text-[#85fc7e] uppercase tracking-widest">{category} Poll is currently locked</span>
        </div>

        <h3 className="text-xl md:text-2xl font-pixel text-white mb-8 drop-shadow-2xl">
          {label}
        </h3>

        <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-2xl">
          {[
            { label: 'Days', value: timeLeft.d },
            { label: 'Hours', value: timeLeft.h },
            { label: 'Minutes', value: timeLeft.m },
            { label: 'Seconds', value: timeLeft.s }
          ].map((unit) => (
            <div key={unit.label} className="flex flex-col items-center">
              <div className="relative w-14 h-14 md:w-20 md:h-20 bg-zinc-900/50 border border-white/10 rounded-xl flex items-center justify-center mb-2 shadow-xl backdrop-blur-sm overflow-hidden group">
                 <div className="absolute inset-0 border-t border-l border-white/5 pointer-events-none" />
                 <span className="text-lg md:text-2xl font-pixel text-white group-hover:text-realm-green transition-colors">
                   {unit.value.toString().padStart(2, '0')}
                 </span>
              </div>
              <span className="text-[8px] md:text-[9px] font-headline text-zinc-500 uppercase tracking-widest font-bold">{unit.label}</span>
            </div>
          ))}
        </div>

        <p className="mt-12 text-zinc-500 font-headline text-xs md:text-sm max-w-md leading-relaxed">
          Stay tuned! All approved {category === 'realm' ? 'realms' : category === 'server' ? 'servers' : 'profiles'} will be automatically submitted when the countdown ends.
        </p>
      </motion.div>
    </div>
  )
}
