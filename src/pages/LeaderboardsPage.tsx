import { motion } from 'framer-motion'
import { Star, ThumbsUp, Medal, Crown } from 'lucide-react'
import { useServers } from '../hooks/queries'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { Link } from 'react-router-dom'
import { LoadingSpinner } from '../components/FeedbackStates'
import heroVideo from '../assets/hero/heroRE.mp4'
import logo from '../assets/rerealm.webp'
import { slugify } from '../lib/urlUtils'
import { useIsMobile } from '../hooks/useMediaQuery'
import firstPlaceIcon from '../assets/leaderboards/5336-1st.png'
import secondPlaceIcon from '../assets/leaderboards/6308-2nd.png'
import thirdPlaceIcon from '../assets/leaderboards/4162-3rd.png'
import medalGif from '../assets/leaderboards/76245-medalla (1).gif'
import voteUpIcon from '../assets/leaderboards/1139-voteup.png'
import starIcon from '../assets/leaderboards/star.png'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

function RankTrend({ current, previous }: { current: number, previous?: number | null }) {
  if (previous === undefined || previous === null) return null
  
  const delta = previous - current

  if (delta > 0) {
    return (
      <div className="flex items-center gap-0.5 text-realm-green font-pixel text-[8px] md:text-[10px] animate-pulse">
        <ArrowUp className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" strokeWidth={3} />
        <span>{delta}</span>
      </div>
    )
  }

  if (delta < 0) {
    return (
      <div className="flex items-center gap-0.5 text-red-500 font-pixel text-[8px] md:text-[10px]">
        <ArrowDown className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" strokeWidth={3} />
        <span>{Math.abs(delta)}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center text-zinc-700">
      <Minus className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" strokeWidth={3} />
    </div>
  )
}

export function LeaderboardsPage() {
  const isMobile = useIsMobile()
  const { data: topVoted = [], isLoading: loadingVotes } = useServers({ sortBy: 'votes', limit: 13 })
  const { data: topRated = [], isLoading: loadingRated } = useServers({ sortBy: 'rating', limit: 12 })

  const podium = topVoted.slice(0, 3)
  const votesList = topVoted // Show all in the list for better UX

  const loading = loadingVotes || loadingRated

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingSpinner />
      </div>
    )
  }

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
        
        <div className="max-w-7xl mx-auto w-full relative z-20 flex flex-col items-center will-change-transform">
            <FramerIn>
                <div className={`inline-flex items-center gap-2 bg-zinc-800/90 border-t-2 border-l-2 border-white/20 border-r-2 border-b-2 border-black/50 px-3 py-1 mb-8 text-[#85fc7e] shadow-[2px_2px_0px_rgba(0,0,0,0.4)] ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'}`}>
                     <img src={medalGif} alt="Medalla Icon" className="w-5 h-5 object-contain" />
                    <span className="font-pixel text-[9px] tracking-widest uppercase">Top Servers</span>
                </div>
            </FramerIn>

            <FramerIn delay={0.2}>
                <h1 className="font-pixel text-white text-2xl md:text-4xl text-center mb-8 drop-shadow-2xl">
                    COMMUNITY <span className="text-realm-green">LEADERS</span>
                </h1>
            </FramerIn>

            {/* Podium */}
            <div className="flex items-end justify-center mt-6 w-full max-w-4xl px-2 md:px-0">
                {/* 2nd Place */}
                {podium[1] && (
                    <FramerIn delay={0.4} className="order-1 w-1/3 md:w-1/3 group">
                        <Link to={`/server/${podium[1].slug || slugify(podium[1].name)}`} className="flex flex-col items-center">
                            <div className="relative mb-2 md:mb-4">
                                <img src={secondPlaceIcon} className="absolute -top-3 -left-3 md:-top-6 md:-left-6 w-6 h-6 md:w-12 md:h-12 z-30 object-contain drop-shadow-lg" alt="2nd Place Icon" />
                                <img 
                                    src={podium[1].icon_url || logo} 
                                    className="w-10 h-10 md:w-16 md:h-16 rounded-sm md:rounded-lg border-2 md:border-4 border-zinc-400 object-cover shadow-2xl group-hover:scale-110 transition-transform"
                                    alt="2nd Place"
                                />
                                <Medal className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-3 h-3 md:w-6 md:h-6 text-zinc-400 drop-shadow-lg" />
                            </div>
                            <div className={`h-14 md:h-20 w-full bg-gradient-to-b from-zinc-400/20 to-zinc-400/5 ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'} border-t-2 border-zinc-400/30 rounded-t-sm md:rounded-t-md flex flex-col items-center justify-center p-1 md:p-2`}>
                                <span className="text-white font-pixel text-[6px] md:text-[9px] text-center line-clamp-1 mb-0.5">{podium[1].name}</span>
                                <div className="flex items-center gap-1 md:gap-1.5 text-zinc-400 font-headline text-[5px] md:text-[8px] uppercase tracking-widest font-bold">
                                    <ThumbsUp className="w-1.5 h-1.5 md:w-2 md:h-2" />
                                    {podium[1].votes}
                                </div>
                            </div>
                        </Link>
                    </FramerIn>
                )}

                {/* 1st Place */}
                {podium[0] && (
                    <FramerIn delay={0.6} className="order-2 w-[40%] md:w-2/5 z-20 group -mb-2 md:-mb-4">
                        <Link to={`/server/${podium[0].slug || slugify(podium[0].name)}`} className="flex flex-col items-center">
                            <div className="relative mb-3 md:mb-6">
                                <img src={firstPlaceIcon} className="absolute -top-4 -left-4 md:-top-8 md:-left-8 w-8 h-8 md:w-16 md:h-16 z-30 object-contain drop-shadow-xl" alt="1st Place Icon" />
                                <img 
                                    src={podium[0].icon_url || logo} 
                                    className="w-14 h-14 md:w-24 md:h-24 rounded-md md:rounded-xl border-2 md:border-4 border-yellow-500 object-cover shadow-[0_0_50px_rgba(234,179,8,0.3)] group-hover:scale-110 transition-transform"
                                    alt="1st Place"
                                />
                                <Crown className="absolute -top-6 md:-top-10 left-1/2 -translate-x-1/2 w-5 h-5 md:w-8 md:h-8 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                            </div>
                            <div className={`h-20 md:h-28 w-full bg-gradient-to-b from-yellow-500/30 to-yellow-500/5 ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'} border-t-2 border-yellow-500/40 rounded-t-md md:rounded-t-lg flex flex-col items-center justify-center p-2 md:p-4`}>
                                <span className="text-white font-pixel text-[8px] md:text-xs text-center line-clamp-1 mb-1 md:mb-1.5">{podium[0].name}</span>
                                <div className="flex items-center gap-1 md:gap-2 text-yellow-500 font-headline text-[7px] md:text-[9px] uppercase tracking-widest font-black">
                                    <ThumbsUp className="w-2 h-2 md:w-3 md:h-3" />
                                    {podium[0].votes}
                                </div>
                            </div>
                        </Link>
                    </FramerIn>
                )}

                {/* 3rd Place */}
                {podium[2] && (
                    <FramerIn delay={0.5} className="order-3 w-1/3 md:w-1/3 group">
                        <Link to={`/server/${podium[2].slug || slugify(podium[2].name)}`} className="flex flex-col items-center">
                            <div className="relative mb-2 md:mb-4">
                                <img src={thirdPlaceIcon} className="absolute -top-3 -left-3 md:-top-6 md:-left-6 w-6 h-6 md:w-12 md:h-12 z-30 object-contain drop-shadow-lg" alt="3rd Place Icon" />
                                <img 
                                    src={podium[2].icon_url || logo} 
                                    className="w-8 h-8 md:w-14 md:h-14 rounded-sm md:rounded-lg border-2 md:border-4 border-orange-700 object-cover shadow-2xl group-hover:scale-110 transition-transform"
                                    alt="3rd Place"
                                />
                                <Medal className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-2.5 h-2.5 md:w-5 md:h-5 text-orange-700 drop-shadow-lg" />
                            </div>
                            <div className={`h-10 md:h-14 w-full bg-gradient-to-b from-orange-700/20 to-orange-700/5 ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'} border-t-2 border-orange-700/30 rounded-t-sm md:rounded-t-md flex flex-col items-center justify-center p-1 md:p-1.5`}>
                                <span className="text-white font-pixel text-[5px] md:text-[8px] text-center line-clamp-1">{podium[2].name}</span>
                                <div className="flex items-center gap-0.5 md:gap-1 text-orange-700 font-headline text-[5px] md:text-[7px] uppercase tracking-widest font-bold">
                                    <ThumbsUp className="w-1 md:w-1.5 h-1 md:h-1.5" />
                                    {podium[2].votes}
                                </div>
                            </div>
                        </Link>
                    </FramerIn>
                )}
            </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-20"></div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Votes List */}
            <FramerIn>
                <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-8">
                    <div className="flex items-center justify-center">
                        <img src={voteUpIcon} className="w-6 h-6 md:w-10 md:h-10 object-contain" alt="Vote Icon" />
                    </div>
                    <div>
                        <h2 className="text-sm md:text-2xl font-pixel text-white uppercase tracking-wide">Top Votes</h2>
                        <p className="text-zinc-500 font-headline text-[10px] md:text-sm">Most supported by the community.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {votesList.map((server, idx) => (
                        <Link 
                            key={server.id} 
                            to={`/server/${server.slug || slugify(server.name)}`}
                            className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-md md:rounded-lg bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/60 transition-all group ${idx < 3 ? 'hover:border-realm-green' : 'hover:border-realm-green/20'}`}
                        >
                            <div className="w-6 md:w-8 flex justify-center">
                                {idx === 0 ? <Crown className="w-3 md:w-4 h-3 md:h-4 text-realm-green" /> : 
                                 idx === 1 ? <Medal className="w-3 md:w-4 h-3 md:h-4 text-zinc-400" /> :
                                 idx === 2 ? <Medal className="w-3 md:w-4 h-3 md:h-4 text-orange-700" /> :
                                 <span className="font-pixel text-zinc-700 text-[8px] md:text-[10px]">{idx + 1}</span>}
                            </div>
                            <img src={server.icon_url || logo} className="w-8 h-8 md:w-10 md:h-10 rounded-md object-cover border border-white/10" alt={server.name} />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-pixel text-[9px] md:text-[11px] group-hover:text-realm-green transition-colors truncate">{server.name}</h3>
                                <p className="text-zinc-500 font-headline text-[7px] md:text-[9px] uppercase tracking-widest mt-0.5">{server.type}</p>
                            </div>
                            <div className="text-right flex items-center gap-2 md:gap-3">
                                <RankTrend current={idx + 1} previous={server.yesterday_vote_rank} />
                                <div>
                                    <div className="text-realm-green font-pixel text-[10px] md:text-xs">{server.votes}</div>
                                    <div className="text-zinc-600 font-headline text-[6px] md:text-[7px] uppercase font-bold tracking-tighter">Votes</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {votesList.length === 0 && (
                        <div className="p-12 text-center border border-dashed border-white/5 rounded-xl text-zinc-600 font-pixel text-xs">
                            No additional ranked servers.
                        </div>
                    )}
                </div>
            </FramerIn>

            {/* Top Ratings List */}
            <FramerIn delay={0.2}>
                <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-8">
                    <div className="flex items-center justify-center">
                        <img src={starIcon} className="w-6 h-6 md:w-10 md:h-10 object-contain" alt="Star Icon" />
                    </div>
                    <div>
                        <h2 className="text-sm md:text-2xl font-pixel text-white uppercase tracking-wide">Highest Rated</h2>
                        <p className="text-zinc-500 font-headline text-[10px] md:text-sm">Best quality according to reviews.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {topRated.map((server, idx) => (
                        <Link 
                            key={server.id} 
                            to={`/server/${server.slug || slugify(server.name)}`}
                            className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-md md:rounded-lg bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/60 transition-all group ${idx < 3 ? 'hover:border-yellow-500' : 'hover:border-yellow-500/20'}`}
                        >
                            <div className="w-6 md:w-8 flex justify-center">
                                {idx === 0 ? <Crown className="w-3 md:w-4 h-3 md:h-4 text-yellow-500" /> : 
                                 idx === 1 ? <Medal className="w-3 md:w-4 h-3 md:h-4 text-zinc-400" /> :
                                 idx === 2 ? <Medal className="w-3 md:w-4 h-3 md:h-4 text-orange-700" /> :
                                 <span className="font-pixel text-zinc-700 text-[8px] md:text-[10px]">{idx + 1}</span>}
                            </div>
                            <img src={server.icon_url || logo} className="w-8 h-8 md:w-10 md:h-10 rounded-md object-cover border border-white/10" alt={server.name} />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-pixel text-[9px] md:text-[11px] group-hover:text-yellow-500 transition-colors truncate">{server.name}</h3>
                                <p className="text-zinc-500 font-headline text-[7px] md:text-[9px] uppercase tracking-widest mt-0.5">{server.type}</p>
                            </div>
                            <div className="text-right flex items-center gap-2 md:gap-3">
                                <RankTrend current={idx + 1} previous={server.yesterday_rating_rank} />
                                <div>
                                    <div className="text-yellow-500 font-pixel text-[10px] md:text-xs flex items-center justify-end gap-1">
                                        {Number(server.average_rating).toFixed(1)}
                                        <Star className="w-2 md:w-3 h-2 md:h-3 fill-current" />
                                    </div>
                                    <div className="text-zinc-600 font-headline text-[6px] md:text-[7px] uppercase font-bold tracking-tighter">{server.rating_count} Reviews</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {topRated.length === 0 && (
                        <div className="p-12 text-center border border-dashed border-white/5 rounded-xl text-zinc-600 font-pixel text-xs">
                            No rated servers available.
                        </div>
                    )}
                </div>
            </FramerIn>
        </div>
      </main>
    </AnimatedPage>
  )
}
