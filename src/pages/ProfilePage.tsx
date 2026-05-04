import { useParams, Link } from 'react-router-dom'
import { useProfileByUsername, useUserServers, useEntityBadges } from '../hooks/queries'
import { useAuth } from '../contexts/AuthContext'
import { ServerCard } from '../components/ServerCard'
import { LoadingSpinner, EmptyState } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion } from 'framer-motion'
import { Calendar, Server, ArrowLeft, LayoutDashboard, Globe, Pencil, Share2, Mail } from 'lucide-react'
import { SiDiscord, SiInstagram, SiYoutube, SiTiktok, SiFacebook, SiTwitch } from 'react-icons/si'
import { RoleBadge } from '../components/RoleBadge'
import { EditProfileModal } from '../components/EditProfileModal'
import { EditBioModal } from '../components/EditBioModal'
import { EditBannerModal } from '../components/EditBannerModal'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useState } from 'react'
import { toast } from 'sonner'
import type { SocialLink } from '../types'

import { MetaTags } from '../components/MetaTags'

export function ProfilePage() {
  const isMobile = useIsMobile()
  const { username } = useParams<{ username: string }>()
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfileByUsername(username)
  const { data: servers = [], isLoading: serversLoading } = useUserServers(profile?.id, 'approved')
  const { data: badges = [] } = useEntityBadges(profile?.id, 'user')
  const { user, isExplorerPlus } = useAuth()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isBioModalOpen, setIsBioModalOpen] = useState(false)
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false)

  const isOwnProfile = user?.id === profile?.id
  const isProfileExplorerPlus = profile?.role === 'explorer+'

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'discord': return <SiDiscord className="w-4 h-4" />
      case 'instagram': return <SiInstagram className="w-4 h-4" />
      case 'youtube': return <SiYoutube className="w-4 h-4" />
      case 'tiktok': return <SiTiktok className="w-4 h-4" />
      case 'facebook': return <SiFacebook className="w-4 h-4" />
      case 'twitch': return <SiTwitch className="w-4 h-4" />
      case 'email': return <Mail className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'discord': return 'text-[#5865F2]'
      case 'instagram': return 'text-[#E4405F]'
      case 'youtube': return 'text-[#FF0000]'
      case 'tiktok': return 'text-[#00f2ea]' 
      case 'facebook': return 'text-[#1877F2]'
      case 'twitch': return 'text-[#9146FF]'
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
      case 'tiktok': return 'border-[#00f2ea]/20 hover:border-[#00f2ea]/40'
      case 'facebook': return 'border-[#1877F2]/20 hover:border-[#1877F2]/40'
      case 'twitch': return 'border-[#9146FF]/20 hover:border-[#9146FF]/40'
      case 'email': return 'border-white/10 hover:border-white/20'
      case 'website': return 'border-blue-400/20 hover:border-blue-400/40'
      default: return 'border-white/5 hover:border-white/10'
    }
  }

  const getPlatformName = (platform: string) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1)
  }

  const handleEmailClick = (_e: React.MouseEvent, email: string) => {
    // Copy to clipboard fallback
    navigator.clipboard.writeText(email)
    toast.success('Email Copied', {
      description: 'The email address has been copied to your clipboard.'
    })
    
    // We don't prevent default here so the mailto: still tries to fire
  }

  if (profileLoading) return <LoadingSpinner />
  
  if (profileError || !profile) {
    return (
      <AnimatedPage className="min-h-[70vh] flex flex-col items-center justify-center px-8">
        <FramerIn className="text-center">
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
            <span className="material-symbols-outlined text-4xl text-zinc-600">person_off</span>
          </div>
          <h1 className="text-2xl font-pixel text-white mb-2 uppercase">Explorer Not Found</h1>
          <p className="text-zinc-500 font-headline mb-8">We couldn't find an explorer with the username "@{username}"</p>
          <Link to="/" className="text-realm-green font-pixel text-xs hover:underline flex items-center gap-2 justify-center">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </FramerIn>
      </AnimatedPage>
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
      <div className="relative h-[15vh] md:h-[20vh] w-full overflow-hidden">
        {bannerUrl ? (
          <motion.img 
            initial={isMobile ? { opacity: 0 } : { scale: 1.1, opacity: 0 }}
            animate={isMobile ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            src={bannerUrl} 
            alt="Profile Banner" 
            className="w-full h-full object-cover will-change-[opacity,transform]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black relative">
            <div className="absolute inset-0 opacity-10 pixel-grid pointer-events-none"></div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        
        {isOwnProfile && (
          <button 
            onClick={() => {
              if (isExplorerPlus) {
                setIsBannerModalOpen(true)
              } else {
                toast.info('Explorer+ Feature', {
                  description: 'Upgrade to Explorer+ to customize your profile banner!'
                })
              }
            }}
            className="absolute top-4 right-6 z-30 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-white/70 hover:text-white transition-all shadow-xl group"
            title={isExplorerPlus ? "Update Profile Banner" : "Upgrade to unlock Banner"}
          >
            <Pencil className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Profile Info Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 -mt-12 mb-8 relative z-10 px-2 md:px-0">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`w-24 h-24 md:w-28 md:h-28 rounded-xl bg-zinc-900 overflow-hidden shadow-2xl relative group ${isProfileExplorerPlus ? 'border-2 border-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 'border-4 border-black'}`}
          >
            <img 
              src={profile.discord_avatar || ''} 
              alt={profile.discord_username || ''} 
              className="w-full h-full object-cover p-1"
            />
            <div className={`absolute inset-0 border rounded-[20px] pointer-events-none ${isProfileExplorerPlus ? 'border-yellow-400/20' : 'border-white/10'}`} />
          </motion.div>

          <FramerIn delay={0.3} className="flex-1 text-left pt-2 md:pt-12">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
              <h1 className={`${(profile.discord_username?.length || 0) > 15 ? 'text-[8px]' : (profile.discord_username?.length || 0) > 10 ? 'text-[10px]' : (profile.discord_username?.length || 0) > 7 ? 'text-[13px]' : 'text-[15px]'} md:text-2xl font-pixel text-white leading-tight break-all`}>
                {profile.discord_username}
              </h1>
              {profile.role !== 'explorer' && (
                <RoleBadge role={profile.role} className="ml-0" />
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-start gap-3 text-zinc-500 font-headline text-[10px] italic">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <div className="w-1 h-1 bg-zinc-800 rounded-full hidden md:block" />
              <div className="flex items-center gap-1.5">
                <Server className="w-3 h-3" />
                {servers.length} Public Listings
              </div>
            </div>

            {/* User Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {badges.map((badge, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + (idx * 0.1) }}
                    key={`${badge.id}-${badge.month}`} 
                    className="group relative cursor-help"
                  >
                    <img 
                      src={new URL(`../assets/badges/${badge.image_url}`, import.meta.url).href} 
                      alt={badge.name} 
                      className="w-7 h-7 md:w-9 md:h-9 object-contain"
                    />
                    
                    {/* Tooltip */}
                    <div className={`absolute bottom-full mb-2 w-48 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 translate-y-1 group-hover:translate-y-0 ${idx === 0 ? 'left-0' : 'left-1/2 -translate-x-1/2'}`}>
                      <div className="bg-zinc-950/90 border border-white/10 rounded-xl p-2.5 backdrop-blur-md shadow-xl text-center relative">
                        <p className="text-[9px] font-pixel text-realm-green uppercase mb-1 tracking-tighter">
                          {badge.name}
                          {badge.month && <span className="text-white/40 ml-1">({badge.month})</span>}
                        </p>
                        <p className="text-[9px] text-white/60 font-headline leading-tight italic">"{badge.description}"</p>
                      </div>
                      <div className={`w-2 h-2 bg-zinc-950 border-r border-b border-white/10 rotate-45 -mt-1 ${idx === 0 ? 'ml-2.5 md:ml-3.5' : 'mx-auto'}`} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </FramerIn>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-16">
          {/* Sidebar / Personal Links */}
          <div className="lg:col-span-1 space-y-6">
            <FramerIn delay={0.4} className="space-y-6">
              {/* Bio Section */}
              {(profile.bio || isOwnProfile) && (
                <div className="group/bio px-2">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-pixel text-[8px] text-zinc-500 uppercase tracking-widest">
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
                      className="text-zinc-600 font-headline text-xs italic hover:text-zinc-400 transition-colors"
                    >
                      Click to add a bio...
                    </button>
                  ) : null}
                </div>
              )}

              {/* Personal Links Card */}
              <div className={`bg-zinc-900/50 border border-white/5 rounded-lg p-4 ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-xl'} group/sidebar relative will-change-transform`}>
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                  <h3 className="font-pixel text-[8px] text-zinc-400 uppercase tracking-widest">
                    Personal Links
                  </h3>
                  {isOwnProfile && (
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="p-1 text-zinc-500 hover:text-white transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {profile.social_links && profile.social_links.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {profile.social_links.map((link: SocialLink, i: number) => (
                        <a 
                          key={i}
                          href={link.platform === 'email' ? `mailto:${link.url}` : link.url}
                          onClick={(e) => link.platform === 'email' && handleEmailClick(e, link.url)}
                          target={link.platform === 'email' ? undefined : "_blank"}
                          rel={link.platform === 'email' ? undefined : "noopener noreferrer"}
                          className={`flex items-center gap-3 p-2.5 rounded-md bg-zinc-950/50 border transition-all group/link overflow-hidden ${getPlatformBorderColor(link.platform)}`}
                        >
                          <div className={`w-8 h-8 flex items-center justify-center transition-colors flex-shrink-0 ${getPlatformColor(link.platform)} group-hover/link:scale-110 duration-300`}>
                            {getSocialIcon(link.platform)}
                          </div>
                          <span className="text-xs font-headline text-zinc-400 group-hover/link:text-zinc-200 transition-colors truncate">
                            {link.platform === 'email' ? link.url : getPlatformName(link.platform)}
                          </span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-zinc-950/30 rounded-md border border-dashed border-white/5">
                      <Share2 className="w-6 h-6 text-zinc-800 mx-auto mb-2" />
                      <p className="text-[9px] text-zinc-600 uppercase font-headline tracking-tighter">No links shared yet</p>
                    </div>
                  )}
                </div>
              </div>
            </FramerIn>

            {/* Potential Bio/Social Section could go here later */}
          </div>

          {/* Listings Section */}
          <div className="lg:col-span-3">
            <FramerIn delay={0.5} className="mb-6 flex items-center justify-between">
              <h2 className="font-pixel text-xs md:text-sm text-white">Public Listings</h2>
              <div className={`h-px flex-1 ${isProfileExplorerPlus ? 'bg-yellow-400/40' : 'bg-zinc-800'} mx-4 hidden md:block`}></div>
              {isOwnProfile && (
                <Link 
                  to="/dashboard"
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-md transition-all border border-white/5 active:scale-95 flex-shrink-0"
                  title="Go to Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4" />
                </Link>
              )}
            </FramerIn>

            {serversLoading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : servers.length === 0 ? (
              <FramerIn delay={0.6}>
                <EmptyState 
                  title="No Approved Listings" 
                  message="This explorer hasn't published any servers or realms yet." 
                />
              </FramerIn>
            ) : (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {servers.map(server => (
                   <motion.div 
                    key={server.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <ServerCard server={server} showRole={true} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Background Decorative Element */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-realm-green/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      {profile && (
        <>
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
        </>
      )}
    </AnimatedPage>
      <EditBannerModal 
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        profile={profile}
      />
    </>
  )
}
