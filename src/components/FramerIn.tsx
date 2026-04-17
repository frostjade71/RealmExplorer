import React, { type ReactNode, useMemo } from 'react'
import { motion, type Variants } from 'framer-motion'
import { useIsMobile } from '../hooks/useMediaQuery'

interface FramerInProps {
  children: ReactNode
  delay?: number
  className?: string
  viewOnce?: boolean
}

export function FramerIn({ children, delay = 0, className = '', viewOnce = true }: FramerInProps) {
  const isMobile = useIsMobile()
  
  const variants: Variants = useMemo(() => ({
    hidden: { 
      opacity: 0, 
      y: isMobile ? 15 : 30 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: isMobile ? 'tween' : 'spring',
        duration: isMobile ? 0.4 : 0.6,
        ease: 'easeOut',
        damping: 20,
        stiffness: 100,
      },
    },
  }), [isMobile])

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: viewOnce, margin: isMobile ? "-20px" : "-100px" }}
      variants={variants}
      transition={{ delay }}
      className={`${className} will-change-[transform,opacity]`}
    >
      {children}
    </motion.div>
  )
}

interface FramerInListProps {
  children: ReactNode
  staggerDelay?: number
  className?: string
}

export function FramerInList({ children, staggerDelay = 0.1, className = '' }: FramerInListProps) {
  const isMobile = useIsMobile()
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? staggerDelay * 0.5 : staggerDelay,
      },
    },
  }

  const itemVariants: Variants = useMemo(() => ({
    hidden: { 
      opacity: 0, 
      y: isMobile ? 10 : 20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: isMobile ? 'tween' : 'spring',
        duration: isMobile ? 0.3 : 0.5,
        ease: 'easeOut'
      },
    },
  }), [isMobile])

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: isMobile ? "-20px" : "-50px" }}
      variants={containerVariants}
      className={`${className} will-change-[opacity]`}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants} className="will-change-[transform,opacity]">
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
