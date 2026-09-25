import { Link, useNavigate } from 'react-router-dom'
import { useServers, useGlobalStats, useOTMWinners, useSiteSetting, useServersByIds, useDirectoryStats } from '../hooks/queries'
import { ServerCard } from '../components/ServerCard'

import { AnimatedPage } from '../components/AnimatedPage'
import { DiscordInviteCard } from '../components/DiscordInviteCard'
import { FramerIn, FramerInList } from '../components/FramerIn'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { useState, useMemo, lazy, Suspense } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'
import { ArcFlowCarousel, fallbackServers } from '../components/ArcFlowCarousel'
import type { Server } from '../types'
import { slugify } from '../lib/urlUtils'

const CategoryRequestModal = lazy(() => import('../components/CategoryRequestModal').then(m => ({ default: m.CategoryRequestModal })))
const AffiliateModal = lazy(() => import('../components/AffiliateModal').then(m => ({ default: m.AffiliateModal })))
import { useCreateCategoryRequestMutation } from '../hooks/mutations'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import heroBg from '../assets/hero/Lush Caves1.jpg'
import ctaBg from '../assets/homepage/venture_mc.jpg'
import mcGif from '../assets/category/gif/6128-minecraft.gif'
import realmGif from '../assets/category/gif/9677-minecraftnetherportalblock (2).gif'
import { Folder, ChevronDown } from 'lucide-react'


// Category Icons
import factionsIcon from '../assets/category/7587-netherite-sword.png'
import kitpvpIcon from '../assets/category/95615-mace.png'
import skyblockIcon from '../assets/category/41601-minecraftoaktree.png'
import moddedIcon from '../assets/category/437888-bedrock.png'
import smpIcon from '../assets/category/708066-iron-pickaxe (1).png'
import skygenIcon from '../assets/category/89458-iron-block.png'
import prisonIcon from '../assets/category/7504_Iron_Bars.png'
import minigamesIcon from '../assets/category/9231_trident.png'

// Category Backgrounds
import factionsBg from '../assets/homepage/factionsbg.jpg'
import kitpvpBg from '../assets/homepage/kitpvp_new.webp'
import moddedBg from '../assets/homepage/modded_new.webp'
import skyblockBg from '../assets/homepage/skyblockbg.jpg'
import smpBg from '../assets/homepage/smpbg.jpg'
import skygenBg from '../assets/homepage/skygen.webp'
import prisonBg from '../assets/homepage/prisons.jpg'
import minigamesBg from '../assets/homepage/minigamebg.webp'

