import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useServer, useUserVoteStatus, useServerRatings, useServerMessages } from '../hooks/queries'
import { useVoteMutation, useSubmitRatingMutation, useSubmitReportMutation } from '../hooks/mutations'
import { LoadingSpinner, EmptyState } from '../components/FeedbackStates'
import { CategoryBadge } from '../components/CategoryBadge'
import { Globe, Copy, CheckCircle, ArrowUpSquare, Star, ExternalLink, Calendar, Clock, Flag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { SiDiscord, SiTiktok, SiInstagram, SiYoutube, SiFacebook, SiTwitch } from 'react-icons/si'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion } from 'framer-motion'
import { VoteTimer } from '../components/VoteTimer'
import { RatingModal } from '../components/RatingModal'
import { ReportModal } from '../components/ReportModal'
import { RichText } from '../components/RichText'
import { toast } from 'sonner'

// Type Icons
import serverTypeIcon from '../assets/category/gif/6128-minecraft.gif'
import realmTypeIcon from '../assets/category/gif/9677-minecraftnetherportalblock (2).gif'

export function ServerDetailPage() {
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
  const { data: messages = [] } = useServerMessages(server?.id)
  const voteMutation = useVoteMutation()
  const ratingMutation = useSubmitRatingMutation()
  
  const [copied, setCopied] = useState(false)
  const [bedrockCopied, setBedrockCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
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

  return (
    <AnimatedPage className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Banner */}
      <FramerIn delay={0.1} className="w-full h-32 md:h-64 bg-zinc-900 rounded-t-2xl overflow-hidden relative border border-zinc-800">
        {server.banner_url ? (
           <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
            src={server.banner_url} alt="Banner" className="w-full h-full object-cover opacity-80" 
           />
        ) : (
           <div className="w-full h-full pixel-grid opacity-20"></div>
        )}
      </FramerIn>

      {/* Header Info */}
      <FramerIn delay={0.2} className="bg-zinc-950 border-x border-b border-zinc-800 rounded-b-2xl p-5 md:p-8 mb-6 md:mb-8 flex flex-col md:flex-row gap-4 md:gap-6 items-start relative -mt-4 shadow-xl">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0 border-4 border-zinc-950 -mt-10 md:-mt-12 z-10 shadow-lg">

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
            <div className="w-full">
              <h1 className="text-xl md:text-3xl font-pixel text-white mb-2 md:mb-3 truncate">{server.name}</h1>
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
            </div>

            {user ? (
                <div className="flex flex-col items-center md:items-end gap-1.5 w-full md:w-auto">
                  <div className="flex items-center gap-1.5 w-full md:w-auto">
                    <motion.button 
                      whileHover={isApproved ? { scale: 1.05 } : {}}
                      whileTap={isApproved ? { scale: 0.95 } : {}}
                      onClick={handleVote}
                      disabled={alreadyVoted || voteMutation.isPending || checkingVote || !isApproved}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-l-xl rounded-r-md font-headline font-bold transition-colors shadow-lg text-xs md:text-sm ${
                        !isApproved ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-800 opacity-50' :
                        alreadyVoted ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' : 
                        'bg-[#4EC44E] text-zinc-950 hover:bg-[#85fc7e] shadow-green-500/20'
                      }`}
                    >
                      <ArrowUpSquare className={`w-4 h-4 md:w-5 h-5 ${alreadyVoted || !isApproved ? 'text-zinc-600' : ''}`} />
                      {voteMutation.isPending ? 'Voting...' : !isApproved ? 'Pending' : alreadyVoted ? 'Voted' : 'Vote'}
                    </motion.button>
                    <motion.button 
                      whileHover={isApproved ? { scale: 1.1 } : {}}
                      whileTap={isApproved ? { scale: 0.9 } : {}}
                      onClick={() => isApproved && setIsRatingModalOpen(true)}
                      disabled={!isApproved}
                      className={`p-2.5 md:p-3 rounded-r-xl rounded-l-md border transition-colors shadow-lg ${
                        !isApproved ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50' : 
                        'bg-zinc-900 border-zinc-800 text-yellow-400 hover:bg-zinc-800'
                      }`}
                      title={isApproved ? "Rate Server" : "Approval Pending"}
                    >
                      <Star className={`w-4 h-4 md:w-5 h-5 ${isApproved ? 'fill-yellow-400' : ''}`} />
                    </motion.button>
                  </div>
                  
                  {alreadyVoted && voteStatus?.lastVoteTime && (
                    <div className="mt-1">
                      <VoteTimer 
                        lastVoteTime={voteStatus.lastVoteTime} 
                        onFinish={() => {
                            refetchVoteStatus()
                            refetchServer()
                        }}
                      />
                    </div>
                  )}

                  {/* Staff Messages (visible to owner or staff) */}
                  {messages.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full mt-4 space-y-3"
                    >
                      {messages.map((msg: any) => (
                        <div key={msg.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          msg.type === 'rejection' 
                            ? 'bg-red-500/10 border-red-500/20' 
                            : 'bg-blue-500/10 border-blue-500/20'
                        }`}>
                          <div className="flex-grow w-full">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="material-symbols-outlined text-sm opacity-60">
                                {msg.type === 'rejection' ? 'error' : 'mail'}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                {msg.type === 'rejection' ? 'Rejection Reason' : 'Staff Feedback'}
                              </span>
                            </div>
                            <div className="font-bold text-white text-xs mb-1">{msg.subject}</div>
                            <p className="text-white/60 text-xs leading-relaxed italic">"{msg.message}"</p>
                            <div className="text-[9px] text-white/20 mt-2 font-mono">
                              {new Date(msg.created_at).toLocaleString()}
                            </div>
                          </div>

                          {/* Sender Info (Bottom on mobile, Right on desktop) */}
                          {msg.profiles && (
                            <div className="flex items-center gap-3 sm:pl-4 sm:border-l border-white/5 flex-shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 mt-2 sm:mt-0">
                              <div className="flex-grow sm:text-right">
                                <div className="text-white text-[10px] font-bold leading-tight">
                                  {msg.profiles.discord_username || 'Staff Member'}
                                </div>
                                <div className={`text-[8px] font-bold uppercase tracking-wider ${
                                  msg.profiles.role === 'admin' ? 'text-red-400' : 'text-realm-green'
                                }`}>
                                  {msg.profiles.role}
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-zinc-900">
                                {msg.profiles.discord_avatar ? (
                                  <img src={msg.profiles.discord_avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-white/20 font-bold uppercase">
                                    {msg.profiles.discord_username?.substring(0, 1) || 'S'}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
            ) : (
              <div className="text-[10px] md:text-xs font-headline text-zinc-500 border border-zinc-800 px-3 md:px-4 py-1.5 md:py-2 rounded-lg w-full text-center md:w-auto">Login to Vote</div>
            )}
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
                    className="flex items-center justify-center sm:justify-start gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-headline text-xs md:text-sm transition-all border border-zinc-800 w-full"
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
                    href={server.ip_or_code?.startsWith('http') ? server.ip_or_code : `https://realms.gg/${server.ip_or_code}`}
                    target="_blank"
                    rel="noreferrer"
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 md:px-6 py-1.5 md:py-2 rounded-lg font-headline text-xs md:text-sm transition-all border border-zinc-800 w-full"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Connect
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
                    className="flex items-center justify-center sm:justify-start gap-2 bg-realm-green/5 hover:bg-realm-green/10 text-realm-green px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-headline text-xs md:text-sm transition-all border border-realm-green/20 w-full"
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
                    className="flex-1 sm:flex-none flex items-center justify-center p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-[#5865F2] hover:border-[#5865F2]/30 transition-all shadow-sm"
                    title="Discord Invite"
                  >
                    <SiDiscord className="w-4 h-4 md:w-5 h-5" />
                  </a>
                )}

                {/* Curated Social Links */}
                {server.social_links && server.social_links.map((link, idx) => {
                  const icons = {
                    website: <Globe className="w-4 h-4 md:w-5 h-5" />,
                    instagram: <SiInstagram className="w-4 h-4 md:w-5 h-5" />,
                    youtube: <SiYoutube className="w-4 h-4 md:w-5 h-5" />,
                    tiktok: <SiTiktok className="w-4 h-4 md:w-5 h-5" />,
                    facebook: <SiFacebook className="w-4 h-4 md:w-5 h-5" />,
                    twitch: <SiTwitch className="w-4 h-4 md:w-5 h-5" />,
                  }
                  const hoverColors = {
                    website: 'hover:text-white',
                    instagram: 'hover:text-pink-500',
                    youtube: 'hover:text-red-600',
                    tiktok: 'hover:text-cyan-400',
                    facebook: 'hover:text-blue-600',
                    twitch: 'hover:text-purple-500',
                  }
                  return (
                    <a 
                      key={idx}
                      href={link.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className={`flex-1 sm:flex-none flex items-center justify-center p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 ${hoverColors[link.platform] || 'hover:text-white'} transition-all shadow-sm`}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <FramerIn delay={0.3} className="md:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-zinc-900/50 border border-zinc-800 p-5 md:p-8 rounded-2xl">
            <h2 className="font-pixel text-white text-lg md:text-xl mb-4 md:mb-6">About</h2>
            <div className="text-zinc-300 font-body leading-relaxed text-sm">
              {server.description ? (
                <RichText content={server.description} />
              ) : (
                'No description provided.'
              )}
            </div>
          </div>
        </FramerIn>
        
        <FramerIn delay={0.4} className="space-y-4 md:space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 p-5 md:p-6 rounded-2xl">
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
            </div>
          </div>
          
          {owner && (
            <Link 
              to={`/profile/${owner.discord_username}`}
              className="bg-zinc-900/50 border border-zinc-800 p-4 md:p-6 rounded-2xl flex items-center gap-3 md:gap-4 hover:bg-zinc-800/80 transition-all group"
            >
              <img src={owner.discord_avatar || ''} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-zinc-700 bg-zinc-800 group-hover:border-realm-green/30 transition-colors" alt="Owner" />
              <div>
                <p className="text-[9px] md:text-xs text-zinc-500 uppercase tracking-widest font-headline mb-0.5">Owner</p>
                <p className="text-white text-sm md:text-base font-bold group-hover:text-realm-green transition-colors">{owner.discord_username}</p>
              </div>
            </Link>
          )}

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
            className="w-full bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex items-center justify-center gap-3 text-zinc-500 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all group"
          >
            <Flag className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
            <span className="font-headline font-bold uppercase tracking-widest text-[9px]">Report Server</span>
          </motion.button>
        </FramerIn>
      </div>

      {/* Ratings Section */}
      <FramerIn delay={0.5} className="mt-6 md:mt-8">
        <div className="bg-zinc-900/50 border border-zinc-800 p-5 md:p-8 rounded-2xl">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="font-pixel text-white text-lg md:text-xl">Ratings</h2>
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
                  className="bg-zinc-950 border border-zinc-800 p-5 md:p-6 rounded-xl space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <Link 
                      to={`/profile/${rating.profiles?.discord_username}`}
                      className="flex items-center gap-3 group/reviewer"
                    >
                      <img 
                        src={rating.profiles?.discord_avatar || ''} 
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

      <RatingModal 
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        isSubmitting={ratingMutation.isPending}
      />

      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        isSubmitting={reportMutation.isPending}
      />
    </AnimatedPage>
  )
}
