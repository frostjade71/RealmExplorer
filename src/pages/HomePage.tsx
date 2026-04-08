import { Link } from 'react-router-dom'
import { useServers, useGlobalStats } from '../hooks/queries'
import { ServerCard } from '../components/ServerCard'
import { LoadingSpinner } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn, FramerInList } from '../components/FramerIn'
import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import heroGif from '../assets/hero/heroRE.gif'

function StatItem({ value, label, suffix = '', formatter = (v: number) => v.toString() }: { 
  value: number, 
  label: string, 
  suffix?: string,
  formatter?: (v: number) => string 
}) {
  const spring = useSpring(0, { bounce: 0, duration: 2000 })
  const display = useTransform(spring, (current) => formatter(Math.round(current)) + suffix)

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return (
    <div className="flex flex-col items-center">
      <motion.span className="text-[#85fc7e] font-pixel text-2xl mb-2 drop-shadow-md">
        {display}
      </motion.span>
      <span className="text-white/40 font-headline text-[10px] tracking-widest uppercase font-bold">{label}</span>
    </div>
  )
}

export function HomePage() {
  const { data: featured = [], isLoading: loadingFeatured } = useServers({ featured: true, limit: 4 })
  const { data: stats, isLoading: loadingStats } = useGlobalStats()

  if (loadingFeatured || loadingStats) return <LoadingSpinner />

  const safeStats = stats || { servers: 450, users: 12000 }

  const categories = [
    { id: 'factions', name: 'Factions', icon: 'swords', desc: 'Build empires, forge alliances, and dominate the landscape.' },
    { id: 'kitpvp', name: 'KitPvP', icon: 'shield', desc: 'Fast-paced combat with specialized loadouts.' },
    { id: 'skyblock', name: 'Skyblock', icon: 'cloud', desc: 'Start from nothing on a floating island.' },
    { id: 'smp', name: 'SMP', icon: 'group', desc: 'Survival Multiplayer experiences focused on community.' },
    { id: 'modded', name: 'Modded', icon: 'settings_input_component', desc: 'Custom machines, magic, and mechanics.' },
  ]

  return (
    <AnimatedPage>
      <header className="pt-32 pb-20 px-8 relative overflow-hidden min-h-[65vh] flex flex-col items-center justify-center">
        {/* Cinematic Background */}
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroGif} 
          alt="Realm Explorer Background" 
          className="absolute inset-0 w-full h-full object-cover z-0 block"
        />
        {/* Dark Radial Gradient Overlay for focus and legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-green-950/90 z-10"></div>
        
        <div className="max-w-7xl mx-auto relative z-20 flex flex-col items-center text-center">
          <FramerIn delay={0.2}>
            <div className="inline-flex items-center gap-1.5 bg-zinc-800/90 border-t-2 border-l-2 border-white/20 border-r-2 border-b-2 border-black/50 px-3 py-1 mb-8 text-[#85fc7e] shadow-[2px_2px_0px_rgba(0,0,0,0.4)] backdrop-blur-md">
              <span className="material-symbols-outlined text-[#85fc7e] text-[10px] animate-pulse">auto_awesome</span>
              <span className="font-pixel text-[9px] tracking-widest uppercase">The Website is now in BETA Phase</span>
            </div>
          </FramerIn>
          
          <FramerIn delay={0.4}>
            <h1 className="font-pixel text-white text-3xl md:text-5xl leading-tight mb-6 drop-shadow-2xl">
              Explore <br/>
              <span className="text-[#4EC44E]">Every</span> Realm
            </h1>
          </FramerIn>
          
          <FramerIn delay={0.6}>
            <p className="text-white/80 max-w-xl text-sm md:text-base mb-10 font-body leading-relaxed drop-shadow-lg mx-auto">
              Find, vote, and explore the best Minecraft servers and realms. Whether you're looking for a new world to join or want to grow your own server's community, Realm Explorer is your central hub for discovery.
            </p>
          </FramerIn>
          
          <FramerIn delay={0.8}>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link to="/servers" className="bg-[#006e15] hover:bg-[#85fc7e] text-white hover:text-[#002202] px-8 py-3.5 rounded-xl font-headline font-bold transition-all flex items-center gap-2.5 group shadow-xl shadow-green-900/10 text-sm">
                Browse Servers
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-sm">arrow_forward</span>
              </Link>
              <a 
                href="https://discord.gg/realmexplorer" 
                target="_blank" 
                rel="noreferrer"
                className="bg-white/5 border border-white/10 hover:border-white/30 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-headline font-bold transition-all text-sm flex items-center justify-center"
              >
                Join Discord
              </a>
            </div>
          </FramerIn>
          
          <FramerIn delay={1.0}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl w-full">
              <StatItem 
                value={safeStats.servers} 
                label="Servers" 
                suffix="+"
              />
              <StatItem 
                value={safeStats.users} 
                label="Global Players" 
                formatter={(v) => v.toLocaleString()}
              />
              <div className="flex flex-col items-center">
                <span className="text-[#85fc7e] font-pixel text-2xl mb-2 drop-shadow-md">99%</span>
                <span className="text-white/40 font-headline text-[10px] tracking-widest uppercase font-bold">Uptime Verified</span>
              </div>
            </div>
          </FramerIn>
        </div>
        
        {/* Content Fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-20"></div>
      </header>

      <section className="py-24 px-8 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <FramerIn className="mb-16">
            <h2 className="font-pixel text-on-surface text-2xl mb-4 text-white">Server Categories</h2>
            <div className="h-1 w-24 bg-primary-container"></div>
          </FramerIn>
          
          <FramerInList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(c => (
              <div key={c.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:shadow-lg transition-all group">
                <div className="w-10 h-10 bg-primary-container/10 rounded-lg flex items-center justify-center mb-4 text-realm-green group-hover:bg-realm-green group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">{c.icon}</span>
                </div>
                <h3 className="font-pixel text-base mb-2 text-white">{c.name}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">{c.desc}</p>
                <Link to={`/servers?category=${c.id}`} className="text-realm-green font-headline text-xs font-bold uppercase tracking-widest hover:underline underline-offset-4">
                  View Listings
                </Link>
              </div>
            ))}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:shadow-lg transition-all group border-dashed flex flex-col items-center justify-center text-center min-h-[140px]">
              <span className="material-symbols-outlined text-3xl text-zinc-600 mb-3">add_circle</span>
              <h3 className="font-pixel text-base mb-1 text-zinc-500">+ More</h3>
              <p className="text-zinc-600 text-xs">Request a category</p>
            </div>
          </FramerInList>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="py-24 px-8 bg-zinc-950">
          <div className="max-w-7xl mx-auto">
            <FramerIn className="text-center mb-16">
              <h2 className="font-pixel text-white text-3xl mb-4 uppercase tracking-widest">Hall of Fame</h2>
              <p className="text-zinc-400 font-headline">This month's featured servers and realms.</p>
            </FramerIn>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((server, i) => (
                <FramerIn key={server.id} delay={i * 0.1}>
                  <ServerCard server={server} />
                </FramerIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-8 pb-24">
        <FramerIn className="max-w-7xl mx-auto bg-gradient-to-br from-[#006e15] to-[#1A3D1A] rounded-3xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="font-pixel text-white text-3xl md:text-5xl mb-8">Ready to Explore?</h2>
            <p className="text-white/80 font-headline text-lg max-w-2xl mx-auto mb-12">
              Join thousands of players and creators in the most sophisticated Minecraft ecosystem ever built.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a 
                href="https://discord.gg/realmexplorer" 
                target="_blank" 
                rel="noreferrer"
                className="bg-white text-[#006e15] px-10 py-5 rounded-2xl font-headline font-bold hover:bg-[#4EC44E] hover:text-white transition-all min-w-[200px] flex items-center justify-center"
              >
                Join Discord
              </a>
              <Link 
                to="/servers" 
                className="bg-green-900/40 text-white border border-white/20 px-10 py-5 rounded-2xl font-headline font-bold hover:bg-green-900 transition-all min-w-[200px] flex items-center justify-center"
              >
                Browse Realms
              </Link>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pixel-grid pointer-events-none"></div>
        </FramerIn>
      </section>
    </AnimatedPage>
  )
}
