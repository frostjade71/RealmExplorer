import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion } from 'framer-motion'
import { useTeamMembers, useUserProfile, useAdminUsers } from '../hooks/queries'
import { TeamMemberCard } from '../components/TeamMemberCard'
import { LoadingSpinner } from '../components/FeedbackStates'
import heroVideo from '../assets/hero/heroRE.mp4'
import steveIcon from '../assets/about/87389-steve.png'
import ownerIcon from '../assets/about/16739-owner-gradient.png'

export function TeamPage() {
  const { data: teamMembers = [], isLoading } = useTeamMembers()
  const { data: visionProfile } = useUserProfile('ad2be47b-b12e-4fc5-ab5a-e8af75c76d36')
  const { data: devProfile } = useUserProfile('4642ada9-a0be-4ad6-bd7a-b5990ad952b2')
  const { data: allUsers = [] } = useAdminUsers()

  if (isLoading) return <LoadingSpinner />

  return (
    <AnimatedPage>
      {/* Hero Section */}
      <header className="pt-32 pb-20 px-8 relative overflow-hidden min-h-[50vh] flex flex-col items-center justify-center">
        {/* Cinematic Background */}
        <motion.video 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroVideo} 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 block"
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-zinc-950 z-10"></div>
        
        <div className="max-w-7xl mx-auto relative z-20 flex flex-col items-center text-center">
          <FramerIn delay={0.2}>
            <div className="inline-flex items-center gap-1.5 bg-zinc-800/90 border-t-2 border-l-2 border-white/20 border-r-2 border-b-2 border-black/50 px-2.5 py-0.5 mb-8 text-[#85fc7e] shadow-[2px_2px_0px_rgba(0,0,0,0.4)] backdrop-blur-md">
              <img src={steveIcon} alt="Steve Icon" className="w-4 h-4 object-contain" />
              <span className="font-pixel text-[8px] tracking-widest uppercase">The People Behind</span>
            </div>
          </FramerIn>
          
          <FramerIn delay={0.4}>
            <h1 className="font-pixel text-white text-4xl md:text-6xl leading-tight mb-6 drop-shadow-2xl">
              Our <span className="text-[#4EC44E]">Team</span>
            </h1>
          </FramerIn>
          
        </div>
      </header>

      {/* Meet the Executives & Owners */}
      <section className="py-24 px-8 bg-zinc-950 relative">
        <div className="max-w-7xl mx-auto">
          <FramerIn className="text-center mb-20 flex flex-col items-center">
            <h2 className="font-pixel text-white text-3xl mb-6 uppercase tracking-widest">
              Meet the <span className="text-realm-green">Executives</span> & Owners
            </h2>
            <div className="h-1.5 w-24 bg-realm-green mx-auto mb-8 rounded-full shadow-[0_0_10px_rgba(133,252,126,0.5)]"></div>
            <p className="text-zinc-400 font-headline max-w-2xl mx-auto leading-relaxed italic">
              Meet the dedicated team behind Realm Explorer. Our executives and owners are the main backbone of this platform.
            </p>
          </FramerIn>

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {teamMembers.map((member, i) => (
              <FramerIn key={member.id} delay={i * 0.1}>
                <div className="w-[160px] md:w-[180px]">
                  <TeamMemberCard member={member} />
                </div>
              </FramerIn>
            ))}
          </div>

          <FramerIn className="flex justify-center mb-10">
            <img src={ownerIcon} alt="Owner Icon" className="w-10 h-10 object-contain" />
          </FramerIn>

          {teamMembers.length === 0 && (
            <FramerIn className="text-center py-20 bg-zinc-900/30 border border-dashed border-white/5 rounded-3xl">
              <p className="text-zinc-600 font-headline italic">The team list is currently being curated.</p>
            </FramerIn>
          )}
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-realm-green/5 blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-emerald-500/5 blur-[120px] -z-10 pointer-events-none" />
      </section>

      {/* Vision Statement Section */}
      <section className="py-10 md:py-16 px-8 bg-black relative border-t-4 border-[#101010]">
        <div className="absolute inset-0 opacity-5 pixel-grid pointer-events-none"></div>
        
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <FramerIn className="mb-6 md:mb-8">
            <h2 className="font-pixel text-white text-lg md:text-xl mb-3 uppercase tracking-[0.2em]">
              Vision <span className="text-realm-green">Statement</span>
            </h2>
            <div className="h-1 w-12 md:w-16 bg-realm-green mx-auto rounded-full"></div>
          </FramerIn>

          <FramerIn delay={0.2} className="relative mb-6 md:mb-8">
            <span className="text-3xl md:text-4xl font-pixel text-white/10 absolute -top-8 -left-4 select-none">"</span>
            <p className="font-headline text-sm md:text-lg text-zinc-300 leading-relaxed italic relative z-10 px-2">
              As the owner of Realm Explorer i stand to provide a safe space for all and helping assist new servers/realms to grow!
            </p>
            <span className="text-4xl font-pixel text-white/10 absolute -bottom-12 -right-4 select-none leading-none">"</span>
          </FramerIn>

          <FramerIn delay={0.4} className="flex flex-col items-center">
            <div className={`relative w-12 h-12 md:w-14 md:h-14 mb-3 border-4 border-realm-green bg-black/40 shadow-inner group transition-transform ${visionProfile ? '' : 'animate-pulse'}`}>
              <div className="absolute inset-0 border-t-2 border-l-2 border-white/20 pointer-events-none" />
              <div className="absolute inset-0 border-b-2 border-r-2 border-black/60 pointer-events-none" />
              
              {visionProfile?.discord_avatar && (
                <img 
                  src={visionProfile.discord_avatar} 
                  alt={visionProfile.discord_username || ''} 
                  className="w-full h-full object-cover p-1"
                />
              )}
            </div>
            
            <div className="text-center">
              <div className="font-pixel text-white text-[13px] md:text-sm mb-1">
                {visionProfile?.discord_username || 'Loading...'}
              </div>
              <div className="font-pixel text-[7px] md:text-[8px] text-realm-green uppercase tracking-widest opacity-60">
                Owner
              </div>
            </div>
          </FramerIn>
        </div>
      </section>

      {/* The Developer Section */}
      <section className="py-10 md:py-16 px-8 bg-black relative border-t border-white/5">
        <div className="absolute inset-0 opacity-5 pixel-grid pointer-events-none"></div>
        
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <FramerIn className="mb-6 md:mb-8">
            <h2 className="font-pixel text-white text-lg md:text-xl mb-3 uppercase tracking-[0.2em]">
              The <span className="text-realm-green">Developer</span>
            </h2>
            <div className="h-1 w-12 md:w-16 bg-realm-green mx-auto rounded-full"></div>
          </FramerIn>

          <FramerIn delay={0.2} className="relative mb-6 md:mb-8">
            <span className="text-3xl md:text-4xl font-pixel text-white/10 absolute -top-8 -left-4 select-none">"</span>
            <p className="font-headline text-sm md:text-lg text-zinc-300 leading-relaxed italic relative z-10 px-2">
              i maeke websites :D
            </p>
            <span className="text-4xl font-pixel text-white/10 absolute -bottom-12 -right-4 select-none leading-none">"</span>
          </FramerIn>

          <FramerIn delay={0.4} className="flex flex-col items-center">
            <div className={`relative w-12 h-12 md:w-14 md:h-14 mb-3 border-4 border-realm-green bg-black/40 shadow-inner group transition-transform ${devProfile ? '' : 'animate-pulse'}`}>
              <div className="absolute inset-0 border-t-2 border-l-2 border-white/20 pointer-events-none" />
              <div className="absolute inset-0 border-b-2 border-r-2 border-black/60 pointer-events-none" />
              
              {devProfile?.discord_avatar && (
                <img 
                  src={devProfile.discord_avatar} 
                  alt={devProfile.discord_username || ''} 
                  className="w-full h-full object-cover p-1"
                />
              )}
            </div>
            
            <div className="text-center">
              <div className="font-pixel text-white text-[13px] md:text-sm mb-1">
                {devProfile?.discord_username || 'Loading...'}
              </div>
              <div className="font-pixel text-[7px] md:text-[8px] text-realm-green uppercase tracking-widest opacity-60">
                Lead Web Developer
              </div>
            </div>
          </FramerIn>
        </div>
      </section>

      {/* Beta Testers & Users Thank You */}
      <section className="py-12 bg-[#0a0a0a] border-t border-white/5 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="font-pixel text-[#85fc7e] text-xs mb-2 uppercase tracking-widest">Community Love</h3>
            <p className="font-headline text-zinc-400 text-sm max-w-sm">
              A huge thanks to our beta testers and every user who opted into the Realm Explorer Website. We will continue to improve the platform to ensure the best possible experience for all our explorers.
            </p>
          </div>

          <div className="flex items-center">
            <div className="flex -space-x-3 mr-4">
              {allUsers.slice(0, 5).map((u, i) => (
                <div 
                  key={u.id} 
                  className="w-10 h-10 rounded-full border-2 border-[#101010] overflow-hidden bg-zinc-900 group transition-transform hover:-translate-y-1 relative"
                  style={{ zIndex: 10 - i }}
                >
                  <img 
                    src={u.discord_avatar || ''} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex flex-col">
              <span className="font-pixel text-white text-sm leading-none mb-1">+{Math.max(0, allUsers.length - 5)}</span>
              <span className="font-pixel text-[#85fc7e] text-[8px] uppercase tracking-widest opacity-60">Users Joined</span>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Pixel Grid Separator */}
      <div className="h-12 bg-gradient-to-b from-[#0a0a0a] to-black relative">
        <div className="absolute inset-0 opacity-5 pixel-grid pointer-events-none"></div>
      </div>
    </AnimatedPage>
  )
}
