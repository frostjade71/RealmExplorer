import { MoreHorizontal, Pickaxe, Swords, Cloud, Target, Box, Lock, Gamepad2, Settings } from 'lucide-react'
import type { ServerCategory } from '../types'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const categoryStyles: Record<ServerCategory, { bg: string, text: string, icon: React.ReactNode }> = {
  factions: { 
    bg: 'bg-red-500/10', 
    text: 'text-red-500', 
    icon: <Swords className="w-3.5 h-3.5" /> 
  },
  kitpvp: { 
    bg: 'bg-blue-500/10', 
    text: 'text-blue-500', 
    icon: <Target className="w-3.5 h-3.5" /> 
  },
  skyblock: { 
    bg: 'bg-cyan-500/10', 
    text: 'text-cyan-500', 
    icon: <Cloud className="w-3.5 h-3.5" /> 
  },
  smp: { 
    bg: 'bg-green-500/10', 
    text: 'text-green-500', 
    icon: <Pickaxe className="w-3.5 h-3.5" /> 
  },
  modded: { 
    bg: 'bg-purple-500/10', 
    text: 'text-purple-500', 
    icon: <Settings className="w-3.5 h-3.5" /> 
  },
  skygen: { 
    bg: 'bg-amber-500/10', 
    text: 'text-amber-500', 
    icon: <Box className="w-3.5 h-3.5" /> 
  },
  prison: { 
    bg: 'bg-zinc-500/10', 
    text: 'text-zinc-200', 
    icon: <Lock className="w-3.5 h-3.5" /> 
  },
  minigames: { 
    bg: 'bg-teal-500/10', 
    text: 'text-teal-400', 
    icon: <Gamepad2 className="w-3.5 h-3.5" /> 
  },
  other: { 
    bg: 'bg-zinc-500/10', 
    text: 'text-zinc-500', 
    icon: <MoreHorizontal className="w-3.5 h-3.5" /> 
  }
}

const categoryLabels: Partial<Record<ServerCategory, string>> = {
  smp: 'SMP',
  factions: 'Factions',
  kitpvp: 'KitPvP',
  skyblock: 'Skyblock',
  modded: 'Modded',
  skygen: 'SkyGen',
  prison: 'Prison',
  minigames: 'Mini Games',
  other: 'Other',
}

interface CategoryBadgeProps {
  category: ServerCategory
  className?: string
  variant?: 'default' | 'inset' | 'neutral'
}

export function CategoryBadge({ category, className, variant = 'default' }: CategoryBadgeProps) {
  const style = categoryStyles[category] || categoryStyles.other
  const label = categoryLabels[category] || category
  
  if (variant === 'inset') {
    return (
      <div 
        className={twMerge(clsx("flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-headline font-bold uppercase tracking-wider w-fit text-zinc-400", className))}
        style={{
          background: '#1e1e1e',
          boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.35), inset -1px -1px 3px rgba(255,255,255,0.02)',
        }}
      >
        <span className="w-3 h-3 flex items-center justify-center shrink-0 [&>img]:w-3 [&>img]:h-3 [&>img]:object-contain [&>svg]:w-3 [&>svg]:h-3">
          {style.icon}
        </span>
        <span>{label}</span>
      </div>
    )
  }

  if (variant === 'neutral') {
    return (
      <div className={twMerge(clsx("flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-headline font-bold uppercase tracking-wider w-fit bg-zinc-900 border border-zinc-800 text-zinc-400", className))}>
        <span className="w-3 h-3 flex items-center justify-center shrink-0 [&>img]:w-3 [&>img]:h-3 [&>img]:object-contain [&>svg]:w-3 [&>svg]:h-3">
          {style.icon}
        </span>
        <span>{label}</span>
      </div>
    )
  }

  return (
    <div className={twMerge(clsx("flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-headline font-bold uppercase tracking-wider w-fit", style.bg, style.text, className))}>
      {style.icon}
      <span>{label}</span>
    </div>
  )
}
