import { useParams, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useProfileByUsername, useUserServers, useUserProjects, useEntityBadges, useProfileLikes, useToggleProfileLike } from '../hooks/queries'
import { useAuth } from '../contexts/AuthContext'
import { useIsMobile } from '../hooks/useMediaQuery'
import { DirectoryServerCard } from '../components/DirectoryServerCard'
import { SponsorServerCard } from '../components/SponsorServerCard'
import { ProjectCard } from '../components/ProjectCard'
import { EmptyState, LoadingSpinner } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion, AnimatePresence, LayoutGroup, useMotionValue, useSpring } from 'framer-motion'
import { Calendar, Server, Globe, Pencil, Mail, Heart } from 'lucide-react'
import { SiDiscord, SiInstagram, SiYoutube, SiTiktok, SiFacebook, SiTwitch, SiGithub, SiX, SiPatreon, SiKofi } from 'react-icons/si'
import { RoleBadge } from '../components/RoleBadge'
import { SponsorBadge } from '../components/SponsorBadge'
import { useState, useEffect, lazy, Suspense, useMemo } from 'react'

const EditProfileModal = lazy(() => import('../components/EditProfileModal').then(m => ({ default: m.EditProfileModal })))
const EditBioModal = lazy(() => import('../components/EditBioModal').then(m => ({ default: m.EditBioModal })))
const EditBannerModal = lazy(() => import('../components/EditBannerModal').then(m => ({ default: m.EditBannerModal })))

import { toast } from 'sonner'
import type { SocialLink } from '../types'
import errorImage from '../assets/error/teto-but-re.webp'

import { MetaTags } from '../components/MetaTags'

const getSocialIcon = (platform: string) => {
  switch (platform) {
    case 'discord': return <SiDiscord className="w-4 h-4" />
    case 'instagram': return <SiInstagram className="w-4 h-4" />
    case 'youtube': return <SiYoutube className="w-4 h-4" />
    case 'tiktok': return <SiTiktok className="w-4 h-4" />
    case 'facebook': return <SiFacebook className="w-4 h-4" />
    case 'twitch': return <SiTwitch className="w-4 h-4" />
    case 'github': return <SiGithub className="w-4 h-4" />
    case 'x': return <SiX className="w-4 h-4" />
    case 'patreon': return <SiPatreon className="w-4 h-4" />
    case 'kofi': return <SiKofi className="w-4 h-4" />
    case 'email': return <Mail className="w-4 h-4" />
    default: return <Globe className="w-4 h-4" />
  }
}

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case 'discord': return 'text-[#5865F2]'
    case 'instagram': return 'text-[#E4405F]'
    case 'youtube': return 'text-[#FF0000]'
    case 'tiktok': return 'text-white' 
    case 'facebook': return 'text-[#1877F2]'
    case 'twitch': return 'text-[#9146FF]'
    case 'github': return 'text-white'
    case 'x': return 'text-white'
    case 'patreon': return 'text-[#FF424D]'
    case 'kofi': return 'text-[#FF5E5B]'
    case 'email': return 'text-white'
    case 'website': return 'text-blue-400'
    default: return 'text-zinc-400'
  }
}

const getPlatformBorderColor = (platform: string) => {
  switch (platform) {
    case 'discord': return 'border-[#5865F2]/20 hover:border-[#5865F2]/40'
    case 'instagram': return 'border-[#E4405F]/20 hover:border-[#E4405F]/40'
    case 'youtube': return 'border-[#FF0000]/20 hover:border-[#FF0000]/40'
    case 'tiktok': return 'border-white/20 hover:border-white/40'
    case 'facebook': return 'border-[#1877F2]/20 hover:border-[#1877F2]/40'
    case 'twitch': return 'border-[#9146FF]/20 hover:border-[#9146FF]/40'
    case 'github': return 'border-white/20 hover:border-white/40'
    case 'x': return 'border-white/20 hover:border-white/40'
    case 'patreon': return 'border-[#FF424D]/20 hover:border-[#FF424D]/40'
    case 'kofi': return 'border-[#FF5E5B]/20 hover:border-[#FF5E5B]/40'
    case 'email': return 'border-white/10 hover:border-white/20'
    case 'website': return 'border-blue-400/20 hover:border-blue-400/40'
    default: return 'border-white/5 hover:border-white/10'
  }
}

