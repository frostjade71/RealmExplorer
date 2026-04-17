import { motion, type Variants } from 'framer-motion'
import { type ReactNode, useMemo } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'

interface AnimatedPageProps {
  children: ReactNode
  className?: string
}

export function AnimatedPage({ children, className = '' }: AnimatedPageProps) {
  const isMobile = useIsMobile()

  const pageVariants: Variants = useMemo(() => ({
    initial: {
      opacity: 0,
      y: isMobile ? 10 : 20,
      scale: isMobile ? 1 : 0.98,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: isMobile ? 0.35 : 0.5,
        ease: isMobile ? 'easeOut' : [0.22, 1, 0.36, 1],
        staggerChildren: isMobile ? 0.05 : 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: isMobile ? -10 : -20,
      scale: isMobile ? 1 : 0.98,
      transition: {
        duration: isMobile ? 0.25 : 0.3,
        ease: isMobile ? 'easeIn' : [0.22, 1, 0.36, 1],
      },
    },
  }), [isMobile])

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`flex-grow flex flex-col ${className} will-change-[transform,opacity]`}
    >
      {children}
    </motion.div>
  )
}
