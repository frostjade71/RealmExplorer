import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { useTeamMembers, useAdminUsers } from '../hooks/queries'
import { 
  useAddTeamMemberMutation, 
  useRemoveTeamMemberMutation, 
  useUpdateTeamMembersOrderMutation,
  useUpdateTeamMemberRoleMutation
} from '../hooks/mutations'
import { LoadingSpinner } from '../components/FeedbackStates'
import { Search, Plus, Trash2, ArrowUp, ArrowDown, X, Shield, Crown } from 'lucide-react'
import type { Profile } from '../types'

export function AdminEditAboutPage() {
  const { profile: adminProfile } = useAuth()
  const { data: teamMembers = [], isLoading: loadingTeam } = useTeamMembers()
  const { data: allUsers = [], isLoading: loadingUsers } = useAdminUsers()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserForRole, setSelectedUserForRole] = useState<Profile | null>(null)
  const [roleSelection, setRoleSelection] = useState<'Executive' | 'Owner'>('Executive')

  const addMutation = useAddTeamMemberMutation()
  const removeMutation = useRemoveTeamMemberMutation()
  const orderMutation = useUpdateTeamMembersOrderMutation()
  const roleMutation = useUpdateTeamMemberRoleMutation()


  const filteredUsers = useMemo(() => {
    if (!searchQuery) return []
    const teamUserIds = new Set(teamMembers.map(m => m.user_id))
    return allUsers.filter(u => 
      !teamUserIds.has(u.id) && 
      (u.discord_username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       u.discord_id?.includes(searchQuery))
    ).slice(0, 5)
  }, [allUsers, searchQuery, teamMembers])

  const handleAddMember = (user: Profile) => {
    setSelectedUserForRole(user)
    setRoleSelection('Executive')
  }

  const confirmAddMember = () => {
    if (!selectedUserForRole) return

    addMutation.mutate({ 
      userId: selectedUserForRole.id, 
      roleTitle: roleSelection, 
      adminId: adminProfile?.id, 
      adminName: adminProfile?.discord_username 
    }, {
      onSuccess: () => {
        toast.success(`${selectedUserForRole.discord_username} added as ${roleSelection}`)
        setSearchQuery('')
        setSelectedUserForRole(null)
      }
    })
  }

  const handleRemoveMember = (id: string) => {
    if (confirm('Remove this member from the team?')) {
      removeMutation.mutate({ 
        id, 
        adminId: adminProfile?.id, 
        adminName: adminProfile?.discord_username 
      }, {
        onSuccess: () => toast.success('Member Removed')
      })
    }
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newMembers = [...teamMembers]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= newMembers.length) return

    const temp = newMembers[index]
    newMembers[index] = newMembers[targetIndex]
    newMembers[targetIndex] = temp

    // Update orders
    const updates = newMembers.map((m, i) => ({
      id: m.id,
      user_id: m.user_id,
      display_order: i
    }))

    orderMutation.mutate({ 
      members: updates, 
      adminId: adminProfile?.id, 
      adminName: adminProfile?.discord_username 
    })
  }

  const handleUpdateRole = (id: string, roleTitle: string) => {
    roleMutation.mutate({ 
      id, 
      roleTitle, 
      adminId: adminProfile?.id, 
      adminName: adminProfile?.discord_username 
    })
  }


  if (loadingTeam || loadingUsers) return <LoadingSpinner />

  return (
    <AnimatedPage>
      <div className="mb-10 flex items-end justify-between">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-realm-green text-sm">edit_note</span>
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold text-sm">Site Content</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">Edit About / Team</h1>
          <p className="text-white/40 font-headline text-sm">Manage the curated team list and section descriptions.</p>
        </FramerIn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Team Members List */}
        <FramerIn delay={0.2} className="lg:col-span-2">
          <div className="bg-zinc-900 border border-white/5 rounded-lg p-8 h-full">
            <h2 className="text-lg font-pixel text-white mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-realm-green">group</span>
              Executives & Owners
            </h2>

            <div className="space-y-4">
              {teamMembers.length === 0 ? (
                <div className="py-12 text-center text-white/20 font-headline italic bg-black/20 rounded-lg border border-dashed border-white/5">
                  No team members added yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map((member, index) => (
                    <motion.div 
                      key={member.id}
                      layout
                      className="flex items-center gap-4 bg-black/40 border border-white/5 p-4 rounded-lg group hover:border-white/20 transition-all"
                    >
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:text-realm-green text-white/20 disabled:opacity-0 transition-all"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === teamMembers.length - 1}
                          className="p-1 hover:text-realm-green text-white/20 disabled:opacity-0 transition-all"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      <img 
                        src={member.profiles?.discord_avatar || ''} 
                        className="w-12 h-12 rounded-lg border border-white/10"
                        alt=""
                      />

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white truncate">{member.profiles?.discord_username}</div>
                        <input 
                          type="text"
                          value={member.role_title}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                          className="bg-transparent text-[10px] text-realm-green font-headline font-bold uppercase tracking-widest outline-none border-b border-white/0 focus:border-realm-green/50 transition-all w-full"
                          placeholder="Set Title (e.g. Owner)"
                        />
                      </div>

                      <button 
                        onClick={() => handleRemoveMember(member.id)}
                        className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </FramerIn>

        {/* Add Member Sidebar */}
        <FramerIn delay={0.3}>
          <div className="bg-zinc-900 border border-white/5 rounded-lg p-8 h-full">
            <h2 className="text-lg font-pixel text-white mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-realm-green">person_add</span>
              Add Member
            </h2>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm text-white focus:border-realm-green transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleAddMember(user)}
                  disabled={addMutation.isPending}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all text-left group"
                >
                  <img 
                    src={user.discord_avatar || ''} 
                    className="w-10 h-10 rounded-lg border border-white/10" 
                    alt="" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white group-hover:text-realm-green transition-all truncate">{user.discord_username}</div>
                    <div className="text-[10px] text-white/20 font-mono truncate">{user.discord_id}</div>
                  </div>
                  <Plus className="w-4 h-4 text-realm-green opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
              {searchQuery && filteredUsers.length === 0 && (
                <div className="text-center py-4 text-white/20 text-xs italic font-headline">
                  No available users found.
                </div>
              )}
              {!searchQuery && (
                <div className="text-center py-4 text-white/20 text-xs italic font-headline">
                  Type to search for users to add.
                </div>
              )}
            </div>
          </div>
        </FramerIn>
      </div>

      {/* Role Selection Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedUserForRole && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-zinc-950 border border-white/10 w-full max-w-sm rounded-lg overflow-hidden shadow-xl"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <img 
                        src={selectedUserForRole.discord_avatar || ''} 
                        className="w-12 h-12 rounded-lg border border-white/10" 
                        alt="" 
                      />
                      <div>
                        <h3 className="text-white font-bold leading-none">{selectedUserForRole.discord_username}</h3>
                        <p className="text-white/20 text-[10px] font-mono mt-1">Assigning Team Role</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedUserForRole(null)}
                      className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
  
                  <div className="space-y-3 mb-8">
                    <button
                      onClick={() => setRoleSelection('Executive')}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        roleSelection === 'Executive' 
                          ? 'bg-realm-green/10 border-realm-green/30 text-realm-green' 
                          : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${roleSelection === 'Executive' ? 'bg-realm-green/20' : 'bg-white/10'}`}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-xs font-bold uppercase tracking-widest">Executive</div>
                        <div className="text-[10px] opacity-60">High-level administrator</div>
                      </div>
                      {roleSelection === 'Executive' && <div className="w-2 h-2 rounded-full bg-realm-green shadow-sm" />}
                    </button>
  
                    <button
                      onClick={() => setRoleSelection('Owner')}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        roleSelection === 'Owner' 
                          ? 'bg-[#FFD700]/10 border-[#FFD700]/30 text-[#FFD700]' 
                          : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${roleSelection === 'Owner' ? 'bg-[#FFD700]/20' : 'bg-white/10'}`}>
                        <Crown className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-xs font-bold uppercase tracking-widest">Owner</div>
                        <div className="text-[10px] opacity-60">Project stakeholder</div>
                      </div>
                      {roleSelection === 'Owner' && <div className="w-2 h-2 rounded-full bg-[#FFD700] shadow-sm" />}
                    </button>
                  </div>
  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedUserForRole(null)}
                      className="flex-1 py-3 px-6 rounded-lg font-headline font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all text-[10px] uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmAddMember}
                      disabled={addMutation.isPending}
                      className="flex-[2] py-4 px-6 bg-realm-green text-zinc-950 rounded-lg font-headline font-bold text-[10px] uppercase tracking-widest hover:bg-[#85fc7e] shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {addMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Confirm Addition
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.getElementById('modal-root')!
      )}
    </AnimatedPage>
  )
}
