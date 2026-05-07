import type { UserRole } from '../types'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
const goldIngot = '/upgrades/9515-mc-gold-ingot.png'
const ironIngot = '/roles/41742-mciron.png'
const adminIcon = '/roles/185424-esmeralda (1).png'
const modIcon = '/roles/22752-lapis-lazuli.png'

const roleStyles: Record<UserRole, string> = {
  explorer: 'text-zinc-400',
  'explorer+': 'text-amber-400 font-bold',
  moderator: 'text-blue-400',
  admin: 'text-realm-green'
}

export function RoleBadge({ role, className }: { role: UserRole, className?: string }) {
  return (
    <span className={twMerge(
      clsx(
        "inline-flex items-center px-2 py-0.5 font-pixel text-[8px] uppercase tracking-widest backdrop-blur-md",
        "bg-zinc-800/90 border-t-2 border-l-2 border-white/20 border-r-2 border-b-2 border-black/50 shadow-[2px_2px_0px_rgba(0,0,0,0.4)]",
        roleStyles[role], 
        className
      )
    )}>
      {role === 'explorer+' && (
        <img src={goldIngot} alt="" className="w-4 h-4 mr-1.5 object-contain" />
      )}
      {role === 'explorer' && (
        <img src={ironIngot} alt="" className="w-4 h-4 mr-1.5 object-contain" />
      )}
      {role === 'admin' && (
        <img src={adminIcon} alt="" className="w-4 h-4 mr-1.5 object-contain" />
      )}
      {role === 'moderator' && (
        <img src={modIcon} alt="" className="w-4 h-4 mr-1.5 object-contain" />
      )}

      {role === 'admin' ? 'Administrator' : role === 'explorer+' ? 'Explorer+' : role}
    </span>
  )
}
