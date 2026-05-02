import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useServer, useUserVoteStatus, useServerRatings, useEntityBadges } from '../hooks/queries'
import { useVoteMutation, useSubmitRatingMutation, useSubmitReportMutation, useDeleteRatingMutation } from '../hooks/mutations'
import { LoadingSpinner, EmptyState } from '../components/FeedbackStates'
import { CategoryBadge } from '../components/CategoryBadge'
import { Globe, Copy, CheckCircle, ArrowUpSquare, Star, ExternalLink, Calendar, Clock, Flag, Mail, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { SiDiscord, SiTiktok, SiInstagram, SiYoutube, SiFacebook, SiTwitch } from 'react-icons/si'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion, AnimatePresence } from 'framer-motion'
import { VoteTimer } from '../components/VoteTimer'
import { RatingModal } from '../components/RatingModal'
import { ReportModal } from '../components/ReportModal'
import { RichText } from '../components/RichText'
import { toast } from 'sonner'
import { useIsMobile } from '../hooks/useMediaQuery'

// Type Icons
import serverTypeIcon from '../assets/category/gif/6128-minecraft.gif'
import realmTypeIcon from '../assets/category/gif/9677-minecraftnetherportalblock (2).gif'

import { MetaTags } from '../components/MetaTags'

export function ServerDetailPage() {
  const isMobile = useIsMobile()
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const { data, isLoading: loading, refetch: refetchServer } = useServer(slug)
  const server = data?.server
  const owner = data?.owner

  // Canonical URL redirect: if accessed via UUID, redirect to Slug
  useEffect(() => {
    if (server && server.slug && slug === server.id) {
       navigate(`/server/${server.slug}`, { replace: true })
    }
  }, [server, slug, navigate])

  const { data: voteStatus, isLoading: checkingVote, refetch: refetchVoteStatus } = useUserVoteStatus(user?.id, server?.id)
  const { data: ratings } = useServerRatings(server?.id)
  const { data: badges = [] } = useEntityBadges(server?.id, 'server')

  const voteMutation = useVoteMutation()
  const ratingMutation = useSubmitRatingMutation()
  const deleteRatingMutation = useDeleteRatingMutation()
  
  const [copied, setCopied] = useState(false)
  const [bedrockCopied, setBedrockCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
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

  const statusInfo = server ? ((({
    approved: { label: 'Active', bg: 'bg-realm-green/10', text: 'text-realm-green' },
    pending: { label: 'Pending', bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
    rejected: { label: 'Rejected', bg: 'bg-red-500/10', text: 'text-red-500' }
  } as Record<string, { label: string; bg: string; text: string }>)[server.status]) || { label: server.status, bg: 'bg-zinc-800', text: 'text-zinc-400' }) : null

  const handleCopyIp = () => {
    if (server?.ip_or_code) {
      navigator.clipboard.writeText(server.ip_or_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyBedrockIp = () => {
    if (server?.bedrock_ip) {
      navigator.clipboard.writeText(server.bedrock_ip)
      setBedrockCopied(true)
      setTimeout(() => setBedrockCopied(false), 2000)
    }
  }

  const handleVote = () => {
    if (!user || !server || alreadyVoted || voteMutation.isPending) return
    setError(null)
    voteMutation.mutate(
      { userId: user.id, serverId: server.id },
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


  if (loading) return <LoadingSpinner />
  if (!server) return <EmptyState title="Not Found" message="This server or realm does not exist or was removed." />

  const metaDescription = server.description 
    ? server.description.substring(0, 160).replace(/[#*`]/g, '') + '...' 
    : `Join ${server.name} on Realm Explorer. Explore ${server.category} Minecraft servers and realms.`;

  return (
    <>
    <MetaTags 
      title={server.name}
      description={metaDescription}
      image={server.banner_url || server.icon_url || undefined}
      url={`/server/${server.slug || server.id}`}
      type="website"
    />
    <AnimatedPage className="max-w-5xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
      {/* Banner */}
      <FramerIn delay={0.1} className="w-full h-32 md:h-64 bg-zinc-950 rounded-t-lg overflow-hidden relative border border-zinc-800">
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
      <FramerIn delay={0.2} className="bg-zinc-950 border-x border-b border-zinc-800 rounded-b-lg p-5 md:p-8 mb-4 md:mb-4 flex flex-col md:flex-row gap-4 md:gap-6 items-start relative -mt-4 shadow-xl will-change-transform">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-900 rounded-md overflow-hidden flex-shrink-0 border-4 border-zinc-950 -mt-10 md:-mt-12 z-10 shadow-lg will-change-transform">

          {server.icon_url ? (
            <img src={server.icon_url} alt="Icon" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 font-pixel text-lg md:text-xl">
              {server.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1 w-full pt-1 md:pt-2">

          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="min-w-0 md:flex-1 w-full md:w-auto">
              <h1 className="text-lg md:text-2xl font-pixel text-white mb-2 md:mb-3 break-words whitespace-normal leading-tight">{server.name}</h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
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
              
              {/* Mobile Badges (Original Position) */}
              {badges.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 mb-4 md:hidden">
                  {badges.map((badge, index) => (
                    <div 
                      key={`${badge.id}-${badge.month}`} 
                      className="group relative cursor-help"
                    >
                      <img 
                        src={new URL(`../assets/badges/${badge.image_url}`, import.meta.url).href} 
                        alt={badge.name} 
                        className="w-7 h-7 object-contain"
                      />
                      
                      {/* Premium Tooltip */}
                      <div className={`absolute bottom-full mb-3 w-48 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 translate-y-2 group-hover:translate-y-0 ${index === 0 ? 'left-0' : 'left-1/2 -translate-x-1/2'}`}>
                        <div className="bg-zinc-950/90 border border-white/10 rounded-xl p-3 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-realm-green/50 to-transparent" />
                          <p className="text-[10px] font-pixel text-realm-green uppercase mb-1.5 tracking-tighter text-center">
                            {badge.name}
                            {badge.month && <span className="text-white/40 ml-1">({badge.month})</span>}
                          </p>
                          <p className="text-[10px] text-white/70 font-headline leading-tight italic text-center">"{badge.description}"</p>
                        </div>
                        <div className={`w-2 h-2 bg-zinc-950 border-r border-b border-white/10 rotate-45 -mt-1 relative z-10 ${index === 0 ? 'ml-2.5' : 'mx-auto'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto mt-2 md:mt-0">
              <div className="flex items-center gap-1.5 w-full md:w-auto justify-center md:justify-end">
                {/* Desktop Badges (Besides Vote) */}
                {badges.length > 0 && (
                  <div className="hidden md:flex items-center gap-2 mr-2">
                    {badges.map((badge) => (
                      <div 
                        key={`${badge.id}-${badge.month}`} 
                        className="group relative cursor-help"
                      >
                        <img 
                          src={new URL(`../assets/badges/${badge.image_url}`, import.meta.url).href} 
                          alt={badge.name} 
                          className="w-9 h-9 object-contain"
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
                )}

                {user ? (
                  <div className="flex items-center gap-1.5 w-full md:w-auto">
                    <motion.button 
                      whileHover={isApproved ? { scale: 1.05 } : {}}
                      whileTap={isApproved ? { scale: 0.95 } : {}}
                      onClick={handleVote}
                      disabled={alreadyVoted || voteMutation.isPending || checkingVote || !isApproved}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-l-lg rounded-r-sm font-headline font-bold transition-colors shadow-lg text-xs md:text-sm ${
                        !isApproved ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-800 opacity-50' :
                        alreadyVoted ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' : 
                        'bg-[#4EC44E] text-zinc-950 hover:bg-[#85fc7e]'
                      }`}
                    >
                      <ArrowUpSquare className={`w-4 h-4 md:w-5 h-5 ${alreadyVoted || !isApproved ? 'text-zinc-600' : ''}`} />
                      <div className="flex items-center gap-2 leading-tight">
                        <span className="text-xs md:text-sm">
                          {voteMutation.isPending ? 'Voting...' : !isApproved ? 'Pending' : alreadyVoted ? 'Voted' : 'Vote'}
                        </span>
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
                      </div>
                    </motion.button>
                    <motion.button 
                      whileHover={isApproved ? { scale: 1.1 } : {}}
                      whileTap={isApproved ? { scale: 0.9 } : {}}
                      onClick={() => isApproved && setIsRatingModalOpen(true)}
                      disabled={!isApproved}
                      className={`p-2.5 md:p-3 rounded-r-lg rounded-l-sm border transition-colors shadow-lg ${
                        !isApproved ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50' : 
                        'bg-zinc-900 border-zinc-800 text-yellow-400 hover:bg-zinc-800'
                      }`}
                      title={isApproved ? "Rate Server" : "Approval Pending"}
                    >
                      <Star className={`w-4 h-4 md:w-5 h-5 ${isApproved ? 'fill-yellow-400' : ''}`} />
                    </motion.button>
                  </div>
                ) : (
                  <div className="text-[10px] md:text-xs font-headline text-zinc-500 border border-zinc-800 px-3 md:px-4 py-1.5 md:py-2 rounded-md w-full text-center md:w-auto">Login to Vote</div>
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
          
            <div className="flex flex-wrap items-end gap-2 md:gap-3 mt-4 md:mt-6">
              {/* Java IP / Realm Button */}
              {server.type === 'server' ? (
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                   <div className="text-[8px] md:text-[9px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Java IP</div>
                    <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopyIp}
                    className="flex items-center justify-center sm:justify-start gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-md font-headline text-xs md:text-sm transition-all border border-zinc-800 w-full"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-realm-green" /> : <Copy className="w-3.5 h-3.5" />}
                    {server.ip_or_code || 'Hidden IP'}
                    {server.port && server.port !== 25565 && <span className="text-zinc-500">:{server.port}</span>}
                  </motion.button>
                </div>
              ) : (
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                   <div className="text-[8px] md:text-[9px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Join Realm</div>
                    <motion.a 
                    href={server.verify_discord ? (server.website_url ?? undefined) : (server.ip_or_code?.startsWith('http') ? server.ip_or_code : `https://realms.gg/${server.ip_or_code}`)}
                    target="_blank"
                    rel="noreferrer"
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 md:px-6 py-1.5 md:py-2 rounded-md font-headline text-xs md:text-sm transition-all border border-zinc-800 w-full"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {server.verify_discord ? 'Verify on Discord' : 'Connect'}
                  </motion.a>
                </div>
              )}

              {/* Bedrock IP (Additional for Hybrid Servers) */}
              {server.type === 'server' && server.bedrock_ip && (
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                   <div className="text-[8px] md:text-[9px] font-bold text-realm-green/60 uppercase tracking-widest ml-1">Bedrock IP</div>
                    <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopyBedrockIp}
                    className="flex items-center justify-center sm:justify-start gap-2 bg-realm-green/5 hover:bg-realm-green/10 text-realm-green px-3 md:px-4 py-1.5 md:py-2 rounded-md font-headline text-xs md:text-sm transition-all border border-realm-green/20 w-full"
                  >
                    {bedrockCopied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {server.bedrock_ip}
                  </motion.button>
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
                    tiktok: { text: 'text-cyan-400', border: 'hover:border-cyan-400/40' },
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
        </div>
      </FramerIn>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4">
        <FramerIn delay={0.3} className="md:col-span-2 w-full space-y-4 md:space-y-4">
          <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-8 rounded-lg">
            <h2 className="font-pixel text-white text-base md:text-lg mb-4 md:mb-6">About</h2>
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
                  <span className="material-symbols-outlined text-sm text-realm-green">photo_library</span>
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
          <div className="w-full bg-zinc-900/50 border border-zinc-800 p-5 md:p-6 rounded-lg">
            <h3 className="font-headline font-bold text-zinc-500 uppercase tracking-widest text-[10px] md:text-xs mb-4">Statistics</h3>
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-xs md:text-sm">Rating</span>
                <div className="flex items-center gap-1.5">
                  <Star className={`w-3 h-3 md:w-3.5 md:h-3.5 ${server.average_rating > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} />
                  <span className="text-white font-bold text-xs md:text-sm">
                    {server.average_rating > 0 ? server.average_rating.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-zinc-600 text-[9px] md:text-[10px] font-headline">({server.rating_count})</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-xs md:text-sm">Total Votes</span>
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
                  <img src={owner.discord_avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-zinc-700 bg-zinc-800" alt="Owner" />
                  <div className="flex-1">
                    <p className="text-white text-xs md:text-sm leading-tight">{owner.discord_username}</p>
                    <p className={`text-[8px] md:text-[9px] uppercase tracking-widest font-headline mt-0.5 ${
                      (server.submitter_role || 'Owner') === 'Owner' ? 'text-yellow-400' : 'text-realm-green'
                    }`}>
                      {server.submitter_role || 'Owner'}
                    </p>
                  </div>
                  <span className="text-[8px] md:text-[9px] uppercase tracking-widest font-headline text-zinc-600 font-bold whitespace-nowrap opacity-40 group-hover:opacity-100 transition-opacity">
                    view profile
                  </span>
                </Link>
              )}
            </div>
          </div>

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
            className="w-full bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg flex items-center justify-center gap-3 text-zinc-500 hover:border-red-500/40 transition-all group"
          >
            <Flag className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
            <span className="font-headline font-bold uppercase tracking-widest text-[9px]">Report Server</span>
          </motion.button>
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
  )
}
