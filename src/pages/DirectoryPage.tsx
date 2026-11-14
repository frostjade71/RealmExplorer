import { useSearchParams } from 'react-router-dom'
import { useServers } from '../hooks/queries'
import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import type { Server, ServerCategory, ServerType } from '../types'
import { DirectoryServerCard } from '../components/DirectoryServerCard'
import { SponsorServerCard } from '../components/SponsorServerCard'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

import { LoadingSpinner, EmptyState } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, MoreHorizontal, Globe, Shuffle, Pickaxe, Swords, Cloud, Target, Box, Lock, Gamepad2, Settings } from 'lucide-react'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useAuth } from '../contexts/AuthContext'
import directoryHero from '../assets/hero/directoryhero.jpg'
import serverGif from '../assets/category/gif/6128-minecraft.gif'
import realmGif from '../assets/category/gif/9677-minecraftnetherportalblock (2).gif'
import errorImage from '../assets/error/teto-but-re.webp'


import { MetaTags } from '../components/MetaTags'

const categories: { id: ServerCategory; label: string; icon: any }[] = [
  { id: 'smp', label: 'SMP', icon: Pickaxe },
  { id: 'factions', label: 'Factions', icon: Swords },
  { id: 'skyblock', label: 'Skyblock', icon: Cloud },
  { id: 'kitpvp', label: 'KitPVP', icon: Target },
  { id: 'skygen', label: 'SkyGen', icon: Box },
  { id: 'prison', label: 'Prison', icon: Lock },
  { id: 'minigames', label: 'Mini Games', icon: Gamepad2 },
  { id: 'modded', label: 'Modded', icon: Settings },
  { id: 'other', label: 'Other', icon: MoreHorizontal },
]

