import React, { type ReactNode } from 'react'
import { motion, type Variants } from 'framer-motion'

interface FramerInProps {
  children: ReactNode
  delay?: number
  className?: string
  viewOnce?: boolean
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100,
    },
  },
}

export function FramerIn({ children, delay = 0, className = '', viewOnce = true }: FramerInProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: viewOnce, margin: "-100px" }}
      variants={itemVariants}
      transition={{ delay }}
      className={className}
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
