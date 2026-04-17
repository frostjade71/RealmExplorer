import { Link } from 'react-router-dom'
import { ThumbsUp, ChevronLeft, ChevronRight, Trophy, Sparkles, Star, Calendar, Eye, Loader2 } from 'lucide-react'
import { useState, useMemo } from 'react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion, AnimatePresence } from 'framer-motion'
import { useOTMWinners, useOTMCompetitors, useUserServers, useUserOTMVotes } from '../hooks/queries'
import { useOTMVoteMutation, useOTMUnvoteMutation } from '../hooks/mutations'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { RichText } from '../components/RichText'
import type { OTMCategory } from '../types'
import { useIsMobile } from '../hooks/useMediaQuery'
import heroVideo from '../assets/hero/heroRE.mp4'
import logo from '../assets/rerealm.webp'
import esmeraldaIcon from '../assets/OTM/185424-esmeralda.png'
import { slugify } from '../lib/urlUtils'

const CATEGORIES: { id: OTMCategory; label: string; icon: any }[] = [
  { id: 'realm', label: 'Realm of the Month', icon: Sparkles },
  { id: 'server', label: 'Server of the Month', icon: Trophy },
  { id: 'developer', label: 'Developer of the Month', icon: Star },
  { id: 'builder', label: 'Builder of the Month', icon: Calendar },
]

