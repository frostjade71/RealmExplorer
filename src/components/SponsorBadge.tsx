import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import diamondIcon from '../assets/category/16469-diamond.png'

export function SponsorBadge({ className }: { className?: string }) {
  return (
    <span className={twMerge(
      clsx(
        "inline-flex items-center px-2 py-0.5 font-pixel text-[8px] uppercase tracking-widest backdrop-blur-md",
        "bg-zinc-800/90 border-t-2 border-l-2 border-white/20 border-r-2 border-b-2 border-black/50 shadow-[2px_2px_0px_rgba(0,0,0,0.4)]",
        "text-cyan-400 font-bold",
        className
      )
    )}>
      <img src={diamondIcon} alt="" className="w-4 h-4 mr-1.5 object-contain" />
      Sponsor
    </span>
  )
}