function StatItem({ value, label, suffix = '', formatter = (v: number) => v.toString(), align = 'center' }: { 
  value: number | undefined, 
  label: string, 
  suffix?: string,
  formatter?: (v: number) => string,
  align?: 'center' | 'left'
}) {
  return (
    <div className={`flex flex-col ${align === 'left' ? 'items-start text-left' : 'items-center text-center'} shrink-0`}>
      <span className="text-[#85fc7e] font-pixel text-base xs:text-xl md:text-2xl mb-1.5 md:mb-2 [text-shadow:0_2px_4px_rgba(0,0,0,0.85)] drop-shadow-md min-h-[24px] md:min-h-[32px] flex items-center">
        {value === undefined ? (
          <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-[#85fc7e]/30 border-t-[#85fc7e] rounded-full animate-spin"></div>
        ) : (
          formatter(value) + suffix
        )}
      </span>
      <span className="text-white font-headline text-[8px] md:text-[10px] tracking-widest uppercase font-bold leading-tight [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">{label}</span>
    </div>
  )
}

import { MetaTags } from '../components/MetaTags'

const categories = [
  { id: 'smp', name: 'SMP', icon: smpIcon, bg: smpBg, desc: 'Survival Multiplayer experiences focused on community.' },
  { id: 'factions', name: 'Factions', icon: factionsIcon, bg: factionsBg, desc: 'Build empires, forge alliances, and dominate the server.' },
  { id: 'kitpvp', name: 'KitPvP', icon: kitpvpIcon, bg: kitpvpBg, desc: 'Fast-paced combat with specialized loadouts.' },
  { id: 'skyblock', name: 'Skyblock', icon: skyblockIcon, bg: skyblockBg, desc: 'Start from nothing on a floating island.' },
  { id: 'modded', name: 'Modded', icon: moddedIcon, bg: moddedBg, desc: 'Modded high-end servers for players to experience.' },
  { id: 'skygen', name: 'SkyGen', icon: skygenIcon, bg: skygenBg, desc: 'Evolutionary sky-based generator survival.' },
  { id: 'prison', name: 'Prison', icon: prisonIcon, bg: prisonBg, desc: 'Mine, rank up, and escape in a prison environment.' },
  { id: 'minigames', name: 'Mini Games', icon: minigamesIcon, bg: minigamesBg, desc: 'Diverse collection of competitive and fun mini-games.' },
]

export function HomePage() {
  const isMobile = useIsMobile()
  const { data: featured = [], isLoading: isFeaturedLoading } = useServers({ featured: true, limit: 4 })
  const { data: topVotedServers = [] } = useServers({ sortBy: 'votes', limit: 20 })
  const { data: otmWinners = [] } = useOTMWinners()
  const { data: allApprovedServers = [] } = useServers({ limit: 40 })
  const { data: stats } = useGlobalStats()
  const { data: dirStats } = useDirectoryStats()
  const { data: introSetting } = useSiteSetting('homepage_intro')
  const introData = introSetting?.value as {word: string, color: string}[] | undefined
  const { data: showcaseCardsSetting } = useSiteSetting('homepage_showcase_cards')
  const showcaseCardIds = (showcaseCardsSetting?.value as string[]) || []
  const { data: manualShowcaseServers = [] } = useServersByIds(showcaseCardIds.length > 0 ? showcaseCardIds : undefined)

  const { user, signInWithDiscord } = useAuth()
  const navigate = useNavigate()
  const createRequestMutation = useCreateCategoryRequestMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [affiliateModal, setAffiliateModal] = useState({ isOpen: false, name: '', websiteUrl: '', discordUrl: '', logoUrl: '' })
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 150 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isMobile) return
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - left) / width - 0.5
    const y = (e.clientY - top) / height - 0.5
    mouseX.set(-x * 25)
    mouseY.set(-y * 25)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  // 6 carousel cards composed of:
  // - Top 3 main votes
  // - Recent OTM (server/realm) winners
  // - Remaining slots randomly picked from the top 20 main votes
  const carouselServers = useMemo(() => {
    if (showcaseCardIds.length > 0 && manualShowcaseServers.length > 0) {
      const selectedManual = showcaseCardIds.map(id => manualShowcaseServers.find(s => s.id === id)).filter(Boolean) as Server[]
      if (selectedManual.length > 0) {
        return selectedManual
      }
    }

    const selected: Server[] = []
    const seenIds = new Set<string>()

    // 1. Top 3 main votes
    const validTopVoted = topVotedServers.filter(s => s && s.id)
    for (const server of validTopVoted) {
      if (selected.length >= 3) break
      if (!seenIds.has(server.id)) {
        seenIds.add(server.id)
        selected.push(server)
      }
    }

    // 2. Recent OTM (server/realm) winners
    // OTM winners are ordered by created_at descending
    const recentOTMServers: Server[] = []
    for (const winner of otmWinners) {
      if (winner.category === 'server' || winner.category === 'realm') {
        const s: Server | null = winner.servers || (winner.winner_name ? {
          id: winner.server_id || `otm-${winner.id}`,
          name: winner.winner_name,
          slug: winner.winner_slug || slugify(winner.winner_name),
          banner_url: winner.winner_banner_url || null,
          icon_url: winner.winner_image_url || null,
          category: (winner.category === 'realm' ? 'smp' : 'smp') as Server['category'],
          type: (winner.category === 'realm' ? 'realm' : 'server') as Server['type'],
          status: 'approved',
          votes: 0,
          average_rating: 5,
          rating_count: 1,
          weighted_rating: 5,
          tags: [],
          gallery: [],
          created_at: winner.created_at,
          updated_at: winner.created_at,
          last_edited_at: winner.created_at,
          description: winner.description,
          featured: true,
          owner_id: null,
          ip_or_code: null,
          port: null,
          bedrock_ip: null,
          bedrock_port: null,
          website_url: null,
          discord_url: null,
          social_links: null,
          submitter_role: null,
          verify_discord: null,
        } : null)

        if (s && s.id && !seenIds.has(s.id)) {
          seenIds.add(s.id)
          recentOTMServers.push(s)
          // Include up to 2 recent server/realm winners
          if (recentOTMServers.length >= 2) break
        }
      }
    }

    for (const s of recentOTMServers) {
      if (selected.length >= 6) break
      selected.push(s)
    }

    // 3. Fill remaining slots up to 6 from the top 20 main votes (stable order)
    if (selected.length < 6) {
      const top20Candidates = validTopVoted.filter(s => !seenIds.has(s.id))
      for (const s of top20Candidates) {
        if (selected.length >= 6) break
        seenIds.add(s.id)
        selected.push(s)
      }
    }

    // 4. If we still have fewer than 6, fill remainder from approved servers or fallbackServers
    if (selected.length < 6) {
      const remainingApproved = allApprovedServers.filter(s => s && s.id && !seenIds.has(s.id))
      for (const s of remainingApproved) {
        if (selected.length >= 6) break
        if (!seenIds.has(s.id)) {
          seenIds.add(s.id)
          selected.push(s)
        }
      }
    }

    if (selected.length < 6) {
      for (const fb of fallbackServers) {
        if (selected.length >= 6) break
        if (!seenIds.has(fb.id)) {
          seenIds.add(fb.id)
          selected.push(fb)
        }
      }
    }

    return selected
  }, [topVotedServers, otmWinners, allApprovedServers, showcaseCardIds, manualShowcaseServers])

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

  return (
    <AnimatedPage>
      <MetaTags 
        title="Find & Promote Minecraft Servers"
        description="Discover the best Minecraft Servers and Realms. Vote for your favorites, list your community, and find your next adventure on the most modern discovery platform."
      />
      <header 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="pt-20 sm:pt-24 md:pt-28 pb-0 relative overflow-hidden flex flex-col items-center justify-start bg-zinc-950"
      >
        {/* Cinematic Background Image */}
        <motion.img 
          initial={isMobile ? { opacity: 0.45 } : { scale: 1.05, opacity: 0 }}
          animate={isMobile ? { opacity: 0.45 } : { scale: 1.1, opacity: 0.45 }}
          style={isMobile ? undefined : { x: springX, y: springY }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          src={heroBg} 
          alt="Hero Background"
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-cover object-[38%_center] z-0 block will-change-[opacity,transform]"
        />
        {/* Dark Radial Gradient Overlay for focus and legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-green-950/90 z-10"></div>
        
        {/* Hero Text Content (Centered, Layered on Top) */}
        <div className="max-w-4xl w-full mx-auto px-6 md:px-8 relative z-30 flex flex-col items-center text-center">
          <FramerIn delay={0.1}>
            <div className="inline-flex items-center gap-2 mb-6">
              <img src={mcGif} alt="Minecraft Icon" width={20} height={20} fetchPriority="high" loading="eager" className="w-5 h-5 object-contain drop-shadow-md" />
              <span className="font-pixel text-[8px] md:text-[9px] tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {introData ? (
                  introData.map((w, i) => (
                    <span key={i} style={{ color: w.color }} className="mr-1 last:mr-0">{w.word}</span>
                  ))
                ) : (
                  <>
                    <span className="text-[#85fc7e]">Ber</span> <span className="text-white">Months</span> <span className="text-white">yippie</span>
                  </>
                )}
              </span>
            </div>
          </FramerIn>
          
          <FramerIn delay={0.2}>
            <h1 className="font-pixel text-white text-3xl sm:text-4xl md:text-5xl leading-tight mb-4 md:mb-6 drop-shadow-2xl">
              Explore <br />
              <span className="text-[#4EC44E]">Every</span> Realm
            </h1>
          </FramerIn>
          
          <FramerIn delay={0.3}>
            <p className="text-zinc-300 max-w-xl text-xs sm:text-sm md:text-base mb-8 font-body leading-relaxed drop-shadow-lg mx-auto">
              Find, vote, and explore the best Minecraft servers and realms. Whether you're looking for a new world to join or want to grow your own server's community, Realm Explorer is your central hub for discovery.
            </p>
          </FramerIn>
          
          <FramerIn delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 w-full sm:w-auto">
              <Link to="/servers" className="bg-[#4EC44E] hover:bg-[#5cd45c] text-zinc-950 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-headline font-bold transition-colors flex items-center justify-center gap-2.5 group shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] border-b-[4px] border-[#3da53d] active:border-b-0 active:border-t-[4px] active:border-t-transparent text-xs sm:text-sm">
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
                className="bg-zinc-900/90 hover:bg-zinc-800/90 border-b-[4px] border-zinc-950 active:border-b-0 active:border-t-[4px] active:border-t-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-headline font-bold transition-colors text-xs sm:text-sm flex items-center justify-center gap-2 group"
              >
                List your Server
                <span className="material-symbols-outlined text-[16px] md:text-[18px] group-hover:scale-110 transition-transform">add_circle</span>
              </button>
            </div>
          </FramerIn>
          
          <FramerIn delay={0.5} className="w-full">
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-md mx-auto">
              <StatItem 
                value={stats?.servers} 
                label="Servers" 
                align="center"
              />
              <StatItem 
                value={stats?.users} 
                label="Global Users" 
                align="center"
                formatter={(v) => v.toLocaleString()}
              />
              <div className="flex flex-col items-center text-center shrink-0">
                <span className="text-[#85fc7e] font-pixel text-base xs:text-xl md:text-2xl mb-1.5 md:mb-2 [text-shadow:0_2px_4px_rgba(0,0,0,0.85)] drop-shadow-md min-h-[24px] md:min-h-[32px] flex items-center">99%</span>
                <span className="text-white font-headline text-[8px] md:text-[10px] tracking-widest uppercase font-bold leading-tight [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">Uptime Verified</span>
              </div>
            </div>
          </FramerIn>
        </div>

        {/* Carousel at bottom of hero - generous height preventing cutoffs, full width across screen */}
        <div className="w-full relative z-30 mt-3 sm:mt-5">
          <FramerIn delay={0.6} className="w-full">
            <ArcFlowCarousel 
              servers={carouselServers} 
              autoRotateSpeed={0.035}
              arcOffset={0.42}
              className="w-full h-[480px] sm:h-[540px] md:h-[580px]"
            />
          </FramerIn>
        </div>
        
        {/* Content Fade seamlessly into Categories section */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-transparent z-30 pointer-events-none"></div>
      </header>

      <section className="pt-6 sm:pt-8 md:pt-12 pb-12 md:pb-24 px-8 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <FramerIn className="mb-14 md:mb-20">
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
                  <img src={c.bg} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-all duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
                </div>

                <div className="relative z-10">
                  <div className={`w-8 h-8 md:w-10 md:h-10 bg-white/10 ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'} rounded-lg flex items-center justify-center mb-3 md:mb-4 group-hover:bg-realm-green transition-all duration-300`}>
                    <img src={c.icon} alt={c.name} width={24} height={24} loading="lazy" decoding="async" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                  </div>
                  <h3 className="font-pixel text-sm md:text-base mb-1 text-white drop-shadow-md">{c.name}</h3>
                  <p className="text-zinc-300 text-[10px] md:text-[11px] leading-relaxed mb-3 md:mb-4 line-clamp-2 min-h-[2.5rem]">{c.desc}</p>
                  <div className="text-[#5cad57] font-headline text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group/link group-hover:text-white transition-colors">
                    Explore
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

      <section className="pt-0 pb-8 md:pb-16 px-6 md:px-8 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <FramerIn className="text-center mb-12 md:mb-16">
            <h2 className="font-pixel text-white text-xl md:text-2xl mb-2">Our Partners</h2>
            <div className="h-1 w-12 md:w-16 bg-primary-container mx-auto"></div>
          </FramerIn>
          <FramerIn delay={0.2} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
            <div className="scale-[0.85] md:scale-100 origin-top md:origin-center w-full flex justify-center">
              <DiscordInviteCard 
                inviteCode="nVqt3z78Mw"
                websiteUrl="https://communityone.io/"
                className="w-full max-w-[350px] h-full justify-start hover:border-purple-500/50 transition-colors duration-300"
              />
            </div>
            <div className="scale-[0.85] md:scale-100 origin-top md:origin-center w-full flex justify-center -mt-8 md:mt-0">
              <DiscordInviteCard 
                inviteCode="realmbot"
                websiteUrl="https://realmbot.dev/"
                className="w-full max-w-[350px] h-full justify-start hover:border-realm-green/50 transition-colors duration-300"
              />
            </div>
          </FramerIn>
        </div>
      </section>

      {(featured.length > 0 || isFeaturedLoading) && (
        <section className="py-12 md:py-24 px-8 bg-zinc-950">
          <div className="max-w-7xl mx-auto">
            <FramerIn className="text-center mb-14 md:mb-20">
              <h2 className="font-pixel text-white text-xl md:text-3xl mb-4 uppercase tracking-widest">Hall of Fame</h2>
              <p className="text-zinc-400 font-headline text-xs md:text-sm">This month's featured servers and realms.</p>
            </FramerIn>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {isFeaturedLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="min-h-[350px] md:min-h-[380px]" />
                ))
              ) : (
                featured.map((server, i) => (
                  <FramerIn key={server.id} delay={i * 0.1}>
                    <ServerCard server={server} />
                  </FramerIn>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 md:px-8 py-8 md:py-24 bg-[#0A0A0A]">
        <FramerIn className="max-w-5xl mx-auto bg-zinc-900 rounded-xl px-5 py-8 md:p-14 relative overflow-hidden shadow-2xl border border-white/5">
          {/* Cinematic Background Image */}
          <img 
            src={ctaBg} 
            alt="CTA Background" 
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover opacity-40 z-0"
          />
          {/* Gradient Overlay for Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-10" />
          
          <div className="relative z-20 flex flex-col md:flex-row items-start justify-between gap-10">
            <div className="flex-1 text-left pt-2 md:pt-4">
              <h2 className="font-pixel text-white text-2xl md:text-4xl mb-6 leading-tight">Ready to Explore?</h2>
              <p className="text-white/80 font-headline text-sm md:text-lg max-w-lg leading-relaxed">
                Join thousands of players and creators in the most sophisticated Minecraft ecosystem ever built.
              </p>
              
              <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-8 md:mt-10">
                <Link 
                  to="/servers?type=realm" 
                  className="group flex items-center px-5 py-2.5 bg-zinc-800/50 hover:bg-zinc-700/60 text-zinc-200 hover:text-white font-semibold rounded-lg border border-zinc-700/50 hover:border-zinc-500 transition-all duration-300 font-headline text-sm"
                >
                  <div className="flex items-center gap-2">
                    <img src={realmGif} alt="" className="w-4 h-4 object-contain rounded-sm" />
                    <span>Realms</span>
                  </div>
                  <div className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 flex items-center">
                    <span className="pl-2 text-zinc-400 text-xs font-normal">({dirStats?.realms || 0})</span>
                  </div>
                </Link>
                <Link 
                  to="/servers?type=server" 
                  className="group flex items-center px-5 py-2.5 bg-zinc-800/50 hover:bg-zinc-700/60 text-zinc-200 hover:text-white font-semibold rounded-lg border border-zinc-700/50 hover:border-zinc-500 transition-all duration-300 font-headline text-sm"
                >
                  <div className="flex items-center gap-2">
                    <img src={mcGif} alt="" className="w-4 h-4 object-contain rounded-sm" />
                    <span>Servers</span>
                  </div>
                  <div className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 flex items-center">
                    <span className="pl-2 text-zinc-400 text-xs font-normal">({dirStats?.servers || 0})</span>
                  </div>
                </Link>
                <Link 
                  to="/projects" 
                  className="group flex items-center px-5 py-2.5 bg-zinc-800/50 hover:bg-zinc-700/60 text-zinc-200 hover:text-white font-semibold rounded-lg border border-zinc-700/50 hover:border-zinc-500 transition-all duration-300 font-headline text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    <span>Projects</span>
                  </div>
                  <div className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 flex items-center">
                    <span className="pl-2 text-zinc-400 text-xs font-normal">({dirStats?.projects || 0})</span>
                  </div>
                </Link>
              </div>
            </div>
            
            <div className="flex-shrink-0 z-30 origin-top md:origin-center w-full md:w-auto flex justify-center md:block mt-8 md:mt-0">
              <div className="w-[125%] md:w-auto scale-[0.85] md:scale-100 origin-top flex justify-center md:block">
                <DiscordInviteCard 
                  inviteCode="G8CyUZjPRt"
                  bannerImg={ctaBg}
                  className="w-full md:w-[350px] max-w-none md:max-w-full"
                />
              </div>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pixel-grid pointer-events-none"></div>
        </FramerIn>
      </section>

      {/* SEO Content Section */}
      <section className="w-full bg-zinc-950 py-8 md:py-20 px-6 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col gap-12 md:gap-16">
          <div>
            <div className="mb-6 md:mb-8 text-center flex flex-col items-center">
              <h2 className="font-pixel text-lg md:text-2xl mb-4 text-white">Frequently Asked Questions</h2>
              <div className="h-1 w-16 md:w-24 bg-realm-green"></div>
            </div>
            <div className="flex flex-col gap-4">
              {[
                {
                  q: "How do I join a Minecraft server from this list?",
                  a: "Joining a server is easy! Simply browse our directory and click on any server that catches your eye to view its dedicated page. There, you will find the Server IP (for Java Edition) or the Realm Code / Port (for Bedrock Edition). Open your Minecraft client, navigate to the Multiplayer or Realms tab, and enter the provided details. Many servers also feature a direct \"Join Discord\" button so you can meet the community before you even log in!"
                },
                {
                  q: "What is the difference between a Server and a Realm?",
                  a: "Minecraft Servers are independently hosted multiplayer worlds that can support anywhere from dozens to thousands of concurrent players. They often feature custom plugins, mini-games, and extensive modifications (like economy systems and custom biomes). Minecraft Realms, on the other hand, are officially hosted by Mojang. They are typically smaller, invite-only, or code-based servers designed for tight-knit groups of friends or smaller communities to enjoy a vanilla survival experience without the hassle of third-party hosting."
                },
                {
                  q: "How can I get my server listed on Realm Explorer?",
                  a: "If you are a server owner or community manager, you can list your server by creating a free account on our platform and navigating to the Dashboard. From there, you can submit your server's details, upload a custom banner, and sync your Discord community. Once approved by our moderation team, your server will instantly appear in our directory and become eligible to receive votes from the community. Higher votes mean better visibility!"
                },
                {
                  q: "What are Server Categories?",
                  a: "To help you find exactly what you are looking for, we divide our directory into multiple categories. \"SMP\" stands for Survival Multiplayer, focusing on cooperative vanilla gameplay. \"Factions\" involves claiming land, raiding enemies, and engaging in PvP. \"Skyblock\" challenges you to survive and build an empire starting from a single floating block. We also feature Modded servers, Prison servers, SkyGen, and Minigames. You can use the category filters at the top of the page to narrow down your search instantly."
                }
              ].map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 overflow-hidden">
                    <button 
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-white/[0.02] transition-colors"
                    >
                      <h3 className="text-sm md:text-base font-headline font-bold text-white pr-4">{faq.q}</h3>
                      <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                          <div className="mx-5 md:mx-6 px-1 pb-5 md:pb-6 pt-4 border-t border-zinc-800/50">
                            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-body">
                              {faq.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <CategoryRequestModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleRequestSubmit}
          isSubmitting={createRequestMutation.isPending}
        />
        <AffiliateModal
          isOpen={affiliateModal.isOpen}
          onClose={() => setAffiliateModal(prev => ({ ...prev, isOpen: false }))}
          affiliateName={affiliateModal.name}
          websiteUrl={affiliateModal.websiteUrl}
          discordUrl={affiliateModal.discordUrl}
          logoUrl={affiliateModal.logoUrl}
        />
      </Suspense>
    </AnimatedPage>
  )
}
