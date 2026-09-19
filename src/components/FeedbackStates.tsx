import { motion } from 'framer-motion'
import { DotmCircular2 } from './ui/dotm-circular-2'
import { useIsMobile } from '../hooks/useMediaQuery'

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


export function LoadingSpinner({ 
  size = 'lg', 
  inline = false,
  className
}: { 
  size?: 'sm' | 'md' | 'lg' | number, 
  inline?: boolean,
  className?: string
}) {
  const isMobile = useIsMobile();
  const isSm = size === 'sm';
  const isMd = size === 'md';
  const isNumber = typeof size === 'number';

  const defaultSize = isMobile ? 64 : 108;
  const pixelSize = isNumber ? size : isSm ? 24 : isMd ? (isMobile ? 44 : 54) : defaultSize;
  const dotPixelSize = (pixelSize * 13.5) / 108;
  const cellPaddingVal = (pixelSize * 0.5) / 108;

  const spinner = (
    <DotmCircular2
      size={pixelSize}
      dotSize={dotPixelSize}
      speed={1.8}
      pattern="full"
      dotShape="square"
      color="#53c653"
      animated
      opacityBase={0}
      opacityMid={0.07}
      opacityPeak={1}
      cellPadding={cellPaddingVal}
      className={className}
    />
  );

  if (inline || isSm) {
    return (
      <div className="inline-flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-12 min-h-[35vh] md:min-h-[50vh]">
      {spinner}
    </div>
  );
}

export function EmptyState({ 
  title = "No Results", 
  message = "We couldn't find any blocks matching your search.", 
  action, 
  icon,
  size = "default"
}: { 
  title?: React.ReactNode, 
  message?: React.ReactNode, 
  action?: React.ReactNode, 
  icon?: React.ReactNode,
  size?: "default" | "sm"
}) {
  const isSm = size === "sm";
  return (
    <div className={`flex flex-col items-center justify-center ${isSm ? 'p-8 min-h-[25vh]' : 'p-12 min-h-[40vh]'} text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50`}>
      <div className={`${isSm ? 'mb-4' : 'mb-6'} flex items-center justify-center ${!icon ? 'w-16 h-16 overflow-hidden bg-zinc-900 rounded-xl opacity-50' : ''}`}>
        {icon || <svg xmlns="http://www.w3.org/2000/svg" width={isSm ? "24" : "32"} height={isSm ? "24" : "32"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
      </div>
      <h3 className={`font-pixel text-white ${isSm ? 'text-sm mb-1.5' : 'text-base md:text-lg mb-2'}`}>{title}</h3>
      <p className={`text-zinc-500 font-headline max-w-sm ${isSm ? 'text-[11px] md:text-xs mb-4' : 'text-xs md:text-sm mb-6'}`}>{message}</p>
      {action}
    </div>
  )
}
