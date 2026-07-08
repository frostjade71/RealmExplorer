import { ChunkLoader } from './ChunkLoader'
import { motion } from 'framer-motion'

export function TopLoadingBar({ isVisible, colorClass = "via-realm-green" }: { isVisible: boolean, colorClass?: string }) {
  if (!isVisible) return null;
  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] bg-transparent z-[100] overflow-hidden pointer-events-none">
      <motion.div 
        initial={{ x: '-100vw' }}
        animate={{ x: '100vw' }}
        transition={{ duration: 1.5, ease: 'linear' }}
        className={`h-full w-1/3 bg-gradient-to-r from-transparent ${colorClass} to-transparent`}
      />
    </div>
  )
}


export function LoadingSpinner({ size = 'lg', inline = false }: { size?: 'sm' | 'md' | 'lg', inline?: boolean }) {
  if (inline || size === 'sm') {
    return (
      <div className="inline-flex items-center justify-center scale-50">
        <ChunkLoader />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[50vh]">
      <div className="mb-8">
        <ChunkLoader />
      </div>
      <span className="font-pixel text-xs text-zinc-400 tracking-[0.2em] animate-pulse">
        GENERATING CHUNKS...
      </span>
    </div>
  )
}

export function EmptyState({ title = "No Results", message = "We couldn't find any blocks matching your search.", action, icon }: { title?: string, message?: string, action?: React.ReactNode, icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 min-h-[40vh]">
      <div className={`w-16 h-16 mb-6 flex items-center justify-center overflow-hidden ${!icon ? 'bg-zinc-900 rounded-xl opacity-50' : ''}`}>
        {icon || <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
      </div>
      <h3 className="font-pixel text-lg text-white mb-2">{title}</h3>
      <p className="text-zinc-500 font-headline text-sm max-w-sm mb-6">{message}</p>
      {action}
    </div>
  )
}
