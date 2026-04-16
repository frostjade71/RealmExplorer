import { BookOpen, ArrowRight, Rss } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { useBlogPosts } from '../hooks/queries'
import { LoadingSpinner } from '../components/FeedbackStates'
import { format } from 'date-fns'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BlogLikeButton } from '../components/BlogLikeButton'
import blogBg from '../assets/blog/blogbg.jpg'

const CATEGORIES = ['All', 'Server Spotlight', 'Event/News', 'Changelog'] as const

export function BlogPage() {
  const { data: posts = [], isLoading } = useBlogPosts({ status: 'published' })
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>('All')
  const featuredPost = posts.find(p => p.is_featured)
  
  const filteredPosts = useMemo(() => {
    let list = posts.filter(p => !featuredPost || p.id !== featuredPost.id)
    if (activeCategory !== 'All') {
      list = list.filter(p => p.category === activeCategory)
    }
    return list
  }, [posts, featuredPost, activeCategory])

  if (isLoading) return <LoadingSpinner />

  return (
    <AnimatedPage>
      {/* Hero Section */}
      <header className="pt-32 pb-20 px-8 relative overflow-hidden min-h-[40vh] md:min-h-[50vh] flex flex-col items-center justify-center bg-zinc-950">
        {/* Cinematic Background */}
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={blogBg} 
          className="absolute inset-0 w-full h-full object-cover z-0 block"
          alt="Blog Background"
        />
        {/* Dark Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-green-950/90 z-10"></div>
        
        <div className="max-w-7xl mx-auto relative z-20 flex flex-col items-center text-center">
          <FramerIn delay={0.2}>
            <div className="inline-flex items-center gap-2 bg-zinc-800/90 border-t-2 border-l-2 border-white/20 border-r-2 border-b-2 border-black/50 px-3 py-1 mb-6 md:mb-8 text-[#85fc7e] shadow-[2px_2px_0px_rgba(0,0,0,0.4)] backdrop-blur-md">
              <Rss className="w-4 h-4 text-[#85fc7e]" />
              <span className="font-pixel text-[8px] md:text-[9px] tracking-widest uppercase">Official Feed</span>
            </div>
          </FramerIn>

          <FramerIn delay={0.4}>
            <h1 className="font-pixel text-white text-3xl md:text-5xl leading-tight mb-4 md:mb-6 drop-shadow-2xl uppercase">
              The <span className="text-[#4EC44E]">Realm</span> Blog
            </h1>
          </FramerIn>

          <FramerIn delay={0.6}>
            <p className="text-white/80 max-w-xl text-xs md:text-base mb-8 md:mb-10 font-body leading-relaxed drop-shadow-lg mx-auto px-4">
              Official announcements, community spotlights, and developer deep-dives into the world of Realm Explorer.
            </p>
          </FramerIn>
        </div>
        
        {/* Content Fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-20"></div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        {/* Featured Post Highlight */}
        {featuredPost && (
          <FramerIn className="mb-12 md:mb-20">
            <div className="flex items-center gap-4 mb-6">
              <span className="material-symbols-outlined text-realm-green text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              <h2 className="font-pixel text-white text-xs md:text-sm uppercase tracking-[0.3em]">Featured Spotlight</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-realm-green/30 to-transparent" />
            </div>

            <Link to={`/blog/${featuredPost.slug}`} className="group block">
              <div className="relative w-full bg-[#1a1b1c] border-4 border-realm-green p-4 md:p-6 shadow-[5px_5px_0_rgba(133,252,126,0.2)] hover:shadow-[8px_8px_0_rgba(133,252,126,0.3)] transition-all hover:-translate-y-1">
                {/* Inner Highlight Borders */}
                <div className="absolute inset-0 border-t-2 border-l-2 border-white/10 pointer-events-none" />
                <div className="absolute inset-0 border-b-2 border-r-2 border-black/40 pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row gap-6 md:gap-8 items-center">
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                      <span className="px-2 py-0.5 bg-realm-green text-zinc-950 font-pixel text-[8px] uppercase tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,0.3)] font-bold">
                        Must Read
                      </span>
                      <span className="text-[9px] font-pixel text-white/40 uppercase tracking-widest">
                        {format(new Date(featuredPost.created_at), 'MMMM dd, yyyy')}
                      </span>
                      <BlogLikeButton postId={featuredPost.id} />
                    </div>

                    <h2 className="text-lg md:text-3xl font-pixel text-white mb-3 md:mb-4 uppercase leading-none transition-colors drop-shadow-xl">
                      {featuredPost.title}
                    </h2>

                    <p className="text-zinc-400 font-headline text-xs md:text-sm line-clamp-2 opacity-80 max-w-2xl mb-6 leading-relaxed">
                      {featuredPost.content?.replace(/[#*`]/g, '').slice(0, 250)}...
                    </p>

                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-realm-green text-zinc-950 font-pixel text-[8px] uppercase tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,0.3)] group-hover:bg-white transition-colors font-bold">
                      View Full Story
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div className="relative shrink-0 w-full lg:w-[280px] aspect-video border-4 border-[#101010] bg-black/40 shadow-inner overflow-hidden">
                    <div className="absolute inset-0 border-t-4 border-l-4 border-white/5 pointer-events-none" />
                    {featuredPost.image_url ? (
                      <img 
                        src={featuredPost.image_url} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <BookOpen size={48} className="opacity-10" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </FramerIn>
        )}

        {/* Filter Bar */}
        <FramerIn className="mb-12">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 p-4 bg-[#313233]/30 border-t-2 border-l-2 border-white/5 border-b-2 border-r-2 border-black/40 shadow-inner">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 md:px-6 py-2 md:py-3 font-pixel text-[8px] md:text-[10px] uppercase tracking-widest transition-all relative group ${
                  activeCategory === cat
                    ? 'bg-realm-green text-zinc-950 shadow-[4px_4px_0px_rgba(0,0,0,0.4)] translate-y-[-2px]'
                    : 'bg-zinc-900/50 text-white/40 hover:text-white border-2 border-white/5'
                }`}
              >
                {/* Minecraft hover highlight */}
                {activeCategory !== cat && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                {cat}
                {activeCategory === cat && (
                  <div className="absolute inset-0 border-t-2 border-l-2 border-white/30 pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        </FramerIn>

        {/* Regular Blog List */}
        <div className="space-y-12">
          {featuredPost && filteredPosts.length > 0 && (
            <div className="flex items-center gap-4 mb-2">
              <h2 className="font-pixel text-white/40 text-[10px] uppercase tracking-[0.3em]">
                {activeCategory === 'All' ? 'Latest Updates' : `${activeCategory} Feed`}
              </h2>
              <div className="flex-1 h-px bg-white/5" />
            </div>
          )}

          <div className="flex flex-col gap-6 md:gap-8">
            {filteredPosts.map((post, idx) => (
              <FramerIn key={post.id} delay={idx * 0.1}>
                <Link 
                  to={`/blog/${post.slug}`}
                  className="group block w-full"
                >
                  <div className="relative w-full bg-[#313233] border-4 border-[#101010] p-4 md:p-6 shadow-[5px_5px_0_rgba(0,0,0,0.5)] hover:bg-[#3c3c43] transition-all hover:scale-[1.01]">
                    {/* Inner Highlight Borders */}
                    <div className="absolute inset-0 border-t-2 border-l-2 border-white/10 pointer-events-none" />
                    <div className="absolute inset-0 border-b-2 border-r-2 border-black/40 pointer-events-none" />

                    <div className="relative z-10 flex items-center justify-between gap-6 md:gap-10">
                      {/* Left: Content */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-3 mb-2 md:mb-4 opacity-40">
                          <span className="text-[8px] md:text-[10px] font-pixel text-white uppercase tracking-widest">
                            {format(new Date(post.created_at), 'MMMM dd, yyyy')}
                          </span>
                          <div className="w-1.5 h-1.5 bg-realm-green rounded-full shadow-[0_0_5px_rgba(133,252,126,0.5)]" />
                          <span className="text-[8px] md:text-[10px] font-pixel text-[#85fc7e] uppercase tracking-widest">
                            {post.category}
                          </span>
                          <div className="ml-auto">
                            <BlogLikeButton postId={post.id} />
                          </div>
                        </div>

                        <h2 className="text-sm md:text-2xl font-pixel text-white mb-2 md:mb-4 line-clamp-2 md:line-clamp-1 uppercase leading-tight transition-colors drop-shadow-md">
                          {post.title}
                        </h2>

                        <p className="hidden md:block text-zinc-400 font-headline text-xs line-clamp-2 opacity-60 max-w-2xl mb-4 group-hover:opacity-100 transition-opacity">
                          {post.content?.replace(/[#*`]/g, '').slice(0, 200)}...
                        </p>

                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-pixel text-realm-green uppercase tracking-widest group-hover:mr-2 transition-all">
                            Enter Selection
                          </span>
                          <div className="w-2 h-2 border-t-2 border-r-2 border-realm-green rotate-45 opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                      </div>

                      {/* Right: Image Container */}
                      <div className="relative shrink-0 w-20 h-20 md:w-40 md:h-40 border-4 border-[#101010] bg-black/40 shadow-inner overflow-hidden">
                        <div className="absolute inset-0 border-t-2 border-l-2 border-white/5 pointer-events-none" />
                        {post.image_url ? (
                          <img 
                            src={post.image_url} 
                            alt="" 
                            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700">
                            <BookOpen size={40} className="opacity-20" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </FramerIn>
            ))}
          </div>
        </div>

        {filteredPosts.length === 0 && (
          <FramerIn className="text-center py-20 bg-zinc-900/30 border border-dashed border-white/5 rounded-3xl">
            <p className="text-zinc-600 font-headline italic uppercase tracking-widest text-xs">No posts found in this category.</p>
          </FramerIn>
        )}
      </div>
    </AnimatedPage>
  )
}
