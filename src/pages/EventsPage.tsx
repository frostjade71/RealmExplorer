import { Link } from 'react-router-dom'
import { ThumbsUp, ChevronLeft, ChevronRight, Trophy, Sparkles, Star, Calendar, Eye, Loader2, Timer, Search, X } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion, AnimatePresence } from 'framer-motion'
import { useOTMWinners, useOTMCompetitors, useUserServers, useUserOTMVotes, useOTMSettings } from '../hooks/queries'
import { useOTMVoteMutation } from '../hooks/mutations'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { RichText } from '../components/RichText'
import type { OTMCategory } from '../types'
import { useIsMobile } from '../hooks/useMediaQuery'
import heroVideo from '../assets/hero/heroRE.mp4'
// logo imported from public/logoRE.png as /logoRE.png
import { slugify } from '../lib/urlUtils'
import { OTMCompetitionTimer } from '../components/OTMCompetitionTimer'

const CATEGORIES: { id: OTMCategory; label: string; icon: any }[] = [
  { id: 'realm', label: 'Realm of the Month', icon: Sparkles },
  { id: 'server', label: 'Server of the Month', icon: Trophy },
  { id: 'developer', label: 'Developer of the Month', icon: Star },
  { id: 'builder', label: 'Builder of the Month', icon: Calendar },
]

