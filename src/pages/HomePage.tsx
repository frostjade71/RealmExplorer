import { Link, useNavigate } from 'react-router-dom'
import { useServers, useGlobalStats } from '../hooks/queries'
import { ServerCard } from '../components/ServerCard'
import { LoadingSpinner } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn, FramerInList } from '../components/FramerIn'
import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'
import { CategoryRequestModal } from '../components/CategoryRequestModal'
import { useCreateCategoryRequestMutation } from '../hooks/mutations'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import heroVideo from '../assets/hero/heroRE.mp4'
import ctaBg from '../assets/homepage/Minecraft Buddies.jpg'
import mcGif from '../assets/category/gif/6128-minecraft.gif'

// Category Icons
import factionsIcon from '../assets/category/7587-netherite-sword.png'
import kitpvpIcon from '../assets/category/95615-mace.png'
import skyblockIcon from '../assets/category/41601-minecraftoaktree.png'
import moddedIcon from '../assets/category/437888-bedrock.png'
import smpIcon from '../assets/category/708066-iron-pickaxe (1).png'
import skygenIcon from '../assets/category/89458-iron-block.png'
import prisonIcon from '../assets/category/7504_Iron_Bars.png'

// Category Backgrounds
import factionsBg from '../assets/homepage/factionsbg.jpg'
import kitpvpBg from '../assets/homepage/kitpvpbg.jpg'
import moddedBg from '../assets/homepage/modded.jpg'
import skyblockBg from '../assets/homepage/skyblockbg.jpg'
import smpBg from '../assets/homepage/smpbg.jpg'
import skygenBg from '../assets/homepage/skygen.webp'
import prisonBg from '../assets/homepage/prisons.jpg'

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
    <div className="flex flex-col items-center shrink-0">
      <motion.span className="text-[#85fc7e] font-pixel text-base xs:text-xl md:text-2xl mb-1.5 md:mb-2 drop-shadow-md">
        {display}
      </motion.span>
      <span className="text-white/40 font-headline text-[8px] md:text-[10px] tracking-widest uppercase font-bold text-center leading-tight">{label}</span>
    </div>
  )
}

import { MetaTags } from '../components/MetaTags'

