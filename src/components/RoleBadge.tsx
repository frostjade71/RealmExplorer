import type { UserRole } from '../types'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const roleStyles: Record<UserRole, string> = {
  explorer: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  moderator: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  admin: 'bg-realm-green/10 text-realm-green border-realm-green/20'
}

export function RoleBadge({ role, className }: { role: UserRole, className?: string }) {
  return (
    <span className={twMerge(clsx("px-2 py-0.5 rounded-md border text-[10px] font-pixel uppercase tracking-widest", roleStyles[role], className))}>
      {role}
    </span>
  )
}
