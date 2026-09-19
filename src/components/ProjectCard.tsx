import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { slugify } from '../lib/urlUtils'
import { Download, Heart, Clock, CheckCircle, Archive, Edit3, Package, PackageOpen, Braces, Glasses, Hammer, PlusCircle, Paintbrush, Activity, Layers, ArrowUpSquare, Star, Box, Plug } from 'lucide-react'
import directoryHero from '../assets/hero/directoryprojets.jpg'
import serverGif from '../assets/category/gif/6128-minecraft.gif'
import realmGif from '../assets/category/gif/9677-minecraftnetherportalblock (2).gif'

export function ProjectCard({ 
  project, 
  showStatus = false,
  actions,
  priority = false,
}: { 
  project: any, 
  showStatus?: boolean,
  actions?: React.ReactNode,
  priority?: boolean,
}) {
  const statusInfo = {
    draft: { label: 'Draft', bg: 'bg-zinc-800 border-zinc-700', text: 'text-zinc-400', icon: <Edit3 className="w-3 h-3" /> },
    published: { label: 'Published', bg: 'bg-realm-green/10', text: 'text-realm-green', icon: <CheckCircle className="w-3 h-3" /> },
    approved: { label: 'Approved', bg: 'bg-realm-green/10 border-transparent', text: 'text-realm-green', icon: null },
    archived: { label: 'Archived', bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-500', icon: <Archive className="w-3 h-3" /> },
    pending: { label: 'Pending', bg: 'bg-orange-500/10 border-orange-500/50', text: 'text-orange-500', icon: <Clock className="w-3 h-3 text-orange-500" /> },
    rejected: { label: 'Rejected', bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-500', icon: null }
  }[project.status as 'draft' | 'published' | 'archived' | 'pending' | 'approved' | 'rejected'] || { label: project.status, bg: 'bg-zinc-800', text: 'text-zinc-400', icon: <Edit3 className="w-3 h-3" /> }

  const getCategoryIcon = (c: string) => {
    const lower = (c || '').toLowerCase();
    const Icon = lower.includes('modpacks') ? PackageOpen :
                 lower.includes('mods') ? Package :
                 lower.includes('datapacks') ? Braces :
                 lower.includes('shaders') ? Glasses :
                 lower.includes('plugins') ? Plug :
                 lower.includes('resource') ? Paintbrush :
                 lower.includes('builds') ? Hammer :
                 lower.includes('behavior') ? Activity :
                 lower.includes('add-ons') ? PlusCircle :
                 Layers;
    return <Icon className="w-3 h-3" />
  }

  const cardVariants: Variants = {
    initial: { y: 0, scale: 1 },
    hover: { 
      y: -6, 
      scale: 1.01,
      transition: { type: 'spring', stiffness: 400, damping: 25, mass: 1 } 
    },
    tap: { scale: 0.98 }
  }


  const isServer = project.type === 'server' || project.type === 'realm' || project.votes !== undefined;
  const itemUrl = isServer 
    ? `/server/${project.slug || slugify(project.name)}`
    : `/projects/${project.slug || slugify(project.name)}`;

  // Neomorphism shadow values
  const neoShadow = '6px 6px 14px rgba(0,0,0,0.55), -6px -6px 14px rgba(255,255,255,0.03)'
  const neoShadowHover = '8px 8px 20px rgba(0,0,0,0.65), -8px -8px 20px rgba(255,255,255,0.045)'
  const neoInset = 'inset 2px 2px 5px rgba(0,0,0,0.4), inset -2px -2px 5px rgba(255,255,255,0.03)'

  return (
    <Link to={itemUrl} className="block h-full group relative">
      <motion.div 
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className={`bg-[#121212] border border-transparent rounded-xl flex flex-col h-full min-h-[350px] md:min-h-[380px] overflow-hidden relative cursor-pointer transition-shadow duration-300 z-10`}
        style={{
          boxShadow: neoShadow,
        }}
        onHoverStart={(e) => {
          const el = e.target as HTMLElement
          if (el) el.style.boxShadow = neoShadowHover
        }}
        onHoverEnd={(e) => {
          const el = e.target as HTMLElement
          if (el) el.style.boxShadow = neoShadow
        }}
      >
        <div className="relative h-28 md:h-32 w-full overflow-hidden bg-zinc-900/60 flex-shrink-0 rounded-t-xl">
          <img 
            src={project.banner_url || (project.gallery && project.gallery.length > 0 ? project.gallery[0] : directoryHero)} 
            alt={`${project.name} banner`} 
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            fetchPriority={priority ? 'high' : 'auto'}
            width={400}
            height={128}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent pointer-events-none" />
          
          <div 
            className="absolute top-2.5 right-2.5 z-20 flex items-center gap-2 px-2.5 py-1 rounded-lg"
            style={{
              background: '#121212',
              boxShadow: neoInset,
            }}
          >
            <div className="flex items-center gap-1">
              {project.votes !== undefined ? (
                <>
                  <ArrowUpSquare className="w-3 h-3 text-zinc-400" />
                  <span className="text-[10px] md:text-xs font-bold text-white/90 leading-none">
                    {project.votes || 0}
                  </span>
                </>
              ) : (
                <>
                  <Download className="w-3 h-3 text-zinc-400" />
                  <span className="text-[10px] md:text-xs font-bold text-white/90 leading-none">
                    {project.downloads || 0}
                  </span>
                </>
              )}
            </div>
            <div className="w-[1px] h-3 bg-zinc-700 self-center" />
            <div className="flex items-center gap-1">
              {isServer && project.average_rating !== undefined ? (
                <>
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-[10px] md:text-xs font-bold text-white/90 leading-none">
                    {project.average_rating > 0 ? project.average_rating.toFixed(1) : '0.0'}
                  </span>
                </>
              ) : (
                <>
                  <Heart className="w-3 h-3 text-zinc-400" />
                  <span className="text-[10px] md:text-xs font-bold text-white/90 leading-none">
                    {project.likes || 0}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>


        {/* Content Container */}
        <div className="relative px-5 md:px-6 pt-0 pb-5 md:pb-6 flex flex-col flex-grow z-10">
          <div 
            className="w-14 h-14 md:w-16 md:h-16 -mt-7 md:-mt-8 mb-3.5 rounded-xl overflow-hidden flex-shrink-0 z-20"
            style={{
              background: '#1e1e1e',
              boxShadow: '4px 4px 10px rgba(0,0,0,0.5), -4px -4px 10px rgba(255,255,255,0.03)',
            }}
          >
            {project.icon_url ? (
              <img src={project.icon_url} alt={project.name} loading={priority ? 'eager' : 'lazy'} decoding={priority ? 'sync' : 'async'} fetchPriority={priority ? 'high' : 'auto'} width={64} height={64} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 font-pixel text-xs">
                {project.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-grow pr-1 mb-3.5">
            {(() => {
              const nameParts = project.name.split(' ');
              const longestWord = Math.max(...nameParts.map((w: string) => w.length));
              const hasVeryLongWord = longestWord > 12;
              const hasLongWord = longestWord > 10;
              
              const fontSizeClass = (project.name.length > 25 || hasVeryLongWord) 
                ? 'text-[11px] md:text-xs' 
                : (project.name.length > 15 || hasLongWord) 
                  ? 'text-xs md:text-sm' 
                  : 'text-sm md:text-base';

              return (
                <h3 className={`font-pixel ${fontSizeClass} line-clamp-2 mb-1.5 group-hover:text-white transition-colors leading-tight break-words`}>
                  {project.name}
                </h3>
              );
            })()}
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              <div 
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-headline font-bold uppercase tracking-wider w-fit text-zinc-400"
                style={{
                  background: '#1e1e1e',
                  boxShadow: neoInset
                }}
              >
                {project.type === 'server' ? (
                  <img src={serverGif} alt={project.type} width={12} height={12} className="w-3 h-3 object-contain rounded-sm" />
                ) : project.type === 'realm' ? (
                  <img src={realmGif} alt={project.type} width={12} height={12} className="w-3 h-3 object-contain rounded-sm" />
                ) : project.type === 'java' ? (
                  <Box className="w-3 h-3 text-realm-green" />
                ) : (
                  <Box className="w-3 h-3 text-zinc-400" />
                )}
                <span>{project.type}</span>
              </div>

              <div 
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-headline font-bold uppercase tracking-wider w-fit text-zinc-400"
                style={{
                  background: '#1e1e1e',
                  boxShadow: neoInset
                }}
              >
                {getCategoryIcon(project.category)}
                <span>{project.category}</span>
              </div>

              {showStatus && (
                <span 
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-headline font-bold uppercase tracking-wider ${statusInfo.text}`}
                  style={{
                    background: '#1e1e1e',
                    boxShadow: neoInset
                  }}
                >
                  {statusInfo.icon}
                  <span>{statusInfo.label}</span>
                </span>
              )}
            </div>
          </div>
          
          <p className="text-zinc-400 text-[12px] md:text-[13px] flex-grow line-clamp-4 leading-relaxed mb-4 md:mb-5 group-hover:text-zinc-300 transition-colors duration-200">
            {project.description ? project.description.replace(/<[^>]+>/g, '') : "No description provided."}
          </p>
          
          {actions && (
            <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-outline-variant/20 mt-auto">
              <div className="flex items-center gap-4 w-full">
                <div onClick={(e) => e.stopPropagation()} className="flex items-center w-full">
                  {actions}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
