import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProject } from '../hooks/queries'
import { LoadingSpinner, EmptyState } from '../components/FeedbackStates'
import { Download, Heart, Clock, Calendar, CheckCircle, Share2, Wrench, Package, Database, Sparkles, Puzzle, Hammer, PlusCircle, Paintbrush, Activity, Layers, Archive, Edit3 } from 'lucide-react'
import javaIcon from '../assets/category/10421-grass.png'
import bedrockIcon from '../assets/category/437888-bedrock.png'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { RichText } from '../components/RichText'

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  
  const { data: project, isLoading, error } = useProject(slug)
  const [isLiked, setIsLiked] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'reviews'>('overview')

  // Redirect UUID to slug if needed
  useEffect(() => {
    if (project && project.slug && slug === project.id) {
       navigate(`/projects/${project.slug}`, { replace: true })
    }
  }, [project, slug, navigate])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project?.name || 'RealmExplorer Project',
          text: `Check out ${project?.name} on RealmExplorer!`,
          url: window.location.href,
        })
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href)
      setShareCopied(true)
      toast.success('Link Copied')
      setTimeout(() => setShareCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (project?.file_url) {
      window.open(project.file_url, '_blank')
    } else {
      toast.error('No download file available.')
    }
  }

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <AnimatedPage className="min-h-screen flex items-center justify-center pt-20">
        <EmptyState 
          title="Error Loading Project" 
          message={error instanceof Error ? error.message : 'An unknown error occurred.'}
        />
      </AnimatedPage>
    )
  }

  if (!project) {
    return (
      <AnimatedPage className="min-h-screen flex items-center justify-center pt-20">
        <EmptyState 
          title="Project Not Found" 
          message="The project you're looking for doesn't exist or has been removed."
          action={
            <button onClick={() => navigate('/projects')} className="bg-blue-500 text-white px-6 py-2 rounded-lg font-headline font-bold text-sm hover:bg-blue-600 transition-colors">
              Browse Projects
            </button>
          }
        />
      </AnimatedPage>
    )
  }

  const statusInfo = {
    draft: { label: 'Draft', bg: 'bg-zinc-800 border-zinc-700', text: 'text-zinc-400', icon: <Edit3 className="w-3 h-3" /> },
    published: null,
    archived: { label: 'Archived', bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-500', icon: <Archive className="w-3 h-3" /> },
    pending: { label: 'Pending', bg: 'bg-orange-500/10 border-orange-500/50', text: 'text-orange-500', icon: <Clock className="w-3 h-3 text-orange-500" /> }
  }[project.status as 'draft' | 'published' | 'archived' | 'pending']

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
    return <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
  }

  return (
    <AnimatedPage className="min-h-screen bg-zinc-950 pb-20">
      
      <div className="max-w-5xl mx-auto w-full px-4 md:px-8 pt-8 md:pt-12">
        
        {/* Banner */}
        <FramerIn delay={0.1} className="w-full h-32 md:h-64 bg-zinc-950 rounded-t-lg overflow-hidden relative border-t border-x border-zinc-800">
        {project.icon_url ? (
          <img src={project.icon_url} alt="Banner" className="w-full h-full object-cover opacity-30 blur-xl" />
        ) : (
          <div className="w-full h-full pixel-grid opacity-20"></div>
        )}
      </FramerIn>

      {/* Header Info */}
      <FramerIn delay={0.2} className="bg-zinc-950 rounded-b-lg p-5 md:p-8 mb-8 md:mb-8 flex flex-col md:flex-row gap-4 md:gap-6 items-start relative -mt-4 will-change-transform border-x border-b border-zinc-800 shadow-xl">
        <div className="relative -mt-10 md:-mt-12 z-10 flex-shrink-0">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-900 rounded-md overflow-hidden border-4 border-zinc-950 shadow-lg will-change-transform relative z-10">
            {project.icon_url ? (
              <img src={project.icon_url} alt="Icon" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 font-pixel text-lg md:text-xl">
                {project.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 w-full pt-1 md:pt-2">
          <div className="flex flex-col md:flex-row justify-between items-start gap-2 md:gap-4">
            <div className="min-w-0 md:flex-1 w-full md:w-auto">
              <h1 className="text-lg md:text-2xl font-pixel text-white mb-2 md:mb-3 break-words whitespace-normal leading-tight">{project.name}</h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-4">
                {statusInfo && (
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider rounded border ${statusInfo.bg} ${statusInfo.text}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.label}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-headline font-bold uppercase tracking-wider w-fit bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                  <img src={project.type === 'java' ? javaIcon : bedrockIcon} alt={project.type} className="w-3 h-3 md:w-3.5 md:h-3.5 object-contain" />
                  <span>{project.type}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-headline font-bold uppercase tracking-wider w-fit bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                  {getCategoryIcon(project.category)}
                  <span>{project.category}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Metrics Preview */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-3">
            <div className="flex items-center gap-1.5 text-zinc-400 font-headline text-xs md:text-sm">
              <Download className="w-4 h-4 text-zinc-500" />
              <span className="font-bold text-white">{project.downloads || 0}</span>
              <span className="text-zinc-500 uppercase tracking-widest text-[10px] ml-1">Downloads</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400 font-headline text-xs md:text-sm">
              <Heart className="w-4 h-4 text-red-500/70" />
              <span className="font-bold text-white">{project.likes || 0}</span>
              <span className="text-zinc-500 uppercase tracking-widest text-[10px] ml-1">Likes</span>
            </div>
            {project.platforms && project.platforms.length > 0 && (
              <div className="flex items-center gap-1.5 text-zinc-400 font-headline text-xs md:text-sm">
                <span className="material-symbols-outlined text-[16px] text-zinc-500">dns</span>
                <span className="font-bold text-white">{project.platforms.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </FramerIn>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-16 bg-zinc-950/95 backdrop-blur-xl z-40 w-full">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-6 md:gap-8 overflow-x-auto hide-scrollbar py-0">
            {['overview', 'gallery', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`relative py-3 font-headline font-bold text-xs md:text-sm uppercase tracking-widest whitespace-nowrap transition-colors ${
                  activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 md:px-8 pt-8">
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4 pb-20">
          <FramerIn delay={0.3} className="md:col-span-2 w-full space-y-4 md:space-y-4 min-w-0">
            {activeTab === 'overview' && (
              <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-8 rounded-lg">
                <h2 className="font-pixel text-white text-base md:text-lg mb-4 md:mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-realm-green">format_quote</span>
                  About
                </h2>
                <div className="text-zinc-300 font-body leading-relaxed text-[13px]">
                  {project.description ? (
                    <RichText content={project.description} />
                  ) : (
                    'No description provided.'
                  )}
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-8 rounded-lg overflow-hidden">
                <h2 className="font-pixel text-white text-base md:text-lg mb-4 md:mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-zinc-400">photo_library</span>
                  Gallery
                </h2>
                {project.gallery && project.gallery.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.gallery.map((img: string, idx: number) => (
                      <div key={idx} className="aspect-video rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
                        <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No Images" message="This project hasn't uploaded any gallery images yet." />
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-8 rounded-lg">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <h2 className="font-pixel text-white text-base md:text-lg">Ratings</h2>
                  <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-sm font-headline text-zinc-500 uppercase tracking-widest">
                    <span>0 Reviews</span>
                  </div>
                </div>
                <EmptyState title="Coming Soon" message="Project reviews will be available in a future update." />
              </div>
            )}
          </FramerIn>

          <FramerIn delay={0.4} className="w-full space-y-4 md:space-y-4">
            {/* Project Information equivalent to Server Information */}
            <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-6 rounded-lg">
              <h3 className="font-headline font-bold text-zinc-500 text-sm md:text-base mb-8 pb-4 border-b border-zinc-800/50 flex items-center gap-2 relative z-0">
                <div className="absolute left-0 bottom-0 -top-5 md:-top-6 -right-5 md:-right-6 bg-gradient-to-r from-transparent via-transparent to-realm-green/10 -z-10 rounded-tr-lg" />
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">description</span>
                Project Information
              </h3>
              <div className="flex flex-col gap-1.5 md:gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Heart className="w-3.5 h-3.5" />
                    <span className="text-xs md:text-sm">Likes</span>
                  </div>
                  <span className="text-white font-bold text-xs md:text-sm">{project.likes || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-xs md:text-sm">Downloads</span>
                  </div>
                  <span className="text-white font-bold text-xs md:text-sm">{project.downloads || 0}</span>
                </div>
                
                <div className="pt-3 mt-3 border-t border-zinc-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-headline uppercase tracking-widest text-zinc-500">
                    <Calendar className="w-2.5 h-2.5" />
                    <span>Published {format(new Date(project.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-headline uppercase tracking-widest text-zinc-500">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Updated {format(new Date(project.updated_at || project.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>

                {project.profiles && (
                  <div className="pt-4 mt-1 border-t border-zinc-800/50 flex items-center gap-3 md:gap-4 -mx-5 md:-mx-6 px-5 md:px-6 group transition-all duration-300">
                    <img src={project.profiles.discord_avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-zinc-700" alt="Owner" />
                    <div className="flex-1">
                      <p className="text-white text-xs md:text-sm leading-tight flex items-center gap-1.5">
                        {project.profiles.discord_username || 'Unknown User'}
                      </p>
                      <p className="text-[10px] text-realm-green uppercase font-headline font-bold tracking-wider mt-0.5 transition-colors">Project Owner</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Platform / Compatibility */}
            {(project.compatibility?.length > 0 || project.platforms?.length > 0) && (
              <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-6 rounded-lg mt-4">
                <h3 className="font-headline font-bold text-zinc-500 text-sm md:text-base mb-4 pb-4 border-b border-zinc-800/50 flex items-center gap-2 relative z-0">
                  <div className="absolute left-0 bottom-0 -top-5 md:-top-6 -right-5 md:-right-6 bg-gradient-to-r from-transparent via-transparent to-realm-green/10 -z-10 rounded-tr-lg" />
                  <span className="material-symbols-outlined text-[16px] md:text-[18px]">verified</span>
                  Compatibility
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.compatibility && project.compatibility.length > 0 && project.compatibility.map((v: string) => (
                    <span key={v} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-bold">
                      {v}
                    </span>
                  ))}
                </div>
                {project.type === 'java' && project.platforms && project.platforms.length > 0 && (
                  <>
                    <h3 className="font-headline font-bold text-zinc-500 text-sm md:text-base mb-4 mt-6 pb-4 border-b border-zinc-800/50 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] md:text-[18px]">dns</span>
                      Platforms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.platforms.map((p: string) => (
                        <span key={p} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs font-bold">
                          {p}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Project Actions equivalent to Server Actions */}
            <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-6 rounded-lg mt-4">
              <h3 className="font-headline font-bold text-zinc-500 text-sm md:text-base mb-8 pb-4 border-b border-zinc-800/50 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">bolt</span>
                Project Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleDownload}
                  className="w-full bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-center justify-center gap-2 text-blue-400 hover:bg-blue-500 hover:text-white transition-all group col-span-2"
                >
                  <Download className="w-4 h-4 transition-transform group-hover:-translate-y-1" />
                  <span className="font-headline font-bold uppercase tracking-widest text-[10px]">Download Project</span>
                </button>

                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-full bg-zinc-900/80 border border-zinc-800 p-3 rounded-lg flex items-center justify-center gap-2 hover:border-zinc-700 transition-all group ${
                    isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 transition-transform group-hover:scale-110 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                  <span className="font-headline font-bold uppercase tracking-widest text-[10px]">Like</span>
                </button>

                <button 
                  onClick={handleShare}
                  className="w-full bg-zinc-900/80 border border-zinc-800 p-3 rounded-lg flex items-center justify-center gap-2 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all group"
                >
                  {shareCopied ? <CheckCircle className="w-4 h-4 text-realm-green" /> : <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" />}
                  <span className="font-headline font-bold uppercase tracking-widest text-[10px]">Share</span>
                </button>
              </div>
            </div>
          </FramerIn>
        </div>
      </div>
    </AnimatedPage>
  )
}