const SERVER_TYPES = [
  { id: null, label: 'All', icon: <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 z-10" /> },
  { id: 'realm' as const, label: 'Realms', icon: <img src={realmGif} alt="" width={16} height={16} className="w-3.5 h-3.5 md:w-4 md:h-4 object-contain rounded-sm z-10" /> },
  { id: 'server' as const, label: 'Servers', icon: <img src={serverGif} alt="" width={16} height={16} className="w-3.5 h-3.5 md:w-4 md:h-4 object-contain rounded-sm z-10" /> }
]

export function DirectoryPage() {
  const isMobile = useIsMobile()
  const { shuffleCooldown, startShuffleCooldown } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeType = searchParams.get('type') as ServerType | null
  const activeCategory = searchParams.get('category') as ServerCategory | null
  const initialSearch = searchParams.get('q') || ''

  // Fetch Sponsor Servers
  const { data: sponsorServers = [] } = useQuery({
    queryKey: ['sponsors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_servers')
        .select('*, profiles(*)')
        .eq('status', 'approved')
        .eq('is_sponsored', true)
        .gt('sponsored_until', new Date().toISOString())
      if (error) throw error
      return data as unknown as Server[]
    }
  })


  const PAGE_SIZE = 24
  const [page, setPage] = useState(1)
  const [localSearch, setLocalSearch] = useState(initialSearch)

  const isOnline = searchParams.get('online') === 'true'

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [activeType, activeCategory, initialSearch, searchParams.get('sort'), isOnline])

  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [showShuffleToast, setShowShuffleToast] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('shuffle-toast-dismissed')
    if (!dismissed) {
      const timer = setTimeout(() => setShowShuffleToast(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleShuffle = () => {
    if (shuffleCooldown > 0) return
    setShuffleSeed(s => s + 1)
    startShuffleCooldown()
  }

  const handleToastDismiss = () => {
    localStorage.setItem('shuffle-toast-dismissed', 'true')
    setShowShuffleToast(false)
  }

  const handleToastShuffle = () => {
    handleToastDismiss()
    handleShuffle()
  }

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

  const { data: servers = [], isLoading: loading, isFetching } = useServers({
    type: activeType || undefined,
    category: activeCategory,
    searchQuery: initialSearch,
    sortBy: searchParams.get('sort') === 'latest' ? 'latest' : 'votes', // Fetch by votes initially, but we will re-sort
    limit: 1000 // Fetch a large batch to shuffle correctly
  })

  const isLatest = searchParams.get('sort') === 'latest'

  const processedServers = useMemo(() => {
    if (!servers.length) return []
    
    let filtered = servers;
    if (isOnline && activeType === 'server') {
      filtered = filtered.filter(s => s.online_players !== undefined && s.online_players !== null && s.online_players !== -1);
    }

    // If "Latest" sort is active, we don't shuffle, we keep the DB order (created_at desc)
    if (isLatest) return filtered

    // Create a weighted score for each server to provide a "higher chance" 
    // for Explorer+ without strictly pinning them to the top.
    return [...filtered]
      .map(server => {
        const isPremium = server.profiles?.role === 'explorer+'
        // Premium servers get a random score boost.
        // A boost of 0.7 ensures they generally float to the top 
        // but can still be mixed in with standard listings.
        const score = Math.random() + (isPremium ? 0.7 : 0)
        return { server, score }
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.server)
  }, [servers, shuffleSeed, isLatest, isOnline, activeType])

  const paginatedServers = useMemo(() => {
    return processedServers.slice(0, PAGE_SIZE * page)
  }, [processedServers, PAGE_SIZE, page])

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

  const pageTitle = activeCategory 
    ? `Best ${activeCategory.toUpperCase()} ${activeType === 'realm' ? 'Realms' : 'Servers'}` 
    : activeType === 'realm' 
      ? 'Browse Minecraft Realms' 
      : activeType === 'server' 
        ? 'Browse Minecraft Servers' 
        : 'Browse All Realms & Servers';

  const pageDescription = activeCategory 
    ? `Discover the top-rated ${activeCategory} Minecraft ${activeType || 'servers and realms'}. Vote for your favorites and join the community.` 
    : `Explore our directory of the best Minecraft ${activeType || 'servers and realms'}. Find your next adventure on Realm Explorer.`;

  return (
    <AnimatedPage>
      <MetaTags 
        title={pageTitle}
        description={pageDescription}
        url={`/servers${window.location.search}`}
      />
      <header className="relative pt-32 pb-16 md:pb-20 px-8 overflow-hidden min-h-[40vh] md:min-h-[50vh] flex flex-col items-center justify-center bg-zinc-950">
        {/* Cinematic Background */}
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1, ease: "easeOut" }}
          src={directoryHero} 
          alt="Directory Background" 
          className="absolute inset-0 w-full h-full object-cover z-0 block"
          fetchPriority="high"
          loading="eager"
          decoding="sync"
        />
        {/* Dark Cinematic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-green-950/90 z-10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-3xl md:text-5xl font-pixel text-white mb-4 md:mb-6 drop-shadow-2xl">
              {activeType ? `${activeType.charAt(0).toUpperCase() + activeType.slice(1)} Explorer` : 'Realm Explorer'}
            </h1>
            <p className="text-white/80 font-headline text-sm md:text-lg max-w-2xl mx-auto mb-8 md:mb-10 drop-shadow-lg leading-relaxed px-4">
              Discover the top-rated {activeType || 'realms and servers'} from our community.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`flex gap-1.5 md:gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'}`}
          >
            {SERVER_TYPES.map((type) => (
              <button
                key={String(type.id)}
                onClick={() => setType(type.id)}
                className={`relative px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-headline font-bold flex items-center gap-1.5 md:gap-2 transition-colors ${activeType === type.id ? 'text-realm-green' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {activeType === type.id && (
                  <motion.div 
                    layoutId="active-type"
                    className="absolute inset-0 bg-realm-green/10 border border-realm-green/20 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-1.5 md:gap-2">
                  {type.icon}
                  <span>{type.label}</span>
                </div>
              </button>
            ))}
          </motion.div>
        </div>
        
        {/* Cinematic Fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-20 pointer-events-none"></div>
      </header>

      <div className={`w-full max-w-7xl mx-auto px-8 py-8 md:py-12 flex-grow ${isMobile ? 'pb-32' : ''}`}>

        {/* Sponsors Section */}
        {sponsorServers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 md:mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-base md:text-lg font-pixel text-white/90 tracking-wide">
                Sponsors
              </h2>
              <div className="h-[1px] flex-grow bg-gradient-to-r from-white/20 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {sponsorServers.map((server, index) => (
                <div key={server.id}>
                  <SponsorServerCard server={server} priority={index < 4} />
                </div>
              ))}
            </div>
          </motion.div>
        )}

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full space-y-6 md:space-y-8 mb-10 md:mb-12"
      >
        {/* Search and Sort Row */}
        <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-realm-green transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-10 py-2.5 md:py-3 text-[13px] md:text-sm text-white placeholder-zinc-500 outline-none focus:border-realm-green transition-all font-headline focus:ring-1 focus:ring-realm-green/50 shadow-xl"
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
        </div>

        {/* Categories Chips */}
        <div className="w-full flex flex-wrap gap-1.5 md:gap-2">
          <button
            onClick={() => setCategory(null)}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-headline font-bold transition-all border ${!activeCategory ? 'bg-zinc-100 text-zinc-900 border-zinc-100' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
          >
            All Categories
          </button>
          <button
            onClick={() => {
              if (isLatest) searchParams.delete('sort')
              else searchParams.set('sort', 'latest')
              setSearchParams(searchParams)
            }}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-headline font-bold transition-all border ${isLatest ? 'bg-blue-500 text-white border-blue-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
          >
            Latest
          </button>
          {activeType === 'server' && (
            <button
              onClick={() => {
                if (isOnline) searchParams.delete('online')
                else searchParams.set('online', 'true')
                setSearchParams(searchParams)
              }}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-headline font-bold transition-all border ${isOnline ? 'bg-realm-green text-zinc-950 border-realm-green' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
            >
              Online
            </button>
          )}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-headline font-bold transition-all border ${activeCategory === cat.id ? 'bg-zinc-100 text-zinc-900 border-zinc-100' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
            >
              <cat.icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-[280px] rounded-xl bg-white/5 animate-pulse border border-white/5" />
                ))}
            </div>
          </motion.div>
        ) : processedServers.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full py-12 md:py-20 flex flex-col items-center"
          >
            <EmptyState 
              title={`No results found`} 
              message="Try adjusting your filters or search terms to find what you're looking for."
              icon={<img src={errorImage} alt="No Results" className="w-20 h-20 md:w-24 md:h-24 object-contain" />}
            />
          </motion.div>
        ) : (
          <motion.div 
            key={`grid-${shuffleSeed}`}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0, scale: 0.99 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: {
                  staggerChildren: 0.02,
                  duration: 0.2
                }
              }
            }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
          >
            {paginatedServers.map((server, index) => (
              <motion.div
                key={server.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <DirectoryServerCard server={server} priority={index < 8} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && paginatedServers.length < processedServers.length && (
        <FramerIn delay={0.4} className="mt-6 md:mt-8 flex justify-center pb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPage(p => p + 1)}
            disabled={isFetching}
            className="bg-[#4EC44E] hover:bg-[#5cd45c] text-zinc-950 px-6 md:px-8 py-3 md:py-3.5 rounded-lg font-headline font-bold transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] border-b-[4px] border-[#3da53d] active:border-b-0 active:border-t-[4px] active:border-t-transparent text-[12px] md:text-sm flex items-center gap-2.5 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="animate-pulse">Loading...</span>
              </>
            ) : (
              <>
                Load More Servers
              </>
            )}
          </motion.button>
        </FramerIn>
      )}
    </div>

      {!isLatest && createPortal(
        <AnimatePresence mode="wait">
          {showShuffleToast ? (
            <motion.div
              key="shuffle-toast"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              className="fixed bottom-6 right-3 sm:bottom-8 sm:right-6 md:right-8 z-[50] w-[calc(100%-1.5rem)] max-w-[320px] pointer-events-auto"
            >
              <div className="relative bg-[#313233] border-[3px] border-[#101010] shadow-[5px_5px_0_rgba(0,0,0,0.65)] p-2.5 sm:p-3 flex flex-col gap-2 rounded-none">
                <div className="absolute inset-0 border-t-2 border-l-2 border-white/20 pointer-events-none" />
                <div className="absolute inset-0 border-b-2 border-r-2 border-black/60 pointer-events-none" />

                <div className="relative z-10 flex gap-2.5 items-start">
                  <div className="relative shrink-0 w-12 h-12 border-2 border-[#101010] bg-black/60 shadow-inner flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 border-t border-l border-white/10 border-b border-r border-black/60 pointer-events-none z-10" />
                    <Shuffle className="w-6 h-6 text-[#85fc7e] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                  </div>

                  <div className="flex-1 min-w-0 pr-5">
                    <h4 className="font-pixel text-[10px] sm:text-[11px] text-white uppercase leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Shuffle Servers
                    </h4>
                    <p className="text-zinc-300 font-headline text-[9px] sm:text-[10px] leading-tight mt-1 drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)]">
                      You can shuffle your way through and find your best realm or servers, try it now!
                    </p>
                  </div>

                  <button
                    onClick={handleToastDismiss}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#212223] hover:bg-[#2c2d2e] border border-[#101010] border-t-white/30 border-l-white/30 border-b-black/80 border-r-black/80 text-white/70 hover:text-white shadow-[1px_1px_0_rgba(0,0,0,0.5)] active:translate-y-0.5 flex items-center justify-center transition-all z-20"
                    aria-label="Dismiss shuffle recommendation"
                  >
                    <X size={12} />
                  </button>
                </div>

                <div className="relative z-10 pt-0.5">
                  <motion.button
                    whileTap={shuffleCooldown > 0 ? undefined : { scale: 0.96, y: 1 }}
                    onClick={handleToastShuffle}
                    disabled={shuffleCooldown > 0}
                    className="w-full bg-[#206324] hover:bg-[#28792d] active:bg-[#1a521e] disabled:opacity-50 disabled:cursor-not-allowed border-2 border-t-[#6be377]/40 border-l-[#6be377]/40 border-b-black/90 border-r-black/90 text-white font-pixel text-[8px] sm:text-[9px] uppercase tracking-wider py-1.5 px-3 shadow-[2px_2px_0_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-1.5 font-bold transition-all drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                  >
                    <Shuffle size={11} className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
                    <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{shuffleCooldown > 0 ? `${shuffleCooldown}s` : 'Shuffle'}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="shuffle-button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 md:right-8 z-[40] pointer-events-auto"
            >
              <motion.button
                whileTap={shuffleCooldown > 0 ? undefined : { scale: 0.9, y: 2 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleShuffle();
                }}
                disabled={shuffleCooldown > 0}
                aria-label="Shuffle servers"
                className={`w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-none border-[3px] border-[#101010] shadow-[4px_4px_0_rgba(0,0,0,0.65)] flex flex-col items-center justify-center transition-all relative group select-none ${
                  shuffleCooldown > 0
                    ? 'bg-[#2b2b2b] text-zinc-400 cursor-not-allowed'
                    : 'bg-[#206324] hover:bg-[#28792d] active:bg-[#1a521e] text-white active:translate-y-0.5 active:shadow-none'
                }`}
              >
                <div className={`absolute inset-0 border-t-2 border-l-2 pointer-events-none ${shuffleCooldown > 0 ? 'border-white/10' : 'border-[#6be377]/60'}`} />
                <div className="absolute inset-0 border-b-2 border-r-2 border-black/80 pointer-events-none" />

                <div className="relative z-10 flex items-center justify-center w-full h-full overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    {shuffleCooldown > 0 ? (
                      <motion.span
                        key="countdown"
                        initial={{ x: -24, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 24, opacity: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="text-sm sm:text-base font-pixel text-zinc-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]"
                      >
                        {shuffleCooldown}s
                      </motion.span>
                    ) : (
                      <motion.div
                        key="icon"
                        initial={{ x: -28, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 28, opacity: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                      >
                        <Shuffle className="w-8 h-8 sm:w-8 sm:h-8 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </AnimatedPage>
  )
}