export function EventsPage() {
  const isMobile = useIsMobile()
  const [currentIndex, setCurrentIndex] = useState(0)
  const { user, profile } = useAuth()
  const { data: winners } = useOTMWinners()
  const { data: competitors } = useOTMCompetitors()
  const { data: userServers = [] } = useUserServers(user?.id)
  const { data: userVotes = [] } = useUserOTMVotes(user?.id)

  const voteMutation = useOTMVoteMutation()
  const unvoteMutation = useOTMUnvoteMutation()

  const currentCategory = CATEGORIES[currentIndex]
  
  const activeWinner = useMemo(() => {
    return winners?.find(w => w.category === currentCategory.id)
  }, [winners, currentCategory])

  const heroBackground = useMemo(() => {
    const isServerOrRealm = currentCategory.id === 'realm' || currentCategory.id === 'server';
    const bannerUrl = activeWinner?.servers?.banner_url;
    
    if (isServerOrRealm && bannerUrl) {
      return { type: 'image', url: bannerUrl, key: bannerUrl };
    }
    return { type: 'video', url: heroVideo, key: 'default-video' };
  }, [currentCategory.id, activeWinner, heroVideo]);

  const categoryCompetitors = useMemo(() => {
    return competitors?.filter(c => c.category === currentCategory.id)
  }, [competitors, currentCategory])

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % CATEGORIES.length)
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + CATEGORIES.length) % CATEGORIES.length)

  const defaultMonth = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [])

  return (
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
                initial={isMobile ? { opacity: 0 } : { scale: 1.1, opacity: 0 }}
                animate={isMobile ? { opacity: 0.5 } : { scale: 1, opacity: 0.5 }}
                exit={{ opacity: 0, scale: isMobile ? 1 : 1.05 }}
                transition={isMobile ? { duration: 0.8, ease: "easeOut" } : { duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0 will-change-[opacity,transform]"
              >
                <img 
                  src={heroBackground.url}
                  alt="Winner Cover"
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
                <div className={`inline-flex items-center gap-2 bg-zinc-800/90 border-t-2 border-l-2 border-white/20 border-r-2 border-b-2 border-black/50 px-4 py-1.5 mb-8 text-realm-green shadow-[2px_2px_0px_rgba(0,0,0,0.4)] ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-pixel text-[10px] tracking-widest uppercase">
                    {activeWinner?.month || categoryCompetitors?.[0]?.month || defaultMonth}
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
                        src={activeWinner.winner_image_url || activeWinner.servers?.icon_url || logo} 
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
                  <div className={`py-5 px-8 rounded-2xl border border-white/10 bg-black/40 ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'}`}>
                    <p className="text-lg font-pixel text-white/40">No Previous Winners</p>
                    <p className="text-white/20 font-headline text-xs mt-1 uppercase tracking-widest leading-none">
                      {currentCategory.id === 'developer' || currentCategory.id === 'builder' ? 'Coming Soon' : 'Selection in progress'}
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
              className="pointer-events-auto w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-realm-green hover:text-zinc-950 transition-all text-white/40 hover:scale-110"
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
        <div className="mb-10">
          <h2 className="text-2xl font-pixel text-white mb-2 uppercase tracking-wide">Vote Your OTM!</h2>
          <p className="text-zinc-500 font-headline text-sm">Support your favorites and help them be the next OTM winner!</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categoryCompetitors?.map((competitor, idx) => {
            const isPerson = competitor.category === 'developer' || competitor.category === 'builder'
            const displayName = isPerson 
              ? competitor.profiles?.discord_username 
              : competitor.servers?.name
            const displayImage = isPerson 
              ? competitor.profiles?.discord_avatar 
              : competitor.servers?.icon_url

            return (
              <FramerIn key={competitor.id} delay={idx * 0.05}>
                <motion.div 
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group cursor-pointer h-full"
                >
                  <div className="relative h-full bg-[#313233] border-4 border-[#101010] p-4 flex flex-col items-center text-center shadow-[5px_5px_0_rgba(0,0,0,0.5)] transition-all group-hover:bg-[#3c3c43]">
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
                        <div className={`relative w-28 h-28 md:w-32 md:h-32 mx-auto border-4 border-realm-green bg-black/40 shadow-inner overflow-hidden group-hover:scale-105 transition-transform duration-300 ${isPerson ? 'rounded-full' : 'rounded-none'}`}>
                          <img 
                            src={displayImage || (isPerson ? logo : 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&q=80&w=800')} 
                            alt={displayName || 'Competitor'}
                            className="w-full h-full object-cover p-1 group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <Eye className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </Link>

                      <h3 className="text-[12px] md:text-sm font-pixel text-white mb-3 line-clamp-1 w-full drop-shadow-md uppercase">
                        {displayName || 'Curated Candidate'}
                      </h3>
                      
                      <div className="mt-auto w-full space-y-4">
                        <div className="flex items-center justify-between px-1 relative">
                          <span className="text-[8px] font-pixel text-white/30 uppercase tracking-[0.2em]">Votes</span>
                          <span className="text-xl font-pixel text-realm-green font-bold leading-none">{competitor.total_votes || 0}</span>
                        </div>

                        <button 
                          disabled={voteMutation.isPending || unvoteMutation.isPending}
                          onClick={(e) => {
                            e.preventDefault()
                            if (!user) {
                              toast.error('Login Required', { description: 'Please sign in to vote for OTM.' })
                              return
                            }
                            
                            if (userServers.length === 0) {
                              toast.error('Eligibility Required', { description: 'You must own at least one approved server to vote.' })
                              return
                            }
                            

                            if (userVotes.includes(competitor.id)) {
                              unvoteMutation.mutate({ 
                                userId: user.id, 
                                competitorId: competitor.id,
                                voterName: profile?.discord_username || 'Unknown'
                              })
                            } else {
                              voteMutation.mutate({ 
                                userId: user.id, 
                                competitorId: competitor.id,
                                voterName: profile?.discord_username || 'Unknown'
                              })
                            }
                          }}
                          className={`block w-full py-2.5 border-2 border-[#101010] font-pixel text-[9px] uppercase tracking-widest transition-all shadow-[2px_2px_0_rgba(0,0,0,0.4)] ${
                            userVotes.includes(competitor.id)
                              ? 'bg-realm-green text-zinc-950 hover:bg-red-500 hover:text-white'
                              : 'bg-white/5 text-white hover:bg-realm-green hover:text-zinc-950'
                          }`}
                        >
                          {voteMutation.isPending || unvoteMutation.isPending ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="w-4 h-4 animate-spin text-realm-green" />
                            </div>
                          ) : userVotes.includes(competitor.id) ? (
                              <div className="flex items-center justify-center gap-2">
                                <img src={esmeraldaIcon} alt="" className="w-5 h-5" />
                                <span>Voted</span>
                              </div>
                            ) : 'Cast Vote'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </FramerIn>
            )
          })}
        </div>

        {(!categoryCompetitors || categoryCompetitors.length === 0) && (
          <div className="col-span-full py-8 md:py-16 bg-zinc-900/20 border border-dashed border-white/10 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-white/5 rounded-full flex items-center justify-center mb-3 md:mb-4">
              <ThumbsUp className="w-4 h-4 md:w-6 md:h-6 text-zinc-700" />
            </div>
            <h3 className="text-sm md:text-lg font-pixel text-zinc-600">No Participants Yet</h3>
            <p className="text-zinc-600 font-headline text-[10px] md:text-xs mt-1.5 md:mt-2 max-w-[200px] md:max-w-sm">Nominations are still open for this category. Check back soon!</p>
          </div>
        )}
        </FramerIn>
      </div>
    </AnimatedPage>
  )
}
