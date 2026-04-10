import { useParams, Link } from 'react-router-dom'
import { useProfileByUsername, useUserServers } from '../hooks/queries'
import { useAuth } from '../contexts/AuthContext'
import { ServerCard } from '../components/ServerCard'
import { LoadingSpinner, EmptyState } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion } from 'framer-motion'
import { Calendar, Server, ArrowLeft, LayoutDashboard, Globe, Pencil, Share2 } from 'lucide-react'
import { SiDiscord, SiInstagram, SiYoutube, SiTiktok, SiFacebook, SiTwitch } from 'react-icons/si'
import { RoleBadge } from '../components/RoleBadge'
import { EditProfileModal } from '../components/EditProfileModal'
import { useState } from 'react'
import type { SocialLink } from '../types'

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfileByUsername(username)
  const { data: servers = [], isLoading: serversLoading } = useUserServers(profile?.id, 'approved')
  const { user } = useAuth()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const isOwnProfile = user?.id === profile?.id

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'discord': return <SiDiscord className="w-4 h-4" />
      case 'instagram': return <SiInstagram className="w-4 h-4" />
      case 'youtube': return <SiYoutube className="w-4 h-4" />
      case 'tiktok': return <SiTiktok className="w-4 h-4" />
      case 'facebook': return <SiFacebook className="w-4 h-4" />
      case 'twitch': return <SiTwitch className="w-4 h-4" />
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
      default: return 'text-zinc-400'
    }
  }

  const getPlatformName = (platform: string) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1)
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

  return (
    <AnimatedPage>
      {/* Profile Header / Banner */}
      <div className="relative h-[15vh] md:h-[20vh] w-full overflow-hidden">
        {bannerUrl ? (
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            src={bannerUrl} 
            alt="Profile Banner" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black relative">
            <div className="absolute inset-0 opacity-10 pixel-grid pointer-events-none"></div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Profile Info Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 -mt-12 mb-8 relative z-10 px-2 md:px-0">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-zinc-900 border-4 border-black overflow-hidden shadow-2xl relative group"
          >
            <img 
              src={profile.discord_avatar || ''} 
              alt={profile.discord_username || ''} 
              className="w-full h-full object-cover p-1"
            />
            <div className="absolute inset-0 border border-white/10 rounded-[28px] pointer-events-none" />
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
          </FramerIn>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-16">
          {/* Sidebar / Personal Links */}
          <div className="lg:col-span-1 space-y-6">
            <FramerIn delay={0.4} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 backdrop-blur-xl group/sidebar relative">
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
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950/50 border border-white/5 hover:border-realm-green/30 hover:bg-zinc-800 transition-all group/link"
                      >
                        <div className={`w-8 h-8 flex items-center justify-center transition-colors ${getPlatformColor(link.platform)}`}>
                          {getSocialIcon(link.platform)}
                        </div>
                        <span className="text-xs font-headline text-zinc-400 group-hover/link:text-zinc-200 transition-colors">
                          {getPlatformName(link.platform)}
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center bg-zinc-950/30 rounded-xl border border-dashed border-white/5">
                    <Share2 className="w-6 h-6 text-zinc-800 mx-auto mb-2" />
                    <p className="text-[9px] text-zinc-600 uppercase font-headline tracking-tighter">No links shared yet</p>
                  </div>
                )}
              </div>
            </FramerIn>

            {/* Potential Bio/Social Section could go here later */}
          </div>

          {/* Listings Section */}
          <div className="lg:col-span-3">
            <FramerIn delay={0.5} className="mb-6 flex items-center justify-between">
              <h2 className="font-pixel text-sm text-white">Public Listings</h2>
              <div className="h-px flex-1 bg-zinc-800 mx-4 hidden md:block"></div>
              {isOwnProfile && (
                <Link 
                  to="/dashboard"
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all border border-white/5 active:scale-95 flex-shrink-0"
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
                    <ServerCard server={server} />
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
        <EditProfileModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profileId={profile.id}
          initialLinks={profile.social_links || []}
        />
      )}
    </AnimatedPage>
  )
}
