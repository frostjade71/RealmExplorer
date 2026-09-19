import { Eye } from 'lucide-react'

interface BlogViewCountProps {
  views?: number
  variant?: 'small' | 'large'
  className?: string
}

export function BlogViewCount({ views = 0, variant = 'small', className = '' }: BlogViewCountProps) {
  const formattedCount = views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views.toString()

  if (variant === 'large') {
    return (
      <div className={`flex flex-col items-center gap-2 p-4 relative group/tooltip ${className}`}>
        <div className="relative flex items-center justify-center">
          <Eye className="w-10 h-10 text-zinc-400 group-hover/tooltip:text-realm-green transition-colors" />
        </div>
        <div className="text-center">
          <span className="block text-2xl font-headline font-bold text-white leading-none mb-1">
            {views.toLocaleString()}
          </span>
          <span className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-[0.2em] group-hover/tooltip:text-realm-green transition-colors">
            {views === 1 ? 'View' : 'Views'}
          </span>
        </div>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden md:group-hover/tooltip:block bg-zinc-950/90 border border-white/10 px-2.5 py-1.5 rounded shadow-xl text-white font-sans text-[10px] tracking-normal normal-case whitespace-nowrap z-50 pointer-events-none">
          {views === 1 ? '1 view' : `${views.toLocaleString()} views`}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1.5 group/tooltip relative select-none ${className}`}>
      <Eye className="w-3.5 h-3.5 text-white/30 group-hover/tooltip:text-realm-green transition-colors" />
      <span className="text-[10px] font-sans font-semibold text-white/40 group-hover/tooltip:text-white/80 transition-colors">
        {formattedCount}
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden md:group-hover/tooltip:block bg-zinc-950/90 border border-white/10 px-2.5 py-1.5 rounded shadow-xl text-white font-sans text-[10px] tracking-normal normal-case whitespace-nowrap z-50 pointer-events-none">
        {views === 1 ? '1 view' : `${views.toLocaleString()} views`}
      </div>
    </div>
  )
}
