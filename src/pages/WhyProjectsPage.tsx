import { motion } from 'framer-motion'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import projectsHero from '../assets/hero/directoryprojets.jpg'
import { MetaTags } from '../components/MetaTags'
import { Download, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

// Asset imports
import otmIcon from '../assets/leaderboards/76245-medalla (1).gif'
import builderIcon from '../assets/pjdirectory/1526_PikaPickaxe.png'
import devIcon from '../assets/pjdirectory/6699-activedev-blue.png'
import titleIcon from '../assets/pjdirectory/918416-animatedcamera.gif'

export function WhyProjectsPage() {
  return (
    <AnimatedPage>
      <MetaTags 
        title="Why Project Explorer?"
        description="Learn why we are building the Project Explorer and how it benefits developers and builders."
        url="/pj"
      />
      
      <header className="relative pt-32 pb-16 md:pb-20 px-8 overflow-hidden min-h-[40vh] md:min-h-[50vh] flex flex-col items-center justify-center bg-zinc-950">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1, ease: "easeOut" }}
          src={projectsHero} 
          alt="Projects Background" 
          className="absolute inset-0 w-full h-full object-cover z-0 block"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-blue-950/90 z-10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-3xl md:text-5xl font-pixel text-white mb-4 md:mb-6 drop-shadow-2xl">
              Why Project Explorer?
            </h1>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-20 pointer-events-none"></div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-16 md:py-24">
        <FramerIn delay={0.2} className="space-y-16">
          <section className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <img src={titleIcon} alt="Talent" className="w-12 h-12 object-contain" />
              <h2 className="text-2xl md:text-3xl font-pixel text-white">A Stage for Talent</h2>
            </div>
            <p className="text-zinc-400 font-headline text-sm md:text-lg leading-relaxed max-w-3xl">
              We are building this page for developers and builders to showcase their talent and skills in the world of Minecraft. We believe that every high-quality mod, addon, and build deserves a spotlight.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-lg bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm space-y-4 text-center md:text-left flex flex-col items-center md:items-start"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <img src={devIcon} alt="Developers" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-xl font-pixel text-white">For Developers</h3>
              <p className="text-zinc-400 font-headline text-sm leading-relaxed">
                Project owners can share their scripts, plugins, and addons. Players can visit and download directly from the source, ensuring they always have the latest versions.
              </p>
              <div className="pt-4 flex items-center gap-2 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                <Download className="w-4 h-4" />
                Show your addons scripts
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-lg bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm space-y-4 text-center md:text-left flex flex-col items-center md:items-start"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <img src={builderIcon} alt="Builders" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-xl font-pixel text-white">For Builders</h3>
              <p className="text-zinc-400 font-headline text-sm leading-relaxed">
                Showcase your amazing builds and maps. Let the community explore your creations and draw inspiration from your architectural skills.
              </p>
              <div className="pt-4 flex items-center gap-2 text-orange-400 text-[10px] font-bold uppercase tracking-widest">
                <Eye className="w-4 h-4" />
                Showcase your builds
              </div>
            </motion.div>
          </div>

          <div className="flex justify-center">
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-lg bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm space-y-4 text-center md:text-left flex flex-col items-center md:items-start max-w-md w-full"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <img src={otmIcon} alt="OTM" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-xl font-pixel text-white">For OTM</h3>
              <p className="text-zinc-400 font-headline text-sm leading-relaxed">
                This page is closely related to our Developer and Builder of the Month (OTM) competitions. Projects listed here can be voted through the OTM pages to be your next Developer and Builder of the Month.
              </p>
              <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                <Link 
                  to="/dotm"
                  className="px-6 py-2 rounded-lg bg-zinc-950/50 border border-zinc-800 text-white font-headline font-bold text-[10px] hover:bg-zinc-800 transition-colors uppercase tracking-widest"
                >
                  View DOTM
                </Link>
                <Link 
                  to="/botm"
                  className="px-6 py-2 rounded-lg bg-zinc-950/50 border border-zinc-800 text-white font-headline font-bold text-[10px] hover:bg-zinc-800 transition-colors uppercase tracking-widest"
                >
                  View BOTM
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="pt-8 text-center">
            <Link 
              to="/projects"
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-headline font-bold text-sm"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to Projects
            </Link>
          </div>
        </FramerIn>
      </main>
    </AnimatedPage>
  )
}
