import { useState, useEffect, useRef, Suspense, lazy } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProject, useProjectLikes, useProjectSaves, useProjectReviews } from '../hooks/queries'
import { useIncrementProjectDownloadMutation, useToggleProjectLikeMutation, useToggleProjectSaveMutation, useSubmitProjectReviewMutation, useDeleteProjectRatingMutation, useSubmitReportMutation } from '../hooks/mutations'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner, EmptyState, TopLoadingBar } from '../components/FeedbackStates'
import errorImage from '../assets/error/teto-but-re.webp'
import { RatingModal } from '../components/RatingModal'
import { LicenseModal } from '../components/LicenseModal'
import { ReportModal } from '../components/ReportModal'
import { Download, Heart, Clock, Calendar, CheckCircle, XCircle, Share2, Edit3, Upload, Bookmark, BookmarkMinus, Flag, Package, PackageOpen, Braces, Glasses, Hammer, PlusCircle, Paintbrush, Activity, Layers, Star, Users, Scale, Globe, Mail, Maximize2, ChevronLeft, ChevronRight, Plug } from 'lucide-react'
import { SiDiscord, SiInstagram, SiYoutube, SiTiktok, SiFacebook, SiTwitch, SiGithub, SiX, SiPatreon, SiKofi } from 'react-icons/si'

