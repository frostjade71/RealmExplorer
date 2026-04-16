import { MoreHorizontal } from 'lucide-react'
import type { ServerCategory } from '../types'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Asset Imports
import factionsIcon from '../assets/category/7587-netherite-sword.png'
import kitpvpIcon from '../assets/category/95615-mace.png'
import skyblockIcon from '../assets/category/41601-minecraftoaktree.png'
import moddedIcon from '../assets/category/437888-bedrock.png'
import smpIcon from '../assets/category/708066-iron-pickaxe (1).png'
import skygenIcon from '../assets/category/89458-iron-block.png'

const categoryStyles: Record<ServerCategory, { bg: string, text: string, icon: React.ReactNode }> = {
  factions: { 
    bg: 'bg-red-500/10', 
    text: 'text-red-500', 
    icon: <img src={factionsIcon} alt="" className="w-3.5 h-3.5 object-contain" /> 
  },
  kitpvp: { 
    bg: 'bg-blue-500/10', 
    text: 'text-blue-500', 
    icon: <img src={kitpvpIcon} alt="" className="w-3.5 h-3.5 object-contain" /> 
  },
  skyblock: { 
    bg: 'bg-cyan-500/10', 
    text: 'text-cyan-500', 
    icon: <img src={skyblockIcon} alt="" className="w-3.5 h-3.5 object-contain" /> 
  },
  smp: { 
    bg: 'bg-green-500/10', 
    text: 'text-green-500', 
    icon: <img src={smpIcon} alt="" className="w-3.5 h-3.5 object-contain" /> 
  },
  modded: { 
    bg: 'bg-purple-500/10', 
    text: 'text-purple-500', 
    icon: <img src={moddedIcon} alt="" className="w-3.5 h-3.5 object-contain" /> 
  },
  skygen: { 
    bg: 'bg-amber-500/10', 
    text: 'text-amber-500', 
    icon: <img src={skygenIcon} alt="" className="w-3.5 h-3.5 object-contain" /> 
  },
  other: { 
    bg: 'bg-zinc-500/10', 
    text: 'text-zinc-500', 
    icon: <MoreHorizontal className="w-3.5 h-3.5" /> 
  }
}

export function CategoryBadge({ category, className }: { category: ServerCategory, className?: string }) {
  const style = categoryStyles[category] || categoryStyles.other
  
  return (
    <div className={twMerge(clsx("flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-headline font-bold uppercase tracking-wider w-fit", style.bg, style.text, className))}>
      {style.icon}
      <span>{category}</span>
    </div>
  )
}
