import { useState, useEffect } from 'react'
import { X, ArrowRight, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useBlogPosts } from '../hooks/queries'

function cleanSnippet(content: string | null | undefined, maxLength = 80): string {
  if (!content) return ''
  return content
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[#*`_~>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

interface FeaturedSpotlightToastProps {
  animationDirection?: 'from-right' | 'left-to-right'
}

export function FeaturedSpotlightToast({ animationDirection = 'from-right' }: FeaturedSpotlightToastProps) {
  const { data: posts = [], isLoading } = useBlogPosts({ status: 'published' })
  const [isVisible, setIsVisible] = useState(false)

  const featuredPost = posts.find(p => p.is_featured)

  useEffect(() => {
    if (!featuredPost || isLoading) return

    const dismissedId = localStorage.getItem('featured-spotlight-dismissed')
    if (dismissedId !== featuredPost.id) {
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [featuredPost, isLoading])

  const handleDismiss = () => {
    if (featuredPost) {
      localStorage.setItem('featured-spotlight-dismissed', featuredPost.id)
    }
    setIsVisible(false)
  }

  if (!featuredPost) return null

  const snippet = cleanSnippet(featuredPost.content, 75)
  const initialX = animationDirection === 'left-to-right' ? -100 : 100
  const exitX = animationDirection === 'left-to-right' ? -100 : 100

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: initialX, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: exitX, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 240 }}
          className="fixed top-20 md:top-24 right-3 sm:right-6 md:right-8 z-[9990] w-[calc(100%-1.5rem)] max-w-[310px] pointer-events-auto"
        >
          <div className="relative bg-[#313233] border-[3px] border-[#101010] shadow-[5px_5px_0_rgba(0,0,0,0.65)] p-2.5 sm:p-3 flex flex-col gap-2 rounded-none">
            <div className="absolute inset-0 border-t-2 border-l-2 border-white/20 pointer-events-none" />
            <div className="absolute inset-0 border-b-2 border-r-2 border-black/60 pointer-events-none" />

            <div className="relative z-10 flex gap-2.5 items-start">
              <div className="relative shrink-0 w-16 h-16 border-2 border-[#101010] bg-black/60 shadow-inner overflow-hidden">
                <div className="absolute inset-0 border-t border-l border-white/10 border-b border-r border-black/60 pointer-events-none z-10" />
                {featuredPost.image_url ? (
                  <img
                    src={featuredPost.image_url}
                    alt={featuredPost.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-900">
                    <BookOpen size={20} className="opacity-40" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-5">
                <h4 className="font-pixel text-[10px] sm:text-[11px] text-white uppercase leading-snug line-clamp-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {featuredPost.title}
                </h4>
                {snippet && (
                  <p className="text-zinc-300 font-headline text-[9px] sm:text-[10px] leading-tight line-clamp-2 mt-1 drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)]">
                    {snippet}...
                  </p>
                )}
              </div>

              <button
                onClick={handleDismiss}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#212223] hover:bg-[#2c2d2e] border border-[#101010] border-t-white/30 border-l-white/30 border-b-black/80 border-r-black/80 text-white/70 hover:text-white shadow-[1px_1px_0_rgba(0,0,0,0.5)] active:translate-y-0.5 flex items-center justify-center transition-all z-20"
                aria-label="Dismiss spotlight"
              >
                <X size={12} />
              </button>
            </div>

            <div className="relative z-10 pt-0.5">
              <Link
                to={`/blog/${featuredPost.slug}`}
                onClick={handleDismiss}
                className="w-full bg-[#206324] hover:bg-[#28792d] active:bg-[#1a521e] border-2 border-t-[#6be377]/40 border-l-[#6be377]/40 border-b-black/90 border-r-black/90 text-white font-pixel text-[8px] uppercase tracking-wider py-1.5 px-3 shadow-[2px_2px_0_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-1.5 font-bold transition-all drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
              >
                <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Read More</span>
                <ArrowRight size={10} className="text-white" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
