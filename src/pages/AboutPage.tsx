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

  return (
    <AnimatedPage>
      <MetaTags
        title="About Realm Explorer"
        description="Learn more about Realm Explorer, the ultimate hub for Minecraft Server and Realm discovery. Our mission is to unify the community and provide a safe space for players and creators."
        url="/about"
      />

      <header className="relative w-full h-auto md:h-[60vh] flex flex-col items-center justify-center overflow-hidden bg-zinc-950">
        <motion.img
          initial={isMobile ? { opacity: 0 } : { scale: 1.1, opacity: 0 }}
          animate={isMobile ? { opacity: 1 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          src={aboutHero}
          alt="About Hero"
          className="w-full h-full object-contain md:object-cover z-0 will-change-[opacity,transform]"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950/60 z-10"></div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-24 space-y-10 md:space-y-32">

        {/* The Ecosystem (Highlighting recent updates) */}
        <section>
          <FramerIn className="text-center mb-6 md:mb-10 max-w-2xl mx-auto">
            <h2 className="text-xl md:text-3xl font-pixel text-white uppercase tracking-wider mb-3">Welcome Explorers!</h2>
            <p className="text-zinc-400 font-headline text-xs md:text-sm leading-relaxed">
              Here at Realm Explorer, we provide a unified hub for Minecraft Servers, Realms, and custom projects. We offer a safe, comprehensive ecosystem built to empower players and creators to share, discover, and build the future of Minecraft together.
            </p>
          </FramerIn>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
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
                linkText: 'Explore Projects',
                badge: 'Beta'
              },
            ].map((feature, i) => (
              <FramerIn key={i} delay={i * 0.1} className="flex">
                <div className="relative bg-zinc-900/30 border border-white/5 p-4 md:p-6 rounded-lg flex flex-col justify-between hover:border-realm-green/30 hover:bg-zinc-900/60 transition-all duration-300 group hover:-translate-y-1 w-full shadow-lg">
                  {feature.badge && (
                    <span className="absolute top-4 right-4 px-1 py-0.5 bg-blue-500 text-[8px] font-pixel text-white leading-none rounded-sm uppercase tracking-tighter">
                      {feature.badge}
                    </span>
                  )}
                  <div>
                    <div className="w-10 h-10 flex items-center justify-center mb-4 overflow-hidden">
                      {feature.image ? (
                        <img src={feature.image} alt="" className="w-full h-full object-contain" />
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
          <FramerIn className="flex flex-col items-center justify-center gap-2 md:gap-3 mb-5 md:mb-12">
            <img src={minecraftGif} alt="" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
            <h2 className="text-xl md:text-3xl font-pixel text-white uppercase tracking-wider text-center">What We Offer</h2>
          </FramerIn>

          <div className="max-w-4xl mx-auto">
            <FramerIn className="bg-zinc-900/30 border border-white/5 p-6 md:p-10 rounded-xl relative overflow-hidden shadow-xl">
              {/* Decorative radial blur gradient */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-realm-green/5 blur-3xl pointer-events-none rounded-full" />

              <div className="relative z-10 flex flex-col gap-6 md:gap-8">
                <p className="text-zinc-400 font-headline leading-relaxed text-sm md:text-lg text-center max-w-2xl mx-auto">
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
                    { name: 'Modded', icon: moddedIcon, id: 'modded' },
                    { name: 'And More!', icon: '/badges/mc-earth-main.webp', id: '' },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      to={item.id ? `/servers?category=${item.id}` : '/servers'}
                      className="bg-zinc-950/40 border border-white/5 px-4 py-3 rounded-lg flex items-center gap-3 group hover:border-realm-green/30 hover:bg-zinc-900/40 transition-all duration-300 font-headline"
                    >
                      <div className="w-8 h-8 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={item.icon} alt={item.name} className="w-6 h-6 md:w-7 md:h-7 object-contain group-hover:scale-110 transition-transform duration-300" />
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
        <section className="bg-zinc-900/20 border border-white/5 p-8 md:p-12 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-realm-green/5 blur-3xl pointer-events-none rounded-full" />

          <FramerIn className="flex flex-col items-center justify-center gap-2 md:gap-3 mb-6 md:mb-12">
            <Plus className="w-6 h-6 md:w-8 md:h-8 text-[#85fc7e]" />
            <h2 className="text-xl md:text-3xl font-pixel text-white uppercase tracking-wider text-center">Key Goals</h2>
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
                <div className="shrink-0 w-10 h-10 flex items-center justify-center overflow-hidden">
                  <img src={goal.image} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="flex-1">
                  <p className="text-zinc-400 font-headline text-[13px] md:text-base leading-relaxed group-hover:text-white transition-colors pt-1">
                    {goal.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent OTM Winners */}
        <section>
          <FramerIn className="flex flex-col items-center text-center gap-2 md:gap-3 mb-6 md:mb-16">
            <div className="flex items-center gap-3 mb-1 md:mb-2">
              <img src={otmMedal} alt="Medal" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
            </div>
            <h2 className="text-xl md:text-4xl font-pixel text-white uppercase tracking-wider text-center">Recent OTM Winners</h2>
            <p className="text-zinc-500 font-headline text-xs md:text-base max-w-xl">We highlight our outstanding creators, networks, and members crowned monthly.</p>
          </FramerIn>

          {loadingWinners ? (
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-6xl mx-auto">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[calc(50%-8px)] sm:w-[calc(33.33%-11px)] lg:w-[calc(25%-24px)] max-w-[280px] aspect-[4/5] bg-zinc-900/20 border border-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : months.length > 0 ? (
            <div className="space-y-16 max-w-6xl mx-auto">
              {months.map((month) => (
                <div key={month} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="font-pixel text-realm-green text-sm md:text-lg uppercase tracking-wider whitespace-nowrap">
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
                        realm: { label: 'Realm OTM', shadow: 'hover:shadow-purple-500/20 hover:border-purple-500/50', iconColor: 'text-purple-400', textColor: 'text-purple-400', defaultLink: '/rotm' },
                        server: { label: 'Server OTM', shadow: 'hover:shadow-realm-green/20 hover:border-realm-green/50', iconColor: 'text-realm-green', textColor: 'text-realm-green', defaultLink: '/sotm' },
                        builder: { label: 'Builder OTM', shadow: 'hover:shadow-orange-500/20 hover:border-orange-500/50', iconColor: 'text-orange-400', textColor: 'text-orange-400', defaultLink: '/botm' },
                        developer: { label: 'Developer OTM', shadow: 'hover:shadow-blue-500/20 hover:border-blue-500/50', iconColor: 'text-blue-400', textColor: 'text-blue-400', defaultLink: '/dotm' },
                      }[winner.category as 'realm'|'server'|'builder'|'developer'] || { label: winner.category, shadow: '', iconColor: 'text-white', textColor: 'text-white', defaultLink: '/' }

                      const link = winner.category === 'realm' || winner.category === 'server'
                        ? `/server/${winner.winner_slug || winner.servers?.slug}`
                        : `/profile/${winner.profiles?.discord_username || winner.winner_slug}`

                      return (
                        <Link to={link} key={winner.id} className="group flex flex-col w-[calc(50%-8px)] sm:w-[calc(33.33%-11px)] lg:w-[calc(25%-24px)] max-w-[280px]">
                          <div className={`relative w-full aspect-[4/5] bg-zinc-900/40 border border-white/5 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:bg-zinc-900/70 shadow-lg ${award.shadow} overflow-hidden flex flex-col justify-between p-3 md:p-6`}>
                            {/* Winner Banner if available */}
                            {winner.winner_banner_url && (
                              <div className="absolute inset-0 z-0 opacity-15 group-hover:opacity-25 transition-opacity duration-300">
                                <img src={winner.winner_banner_url} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-zinc-950/20 z-0 pointer-events-none" />

                            <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto w-full">
                              {/* Image / Avatar / Icon */}
                              <div className="w-12 h-12 md:w-20 md:h-20 mb-2 md:mb-4 rounded-md bg-black/40 flex items-center justify-center shadow-inner border border-white/5 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                                {winner.winner_image_url ? (
                                  <img src={winner.winner_image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Crown className={`w-6 h-6 md:w-10 md:h-10 ${award.iconColor} transition-colors group-hover:scale-110 duration-300`} />
                                )}
                              </div>

                              {/* Winner Name or Title */}
                              <h3 className="text-white font-pixel text-xs md:text-sm mb-1 truncate w-full drop-shadow-md uppercase tracking-wide">
                                {winner.winner_name}
                              </h3>

                              {winner.description && (
                                <p className="text-zinc-500 font-headline text-[8px] md:text-xs line-clamp-2 max-w-xs mb-2 md:mb-3">
                                  {winner.description}
                                </p>
                              )}
                            </div>

                            {/* Bottom Badge */}
                            <div className="relative z-10 flex flex-col items-center gap-1.5 mt-auto w-full">
                              <div className="inline-block px-2 py-0.5 md:px-3 md:py-1 bg-black/40 border border-white/5 rounded-sm">
                                <p className={`${award.textColor} font-pixel text-[6px] md:text-[9px] tracking-[0.1em] md:tracking-[0.2em] uppercase`}>{award.label}</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500 font-pixel text-xs uppercase tracking-widest">
              No OTM Winners recorded yet.
            </div>
          )}
        </section>

        {/* CTA */}
        <FramerIn className="text-center pb-12 md:pb-20">
          <div className="relative bg-zinc-950 border border-white/5 p-8 md:p-14 rounded-xl max-w-4xl mx-auto overflow-hidden shadow-2xl">
            {/* Background image */}
            <img
              src={directoryHero}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none z-0"
            />
            {/* Dark overlay to ensure contrast */}
            <div className="absolute inset-0 bg-zinc-950/40 z-0 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/30 z-0 pointer-events-none" />

            {/* Decorative radial blur gradient */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-realm-green/10 blur-3xl pointer-events-none rounded-full z-0" />

            <div className="relative z-10">
              <h2 className="text-xl md:text-3xl font-pixel text-white mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">So what are you waiting for?</h2>
              <p className="text-zinc-200 font-headline text-xs md:text-sm max-w-xl mx-auto mb-8 font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                Join our fast-growing Discord server community where you can talk to server owners, meet other creators, find and discover servers that are trending right now.
              </p>
              <a
                href="https://discord.com/invite/realmexplorer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 md:gap-3 bg-[#4EC44E] text-[#002202] px-6 md:px-8 py-3 md:py-4 rounded-md font-headline font-bold text-sm md:text-base hover:bg-[#85fc7e] hover:shadow-2xl hover:shadow-green-500/20 active:scale-95 transition-all"
              >
                Join us Today!
                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
              </a>
            </div>
          </div>
        </FramerIn>

      </div>
    </AnimatedPage>
  )
}

