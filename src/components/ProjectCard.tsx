import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { slugify } from '../lib/urlUtils'
import { Download, Heart, Clock, CheckCircle, Archive, Edit3, Wrench, Package, Database, Sparkles, Puzzle, Hammer, PlusCircle, Paintbrush, Activity, Layers } from 'lucide-react'
import directoryHero from '../assets/hero/directoryprojets.jpg'
import javaIcon from '../assets/category/10421-grass.png'
import bedrockIcon from '../assets/category/437888-bedrock.png'

export function ProjectCard({ 
  project, 
  showStatus = false,
  actions,
}: { 
  project: any, 
  showStatus?: boolean,
  actions?: React.ReactNode,
}) {
  const statusInfo = {
    draft: { label: 'Draft', bg: 'bg-zinc-800 border-zinc-700', text: 'text-zinc-400', icon: <Edit3 className="w-3 h-3" /> },
    published: { label: 'Published', bg: 'bg-realm-green/10', text: 'text-realm-green', icon: <CheckCircle className="w-3 h-3" /> },
    approved: { label: 'Approved', bg: 'bg-realm-green/10 border-transparent', text: 'text-realm-green', icon: null },
    archived: { label: 'Archived', bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-500', icon: <Archive className="w-3 h-3" /> },
    pending: { label: 'Pending', bg: 'bg-orange-500/10 border-orange-500/50', text: 'text-orange-500', icon: <Clock className="w-3 h-3 text-orange-500" /> }
  }[project.status as 'draft' | 'published' | 'archived' | 'pending' | 'approved'] || { label: project.status, bg: 'bg-zinc-800', text: 'text-zinc-400', icon: <Edit3 className="w-3 h-3" /> }

  const getCategoryIcon = (c: string) => {
    const Icon = c === 'Mods' ? Wrench :
                 c === 'Modpacks' ? Package :
                 c === 'Datapacks' ? Database :
                 c === 'Shaders' ? Sparkles :
                 c === 'Plugins' ? Puzzle :
                 c === 'Builds' ? Hammer :
                 c === 'Add-ons' ? PlusCircle :
                 c === 'Resource Pack' ? Paintbrush :
                 c === 'Behavior Pack' ? Activity :
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

  const highlightVariants: Variants = {
    initial: { opacity: 0, y: -2 },
    hover: { opacity: 1, y: 0, transition: { duration: 0.15 } }
  }

  return (
    <Link to={`/projects/${project.slug || slugify(project.name)}`} className="block h-full group relative">
      <motion.div 
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="bg-surface border border-outline-variant/30 hover:border-blue-500/30 rounded-lg flex flex-col h-full min-h-[350px] md:min-h-[380px] overflow-hidden relative cursor-pointer shadow-sm transition-colors duration-200 z-10"
      >
        <div className="relative h-24 md:h-28 w-full overflow-hidden bg-zinc-900/60 flex-shrink-0">
          <img 
            src={directoryHero} 
            alt={`${project.name} banner`} 
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute top-2 right-2 z-20 flex items-center gap-2 bg-black/60 border border-white/10 px-2 py-1 rounded-md backdrop-blur-md shadow-md">
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3 text-zinc-400" />
              <span className="text-[10px] md:text-xs font-bold text-white/90 leading-none">
                {project.downloads || 0}
              </span>
            </div>
            <div className="w-[1px] h-3 bg-white/20 self-center" />
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-500/70" />
              <span className="text-[10px] md:text-xs font-bold text-white/90 leading-none">
                {project.likes || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Highlight Bar */}
        <motion.div 
          variants={highlightVariants}
          className="absolute top-0 left-0 right-0 h-[3px] z-20 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
        />

        {/* Content Container */}
        <div className="relative p-4 md:p-5 pt-0 flex flex-col flex-grow z-10">
          <div className="w-14 h-14 md:w-16 md:h-16 -mt-7 md:-mt-8 mb-3 bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0 border-2 border-zinc-800 shadow-md z-20">
            {project.icon_url ? (
              <img src={project.icon_url} alt={project.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
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
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-headline font-bold uppercase tracking-wider w-fit bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                <img 
                  src={project.type === 'java' ? javaIcon : bedrockIcon} 
                  alt={project.type} 
                  className="w-3 h-3 object-contain rounded-sm" 
                />
                <span>{project.type}</span>
              </div>

              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-headline font-bold uppercase tracking-wider w-fit bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                {getCategoryIcon(project.category)}
                <span>{project.category}</span>
              </div>

              {showStatus && (
                <span className={`flex items-center gap-1 px-1.5 md:px-2 py-0.5 text-[8px] md:text-[10px] font-bold uppercase tracking-wider rounded border ${statusInfo.bg} ${statusInfo.text}`}>
                  {statusInfo.icon}
                  <span>{statusInfo.label}</span>
                </span>
              )}
            </div>
          </div>
          
          <p className="text-on-surface-variant text-[12px] md:text-[13px] flex-grow line-clamp-4 leading-relaxed mb-4 md:mb-6 group-hover:text-zinc-200 transition-colors">
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
