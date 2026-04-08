import { useSearchParams } from 'react-router-dom'
import { useServers } from '../hooks/queries'
import { useEffect, useState } from 'react'
import type { ServerCategory, ServerType } from '../types'
import { ServerCard } from '../components/ServerCard'
import { LoadingSpinner, EmptyState } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Swords, Cloud, Users, Box, MoreHorizontal, Sparkles, Clock, Globe, Server } from 'lucide-react'

export function DirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeType = searchParams.get('type') as ServerType | null
  const activeCategory = searchParams.get('category') as ServerCategory | null
  const initialSearch = searchParams.get('q') || ''
  const sortBy = searchParams.get('sort') || 'votes'

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
    <AnimatedPage className="max-w-7xl mx-auto px-8 py-12">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <FramerIn>
          <h1 className="text-4xl font-pixel text-white mb-4">
            {activeType ? `${activeType.charAt(0).toUpperCase() + activeType.slice(1)} Explorer` : 'Realm Explorer'}
          </h1>
          <p className="text-zinc-400 font-headline text-lg">
            Discover the top-rated {activeType || 'realms and servers'} from our community.
          </p>
        </FramerIn>
        
        <FramerIn delay={0.1} className="flex gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 self-start md:self-end">
          {[
            { id: null, label: 'All', icon: Globe },
            { id: 'server' as const, label: 'Servers', icon: Server },
            { id: 'realm' as const, label: 'Realms', icon: Globe }
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
              <type.icon className="w-4 h-4" />
              <span className="relative">{type.label}</span>
            </button>
          ))}
        </FramerIn>
      </div>

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
              { id: 'newest', label: 'Latest', icon: Clock }
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
    </AnimatedPage>
  )
}

