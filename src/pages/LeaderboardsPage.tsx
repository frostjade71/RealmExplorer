import { motion } from 'framer-motion'
import { Trophy, Star, ThumbsUp, Medal, Crown } from 'lucide-react'
import { useServers } from '../hooks/queries'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { Link } from 'react-router-dom'
import { LoadingSpinner } from '../components/FeedbackStates'
import heroGif from '../assets/hero/heroRE.gif'
import logo from '../assets/rerealm.webp'

export function LeaderboardsPage() {
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
      <header className="relative pt-32 pb-16 px-8 overflow-hidden min-h-[50vh] flex flex-col items-center justify-center">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroGif} 
          alt="Leaderboards Background" 
          className="absolute inset-0 w-full h-full object-cover z-0 block"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-green-950/90 z-10"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-20 flex flex-col items-center">
            <FramerIn>
                <div className="inline-flex items-center gap-2 bg-realm-green/10 border border-realm-green/30 px-4 py-1.5 mb-4 text-realm-green rounded-full backdrop-blur-md">
                    <Trophy className="w-3.5 h-3.5" />
                    <span className="font-pixel text-[10px] tracking-widest uppercase font-bold">Top Servers</span>
                </div>
            </FramerIn>

            <FramerIn delay={0.2}>
                <h1 className="font-pixel text-white text-2xl md:text-4xl text-center mb-8 drop-shadow-2xl">
                    COMMUNITY <span className="text-realm-green">LEADERS</span>
                </h1>
            </FramerIn>

            {/* Podium */}
            <div className="flex flex-col md:flex-row items-end justify-center gap-2 md:gap-0 mt-6 w-full max-w-4xl">
                {/* 2nd Place */}
                {podium[1] && (
                    <FramerIn delay={0.4} className="order-2 md:order-1 w-full md:w-1/3 group">
                        <Link to={`/server/${podium[1].id}`} className="flex flex-col items-center">
                            <div className="relative mb-4">
                                <div className="absolute -top-4 -left-4 w-10 h-10 bg-zinc-400 rounded-full flex items-center justify-center border-4 border-black text-black font-pixel text-sm z-30">2</div>
                                <img 
                                    src={podium[1].icon_url || logo} 
                                    className="w-16 h-16 rounded-2xl border-4 border-zinc-400 object-cover shadow-2xl group-hover:scale-110 transition-transform"
                                    alt="2nd Place"
                                />
                                <Medal className="absolute -bottom-2 -right-2 w-6 h-6 text-zinc-400 drop-shadow-lg" />
                            </div>
                            <div className="h-20 w-full bg-gradient-to-b from-zinc-400/20 to-zinc-400/5 backdrop-blur-md border-t-2 border-zinc-400/30 rounded-t-xl flex flex-col items-center justify-center p-2">
                                <span className="text-white font-pixel text-[9px] text-center line-clamp-1 mb-0.5">{podium[1].name}</span>
                                <div className="flex items-center gap-1.5 text-zinc-400 font-headline text-[8px] uppercase tracking-widest font-bold">
                                    <ThumbsUp className="w-2 h-2" />
                                    {podium[1].votes} Votes
                                </div>
                            </div>
                        </Link>
                    </FramerIn>
                )}

                {/* 1st Place */}
                {podium[0] && (
                    <FramerIn delay={0.6} className="order-1 md:order-2 w-full md:w-2/5 z-20 group -mb-4">
                        <Link to={`/server/${podium[0].id}`} className="flex flex-col items-center">
                            <div className="relative mb-6">
                                <div className="absolute -top-6 -left-6 w-14 h-14 bg-realm-green rounded-full flex items-center justify-center border-4 border-black text-black font-pixel text-lg z-30">1</div>
                                <img 
                                    src={podium[0].icon_url || logo} 
                                    className="w-24 h-24 rounded-3xl border-4 border-realm-green object-cover shadow-[0_0_50px_rgba(78,196,78,0.3)] group-hover:scale-110 transition-transform"
                                    alt="1st Place"
                                />
                                <Crown className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 text-realm-green drop-shadow-[0_0_15px_rgba(78,196,78,0.5)]" />
                            </div>
                            <div className="h-28 w-full bg-gradient-to-b from-realm-green/30 to-realm-green/5 backdrop-blur-md border-t-2 border-realm-green/40 rounded-t-2xl flex flex-col items-center justify-center p-4">
                                <span className="text-white font-pixel text-xs text-center line-clamp-1 mb-1.5">{podium[0].name}</span>
                                <div className="flex items-center gap-2 text-realm-green font-headline text-[9px] uppercase tracking-widest font-black">
                                    <ThumbsUp className="w-3 h-3" />
                                    {podium[0].votes} Votes
                                </div>
                            </div>
                        </Link>
                    </FramerIn>
                )}

                {/* 3rd Place */}
                {podium[2] && (
                    <FramerIn delay={0.5} className="order-3 md:order-3 w-full md:w-1/3 group">
                        <Link to={`/server/${podium[2].id}`} className="flex flex-col items-center">
                            <div className="relative mb-4">
                                <div className="absolute -top-4 -left-4 w-10 h-10 bg-orange-700 rounded-full flex items-center justify-center border-4 border-black text-white font-pixel text-sm z-30">3</div>
                                <img 
                                    src={podium[2].icon_url || logo} 
                                    className="w-14 h-14 rounded-2xl border-4 border-orange-700 object-cover shadow-2xl group-hover:scale-110 transition-transform"
                                    alt="3rd Place"
                                />
                                <Medal className="absolute -bottom-2 -right-2 w-5 h-5 text-orange-700 drop-shadow-lg" />
                            </div>
                            <div className="h-14 w-full bg-gradient-to-b from-orange-700/20 to-orange-700/5 backdrop-blur-md border-t-2 border-orange-700/30 rounded-t-xl flex flex-col items-center justify-center p-1.5">
                                <span className="text-white font-pixel text-[8px] text-center line-clamp-1">{podium[2].name}</span>
                                <div className="flex items-center gap-1 text-orange-700 font-headline text-[7px] uppercase tracking-widest font-bold">
                                    <ThumbsUp className="w-1.5 h-1.5" />
                                    {podium[2].votes} Votes
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
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-realm-green/10 rounded-xl border border-realm-green/20">
                        <ThumbsUp className="w-6 h-6 text-realm-green" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-pixel text-white uppercase tracking-wide">Top Votes</h2>
                        <p className="text-zinc-500 font-headline text-sm">Most supported by the community.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {votesList.map((server, idx) => (
                        <Link 
                            key={server.id} 
                            to={`/server/${server.id}`}
                            className={`flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/60 transition-all group ${idx < 3 ? 'hover:border-realm-green' : 'hover:border-realm-green/20'}`}
                        >
                            <div className="w-8 flex justify-center">
                                {idx === 0 ? <Crown className="w-4 h-4 text-realm-green" /> : 
                                 idx === 1 ? <Medal className="w-4 h-4 text-zinc-400" /> :
                                 idx === 2 ? <Medal className="w-4 h-4 text-orange-700" /> :
                                 <span className="font-pixel text-zinc-700 text-[10px]">{idx + 1}</span>}
                            </div>
                            <img src={server.icon_url || logo} className="w-10 h-10 rounded-lg object-cover border border-white/10" alt={server.name} />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-pixel text-[11px] group-hover:text-realm-green transition-colors truncate">{server.name}</h3>
                                <p className="text-zinc-500 font-headline text-[9px] uppercase tracking-widest mt-0.5">{server.type}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-realm-green font-pixel text-xs">{server.votes}</div>
                                <div className="text-zinc-600 font-headline text-[7px] uppercase font-bold tracking-tighter">Votes</div>
                            </div>
                        </Link>
                    ))}
                    {votesList.length === 0 && (
                        <div className="p-12 text-center border border-dashed border-white/5 rounded-2xl text-zinc-600 font-pixel text-xs">
                            No additional ranked servers.
                        </div>
                    )}
                </div>
            </FramerIn>

            {/* Top Ratings List */}
            <FramerIn delay={0.2}>
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                        <Star className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-pixel text-white uppercase tracking-wide">Highest Rated</h2>
                        <p className="text-zinc-500 font-headline text-sm">Best quality according to reviews.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {topRated.map((server, idx) => (
                        <Link 
                            key={server.id} 
                            to={`/server/${server.id}`}
                            className={`flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/60 transition-all group ${idx < 3 ? 'hover:border-yellow-500' : 'hover:border-yellow-500/20'}`}
                        >
                            <div className="w-8 flex justify-center">
                                {idx === 0 ? <Crown className="w-4 h-4 text-yellow-500" /> : 
                                 idx === 1 ? <Medal className="w-4 h-4 text-zinc-400" /> :
                                 idx === 2 ? <Medal className="w-4 h-4 text-orange-700" /> :
                                 <span className="font-pixel text-zinc-700 text-[10px]">{idx + 1}</span>}
                            </div>
                            <img src={server.icon_url || logo} className="w-10 h-10 rounded-lg object-cover border border-white/10" alt={server.name} />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-pixel text-[11px] group-hover:text-yellow-500 transition-colors truncate">{server.name}</h3>
                                <p className="text-zinc-500 font-headline text-[9px] uppercase tracking-widest mt-0.5">{server.type}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-yellow-500 font-pixel text-xs flex items-center justify-end gap-1">
                                    {Number(server.average_rating).toFixed(1)}
                                    <Star className="w-3 h-3 fill-current" />
                                </div>
                                <div className="text-zinc-600 font-headline text-[7px] uppercase font-bold tracking-tighter">{server.rating_count} Reviews</div>
                            </div>
                        </Link>
                    ))}
                    {topRated.length === 0 && (
                        <div className="p-12 text-center border border-dashed border-white/5 rounded-2xl text-zinc-600 font-pixel text-xs">
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
