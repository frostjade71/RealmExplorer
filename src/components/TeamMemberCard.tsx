import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useUserServers } from '../hooks/queries'
import type { TeamMember } from '../types'

export function TeamMemberCard({ member }: { member: TeamMember }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const { data: servers = [] } = useUserServers(member.user_id)
  
  const topServer = useMemo(() => {
    if (servers.length === 0) return null
    return [...servers].sort((a, b) => (b.votes || 0) - (a.votes || 0))[0]
  }, [servers])

  if (!member.profiles) return null

  const isOwner = member.role_title.toLowerCase().includes('owner')
  const isExecutive = member.role_title.toLowerCase().includes('executive')
  
  const frameColor = isOwner ? 'border-[#a855f7]' : 
                    isExecutive ? 'border-[#f97316]' : 
                    'border-white/10'

  return (
    <div 
      className={`relative w-[160px] md:w-full h-[220px] [perspective:1200px] group ${isFlipped ? 'z-50' : 'z-0'} cursor-pointer`}
      onClick={() => topServer && setIsFlipped(!isFlipped)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div 
        animate={{ rotateY: isFlipped && topServer ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        className="relative w-full h-full [transform-style:preserve-3d]"
      >
        {/* FRONT SIDE: Profile Info */}
        <div 
          className={`absolute inset-0 [backface-visibility:hidden] ${isFlipped && topServer ? 'pointer-events-none' : 'pointer-events-auto'}`}
        >
          <div className={`relative w-full h-full bg-[#313233] border-4 border-[#101010] p-5 text-center shadow-[5px_5px_0_rgba(0,0,0,0.5)]`}>
            {/* Inner Highlight Border */}
            <div className="absolute inset-0 border-t-2 border-l-2 border-white/10 pointer-events-none" />
            <div className="absolute inset-0 border-b-2 border-r-2 border-black/40 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full justify-center">
              <div className={`relative w-24 h-24 mx-auto mb-4 border-4 bg-black/40 shadow-inner ${frameColor}`}>
                <img 
                  src={member.profiles.discord_avatar || ''} 
                  alt={member.profiles.discord_username || ''} 
                  className="w-full h-full object-cover p-1"
                />
              </div>

              <h3 className="text-sm font-pixel text-white mb-2 truncate drop-shadow-md">
                {member.profiles.discord_username}
              </h3>
              
              <p className="inline-block px-2.5 py-0.5 bg-black/40 text-[9px] font-pixel text-white/40 uppercase tracking-[0.15em] border border-white/5 mx-auto">
                {member.role_title}
              </p>
            </div>
          </div>
        </div>

        {/* BACK SIDE: Top Server Info */}
        {topServer && (
          <div 
            className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] ${isFlipped ? 'pointer-events-auto z-50' : 'pointer-events-none'}`}
          >
            <Link 
              to={`/server/${topServer.slug}`} 
              className="block w-full h-full cursor-pointer relative z-50"
              onClick={() => {
                console.log('Navigating to:', topServer.slug);
                // No e.preventDefault() here to allow normal Link behavior
              }}
            >
              <div className="relative w-full h-full bg-[#313233] border-4 border-[#101010] p-4 text-center shadow-[5px_5px_0_rgba(0,0,0,0.5)] hover:bg-[#3c3c43] transition-colors">
                <div className="absolute inset-0 border-t-2 border-l-2 border-white/10 pointer-events-none" />
                <div className="absolute inset-0 border-b-2 border-r-2 border-black/40 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full items-center justify-center gap-2">
                  <div className="text-[8px] font-pixel text-realm-green uppercase tracking-widest">Top Listing</div>
                  
                  <div className="w-20 h-20 border-4 border-black/40 bg-black/20 p-1">
                    <img 
                      src={topServer.icon_url || ''} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="text-center w-full">
                    <div className="text-[10px] font-pixel text-white mb-1 truncate px-2">{topServer.name}</div>
                    <div className="text-[8px] font-pixel text-white/40 flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">stars</span>
                      {topServer.votes} Votes
                    </div>
                  </div>

                  <div className="mt-2 text-[8px] font-pixel text-[#85fc7e] underline">
                    Click to Visit
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
