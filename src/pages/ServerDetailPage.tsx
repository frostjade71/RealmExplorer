import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useServer, useUserVoteStatus, useServerRatings, useEntityBadges, useServerStaff, useLiveServerStatus, useTopVoters, useRecentVoters, useServerRank, useServerPlayerHistory, useServerSaves } from '../hooks/queries'
import { useVoteMutation, useSubmitRatingMutation, useSubmitReportMutation, useDeleteRatingMutation, useToggleServerSaveMutation } from '../hooks/mutations'
import { LoadingSpinner, EmptyState, TopLoadingBar } from '../components/FeedbackStates'
import { CategoryBadge } from '../components/CategoryBadge'
import { Globe, Copy, CheckCircle, ArrowUpSquare, Star, ExternalLink, Calendar, Clock, Flag, Mail, ChevronLeft, ChevronRight, Activity, Users, Trophy, Gift, Info, RefreshCw, Share2, FileText, TrendingUp, Crown, Eye, Bookmark, MoreVertical } from 'lucide-react'
import { formatDistanceToNow, format, subDays } from 'date-fns'
import { SiDiscord, SiTiktok, SiInstagram, SiYoutube, SiFacebook, SiTwitch } from 'react-icons/si'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
} from 'chart.js'
import type { ScriptableContext } from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)
import { VoteTimer } from '../components/VoteTimer'
import { RatingModal } from '../components/RatingModal'
import { ReportModal } from '../components/ReportModal'
import { RichText } from '../components/RichText'
import { toast } from 'sonner'
import { useIsMobile } from '../hooks/useMediaQuery'

// Type Icons
import serverTypeIcon from '../assets/category/gif/6128-minecraft.gif'
import realmTypeIcon from '../assets/category/gif/9677-minecraftnetherportalblock (2).gif'

// Frames
const goldFrame = '/upgrades/golden-avatar.png'
const goldIngot = '/upgrades/9515-mc-gold-ingot.png'
const goldenBg = '/upgrades/golden-bg.webp'

import { MetaTags } from '../components/MetaTags'

