import { Link } from 'react-router-dom'
import type { Server } from '../types'
import { CategoryBadge } from './CategoryBadge'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { slugify } from '../lib/urlUtils'

export function ServerCard({ server, showStatus = false }: { server: Server, showStatus?: boolean }) {
  const statusInfo = {
    approved: { label: 'Active', bg: 'bg-realm-green/10', text: 'text-realm-green' },
    pending: { label: 'Pending', bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
    rejected: { label: 'Rejected', bg: 'bg-red-500/10', text: 'text-red-500' },
    emailed: { label: 'Emailed', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    'Review Icon': { label: 'Review Icon', bg: 'bg-orange-500/10', text: 'text-orange-400' },
    'Review Cover': { label: 'Review Cover', bg: 'bg-orange-500/10', text: 'text-orange-400' },
    'Review Icon & Cover': { label: 'Review Icon & Cover', bg: 'bg-orange-500/10', text: 'text-orange-400' }
  }[server.status as string] || { label: server.status, bg: 'bg-zinc-800', text: 'text-zinc-400' }

  return (
    <Link to={`/server/${server.slug || slugify(server.name)}`} className="block h-full group">
      <motion.div 
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface border border-outline-variant/30 p-6 rounded-xl hover:shadow-2xl hover:shadow-green-950/20 hover:border-t-realm-green transition-all duration-300 flex flex-col h-full overflow-hidden relative cursor-pointer"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 w-full">
            <div 
              className="w-14 h-14 bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-800"
            >
              {server.icon_url ? (
                <img src={server.icon_url} alt={server.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 font-pixel text-xs">
                  {server.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-grow pr-6">
              <h3 className={`font-pixel ${
                server.name.length > 25 ? 'text-xs' : 
                server.name.length > 15 ? 'text-sm' : 
                'text-base'
              } line-clamp-2 mb-1 transition-colors leading-tight`}>
                {server.name}
              </h3>
              <div className="flex items-center gap-2">
                {(showStatus || server.status !== 'approved') && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-current/10 ${statusInfo.bg} ${statusInfo.text}`}>
                    {statusInfo.label}
                  </span>
                )}
                <CategoryBadge category={server.category} />
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-on-surface-variant text-sm flex-grow line-clamp-2 leading-relaxed mb-6 group-hover:text-zinc-300 transition-colors">
          {server.description || "No description provided."}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-headline mb-0.5">Ratings</span>
            <div className="flex items-center gap-1.5">
              <Star className={`w-3.5 h-3.5 ${server.average_rating > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} />
              <span className="text-sm font-bold text-white/90">
                {server.average_rating > 0 ? server.average_rating.toFixed(1) : 'No ratings'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-headline mb-0.5">Votes</span>
              <span className="text-sm font-bold text-realm-green">{server.votes.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </motion.div>
    </Link>
  )
}