export function EventsPage() {
  const isMobile = useIsMobile()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(12)
  const { user, profile } = useAuth()
  
  // Reset pagination/search when category changes
  useEffect(() => {
    setSearchQuery('')
    setVisibleCount(12)
  }, [currentIndex])

  const { data: winners } = useOTMWinners()
  const { data: settings } = useOTMSettings()
  const { data: userServers = [] } = useUserServers(user?.id)
  
  const currentCategory = CATEGORIES[currentIndex]
  const isSystemComingSoon = currentCategory.id === 'developer' || currentCategory.id === 'builder'
  const { data: categoryCompetitors = [], isLoading: loadingCompetitors } = useOTMCompetitors(currentCategory.id, !isSystemComingSoon)
  const { data: userVotes = [] } = useUserOTMVotes(user?.id)

  const voteMutation = useOTMVoteMutation()
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false)
  const [voteTarget, setVoteTarget] = useState<any>(null)

  const activeWinner = useMemo(() => {
    return winners?.find(w => w.category === currentCategory.id)
  }, [winners, currentCategory])

  const filteredCompetitors = useMemo(() => {
    if (!searchQuery) return categoryCompetitors

    return categoryCompetitors.filter(competitor => {
      const isPerson = competitor.category === 'developer' || competitor.category === 'builder'
      const displayName = (isPerson 
        ? competitor.profiles?.discord_username 
        : competitor.servers?.name) || ''
      return displayName.toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [categoryCompetitors, searchQuery])

  const displayedCompetitors = useMemo(() => {
    return filteredCompetitors.slice(0, visibleCount)
  }, [filteredCompetitors, visibleCount])

  const isCompetitionActive = useMemo(() => {
    if (!settings) return true
    return settings.competition_status[currentCategory.id]
  }, [settings, currentCategory])

  const nextStartTime = useMemo(() => {
    if (!settings) return null
    return settings.next_start_times[currentCategory.id]
  }, [settings, currentCategory])

  const heroBackground = useMemo(() => {
    const isServerOrRealm = currentCategory.id === 'realm' || currentCategory.id === 'server';
    const bannerUrl = activeWinner?.servers?.banner_url;
    
    if (isServerOrRealm && bannerUrl) {
      return { type: 'image', url: bannerUrl, key: bannerUrl };
    }
    return { type: 'video', url: heroVideo, key: 'default-video' };
  }, [currentCategory.id, activeWinner, heroVideo]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % CATEGORIES.length)
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + CATEGORIES.length) % CATEGORIES.length)

  const defaultMonth = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [])

  const handleVoteClick = (competitor: any) => {
    if (!user) {
      toast.error('Login Required', { description: 'Please sign in to vote for OTM.' })
      return
    }
    
    if (userServers.length === 0) {
      toast.error('Eligibility Required', { description: 'You must own at least one approved server to vote.' })
      return
    }

    setVoteTarget(competitor)
    setIsVoteModalOpen(true)
  }

  const finalizeVoteWithData = (data: any) => {
    if (!data || !user) return
    
    voteMutation.mutate({ 
      userId: user.id, 
      serverId: data.server_id,
      targetUserId: data.user_id,
      category: currentCategory.id,
      voterName: profile?.discord_username || 'Unknown'
    }, {
      onSuccess: () => {
        setIsVoteModalOpen(false)
        setVoteTarget(null)
        toast.success('Vote Cast!', { description: `You supported ${data.servers?.name || data.profiles?.discord_username}` })
      }
    })
  }

  const getCooldownStatus = (id: string) => {
    const lastVote = userVotes.find(v => v.id === id)
    if (!lastVote) return { active: false, remaining: 0 }

    const lastTime = new Date(lastVote.created_at).getTime()
    const now = new Date().getTime()
    const diff = lastTime + 24 * 60 * 60 * 1000 - now
    
    return { active: diff > 0, remaining: diff }
  }

  return (
    <>
    <AnimatedPage>
      {/* Hero Section - OTM Cinematic Carousel */}
      <header className="relative pt-32 pb-20 px-8 overflow-hidden min-h-[60vh] flex flex-col items-center justify-center">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence>
            {heroBackground.type === 'video' ? (
              <motion.video 
                key="default-video"
                initial={isMobile ? { opacity: 0 } : { scale: 1.1, opacity: 0 }}
                animate={isMobile ? { opacity: 0.5 } : { scale: 1, opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={isMobile ? { duration: 0.8, ease: "easeOut" } : { duration: 1.2, ease: "easeOut" }}
                src={heroBackground.url} 
                autoPlay 
                loop 
                muted 
                playsInline
                className="absolute inset-0 w-full h-full object-cover block will-change-[opacity,transform]"
              />
            ) : (
              <motion.div
                key={heroBackground.key}
                initial={isMobile ? { opacity: 0 } : { scale: 1.05, opacity: 0 }}
                animate={isMobile ? { opacity: 0.5 } : { scale: 1, opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 will-change-[opacity,transform]"
              >
                <img 
                  src={heroBackground.url}
                  alt="Winner Cover"
                  loading="eager"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Dark Cinematic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-green-950/70 z-10"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-20 will-change-transform">
          <AnimatePresence mode="popLayout">
            <motion.div 
              key={currentCategory.id}
              initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isMobile ? -10 : -20 }}
              transition={{ 
                duration: isMobile ? 0.3 : 0.4, 
                ease: "easeOut" 
              }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: isMobile ? 5 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {/* Minecraft-style Badge */}
                <div className={`inline-flex items-center gap-2 bg-zinc-800/90 border-t-2 border-l-2 border-white/20 border-r-2 border-b-2 border-black/50 px-4 py-1.5 mb-8 text-realm-green shadow-[2px_2px_0px_rgba(0,0,0,0.4)] ${isMobile ? 'backdrop-blur-none' : 'backdrop-blur-md'}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-pixel text-[10px] tracking-widest uppercase">
                    {activeWinner?.month || defaultMonth}
                  </span>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: isMobile ? 5 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 
                  className="font-pixel text-white text-3xl md:text-5xl leading-tight mb-8 drop-shadow-2xl"
                  style={{ textShadow: '0 4px 12px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.4)' }}
                >
                   {currentCategory.label.split(' ')[0]} <br/>
                   <span className="text-realm-green">{currentCategory.label.split(' ').slice(1).join(' ')}</span>
                </h1>
              </motion.div>

              {activeWinner ? (
                <motion.div 
                  initial={{ opacity: 0, y: isMobile ? 5 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center"
                >
                  {/* Clickable Winner Group */}
                  <Link 
                    to={(() => {
                      const isPerson = activeWinner.category === 'developer' || activeWinner.category === 'builder'
                      if (isPerson) {
                        return activeWinner.profiles?.discord_username ? `/profile/${activeWinner.profiles.discord_username}` : '#'
                      }
                      return activeWinner.servers ? `/server/${activeWinner.servers.slug || slugify(activeWinner.servers.name)}` : '#'
                    })()}
                    className="block group no-underline"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-col md:flex-row items-center gap-6 mb-8 cursor-pointer"
                    >
                      <img 
                        src={activeWinner.winner_image_url || activeWinner.servers?.icon_url || "/logoRE.png"} 
                        alt="Winner" 
                        className="w-16 h-16 rounded-xl object-cover border-2 border-yellow-400 shadow-2xl shadow-yellow-400/20 group-hover:border-white transition-colors"
                      />
                      <div className="text-center md:text-left">
                        <h2 className="text-xl md:text-2xl font-pixel text-white drop-shadow-lg transition-colors">
                          {activeWinner.winner_name || activeWinner.servers?.name}
                        </h2>
                      </div>
                    </motion.div>
                  </Link>
                  {activeWinner.description && (
                    <div className="text-white/60 font-headline text-sm md:text-base max-w-xl leading-relaxed italic drop-shadow-md mx-auto">
                      <RichText content={activeWinner.description} />
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className={`py-5 px-8 rounded-2xl border border-white/10 bg-black/40 ${isMobile ? 'backdrop-blur-none' : 'backdrop-blur-md'}`}>
                    <p className="text-lg font-pixel text-white/40">No Previous Winners</p>
                    <p className="text-white/20 font-headline text-xs mt-1 uppercase tracking-widest leading-none">
                      {isSystemComingSoon ? 'Coming Soon' : 'Selection in progress'}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls Group */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none flex justify-between px-4 lg:px-0">
             <button 
              onClick={prevSlide}
              className="pointer-events-auto w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-realm-green hover:text-zinc-950 transition-[background-color,color,transform] text-white/40 hover:scale-110"
             >
               <ChevronLeft className="w-5 h-5" />
             </button>
             <button 
              onClick={nextSlide}
              className="pointer-events-auto w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-realm-green hover:text-zinc-950 transition-all text-white/40 hover:scale-110"
             >
               <ChevronRight className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Cinematic Fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-20"></div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-20">
      {/* Vote Section */}
      <FramerIn delay={0.2}>
        <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-pixel text-white uppercase tracking-wide">Vote Your Next OTM!</h2>
            <p className="text-zinc-500 font-headline text-sm">Support your favorites and help them be the next OTM winner!</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Search Bar - Full width on mobile, fixed width on desktop */}
            <div className="relative group w-full sm:flex-1 lg:w-[260px] lg:flex-none order-2 sm:order-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-realm-green transition-colors" />
              <input 
                type="text" 
                placeholder={`search ${currentCategory.id}...`} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1b] border-2 border-[#101010] pl-9 pr-8 py-2 md:py-2.5 text-[10px] md:text-sm text-white placeholder-zinc-600 placeholder:text-[8px] md:placeholder:text-[10px] outline-none focus:border-realm-green/50 transition-all font-pixel uppercase tracking-widest shadow-[2px_2px_0_rgba(0,0,0,0.4)]"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-2 order-1 sm:order-2 ml-auto sm:ml-0">
               <button 
                onClick={prevSlide}
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-realm-green hover:text-zinc-950 transition-[background-color,color,transform] text-white/40 hover:scale-110 active:scale-95 group shadow-lg"
                title="Previous Category"
               >
                 <ChevronLeft className="w-5 h-5" />
               </button>
               <button 
                onClick={nextSlide}
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-realm-green hover:text-zinc-950 transition-[background-color,color,transform] text-white/40 hover:scale-110 active:scale-95 group shadow-lg"
                title="Next Category"
               >
                 <ChevronRight className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>

        {isSystemComingSoon ? (
          <div className="flex justify-center py-10">
            <FramerIn delay={0.1}>
              <div className="w-full sm:w-[240px] relative group">
                <div className="relative bg-[#313233] border-4 border-[#101010] p-8 md:p-10 flex flex-col items-center text-center shadow-[6px_6px_0_rgba(0,0,0,0.5)]">
                  {/* Inner Highlight Border */}
                  <div className="absolute inset-0 border-t-2 border-l-2 border-white/10 pointer-events-none" />
                  <div className="absolute inset-0 border-b-2 border-r-2 border-black/40 pointer-events-none" />
                  
                  <div className="w-16 h-16 bg-black/20 border-2 border-[#101010] flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 border-t border-l border-white/5 pointer-events-none" />
                    <Sparkles className="w-8 h-8 text-realm-green/40 group-hover:text-realm-green transition-colors" />
                  </div>
                  
                  <h3 className="text-[10px] md:text-xs font-pixel text-white mb-2 uppercase tracking-widest leading-none">Coming Soon</h3>
                  <p className="text-[9px] md:text-[10px] text-zinc-500 font-headline leading-relaxed uppercase tracking-widest">
                    Our {currentCategory.label} system is being prepared.
                  </p>

                  <div className="mt-8 flex items-center gap-2 px-3 py-1.5 bg-black/40 border-2 border-[#101010] shadow-[2px_2px_0_rgba(0,0,0,0.4)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-realm-green animate-pulse" />
                    <span className="text-[7px] font-pixel text-white/40 uppercase tracking-[0.2em]">Integrating</span>
                  </div>
                </div>
              </div>
            </FramerIn>
          </div>
        ) : !isCompetitionActive ? (
          <OTMCompetitionTimer 
            category={currentCategory.id} 
            nextStartTime={nextStartTime || ''} 
          />
        ) : (
          <>
            {(filteredCompetitors.length > 0 || loadingCompetitors) ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
                {loadingCompetitors ? (
                  Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="aspect-[3/4] rounded-xl bg-white/5 animate-pulse border border-white/5" />
                  ))
                ) : displayedCompetitors.map((competitor, idx) => {
                  const isPerson = competitor.category === 'developer' || competitor.category === 'builder'
                  const displayName = isPerson 
                    ? competitor.profiles?.discord_username 
                    : competitor.servers?.name
                  const displayImage = isPerson 
                    ? competitor.profiles?.discord_avatar 
                    : competitor.servers?.icon_url
                  
                  const id = competitor.server_id || competitor.user_id
                  const cooldown = getCooldownStatus(id)

                  return (
                    <FramerIn key={id} delay={idx * 0.05}>
                      <motion.div 
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative group cursor-pointer h-full"
                      >
                        <div className="relative h-full bg-[#313233] border-4 border-[#101010] p-2.5 md:p-3 flex flex-col items-center text-center shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-[background-color,transform] transform-gpu group-hover:bg-[#3c3c43]">
                          {/* Inner Highlight Border */}
                          <div className="absolute inset-0 border-t-2 border-l-2 border-white/10 pointer-events-none" />
                          <div className="absolute inset-0 border-b-2 border-r-2 border-black/40 pointer-events-none" />

                          <div className="relative z-10 flex flex-col h-full items-center w-full">
                            {/* Image Frame */}
                            <Link 
                              to={isPerson 
                                ? (competitor.profiles?.discord_username ? `/profile/${competitor.profiles.discord_username}` : '#')
                                : `/server/${competitor.servers?.slug || slugify(competitor.servers?.name || '')}`
                              }
                              className="block mb-4 group/link"
                            >
                              <div className={`relative w-20 h-20 md:w-24 md:h-24 mx-auto border-4 border-realm-green bg-black/40 shadow-inner overflow-hidden group-hover:scale-105 transition-transform duration-300 ${isPerson ? 'rounded-full' : 'rounded-none'}`}>
                                <img 
                                  src={displayImage || (isPerson ? "/logoRE.png" : 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&q=80&w=800')} 
                                  alt={displayName || 'Competitor'}
                                  className="w-full h-full object-cover p-1 group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            </Link>

                            <h3 className="text-[9px] md:text-xs font-pixel text-white mb-2 md:mb-3 line-clamp-1 w-full drop-shadow-md uppercase">
                              {displayName || 'Candidate'}
                            </h3>
                            
                            <div className="mt-auto w-full space-y-2 md:space-y-4">
                              <div className="flex items-center justify-between px-1 relative">
                                <span className="text-[7px] md:text-[8px] font-pixel text-white/30 uppercase tracking-[0.2em]">Votes</span>
                                <span className="text-sm md:text-lg font-pixel text-realm-green font-bold leading-none">{competitor.total_votes || 0}</span>
                              </div>

                              <button 
                                disabled={voteMutation.isPending || cooldown.active}
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleVoteClick(competitor)
                                }}
                                className={`relative overflow-hidden block w-full py-2 md:py-2 border-2 border-[#101010] font-pixel text-[8px] md:text-[9px] uppercase tracking-widest transition-[background-color,color,border-color,box-shadow] shadow-[2px_2px_0_rgba(0,0,0,0.4)] ${
                                  cooldown.active
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-zinc-700'
                                    : 'bg-white/5 text-white hover:bg-realm-green hover:text-zinc-950'
                                }`}
                              >
                                {voteMutation.isPending ? (
                                  <div className="flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 animate-spin text-realm-green" />
                                  </div>
                                ) : cooldown.active ? (
                                    <div className="flex items-center justify-center gap-1.5 py-1">
                                      <Timer className="w-3 h-3 text-realm-green animate-pulse" />
                                      <span>{new Date(cooldown.remaining).toISOString().substring(11, 19)}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2">
                                      <ThumbsUp className="w-3 h-3" />
                                      <span>Cast Vote</span>
                                    </div>
                                  )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </FramerIn>
                  )
                })}
              </div>
            ) : searchQuery ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                <Search className="w-12 h-12 text-zinc-800 mb-4" />
                <h3 className="text-xl font-pixel text-white/40 uppercase">No Matches Found</h3>
                <p className="text-zinc-600 font-headline text-sm mt-2">Try a different search term</p>
              </div>
            ) : (
              <div className="col-span-full py-20 bg-zinc-900/40 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center backdrop-blur-none md:backdrop-blur-sm relative overflow-hidden group transform-gpu">
                {/* Background Decor */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--realm-green)_0%,transparent_70%)] group-hover:opacity-20 transition-opacity" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-realm-green/10 rounded-3xl flex items-center justify-center mb-6 border border-realm-green/20 group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="w-10 h-10 text-realm-green" />
                  </div>
                  
                  <h3 className="text-2xl font-pixel text-white mb-3 uppercase tracking-wider">No Participants Yet</h3>
                  
                  <p className="text-zinc-500 font-headline text-sm max-w-sm leading-relaxed">
                    Nominations are still open for this category. Check back soon to cast your vote!
                  </p>
                </div>
              </div>
            )}

            {!loadingCompetitors && filteredCompetitors.length > visibleCount && (
              <FramerIn delay={0.1} className="mt-12 flex justify-center">
                <button
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="group relative overflow-hidden bg-[#313233] border-4 border-[#101010] px-8 py-3 flex items-center justify-center gap-3 shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-all hover:bg-[#3c3c43] active:scale-95"
                >
                   {/* Inner Highlight Border */}
                   <div className="absolute inset-0 border-t-2 border-l-2 border-white/5 pointer-events-none" />
                   <div className="absolute inset-0 border-b-2 border-r-2 border-black/20 pointer-events-none" />
                   
                   <span className="font-pixel text-[10px] md:text-sm text-white uppercase tracking-widest flex items-center gap-2">
                     Load More Candidates
                   </span>
                   <ChevronRight className="w-4 h-4 text-realm-green group-hover:translate-x-1 transition-transform rotate-90" />
                </button>
              </FramerIn>
            )}
          </>
        )}
        </FramerIn>
      </div>


    </AnimatedPage>
      <ConfirmationModal
        isOpen={isVoteModalOpen}
        onClose={() => {
          setIsVoteModalOpen(false)
          setVoteTarget(null)
        }}
        onConfirm={() => finalizeVoteWithData(voteTarget)}
        title="Confirm Vote"
        message={voteTarget ? `Cast your vote for ${voteTarget.servers?.name || voteTarget.profiles?.discord_username}?` : ''}
        confirmLabel="Yes, Vote"
        variant="pixel"
        isLoading={voteMutation.isPending}
      />
    </>
  )
}
