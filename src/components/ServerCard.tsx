import { Link } from 'react-router-dom'
import type { Server } from '../types'
import { CategoryBadge } from './CategoryBadge'
import voteIcon from '../assets/leaderboards/1139-voteup.png'
import ratingIcon from '../assets/leaderboards/star.png'
import { motion, type Variants } from 'framer-motion'
import { slugify } from '../lib/urlUtils'
import directoryHero from '../assets/hero/directoryhero.jpg'
import serverGif from '../assets/category/gif/6128-minecraft.gif'
import realmGif from '../assets/category/gif/9677-minecraftnetherportalblock (2).gif'

export function ServerCard({ 
  server, 
  showStatus = false,
  actions,
  hideVotes = false,
  showRole = false,
  hideRatings = false
}: { 
  server: Server, 
  showStatus?: boolean,
  actions?: React.ReactNode,
  hideVotes?: boolean,
  showRole?: boolean,
  hideRatings?: boolean
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
    'Review Cover & Gallery': { label: 'Review Cover & Gallery', bg: 'bg-orange-500/10', text: 'text-orange-400' },
    'Review All Assets': { label: 'Review All Assets', bg: 'bg-orange-500/10', text: 'text-orange-400' }
  }[server.status as string] || { label: server.status, bg: 'bg-zinc-800', text: 'text-zinc-400' }

  const cardVariants: Variants = {
    initial: { y: 0, scale: 1 },
    hover: { 
      y: -6, 
      scale: 1.01,
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 25,
        mass: 1
      } 
    },
    tap: { scale: 0.98 }
  }

  const highlightVariants: Variants = {
    initial: { opacity: 0, y: -2 },
    hover: { opacity: 1, y: 0, transition: { duration: 0.15 } }
  }

  return (
    <Link to={`/server/${server.slug || slugify(server.name)}`} className="block h-full group relative">
      {isPremium && (
        <div className="absolute inset-0 z-0 rounded-lg overflow-hidden pointer-events-none p-[1.5px]">
          <div
            className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#FACC15_180deg,transparent_210deg,transparent_360deg)] opacity-60 animate-spin-slow"
          />
        </div>
      )}
      <motion.div 
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className={`bg-surface border rounded-lg flex flex-col h-full min-h-[350px] md:min-h-[380px] overflow-hidden relative cursor-pointer shadow-sm transition-colors duration-200 z-10 ${
          isPremium 
            ? 'border-yellow-400/30' 
            : 'border-outline-variant/30 hover:border-realm-green/30'
        }`}
        style={isPremium ? { margin: '1.5px' } : {}}
      >
        <div className="relative h-24 md:h-28 w-full overflow-hidden bg-zinc-900/60 flex-shrink-0">
          <img 
            src={server.banner_url || directoryHero} 
            alt={`${server.name} banner`} 
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          
          {(!hideRatings || !hideVotes) && (
            <div className="absolute top-2 right-2 z-20 flex items-center gap-2 bg-black/60 border border-white/10 px-2 py-1 rounded-md backdrop-blur-md shadow-md">
              {!hideRatings && (
                <div className="flex items-center gap-1">
                  <img 
                    src={ratingIcon} 
                    alt="" 
                    className={`w-4 h-4 object-contain ${server.average_rating === 0 ? 'grayscale opacity-60' : ''}`} 
                  />
                  <span className="text-[10px] md:text-xs font-bold text-white/90 leading-none">
                    {server.average_rating > 0 ? server.average_rating.toFixed(1) : '0.0'}
                  </span>
                </div>
              )}
              {!hideRatings && !hideVotes && (
                <div className="w-[1px] h-3 bg-white/20 self-center" />
              )}
              {!hideVotes && (
                <div className="flex items-center gap-1">
                  <img src={voteIcon} alt="" className="w-3.5 h-3.5 object-contain" />
                  <span className="text-[10px] md:text-xs font-bold text-white/90 leading-none">
                    {server.votes.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* GPU-Friendly Top Highlight Bar */}
        <motion.div 
          variants={highlightVariants}
          className={`absolute top-0 left-0 right-0 h-[3px] z-20 ${
            isPremium
              ? 'bg-yellow-400'
              : 'bg-realm-green shadow-[0_0_15px_rgba(78,196,78,0.4)]'
          }`}
        />

        {/* High-Performance Shadow Layer */}
        <motion.div 
          variants={{
            initial: { opacity: 0 },
            hover: { opacity: 1 }
          }}
          className="absolute inset-0 shadow-2xl shadow-green-950/40 -z-10 pointer-events-none"
        />

        {/* Content Container */}
        <div className="relative p-4 md:p-5 pt-0 flex flex-col flex-grow z-10">
          <div 
            className={`w-14 h-14 md:w-16 md:h-16 -mt-7 md:-mt-8 mb-3 bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0 border-2 shadow-md z-20 ${
              isPremium ? 'border-[#f2a929]' : 'border-zinc-800'
            }`}
          >
            {server.icon_url ? (
              <img src={server.icon_url} alt={server.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 font-pixel text-xs">
                {server.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Title & Badges area */}
          <div className="min-w-0 flex-grow pr-1 mb-3.5">
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
                <h3 className={`font-pixel ${fontSizeClass} line-clamp-2 mb-1.5 group-hover:text-white transition-colors leading-tight break-words`}>
                  {server.name}
                </h3>
              );
            })()}
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-headline font-bold uppercase tracking-wider w-fit bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                <img 
                  src={server.type === 'server' ? serverGif : realmGif} 
                  alt="" 
                  className="w-3 h-3 object-contain rounded-sm" 
                />
                <span>{server.type === 'server' ? 'Server' : 'Realm'}</span>
              </div>

              {(showStatus || server.status !== 'approved') && (
                <span className={`px-1.5 md:px-2 py-0.5 text-[8px] md:text-[10px] font-bold uppercase tracking-wider rounded border border-current/10 ${statusInfo.bg} ${statusInfo.text}`}>
                  {statusInfo.label}
                </span>
              )}
              <CategoryBadge category={server.category} />
            </div>
            </div>
          
          <p className="text-on-surface-variant text-[12px] md:text-[13px] flex-grow line-clamp-4 leading-relaxed mb-4 md:mb-6 group-hover:text-zinc-200 transition-colors">
            {server.description ? server.description.replace(/[#*`_~]/g, '') : "No description provided."}
          </p>
          
          {(actions || showRole) && (
            <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-outline-variant/20 mt-auto">
              <div className="flex items-center gap-4 md:gap-6">
              </div>
              
              <div className="flex items-center gap-4">
                {actions && (
                  <div onClick={(e) => e.stopPropagation()} className="flex items-center">
                    {actions}
                  </div>
                )}
                
                {showRole && (
                  <div className="flex flex-col items-end">
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
