import { useSearchParams } from 'react-router-dom'
import { useProjects } from '../hooks/queries'
import { useEffect, useState, useMemo } from 'react'
import { ProjectCard } from '../components/ProjectCard'
import { LoadingSpinner, EmptyState } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Globe, Package, PackageOpen, Braces, Glasses, Hammer, PlusCircle, Paintbrush, Activity, Layers, Plug } from 'lucide-react'
import { useIsMobile } from '../hooks/useMediaQuery'
import projectsHero from '../assets/hero/directoryprojets.jpg'
import { MetaTags } from '../components/MetaTags'

// Asset imports
import javaIcon from '../assets/category/10421-grass.png'
import bedrockIcon from '../assets/category/437888-bedrock.png'
import errorImage from '../assets/error/teto-but-re.webp'

const projectTypes = [
  { id: 'java', label: 'Java', icon: javaIcon },
  { id: 'bedrock', label: 'Bedrock', icon: bedrockIcon },
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

const getCategoryIcon = (c: string) => {
  const lower = (c || '').toLowerCase();
  const Icon = lower.includes('modpacks') ? PackageOpen :
               lower.includes('mods') ? Package :
               lower.includes('datapacks') ? Braces :
               lower.includes('shaders') ? Glasses :
               lower.includes('plugins') ? Plug :
               lower.includes('resource') ? Paintbrush :
               lower.includes('builds') ? Hammer :
               lower.includes('behavior') ? Activity :
               lower.includes('add-ons') ? PlusCircle :
               Layers;
  return <Icon className="w-3.5 h-3.5" />
}

export function ProjectsPage() {
  const isMobile = useIsMobile()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeType = searchParams.get('type')
  const activeCategory = searchParams.get('category')
  const initialSearch = searchParams.get('q') || ''
  const isLatest = searchParams.get('sort') === 'latest'

  const PAGE_SIZE = 24
  const [page, setPage] = useState(1)
  const [localSearch, setLocalSearch] = useState(initialSearch)

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [activeType, activeCategory, initialSearch])

  // Sync local search when URL changes (e.g. back button)
  useEffect(() => {
    setLocalSearch(initialSearch)
  }, [initialSearch])

  // Debounced search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== initialSearch) {
        if (localSearch) searchParams.set('q', localSearch)
        else searchParams.delete('q')
        setSearchParams(searchParams)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [localSearch, initialSearch, searchParams, setSearchParams])

  const { data: projects = [], isLoading: loading, isFetching } = useProjects({
    type: activeType || undefined,
    category: activeCategory,
    searchQuery: initialSearch,
    sortBy: isLatest ? 'latest' : 'downloads',
    limit: 1000
  })

  const paginatedProjects = useMemo(() => {
    return projects.slice(0, PAGE_SIZE * page)
  }, [projects, page])

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

  const pageTitle = activeCategory 
    ? `Best ${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} ${activeType === 'bedrock' ? 'Bedrock' : 'Java'} Projects` 
    : activeType 
      ? `Browse ${activeType.charAt(0).toUpperCase() + activeType.slice(1)} Projects` 
      : 'Browse Community Projects';

  const pageDescription = activeCategory 
    ? `Discover the best ${activeCategory} Minecraft projects. Download and explore community-made content on Realm Explorer.` 
    : `Explore our directory of the best Minecraft ${activeType || 'community'} projects. Find mods, add-ons, builds, and more.`;

  return (
    <AnimatedPage>
      <MetaTags 
        title={pageTitle}
        description={pageDescription}
        url={`/projects${window.location.search}`}
      />
      <header className="relative pt-32 pb-16 md:pb-20 px-8 overflow-hidden min-h-[40vh] md:min-h-[50vh] flex flex-col items-center justify-center bg-zinc-950">
        {/* Hero Background — static img with CSS fade for fast LCP */}
        <img 
          src={projectsHero} 
          alt="Projects Background" 
          className="absolute inset-0 w-full h-full object-cover z-0 block opacity-50"
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          width={1920}
          height={1080}
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
            className={`flex gap-1.5 md:gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'}`}
          >
            <button
              onClick={() => setType(null)}
              className={`relative px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-headline font-bold flex items-center gap-1.5 md:gap-2 transition-colors ${!activeType ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {!activeType && (
                <motion.div 
                  layoutId="project-type"
                  className="absolute inset-0 bg-blue-400/10 border border-blue-400/20 rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Globe className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="relative">All</span>
            </button>

            {projectTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setType(type.id)}
                className={`relative px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-headline font-bold flex items-center gap-1.5 md:gap-2 transition-colors ${activeType === type.id ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {activeType === type.id && (
                  <motion.div 
                    layoutId="project-type"
                    className="absolute inset-0 bg-blue-400/10 border border-blue-400/20 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <img src={type.icon as string} alt={type.label} width={16} height={16} fetchPriority="high" loading="eager" className="w-3.5 h-3.5 md:w-4 md:h-4 object-contain rounded-sm relative z-10" />
                <span className="relative">{type.label}</span>
              </button>
            ))}
          </motion.div>
        </div>
        
        {/* Cinematic Fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-20 pointer-events-none"></div>
      </header>

      <div className={`w-full max-w-7xl mx-auto px-8 py-8 md:py-12 flex-grow ${isMobile ? 'pb-32' : ''}`}>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full space-y-6 md:space-y-8 mb-10 md:mb-12"
        >
          {/* Search Row */}
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

          {/* Category Chips */}
          <div className="w-full flex flex-wrap gap-1.5 md:gap-2">
            <button
              onClick={() => setType(null)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-headline font-bold transition-all border ${!activeType && !activeCategory ? 'bg-blue-500 text-white border-blue-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
            >
              All Types
            </button>
            <button
              onClick={() => {
                if (isLatest) searchParams.delete('sort')
                else searchParams.set('sort', 'latest')
                setSearchParams(searchParams)
              }}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-headline font-bold transition-all border ${isLatest ? 'bg-blue-500 text-white border-blue-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
            >
              Latest
            </button>
            {projectTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setType(type.id)}
                className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-headline font-bold transition-all border ${activeType === type.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
              >
                <img src={type.icon as string} alt={type.label} width={16} height={16} fetchPriority="high" loading="eager" className="w-3.5 h-3.5 md:w-4 md:h-4 object-contain" />
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

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="spinner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-[280px] rounded-xl bg-white/5 animate-pulse border border-white/5" />
                ))}
              </div>
            </motion.div>
          ) : projects.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full py-12 md:py-20 flex flex-col items-center"
            >
              <EmptyState 
                title="No projects found" 
                message="Try adjusting your filters or search terms to find what you're looking for." 
                icon={<img src={errorImage} alt="No Results" className="w-20 h-20 md:w-24 md:h-24 object-contain" />}
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
                  transition: {
                    staggerChildren: 0.03
                  }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
            >
              {paginatedProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <ProjectCard project={project} priority={index < 8} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && paginatedProjects.length < projects.length && (
          <FramerIn delay={0.4} className="mt-6 md:mt-8 flex justify-center pb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPage(p => p + 1)}
              disabled={isFetching}
              className="bg-blue-500 hover:bg-blue-400 text-white px-6 md:px-8 py-3 md:py-3.5 rounded-lg font-headline font-bold transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] border-b-[4px] border-blue-700 active:border-b-0 active:border-t-[4px] active:border-t-transparent text-[12px] md:text-sm flex items-center gap-2.5 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetching ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="animate-pulse">Loading...</span>
                </>
              ) : (
                <>
                  Load More Projects
                </>
              )}
            </motion.button>
          </FramerIn>
        )}
      </div>
    </AnimatedPage>
  )
}
