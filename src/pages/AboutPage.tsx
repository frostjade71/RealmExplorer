import { Users, Code, Globe, Swords, Cloud, Box, ShieldAlert, Cpu, MessageSquare, Zap, Megaphone, Monitor, Heart, Crown, Star, Diamond, Plus } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn, FramerInList } from '../components/FramerIn'
import { motion } from 'framer-motion'
import aboutHero from '../assets/aboutRE.png'

export function AboutPage() {
  return (
    <AnimatedPage>
      {/* Cinematic Hero */}
      <header className="relative h-[60vh] flex flex-col items-center justify-center overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          src={aboutHero} 
          alt="About Hero" 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950/40 z-10"></div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-24 space-y-32">
        
        {/* What We Offer */}
        <section>
          <FramerIn className="flex items-center gap-3 mb-12">
            <Star className="w-8 h-8 text-[#85fc7e]" />
            <h2 className="text-3xl font-pixel text-white uppercase tracking-wider">What We Offer</h2>
          </FramerIn>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl col-span-1 lg:col-span-1 flex flex-col justify-center">
              <p className="text-zinc-400 font-headline leading-relaxed">
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
                <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-3 group hover:border-realm-green transition-colors">
                  <item.icon className="w-5 h-5 text-realm-green" />
                  <span className="text-white font-headline text-sm font-bold">{item.name}</span>
                </div>
              ))}
            </FramerInList>
          </div>
        </section>

        {/* Additional Services */}
        <section>
          <FramerIn className="flex items-center gap-3 mb-12">
            <Diamond className="w-8 h-8 text-[#85fc7e]" />
            <h2 className="text-3xl font-pixel text-white uppercase tracking-wider">Additional Services</h2>
          </FramerIn>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Anti-Cheats', icon: ShieldAlert, desc: 'Robust protection systems for your realm.' },
              { title: 'Scripts', icon: Code, desc: 'Custom behavior packs and automation.' },
              { title: 'Development', icon: Cpu, desc: 'Technical services to scale your network.' },
              { title: 'Discord Bots', icon: MessageSquare, desc: 'Automated moderation and integration.' },
            ].map((s, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:bg-zinc-800/50 transition-colors">
                <s.icon className="w-10 h-10 text-realm-green mb-4" />
                <h3 className="text-white font-pixel text-lg mb-2">{s.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Goals */}
        <section className="bg-zinc-900/30 border border-zinc-800 p-12 rounded-[3rem]">
          <FramerIn className="flex items-center gap-3 mb-12 justify-center">
            <Plus className="w-8 h-8 text-[#85fc7e]" />
            <h2 className="text-3xl font-pixel text-white uppercase tracking-wider">Key Goals</h2>
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
                <div className="shrink-0 w-10 h-10 bg-realm-green/10 rounded-full flex items-center justify-center text-realm-green group-hover:bg-realm-green group-hover:text-white transition-colors">
                  <goal.icon className="w-5 h-5" />
                </div>
                <p className="text-zinc-400 font-headline text-sm md:text-base leading-relaxed group-hover:text-white transition-colors">
                  {goal.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Hall of Fame Awards */}
        <section>
          <FramerIn className="flex flex-col items-center text-center gap-3 mb-16">
            <div className="flex items-center gap-3 text-realm-green mb-2">
              <Crown className="w-10 h-10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-pixel text-white uppercase tracking-wider">The Hall of Fame</h2>
            <p className="text-zinc-500 font-headline max-w-xl">We offer a way to be known to many with our yearly community awards.</p>
          </FramerIn>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { type: 'Realm', color: 'from-realm-green' },
              { type: 'Server', color: 'from-blue-500' },
              { type: 'Builder', color: 'from-amber-500' },
              { type: 'Developer', color: 'from-purple-500' },
            ].map((award, i) => (
              <div key={i} className="relative group overflow-hidden rounded-3xl aspect-[4/5] bg-zinc-900 border border-zinc-800">
                <div className={`absolute inset-0 bg-gradient-to-t ${award.color} to-transparent opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <Crown className="w-8 h-8 text-white/20 mb-4 group-hover:text-white transition-colors" />
                  <h3 className="text-white font-pixel text-2xl mb-1">{award.type}</h3>
                  <p className="text-realm-green font-headline text-[10px] tracking-widest uppercase font-bold">Of the Year</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <FramerIn className="text-center pb-20">
          <h2 className="text-3xl font-pixel text-white mb-8">So what are you waiting for?</h2>
          <a 
            href="https://discord.com/invite/realmexplorer" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-3 bg-[#4EC44E] text-[#002202] px-12 py-5 rounded-2xl font-headline font-bold text-lg hover:bg-[#85fc7e] hover:shadow-2xl hover:shadow-green-500/20 active:scale-95 transition-all"
          >
            Join us Today!
          </a>
        </FramerIn>

      </div>
    </AnimatedPage>
  )
}