import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { useIsMobile } from '../hooks/useMediaQuery'
const GalleryModal = lazy(() => import('../components/GalleryModal').then(module => ({ default: module.GalleryModal })))
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { RichText } from '../components/RichText'
import { supabase } from '../lib/supabase'
import { FabricIcon, ForgeIcon, QuiltIcon, NeoForgeIcon, VanillaIcon, PaperIcon, SpigotIcon, PurpurIcon, BukkitIcon } from '../components/icons/PlatformIcons'

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  
  const { user, isAdmin, isModerator } = useAuth()
  const { data: project, isLoading } = useProject(slug)
  const { data: projectLikes } = useProjectLikes(project?.id, user?.id)
  const { data: projectSaves } = useProjectSaves(project?.id, user?.id)
  
  const isLiked = projectLikes?.hasLiked ?? false
  const isSaved = projectSaves?.hasSaved ?? false

  const [shareCopied, setShareCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'changelog' | 'reviews'>('overview')
  const [isLikingLocal, setIsLikingLocal] = useState(false)
  const [isSavingLocal, setIsSavingLocal] = useState(false)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const isMobile = useIsMobile()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 150 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isMobile) return
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - left) / width - 0.5
    const y = (e.clientY - top) / height - 0.5
    mouseX.set(-x * 25)
    mouseY.set(-y * 25)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const [[activeImageIndex, direction], setDirectionalIndex] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    if (!project?.gallery?.length) return;
    const nextIndex =
      (activeImageIndex + newDirection + project.gallery.length) % project.gallery.length;
    setDirectionalIndex([nextIndex, newDirection]);
  };

  const goToImage = (index: number) => {
    const newDirection = index > activeImageIndex ? 1 : -1;
    setDirectionalIndex([index, newDirection]);
  };

  const galleryVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 30 : -30,
      opacity: 0,
    }),
  };

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
  const reportMutation = useSubmitReportMutation()

  const handleReportSubmit = (subject: string, message: string) => {
    if (!user || !project) return
    reportMutation.mutate(
      { reporter_id: user.id, project_id: project.id, subject, message },
      {
        onSuccess: () => {
          setIsReportModalOpen(false)
          toast.success('Report Submitted', {
            description: 'Thank you for your report. Our team will review it shortly.',
            icon: <Flag className="w-4 h-4 text-realm-green" />
          })
        },
        onError: () => {
          toast.error('Submission Failed', {
            description: 'Failed to submit report. Please try again later.'
          })
        }
      }
    )
  }

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

  if (!project) {
    return (
      <AnimatedPage className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500 p-4 flex flex-col items-center">
          <img src={errorImage} alt="Not Found" className="w-24 h-24 md:w-32 md:h-32 object-contain mb-2" />
          <div className="space-y-2 px-4">
            <h2 className="text-2xl md:text-3xl font-headline text-white font-bold tracking-tight">
              <span className="text-realm-green mr-3">404</span>
              Not Found
            </h2>
            <p className="text-xs md:text-sm text-on-surface-variant font-body max-w-sm mx-auto">
              This server or realm does not exist or was removed.
            </p>
          </div>
          <div className="pt-4">
            <Link 
              to="/projects" 
              className="inline-flex items-center justify-center px-4 py-2.5 font-headline text-sm font-semibold text-black bg-realm-green rounded hover:bg-primary-fixed transition-colors duration-200"
            >
              Return to Directory
            </Link>
          </div>
        </div>
      </AnimatedPage>
    )
  }

  // Security check: Only owners and admins can view unapproved projects
  const isApproved = project.status === 'approved'
  const isOwner = user?.id === project.owner_id
  const hasAccess = isApproved || isOwner || isAdmin || isModerator

  if (!hasAccess) {
    return (
      <AnimatedPage className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500 p-4 flex flex-col items-center">
          <img src={errorImage} alt="Forbidden" className="w-24 h-24 md:w-32 md:h-32 object-contain mb-2" />
          <div className="space-y-2 px-4">
            <h2 className="text-2xl md:text-3xl font-headline text-white font-bold tracking-tight">
              <span className="text-realm-green mr-3">403</span>
              Project Not Available
            </h2>
            <p className="text-xs md:text-sm text-on-surface-variant font-body max-w-sm mx-auto">
              This project is currently under review or has been made private.
            </p>
          </div>
          <div className="pt-4">
            <Link 
              to="/projects" 
              className="inline-flex items-center justify-center px-4 py-2.5 font-headline text-sm font-semibold text-black bg-realm-green rounded hover:bg-primary-fixed transition-colors duration-200"
            >
              Browse Projects
            </Link>
          </div>
        </div>
      </AnimatedPage>
    )
  }

  const statusInfo = {
    draft: { label: 'Draft', bg: 'bg-zinc-800 border-zinc-700', text: 'text-zinc-400', icon: <Edit3 className="w-3 h-3" /> },
    approved: null,
    pending: { label: 'Pending', bg: 'bg-orange-500/10 border-orange-500/50', text: 'text-orange-500', icon: <Clock className="w-3 h-3 text-orange-500" /> },
    rejected: { label: 'Rejected', bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-500', icon: <XCircle className="w-3 h-3 text-red-500" /> }
  }[project.status]

  const getCategoryIcon = (c: string) => {
    const lower = c.toLowerCase();
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

  const getPlatformIcon = (p: string) => {
    const lower = p.toLowerCase();
    let Icon = VanillaIcon;
    if (lower === 'fabric') Icon = FabricIcon;
    else if (lower === 'neoforge') Icon = NeoForgeIcon;
    else if (lower.includes('forge')) Icon = ForgeIcon;
    else if (lower === 'quilt') Icon = QuiltIcon;
    else if (lower === 'vanilla') Icon = VanillaIcon;
    else if (lower === 'paper') Icon = PaperIcon;
    else if (lower === 'spigot') Icon = SpigotIcon;
    else if (lower === 'purpur') Icon = PurpurIcon;
    else if (lower === 'bucket' || lower === 'bukkit') Icon = BukkitIcon;
    return <Icon className="w-3.5 h-3.5 text-zinc-400" />;
  }



  return (
    <AnimatedPage className="min-h-screen pb-20">
      {/* Top Loading Bars for Like/Save Mutations */}
      <TopLoadingBar isVisible={toggleLikeMutation.isPending || isLikingLocal} colorClass="via-red-500" />
      <TopLoadingBar isVisible={toggleSaveMutation.isPending || isSavingLocal} colorClass="via-blue-500" />
      
      <div className="max-w-5xl mx-auto w-full px-4 md:px-8 pt-8 md:pt-12">
        
        {/* Banner */}
        <FramerIn delay={0.1} className="w-full h-32 md:h-64 bg-zinc-950 rounded-t-xl overflow-hidden relative border-t border-x border-zinc-800">
          <div className="w-full h-full relative" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            {project.gallery && project.gallery.length > 0 ? (
              <motion.img 
                initial={isMobile ? { opacity: 0.5 } : { scale: 1.05, opacity: 0 }}
                animate={isMobile ? { opacity: 0.5 } : { scale: 1.1, opacity: 0.5 }}
                style={isMobile ? undefined : { x: springX, y: springY }}
                transition={{ duration: 0.8 }}
                src={project.gallery[0]} 
                alt="Banner" 
                width={1280} 
                height={320} 
                fetchPriority="high" 
                decoding="sync" 
                loading="eager" 
                className="w-full h-full object-cover blur-sm will-change-[opacity,transform] absolute inset-0" 
              />
            ) : project.icon_url ? (
              <motion.img 
                initial={isMobile ? { opacity: 0.4 } : { scale: 1.05, opacity: 0 }}
                animate={isMobile ? { opacity: 0.4 } : { scale: 1.1, opacity: 0.4 }}
                style={isMobile ? undefined : { x: springX, y: springY }}
                transition={{ duration: 0.8 }}
                src={project.icon_url} 
                alt="Banner" 
                width={1280} 
                height={320} 
                fetchPriority="high" 
                decoding="sync" 
                loading="eager" 
                className="w-full h-full object-cover blur-md will-change-[opacity,transform] absolute inset-0" 
              />
            ) : (
              <div className="w-full h-full pixel-grid opacity-20"></div>
            )}
          </div>
        </FramerIn>

      {/* Header Info */}
      <div className="bg-zinc-950 rounded-b-xl p-5 md:p-8 mb-8 md:mb-8 flex flex-col md:flex-row gap-4 md:gap-6 items-start relative -mt-4 border-x border-b border-zinc-800 shadow-xl">
        <div className="relative -mt-10 md:-mt-12 z-10 flex-shrink-0">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-900 rounded-xl overflow-hidden border-4 border-zinc-950 shadow-lg relative z-10">
            {project.icon_url ? (
              <img src={project.icon_url} alt="Icon" width={96} height={96} fetchPriority="high" decoding="sync" loading="eager" className="w-full h-full object-cover" />
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
                  <p className="text-sm md:text-base text-zinc-400 font-headline">
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
                        github: <SiGithub className="w-4 h-4" />,
                        x: <SiX className="w-4 h-4" />,
                        patreon: <SiPatreon className="w-4 h-4" />,
                        kofi: <SiKofi className="w-4 h-4" />,
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
                        github: { text: 'text-white', border: 'hover:border-white/40' },
                        x: { text: 'text-white', border: 'hover:border-white/40' },
                        patreon: { text: 'text-[#FF424D]', border: 'hover:border-[#FF424D]/40' },
                        kofi: { text: 'text-[#FF5E5B]', border: 'hover:border-[#FF5E5B]/40' },
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
                          title={{ github: 'GitHub', x: 'X (Twitter)', kofi: 'Ko-fi' }[link.platform as string] || link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
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
                  <span className="font-bold text-white">{projectLikes?.count ?? project.likes ?? 0}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 font-headline text-sm md:text-base" title="Saves">
                  <Bookmark className="w-4 h-4 md:w-5 md:h-5 text-zinc-500" />
                  <span className="font-bold text-white">{projectSaves?.totalSaves ?? project.saves ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-16 bg-[#050805]/95 backdrop-blur-xl z-40 w-full">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-6 md:gap-8 overflow-x-auto overflow-y-hidden no-scrollbar py-0">
            {['overview', 'gallery', 'changelog', 'reviews'].map((tab) => (
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
              <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-8 rounded-xl">
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
              <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-8 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-pixel text-white text-base md:text-lg flex items-center gap-2">
                    Gallery
                  </h2>
                  {project.gallery && project.gallery.length > 0 && (
                    <div className="flex gap-1">
                      {project.gallery.map((_: any, i: number) => (
                        <div 
                          key={i} 
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === activeImageIndex ? 'bg-realm-green w-4' : 'bg-zinc-800'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {project.gallery && project.gallery.length > 0 ? (
                  <>
                    <div 
                      onClick={() => setIsGalleryModalOpen(true)}
                      className="relative aspect-video bg-black rounded-xl overflow-hidden group cursor-zoom-in"
                    >
                      <AnimatePresence mode="wait" custom={direction}>
                        <motion.img
                          key={activeImageIndex}
                          src={project.gallery[activeImageIndex]}
                          custom={direction}
                          variants={galleryVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{
                            x: isMobile ? { duration: 0.3, ease: "easeOut" } : { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                          }}
                          loading="lazy"
                          className="w-full h-full object-cover will-change-transform"
                          alt={`Gallery ${activeImageIndex + 1}`}
                        />
                      </AnimatePresence>

                      <div className="hidden md:flex absolute top-3 right-3 px-2.5 py-1 bg-black/60 border border-white/10 rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity items-center gap-1.5 text-[10px] font-headline font-bold text-white shadow-xl pointer-events-none z-10">
                        <Maximize2 className="w-3 h-3 text-realm-green" />
                        <span>Click to enlarge</span>
                      </div>

                      {project.gallery.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              paginate(-1)
                            }}
                            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/10 items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-realm-green hover:text-zinc-950 hover:border-realm-green shadow-xl z-20 backdrop-blur-md"
                            title="Previous"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              paginate(1)
                            }}
                            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/10 items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-realm-green hover:text-zinc-950 hover:border-realm-green shadow-xl z-20 backdrop-blur-md"
                            title="Next"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </>
                      )}

                      <div className="hidden md:block absolute bottom-4 right-4 px-3 py-1 bg-black/60 border border-white/10 rounded-lg backdrop-blur-md text-[10px] font-pixel text-white/60 z-10">
                        {activeImageIndex + 1} / {project.gallery.length}
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3 mt-4">
                      {project.gallery.map((url: string, i: number) => (
                        <button 
                          key={i}
                          onClick={() => goToImage(i)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${i === activeImageIndex ? 'border-realm-green ring-4 ring-realm-green/10' : 'border-zinc-800 hover:border-zinc-700'}`}
                        >
                          <img src={url} loading="lazy" alt={`Thumb ${i + 1}`} className={`w-full h-full object-cover ${i === activeImageIndex ? 'opacity-100' : 'opacity-40 hover:opacity-100 transition-opacity'}`} />
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState title="No Images" message="This project hasn't uploaded any gallery images yet." />
                )}
              </div>
            )}

            {activeTab === 'changelog' && (
              <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-8 rounded-xl">
                <h2 className="font-pixel text-white text-base md:text-lg mb-6 flex items-center gap-2">
                  Changelog
                </h2>
                
                {project.changelogs && project.changelogs.length > 0 ? (
                  <div className="relative pl-4 md:pl-6 border-l-2 border-zinc-800 space-y-8">
                    {project.changelogs.map((log: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[23px] md:-left-[31px] top-1.5 w-3 h-3 bg-green-400 rounded-full" />
                        
                        <h3 className="text-white font-bold text-sm md:text-base font-headline mb-1">
                          {log.title} <span className="text-zinc-500 font-normal text-xs md:text-sm">by {project.profiles?.discord_username || 'Creator'} on {new Date(log.created_at).toLocaleDateString()}</span>
                        </h3>
                        <div className="text-zinc-300 font-body text-xs md:text-sm whitespace-pre-wrap mt-2">
                          {log.description}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 px-6 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50">
                    <h3 className="font-pixel text-sm md:text-sm text-zinc-300 mb-1">No Changelogs</h3>
                    <p className="text-zinc-500 font-headline text-[10px] md:text-xs">There are no changelogs available for this project yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-8 rounded-xl">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <h2 className="font-pixel text-white text-base md:text-lg flex items-center gap-2">
                    Ratings
                  </h2>
                  <div className="flex items-center gap-2 md:gap-4">
                    <button
                      onClick={() => {
                        if (!user) {
                          toast.error('Please log in to leave a review')
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
                  <div className="flex flex-col items-center justify-center py-10 px-6 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50">
                    <h3 className="font-pixel text-sm md:text-sm text-zinc-300 mb-1">No Reviews</h3>
                    <p className="text-zinc-500 font-headline text-[10px] md:text-xs">Be the first to review this project!</p>
                  </div>
                )}
              </div>
            )}
          </FramerIn>

          <FramerIn delay={0.4} className="w-full space-y-4 md:space-y-4">
            {/* Platform / Compatibility */}
            {(project.compatibility?.length > 0 || project.platforms?.length > 0) && (
              <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-6 rounded-xl">
                <h3 className="font-headline font-bold text-zinc-500 text-sm md:text-base mb-4 pb-4 border-b border-zinc-800/50 flex items-center gap-2 relative z-0">
                  <div className="absolute left-0 bottom-0 -top-5 md:-top-6 -right-5 md:-right-6 bg-gradient-to-r from-transparent via-transparent to-realm-green/10 -z-10 rounded-tr-lg" />
                  <span className="material-symbols-outlined text-[16px] md:text-[18px]">verified</span>
                  Compatibility
                </h3>
                <div className="mb-3 text-sm font-bold text-zinc-300 flex items-center gap-2">
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
                      {project.platforms && project.platforms.map((p: string) => (
                        <span key={p} className="bg-zinc-800/80 text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                          {getPlatformIcon(p)}
                          {p}
                        </span>
                      ))}
                      {project.category && (
                        <span className="bg-zinc-800/80 text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                          {getCategoryIcon(project.category)}
                          {project.category}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Project Information equivalent to Server Information */}
            <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-6 rounded-xl mt-4">
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
                  <span className="text-white font-bold text-xs md:text-sm">{projectLikes?.count ?? project.likes ?? 0}</span>
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
                  <span className="text-white font-bold text-xs md:text-sm">{projectSaves?.totalSaves ?? project.saves ?? 0}</span>
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
            <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-6 rounded-xl mt-4">
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
                  onClick={() => {
                    if (!user) {
                      toast.error('Login Required', { description: 'You must be logged in to report a listing.' })
                      return
                    }
                    setIsReportModalOpen(true)
                  }}
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
        projectIcon={project.icon_url}
        projectName={project.name}
      />

      <Suspense fallback={null}>
        <GalleryModal
          isOpen={isGalleryModalOpen}
          onClose={() => setIsGalleryModalOpen(false)}
          images={project?.gallery || []}
          initialIndex={activeImageIndex}
        />
      </Suspense>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        isSubmitting={reportMutation.isPending}
        title="Report Project"
        placeholder="Why do you want to report this project? Please provide details..."
      />
    </AnimatedPage>
  )
}