export function HomePage() {
  const isMobile = useIsMobile()
  const { data: featured = [], isLoading: loadingFeatured } = useServers({ featured: true, limit: 4 })
  const { data: stats, isLoading: loadingStats } = useGlobalStats()
  const { user, signInWithDiscord } = useAuth()
  const navigate = useNavigate()
  const createRequestMutation = useCreateCategoryRequestMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleRequestSubmit = async (subject: string, description: string) => {
    if (!user) return
    try {
      await createRequestMutation.mutateAsync({
        requester_id: user.id,
        subject,
        description
      })
      toast.success('Request Submitted', {
        description: 'Your category request has been sent for review.'
      })
      setIsModalOpen(false)
    } catch (err: any) {
      console.error('Failed to submit category request:', err)
      toast.error('Submission Failed', {
        description: err.message || 'An error occurred while submitting your request.'
      })
    }
  }

  if (loadingFeatured || loadingStats) return <LoadingSpinner />

  const safeStats = stats || { servers: 450, users: 12000 }

  const categories = [
    { id: 'smp', name: 'SMP', icon: smpIcon, bg: smpBg, desc: 'Survival Multiplayer experiences focused on community.' },
    { id: 'factions', name: 'Factions', icon: factionsIcon, bg: factionsBg, desc: 'Build empires, forge alliances, and dominate the server.' },
    { id: 'kitpvp', name: 'KitPvP', icon: kitpvpIcon, bg: kitpvpBg, desc: 'Fast-paced combat with specialized loadouts.' },
    { id: 'skyblock', name: 'Skyblock', icon: skyblockIcon, bg: skyblockBg, desc: 'Start from nothing on a floating island.' },
    { id: 'modded', name: 'Modded', icon: moddedIcon, bg: moddedBg, desc: 'Modded high-end servers for players to experience.' },
    { id: 'skygen', name: 'SkyGen', icon: skygenIcon, bg: skygenBg, desc: 'Evolutionary sky-based generator survival.' },
    { id: 'prison', name: 'Prison', icon: prisonIcon, bg: prisonBg, desc: 'Mine, rank up, and escape in a prison environment.' },
  ]

  return (
    <AnimatedPage>
      <MetaTags 
        title="Find & Promote Minecraft Servers"
        description="Discover the best Minecraft Servers and Realms. Vote for your favorites, list your community, and find your next adventure on the most modern discovery platform."
      />
      <header className="pt-32 pb-20 px-8 relative overflow-hidden min-h-[50vh] md:min-h-[65vh] flex flex-col items-center justify-center bg-zinc-950">
        {/* Cinematic Background */}
        <motion.video 
          initial={isMobile ? { opacity: 0.5 } : { scale: 1.1, opacity: 0 }}
          animate={isMobile ? { opacity: 0.5 } : { scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroVideo} 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 block will-change-[opacity,transform]"
        />
        {/* Dark Radial Gradient Overlay for focus and legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-green-950/90 z-10"></div>
        
        <div className="max-w-7xl mx-auto relative z-20 flex flex-col items-center text-center will-change-transform">
          <FramerIn delay={0.2}>
            <div className={`inline-flex items-center gap-2 bg-zinc-800/90 border-t-2 border-l-2 border-white/20 border-r-2 border-b-2 border-black/50 px-3 py-1 mb-6 md:mb-8 text-[#85fc7e] shadow-[2px_2px_0px_rgba(0,0,0,0.4)] ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'}`}>
              <img src={mcGif} alt="Minecraft Icon" className="w-5 h-5 object-contain" />
              <span className="font-pixel text-[8px] md:text-[9px] tracking-widest uppercase">The Website is now in Full Release</span>
            </div>
          </FramerIn>
          
          <FramerIn delay={0.4}>
            <h1 className="font-pixel text-white text-3xl md:text-5xl leading-tight mb-4 md:mb-6 drop-shadow-2xl">
              Explore <br className="hidden md:block"/>
              <span className="text-[#4EC44E]">Every</span> Realm
            </h1>
          </FramerIn>
          
          <FramerIn delay={0.6}>
            <p className="text-white/80 max-w-xl text-xs md:text-base mb-8 md:mb-10 font-body leading-relaxed drop-shadow-lg mx-auto px-4">
              Find, vote, and explore the best Minecraft servers and realms. Whether you're looking for a new world to join or want to grow your own server's community, Realm Explorer is your central hub for discovery.
            </p>
          </FramerIn>
          
          <FramerIn delay={0.8}>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10 md:mb-12">
              <Link to="/servers" className="bg-[#006e15] hover:brightness-110 text-white px-6 md:px-8 py-3 md:py-3.5 rounded-lg font-headline font-bold transition-all flex items-center gap-2.5 group shadow-xl shadow-green-900/10 text-[12px] md:text-sm">
                Browse Servers
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-sm">arrow_forward</span>
              </Link>
              <button 
                onClick={() => {
                  if (user) {
                    navigate('/dashboard')
                  } else {
                    signInWithDiscord()
                  }
                }}
                className={`bg-white/5 border border-white/10 hover:border-white/30 ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-sm'} text-white px-6 md:px-8 py-3 md:py-3.5 rounded-lg font-headline font-bold transition-all text-[12px] md:text-sm flex items-center justify-center gap-2 group`}
              >
                List your Server
                <span className="material-symbols-outlined text-[16px] md:text-[18px] group-hover:scale-110 transition-transform">add_circle</span>
              </button>
            </div>
          </FramerIn>
          
          <FramerIn delay={1.0}>
            <div className="grid grid-cols-3 gap-2 md:gap-8 max-w-4xl w-full px-4 md:px-0 mt-4 md:mt-0">
              <StatItem 
                value={safeStats.servers} 
                label="Servers" 
                suffix="+"
              />
              <StatItem 
                value={safeStats.users} 
                label="Global Users" 
                formatter={(v) => v.toLocaleString()}
              />
              <div className="flex flex-col items-center shrink-0">
                <span className="text-[#85fc7e] font-pixel text-base xs:text-xl md:text-2xl mb-1.5 md:mb-2 drop-shadow-md">99%</span>
                <span className="text-white/40 font-headline text-[8px] md:text-[10px] tracking-widest uppercase font-bold text-center leading-tight">Uptime Verified</span>
              </div>
            </div>
          </FramerIn>
        </div>
        
        {/* Content Fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-20"></div>
      </header>

      <section className="py-12 md:py-24 px-8 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <FramerIn className="mb-10 md:mb-16">
            <h2 className="font-pixel text-on-surface text-xl md:text-2xl mb-4 text-white">Server Categories</h2>
            <div className="h-1 w-16 md:w-24 bg-primary-container"></div>
          </FramerIn>
          
          <FramerInList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map(c => (
              <Link 
                key={c.id} 
                to={`/servers?category=${c.id}`}
                className="relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:shadow-2xl transition-all group min-h-[180px] md:min-h-[220px] flex flex-col justify-end p-5 md:p-6"
              >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                  <img src={c.bg} alt="" className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-all duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
                </div>

                <div className="relative z-10">
                  <div className={`w-8 h-8 md:w-10 md:h-10 bg-white/10 ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'} rounded-lg flex items-center justify-center mb-3 md:mb-4 group-hover:bg-realm-green transition-all duration-300`}>
                    <img src={c.icon} alt={c.name} className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                  </div>
                  <h3 className="font-pixel text-sm md:text-base mb-1 text-white drop-shadow-md">{c.name}</h3>
                  <p className="text-zinc-300 text-[10px] md:text-[11px] leading-relaxed mb-3 md:mb-4 line-clamp-2 min-h-[2.5rem]">{c.desc}</p>
                  <div className="text-[#85fc7e] font-headline text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group/link group-hover:text-white transition-colors">
                    Explore Realms
                    <span className="material-symbols-outlined text-[12px] md:text-[14px] group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </Link>
            ))}
            <button 
              onClick={() => user ? setIsModalOpen(true) : signInWithDiscord()}
              className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg hover:shadow-lg transition-all group border-dashed flex flex-col items-center justify-center text-center min-h-[180px] md:min-h-[220px] w-full"
            >
              <span className="material-symbols-outlined text-2xl md:text-3xl text-zinc-600 mb-2 md:mb-3 transition-transform group-hover:scale-110 group-hover:text-realm-green">add_circle</span>
              <h3 className="font-pixel text-sm md:text-base mb-1 text-zinc-500 group-hover:text-white transition-colors">+ More</h3>
              <p className="text-zinc-600 text-[10px] md:text-xs">Request a category</p>
            </button>
          </FramerInList>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="py-12 md:py-24 px-8 bg-zinc-950">
          <div className="max-w-7xl mx-auto">
            <FramerIn className="text-center mb-10 md:mb-16">
              <h2 className="font-pixel text-white text-xl md:text-3xl mb-4 uppercase tracking-widest">Hall of Fame</h2>
              <p className="text-zinc-400 font-headline text-xs md:text-sm">This month's featured servers and realms.</p>
            </FramerIn>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map((server, i) => (
                <FramerIn key={server.id} delay={i * 0.1}>
                  <ServerCard server={server} />
                </FramerIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-8 pb-12 md:pb-24">
        <FramerIn className="max-w-5xl mx-auto bg-zinc-900 rounded-xl p-8 md:p-14 text-center relative overflow-hidden shadow-2xl border border-white/5">
          {/* Cinematic Background Image */}
          <img 
            src={ctaBg} 
            alt="CTA Background" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 z-0"
          />
          {/* Gradient Overlay for Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
          
          <div className="relative z-20">
            <h2 className="font-pixel text-white text-xl md:text-3xl mb-4 md:mb-6">Ready to Explore?</h2>
            <p className="text-white/80 font-headline text-xs md:text-base max-w-xl mx-auto mb-6 md:mb-8 leading-relaxed px-4">
              Join thousands of players and creators in the most sophisticated Minecraft ecosystem ever built.
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <a 
                href="https://discord.gg/realmexplorer" 
                target="_blank" 
                rel="noreferrer"
                className="bg-white text-[#006e15] px-6 md:px-8 py-3 md:py-4 rounded-lg font-headline font-bold hover:bg-[#4EC44E] hover:text-white transition-all min-w-[140px] md:min-w-[180px] flex items-center justify-center text-xs md:text-sm"
              >
                Join Discord
              </a>
              <Link 
                to="/servers" 
                className="bg-green-900/40 text-white border border-white/20 px-6 md:px-8 py-3 md:py-4 rounded-lg font-headline font-bold hover:bg-green-900 transition-all min-w-[140px] md:min-w-[180px] flex items-center justify-center text-xs md:text-sm"
              >
                Browse Realms
              </Link>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pixel-grid pointer-events-none"></div>
        </FramerIn>
      </section>

      <CategoryRequestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRequestSubmit}
        isSubmitting={createRequestMutation.isPending}
      />
    </AnimatedPage>
  )
}
