import { Link } from 'react-router-dom'
import { ThumbsUp, ChevronLeft, ChevronRight, Trophy, Sparkles, Star, Calendar, Eye } from 'lucide-react'
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
import heroGif from '../assets/hero/heroRE.gif'
import logo from '../assets/rerealm.webp'
import { slugify } from '../lib/urlUtils'

const CATEGORIES: { id: OTMCategory; label: string; icon: any }[] = [
  { id: 'realm', label: 'Realm of the Month', icon: Sparkles },
  { id: 'server', label: 'Server of the Month', icon: Trophy },
  { id: 'developer', label: 'Developer of the Month', icon: Star },
  { id: 'builder', label: 'Builder of the Month', icon: Calendar },
]

export function EventsPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { user } = useAuth()
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
        {/* Cinematic Background (Cloned from HomePage) */}
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroGif} 
          alt="Events Background" 
          className="absolute inset-0 w-full h-full object-cover z-0 block"
        />
        {/* Dark Cinematic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-green-950/90 z-10"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-20">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentCategory.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="flex flex-col items-center text-center"
            >
              <FramerIn>
                {/* Minecraft-style Badge */}
                <div className="inline-flex items-center gap-2 bg-zinc-800/90 border-t-2 border-l-2 border-white/20 border-r-2 border-b-2 border-black/50 px-4 py-1.5 mb-8 text-realm-green shadow-[2px_2px_0px_rgba(0,0,0,0.4)] backdrop-blur-md">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-pixel text-[10px] tracking-widest uppercase">
                    {activeWinner?.month || categoryCompetitors?.[0]?.month || defaultMonth}
                  </span>
                </div>
              </FramerIn>
              
              <FramerIn delay={0.2}>
                <h1 className="font-pixel text-white text-3xl md:text-5xl leading-tight mb-8 drop-shadow-2xl">
                   {currentCategory.label.split(' ')[0]} <br/>
                   <span className="text-realm-green">{currentCategory.label.split(' ').slice(1).join(' ')}</span>
                </h1>
              </FramerIn>

              {activeWinner ? (
                <FramerIn delay={0.4} className="flex flex-col items-center">
                  {/* Clickable Winner Group */}
                  <Link 
                    to={activeWinner.servers ? `/server/${activeWinner.servers.slug || slugify(activeWinner.servers.name)}` : '#'}
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
                        className="w-16 h-16 rounded-xl object-cover border-2 border-realm-green shadow-2xl shadow-realm-green/20"
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
                </FramerIn>
              ) : (
                <FramerIn delay={0.4}>
                  <div className="py-5 px-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
                    <p className="text-lg font-pixel text-white/40">No Previous Winners</p>
                    <p className="text-white/20 font-headline text-xs mt-1 uppercase tracking-widest leading-none">
                      {currentCategory.id === 'developer' || currentCategory.id === 'builder' ? 'Coming Soon' : 'Selection in progress'}
                    </p>
                  </div>
                </FramerIn>
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

      <div className="max-w-7xl mx-auto px-8 py-20">
      {/* Vote Section */}
      <FramerIn delay={0.2}>
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-pixel text-white mb-2 uppercase tracking-wide">Vote Your OTM!</h2>
            <p className="text-zinc-500 font-headline text-sm">Support your favorites and help them reach the throne.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-realm-green/10 rounded-full border border-realm-green/20">
             <div className="w-1.5 h-1.5 rounded-full bg-realm-green animate-pulse" />
             <span className="text-[10px] font-pixel text-realm-green uppercase tracking-widest font-bold">Active Voting</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categoryCompetitors?.map((competitor, idx) => {
            const isPerson = competitor.category === 'developer' || competitor.category === 'builder'
            const displayName = isPerson 
              ? competitor.profiles?.discord_username 
              : competitor.servers?.name
            const displayImage = isPerson 
              ? competitor.profiles?.discord_avatar 
              : competitor.servers?.icon_url
            const displayDesc = isPerson
              ? (competitor.category === 'developer' ? 'A talented developer.' : 'A master builder.')
              : competitor.servers?.description

            return (
              <motion.div 
                key={competitor.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 group hover:bg-zinc-900/60 transition-all hover:border-realm-green/20"
              >
                <div className="block">
                  <div className={`w-20 h-20 mx-auto overflow-hidden mb-3 relative border border-white/5 ${isPerson ? 'rounded-full' : 'rounded-lg'}`}>
                     <img 
                       src={displayImage || (isPerson ? logo : 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&q=80&w=800')} 
                       alt="Competitor"
                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                     />
                     {!isPerson && (
                       <Link 
                        to={`/server/${competitor.servers?.slug || slugify(competitor.servers?.name || '')}`}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                       >
                          <Eye className="w-6 h-6 text-white" />
                       </Link>
                     )}
                  </div>
                  <h3 className="text-[13px] font-pixel text-white mb-1 line-clamp-1 text-center">
                    {displayName || 'Curated Candidate'}
                  </h3>
                </div>
                <p className="text-zinc-500 text-[10px] font-headline mb-4 line-clamp-1 leading-relaxed opacity-60 text-center">
                  {displayDesc || 'A highly rated participant.'}
                </p>
                <div className="flex items-center justify-between px-1 mb-4 relative">
                   <span className="text-[9px] font-pixel text-white/30 uppercase tracking-[0.2em]">Votes</span>
                   <span className="text-xl font-pixel text-realm-green font-bold leading-none">{competitor.total_votes || 0}</span>
                   {userVotes.includes(competitor.id) && (
                     <div className="absolute -top-3 -right-1">
                       <span className="bg-realm-green text-zinc-950 text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-lg">Voted</span>
                     </div>
                   )}
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
                    
                    // Self-voting check
                    if (!isPerson && competitor.server_id) {
                      const isOwnServer = userServers.some(s => s.id === competitor.server_id)
                      if (isOwnServer) {
                        toast.error('Self-voting Restricted', { description: 'You cannot vote for your own server.' })
                        return
                      }
                    } else if (isPerson && competitor.user_id === user.id) {
                      toast.error('Self-voting Restricted', { description: 'You cannot vote for yourself.' })
                      return
                    }

                    if (userVotes.includes(competitor.id)) {
                      unvoteMutation.mutate({ userId: user.id, competitorId: competitor.id })
                    } else {
                      voteMutation.mutate({ userId: user.id, competitorId: competitor.id })
                    }
                  }}
                  className={`block w-full py-2 rounded-lg border font-pixel text-[9px] uppercase tracking-widest transition-all ${
                    userVotes.includes(competitor.id)
                      ? 'bg-realm-green border-realm-green text-zinc-950 hover:bg-red-500 hover:border-red-500 hover:text-white'
                      : 'bg-white/5 border-white/10 text-white hover:bg-realm-green hover:border-realm-green hover:text-zinc-950'
                  }`}
                >
                  {voteMutation.isPending || unvoteMutation.isPending 
                    ? 'Processing...' 
                    : userVotes.includes(competitor.id) ? 'Undo Vote' : 'Cast Vote'}
                </button>
              </motion.div>
            )
          })}

          {(!categoryCompetitors || categoryCompetitors.length === 0) && (
            <div className="col-span-full py-16 bg-zinc-900/20 border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <ThumbsUp className="w-6 h-6 text-zinc-700" />
              </div>
              <h3 className="text-lg font-pixel text-zinc-600">No Participants Yet</h3>
              <p className="text-zinc-600 font-headline text-xs mt-2 max-w-sm">Nominations are still open for this category. Check back soon!</p>
            </div>
          )}
        </div>
      </FramerIn>
      </div>
    </AnimatedPage>
  )
}
