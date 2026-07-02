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

export function SponsorServerCard({ 
  server, 
  showStatus = false,
  actions,
  showRole = false,
  hideVotes = false,
  hideRatings = false
}: { 
  server: Server, 
  showStatus?: boolean,
  actions?: React.ReactNode,
  showRole?: boolean,
  hideVotes?: boolean,
  hideRatings?: boolean
}) {
  const statusInfo = {
    approved: { label: 'Active', bg: 'bg-realm-green/10', text: 'text-realm-green' },
    pending: { label: 'Pending', bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
    rejected: { label: 'Rejected', bg: 'bg-red-500/10', text: 'text-red-500' }
  }[server.status as string] || { label: server.status, bg: 'bg-zinc-800', text: 'text-zinc-400' }

  // Dynamic color themes
  const colorThemes: Record<string, {
    glow: string, conic1: string, conic2: string, border: string,
    barFrom: string, barVia: string, barTo: string, barShadow: string,
    accent: string, borderAccent: string
  }> = {
    diamond: {
      glow: 'from-cyan-500 via-teal-400 to-cyan-500',
      conic1: '#22d3ee', conic2: '#2dd4bf',
      border: 'border-cyan-400/20', barFrom: 'from-cyan-400', barVia: 'via-teal-300', barTo: 'to-cyan-400',
      barShadow: 'shadow-[0_0_15px_rgba(34,211,238,0.5)]',
      accent: 'text-cyan-400', borderAccent: 'border-cyan-400'
    },
    royal_blue: {
      glow: 'from-blue-600 via-indigo-500 to-blue-600',
      conic1: '#2563eb', conic2: '#4f46e5',
      border: 'border-blue-500/20', barFrom: 'from-blue-500', barVia: 'via-indigo-400', barTo: 'to-blue-500',
      barShadow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
      accent: 'text-blue-400', borderAccent: 'border-blue-500'
    },
    emerald: {
      glow: 'from-emerald-600 via-green-500 to-emerald-600',
      conic1: '#059669', conic2: '#10b981',
      border: 'border-emerald-500/20', barFrom: 'from-emerald-500', barVia: 'via-green-400', barTo: 'to-emerald-500',
      barShadow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]',
      accent: 'text-emerald-400', borderAccent: 'border-emerald-500'
    },
    dandelion: {
      glow: 'from-yellow-500 via-amber-400 to-yellow-500',
      conic1: '#eab308', conic2: '#f59e0b',
      border: 'border-yellow-400/20', barFrom: 'from-yellow-400', barVia: 'via-amber-300', barTo: 'to-yellow-400',
      barShadow: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]',
      accent: 'text-yellow-400', borderAccent: 'border-yellow-400'
    },
    white: {
      glow: 'from-zinc-300 via-white to-zinc-300',
      conic1: '#e4e4e7', conic2: '#ffffff',
      border: 'border-white/20', barFrom: 'from-zinc-300', barVia: 'via-white', barTo: 'to-zinc-300',
      barShadow: 'shadow-[0_0_15px_rgba(255,255,255,0.3)]',
      accent: 'text-zinc-300', borderAccent: 'border-white'
    }
  }

  const theme = colorThemes[server.sponsor_border_color || 'diamond'] || colorThemes.diamond

  const cardVariants: Variants = {
    initial: { y: 0, scale: 1 },
    hover: { 
      y: -8, 
      scale: 1.02,
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 20,
        mass: 1
      } 
    },
    tap: { scale: 0.98 }
  }

  const shineVariants: Variants = {
    initial: { left: '-100%' },
    hover: { left: '100%', transition: { duration: 0.8, ease: 'easeInOut' } }
  }

  return (
    <Link to={`/server/${server.slug || slugify(server.name)}`} className="block h-full group relative">
      <div className="absolute inset-0 z-0 rounded-lg overflow-hidden pointer-events-none p-[1.5px]">
        <div className={`absolute inset-0 bg-gradient-to-r ${theme.glow} rounded-lg blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300`} />
        <div
          className={`absolute inset-[-200%] opacity-100 animate-spin-slow`}
          style={{ background: `conic-gradient(from 0deg, transparent 0deg, transparent 120deg, ${theme.conic1} 180deg, ${theme.conic2} 240deg, transparent 300deg, transparent 360deg)` }}
        />
      </div>

      <motion.div 
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className={`bg-zinc-950 border ${theme.border} rounded-lg flex flex-col h-full min-h-[350px] md:min-h-[380px] overflow-hidden relative cursor-pointer shadow-xl transition-colors duration-200 z-10 m-[1.5px] backdrop-blur-sm`}
      >
        <motion.div 
          variants={shineVariants}
          className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent z-30 pointer-events-none transform -skew-x-12"
        />

        <div className="relative h-24 md:h-28 w-full overflow-hidden bg-zinc-900/60 flex-shrink-0">
          <img 
            src={server.banner_url || directoryHero} 
            alt={`${server.name} banner`} 
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/20 to-transparent pointer-events-none" />

          {(!hideRatings || !hideVotes) && (
            <div className={`absolute top-2 right-2 z-20 flex items-center gap-2 bg-black/75 border ${theme.border} px-2 py-1 rounded-md backdrop-blur-md shadow-md`}>
              {!hideRatings && (
                <div className="flex items-center gap-1">
                  <img 
                    src={ratingIcon} 
                    alt="" 
                    className={`w-4 h-4 object-contain ${server.average_rating === 0 ? 'grayscale opacity-60' : ''}`} 
                  />
                  <span className="text-[10px] md:text-xs font-bold text-white leading-none">
                    {server.average_rating > 0 ? server.average_rating.toFixed(1) : '0.0'}
                  </span>
                </div>
              )}
              {!hideRatings && !hideVotes && (
                <div className={`w-[1px] h-3 ${theme.accent.replace('text-', 'bg-')}/20 self-center`} />
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

        <div className={`absolute top-0 left-0 right-0 h-[3px] z-20 bg-gradient-to-r ${theme.barFrom} ${theme.barVia} ${theme.barTo} ${theme.barShadow}`} />

        {/* Content Container */}
        <div className="relative p-4 md:p-5 pt-0 flex flex-col flex-grow z-10">
          <div 
            className={`w-14 h-14 md:w-16 md:h-16 -mt-7 md:-mt-8 mb-3 bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0 border-2 shadow-lg z-20 ${theme.borderAccent}`}
          >
            {server.icon_url ? (
              <img src={server.icon_url} alt={server.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${theme.accent} font-pixel text-xs`}>
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
                <h3 className={`font-pixel text-white ${fontSizeClass} line-clamp-2 mb-1.5 transition-colors leading-tight break-words`}>
                  {server.name}
                </h3>
              );
            })()}
            
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-headline font-bold uppercase tracking-wider w-fit bg-zinc-900 border ${theme.border} text-white`}>
                <img 
                  src={server.type === 'server' ? serverGif : realmGif} 
                  alt="" 
                  className="w-3 h-3 object-contain rounded-sm" 
                />
                <span>{server.type === 'server' ? 'Server' : 'Realm'}</span>
              </div>

              {showStatus && server.status !== 'approved' && (
                <span className={`px-1.5 md:px-2 py-0.5 text-[8px] md:text-[10px] font-bold uppercase tracking-wider rounded border border-current/10 ${statusInfo.bg} ${statusInfo.text}`}>
                  {statusInfo.label}
                </span>
              )}
              <CategoryBadge category={server.category} />
            </div>
          </div>
          
          <p className="text-zinc-300 text-[12px] md:text-[13px] flex-grow line-clamp-4 leading-relaxed mb-4 md:mb-6 group-hover:text-zinc-150 transition-colors">
            {server.description ? server.description.replace(/[#*`_~]/g, '') : "No description provided."}
          </p>

          {(actions || showRole) && (
            <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-zinc-800 mt-auto">
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
