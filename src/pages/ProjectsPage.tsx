import { useSearchParams, Link } from 'react-router-dom'
import { useServers } from '../hooks/queries'
import { useState, useMemo } from 'react'
import type { Server } from '../types'
import { ProjectCard } from '../components/ProjectCard'
import { LoadingSpinner, EmptyState } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Globe, Wrench, Package, Database, Sparkles, Puzzle, Hammer, PlusCircle, Paintbrush, Activity, Layers } from 'lucide-react'
import { useIsMobile } from '../hooks/useMediaQuery'
import projectsHero from '../assets/hero/directoryprojets.jpg'
import { MetaTags } from '../components/MetaTags'

// Asset imports
import golemGif from '../assets/pjdirectory/20756-irongolem (1).gif'
import craftingGif from '../assets/pjdirectory/craftingcrafting.gif'
import javaIcon from '../assets/category/10421-grass.png'
import bedrockIcon from '../assets/category/437888-bedrock.png'

export function ProjectsPage() {
  const isMobile = useIsMobile()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeType = searchParams.get('type')
  const activeCategory = searchParams.get('category')
  const initialSearch = searchParams.get('q') || ''

  const PAGE_SIZE = 24
  const [localSearch, setLocalSearch] = useState(initialSearch)

  const { isLoading: loading } = useServers({
    searchQuery: initialSearch,
    limit: 1000
  })

  const filteredProjects = useMemo<Server[]>(() => {
    // Return empty array for now as projects are "Coming Soon"
    return []
  }, [])

  const paginatedProjects = useMemo(() => {
    return filteredProjects.slice(0, PAGE_SIZE)
  }, [filteredProjects, PAGE_SIZE])

  const projectTypes = [
    { id: 'java', label: 'Java' },
    { id: 'bedrock', label: 'Bedrock' },
  ]

  const projectCategories: Record<string, { id: string, label: string }[]> = {
    java: [
      { id: 'mods', label: 'Mods' },
      { id: 'modpacks', label: 'Modpacks' },
      { id: 'datapacks', label: 'Datapacks' },
      { id: 'shaders', label: 'Shaders' },
      { id: 'plugins', label: 'Plugins' },
      { id: 'builds', label: 'Builds' },
    ],
    bedrock: [
      { id: 'addons', label: 'Add-ons' },
      { id: 'resource_pack', label: 'Resource Pack' },
      { id: 'behavior_pack', label: 'Behavior Pack' },
      { id: 'builds', label: 'Builds' },
    ]
  }

  const setType = (type: string | null) => {
    if (type === activeType) {
      searchParams.delete('type')
    } else if (type) {
      searchParams.set('type', type)
    } else {
      searchParams.delete('type')
    }
    // Reset category when type changes
    searchParams.delete('category')
    setSearchParams(searchParams)
  }

  const setCategory = (cat: string | null) => {
    if (cat === activeCategory) {
      searchParams.delete('category')
    } else if (cat) {
      searchParams.set('category', cat)
    } else {
      searchParams.delete('category')
    }
    setSearchParams(searchParams)
  }

  const getCategoryIcon = (c: string) => {
    const Icon = c === 'Mods' ? Wrench :
                 c === 'Modpacks' ? Package :
                 c === 'Datapacks' ? Database :
                 c === 'Shaders' ? Sparkles :
                 c === 'Plugins' ? Puzzle :
                 c === 'Builds' ? Hammer :
                 c === 'Add-ons' ? PlusCircle :
                 c === 'Resource Pack' ? Paintbrush :
                 c === 'Behavior Pack' ? Activity :
                 Layers;
    return <Icon className="w-3.5 h-3.5" />
  }

  return (
    <AnimatedPage>
      <MetaTags 
        title="Browse Community Projects"
        description="Discover the best Minecraft Add-ons and builds created by our community."
        url={`/projects${window.location.search}`}
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
              Project Explorer
            </h1>
            <p className="text-white/80 font-headline text-sm md:text-lg max-w-2xl mx-auto mb-8 md:mb-10 drop-shadow-lg leading-relaxed px-4">
              Discover the top-rated community projects, Add-ons, and builds.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`flex flex-wrap justify-center gap-1.5 md:gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'}`}
          >
            <button
              onClick={() => setType(null)}
              className={`relative px-4 py-2 rounded-xl text-xs md:text-sm font-headline font-bold flex items-center gap-2 transition-colors ${!activeType ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {!activeType && (
                <motion.div 
                  layoutId="hero-cat"
                  className="absolute inset-0 bg-blue-400/10 border border-blue-400/20 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Globe className="w-4 h-4" />
              <span className="relative">All</span>
            </button>

            <button
              onClick={() => setType('java')}
              className={`relative px-4 py-2 rounded-xl text-xs md:text-sm font-headline font-bold flex items-center gap-2 transition-colors ${activeType === 'java' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {activeType === 'java' && (
                <motion.div 
                  layoutId="hero-cat"
                  className="absolute inset-0 bg-blue-400/10 border border-blue-400/20 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <img src={javaIcon} alt="Java" className="w-4 h-4 object-contain relative z-10" />
              <span className="relative">Java</span>
            </button>

            <button
              onClick={() => setType('bedrock')}
              className={`relative px-4 py-2 rounded-xl text-xs md:text-sm font-headline font-bold flex items-center gap-2 transition-colors ${activeType === 'bedrock' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {activeType === 'bedrock' && (
                <motion.div 
                  layoutId="hero-cat"
                  className="absolute inset-0 bg-blue-400/10 border border-blue-400/20 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <img src={bedrockIcon} alt="Bedrock" className="w-4 h-4 object-contain relative z-10" />
              <span className="relative">Bedrock</span>
            </button>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-20 pointer-events-none"></div>
      </header>

      <div className={`w-full max-w-7xl mx-auto px-8 py-8 md:py-12 flex-grow ${isMobile ? 'pb-32' : ''}`}>
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full space-y-6 md:space-y-8 mb-10 md:mb-12"
        >
          <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-10 py-2.5 md:py-3 text-[13px] md:text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-400 transition-all font-headline focus:ring-1 focus:ring-blue-400/50 shadow-xl"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
              {localSearch && (
                <button 
                  onClick={() => setLocalSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="w-full flex flex-wrap gap-1.5 md:gap-2">
            <button
              onClick={() => setType(null)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-headline font-bold transition-all border ${!activeType ? 'bg-blue-500 text-white border-blue-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
            >
              All Types
            </button>
            {projectTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setType(type.id)}
                className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-headline font-bold transition-all border ${activeType === type.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
              >
                <img src={type.id === 'java' ? javaIcon : bedrockIcon} alt={type.label} className="w-3.5 h-3.5 object-contain" />
                {type.label}
              </button>
            ))}

            {activeType && projectCategories[activeType] && (
              <>
                <div className="h-6 w-px bg-zinc-800 mx-1 self-center" />
                {projectCategories[activeType].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-headline font-bold transition-all border ${activeCategory === cat.id ? 'bg-zinc-100 text-zinc-900 border-zinc-100' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                  >
                    {getCategoryIcon(cat.label)}
                    {cat.label}
                  </button>
                ))}
              </>
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div 
              key="spinner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full py-12 md:py-20 flex justify-center"
            >
              <LoadingSpinner />
            </motion.div>
          ) : filteredProjects.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full py-12 md:py-20 flex flex-col items-center"
            >
              <EmptyState 
                title="Pre-Upload is now Live!" 
                message="You can now pre-upload your projects before the official release. Get ready for the Project Explorer update!" 
                icon={<img src={craftingGif} alt="Crafting" className="w-full h-full object-cover rounded-xl" />}
                action={
                  <div className="flex flex-col items-center gap-4 mt-2">
                    <Link 
                      to="/dashboard?action=upload_project"
                      className="bg-blue-500 hover:bg-blue-400 text-white px-6 md:px-8 py-3 md:py-3.5 rounded-lg font-headline font-bold transition-colors flex items-center justify-center gap-2.5 group shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] border-b-[4px] border-blue-700 active:border-b-0 active:border-t-[4px] active:border-t-transparent text-[12px] md:text-sm"
                    >
                      Upload a Project
                    </Link>
                    <Link 
                      to="/pj"
                      className="flex items-center gap-2 text-zinc-500 hover:text-blue-400 transition-all font-headline font-bold text-sm group underline decoration-zinc-800 underline-offset-4 hover:decoration-blue-400/50"
                    >
                      <span>why are we doing this?</span>
                      <img src={golemGif} alt="Iron Golem" className="w-6 h-6 object-contain group-hover:scale-110 transition-transform" />
                    </Link>
                  </div>
                }
              />
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.03 }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
            >
              {paginatedProjects.map(project => (
                <motion.div
                  key={project.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedPage>
  )
}