export function ServerDetailPage() {
  const isMobile = useIsMobile()
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const { data, isLoading: loading, refetch: refetchServer } = useServer(slug)
  const server = data?.server
  const owner = data?.owner
  const isPremium = owner?.role === 'explorer+'

  // Canonical URL redirect: if accessed via UUID, redirect to Slug
  useEffect(() => {
    if (server && server.slug && slug === server.id) {
       navigate(`/server/${server.slug}`, { replace: true })
    }
  }, [server, slug, navigate])

  const { data: voteStatus, isLoading: checkingVote, refetch: refetchVoteStatus } = useUserVoteStatus(user?.id, server?.id)
  const { data: ratings } = useServerRatings(server?.id)
  const { data: badges = [] } = useEntityBadges(server?.id, 'server')
  const { data: staff = [] } = useServerStaff(server?.id)
  const { data: liveStatus } = useLiveServerStatus(server)
  const { data: topVoters = [] } = useTopVoters(server?.id)
  const { data: recentVoters = [] } = useRecentVoters(server?.id)
  const { data: currentRank } = useServerRank(server?.id)
  const { data: playerHistory = [] } = useServerPlayerHistory(server?.id)
  const { data: serverSaves } = useServerSaves(server?.id, user?.id)

  const isSaved = serverSaves?.hasSaved ?? false
  const toggleSaveMutation = useToggleServerSaveMutation()
  const [isSavingLocal, setIsSavingLocal] = useState(false)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)

  const voteMutation = useVoteMutation()
  const ratingMutation = useSubmitRatingMutation()
  const deleteRatingMutation = useDeleteRatingMutation()
  
  const [copied, setCopied] = useState(false)
  const [bedrockCopied, setBedrockCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [mcUsername, setMcUsername] = useState('')
  const [debouncedMcUsername, setDebouncedMcUsername] = useState('')
  const [viewMode, setViewMode] = useState<'overview' | 'voting'>('overview')
  const [activeIpType, setActiveIpType] = useState<'java' | 'bedrock'>('java')
  const [shareCopied, setShareCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: server?.name || 'RealmExplorer',
          text: `Check out ${server?.name} on RealmExplorer!`,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled or share failed, do nothing
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      setShareCopied(true)
      toast.success('Link Copied', { description: 'Server link copied to clipboard!' })
      setTimeout(() => setShareCopied(false), 2000)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedMcUsername(mcUsername), 500)
    return () => clearTimeout(timer)
  }, [mcUsername])

  const [[activeImageIndex, direction], setDirectionalIndex] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    if (!gallery.length) return;
    const nextIndex =
      (activeImageIndex + newDirection + gallery.length) % gallery.length;
    setDirectionalIndex([nextIndex, newDirection]);
  };

  const goToImage = (index: number) => {
    const newDirection = index > activeImageIndex ? 1 : -1;
    setDirectionalIndex([index, newDirection]);
  };

  const variants = {
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

  const gallery = server?.gallery || []
  // A user has voted if they have a record in the DB OR if they just successfully clicked the button
  const alreadyVoted = voteStatus?.hasVoted || voteMutation.isSuccess
  const isApproved = server?.status === 'approved'

  const playerChartData = useMemo(() => {
    if (!liveStatus?.players && playerHistory.length === 0) return null;
    
    const labels: string[] = [];
    const dataPoints: number[] = [];
    
    for (let i = 7; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateString = format(date, 'yyyy-MM-dd');
      
      labels.push(format(date, 'MMM dd'));
      
      const historyRecord = playerHistory.find(h => h.record_date === dateString);
      let count = historyRecord ? historyRecord.max_players : 0;
      
      if (i === 0 && liveStatus?.players) {
        count = Math.max(count, liveStatus.players.online);
      }
      
      dataPoints.push(count);
    }

    return {
      labels,
      datasets: [
        {
          fill: true,
          label: 'Players',
          data: dataPoints,
          borderColor: '#4EC44E',
          backgroundColor: (context: ScriptableContext<'line'>) => {
            const ctx = context.chart.ctx
            const gradient = ctx.createLinearGradient(0, 0, 0, 80)
            gradient.addColorStop(0, 'rgba(78, 196, 78, 0.3)')
            gradient.addColorStop(1, 'rgba(78, 196, 78, 0)')
            return gradient
          },
          borderWidth: 2,
          pointBackgroundColor: '#4EC44E',
          pointBorderColor: '#fff',
          pointHoverRadius: 4,
          pointRadius: 0, 
          tension: 0.4,
        }
      ]
    }
  }, [liveStatus?.players, playerHistory]);

  const playerChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(24, 24, 27, 0.9)',
        titleFont: { family: 'Inter', size: 10, weight: 'bold' as const },
        bodyFont: { family: 'Inter', size: 11 },
        padding: 8,
        cornerRadius: 6,
        displayColors: false,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }
    },
    scales: {
      x: { display: false },
      y: { display: false, min: 0 }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }

  const statusInfo = server ? ((({
    approved: { label: 'Active', bg: 'bg-realm-green/10', text: 'text-realm-green' },
    pending: { label: 'Pending', bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
    rejected: { label: 'Rejected', bg: 'bg-red-500/10', text: 'text-red-500' }
  } as Record<string, { label: string; bg: string; text: string }>)[server.status]) || { label: server.status, bg: 'bg-zinc-800', text: 'text-zinc-400' }) : null

  const handleCopyIp = () => {
    if (server?.ip_or_code) {
      const fullIp = server.port && server.port !== 25565 
        ? `${server.ip_or_code}:${server.port}` 
        : server.ip_or_code
      navigator.clipboard.writeText(fullIp)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyBedrockIp = () => {
    if (server?.bedrock_ip) {
      const fullIp = server.bedrock_port && server.bedrock_port !== 19132
        ? `${server.bedrock_ip}:${server.bedrock_port}` 
        : server.bedrock_ip
      navigator.clipboard.writeText(fullIp)
      setBedrockCopied(true)
      setTimeout(() => setBedrockCopied(false), 2000)
    }
  }

  const handleVote = () => {
    if (!user || !server || alreadyVoted || voteMutation.isPending || mcUsername.length < 3) {
      if (mcUsername.length < 3 && user) setError("Please enter a valid Minecraft username.");
      return;
    }
    setError(null)
    voteMutation.mutate(
      { userId: user.id, serverId: server.id, mcUsername },
      {
        onSuccess: () => {
          refetchServer()
          refetchVoteStatus()
        },
        onError: (err: any) => {
          if (err.message === 'Already voted') {
            // This case should be mostly prevented by alreadyVoted check, but safety first
            setError("You've already voted for this server.")
          } else {
            setError("Submission failed. Please try again.")
          }
        }
      }
    )
  }

  const handleRatingSubmit = (rating: number, comment: string) => {
    if (!user || !server) return
    ratingMutation.mutate(
      { userId: user.id, serverId: server.id, rating, comment },
      {
        onSuccess: () => {
          setIsRatingModalOpen(false)
          refetchServer()
        },
        onError: () => {
          setError("Failed to submit rating. Please try again.")
        }
      }
    )
  }

  const handleRatingDelete = () => {
    if (!user || !server) return
    deleteRatingMutation.mutate(
      { userId: user.id, serverId: server.id },
      {
        onSuccess: () => {
          setIsRatingModalOpen(false)
          refetchServer()
          toast.success('Rating Removed', {
            icon: <Star className="w-4 h-4 text-realm-green" />
          })
        },
        onError: () => {
          setError("Failed to remove rating. Please try again.")
        }
      }
    )
  }

  const reportMutation = useSubmitReportMutation()

  const handleReportSubmit = (subject: string, message: string) => {
    if (!user || !server) return
    reportMutation.mutate(
      { reporter_id: user.id, server_id: server.id, subject, message },
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

  const handleToggleSave = () => {
    if (!server?.id) return
    if (!user) {
      toast.error('Please log in to save servers')
      return
    }
    setIsSavingLocal(true)
    toggleSaveMutation.mutate({
      serverId: server.id,
      userId: user.id,
      isSaving: !isSaved
    }, {
      onSuccess: () => {
        if (!isSaved) toast.success('Server Saved')
        else toast('Server Unsaved', { icon: <Bookmark className="w-4 h-4 text-zinc-400" /> })
      },
      onSettled: () => {
        setTimeout(() => setIsSavingLocal(false), 1500)
      }
    })
  }

  const metaDescription = server?.description 
    ? server.description.substring(0, 160).replace(/[#*`]/g, '') + '...' 
    : server ? `Join ${server.name} on Realm Explorer. Explore ${server.category} Minecraft servers and realms.` : "View server details on Realm Explorer.";

  return (
    <>
    <MetaTags 
      title={server?.name}
      description={metaDescription}
      image={server?.banner_url || server?.icon_url || undefined}
      url={`/server/${server?.slug || slug || ''}`}
      type="website"
    />

    <TopLoadingBar isVisible={toggleSaveMutation.isPending || isSavingLocal} colorClass="via-[#4EC44E]" />

    {loading && <LoadingSpinner />}
    {!loading && !server && <EmptyState title="Not Found" message="This server or realm does not exist or was removed." />}
    
    {!loading && server && (
      <>
    {/* Premium Background */}
    {isPremium && (
      <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.07] mix-blend-luminosity scale-110"
          style={{ 
            backgroundImage: `url(${goldenBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>
    )}

    <AnimatedPage className="max-w-5xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
      {/* Banner */}
      <FramerIn delay={0.1} className={`w-full h-32 md:h-64 bg-zinc-950 rounded-t-lg overflow-hidden relative ${isPremium ? 'border-t-2 border-x-2 border-[#f2a929]' : 'border-t border-x border-zinc-800'}`}>
        {server.banner_url ? (
           <motion.img 
            initial={isMobile ? { opacity: 0.8 } : { scale: 1.1, opacity: 0 }}
            animate={isMobile ? { opacity: 0.8 } : { scale: 1, opacity: 0.8 }}
            transition={{ duration: 0.8 }}
            src={server.banner_url} alt="Banner" className="w-full h-full object-cover will-change-[opacity,transform]" 
            fetchPriority="high"
           />
        ) : (
           <div className="w-full h-full pixel-grid opacity-20"></div>
        )}
      </FramerIn>

      {/* Header Info */}
      <FramerIn delay={0.2} className={`bg-zinc-950 rounded-b-lg p-5 md:p-8 mb-4 md:mb-4 flex flex-col md:flex-row gap-4 md:gap-6 items-start relative z-30 -mt-4 will-change-transform ${isPremium ? 'border-x-2 border-b-2 border-[#f2a929]' : 'border-x border-b border-zinc-800 shadow-xl'}`}>
        <div className="relative -mt-10 md:-mt-12 z-10 flex-shrink-0">
          <div className={`w-20 h-20 md:w-24 md:h-24 bg-zinc-900 rounded-md overflow-hidden border-4 ${isPremium ? 'border-transparent' : 'border-zinc-950'} shadow-lg will-change-transform relative z-10`}>
            {server.icon_url ? (
              <img src={server.icon_url} alt="Icon" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 font-pixel text-lg md:text-xl">
                {server.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          {isPremium && (
            <img 
              src={goldFrame} 
              alt="Frame" 
              className="absolute -top-[12%] -left-[12%] w-[124%] h-[124%] object-contain pointer-events-none z-20 max-w-none" 
            />
          )}
        </div>
        
        <div className="flex-1 w-full pt-1 md:pt-2">

          <div className="flex flex-col md:flex-row justify-between items-start gap-2 md:gap-4">
            <div className="min-w-0 md:flex-1 w-full md:w-auto">
              <h1 className="text-lg md:text-2xl font-pixel text-white mb-2 md:mb-3 break-words whitespace-normal leading-tight">{server.name}</h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-4">
                {!isApproved && statusInfo && (
                  <span className={`px-2 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider rounded border border-current/10 ${statusInfo.bg} ${statusInfo.text}`}>
                    {statusInfo.label}
                  </span>
                )}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-headline font-bold uppercase tracking-wider w-fit bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                  <img src={server.type === 'server' ? serverTypeIcon : realmTypeIcon} alt="" className="w-3 md:w-3.5 h-3 md:h-3.5 object-contain rounded-sm" />
                  <span>{server.type === 'server' ? 'Server' : 'Realm'}</span>
                </div>
                <CategoryBadge category={server.category} />
              </div>
              
            <div className="flex flex-wrap items-end gap-2 md:gap-3 mt-1 md:mt-2">
              {/* Server IP */}
              {server.type === 'server' && ((server.ip_or_code && server.ip_or_code !== 'None') || server.bedrock_ip) && (
                <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 sm:flex-none">
                  <div className="text-[8px] md:text-[9px] font-bold text-zinc-600 uppercase tracking-widest ml-1">
                    {((activeIpType === 'java' && server.ip_or_code && server.ip_or_code !== 'None') || !server.bedrock_ip) ? 'Java IP' : 'Bedrock IP'}
                  </div>
                  <motion.button 
                    onClick={((activeIpType === 'java' && server.ip_or_code && server.ip_or_code !== 'None') || !server.bedrock_ip) ? handleCopyIp : handleCopyBedrockIp}
                    className={`flex items-center justify-center sm:justify-start gap-2 bg-[#4EC44E] hover:bg-[#5cd45c] text-zinc-950 pl-4 md:pl-5 ${server.ip_or_code && server.ip_or_code !== 'None' && server.bedrock_ip ? 'pr-10 md:pr-12' : 'pr-4 md:pr-5'} py-2 md:py-2.5 rounded-md font-headline font-bold text-xs md:text-sm border-b-[4px] border-[#3da53d] active:border-b-0 active:border-t-[4px] active:border-t-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] w-full transition-colors relative group/ip`}
                  >
                    {((activeIpType === 'java' && server.ip_or_code && server.ip_or_code !== 'None') || !server.bedrock_ip) ? (
                      <>
                        {copied ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                            <CheckCircle className="w-4 h-4 text-zinc-950" />
                          </motion.div>
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span>{server.ip_or_code}</span>
                        {server.port && server.port !== 25565 && <span className="text-zinc-700">:{server.port}</span>}
                      </>
                    ) : (
                      <>
                        {bedrockCopied ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                            <CheckCircle className="w-4 h-4 text-zinc-950" />
                          </motion.div>
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span>{server.bedrock_ip}</span>
                        {server.bedrock_port && server.bedrock_port !== 19132 && <span className="text-zinc-700">:{server.bedrock_port}</span>}
                      </>
                    )}

                    {/* Toggle Button if hybrid */}
                    {server.ip_or_code && server.ip_or_code !== 'None' && server.bedrock_ip && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveIpType(prev => prev === 'java' ? 'bedrock' : 'java');
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center p-1.5 md:p-2 hover:bg-black/10 rounded-md transition-colors"
                        title={`Switch to ${activeIpType === 'java' ? 'Bedrock' : 'Java'} IP`}
                      >
                        <motion.div animate={{ rotate: activeIpType === 'bedrock' ? 180 : 0 }} transition={{ duration: 0.3 }}>
                          <RefreshCw className="w-4 h-4 md:w-5 md:h-5 text-zinc-800" />
                        </motion.div>
                      </div>
                    )}
                  </motion.button>
                </div>
              )}

              {/* Realm Button */}
              {server.type === 'realm' && (
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                   <div className="text-[8px] md:text-[9px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Join Realm</div>
                    <motion.a 
                    href={server.verify_discord ? (server.website_url ?? undefined) : (server.ip_or_code?.startsWith('http') ? server.ip_or_code : `https://realms.gg/${server.ip_or_code}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#4EC44E] hover:bg-[#5cd45c] text-zinc-950 px-4 md:px-5 py-2 md:py-2.5 rounded-md font-headline font-bold text-xs md:text-sm border-b-[4px] border-[#3da53d] active:border-b-0 active:border-t-[4px] active:border-t-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] w-full transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {server.verify_discord ? 'Verify on Discord' : 'Connect'}
                  </motion.a>
                </div>
              )}
              
              <div className="flex gap-2 w-full sm:w-auto pt-1 sm:pt-0">
                {/* Discord Link (Repurposed website_url) */}
                {server.website_url && (
                  <a 
                    href={server.website_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-1 sm:flex-none flex items-center justify-center p-2 bg-zinc-900 border border-zinc-800 rounded-md text-[#5865F2] hover:border-[#5865F2]/40 transition-all shadow-sm"
                    title="Discord Invite"
                  >
                    <SiDiscord className="w-4 h-4 md:w-5 h-5" />
                  </a>
                )}

                {/* Curated Social Links */}
                {server.social_links && server.social_links.map((link, idx) => {
                  const icons: Record<string, React.ReactNode> = {
                    website: <Globe className="w-4 h-4 md:w-5 h-5" />,
                    instagram: <SiInstagram className="w-4 h-4 md:w-5 h-5" />,
                    youtube: <SiYoutube className="w-4 h-4 md:w-5 h-5" />,
                    tiktok: <SiTiktok className="w-4 h-4 md:w-5 h-5" />,
                    facebook: <SiFacebook className="w-4 h-4 md:w-5 h-5" />,
                    twitch: <SiTwitch className="w-4 h-4 md:w-5 h-5" />,
                    discord: <SiDiscord className="w-4 h-4 md:w-5 h-5" />,
                    email: <Mail className="w-4 h-4 md:w-5 h-5" />
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
                      className={`flex-1 sm:flex-none flex items-center justify-center p-2 bg-zinc-900 border border-zinc-800 rounded-md ${theme.text} ${theme.border} transition-all shadow-sm`}
                      title={link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                    >
                      {icons[link.platform] || <Globe className="w-4 h-4 md:w-5 h-5" />}
                    </a>
                  )
                })}
              </div>
            </div>
              {/* Badges moved to their own section below */}
            </div>

            <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto mt-0 md:mt-0">
              <div className="flex items-center gap-1.5 w-full md:w-auto justify-center md:justify-end">
                {/* Desktop Badges (Removed to give it its own section) */}

                {user ? (
                  viewMode === 'voting' ? (
                    <div className="flex flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setViewMode('overview')} 
                        className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white font-headline font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-zinc-800 hover:text-realm-green transition-colors flex items-center justify-center gap-1.5 h-8 md:h-9 shadow-md"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Server
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
                      {/* Vote Title & Tooltip */}
                      <div className="flex items-center gap-2 mb-2 ml-1">
                        <span className="material-symbols-outlined text-sm text-realm-green">how_to_vote</span>
                        <span className="text-[10px] md:text-[11px] font-headline font-bold text-white uppercase tracking-widest">Vote for Server</span>
                        <div className="group relative">
                          <Info className="w-3.5 h-3.5 text-zinc-500 hover:text-white transition-colors cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 md:w-72 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            <div className="bg-zinc-950/95 border border-zinc-800 rounded-lg p-4 backdrop-blur-xl shadow-2xl">
                              <p className="text-xs md:text-[13px] text-zinc-300 font-headline leading-relaxed text-center">
                                Support <strong className="text-white font-bold">{server.name}</strong> by casting your vote! You can vote for up to 5 servers per day, and each vote helps boost the server's ranking on our list. It will also earn you in-game rewards!
                              </p>
                            </div>
                            <div className="w-2 h-2 bg-zinc-950 border-r border-b border-zinc-800 rotate-45 mx-auto -mt-1 relative z-10" />
                          </div>
                        </div>
                      </div>

                      {/* Line 1: Player Head & Input */}
                      <div className="relative w-full">
                        <img 
                          src={`https://minotar.net/helm/${debouncedMcUsername || 'MHF_Steve'}/100.png`} 
                          alt="Minecraft Head" 
                          className="absolute left-1 top-1 w-8 h-8 md:w-9 md:h-9 rounded bg-zinc-900 border border-zinc-800 object-contain shadow-md z-10"
                        />
                        <input 
                          type="text" 
                          placeholder="Enter Minecraft Username"
                          value={mcUsername}
                          onChange={(e) => setMcUsername(e.target.value)}
                          disabled={alreadyVoted || voteMutation.isPending || checkingVote || !isApproved}
                          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md pl-11 md:pl-12 pr-3 h-10 md:h-11 text-xs md:text-sm font-headline text-white placeholder:text-zinc-600 focus:outline-none focus:border-realm-green/50 transition-colors relative"
                        />
                      </div>
                      {/* Line 2: Buttons */}
                      <div className="flex items-stretch gap-1 w-full">
                        <motion.button 
                          whileHover={isApproved && !alreadyVoted && mcUsername.length > 2 ? { scale: 1.02 } : {}}
                          whileTap={isApproved && !alreadyVoted && mcUsername.length > 2 ? { scale: 0.98 } : {}}
                          onClick={handleVote}
                          disabled={alreadyVoted || voteMutation.isPending || checkingVote || !isApproved || mcUsername.length < 3}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-l-md font-headline font-bold transition-colors shadow-lg text-[10px] md:text-xs ${
                            !isApproved ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-800 opacity-50' :
                            alreadyVoted ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' : 
                            mcUsername.length < 3 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' :
                            'bg-[#4EC44E] text-zinc-950 hover:bg-[#85fc7e]'
                          }`}
                        >
                          <ArrowUpSquare className={`w-3.5 h-3.5 md:w-4 md:h-4 ${alreadyVoted || !isApproved || mcUsername.length < 3 ? 'text-zinc-600' : ''}`} />
                          <span className="truncate flex items-center gap-1.5 leading-tight">
                            {voteMutation.isPending ? 'Voting...' : !isApproved ? 'Pending' : alreadyVoted ? 'Voted' : 'Submit Vote'}
                            {alreadyVoted && voteStatus?.lastVoteTime && (
                              <VoteTimer 
                                lastVoteTime={voteStatus.lastVoteTime} 
                                variant="hidden"
                                onFinish={() => {
                                    refetchVoteStatus()
                                    refetchServer()
                                }}
                              />
                            )}
                          </span>
                        </motion.button>
                        <motion.button 
                          onClick={() => setViewMode('voting')}
                          className="px-3 bg-zinc-900 border-y border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-none font-headline font-bold text-[9px] md:text-[10px] uppercase tracking-widest transition-colors flex-shrink-0 flex items-center gap-1.5 border-r"
                        >
                          <Eye className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          View Votes
                        </motion.button>

                        <div className="relative flex-shrink-0 flex">
                          <motion.button 
                            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                            className="px-3 md:px-4 rounded-r-md border-y border-r transition-colors shadow-lg flex items-center justify-center bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                          >
                            <MoreVertical className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </motion.button>
                          
                          <AnimatePresence>
                            {isOptionsOpen && (
                              <>
                                <div 
                                  className="fixed inset-0 z-40"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setIsOptionsOpen(false)
                                  }}
                                />
                                <motion.div 
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50 py-1"
                                >
                                  <button 
                                    onClick={() => {
                                      setIsOptionsOpen(false)
                                      if (isApproved) setIsRatingModalOpen(true)
                                    }}
                                    disabled={!isApproved}
                                    className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm font-headline text-left transition-colors group ${
                                      !isApproved ? 'text-zinc-600 cursor-not-allowed opacity-50' : 
                                      'text-zinc-300 hover:bg-zinc-800 hover:text-yellow-400'
                                    }`}
                                  >
                                    <Star className={`w-4 h-4 ${isApproved ? 'group-hover:fill-yellow-400 transition-all' : ''}`} />
                                    Rate Server
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setIsOptionsOpen(false)
                                      handleToggleSave()
                                    }}
                                    className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm font-headline text-left transition-colors group ${
                                      isSaved ? 'text-[#4EC44E] hover:bg-zinc-800' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                                    }`}
                                  >
                                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                                    {isSaved ? "Unsave Server" : "Save Server"}
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-[10px] md:text-xs font-headline text-zinc-500 border border-zinc-800 px-3 md:px-4 py-1.5 md:py-2 rounded-md w-full text-center md:w-auto">Login to Vote & Rate</div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-[10px] text-red-500 font-headline uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded border border-red-500/20 w-fit"
            >
              {error}
            </motion.div>
          )}
          
        </div>
      </FramerIn>
      {viewMode === 'overview' ? (
        <>
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4">
        <FramerIn delay={0.3} className="md:col-span-2 w-full space-y-4 md:space-y-4">
          <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-8 rounded-lg">
            <h2 className="font-pixel text-white text-base md:text-lg mb-4 md:mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-realm-green">format_quote</span>
              About
            </h2>
            <div className="text-zinc-300 font-body leading-relaxed text-[13px]">
              {server.description ? (
                <RichText content={server.description} />
              ) : (
                'No description provided.'
              )}
            </div>
          </div>

          {/* Gallery Carousel */}
          {gallery.length > 0 && (
            <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-8 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-pixel text-white text-base md:text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-zinc-400">photo_library</span>
                  Gallery
                </h2>
                <div className="flex gap-1">
                  {gallery.map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === activeImageIndex ? 'bg-realm-green w-4' : 'bg-zinc-800'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="relative aspect-video bg-black rounded-xl overflow-hidden group">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.img
                    key={activeImageIndex}
                    src={gallery[activeImageIndex]}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: isMobile ? { duration: 0.3, ease: "easeOut" } : { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    className="w-full h-full object-cover will-change-transform"
                    alt={`Gallery ${activeImageIndex + 1}`}
                  />
                </AnimatePresence>

                {gallery.length > 1 && (
                  <>
                    <button
                      onClick={() => paginate(-1)}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-realm-green hover:text-zinc-950 hover:border-realm-green shadow-xl ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'}`}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => paginate(1)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-realm-green hover:text-zinc-950 hover:border-realm-green shadow-xl ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'}`}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                <div className={`absolute bottom-4 right-4 px-3 py-1 bg-black/60 border border-white/10 rounded-lg ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'} text-[10px] font-pixel text-white/60`}>
                  {activeImageIndex + 1} / {gallery.length}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3 mt-4">
                {gallery.map((url, i) => (
                  <button 
                    key={i}
                    onClick={() => goToImage(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${i === activeImageIndex ? 'border-realm-green ring-4 ring-realm-green/10' : 'border-zinc-800 hover:border-zinc-700'}`}
                  >
                    <img src={url} alt={`Thumb ${i + 1}`} className={`w-full h-full object-cover ${i === activeImageIndex ? 'opacity-100' : 'opacity-40 hover:opacity-100 transition-opacity'}`} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </FramerIn>
        
        <FramerIn delay={0.4} className="w-full space-y-4 md:space-y-4">
          {/* Live Status Box */}
          {(server.ip_or_code || server.bedrock_ip) && server.type === 'server' && (
            <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-6 rounded-lg">
              <h3 className="font-headline font-bold text-zinc-500 text-sm md:text-base mb-8 pb-4 border-b border-zinc-800/50 flex items-center gap-2 relative z-0">
                <div className="absolute left-0 bottom-0 -top-5 md:-top-6 -right-5 md:-right-6 bg-gradient-to-r from-transparent via-transparent to-realm-green/10 -z-10 rounded-tr-lg" />
                <Activity className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Live Status
              </h3>
              
              {!liveStatus ? (
                <div className="flex items-center gap-3 text-zinc-500 text-xs">
                  <div className="w-2 h-2 rounded-full bg-zinc-700 animate-pulse" />
                  Pinging server...
                </div>
              ) : liveStatus.online ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-white">
                      <div className="w-2.5 h-2.5 rounded-full bg-realm-green animate-pulse shadow-[0_0_8px_rgba(78,196,78,0.6)]" />
                      Online
                    </div>
                    {liveStatus.players && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Users className="w-3.5 h-3.5" />
                        <span className="font-bold text-white">{liveStatus.players.online}</span> / {liveStatus.players.max}
                      </div>
                    )}
                  </div>
                  {liveStatus.version && (
                    <div className="text-[10px] font-headline text-zinc-500 bg-zinc-950/50 px-2 py-1 rounded inline-block border border-zinc-800/50">
                      Version {liveStatus.version}
                    </div>
                  )}
                  {liveStatus.motd?.html && (
                    <div className="text-[10px] sm:text-xs bg-zinc-950 p-2 sm:p-3 rounded-md border border-zinc-800/50 font-pixel leading-relaxed overflow-hidden">
                      {liveStatus.motd.html.map((line, i) => (
                        <div key={i} dangerouslySetInnerHTML={{ __html: line }} />
                      ))}
                    </div>
                  )}

                  {playerChartData && (
                    <div className="pt-2">
                      <div className="text-[9px] font-headline text-zinc-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                        <span>Player Activity</span>
                        <span className="text-emerald-400">Past Week</span>
                      </div>
                      <div className="h-16 w-full opacity-80 hover:opacity-100 transition-opacity">
                        <Line data={playerChartData} options={playerChartOptions} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-white">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    Offline
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-6 rounded-lg">
            <h3 className="font-headline font-bold text-zinc-500 text-sm md:text-base mb-8 pb-4 border-b border-zinc-800/50 flex items-center gap-2 relative z-0">
              <div className="absolute left-0 bottom-0 -top-5 md:-top-6 -right-5 md:-right-6 bg-gradient-to-r from-transparent via-transparent to-realm-green/10 -z-10 rounded-tr-lg" />
              <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Server Information
            </h3>
            <div className="flex flex-col gap-1.5 md:gap-2">
              {currentRank !== undefined && currentRank !== null && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-xs md:text-sm">Current Rank</span>
                  </div>
                  <span className="text-realm-green font-bold text-xs md:text-sm">#{currentRank}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Star className="w-3.5 h-3.5" />
                  <span className="text-xs md:text-sm">Rating</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className={`w-3 h-3 md:w-3.5 md:h-3.5 ${server.average_rating > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} />
                  <span className="text-white font-bold text-xs md:text-sm">
                    {server.average_rating > 0 ? server.average_rating.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-zinc-600 text-[9px] md:text-[10px] font-headline">({server.rating_count})</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="text-xs md:text-sm">Saves</span>
                </div>
                <span className="text-white font-bold text-xs md:text-sm">{serverSaves?.totalSaves ?? server.saves ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <ArrowUpSquare className="w-3.5 h-3.5" />
                  <span className="text-xs md:text-sm">Total Votes</span>
                </div>
                <span className="text-white font-bold text-xs md:text-sm">{server.votes}</span>
              </div>
              
              <div className="pt-3 mt-3 border-t border-zinc-800/50 space-y-2">
                <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-headline uppercase tracking-widest text-zinc-500">
                  <Calendar className="w-2.5 h-2.5" />
                  <span>Published {formatDistanceToNow(new Date(server.created_at))} ago</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-headline uppercase tracking-widest text-zinc-500">
                  <Clock className="w-2.5 h-2.5" />
                  <span>Updated {formatDistanceToNow(new Date(server.last_edited_at))} ago</span>
                </div>
              </div>

              {owner && (
                <Link 
                  to={`/profile/${owner.discord_username}`}
                  className="pt-4 mt-1 border-t border-zinc-800/50 flex items-center gap-3 md:gap-4 -mx-5 md:-mx-6 px-5 md:px-6 group transition-all duration-300"
                >
                  <img src={owner.discord_avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} className={`w-8 h-8 md:w-10 md:h-10 rounded-full border bg-zinc-800 ${isPremium ? 'border-[#f2a929]' : 'border-zinc-700'}`} alt="Owner" />
                  <div className="flex-1">
                    <p className="text-white text-xs md:text-sm leading-tight flex items-center gap-1.5">
                      {owner.discord_username}
                      {isPremium && (
                        <img src={goldIngot} alt="Premium" className="w-3.5 h-3.5 md:w-4 md:h-4 object-contain" />
                      )}
                    </p>
                    <p className={`text-[8px] md:text-[9px] uppercase tracking-widest font-headline mt-0.5 ${
                      isPremium ? 'text-yellow-400' : (server.submitter_role || 'Owner') === 'Owner' ? 'text-yellow-400' : 'text-realm-green'
                    }`}>
                      {server.submitter_role || 'Owner'}
                    </p>
                  </div>
                  <span className="text-[8px] md:text-[9px] uppercase tracking-widest font-headline text-zinc-600 font-bold whitespace-nowrap opacity-40 group-hover:opacity-100 transition-opacity">
                    view profile
                  </span>
                </Link>
              )}

              {staff && staff.length > 0 && (
                <div className="-mt-1.5 space-y-0">
                    {[...staff].sort((a, b) => {
                      const rankOrder = ['Owner', 'Admin', 'Moderator', 'Helper'];
                      const rankA = rankOrder.indexOf(a.role_title);
                      const rankB = rankOrder.indexOf(b.role_title);
                      const weightA = rankA !== -1 ? rankA : 999;
                      const weightB = rankB !== -1 ? rankB : 999;
                      return weightA - weightB;
                    }).map((member) => {
                      const isStaffPremium = member.profiles?.role === 'explorer+'
                      return (
                        <Link 
                          key={member.id}
                          to={`/profile/${member.profiles?.discord_username || ''}`}
                          className="flex items-center gap-3 group transition-all duration-300 p-1.5 rounded-md -mx-1.5"
                        >
                          <img 
                            src={member.profiles?.discord_avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                            className={`w-7 h-7 rounded-full border bg-zinc-800 object-cover ${isStaffPremium ? 'border-[#f2a929]' : 'border-zinc-700'}`} 
                            alt={member.profiles?.discord_username || 'Staff member'} 
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs leading-tight truncate flex items-center gap-1">
                              {member.profiles?.discord_username || 'Unknown User'}
                              {isStaffPremium && (
                                <img src={goldIngot} alt="Premium" className="w-3.5 h-3.5 object-contain" />
                              )}
                            </p>
                            <p className="text-[8px] uppercase tracking-widest font-headline mt-0.5 text-zinc-500">
                              {member.role_title}
                            </p>
                          </div>
                          <span className="text-[8px] uppercase tracking-widest font-headline text-zinc-600 font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            view profile
                          </span>
                        </Link>
                      )
                    })}
                  </div>
              )}
            </div>
          </div>

          {/* Badges Section */}
          {badges.length > 0 && (
            <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-6 rounded-lg mt-4">
              <h3 className="font-headline font-bold text-zinc-500 text-sm md:text-base mb-4 pb-4 border-b border-zinc-800/50 flex items-center gap-2 relative z-0">
                <div className="absolute left-0 bottom-0 -top-5 md:-top-6 -right-5 md:-right-6 bg-gradient-to-r from-transparent via-transparent to-realm-green/10 -z-10 rounded-tr-lg" />
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">workspace_premium</span>
                Badges
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                {badges.map((badge) => (
                  <div 
                    key={`${badge.id}-${badge.month}`} 
                    className="group relative cursor-help"
                  >
                    <img 
                      src={badge.image_url.startsWith('http') ? badge.image_url : (badge.image_url.includes('/') ? `/${badge.image_url}` : `/badges/${badge.image_url}`)} 
                      alt={badge.name} 
                      className="w-7 h-7 md:w-9 md:h-9 object-contain drop-shadow-md hover:scale-110 transition-transform"
                    />
                    
                    {/* Premium Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 translate-y-2 group-hover:translate-y-0">
                      <div className="bg-zinc-950/90 border border-white/10 rounded-xl p-3 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-realm-green/50 to-transparent" />
                        <p className="text-[10px] font-pixel text-realm-green uppercase mb-1.5 tracking-tighter text-center">
                          {badge.name}
                          {badge.month && <span className="text-white/40 ml-1">({badge.month})</span>}
                        </p>
                        <p className="text-[10px] text-white/70 font-headline leading-tight italic text-center">"{badge.description}"</p>
                      </div>
                      <div className="w-2 h-2 bg-zinc-950 border-r border-b border-white/10 rotate-45 mx-auto -mt-1 relative z-10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-6 rounded-lg mt-4">
            <h3 className="font-headline font-bold text-zinc-500 text-sm md:text-base mb-8 pb-4 border-b border-zinc-800/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] md:text-[18px]">bolt</span>
              Server Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleShare}
                className="w-full bg-zinc-900/80 border border-zinc-800 p-3 rounded-lg flex items-center justify-center gap-2 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all group"
              >
                {shareCopied ? <CheckCircle className="w-4 h-4 text-realm-green" /> : <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" />}
                <span className="font-headline font-bold uppercase tracking-widest text-[10px]">Share</span>
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  if (!user) {
                    toast.error('Login Required', { description: 'You must be logged in to report a listing.' })
                    return
                  }
                  setIsReportModalOpen(true)
                }}
                className="w-full bg-zinc-900/80 border border-zinc-800 p-3 rounded-lg flex items-center justify-center gap-2 text-zinc-500 hover:text-red-400 hover:border-red-500/40 transition-all group"
              >
                <Flag className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="font-headline font-bold uppercase tracking-widest text-[10px]">Report</span>
              </motion.button>
            </div>
          </div>
        </FramerIn>
      </div>

      {/* Ratings Section */}
      <FramerIn delay={0.5} className="w-full mt-4 md:mt-4">
        <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-8 rounded-lg">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="font-pixel text-white text-base md:text-lg">Ratings</h2>
            <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-sm font-headline text-zinc-500 uppercase tracking-widest">
              <span>{server.rating_count} Reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {ratings && ratings.length > 0 ? (
              ratings.map((rating) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  key={rating.id} 
                  className="bg-zinc-950 border border-zinc-800 p-5 md:p-6 rounded-md space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <Link 
                      to={`/profile/${rating.profiles?.discord_username}`}
                      className="flex items-center gap-3 group/reviewer"
                    >
                      <img 
                        src={rating.profiles?.discord_avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-zinc-800 bg-zinc-900 group-hover/reviewer:border-realm-green/30 transition-colors" 
                        alt="User" 
                      />
                      <div>
                        <p className="text-zinc-200 font-bold text-xs md:text-sm leading-none group-hover/reviewer:text-realm-green transition-colors">{rating.profiles?.discord_username || 'Anonymous'}</p>
                        <p className="text-[9px] text-zinc-600 font-headline uppercase mt-1">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={`w-2.5 h-2.5 md:w-3 md:h-3 ${s <= rating.rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-800'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  {rating.comment && (
                    <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-body italic">" {rating.comment} "</p>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="md:col-span-2 py-8 md:py-12 text-center">
                <p className="text-zinc-500 font-headline text-[10px] md:text-sm uppercase tracking-widest">No reviews yet. Be the first to rate!</p>
              </div>
            )}
          </div>
        </div>
      </FramerIn>
        </>
      ) : (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
          {/* Column 1: Cast Vote & Benefits */}
          <FramerIn delay={0.3} className="space-y-4">
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg">
              <h2 className="font-pixel text-white text-base mb-6 flex items-center gap-2">
                <Gift className="w-5 h-5 text-realm-green" /> Cast Your Vote
              </h2>
              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-md border border-zinc-800/50 shadow-inner">
                    <img 
                      src={`https://minotar.net/helm/${debouncedMcUsername || 'MHF_Steve'}/100.png`} 
                      alt="Minecraft Head" 
                      className="w-12 h-12 rounded-md bg-zinc-900 border border-zinc-700 object-contain shadow-md"
                    />
                    <input 
                      type="text" 
                      placeholder="Minecraft Username"
                      value={mcUsername}
                      onChange={(e) => setMcUsername(e.target.value)}
                      disabled={alreadyVoted || voteMutation.isPending || checkingVote || !isApproved}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-4 h-12 text-sm font-headline text-white placeholder:text-zinc-500 focus:outline-none focus:border-realm-green/50 transition-colors shadow-sm"
                    />
                  </div>
                  <motion.button 
                    whileHover={isApproved && !alreadyVoted && mcUsername.length > 2 ? { scale: 1.02 } : {}}
                    whileTap={isApproved && !alreadyVoted && mcUsername.length > 2 ? { scale: 0.98 } : {}}
                    onClick={handleVote}
                    disabled={alreadyVoted || voteMutation.isPending || checkingVote || !isApproved || mcUsername.length < 3}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-md font-headline font-bold transition-colors shadow-lg text-sm ${
                      !isApproved ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-800' :
                      alreadyVoted ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' : 
                      mcUsername.length < 3 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' :
                      'bg-[#4EC44E] text-zinc-950 hover:bg-[#85fc7e]'
                    }`}
                  >
                    <ArrowUpSquare className={`w-4 h-4 ${alreadyVoted || !isApproved || mcUsername.length < 3 ? 'text-zinc-600' : ''}`} />
                    <span className="flex items-center gap-1.5">
                      {voteMutation.isPending ? 'Voting...' : !isApproved ? 'Pending' : alreadyVoted ? 'Voted' : 'Submit Vote'}
                      {alreadyVoted && voteStatus?.lastVoteTime && (
                        <VoteTimer 
                          lastVoteTime={voteStatus.lastVoteTime} 
                          variant="compact"
                          onFinish={() => {
                              refetchVoteStatus()
                              refetchServer()
                          }}
                        />
                      )}
                    </span>
                  </motion.button>
                </div>
              ) : (
                <div className="text-sm font-headline text-zinc-500 border border-zinc-800 p-6 rounded-md text-center bg-zinc-950/30">
                  Please log in to vote.
                </div>
              )}

              <div className="mt-8 border-t border-zinc-800/50 pt-6">
                <h3 className="font-headline font-bold text-xs text-zinc-500 uppercase tracking-widest mb-4">Voting Benefits</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2.5 text-xs text-zinc-300 font-body leading-relaxed">
                    <Activity className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    Help this server climb the global rankings.
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-zinc-300 font-body leading-relaxed">
                    <Users className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                    Support the server community and attract new players.
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-zinc-300 font-body leading-relaxed">
                    <Gift className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                    Receive special in-game rewards instantly via NuVotifier (V2).
                  </li>
                </ul>
              </div>
            </div>
          </FramerIn>

          {/* Column 2: Top & Recent Voters */}
          <FramerIn delay={0.4} className="space-y-6 h-full">
            {/* Top Voters */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg">
              <h2 className="font-pixel text-white text-base mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-realm-green" /> Top Voters
              </h2>
              <div className="space-y-2">
                {topVoters.length > 0 ? (
                  topVoters.map((voter, index) => {
                    const rank = index + 1;
                    return (
                      <div key={rank} className="flex items-center justify-between bg-zinc-950 border border-zinc-800/50 p-2.5 rounded-md hover:border-zinc-700 transition-colors shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 text-center font-pixel text-xs ${rank === 1 ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' : rank === 2 ? 'text-zinc-300' : rank === 3 ? 'text-amber-600' : 'text-zinc-600'}`}>
                            #{rank}
                          </div>
                          <img src={`https://minotar.net/helm/${voter.minecraft_username}/100.png`} className="w-6 h-6 rounded-sm bg-zinc-900 border border-zinc-800" alt={voter.minecraft_username} />
                          <div className="flex flex-col">
                            <span className="font-headline font-bold text-zinc-200 text-xs">{voter.minecraft_username}</span>
                            <span className="font-headline text-[9px] text-zinc-500 uppercase tracking-widest">{voter.vote_count} {voter.vote_count === 1 ? 'Vote' : 'Votes'}</span>
                          </div>
                        </div>
                        {rank === 1 && (
                          <div className="text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)] mr-1">
                            <Crown className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-sm font-headline text-zinc-500 border border-zinc-800 p-6 rounded-md text-center bg-zinc-950/30">
                    No votes recorded yet. Be the first!
                  </div>
                )}
              </div>
            </div>

            {/* Recent Votes */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg">
              <h2 className="font-pixel text-white text-base mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-realm-green" /> Recent Votes
              </h2>
              <div className="space-y-2">
                {recentVoters.length > 0 ? (
                  recentVoters.map((voter, index) => (
                    <div key={index} className="flex items-center justify-between bg-zinc-950 border border-zinc-800/50 p-2.5 rounded-md hover:border-zinc-700 transition-colors shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <img src={`https://minotar.net/helm/${voter.minecraft_username}/100.png`} className="w-6 h-6 rounded-sm bg-zinc-900 border border-zinc-800" alt={voter.minecraft_username} />
                        <span className="font-headline font-bold text-zinc-200 text-xs">{voter.minecraft_username}</span>
                      </div>
                      <div className="font-headline text-[9px] text-zinc-500 uppercase tracking-widest text-right">
                        {formatDistanceToNow(new Date(voter.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm font-headline text-zinc-500 border border-zinc-800 p-6 rounded-md text-center bg-zinc-950/30">
                    No recent votes.
                  </div>
                )}
              </div>
            </div>
          </FramerIn>

        </div>
      )}

    </AnimatedPage>

      <RatingModal 
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        onRemove={handleRatingDelete}
        isSubmitting={ratingMutation.isPending}
        isRemoving={deleteRatingMutation.isPending}
        initialRating={ratings?.find((r: any) => r.user_id === user?.id)?.rating}
        initialComment={ratings?.find((r: any) => r.user_id === user?.id)?.comment || ''}
      />

      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        isSubmitting={reportMutation.isPending}
      />
    </>
    )}
    </>
  )
}