const getPlatformName = (platform: string) => {
  switch (platform) {
    case 'github': return 'GitHub'
    case 'x': return 'X (Twitter)'
    case 'kofi': return 'Ko-fi'
    default: return platform.charAt(0).toUpperCase() + platform.slice(1)
  }
}

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfileByUsername(username)
  const { data: servers = [], isLoading: serversLoading } = useUserServers(profile?.id, 'approved')
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects(profile?.id, 'approved')
  const { data: badges = [] } = useEntityBadges(profile?.id, 'user')
  const { user } = useAuth()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isBioModalOpen, setIsBioModalOpen] = useState(false)
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false)
  const [listingFilter, setListingFilter] = useState<'latest' | 'servers' | 'projects'>('latest')
  const [isFilterMounted, setIsFilterMounted] = useState(false)

  useEffect(() => {
    if (!profileLoading) {
      const raf = requestAnimationFrame(() => {
        setIsFilterMounted(true)
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [profileLoading])
  
  const queryClient = useQueryClient()
  const { data: likesData, refetch: refetchLikes } = useProfileLikes(profile?.id, user?.id)
  const toggleLike = useToggleProfileLike()
  const [isLiking, setIsLiking] = useState(false)
  const [justLiked, setJustLiked] = useState(false)

  const isOwnProfile = user?.id === profile?.id
  const isProfileExplorerPlus = profile?.role === 'explorer+'
  const hasSponsoredServers = servers.some(s => s.is_sponsored)

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

  const allListings = useMemo(() => {
    const combined = [
      ...servers.map(s => ({ ...s, _listingType: 'server' as const })),
      ...projects.map(p => ({ ...p, _listingType: 'project' as const }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    if (listingFilter === 'servers') return combined.filter(l => l._listingType === 'server')
    if (listingFilter === 'projects') return combined.filter(l => l._listingType === 'project')
    return combined
  }, [servers, projects, listingFilter])

  const handleEmailClick = (_e: React.MouseEvent, email: string) => {
    // Copy to clipboard fallback
    navigator.clipboard.writeText(email)
    toast.success('Email Copied', {
      description: 'The email address has been copied to your clipboard.'
    })
    
    // We don't prevent default here so the mailto: still tries to fire
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Login Required', {
        description: 'You must be logged in to like a profile.'
      })
      return
    }
    if (!profile || isLiking) return
    setIsLiking(true)
    const isLikingNow = !likesData?.hasLiked
    if (isLikingNow) {
      setJustLiked(true)
    }

    const previousLikes = likesData
    const currentCount = likesData?.count ?? profile.likes ?? 0
    const newCount = Math.max(0, currentCount + (isLikingNow ? 1 : -1))

    // Optimistically update likesData in cache
    queryClient.setQueryData(['profileLikes', profile.id, user.id], (old: any) => ({
      count: newCount,
      hasLiked: isLikingNow,
      likedBy: old?.likedBy || []
    }))

    // Optimistically update profile in cache
    if (username) {
      queryClient.setQueryData(['profile', username], (old: any) => old ? { ...old, likes: newCount } : old)
    }
    queryClient.setQueryData(['profile', profile.id], (old: any) => old ? { ...old, likes: newCount } : old)

    try {
      await toggleLike.mutateAsync({
        profileId: profile.id,
        userId: user.id,
        hasLiked: !!likesData?.hasLiked
      })
      await refetchLikes()
      queryClient.invalidateQueries({ queryKey: ['profileLikes', profile.id] })
      if (username) {
        queryClient.invalidateQueries({ queryKey: ['profile', username] })
      }
      queryClient.invalidateQueries({ queryKey: ['profile', profile.id] })
    } catch (e) {
      toast.error('Failed to update like status')
      if (isLikingNow) setJustLiked(false)
      // Rollback on error
      if (previousLikes) {
        queryClient.setQueryData(['profileLikes', profile.id, user.id], previousLikes)
      }
      if (username) {
        queryClient.setQueryData(['profile', username], (old: any) => old ? { ...old, likes: currentCount } : old)
      }
    } finally {
      setIsLiking(false)
    }
  }

  // Return a consistent structure so AnimatedPage doesn't unmount and replay its enter animation
  if (profileLoading) {
    return (
      <>
        <MetaTags title="Loading Profile..." />
        <AnimatedPage className="min-h-[70vh] flex items-center justify-center">
          <LoadingSpinner />
        </AnimatedPage>
      </>
    )
  }
  
  if (profileError || !profile) {
    return (
      <>
        <MetaTags title="Explorer Not Found" />
        <AnimatedPage className="min-h-[70vh] flex flex-col items-center justify-center p-4">
          <FramerIn className="text-center space-y-4 flex flex-col items-center">
            <img src={errorImage} alt="Not Found" className="w-24 h-24 md:w-32 md:h-32 object-contain mb-2" />
            <div className="space-y-2 px-4">
              <h2 className="text-2xl md:text-3xl font-headline text-white font-bold tracking-tight">
                <span className="text-realm-green mr-3">404</span>
                Not Found
              </h2>
              <p className="text-xs md:text-sm text-on-surface-variant font-body max-w-sm mx-auto">
                We couldn't find an explorer with the username "@{username}"
              </p>
            </div>
            <div className="pt-4">
              <Link 
                to="/" 
                className="inline-flex items-center justify-center px-4 py-2.5 font-headline text-sm font-semibold text-black bg-realm-green rounded hover:bg-primary-fixed transition-colors duration-200"
              >
                Return to Home
              </Link>
            </div>
          </FramerIn>
        </AnimatedPage>
      </>
    )
  }

  // Construct Discord Banner URL
  // If it's a hash, use Discord CDN. If it starts with http, it might be a full URL.
  const bannerUrl = profile.discord_banner 
    ? (profile.discord_banner.startsWith('http') 
        ? profile.discord_banner 
        : `https://cdn.discordapp.com/banners/${profile.discord_id}/${profile.discord_banner}.png?size=1024`)
    : null

  const metaDescription = profile.bio 
    ? profile.bio.substring(0, 160) 
    : `View ${profile.discord_username}'s profile on Realm Explorer. Discover their Minecraft server listings and community contributions.`;

  return (
    <>
      <MetaTags 
        title={`${profile.discord_username}'s Profile`}
        description={metaDescription}
        image={profile.discord_avatar || undefined}
        url={`/profile/${profile.discord_username}`}
        type="profile"
      />
      <AnimatedPage>
      {/* Profile Header / Banner */}
      <div 
        className="relative h-[15vh] md:h-[20vh] w-full overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {bannerUrl ? (
          <motion.img 
            initial={isMobile ? {} : { scale: 1.05 }}
            animate={isMobile ? {} : { scale: 1.1 }}
            style={isMobile ? undefined : { x: springX, y: springY }}
            transition={{ duration: 0.8 }}
            src={bannerUrl} 
            alt="Profile Banner" 
            className="w-full h-full object-cover will-change-[transform] absolute inset-0"
            fetchPriority="high"
            decoding="sync"
            loading="eager"
          />
        ) : (
          <motion.div 
            initial={isMobile ? {} : { scale: 1.05 }}
            animate={isMobile ? {} : { scale: 1.1 }}
            style={isMobile ? undefined : { x: springX, y: springY }}
            className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black relative will-change-[transform] absolute inset-0"
          >
            <div className="absolute inset-0 opacity-10 pixel-grid pointer-events-none"></div>
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
        
        {isOwnProfile && (
          <button 
            onClick={() => setIsBannerModalOpen(true)}
            className="absolute top-4 right-6 z-30 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-white/70 hover:text-white transition-all shadow-xl group"
            title="Update Profile Banner"
          >
            <Pencil className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

      <div className="w-full max-w-6xl mx-auto px-6 relative">
        {/* Profile Info Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 -mt-12 mb-8 relative z-10 px-2 md:px-0">
          <div 
            className={`w-24 h-24 md:w-28 md:h-28 rounded-xl bg-zinc-900 overflow-hidden shadow-2xl relative group flex-shrink-0 ${isProfileExplorerPlus ? 'border-2 border-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 'border-4 border-black'}`}
          >
            <img 
              src={profile.discord_avatar || ''} 
              alt={profile.discord_username || ''} 
              className="w-full h-full object-cover p-1"
              fetchPriority="high"
              decoding="sync"
              loading="eager"
              width={112}
              height={112}
            />
            <div className={`absolute inset-0 border rounded-[20px] pointer-events-none ${isProfileExplorerPlus ? 'border-yellow-400/20' : 'border-white/10'}`} />
          </div>

          <div className="flex-1 w-full text-left pt-2 md:pt-12">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                  <h1 className="text-base sm:text-lg md:text-2xl font-pixel text-white leading-tight break-all">
                    {profile.discord_username}
                  </h1>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={profile.role} className="ml-0" />
                    {hasSponsoredServers && <SponsorBadge className="ml-0" />}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-start gap-3 text-zinc-500 font-headline text-[10px] italic">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <div className="w-1 h-1 bg-zinc-800 rounded-full hidden md:block" />
                  <div className="flex items-center gap-1.5">
                    <Server className="w-3 h-3" />
                    {servers.length + projects.length} Public Listings
                  </div>
                </div>
              </div>

              {/* Like Button */}
              <div className="absolute right-2 top-14 md:static md:top-auto md:right-auto flex flex-shrink-0 items-center justify-start mt-0 md:mt-1">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`bg-zinc-900/80 hover:bg-zinc-800/80 border-b-[3px] border-zinc-950 active:border-b-0 active:border-t-[3px] active:border-t-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-all flex-shrink-0 flex items-center justify-center group ${likesData?.hasLiked ? 'text-red-500' : 'text-zinc-400 hover:text-red-500'}`}
                  title="Like Profile"
                >
                  <div className="relative flex items-center justify-center">
                    <AnimatePresence>
                      {justLiked && (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 1, borderWidth: '2px' }}
                          animate={{ scale: 2.5, opacity: 0, borderWidth: '0px' }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          onAnimationComplete={() => setJustLiked(false)}
                          className="absolute rounded-full border-red-500 bg-red-500/20 pointer-events-none"
                          style={{ width: '100%', height: '100%' }}
                        />
                      )}
                    </AnimatePresence>
                    <motion.div
                      animate={justLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                      transition={{ duration: 0.4, type: "spring", bounce: 0.6 }}
                      className="relative z-10"
                    >
                      <Heart className={`w-4 h-4 md:w-[18px] md:h-[18px] transition-transform ${likesData?.hasLiked ? 'fill-current text-red-500' : ''}`} />
                    </motion.div>
                  </div>
                  <span className="font-headline font-bold text-xs md:text-sm ml-1.5 md:ml-2">
                    {likesData?.count ?? profile.likes ?? 0}
                  </span>
                </button>
              </div>
            </div>

            {badges.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {badges.map((badge, idx) => (
                  <div 
                    key={`${badge.id}-${badge.month}`} 
                    className="group relative cursor-help"
                  >
                    <img 
                      src={badge.image_url.startsWith('http') ? badge.image_url : (badge.image_url.includes('/') ? `/${badge.image_url}` : `/badges/${badge.image_url}`)} 
                      alt={badge.name} 
                      width={36}
                      height={36}
                      className="w-7 h-7 md:w-9 md:h-9 object-contain"
                    />
                    
                    {/* Tooltip */}
                    <div className={`absolute bottom-full mb-2 w-48 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 translate-y-1 group-hover:translate-y-0 ${idx === 0 ? 'left-0 sm:left-1/2 sm:-translate-x-1/2' : 'left-1/2 -translate-x-1/2'}`}>
                      <div className="bg-zinc-950/90 border border-white/10 rounded-xl p-2.5 backdrop-blur-md shadow-xl text-center relative">
                        <p className="text-[9px] font-pixel text-realm-green uppercase mb-1 tracking-tighter">
                          {badge.name}
                          {badge.month && <span className="text-white/40 ml-1">({badge.month})</span>}
                        </p>
                        <p className="text-[9px] text-white/60 font-headline leading-tight italic">"{badge.description}"</p>
                      </div>
                      <div className={`w-2 h-2 bg-zinc-950 border-r border-b border-white/10 rotate-45 -mt-1 ${idx === 0 ? 'ml-3 sm:mx-auto' : 'mx-auto'}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-16">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Bio Section */}
            <div className="group/bio px-2">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-pixel text-[8px] text-white uppercase tracking-widest">
                  Bio
                </h3>
                {isOwnProfile && (
                  <button 
                    onClick={() => setIsBioModalOpen(true)}
                    className="p-1 text-zinc-600 hover:text-white transition-colors opacity-0 group-hover/bio:opacity-100"
                    title="Edit Bio"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              {profile.bio ? (
                <p className="text-zinc-400 font-headline text-xs leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              ) : isOwnProfile ? (
                <button 
                  onClick={() => setIsBioModalOpen(true)}
                  className="text-zinc-500 font-headline text-xs italic hover:text-zinc-300 transition-colors text-left"
                >
                  This user has no bio (how sad)
                </button>
              ) : (
                <p className="text-zinc-500 font-headline text-xs italic">
                  This user has no bio (how sad)
                </p>
              )}
            </div>

            {/* Links Section as Icon Buttons below Bio */}
            {((profile.social_links && profile.social_links.length > 0) || isOwnProfile) && (
              <div className="px-2">
                <div className="mb-2">
                  <h3 className="font-pixel text-[8px] text-white uppercase tracking-widest">
                    Links
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {profile.social_links?.map((link: SocialLink, i: number) => (
                    <a 
                      key={i}
                      href={link.platform === 'email' ? `mailto:${link.url}` : link.url}
                      onClick={(e) => link.platform === 'email' && handleEmailClick(e, link.url)}
                      target={link.platform === 'email' ? undefined : "_blank"}
                      rel={link.platform === 'email' ? undefined : "noopener noreferrer"}
                      title={link.platform === 'email' ? link.url : getPlatformName(link.platform)}
                      className={`w-9 h-9 rounded-lg bg-zinc-900/80 border transition-all flex items-center justify-center hover:scale-105 active:scale-95 shadow-sm ${getPlatformBorderColor(link.platform)} ${getPlatformColor(link.platform)}`}
                    >
                      {getSocialIcon(link.platform)}
                    </a>
                  ))}
                  {isOwnProfile && (
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="w-9 h-9 rounded-lg bg-zinc-900/50 border border-dashed border-white/10 hover:border-white/25 text-zinc-500 hover:text-white transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                      title={profile.social_links && profile.social_links.length > 0 ? "Edit Links" : "Add Links"}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Listings Section */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="font-pixel text-xs md:text-sm text-white flex items-center gap-2 flex-shrink-0">
                Public Listings
              </h2>
              
              <div className="flex items-center justify-between md:justify-end gap-3 flex-1">
                {/* Filter Controls */}
                <LayoutGroup id="profileListingFilter">
                  <div className="flex bg-zinc-900 border border-white/5 rounded-lg p-1 relative">
                    {(['latest', 'servers', 'projects'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setListingFilter(f)}
                        className={`relative px-4 py-1.5 text-[11px] md:text-xs font-headline font-bold capitalize tracking-wide rounded-md transition-colors z-10 ${
                          listingFilter === f 
                            ? 'text-white' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {listingFilter === f && (
                          isFilterMounted ? (
                            <motion.div
                              layoutId="listingFilterBg"
                              className="absolute inset-0 bg-zinc-800 rounded-md -z-10 shadow-sm border border-white/5"
                              transition={{ type: "spring", bounce: 0.15, duration: 0.25 }}
                            />
                          ) : (
                            <div
                              className="absolute inset-0 bg-zinc-800 rounded-md -z-10 shadow-sm border border-white/5"
                            />
                          )
                        )}
                        {f}
                      </button>
                    ))}
                  </div>
                </LayoutGroup>
              </div>
            </div>

            {serversLoading || projectsLoading ? (
              <div className="min-h-[350px]" />
            ) : allListings.length === 0 ? (
              <div className="w-full">
                <EmptyState 
                  title="No Approved Listings" 
                  message="This explorer hasn't published any listings matching the current filter." 
                  size="sm"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 will-change-transform">
                {allListings.map(listing => (
                  <div key={`${listing._listingType}-${listing.id}`}>
                    {listing._listingType === 'server' ? (
                      listing.is_sponsored ? (
                        <SponsorServerCard server={listing} />
                      ) : (
                        <DirectoryServerCard server={listing} showRole={true} />
                      )
                    ) : (
                      <ProjectCard project={listing} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Background Decorative Element */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-realm-green/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      {profile && (
        <Suspense fallback={null}>
          <EditProfileModal 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            profileId={profile.id}
            initialLinks={profile.social_links || []}
          />
          <EditBioModal 
            isOpen={isBioModalOpen}
            onClose={() => setIsBioModalOpen(false)}
            profileId={profile.id}
            initialBio={profile.bio}
          />
        </Suspense>
      )}
    </AnimatedPage>
      <Suspense fallback={null}>
        <EditBannerModal 
          isOpen={isBannerModalOpen}
          onClose={() => setIsBannerModalOpen(false)}
          profile={profile}
        />
      </Suspense>
    </>
  )
}
