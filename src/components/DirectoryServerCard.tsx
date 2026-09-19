import { Link } from 'react-router-dom'
import type { Server } from '../types'
import { CategoryBadge } from './CategoryBadge'
import { motion, type Variants } from 'framer-motion'
import { slugify } from '../lib/urlUtils'
import directoryHero from '../assets/hero/directoryhero.jpg'
import { Server as ServerIcon, Box, WifiOff } from 'lucide-react'

// Neomorphism base color: #121212
// Light shadow:  rgba(255,255,255,0.04)
// Dark shadow:   rgba(0,0,0,0.6)

export function DirectoryServerCard({ 
  server, 
  showStatus = false,
  actions,
  showRole = false,
  priority = false
}: { 
  server: Server, 
  showStatus?: boolean,
  actions?: React.ReactNode,
  showRole?: boolean,
  priority?: boolean
}) {
  const isPremium = server.profiles?.role === 'explorer+'
  const statusInfo = {
    approved: { label: 'Active', bg: 'bg-realm-green/10', text: 'text-realm-green' },
    pending: { label: 'Pending', bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
    rejected: { label: 'Rejected', bg: 'bg-red-500/10', text: 'text-red-500' },
    emailed: { label: 'Emailed', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    'Review Icon': { label: 'Review Icon', bg: 'bg-orange-500/10', text: 'text-orange-400' },
    'Review Cover': { label: 'Review Cover', bg: 'bg-orange-500/10', text: 'text-orange-400' },
    'Review Icon & Cover': { label: 'Review Icon & Cover', bg: 'bg-orange-500/10', text: 'text-orange-400' },
    'Review Gallery': { label: 'Review Gallery', bg: 'bg-orange-500/10', text: 'text-orange-400' },
    'Review Icon & Gallery': { label: 'Review Icon & Gallery', bg: 'bg-orange-500/10', text: 'text-orange-400' },
    'Review All Assets': { label: 'Review All Assets', bg: 'bg-orange-500/10', text: 'text-orange-400' }
  }[server.status as string] || { label: server.status, bg: 'bg-zinc-800', text: 'text-zinc-400' }

  const neoShadow = '6px 6px 14px rgba(0,0,0,0.55), -6px -6px 14px rgba(255,255,255,0.03)'
  const neoShadowHover = '8px 8px 20px rgba(0,0,0,0.65), -8px -8px 20px rgba(255,255,255,0.045)'
  const neoInset = 'inset 2px 2px 5px rgba(0,0,0,0.4), inset -2px -2px 5px rgba(255,255,255,0.03)'

  const cardVariants: Variants = {
    initial: { y: 0, scale: 1, boxShadow: neoShadow },
    hover: { 
      y: -4, 
      scale: 1.01,
      boxShadow: neoShadowHover,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 25,
        mass: 0.8
      } 
    },
    tap: { scale: 0.985 }
  }

  return (
    <Link to={`/server/${server.slug || slugify(server.name)}`} className="block h-full group relative">
      {/* Premium spinning border glow */}
      {isPremium && (
        <div className="absolute inset-0 z-0 rounded-xl overflow-hidden pointer-events-none p-[1.5px]">
          <div
            className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#FACC15_180deg,transparent_210deg,transparent_360deg)] opacity-40 animate-spin-slow"
          />
        </div>
      )}

      <motion.div 
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className={`relative flex flex-col h-full min-h-[350px] md:min-h-[380px] overflow-hidden cursor-pointer z-10 rounded-xl transition-shadow duration-300 ${
          isPremium ? 'border border-yellow-400/15' : 'border border-transparent'
        }`}
        style={{
          background: '#121212',
          margin: isPremium ? '1.5px' : undefined,
        }}
      >
        {/* Banner Image */}
        <div className="relative h-28 md:h-32 w-full overflow-hidden flex-shrink-0 rounded-t-xl">
          <img 
            src={server.banner_url || directoryHero} 
            alt={`${server.name} banner`} 
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            fetchPriority={priority ? 'high' : 'auto'}
            width={400}
            height={128}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent pointer-events-none" />
          
          {/* Live Status pill (Servers only) — neomorphic inset */}
          {server.type === 'server' && server.online_players !== undefined && server.online_players !== null && (
            <div 
              className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2 py-1 rounded-md"
              style={{
                background: '#121212',
                boxShadow: neoInset,
              }}
            >
              {server.online_players === -1 ? (
                <div className="flex items-center gap-1 text-red-500/80" title="Offline">
                  <WifiOff className="w-3 h-3" />
                  <span className="text-[10px] md:text-[11px] font-bold leading-none font-headline">
                    Offline
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-realm-green opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-realm-green" />
                  </div>
                  <span className="text-[10px] md:text-[11px] font-bold leading-none font-headline text-white">
                    {server.online_players}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative px-5 md:px-6 pt-0 pb-5 md:pb-6 flex flex-col flex-grow z-10">
          {/* Icon — neomorphic raised circle */}
          <div 
            className={`w-14 h-14 md:w-16 md:h-16 -mt-7 md:-mt-8 mb-3.5 rounded-xl overflow-hidden flex-shrink-0 z-20 ${
              isPremium ? 'ring-2 ring-yellow-400/40' : ''
            }`}
            style={{
              background: '#1e1e1e',
              boxShadow: '4px 4px 10px rgba(0,0,0,0.5), -4px -4px 10px rgba(255,255,255,0.03)',
            }}
          >
            {server.icon_url ? (
              <img src={server.icon_url} alt={server.name} loading={priority ? 'eager' : 'lazy'} decoding={priority ? 'sync' : 'async'} fetchPriority={priority ? 'high' : 'auto'} width={64} height={64} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 font-pixel text-xs">
                {server.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Title & Badges */}
          <div className="min-w-0 flex-grow pr-1 mb-3">
            {(() => {
              const nameParts = server.name.split(' ');
              const longestWord = Math.max(...nameParts.map(w => w.length));
              const hasVeryLongWord = longestWord > 12;
              const hasLongWord = longestWord > 10;
              
              const fontSizeClass = (server.name.length > 25 || hasVeryLongWord) 
                ? 'text-[11px] md:text-xs' 
                : (server.name.length > 15 || hasLongWord) 
                  ? 'text-xs md:text-sm' 
                  : 'text-sm md:text-base';

              return (
                <h3 className={`font-pixel ${fontSizeClass} text-zinc-100 line-clamp-2 mb-2 group-hover:text-white transition-colors duration-200 leading-tight break-words`}>
                  {server.name}
                </h3>
              );
            })()}

            {/* Badge row — using neomorphic inset pills */}
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              <div 
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-headline font-bold uppercase tracking-wider w-fit text-zinc-400"
                style={{
                  background: '#1e1e1e',
                  boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.35), inset -1px -1px 3px rgba(255,255,255,0.02)',
                }}
              >
                {server.type === 'server' ? (
                  <ServerIcon className="w-3 h-3 text-realm-green" />
                ) : (
                  <Box className="w-3 h-3 text-purple-500" />
                )}
                <span>{server.type === 'server' ? 'Server' : 'Realm'}</span>
              </div>

              {(showStatus || server.status !== 'approved') && (
                <span className={`px-1.5 md:px-2 py-0.5 text-[8px] md:text-[10px] font-bold uppercase tracking-wider rounded-md ${statusInfo.bg} ${statusInfo.text}`}>
                  {statusInfo.label}
                </span>
              )}
              <CategoryBadge category={server.category} variant="inset" />
            </div>
          </div>
          
          {/* Description */}
          <p className="text-zinc-400 text-[12px] md:text-[13px] flex-grow line-clamp-4 leading-relaxed mb-4 md:mb-5 group-hover:text-zinc-300 transition-colors duration-200">
            {server.description ? server.description.replace(/[#*`_~]/g, '') : "No description provided."}
          </p>
          
          {/* Footer — actions/role */}
          {(actions || showRole) && (
            <div 
              className="flex items-center justify-between pt-3 md:pt-4 mt-auto"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div className="flex items-center gap-4 w-full">
                {actions && (
                  <div onClick={(e) => e.stopPropagation()} className="flex items-center w-full">
                    {actions}
                  </div>
                )}
                
                {showRole && (
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest font-headline mb-0.5">Role</span>
                    <span className={`text-[10px] md:text-xs font-pixel uppercase leading-none tracking-tight ${
                      (server.submitter_role || 'Owner') === 'Owner' ? 'text-yellow-400' : 'text-realm-green'
                    }`}>
                      {server.submitter_role || 'Owner'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </motion.div>
    </Link>
  )
}
