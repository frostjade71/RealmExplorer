import { BookOpen, ArrowRight, Rss } from 'lucide-react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { useBlogPosts } from '../hooks/queries'
import { format } from 'date-fns'
import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BlogLikeButton } from '../components/BlogLikeButton'
import { BlogViewCount } from '../components/BlogViewCount'
import { useIsMobile } from '../hooks/useMediaQuery'
import blogBg from '../assets/blog/blogbg.jpg'

const CATEGORIES = ['All', 'Server Spotlight', 'Event/News', 'Changelog'] as const

export function BlogPage() {
  const isMobile = useIsMobile()
  const { data: posts = [], isLoading } = useBlogPosts({ status: 'published' })
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const initialCategory = (searchParams.get('category') as typeof CATEGORIES[number]) || 'All'
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>(
    CATEGORIES.includes(initialCategory) ? initialCategory : 'All'
  )

  useEffect(() => {
    if (location.hash === '#feed') {
      const scrollToFeed = () => {
        const element = document.getElementById('feed')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
      
      // Try scrolling immediately, then again after a delay to ensure page is rendered
      scrollToFeed()
      setTimeout(scrollToFeed, 100)
      setTimeout(scrollToFeed, 300)
      setTimeout(scrollToFeed, 600)
    }
  }, [location.hash, location.key, isLoading])

  const handleCategoryChange = (cat: typeof CATEGORIES[number]) => {
    setActiveCategory(cat)
    if (cat === 'All') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', cat)
    }
    setSearchParams(searchParams, { replace: true })
    
    // Auto scroll back to the tabs when a new tab is selected
    setTimeout(() => {
      document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }
  const featuredPost = posts.find(p => p.is_featured)
  
  const filteredPosts = useMemo(() => {
    let list = posts.filter(p => !featuredPost || p.id !== featuredPost.id)
    if (activeCategory !== 'All') {
      list = list.filter(p => p.category === activeCategory)
    }
    return list
  }, [posts, featuredPost, activeCategory])



  return (
    <AnimatedPage>
      {/* Hero Section */}
      <header className="pt-32 pb-20 px-8 relative overflow-hidden min-h-[40vh] md:min-h-[50vh] flex flex-col items-center justify-center bg-zinc-950">
        {/* Cinematic Background */}
        <motion.img 
          initial={isMobile ? { opacity: 0 } : { scale: 1.1, opacity: 0 }}
          animate={isMobile ? { opacity: 0.4 } : { scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={blogBg}
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-cover z-0 block will-change-[opacity,transform]"
          alt="Blog Background"
        />
        {/* Dark Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-green-950/90 z-10"></div>
        
        <div className="w-full max-w-7xl mx-auto px-4 relative z-20 flex flex-col items-center text-center will-change-transform">
          <FramerIn delay={0.2}>
            <div className="inline-flex items-center gap-2 mb-6 md:mb-8">
              <Rss className="w-4 h-4 text-realm-green" />
              <span className="font-pixel text-white text-[8px] md:text-[9px] tracking-widest uppercase drop-shadow-md">Official Feed</span>
            </div>
          </FramerIn>

          <FramerIn delay={0.4}>
            <h1 className="font-pixel text-white text-2xl sm:text-3xl md:text-5xl leading-tight mb-4 md:mb-6 drop-shadow-2xl uppercase break-words w-full px-2">
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
        {isLoading ? (
          <FramerIn className="mb-12 md:mb-20">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="font-pixel text-white text-xs md:text-sm uppercase tracking-[0.3em]">Featured Spotlight</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-realm-green/30 to-transparent" />
            </div>
            <div className="w-full h-[400px] lg:h-[250px] bg-white/5 rounded-xl animate-pulse" />
          </FramerIn>
        ) : featuredPost && (
          <FramerIn className="mb-12 md:mb-20">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="font-pixel text-white text-xs md:text-sm uppercase tracking-[0.3em]">Featured Spotlight</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-realm-green/30 to-transparent" />
            </div>

            <Link to={`/blog/${featuredPost.slug}`} className="group block">
              <div className="relative w-full bg-[#1a1b1c] border-4 border-realm-green p-4 md:p-6 shadow-[5px_5px_0_rgba(133,252,126,0.2)] hover:shadow-[8px_8px_0_rgba(133,252,126,0.3)] transition-all hover:-translate-y-1">
                {/* Inner Highlight Borders */}
                <div className="absolute inset-0 border-t-2 border-l-2 border-white/10 pointer-events-none" />
                <div className="absolute inset-0 border-b-2 border-r-2 border-black/40 pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row gap-6 md:gap-8 items-center">
                  <div className="flex-1 text-center lg:text-left w-full">
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-3 md:mb-4">
                      <span className="text-xs md:text-sm font-headline text-white/40 uppercase tracking-widest">
                        {format(new Date(featuredPost.created_at), 'MMMM dd, yyyy')}
                      </span>
                      <div className="flex items-center gap-3">
                        <BlogViewCount views={featuredPost.views || 0} />
                        <BlogLikeButton postId={featuredPost.id} />
                      </div>
                    </div>

                    <h2 className="text-lg md:text-3xl font-pixel text-white mb-3 md:mb-4 uppercase leading-none transition-colors drop-shadow-xl">
                      {featuredPost.title}
                    </h2>

                    <p className="text-zinc-400 font-headline text-xs md:text-sm line-clamp-2 opacity-80 max-w-2xl mx-auto lg:mx-0 mb-6 leading-relaxed">
                      {featuredPost.content?.replace(/[#*`]/g, '').slice(0, 250)}...
                    </p>

                    <div className="inline-flex items-center justify-center lg:justify-start gap-3 px-4 py-2 bg-white text-zinc-950 font-pixel text-[8px] uppercase tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,0.3)] group-hover:bg-white transition-colors font-bold">
                      Read All
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div className="relative shrink-0 w-full lg:w-[280px] aspect-video border-4 border-[#101010] bg-black/40 shadow-inner overflow-hidden">
                    <div className="absolute inset-0 border-t-4 border-l-4 border-white/5 pointer-events-none" />
                    {featuredPost.image_url ? (
                      <img 
                        src={featuredPost.image_url} 
                        alt="" 
                        loading="lazy"
                        decoding="async"
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

        {/* Filter Bar Anchor */}
        <div id="feed" className="scroll-mt-20" />
        {/* Filter Bar */}
        <div className="sticky top-20 z-40 py-4 -my-4 mb-8">
          <FramerIn>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 p-4 bg-[#313233]/80 backdrop-blur-xl border-t-2 border-l-2 border-white/10 border-b-2 border-r-2 border-black/60 shadow-xl shadow-black/20 rounded-xl">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 md:px-6 py-2 md:py-3 font-pixel text-[8px] md:text-[10px] uppercase tracking-widest transition-all relative group ${
                  activeCategory === cat
                    ? 'bg-white text-zinc-950 shadow-[4px_4px_0px_rgba(0,0,0,0.4)] translate-y-[-2px]'
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
        </div>

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
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="relative w-full bg-[#313233]/40 border-4 border-[#101010] h-[250px] sm:h-[180px] animate-pulse" />
              ))
            ) : filteredPosts.map((post, idx) => (
              <FramerIn key={post.id} delay={idx * 0.1}>
                <Link 
                  to={`/blog/${post.slug}`}
                  className="group block w-full"
                >
                  <div className="relative w-full bg-[#313233] border-4 border-[#101010] p-4 md:p-6 shadow-[5px_5px_0_rgba(0,0,0,0.5)] hover:bg-[#3c3c43] transition-all hover:scale-[1.01]">
                    {/* Inner Highlight Borders */}
                    <div className="absolute inset-0 border-t-2 border-l-2 border-white/10 pointer-events-none" />
                    <div className="absolute inset-0 border-b-2 border-r-2 border-black/40 pointer-events-none" />

                    <div className="relative z-10 flex flex-col-reverse sm:flex-row items-center sm:justify-between gap-6 md:gap-10">
                      {/* Left: Content */}
                      <div className="flex-1 text-center sm:text-left w-full">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-3 md:mb-4 opacity-40">
                          <span className="text-[10px] md:text-xs font-headline text-white uppercase tracking-widest">
                            {format(new Date(post.created_at), 'MMMM dd, yyyy')}
                          </span>
                          <div className="ml-auto flex items-center gap-3">
                            <BlogViewCount views={post.views || 0} />
                            <BlogLikeButton postId={post.id} />
                          </div>
                        </div>

                        <h2 className="text-sm md:text-2xl font-pixel text-white mb-2 md:mb-4 line-clamp-2 md:line-clamp-1 uppercase leading-tight transition-colors drop-shadow-md">
                          {post.title}
                        </h2>

                        <p className="hidden md:block text-zinc-400 font-headline text-xs line-clamp-2 opacity-60 max-w-2xl mb-4 group-hover:opacity-100 transition-opacity">
                          {post.content?.replace(/[#*`]/g, '').slice(0, 200)}...
                        </p>

                        <div className="flex items-center justify-center sm:justify-start gap-1 text-realm-green">
                          <span className="text-[8px] font-pixel uppercase tracking-widest">
                            Read All
                          </span>
                          <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* Right: Image Container */}
                      <div className="relative shrink-0 w-full max-w-[280px] sm:max-w-none aspect-video sm:w-48 sm:h-28 mx-auto sm:mx-0 border-4 border-[#101010] bg-black/40 shadow-inner overflow-hidden">
                        <div className="absolute inset-0 border-t-2 border-l-2 border-white/5 pointer-events-none" />
                        {post.image_url ? (
                          <img 
                            src={post.image_url} 
                            alt="" 
                            loading="lazy"
                            decoding="async"
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

        {!isLoading && filteredPosts.length === 0 && (
          <FramerIn className="text-center py-20 bg-zinc-900/30 border border-dashed border-white/5 rounded-3xl">
            <p className="text-zinc-600 font-headline italic uppercase tracking-widest text-xs">No posts found in this category.</p>
          </FramerIn>
        )}
      </div>
    </AnimatedPage>
  )
}
