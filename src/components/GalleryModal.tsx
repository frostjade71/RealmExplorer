import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

interface GalleryModalProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  initialIndex?: number
  title?: string
  onIndexChange?: (index: number) => void
}

export function GalleryModal({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  title: _title,
  onIndexChange,
}: GalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [, setDirection] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setDirection(0)
    }
  }, [isOpen, initialIndex])

  const goToImage = useCallback(
    (newIndex: number, dir: number = 0) => {
      if (!images.length) return
      const normalizedIndex = (newIndex + images.length) % images.length
      setDirection(dir !== 0 ? dir : normalizedIndex > currentIndex ? 1 : -1)
      setCurrentIndex(normalizedIndex)
      onIndexChange?.(normalizedIndex)
    },
    [images.length, currentIndex, onIndexChange]
  )

  const handlePrev = useCallback(() => {
    goToImage(currentIndex - 1, -1)
  }, [currentIndex, goToImage])

  const handleNext = useCallback(() => {
    goToImage(currentIndex + 1, 1)
  }, [currentIndex, goToImage])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handlePrev, handleNext])

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex] || images[0]

  const variants = {
    enter: {
      opacity: 0,
    },
    center: {
      zIndex: 1,
      opacity: 1,
    },
    exit: {
      zIndex: 0,
      opacity: 0,
    },
  }

  const modalRoot = document.getElementById('modal-root') || document.body

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-between p-3 sm:p-5 md:p-6 select-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 flex items-center justify-end gap-2 max-w-7xl mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <a
                href={currentImage}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all shadow-lg backdrop-blur-sm"
                title="Open original image in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={onClose}
                className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all shadow-lg backdrop-blur-sm"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          <div
            className="relative z-10 flex-1 flex items-center justify-center w-full my-auto py-2 md:py-4 overflow-hidden pointer-events-none"
          >
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrev()
                }}
                className="pointer-events-auto absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-950/80 border border-zinc-800/80 hover:border-realm-green hover:bg-realm-green hover:text-zinc-950 text-white flex items-center justify-center transition-all shadow-2xl backdrop-blur-md group"
                title="Previous image (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
              </button>
            )}

            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="pointer-events-auto absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-950/80 border border-zinc-800/80 hover:border-realm-green hover:bg-realm-green hover:text-zinc-950 text-white flex items-center justify-center transition-all shadow-2xl backdrop-blur-md group"
                title="Next image (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            <div
              className="pointer-events-auto relative max-w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={currentImage}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    opacity: { duration: 0.15 },
                  }}
                  alt={`Full size image ${currentIndex + 1}`}
                  className="max-h-[72vh] sm:max-h-[78vh] md:max-h-[82vh] max-w-[92vw] sm:max-w-[88vw] md:max-w-[84vw] object-contain rounded-lg sm:rounded-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                />
              </AnimatePresence>
            </div>
          </div>

          {images.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 flex items-center justify-center gap-2 md:gap-3 p-2 bg-zinc-950/80 border border-zinc-800/80 rounded-xl backdrop-blur-md max-w-fit mx-auto shadow-2xl overflow-x-auto max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => goToImage(idx, idx > currentIndex ? 1 : -1)}
                  className={`relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentIndex
                      ? 'border-realm-green ring-2 ring-realm-green/40 opacity-100 scale-105'
                      : 'border-zinc-800 opacity-50 hover:opacity-100 hover:border-zinc-600'
                  }`}
                  title={`View image ${idx + 1}`}
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>,
    modalRoot
  )
}
