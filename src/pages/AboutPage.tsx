import { useMemo } from 'react'
import { Crown, Plus } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion } from 'framer-motion'
import { useIsMobile } from '../hooks/useMediaQuery'
import aboutHero from '../assets/aboutRE.png'
import minecraftGif from '../assets/category/gif/6128-minecraft.gif'
import { Link } from 'react-router-dom'

import blogBanner from '../assets/pjdirectory/Banner_Pattern_JE1_BE1.png'
import otmMedal from '../assets/leaderboards/76245-medalla (1).gif'
import goalHeart from '../assets/blog/minecraftheart.png'
import goalPickaxe from '../assets/pjdirectory/4441_MCdiamondpickaxe.png'
import goalEmerald from '../assets/OTM/185424-esmeralda.png'
import goalBook from '../assets/OTM/9e8def35f04e0f96840b5d16e8a247f5f59b81be.webp'
import directoryHero from '../assets/hero/directoryhero.jpg'


import factionsIcon from '../assets/category/7587-netherite-sword.png'
import kitpvpIcon from '../assets/category/95615-mace.png'
import skyblockIcon from '../assets/category/41601-minecraftoaktree.png'
import moddedIcon from '../assets/category/437888-bedrock.png'
import smpIcon from '../assets/category/708066-iron-pickaxe (1).png'
import skygenIcon from '../assets/category/89458-iron-block.png'
import prisonIcon from '../assets/category/7504_Iron_Bars.png'
import minigamesIcon from '../assets/category/9231_trident.png'

import { useOTMWinners } from '../hooks/queries'
import { MetaTags } from '../components/MetaTags'

