import { Link } from 'react-router-dom'
import { useAdminUsers } from '../hooks/queries'
import { useUpdateUserRoleMutation } from '../hooks/mutations'
import type { UserRole } from '../types'
import { LoadingSpinner } from '../components/FeedbackStates'
import { RoleBadge } from '../components/RoleBadge'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'

export function AdminUsersPage() {
  const { profile } = useAuth()
  const { data: users = [], isLoading: loading } = useAdminUsers()
  const roleMutation = useUpdateUserRoleMutation()

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.discord_username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (user.discord_id?.includes(searchQuery) ?? false)
      
      const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, searchQuery, roleFilter])

  const handleUpdateRole = (id: string, newRole: UserRole) => {
    if (confirm(`Elevate/Modify user role to ${newRole.toUpperCase()}?`)) {
      roleMutation.mutate(
        { id, role: newRole, adminId: profile?.id, adminName: profile?.discord_username },
        {
          onSuccess: () => {
            toast.success('Role Updated', {
              description: `User role has been successfully changed to ${newRole}.`
            })
          },
          onError: (err: any) => {
            toast.error('Role Update Failed', { description: err.message })
          }
        }
      )
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <AnimatedPage>
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-realm-green text-sm">group</span>
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold text-sm">Community</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">User Registry</h1>
          <p className="text-white/40 font-headline text-sm max-w-xl">Manage user accounts and staff roles.</p>
        </FramerIn>

        <FramerIn delay={0.1}>
          <div className="flex items-center justify-between lg:justify-start gap-4 sm:gap-6 bg-zinc-900 border border-white/10 px-4 sm:px-6 py-4 rounded-lg">
            <div className="flex -space-x-3 shrink-0">
              {users.slice(0, 5).map(user => (
                <img 
                  key={user.id} 
                  src={user.discord_avatar || ''} 
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 border-zinc-950 bg-zinc-800" 
                  alt="" 
                />
              ))}
              {users.length > 5 && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 border-zinc-950 bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">
                  +{users.length - 5}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-white font-pixel text-lg sm:text-xl leading-none mb-1">{users.length}</div>
              <div className="text-[9px] sm:text-[10px] font-headline text-white/40 uppercase font-bold tracking-widest leading-none">Total Users</div>
            </div>
          </div>
        </FramerIn>
      </div>

      <FramerIn delay={0.15} className="mb-6 flex flex-wrap gap-4 items-center sticky top-[72px] lg:top-0 z-30 bg-zinc-950 p-4 -mx-4 rounded-lg border border-white/5 lg:border-none lg:bg-transparent lg:p-0 lg:mx-0">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text"
            placeholder="Search by username or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-realm-green transition-all outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-1 bg-white/5 border border-white/10 p-1.5 rounded-lg">
          {[
            { id: 'all', label: 'All' },
            { id: 'admin', label: 'Admins' },
            { id: 'moderator', label: 'Moderators' },
            { id: 'explorer', label: 'Explorers' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setRoleFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-[10px] font-headline font-bold uppercase tracking-widest transition-all ${
                roleFilter === f.id 
                  ? 'bg-realm-green text-zinc-950 shadow-md' 
                  : f.id === 'all'
                    ? 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </FramerIn>

      <FramerIn delay={0.2} className="bg-zinc-900/60 border border-white/5 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-headline text-sm border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/5 text-white/30 uppercase tracking-[0.2em] text-[10px] font-bold">
                <th className="px-6 py-5">User Profile</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">Joined</th>
                <th className="px-6 py-5 text-right">Change Role</th>
              </tr>
            </thead>
            <motion.tbody 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.03
                  }
                }
              }}
              className="divide-y divide-white/[0.03]"
            >
              {filteredUsers.map(user => (
                <motion.tr 
                  key={user.id} 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={user.discord_avatar || ''} 
                          className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/10" 
                          alt="" 
                        />

                      </div>
                      <div>
                        <Link 
                          to={`/profile/${user.discord_username}`}
                          className="font-bold text-white hover:text-realm-green transition-colors cursor-pointer"
                        >
                          {user.discord_username || 'Unknown Player'}
                        </Link>
                        <div className="text-[10px] text-white/20 font-mono tracking-tighter mt-0.5">{user.discord_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-5 text-white/40 font-medium">
                    {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end opacity-40 group-hover:opacity-100 transition-opacity">
                      <div className="relative inline-block group/select">
                        <select 
                          className="bg-black/60 border border-white/10 text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 text-white outline-none focus:border-realm-green focus:ring-1 focus:ring-realm-green/20 transition-all cursor-pointer appearance-none pr-8 min-w-[140px]"
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value as UserRole)}
                        >
                          <option value="explorer">Explorer</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Administrator</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none text-white/40 group-hover/select:text-realm-green transition-colors">
                          unfold_more
                        </span>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-white/20 italic font-headline">
                      <span className="material-symbols-outlined text-4xl">person_search</span>
                      <span>No users found matching these criteria.</span>
                    </div>
                  </td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </FramerIn>
    </AnimatedPage>
  )
}

