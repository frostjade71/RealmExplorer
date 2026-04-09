import { useSearchParams } from 'react-router-dom'
import { useServers } from '../hooks/queries'
import { useEffect, useState } from 'react'
import type { ServerCategory, ServerType } from '../types'
import { ServerCard } from '../components/ServerCard'
import { LoadingSpinner, EmptyState } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Swords, Cloud, Users, Box, MoreHorizontal, Sparkles, Clock, Globe, History } from 'lucide-react'
import directoryHero from '../assets/hero/directoryhero.jpg'

// Type Icons
import serverGif from '../assets/category/gif/6128-minecraft.gif'
import realmGif from '../assets/category/gif/9677-minecraftnetherportalblock (2).gif'

export function DirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeType = searchParams.get('type') as ServerType | null
  const activeCategory = searchParams.get('category') as ServerCategory | null
  const initialSearch = searchParams.get('q') || ''
  const sortBy = searchParams.get('sort') || 'newest'

  const [localSearch, setLocalSearch] = useState(initialSearch)

  // Sync local search when URL changes (e.g. back button)
  useEffect(() => {
    setLocalSearch(initialSearch)
  }, [initialSearch])

  // Debounced search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== initialSearch) {
        if (localSearch) searchParams.set('q', localSearch)
        else searchParams.delete('q')
        setSearchParams(searchParams)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [localSearch, initialSearch, searchParams, setSearchParams])

  const { data: servers = [], isLoading: loading } = useServers({
    type: activeType || undefined,
    category: activeCategory,
    searchQuery: initialSearch,
    sortBy,
    limit: 12
  })

  const categories: { id: ServerCategory; label: string; icon: any }[] = [
    { id: 'smp', label: 'SMP', icon: Users },
    { id: 'factions', label: 'Factions', icon: Swords },
    { id: 'skyblock', label: 'Skyblock', icon: Cloud },
    { id: 'kitpvp', label: 'KitPVP', icon: Swords },
    { id: 'modded', label: 'Modded', icon: Box },
    { id: 'other', label: 'Other', icon: MoreHorizontal },
  ]

  const setType = (type: ServerType | null) => {
    if (type) searchParams.set('type', type)
    else searchParams.delete('type')
    setSearchParams(searchParams)
  }

  const setCategory = (cat: ServerCategory | null) => {
    if (cat === activeCategory) {
      searchParams.delete('category')
    } else if (cat) {
      searchParams.set('category', cat)
    } else {
      searchParams.delete('category')
    }
    setSearchParams(searchParams)
  }

  return (
    <AnimatedPage>
      <header className="relative pt-32 pb-20 px-8 overflow-hidden min-h-[50vh] flex flex-col items-center justify-center">
        {/* Cinematic Background */}
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={directoryHero} 
          alt="Directory Background" 
          className="absolute inset-0 w-full h-full object-cover z-0 block"
        />
        {/* Dark Cinematic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-green-950/90 z-10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-20 flex flex-col items-center text-center">
          <FramerIn>
            <h1 className="text-4xl md:text-5xl font-pixel text-white mb-6 drop-shadow-2xl">
              {activeType ? `${activeType.charAt(0).toUpperCase() + activeType.slice(1)} Explorer` : 'Realm Explorer'}
            </h1>
            <p className="text-white/80 font-headline text-lg max-w-2xl mx-auto mb-10 drop-shadow-lg leading-relaxed">
              Discover the top-rated {activeType || 'realms and servers'} from our community.
            </p>
          </FramerIn>
          
          <FramerIn delay={0.2} className="flex gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 backdrop-blur-md">
            {[
              { id: null, label: 'All', icon: <Globe className="w-4 h-4" /> },
              { id: 'server' as const, label: 'Servers', icon: <img src={serverGif} alt="" className="w-4 h-4 object-contain rounded-sm" /> },
              { id: 'realm' as const, label: 'Realms', icon: <img src={realmGif} alt="" className="w-4 h-4 object-contain rounded-sm" /> }
            ].map((type) => (
              <button
                key={String(type.id)}
                onClick={() => setType(type.id)}
                className={`relative px-4 py-2 rounded-lg text-sm font-headline font-bold flex items-center gap-2 transition-colors ${activeType === type.id ? 'text-realm-green' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {activeType === type.id && (
                  <motion.div 
                    layoutId="active-type"
                    className="absolute inset-0 bg-realm-green/10 border border-realm-green/20 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {type.icon}
                <span className="relative">{type.label}</span>
              </button>
            ))}
          </FramerIn>
        </div>
        
        {/* Cinematic Fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-20 pointer-events-none"></div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-12">

      <FramerIn delay={0.2} className="space-y-8 mb-12">
        {/* Search and Sort Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-realm-green transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-realm-green transition-all font-headline focus:ring-1 focus:ring-realm-green/50 shadow-xl"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <button 
                onClick={() => setLocalSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
            {[
              { id: 'votes', label: 'Top Rated', icon: Sparkles },
              { id: 'newest', label: 'Latest', icon: Clock },
              { id: 'oldest', label: 'Oldest', icon: History }
            ].map(option => (
              <button
                key={option.id}
                onClick={() => {
                  searchParams.set('sort', option.id)
                  setSearchParams(searchParams)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-headline font-bold transition-all ${sortBy === option.id ? 'bg-zinc-800 text-realm-green shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <option.icon className="w-3.5 h-3.5" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory(null)}
            className={`px-4 py-2 rounded-full text-xs font-headline font-bold transition-all border ${!activeCategory ? 'bg-realm-green text-[#002202] border-realm-green shadow-lg shadow-green-900/20' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-headline font-bold transition-all border ${activeCategory === cat.id ? 'bg-realm-green text-[#002202] border-realm-green shadow-lg shadow-green-900/20' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>
      </FramerIn>

      <AnimatePresence mode="popLayout">
        {loading ? (
          <motion.div 
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20"
          >
            <LoadingSpinner />
          </motion.div>
        ) : servers.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-20"
          >
            <EmptyState 
              title={`No results found`} 
              message="Try adjusting your filters or search terms to find what you're looking for." 
            />
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            initial="hidden"
            animate="visible"
            layout
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.03
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {servers.map(server => (
              <motion.div
                key={server.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <ServerCard server={server} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </AnimatedPage>
  )
}