export function AboutPage() {
  const isMobile = useIsMobile()
  const { data: winners, isLoading: loadingWinners } = useOTMWinners()

  const winnersByMonth = useMemo(() => {
    if (!winners) return {}
    const groups: Record<string, typeof winners> = {}
    winners.forEach(w => {
      const month = w.month || 'Other'
      if (!groups[month]) groups[month] = []
      groups[month].push(w)
    })
    return groups
  }, [winners])

  const months = useMemo(() => {
    if (!winners) return []
    const uniqueMonths: string[] = []
    winners.forEach(w => {
      if (w.month && !uniqueMonths.includes(w.month)) {
        uniqueMonths.push(w.month)
      }
    })
    return uniqueMonths
  }, [winners])

  const latestMonths = months.slice(0, 2)
  const recentWinnersCount = latestMonths.reduce((sum, m) => sum + (winnersByMonth[m]?.length || 0), 0)
  const remainingWinnersCount = (winners?.length || 0) - recentWinnersCount

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-[#050805]">
        <MetaTags
          title="About Realm Explorer"
          description="Learn more about Realm Explorer, the ultimate hub for Minecraft Server and Realm discovery. Our mission is to unify the community and provide a safe space for players and creators."
          url="/about"
        />

        <header className="sticky top-0 z-0 w-full h-[30vh] md:h-[60vh] flex flex-col items-center justify-center overflow-hidden bg-[#050805]">
        <motion.img
          initial={isMobile ? { opacity: 0 } : { scale: 1.1, opacity: 0 }}
          animate={isMobile ? { opacity: 1 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          src={aboutHero}
          alt="About Hero"
          className="w-full h-full object-cover object-top md:object-center z-0 will-change-[opacity,transform]"
          fetchPriority="high"
          loading="eager"
          decoding="sync"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050805]/90 z-10"></div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 w-full bg-[#050805] shadow-[0_-15px_30px_#050805]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-24 space-y-10 md:space-y-32">

        {/* The Ecosystem (Highlighting recent updates) */}
        <section>
          <FramerIn className="text-center mb-6 md:mb-10 max-w-2xl mx-auto">
            <h2 className="text-xl md:text-3xl font-pixel text-white uppercase tracking-wider mb-3">Welcome Explorers!</h2>
            <p className="text-zinc-400 font-headline text-xs md:text-sm leading-relaxed">
              Here at Realm Explorer, we provide a unified hub for Minecraft Servers, Realms, and custom projects. We offer a safe, comprehensive ecosystem built to empower players and creators to share, discover, and build the future of Minecraft together.
            </p>
          </FramerIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
            {[
              {
                title: 'Server Directory',
                desc: 'Browse and vote for the best Minecraft Servers and Realms in a centralized, verified list.',
                image: '/badges/mc-earth-main.webp',
                link: '/servers',
                linkText: 'Browse Directory'
              },
              {
                title: 'OTM Competitions',
                desc: 'Vote in our monthly community contests to crown the best Builder, Developer, Server, and Realm.',
                image: otmMedal,
                link: '/leaderboards',
                linkText: 'Check Standings'
              },
              {
                title: 'Weekly Blog & Updates',
                desc: 'Stay informed with official announcements, community spotlights, and developer changelogs.',
                image: blogBanner,
                link: '/blog',
                linkText: 'Read Blog'
              },
              {
                title: 'Project Explorer',
                desc: 'A dedicated showcase page for creators and builders to share custom Add-ons, resource packs, and maps.',
                image: '/badges/6174-craftingtable.png',
                link: '/projects',
                linkText: 'Explore Projects'
              },
            ].map((feature, i) => (
              <FramerIn key={i} delay={i * 0.1} className="flex">
                <div className="relative bg-zinc-900 border border-white/5 p-4 md:p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 w-full shadow-md hover:shadow-2xl">
                  <div>
                    <div className="w-10 h-10 flex items-center justify-center mb-4 overflow-hidden">
                      {feature.image ? (
                        <img src={feature.image} alt="" className="w-full h-full object-contain" loading="lazy" decoding="async" />
                      ) : (
                        <div className="w-10 h-10 text-realm-green flex items-center justify-center group-hover:text-white transition-all duration-300">
                          {/* Fallback component icon if needed */}
                        </div>
                      )}
                    </div>
                    <h3 className="text-white font-pixel text-[10px] md:text-xs uppercase tracking-wider mb-2 leading-normal">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-400 font-headline text-xs leading-relaxed mb-6">{feature.desc}</p>
                  </div>
                  <Link to={feature.link} className="text-[#85fc7e] hover:text-white font-headline text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors mt-auto">
                    {feature.linkText}
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </Link>
                </div>
              </FramerIn>
            ))}
          </div>
        </section>

        {/* What We Offer */}
        <section>
          <div className="max-w-4xl mx-auto">
            <FramerIn className="bg-[#050805] border border-white/5 p-5 md:p-8 rounded-3xl relative overflow-hidden shadow-lg">
              {/* Decorative radial blur gradient */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-realm-green/5 blur-3xl pointer-events-none rounded-full" />

              <div className="relative z-10 flex flex-col gap-4 md:gap-6">
                <div className="flex flex-col items-center justify-center gap-1.5 md:gap-2 mb-1 md:mb-3">
                  <img src={minecraftGif} alt="" className="w-6 h-6 md:w-8 md:h-8 object-contain" loading="lazy" decoding="async" />
                  <h2 className="text-lg md:text-2xl font-pixel text-white uppercase tracking-wider text-center">What We Offer</h2>
                </div>

                <p className="text-zinc-400 font-headline leading-relaxed text-xs md:text-base text-center max-w-2xl mx-auto">
                  A community where you can discover new networks, find your next adventure, and join Minecraft servers or realms directly across console, mobile, and PC with the following categories:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-2">
                  {[
                    { name: 'SMPs', icon: smpIcon, id: 'smp' },
                    { name: 'Factions', icon: factionsIcon, id: 'factions' },
                    { name: 'Skyblock', icon: skyblockIcon, id: 'skyblock' },
                    { name: 'KitPvP', icon: kitpvpIcon, id: 'kitpvp' },
                    { name: 'SkyGen', icon: skygenIcon, id: 'skygen' },
                    { name: 'Prison', icon: prisonIcon, id: 'prison' },
                    { name: 'Mini Games', icon: minigamesIcon, id: 'minigames' },
                    { name: 'Modded', icon: moddedIcon, id: 'modded' },
                    { name: 'And More!', icon: '/badges/mc-earth-main.webp', id: '' },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      to={item.id ? `/servers?category=${item.id}` : '/servers'}
                      className="bg-[#050805] border border-white/5 px-4 py-3 rounded-xl flex items-center gap-3 group transition-all duration-300 font-headline shadow-sm hover:border-zinc-700 hover:shadow-md"
                    >
                      <div className="w-8 h-8 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={item.icon} alt={item.name} className="w-6 h-6 md:w-7 md:h-7 object-contain group-hover:scale-110 transition-transform duration-300" loading="lazy" decoding="async" />
                      </div>
                      <span className="text-white text-[11px] md:text-xs font-bold tracking-wide">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </FramerIn>
          </div>
        </section>

        {/* Key Goals */}
        <section className="bg-[#050805] border border-white/5 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-realm-green/5 blur-3xl pointer-events-none rounded-full" />

          <FramerIn className="flex flex-col items-center justify-center gap-1.5 md:gap-2 mb-4 md:mb-8">
            <Plus className="w-5 h-5 md:w-7 md:h-7 text-[#85fc7e]" />
            <h2 className="text-lg md:text-2xl font-pixel text-white uppercase tracking-wider text-center">Key Goals</h2>
          </FramerIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto relative z-10">
            {[
              { text: 'A safe environment unifying Minecraft Realms & Servers', image: goalHeart },
              { text: 'A solution to every problem within Realm Development', image: goalEmerald },
              { text: 'A place to advertise and look for Realms / Servers', image: '/badges/mc-earth-main.webp' },
              { text: 'A place to safely view Realms / Servers inside a Minecraft Realm with custom menu\'s and a nice interface', image: goalBook },
              { text: 'A place to find new friends and experience great things', image: goalPickaxe },
            ].map((goal, i) => (
              <div key={i} className="flex gap-4 items-start group">
                <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center overflow-hidden">
                  <img src={goal.image} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" loading="lazy" decoding="async" />
                </div>
                <div className="flex-1">
                  <p className="text-zinc-400 font-headline text-xs md:text-sm leading-relaxed group-hover:text-white transition-colors pt-1 md:pt-0">
                    {goal.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent OTM Winners */}
        <section>
          <FramerIn className="flex flex-col items-center text-center gap-1.5 md:gap-2 mb-6 md:mb-12">
            <div className="flex items-center gap-3 mb-1">
              <img src={otmMedal} alt="Medal" className="w-6 h-6 md:w-8 md:h-8 object-contain" loading="lazy" decoding="async" />
            </div>
            <h2 className="text-lg md:text-3xl font-pixel text-white uppercase tracking-wider text-center">Recent OTM Winners</h2>
            <p className="text-zinc-500 font-headline text-[10px] md:text-sm max-w-xl">We highlight our outstanding creators, networks, and members crowned monthly.</p>
          </FramerIn>

          {loadingWinners ? (
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-6xl mx-auto">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[calc(50%-8px)] sm:w-[calc(33.33%-11px)] lg:w-[calc(25%-24px)] max-w-[280px] aspect-square bg-zinc-900 border border-white/5 rounded-2xl animate-pulse shadow-sm" />
              ))}
            </div>
          ) : latestMonths.length > 0 ? (
            <div className="space-y-16 max-w-6xl mx-auto flex flex-col items-center">
              {latestMonths.map((month) => (
                <div key={month} className="space-y-6 w-full">
                  <div className="flex items-center gap-4">
                    <h3 className="font-pixel text-white text-sm md:text-lg uppercase tracking-wider whitespace-nowrap">
                      {month}
                    </h3>
                    <div className="h-[1px] w-full bg-gradient-to-r from-realm-green/30 to-transparent" />
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                    {[...(winnersByMonth[month] || [])]
                      .sort((a, b) => {
                        const order: Record<string, number> = { realm: 1, server: 2, builder: 3, developer: 4 }
                        return (order[a.category] || 99) - (order[b.category] || 99)
                      })
                      .map((winner) => {
                      const award = {
                        realm: { label: 'Realm', iconColor: 'text-purple-400', textColor: 'text-purple-400', defaultLink: '/rotm' },
                        server: { label: 'Server', iconColor: 'text-realm-green', textColor: 'text-realm-green', defaultLink: '/sotm' },
                        builder: { label: 'Builder', iconColor: 'text-orange-400', textColor: 'text-orange-400', defaultLink: '/botm' },
                        developer: { label: 'Developer', iconColor: 'text-blue-400', textColor: 'text-blue-400', defaultLink: '/dotm' },
                      }[winner.category as 'realm'|'server'|'builder'|'developer'] || { label: winner.category, iconColor: 'text-white', textColor: 'text-white', defaultLink: '/' }

                      const link = winner.category === 'realm' || winner.category === 'server'
                        ? `/server/${winner.winner_slug || winner.servers?.slug}`
                        : `/profile/${winner.profiles?.discord_username || winner.winner_slug}`

                      return (
                        <Link to={link} key={winner.id} className="group flex flex-col w-[calc(50%-8px)] sm:w-[calc(33.33%-11px)] lg:w-[calc(25%-24px)] max-w-[280px]">
                          <div className={`relative w-full aspect-square bg-[#050805] border border-white/5 rounded-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col items-center justify-center p-4 md:p-6 shadow-md hover:shadow-2xl`}>
                            {/* Winner Banner background */}
                            {winner.winner_banner_url && (
                              <div className="absolute inset-0 z-0 opacity-30 transition-opacity duration-300">
                                <img src={winner.winner_banner_url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050805] via-[#050805]/60 to-transparent pointer-events-none" />
                              </div>
                            )}

                            {/* Inner glow on hover */}
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors pointer-events-none z-0" />
                            
                            {/* Image / Avatar / Icon */}
                            <div className="relative z-10 w-12 h-12 md:w-20 md:h-20 mb-2 md:mb-4 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center justify-center transition-all duration-300 overflow-hidden p-2 shadow-inner">
                              {winner.winner_image_url ? (
                                <img src={winner.winner_image_url} alt="" className="w-full h-full object-cover rounded-md" loading="lazy" decoding="async" />
                              ) : (
                                <Crown className={`w-6 h-6 md:w-10 md:h-10 ${award.iconColor} transition-colors group-hover:scale-110 duration-300`} />
                              )}
                            </div>

                            {/* Winner Name */}
                            <h3 className="relative z-10 text-white font-pixel text-[9px] md:text-xs mb-1 md:mb-2 text-center w-full px-2 truncate uppercase tracking-widest drop-shadow-md">
                              {winner.winner_name}
                            </h3>

                            {/* OTM Category */}
                            <p className={`relative z-10 ${award.textColor} font-pixel text-[7px] md:text-[8px] tracking-[0.1em] md:tracking-[0.15em] uppercase`}>{award.label}</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
              {remainingWinnersCount > 0 && (
                <div className="mt-8 md:mt-12 flex justify-center w-full">
                  <div className="bg-zinc-900 rounded-full px-6 md:px-8 py-3 md:py-4 shadow-lg flex items-center justify-center gap-2.5 md:gap-3 border border-white/10">
                    <img src="/badges/top/76245-medalla (2).gif" alt="" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                    <p className="text-zinc-300 font-pixel text-[10px] md:text-xs uppercase tracking-[0.2em]">
                      And {remainingWinnersCount} more winners on our site!
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500 font-pixel text-xs uppercase tracking-widest">
              No OTM Winners recorded yet.
            </div>
          )}
        </section>

          </div>
        </div>
      </div>
      
      {/* Footer-like CTA */}
      <div className="relative bg-[#050805] w-full py-20 md:py-32 px-8 border-t border-white/5 flex flex-col items-center justify-center text-center mt-auto overflow-hidden">
        {/* Background image */}
        <img
          src={directoryHero}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none z-0"
          loading="lazy"
          decoding="async"
        />
        {/* Dark overlay to ensure contrast */}
        <div className="absolute inset-0 bg-[#050805]/60 z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111811] via-transparent to-transparent dark:from-black z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto w-full">
          <h2 className="text-base md:text-3xl font-pixel text-white mb-2 md:mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">So what are you waiting for?</h2>
          <p className="text-white/80 font-headline text-[10px] md:text-sm max-w-xl mx-auto mb-6 md:mb-8 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            Join our fast-growing Discord server community where you can talk to server owners, meet other creators, find and discover servers that are trending right now.
          </p>
          <a
            href="https://discord.gg/vcwrEznJhG"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 md:gap-3 bg-[#4EC44E] text-[#002202] px-4 md:px-8 py-2 md:py-4 rounded-md font-headline font-bold text-xs md:text-base hover:bg-[#85fc7e] hover:shadow-2xl hover:shadow-green-500/20 active:scale-95 transition-all"
          >
            Join us Today!
            <span className="material-symbols-outlined text-xs md:text-sm font-bold">arrow_forward</span>
          </a>
        </div>
      </div>
    </AnimatedPage>
  )
}

