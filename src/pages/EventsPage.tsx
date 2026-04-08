import { Link } from 'react-router-dom'
import { ThumbsUp, ChevronLeft, ChevronRight, Trophy, Sparkles, Star, Calendar } from 'lucide-react'
import { useState, useMemo } from 'react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion, AnimatePresence } from 'framer-motion'
import { useOTMWinners, useOTMCompetitors } from '../hooks/queries'
import type { OTMCategory } from '../types'

const CATEGORIES: { id: OTMCategory; label: string; icon: any }[] = [
  { id: 'realm', label: 'Realm of the Month', icon: Sparkles },
  { id: 'server', label: 'Server of the Month', icon: Trophy },
  { id: 'developer', label: 'Developer of the Month', icon: Star },
  { id: 'builder', label: 'Builder of the Month', icon: Calendar },
]

export function EventsPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { data: winners } = useOTMWinners()
  const { data: competitors } = useOTMCompetitors()

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
          src="/src/assets/hero/heroRE.gif" 
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
                    to={activeWinner.server_id ? `/server/${activeWinner.server_id}` : '#'}
                    className="block group no-underline"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-col md:flex-row items-center gap-6 mb-8 cursor-pointer"
                    >
                      <img 
                        src={activeWinner.winner_image_url || activeWinner.servers?.icon_url || '/src/assets/rerealm.webp'} 
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
                    <p className="text-white/60 font-headline text-sm md:text-base max-w-xl leading-relaxed italic drop-shadow-md mx-auto">
                      " {activeWinner.description} "
                    </p>
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
          {categoryCompetitors?.map((competitor, idx) => (
            <motion.div 
              key={competitor.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 group hover:bg-zinc-900/60 transition-all hover:border-realm-green/20"
            >
              <Link to={`/server/${competitor.server_id}`} className="block">
                <div className="aspect-square rounded-lg overflow-hidden mb-3 relative">
                   <img 
                     src={competitor.servers?.icon_url || 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&q=80&w=800'} 
                     alt="Competitor"
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                   />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                   </div>
                </div>
                <h3 className="text-[13px] font-pixel text-white mb-1 group-hover:text-realm-green transition-colors line-clamp-1">
                  {competitor.servers?.name || 'Curated Candidate'}
                </h3>
              </Link>
              <p className="text-zinc-500 text-[10px] font-headline mb-3 line-clamp-1 leading-relaxed opacity-60">
                {competitor.servers?.description || 'A highly rated participant.'}
              </p>
              <a 
                href={competitor.vote_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2 rounded-lg bg-white/5 border border-white/10 text-center font-pixel text-[9px] text-white uppercase tracking-widest hover:bg-realm-green hover:border-realm-green hover:text-zinc-950 transition-all"
              >
                Cast Vote
              </a>
            </motion.div>
          ))}

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
