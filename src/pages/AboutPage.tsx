import { Users, Code, Globe, Swords, Cloud, Box, ShieldAlert, Cpu, MessageSquare, Zap, Megaphone, Monitor, Heart, Crown, Plus } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn, FramerInList } from '../components/FramerIn'
import { motion } from 'framer-motion'
import { useIsMobile } from '../hooks/useMediaQuery'
import aboutHero from '../assets/aboutRE.png'
import minecraftGif from '../assets/category/gif/6128-minecraft.gif'
import ironPickaxe from '../assets/category/708066-iron-pickaxe (1).png'

export function AboutPage() {
  const isMobile = useIsMobile()
  return (
    <AnimatedPage>
      {/* Cinematic Hero */}
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
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-24 space-y-16 md:space-y-32">
        
        {/* What We Offer */}
        <section>
          <FramerIn className="flex items-center gap-2 md:gap-3 mb-8 md:mb-12">
            <img src={minecraftGif} alt="" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
            <h2 className="text-xl md:text-3xl font-pixel text-white uppercase tracking-wider">What We Offer</h2>
          </FramerIn>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 md:p-8 rounded-xl col-span-1 lg:col-span-1 flex flex-col justify-center">
              <p className="text-zinc-400 font-headline leading-relaxed text-[13px] md:text-base">
                A Realm where you can view other Networks and join servers on console with categories from the following:
              </p>
            </div>
            <FramerInList className="col-span-1 lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: 'Factions', icon: Swords },
                { name: 'KitPvP', icon: Swords },
                { name: 'Skyblock', icon: Cloud },
                { name: 'SMPs', icon: Users },
                { name: 'Modded', icon: Box },
                { name: 'And More!', icon: Globe },
              ].map((item, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex items-center gap-3 group hover:border-realm-green transition-colors font-headline">
                  <item.icon className="w-5 h-5 text-realm-green" />
                  <span className="text-white text-sm font-bold">{item.name}</span>
                </div>
              ))}
            </FramerInList>
          </div>
        </section>

        {/* Additional Services */}
        <section>
          <FramerIn className="flex items-center gap-2 md:gap-3 mb-8 md:mb-12">
            <img src={ironPickaxe} alt="" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
            <h2 className="text-xl md:text-3xl font-pixel text-white uppercase tracking-wider">Additional Services</h2>
          </FramerIn>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: 'Anti-Cheats', icon: ShieldAlert, desc: 'Robust protection systems for your realm.' },
              { title: 'Scripts', icon: Code, desc: 'Custom behavior packs and automation.' },
              { title: 'Development', icon: Cpu, desc: 'Technical services to scale your network.' },
              { title: 'Discord Bots', icon: MessageSquare, desc: 'Automated moderation and integration.' },
            ].map((s, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 rounded-xl hover:bg-zinc-800/50 transition-colors">
                <s.icon className="w-8 h-8 md:w-10 md:h-10 text-realm-green mb-3 md:mb-4" />
                <h3 className="text-white font-pixel text-base md:text-lg mb-1 md:mb-2">{s.title}</h3>
                <p className="text-zinc-500 text-xs md:text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Goals */}
        <section className="bg-zinc-900/30 border border-zinc-800 p-8 md:p-12 rounded-2xl">
          <FramerIn className="flex items-center gap-2 md:gap-3 mb-10 md:mb-12 justify-center">
            <Plus className="w-6 h-6 md:w-8 md:h-8 text-[#85fc7e]" />
            <h2 className="text-xl md:text-3xl font-pixel text-white uppercase tracking-wider">Key Goals</h2>
          </FramerIn>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { text: 'A safe environment unifying Minecraft Realms & Servers', icon: Heart },
              { text: 'A solution to every problem within Realm Development', icon: Zap },
              { text: 'A place to advertise and look for Realms / Servers', icon: Megaphone },
              { text: 'A place to safely view Realms / Servers inside a Minecraft Realm with custom menu\'s and a nice interface', icon: Monitor },
              { text: 'A place to find new friends and experience great things', icon: Users },
            ].map((goal, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 bg-realm-green/10 rounded-full flex items-center justify-center text-realm-green group-hover:bg-realm-green group-hover:text-white transition-colors">
                  <goal.icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <p className="text-zinc-400 font-headline text-[13px] md:text-base leading-relaxed group-hover:text-white transition-colors">
                  {goal.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Hall of Fame Awards */}
        <section>
          <FramerIn className="flex flex-col items-center text-center gap-2 md:gap-3 mb-10 md:mb-16">
            <div className="flex items-center gap-3 text-realm-green mb-1 md:mb-2">
              <Crown className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h2 className="text-xl md:text-4xl font-pixel text-white uppercase tracking-wider">The Hall of Fame</h2>
            <p className="text-zinc-500 font-headline text-xs md:text-base max-w-xl">We offer a way to be known to many with our yearly community awards.</p>
          </FramerIn>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            {[
              { type: 'Realm', color: 'border-realm-green' },
              { type: 'Server', color: 'border-blue-500' },
              { type: 'Builder', color: 'border-amber-500' },
              { type: 'Developer', color: 'border-purple-500' },
            ].map((award, i) => (
              <div key={i} className="group cursor-default">
                <div className="relative w-full aspect-[4/5] bg-[#313233] border-4 border-[#101010] shadow-[5px_5px_0_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-1">
                  {/* Inner Highlight Border */}
                  <div className="absolute inset-0 border-t-2 border-l-2 border-white/10 pointer-events-none" />
                  <div className="absolute inset-0 border-b-2 border-r-2 border-black/40 pointer-events-none" />
                  
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center">
                    <div className={`w-20 h-20 md:w-24 md:h-24 mb-6 border-4 bg-black/40 flex items-center justify-center shadow-inner ${award.color}`}>
                      <Crown className="w-10 h-10 md:w-12 md:h-12 text-white/20 group-hover:text-white transition-colors group-hover:scale-110 duration-300" />
                    </div>
                    
                    <h3 className="text-white font-pixel text-xl md:text-2xl mb-2 drop-shadow-md">{award.type}</h3>
                    <div className="inline-block px-3 py-1 bg-black/40 border border-white/5">
                      <p className="text-realm-green font-pixel text-[8px] md:text-[9px] tracking-[0.2em] uppercase">Of the Year</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <FramerIn className="text-center pb-12 md:pb-20">
          <h2 className="text-xl md:text-3xl font-pixel text-white mb-6 md:mb-8">So what are you waiting for?</h2>
          <a 
            href="https://discord.com/invite/realmexplorer" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 md:gap-3 bg-[#4EC44E] text-[#002202] px-8 md:px-12 py-3.5 md:py-5 rounded-lg font-headline font-bold text-base md:text-lg hover:bg-[#85fc7e] hover:shadow-2xl hover:shadow-green-500/20 active:scale-95 transition-all"
          >
            Join us Today!
          </a>
        </FramerIn>

      </div>
    </AnimatedPage>
  )
}

