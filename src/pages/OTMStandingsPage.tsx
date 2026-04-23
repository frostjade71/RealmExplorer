import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Sparkles, Calendar, Search, X, Medal, Crown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { useOTMCompetitors, useOTMSettings } from '../hooks/queries'
import { useIsMobile } from '../hooks/useMediaQuery'
import { slugify } from '../lib/urlUtils'
import { OTMCompetitionTimer } from '../components/OTMCompetitionTimer'
import heroVideo from '../assets/hero/heroRE.mp4'
import firstPlaceIcon from '../assets/leaderboards/5336-1st.png'
import secondPlaceIcon from '../assets/leaderboards/6308-2nd.png'
import thirdPlaceIcon from '../assets/leaderboards/4162-3rd.png'
import type { OTMCategory } from '../types'

const CATEGORIES: { id: OTMCategory; label: string; icon: any }[] = [
  { id: 'realm', label: 'Realm of the Month', icon: Sparkles },
  { id: 'server', label: 'Server of the Month', icon: Trophy },
  { id: 'developer', label: 'Developer of the Month', icon: Star },
  { id: 'builder', label: 'Builder of the Month', icon: Calendar },
]

export function OTMStandingsPage() {
  const isMobile = useIsMobile()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  
  const currentCategory = CATEGORIES[currentIndex]
  const isSystemComingSoon = currentCategory.id === 'developer' || currentCategory.id === 'builder'
  
  const { data: categoryCompetitors = [], isLoading: loadingCompetitors } = useOTMCompetitors(currentCategory.id, !isSystemComingSoon)
  const { data: settings } = useOTMSettings()

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % CATEGORIES.length)
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + CATEGORIES.length) % CATEGORIES.length)

  const sortedCompetitors = useMemo(() => {
    return [...categoryCompetitors].sort((a, b) => (b.total_votes || 0) - (a.total_votes || 0))
  }, [categoryCompetitors])

  const filteredCompetitors = useMemo(() => {
    if (!searchQuery) return sortedCompetitors

    return sortedCompetitors.filter(competitor => {
      const isPerson = competitor.category === 'developer' || competitor.category === 'builder'
      const displayName = (isPerson 
        ? competitor.profiles?.discord_username 
        : competitor.servers?.name) || ''
      return displayName.toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [sortedCompetitors, searchQuery])

  const podium = useMemo(() => filteredCompetitors.slice(0, 3), [filteredCompetitors])

  const isCompetitionActive = useMemo(() => {
    if (!settings) return true
    return settings.competition_status[currentCategory.id]
  }, [settings, currentCategory])

  return (
    <AnimatedPage>
      {/* Hero Section */}
      <header className="relative pt-32 pb-16 px-8 overflow-hidden min-h-[50vh] flex flex-col items-center justify-center bg-zinc-950">
        <motion.video 
          initial={isMobile ? { opacity: 0 } : { scale: 1.1, opacity: 0 }}
          animate={isMobile ? { opacity: 0.5 } : { scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroVideo} 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 block will-change-[opacity,transform]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-green-950/90 z-10"></div>
        
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
              className="flex flex-col items-center"
            >
              <div className={`inline-flex items-center gap-3 bg-zinc-800/90 border-t-2 border-l-2 border-white/20 border-r-2 border-b-2 border-black/50 px-3 py-1.5 mb-8 text-realm-green shadow-[2px_2px_0px_rgba(0,0,0,0.4)] ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'}`}>
                <div className="flex items-center gap-2 border-r border-white/10 pr-3 mr-1">
                  <span className="font-pixel text-[9px] tracking-widest uppercase text-white/60">Closes in:</span>
                </div>
                {isCompetitionActive && settings?.end_times?.[currentCategory.id] && (
                  <OTMCompetitionTimer 
                    category={currentCategory.id} 
                    targetTime={settings.end_times[currentCategory.id]!} 
                    variant="minimal"
                  />
                )}
              </div>

              <h1 className="font-pixel text-white text-2xl md:text-4xl text-center mb-4 drop-shadow-2xl">
                {currentCategory.label.split(' ')[0]} <span className="text-realm-green">{currentCategory.label.split(' ').slice(1).join(' ')}</span>
              </h1>
              <p className="text-zinc-400 font-headline text-center text-xs md:text-sm mb-8 uppercase tracking-[0.2em]">The Race to the Top</p>

              {/* Podium */}
              {!loadingCompetitors && filteredCompetitors.length > 0 && (
                <div className="flex items-end justify-center mt-6 w-full max-w-4xl px-2 md:px-0">
                  {/* 2nd Place */}
                  {podium[1] && (
                    <FramerIn delay={0.4} className="order-1 w-1/3 group">
                      <Link 
                        to={podium[1].category === 'developer' || podium[1].category === 'builder' 
                          ? `/profile/${podium[1].profiles?.discord_username}` 
                          : `/server/${podium[1].servers?.slug || slugify(podium[1].servers?.name || '')}`} 
                        className="flex flex-col items-center"
                      >
                        <div className="relative mb-2 md:mb-4">
                          <img src={secondPlaceIcon} className="absolute -top-3 -left-3 md:-top-6 md:-left-6 w-6 h-6 md:w-12 md:h-12 z-30 object-contain drop-shadow-lg" alt="2nd Place" />
                          <img 
                            src={(podium[1].category === 'developer' || podium[1].category === 'builder' ? podium[1].profiles?.discord_avatar : podium[1].servers?.icon_url) || "/logoRE.png"} 
                            className={`w-10 h-10 md:w-16 md:h-16 border-2 md:border-4 border-zinc-400 object-cover shadow-2xl group-hover:scale-110 transition-transform ${podium[1].category === 'developer' || podium[1].category === 'builder' ? 'rounded-full' : 'rounded-sm md:rounded-lg'}`}
                            alt="2nd Place"
                          />
                        </div>
                        <div className={`h-14 md:h-20 w-full bg-gradient-to-b from-zinc-400/20 to-zinc-400/5 ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'} border-t-2 border-zinc-400/30 rounded-t-sm md:rounded-t-md flex flex-col items-center justify-center p-1 md:p-2`}>
                          <span className="text-white font-pixel text-[6px] md:text-[9px] text-center line-clamp-1 mb-0.5">
                            {(podium[1].category === 'developer' || podium[1].category === 'builder' ? podium[1].profiles?.discord_username : podium[1].servers?.name) || 'Unknown'}
                          </span>
                          <div className="flex items-center gap-1 md:gap-1.5 text-zinc-400 font-headline text-[5px] md:text-[8px] uppercase tracking-widest font-bold">
                            <Trophy className="w-1.5 h-1.5 md:w-2 md:h-2" />
                            {podium[1].total_votes} Votes
                          </div>
                        </div>
                      </Link>
                    </FramerIn>
                  )}

                  {/* 1st Place */}
                  {podium[0] && (
                    <FramerIn delay={0.6} className="order-2 w-[40%] md:w-2/5 z-20 group -mb-2 md:-mb-4">
                      <Link 
                        to={podium[0].category === 'developer' || podium[0].category === 'builder' 
                          ? `/profile/${podium[0].profiles?.discord_username}` 
                          : `/server/${podium[0].servers?.slug || slugify(podium[0].servers?.name || '')}`} 
                        className="flex flex-col items-center"
                      >
                        <div className="relative mb-3 md:mb-6">
                          <img src={firstPlaceIcon} className="absolute -top-4 -left-4 md:-top-8 md:-left-8 w-8 h-8 md:w-16 md:h-16 z-30 object-contain drop-shadow-xl" alt="1st Place" />
                          <img 
                            src={(podium[0].category === 'developer' || podium[0].category === 'builder' ? podium[0].profiles?.discord_avatar : podium[0].servers?.icon_url) || "/logoRE.png"} 
                            className={`w-14 h-14 md:w-24 md:h-24 border-2 md:border-4 border-yellow-500 object-cover shadow-[0_0_50px_rgba(234,179,8,0.3)] group-hover:scale-110 transition-transform ${podium[0].category === 'developer' || podium[0].category === 'builder' ? 'rounded-full' : 'rounded-md md:rounded-xl'}`}
                            alt="1st Place"
                          />
                          <Crown className="absolute -top-6 md:-top-10 left-1/2 -translate-x-1/2 w-5 h-5 md:w-8 md:h-8 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                        </div>
                        <div className={`h-20 md:h-28 w-full bg-gradient-to-b from-yellow-500/30 to-yellow-500/5 ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'} border-t-2 border-yellow-500/40 rounded-t-md md:rounded-t-lg flex flex-col items-center justify-center p-2 md:p-4`}>
                          <span className="text-white font-pixel text-[8px] md:text-xs text-center line-clamp-1 mb-1 md:mb-1.5">
                            {(podium[0].category === 'developer' || podium[0].category === 'builder' ? podium[0].profiles?.discord_username : podium[0].servers?.name) || 'Unknown'}
                          </span>
                          <div className="flex items-center gap-1 md:gap-2 text-yellow-500 font-headline text-[7px] md:text-[9px] uppercase tracking-widest font-black">
                            <Trophy className="w-2 h-2 md:w-3 md:h-3" />
                            {podium[0].total_votes} Votes
                          </div>
                        </div>
                      </Link>
                    </FramerIn>
                  )}

                  {/* 3rd Place */}
                  {podium[2] && (
                    <FramerIn delay={0.5} className="order-3 w-1/3 group">
                      <Link 
                        to={podium[2].category === 'developer' || podium[2].category === 'builder' 
                          ? `/profile/${podium[2].profiles?.discord_username}` 
                          : `/server/${podium[2].servers?.slug || slugify(podium[2].servers?.name || '')}`} 
                        className="flex flex-col items-center"
                      >
                        <div className="relative mb-2 md:mb-4">
                          <img src={thirdPlaceIcon} className="absolute -top-3 -left-3 md:-top-6 md:-left-6 w-6 h-6 md:w-12 md:h-12 z-30 object-contain drop-shadow-lg" alt="3rd Place" />
                          <img 
                            src={(podium[2].category === 'developer' || podium[2].category === 'builder' ? podium[2].profiles?.discord_avatar : podium[2].servers?.icon_url) || "/logoRE.png"} 
                            className={`w-8 h-8 md:w-14 md:h-14 border-2 md:border-4 border-orange-700 object-cover shadow-2xl group-hover:scale-110 transition-transform ${podium[2].category === 'developer' || podium[2].category === 'builder' ? 'rounded-full' : 'rounded-sm md:rounded-lg'}`}
                            alt="3rd Place"
                          />
                        </div>
                        <div className={`h-10 md:h-14 w-full bg-gradient-to-b from-orange-700/20 to-orange-700/5 ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'} border-t-2 border-orange-700/30 rounded-t-sm md:rounded-t-md flex flex-col items-center justify-center p-1 md:p-1.5`}>
                          <span className="text-white font-pixel text-[5px] md:text-[8px] text-center line-clamp-1">
                            {(podium[2].category === 'developer' || podium[2].category === 'builder' ? podium[2].profiles?.discord_username : podium[2].servers?.name) || 'Unknown'}
                          </span>
                          <div className="flex items-center gap-0.5 md:gap-1 text-orange-700 font-headline text-[5px] md:text-[7px] uppercase tracking-widest font-bold">
                            <Trophy className="w-1 md:w-1.5 h-1 md:h-1.5" />
                            {podium[2].total_votes} Votes
                          </div>
                        </div>
                      </Link>
                    </FramerIn>
                  )}
                </div>
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
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-20"></div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Categories & Timer */}
          <aside className="lg:w-72 flex flex-col gap-6 order-2 lg:order-1">
            <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-5 backdrop-blur-md">
              <h2 className="font-pixel text-white text-[9px] md:text-[10px] mb-4 uppercase tracking-widest opacity-50">Categories</h2>
              <div className="flex flex-wrap gap-2.5">
                {CATEGORIES.map((cat, idx) => (
                  <button
                    key={cat.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`px-3 py-2 font-pixel text-[8px] uppercase tracking-widest transition-all relative group flex items-center gap-2 ${
                      currentIndex === idx
                        ? 'bg-realm-green text-zinc-950 shadow-[3px_3px_0px_rgba(0,0,0,0.4)] translate-y-[-1px]'
                        : 'bg-zinc-900/50 text-white/40 hover:text-white border-2 border-white/5'
                    }`}
                  >
                    {/* Minecraft hover highlight for inactive */}
                    {currentIndex !== idx && (
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    
                    <cat.icon className={`w-3 h-3 ${currentIndex === idx ? 'text-zinc-950' : 'text-zinc-500 group-hover:text-white'}`} />
                    <span>{cat.label.replace(' of the Month', '')}</span>

                    {/* Active state inner highlight */}
                    {currentIndex === idx && (
                      <div className="absolute inset-0 border-t-2 border-l-2 border-white/30 pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            </div>

          </aside>

          {/* Main Content - Standings List */}
          <div className="flex-1 order-1 lg:order-2">
            <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-pixel text-white uppercase tracking-wide">Full Rankings</h2>
                  <p className="text-zinc-500 font-headline text-[10px] md:text-sm">Real-time standings for {currentCategory.label}</p>
                </div>
              </div>

              <div className="relative group w-full sm:w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-realm-green transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search standings..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a1a1b] border-2 border-[#101010] pl-9 pr-8 py-2 text-sm text-white placeholder-zinc-600 placeholder:text-[8px] md:placeholder:text-[10px] outline-none focus:border-realm-green/50 transition-all font-pixel uppercase tracking-widest shadow-[2px_2px_0_rgba(0,0,0,0.4)]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1 gap-3">
              {loadingCompetitors ? (
                Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-14 rounded-lg bg-white/5 animate-pulse border border-white/5" />
                ))
              ) : filteredCompetitors.length > 0 ? (
                <>
                  {filteredCompetitors.map((competitor, idx) => {
                    const isPerson = competitor.category === 'developer' || competitor.category === 'builder'
                    const displayName = isPerson ? competitor.profiles?.discord_username : competitor.servers?.name
                    const displayImage = isPerson ? competitor.profiles?.discord_avatar : competitor.servers?.icon_url
                    const rank = idx + 1

                    return (
                      <FramerIn key={competitor.id} delay={idx * 0.05}>
                        <Link 
                          to={isPerson 
                            ? (competitor.profiles?.discord_username ? `/profile/${competitor.profiles.discord_username}` : '#')
                            : `/server/${competitor.servers?.slug || slugify(competitor.servers?.name || '')}`
                          }
                          className={`flex items-center gap-3 p-2.5 md:p-3 rounded-lg bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/60 transition-all group ${rank <= 3 ? 'hover:border-realm-green' : 'hover:border-realm-green/20'}`}
                        >
                          <div className="w-7 flex justify-center shrink-0">
                            {rank === 1 ? <Crown className="w-4 h-4 text-yellow-500" /> : 
                             rank === 2 ? <Medal className="w-4 h-4 text-zinc-400" /> :
                             rank === 3 ? <Medal className="w-4 h-4 text-orange-700" /> :
                             <span className="font-pixel text-zinc-700 text-[9px]">{rank}</span>}
                          </div>
                          
                          <div className={`relative w-8 h-8 md:w-10 md:h-10 shrink-0 overflow-hidden border border-white/10 ${isPerson ? 'rounded-full' : 'rounded-lg'}`}>
                            <img src={displayImage || "/logoRE.png"} className="w-full h-full object-cover" alt={displayName || 'Competitor'} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-pixel text-[9px] md:text-[11px] group-hover:text-realm-green transition-colors truncate uppercase tracking-tight">
                              {displayName || 'Candidate'}
                            </h3>
                            <p className="text-zinc-600 font-headline text-[7px] md:text-[9px] uppercase tracking-widest mt-0.5">{isPerson ? competitor.category : competitor.servers?.type}</p>
                          </div>

                          <div className="text-right shrink-0 pr-1">
                            <div className="text-realm-green font-pixel text-xs md:text-sm">{competitor.total_votes || 0}</div>
                            <div className="text-zinc-600 font-headline text-[6px] md:text-[7px] uppercase font-bold tracking-widest">Votes</div>
                          </div>
                        </Link>
                      </FramerIn>
                    )
                  })}
                </>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                   <Trophy className="w-12 h-12 mb-4" />
                   <p className="font-pixel text-sm">No contenders found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </AnimatedPage>
  )
}
