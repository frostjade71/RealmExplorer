import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProject, useProjectLikes, useProjectSaves, useProjectReviews } from '../hooks/queries'
import { useIncrementProjectDownloadMutation, useToggleProjectLikeMutation, useToggleProjectSaveMutation, useSubmitProjectReviewMutation, useDeleteProjectRatingMutation } from '../hooks/mutations'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner, EmptyState, TopLoadingBar } from '../components/FeedbackStates'
import { RatingModal } from '../components/RatingModal'
import { LicenseModal } from '../components/LicenseModal'
import { Download, Heart, Clock, Calendar, CheckCircle, Share2, Archive, Edit3, Upload, Bookmark, BookmarkMinus, Flag, Wrench, Package, Database, Sparkles, Puzzle, Hammer, PlusCircle, Paintbrush, Activity, Layers, Star, Users, Scale, Globe, Mail } from 'lucide-react'
import { SiDiscord, SiInstagram, SiYoutube, SiTiktok, SiFacebook, SiTwitch } from 'react-icons/si'
import javaIcon from '../assets/category/10421-grass.png'
import bedrockIcon from '../assets/category/437888-bedrock.png'
import fabricIcon from '../assets/platform/482016-fabricapiminecraft.png'
import forgeIcon from '../assets/platform/260039-neoforge.png'
import quiltIcon from '../assets/platform/quiltaa.png'
import vanillaIcon from '../assets/category/10421-grass.png'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { RichText } from '../components/RichText'
import { supabase } from '../lib/supabase'

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  
  const { user, signInWithDiscord } = useAuth()
  const { data: project, isLoading, error } = useProject(slug)
  const { data: projectLikes } = useProjectLikes(project?.id, user?.id)
  const { data: projectSaves } = useProjectSaves(project?.id, user?.id)
  
  const isLiked = projectLikes?.hasLiked ?? false
  const isSaved = projectSaves?.hasSaved ?? false

  const [shareCopied, setShareCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'reviews'>('overview')
  const [isLikingLocal, setIsLikingLocal] = useState(false)
  const [isSavingLocal, setIsSavingLocal] = useState(false)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const { data: projectReviews = [] } = useProjectReviews(project?.id)
  const submitReviewMutation = useSubmitProjectReviewMutation()
  const deleteReviewMutation = useDeleteProjectRatingMutation()

  const userReview = projectReviews?.find(r => r.user_id === user?.id)

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

  const incrementDownloadMutation = useIncrementProjectDownloadMutation()
  const toggleLikeMutation = useToggleProjectLikeMutation()
  const toggleSaveMutation = useToggleProjectSaveMutation()

  const handleDownload = () => {
    if (project?.file_url) {
      if (project.id) {
        const downloadedProjects = JSON.parse(localStorage.getItem('downloaded_projects') || '[]')
        if (!downloadedProjects.includes(project.id)) {
          incrementDownloadMutation.mutate({ projectId: project.id, currentDownloads: project.downloads || 0 })
          downloadedProjects.push(project.id)
          localStorage.setItem('downloaded_projects', JSON.stringify(downloadedProjects))
        }
      }
      
      try {
        const fileUrl = new URL(project.file_url)
        const filenameFromUrl = decodeURIComponent(fileUrl.pathname.split('/').pop() || '')
        
        const isUUIDFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-zA-Z0-9]+$/.test(filenameFromUrl)
        
        let downloadName = filenameFromUrl
        
        if (isUUIDFormat || !filenameFromUrl) {
          // Fallback to project name for old files
          const extension = fileUrl.pathname.split('.').pop() || 'zip'
          const safeProjectName = project.name.replace(/[^a-zA-Z0-9]/g, '-')
          downloadName = `${safeProjectName}.${extension}`
        }
        
        fileUrl.searchParams.set('download', downloadName)
        
        window.open(fileUrl.toString(), '_blank')
      } catch (e) {
        window.open(project.file_url, '_blank')
      }
    } else {
      toast.error('No download file available.')
    }
  }

  const handleToggleLike = () => {
    if (!project?.id) return
    if (!user) {
      toast.error('Please log in to like projects')
      signInWithDiscord()
      return
    }
    
    setIsLikingLocal(true)
    toggleLikeMutation.mutate({
      projectId: project.id,
      userId: user.id,
      isLiking: !isLiked
    }, {
      onSuccess: () => {
        if (!isLiked) {
          toast.success(`Thank you for Supporting ${project.name}`)
        }
      },
      onSettled: () => {
        setTimeout(() => setIsLikingLocal(false), 1500)
      }
    })
  }

  const handleToggleSave = () => {
    if (!project?.id) return
    if (!user) {
      toast.error('Please log in to save projects')
      signInWithDiscord()
      return
    }
    
    setIsSavingLocal(true)
    toggleSaveMutation.mutate({
      projectId: project.id,
      userId: user.id,
      isSaving: !isSaved
    }, {
      onSuccess: () => {
        if (!isSaved) {
          toast.success('Project Saved')
        } else {
          toast('Project Unsaved', { icon: <BookmarkMinus className="w-4 h-4 text-zinc-400" /> })
        }
      },
      onSettled: () => {
        setTimeout(() => setIsSavingLocal(false), 1500)
      }
    })
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
    return <Icon className="w-3.5 h-3.5" />
  }

  const getPlatformIcon = (p: string) => {
    const lower = p.toLowerCase();
    if (lower === 'fabric') return fabricIcon;
    if (lower.includes('forge')) return forgeIcon;
    if (lower === 'quilt') return quiltIcon;
    if (lower === 'vanilla') return vanillaIcon;
    return null;
  }



  return (
    <AnimatedPage className="min-h-screen bg-zinc-950 pb-20">
      {/* Top Loading Bars for Like/Save Mutations */}
      <TopLoadingBar isVisible={toggleLikeMutation.isPending || isLikingLocal} colorClass="via-red-500" />
      <TopLoadingBar isVisible={toggleSaveMutation.isPending || isSavingLocal} colorClass="via-blue-500" />
      
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
        
        <div className="flex-1 w-full pt-0">
          <div className="flex flex-col md:flex-row justify-between items-start gap-2 md:gap-4">
            <div className="min-w-0 md:flex-1 w-full md:w-auto">
              <h1 className="text-lg md:text-2xl font-pixel text-white mb-1 break-words whitespace-normal leading-tight">{project.name}</h1>
              <div className="flex flex-col gap-1 mb-1">
                {statusInfo && (
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 w-fit text-[9px] md:text-[10px] font-bold uppercase tracking-wider rounded border ${statusInfo.bg} ${statusInfo.text}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.label}</span>
                  </div>
                )}
                {project.short_description && (
                  <p className="text-sm md:text-base text-zinc-300 font-headline">
                    {project.short_description}
                  </p>
                )}
                
                {/* Social Links */}
                {(project.social_links && project.social_links.length > 0) && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {project.social_links.map((link, idx) => {
                      const icons: Record<string, React.ReactNode> = {
                        website: <Globe className="w-4 h-4" />,
                        instagram: <SiInstagram className="w-4 h-4" />,
                        youtube: <SiYoutube className="w-4 h-4" />,
                        tiktok: <SiTiktok className="w-4 h-4" />,
                        facebook: <SiFacebook className="w-4 h-4" />,
                        twitch: <SiTwitch className="w-4 h-4" />,
                        discord: <SiDiscord className="w-4 h-4" />,
                        email: <Mail className="w-4 h-4" />
                      }
                      const colors: Record<string, { text: string; border: string }> = {
                        website: { text: 'text-white', border: 'hover:border-white/30' },
                        instagram: { text: 'text-pink-500', border: 'hover:border-pink-500/40' },
                        youtube: { text: 'text-red-600', border: 'hover:border-red-600/40' },
                        tiktok: { text: 'text-white', border: 'hover:border-white/40' },
                        facebook: { text: 'text-blue-600', border: 'hover:border-blue-600/40' },
                        twitch: { text: 'text-purple-500', border: 'hover:border-purple-500/40' },
                        discord: { text: 'text-[#5865F2]', border: 'hover:border-[#5865F2]/40' },
                        email: { text: 'text-white', border: 'hover:border-white/30' }
                      }
                      const theme = colors[link.platform] || { text: 'text-white', border: 'hover:border-white/30' }
                      return (
                        <a 
                          key={idx}
                          href={link.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className={`flex items-center justify-center p-2 bg-zinc-900 border border-zinc-800 rounded-md ${theme.text} ${theme.border} transition-all shadow-sm`}
                          title={link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                        >
                          {icons[link.platform] || <Globe className="w-4 h-4" />}
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto mt-2 md:mt-0">
              <div className="flex items-stretch gap-2 w-full">
                <button 
                  onClick={handleDownload}
                  className="bg-[#4EC44E] hover:bg-[#5cd45c] text-zinc-950 px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-headline font-bold transition-all flex-1 flex items-center justify-center gap-2 group shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] border-b-[4px] border-[#3da53d] active:border-b-0 active:border-t-[4px] active:border-t-transparent text-sm md:text-base"
                >
                  <Upload className="w-5 h-5" />
                  <span className="truncate flex items-center gap-1.5 leading-tight">
                    Download
                  </span>
                </button>
                
                <button 
                  onClick={handleToggleLike}
                  className={`bg-zinc-900/80 hover:bg-zinc-800/80 border-b-[4px] border-zinc-950 active:border-b-0 active:border-t-[4px] active:border-t-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm px-4 py-2.5 md:px-5 md:py-3 rounded-lg transition-all flex-shrink-0 flex items-center justify-center group ${isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-red-500'}`}
                  title="Like"
                >
                  <Heart className={`w-5 h-5 transition-transform ${isLiked ? 'fill-current text-red-500' : ''}`} />
                </button>

                <button 
                  onClick={handleToggleSave}
                  className={`bg-zinc-900/80 hover:bg-zinc-800/80 border-b-[4px] border-zinc-950 active:border-b-0 active:border-t-[4px] active:border-t-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm px-4 py-2.5 md:px-5 md:py-3 rounded-lg transition-colors flex-shrink-0 flex items-center justify-center group ${isSaved ? 'text-blue-500 hover:text-blue-400' : 'text-zinc-400 hover:text-white'}`}
                  title="Save"
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Metrics Preview */}
              <div className="flex flex-wrap items-center justify-end gap-3 md:gap-4 mt-0.5 w-full">
                <div className="flex items-center gap-1.5 text-zinc-400 font-headline text-sm md:text-base" title="Downloads">
                  <Download className="w-4 h-4 md:w-5 md:h-5 text-zinc-500" />
                  <span className="font-bold text-white">{project.downloads || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 font-headline text-sm md:text-base" title="Likes">
                  <Heart className="w-4 h-4 md:w-5 md:h-5 text-zinc-500" />
                  <span className="font-bold text-white">{project.likes || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 font-headline text-sm md:text-base" title="Saves">
                  <Bookmark className="w-4 h-4 md:w-5 md:h-5 text-zinc-500" />
                  <span className="font-bold text-white">{project.saves || 0}</span>
                </div>
                {project.platforms && project.platforms.length > 0 && (
                  <div className="flex flex-wrap items-center justify-end gap-2 text-zinc-400 font-headline text-sm md:text-base">
                    {project.platforms.map((p: string, idx: number) => {
                      const IconSrc = getPlatformIcon(p);
                      return (
                        <div key={p} className="flex items-center gap-1.5">
                          {IconSrc ? (
                            <img src={IconSrc} alt={p} className="w-4 h-4 md:w-5 md:h-5 object-contain" />
                          ) : (
                            <span className="material-symbols-outlined text-[16px] md:text-[18px] text-zinc-500">dns</span>
                          )}
                          <span className="font-bold text-white">{p}</span>
                          {idx < project.platforms.length - 1 && <span className="text-zinc-600 ml-0.5">,</span>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </FramerIn>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-16 bg-zinc-950/95 backdrop-blur-xl z-40 w-full">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-6 md:gap-8 overflow-x-auto overflow-y-hidden no-scrollbar py-0">
            {['overview', 'gallery', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab as any)
                  if (tab !== 'overview') {
                    setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
                  }
                }}
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

      <div ref={contentRef} className="max-w-5xl mx-auto w-full px-4 md:px-8 pt-8 scroll-mt-28">
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
                  <h2 className="font-pixel text-white text-base md:text-lg flex items-center gap-2">
                    Ratings
                  </h2>
                  <div className="flex items-center gap-2 md:gap-4">
                    <button
                      onClick={() => {
                        if (!user) {
                          toast.error('Please log in to leave a review')
                          signInWithDiscord()
                          return
                        }
                        setIsRatingModalOpen(true)
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-headline font-bold text-xs md:text-sm transition-colors flex items-center gap-2"
                    >
                      {userReview ? 'Edit Review' : 'Add Review'}
                    </button>
                  </div>
                </div>
                
                {projectReviews && projectReviews.length > 0 ? (
                  <div className="space-y-4">
                    {projectReviews.map((review) => (
                      <div key={review.id} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {review.profiles?.discord_avatar ? (
                              <img src={review.profiles.discord_avatar} alt="" className="w-8 h-8 rounded-full bg-zinc-800" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                <Users className="w-4 h-4 text-zinc-500" />
                              </div>
                            )}
                            <div>
                              <div className="text-white text-sm font-bold flex items-center gap-2">
                                {review.profiles?.discord_username || 'Anonymous'}
                              </div>
                              <div className="text-zinc-500 text-[10px] font-headline uppercase tracking-wider">
                                {new Date(review.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-700'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-zinc-300 text-sm font-body mt-3 italic">
                            "{review.comment}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No Reviews" message="Be the first to review this project!" />
                )}
              </div>
            )}
          </FramerIn>

          <FramerIn delay={0.4} className="w-full space-y-4 md:space-y-4">
            {/* Platform / Compatibility */}
            {(project.compatibility?.length > 0 || project.platforms?.length > 0) && (
              <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-6 rounded-lg">
                <h3 className="font-headline font-bold text-zinc-500 text-sm md:text-base mb-4 pb-4 border-b border-zinc-800/50 flex items-center gap-2 relative z-0">
                  <div className="absolute left-0 bottom-0 -top-5 md:-top-6 -right-5 md:-right-6 bg-gradient-to-r from-transparent via-transparent to-realm-green/10 -z-10 rounded-tr-lg" />
                  <span className="material-symbols-outlined text-[16px] md:text-[18px]">verified</span>
                  Compatibility
                </h3>
                <div className="mb-3 text-sm font-bold text-zinc-300 flex items-center gap-2">
                  <img src={project.type === 'java' ? javaIcon : bedrockIcon} alt={project.type} className="w-4 h-4 object-contain" />
                  Minecraft: {project.type === 'java' ? 'Java Edition' : 'Bedrock Edition'}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.compatibility && project.compatibility.length > 0 && project.compatibility.map((v: string) => (
                    <span key={v} className="bg-zinc-800/80 text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                      {v}
                    </span>
                  ))}
                </div>
                {((project.platforms && project.platforms.length > 0) || project.category || project.type) && (
                  <>
                    <h3 className="font-headline font-bold text-zinc-500 text-sm md:text-base mb-4 mt-6 pb-4 border-b border-zinc-800/50 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] md:text-[18px]">dns</span>
                      Platforms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.type && (
                        <span className="bg-zinc-800/80 text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-bold capitalize flex items-center gap-1.5">
                          <img src={project.type === 'java' ? javaIcon : bedrockIcon} alt={project.type} className="w-3.5 h-3.5 object-contain" />
                          {project.type}
                        </span>
                      )}
                      {project.category && (
                        <span className="bg-zinc-800/80 text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                          {getCategoryIcon(project.category)}
                          {project.category}
                        </span>
                      )}
                      {project.platforms && project.platforms.map((p: string) => (
                        <span key={p} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                          {getPlatformIcon(p) && <img src={getPlatformIcon(p)!} alt={p} className="w-3.5 h-3.5 object-contain" />}
                          {p}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Project Information equivalent to Server Information */}
            <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-6 rounded-lg mt-4">
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
                    <Star className="w-3.5 h-3.5" />
                    <span className="text-xs md:text-sm">Rating</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className={`w-3 h-3 md:w-3.5 md:h-3.5 ${project.average_rating > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} />
                    <span className="text-white font-bold text-xs md:text-sm">
                      {project.average_rating > 0 ? project.average_rating.toFixed(1) : '0.0'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-xs md:text-sm">Downloads</span>
                  </div>
                  <span className="text-white font-bold text-xs md:text-sm">{project.downloads || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span className="text-xs md:text-sm">Saves</span>
                  </div>
                  <span className="text-white font-bold text-xs md:text-sm">{project.saves || 0}</span>
                </div>
                
                {project.license && project.license !== 'None' && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Scale className="w-3.5 h-3.5" />
                      <span className="text-xs md:text-sm">License</span>
                    </div>
                    <button 
                      onClick={() => setIsLicenseModalOpen(true)}
                      className="text-blue-400 hover:text-blue-300 font-bold text-xs md:text-sm hover:underline"
                    >
                      {project.license === 'Custom License' ? 'Custom' : project.license}
                    </button>
                  </div>
                )}
                
                <div className="pt-3 mt-3 border-t border-zinc-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-headline uppercase tracking-widest text-zinc-500">
                    <Calendar className="w-2.5 h-2.5" />
                    <span>Published {formatDistanceToNow(new Date(project.created_at))} ago</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-headline uppercase tracking-widest text-zinc-500">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Updated {formatDistanceToNow(new Date(project.updated_at || project.created_at))} ago</span>
                  </div>
                </div>

                {project.profiles && (
                  <Link 
                    to={`/profile/${project.profiles.discord_username || ''}`}
                    className="pt-4 mt-1 border-t border-zinc-800/50 flex items-center gap-3 md:gap-4 -mx-5 md:-mx-6 px-5 md:px-6 group transition-all duration-300"
                  >
                    <img src={project.profiles.discord_avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-zinc-700 object-cover" alt="Owner" />
                    <div className="flex-1">
                      <p className="text-white text-xs md:text-sm leading-tight flex items-center gap-1.5">
                        {project.profiles.discord_username || 'Unknown User'}
                      </p>
                      <p className="text-[10px] text-realm-green uppercase font-headline font-bold tracking-wider mt-0.5 transition-colors">Creator</p>
                    </div>
                    <span className="text-[8px] md:text-[9px] uppercase tracking-widest font-headline text-zinc-600 font-bold whitespace-nowrap opacity-40 group-hover:opacity-100 transition-opacity">
                      view profile
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Project Actions equivalent to Server Actions */}
            <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-6 rounded-lg mt-4">
              <h3 className="font-headline font-bold text-zinc-500 text-sm md:text-base mb-8 pb-4 border-b border-zinc-800/50 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">bolt</span>
                Project Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleShare}
                  className="w-full bg-zinc-900/80 border border-zinc-800 p-3 rounded-lg flex items-center justify-center gap-2 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors group"
                >
                  {shareCopied ? <CheckCircle className="w-4 h-4 text-realm-green" /> : <Share2 className="w-4 h-4" />}
                  <span className="font-headline font-bold uppercase tracking-widest text-[10px]">Share</span>
                </button>

                <button 
                  onClick={() => toast('Im too lazy maybe next time')}
                  className="w-full bg-zinc-900/80 border border-zinc-800 p-3 rounded-lg flex items-center justify-center gap-2 text-zinc-500 hover:text-red-400 hover:border-red-500/40 transition-colors group"
                >
                  <Flag className="w-4 h-4" />
                  <span className="font-headline font-bold uppercase tracking-widest text-[10px]">Report</span>
                </button>
              </div>
            </div>
          </FramerIn>
        </div>
      </div>

      <RatingModal
        type="project"
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        initialRating={userReview?.rating || 0}
        initialComment={userReview?.comment || ''}
        isSubmitting={submitReviewMutation.isPending}
        isRemoving={deleteReviewMutation.isPending}
        onSubmit={(rating, comment) => {
          if (!user || !project?.id) return
          submitReviewMutation.mutate({
            userId: user.id,
            projectId: project.id,
            rating,
            comment
          }, {
            onSuccess: async () => {
              toast.success(userReview ? 'Review updated' : 'Review submitted')
              setIsRatingModalOpen(false)

              if (project.owner_id) {
                await supabase.from('notifications').insert({
                  user_id: project.owner_id,
                  type: 'rating',
                  title: 'New Project Rating',
                  message: `Your "${project.name}" has been rated`,
                  related_id: project.id
                } as any)
              }
            },
            onError: (err) => {
              toast.error('Failed to submit review', { description: err.message })
            }
          })
        }}
        onRemove={userReview ? () => {
          if (!user || !project?.id) return
          deleteReviewMutation.mutate({
            userId: user.id,
            projectId: project.id
          }, {
            onSuccess: () => {
              toast.success('Review removed')
              setIsRatingModalOpen(false)
            }
          })
        } : undefined}
      />

      <LicenseModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        licenseType={project.license === 'Custom License' ? 'Custom' : project.license || ''}
        customUrl={project.custom_license_url}
      />
    </AnimatedPage>
  )
}
