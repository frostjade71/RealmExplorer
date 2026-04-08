import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useServer, useUserVoteStatus, useServerRatings, useServerMessages } from '../hooks/queries'
import { useVoteMutation, useSubmitRatingMutation } from '../hooks/mutations'
import { LoadingSpinner, EmptyState } from '../components/FeedbackStates'
import { CategoryBadge } from '../components/CategoryBadge'
import { Link2, Copy, CheckCircle, ArrowUpSquare, Star } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion } from 'framer-motion'
import { VoteTimer } from '../components/VoteTimer'
import { RatingModal } from '../components/RatingModal'

export function ServerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  
  const { data, isLoading: loading, refetch: refetchServer } = useServer(id)
  const { data: voteStatus, isLoading: checkingVote, refetch: refetchVoteStatus } = useUserVoteStatus(user?.id, id)
  const { data: ratings } = useServerRatings(id)
  const { data: messages = [] } = useServerMessages(id)
  const voteMutation = useVoteMutation()
  const ratingMutation = useSubmitRatingMutation()
  
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)

  const server = data?.server
  const owner = data?.owner
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

  const handleVote = () => {
    if (!user || !server || alreadyVoted || voteMutation.isPending) return
    setError(null)
    voteMutation.mutate(
      { userId: user.id, serverId: server.id },
      {
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
        },
        onError: () => {
          setError("Failed to submit rating. Please try again.")
        }
      }
    )
  }

  if (loading) return <LoadingSpinner />
  if (!server) return <EmptyState title="Not Found" message="This server or realm does not exist or was removed." />

  return (
    <AnimatedPage className="max-w-5xl mx-auto px-8 py-12">
      {/* Banner */}
      <FramerIn delay={0.1} className="w-full h-48 md:h-64 bg-zinc-900 rounded-t-2xl overflow-hidden relative border border-zinc-800">
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
      <FramerIn delay={0.2} className="bg-zinc-950 border-x border-b border-zinc-800 rounded-b-2xl p-8 mb-8 flex flex-col md:flex-row gap-6 items-start relative -mt-4 shadow-xl">
        <div className="w-24 h-24 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0 border-4 border-zinc-950 -mt-12 z-10 shadow-lg">

          {server.icon_url ? (
            <img src={server.icon_url} alt="Icon" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 font-pixel text-xl">
              {server.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1 pt-2">

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-pixel text-white mb-3">{server.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                {!isApproved && statusInfo && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-current/10 ${statusInfo.bg} ${statusInfo.text}`}>
                    {statusInfo.label}
                  </span>
                )}
                <CategoryBadge category={server.category} />
              </div>
            </div>
            {user ? (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <motion.button 
                      whileHover={isApproved ? { scale: 1.05 } : {}}
                      whileTap={isApproved ? { scale: 0.95 } : {}}
                      onClick={handleVote}
                      disabled={alreadyVoted || voteMutation.isPending || checkingVote || !isApproved}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-headline font-bold transition-colors shadow-lg ${
                        !isApproved ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-800 opacity-50' :
                        alreadyVoted ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' : 
                        'bg-[#4EC44E] text-zinc-950 hover:bg-[#85fc7e] shadow-green-500/20'
                      }`}
                    >
                      <ArrowUpSquare className={`w-5 h-5 ${alreadyVoted || !isApproved ? 'text-zinc-600' : ''}`} />
                      {voteMutation.isPending ? 'Voting...' : !isApproved ? 'Pending Approval' : alreadyVoted ? 'Voted' : 'Vote Now'}
                    </motion.button>
                    <motion.button 
                      whileHover={isApproved ? { scale: 1.1 } : {}}
                      whileTap={isApproved ? { scale: 0.9 } : {}}
                      onClick={() => isApproved && setIsRatingModalOpen(true)}
                      disabled={!isApproved}
                      className={`p-3 rounded-xl border transition-colors shadow-lg ${
                        !isApproved ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50' : 
                        'bg-zinc-900 border-zinc-800 text-yellow-400 hover:bg-zinc-800'
                      }`}
                      title={isApproved ? "Rate Server" : "Approval Pending"}
                    >
                      <Star className={`w-5 h-5 ${isApproved ? 'fill-yellow-400' : ''}`} />
                    </motion.button>
                  </div>
                  
                  {alreadyVoted && voteStatus?.lastVoteTime && (
                    <VoteTimer 
                      lastVoteTime={voteStatus.lastVoteTime} 
                      onFinish={() => {
                          refetchVoteStatus()
                          refetchServer()
                      }}
                    />
                  )}

                  {/* Staff Messages (visible to owner or staff) */}
                  {messages.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full mt-4 space-y-3"
                    >
                      {messages.map((msg: any) => (
                        <div key={msg.id} className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                          msg.type === 'rejection' 
                            ? 'bg-red-500/10 border-red-500/20' 
                            : 'bg-blue-500/10 border-blue-500/20'
                        }`}>
                          <div className="flex-grow">
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

                          {/* Sender Info (Right side) */}
                          {msg.profiles && (
                            <div className="flex items-center gap-3 pl-4 border-l border-white/5 flex-shrink-0">
                              <div className="text-right">
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
              <div className="text-xs font-headline text-zinc-500 border border-zinc-800 px-4 py-2 rounded-lg">Login to Vote</div>
            )}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-8 text-[10px] text-red-500 font-headline uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded border border-red-500/20"
            >
              {error}
            </motion.div>
          )}
          
          <div className="flex flex-wrap gap-4 mt-6">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleCopyIp}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg font-headline text-sm transition-colors border border-zinc-800"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-realm-green" /> : <Copy className="w-4 h-4" />}
              {server.ip_or_code || 'Hidden IP'}
            </motion.button>
            {server.website_url && (
              <a href={server.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white transition-colors font-headline text-sm">
                <Link2 className="w-4 h-4" /> Website
              </a>
            )}
          </div>
        </div>
      </FramerIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FramerIn delay={0.3} className="md:col-span-2 space-y-8">
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl">
            <h2 className="font-pixel text-white text-xl mb-6">About</h2>
            <div className="text-zinc-300 font-body leading-relaxed whitespace-pre-wrap">
              {server.description ? (
                server.description.split(/(https?:\/\/[^\s]+)/g).map((part, i) => (
                  part.match(/^https?:\/\/[^\s]+$/) ? (
                    <a 
                      key={i} 
                      href={part} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-realm-green hover:underline break-all"
                    >
                      {part}
                    </a>
                  ) : (
                    part
                  )
                ))
              ) : (
                'No description provided.'
              )}
            </div>
          </div>
        </FramerIn>
        
        <FramerIn delay={0.4} className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <h3 className="font-headline font-bold text-zinc-500 uppercase tracking-widest text-xs mb-4">Statistics</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Rating</span>
                <div className="flex items-center gap-1.5">
                  <Star className={`w-3.5 h-3.5 ${server.average_rating > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} />
                  <span className="text-white font-bold">
                    {server.average_rating > 0 ? server.average_rating.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-zinc-600 text-[10px] font-headline">({server.rating_count})</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Total Votes</span>
                <span className="text-white font-bold">{server.votes}</span>
              </div>
            </div>
          </div>
          
          {owner && (
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4">
              <img src={owner.discord_avatar || ''} className="w-12 h-12 rounded-full border border-zinc-700 bg-zinc-800" alt="Owner" />
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-headline mb-0.5">Owner</p>
                <p className="text-white font-bold">{owner.discord_username}</p>
              </div>
            </div>
          )}
        </FramerIn>
      </div>

      {/* Ratings Section */}
      <FramerIn delay={0.5} className="mt-8">
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-pixel text-white text-xl">Ratings & Reviews</h2>
            <div className="flex items-center gap-4 text-sm font-headline text-zinc-500 uppercase tracking-widest">
              <span>{server.rating_count} Reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ratings && ratings.length > 0 ? (
              ratings.map((rating) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  key={rating.id} 
                  className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <img 
                        src={rating.profiles?.discord_avatar || ''} 
                        className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900" 
                        alt="User" 
                      />
                      <div>
                        <p className="text-zinc-200 font-bold text-sm leading-none">{rating.profiles?.discord_username || 'Anonymous'}</p>
                        <p className="text-[10px] text-zinc-600 font-headline uppercase mt-1">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={`w-3 h-3 ${s <= rating.rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-800'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  {rating.comment && (
                    <p className="text-zinc-400 text-sm leading-relaxed font-body italic">" {rating.comment} "</p>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="md:col-span-2 py-12 text-center">
                <p className="text-zinc-500 font-headline text-sm uppercase tracking-widest">No reviews yet. Be the first to rate!</p>
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
    </AnimatedPage>
  )
}
