import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { LoadingSpinner } from '../components/FeedbackStates'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { useTeamMembers, useAdminUsers } from '../hooks/queries'
import { 
  useAddTeamMemberMutation, 
  useRemoveTeamMemberMutation, 
  useUpdateTeamMembersOrderMutation,
  useUpdateTeamMemberRoleMutation
} from '../hooks/mutations'
import type { Profile } from '../types'
import { 
  Crown, 
  Shield, 
  UserPlus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  X, 
  Megaphone,
  Briefcase
} from 'lucide-react'

const PRESET_ROLES = [
  { id: 'Executive', label: 'Executive', desc: 'High-level platform administrator', icon: Briefcase, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'Owner', label: 'Owner', desc: 'Project stakeholder & founder', icon: Crown, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'Admin', label: 'Admin', desc: 'Community & platform administrator', icon: Shield, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  { id: 'Reporter', label: 'Reporter', desc: 'Content, news & server reviewer', icon: Megaphone, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
]

export function AdminEditAboutPage() {
  const { profile: adminProfile } = useAuth()
  const { data: teamMembers = [], isLoading: loadingTeam } = useTeamMembers()
  const { data: allUsers = [], isLoading: loadingUsers } = useAdminUsers()
  
  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [customRoleTitle, setCustomRoleTitle] = useState('Executive')
  
  // Member to delete
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string; role: string } | null>(null)

  // Filter in member list
  const [listSearchQuery, setListSearchQuery] = useState('')

  const addMutation = useAddTeamMemberMutation()
  const removeMutation = useRemoveTeamMemberMutation()
  const orderMutation = useUpdateTeamMembersOrderMutation()
  const roleMutation = useUpdateTeamMemberRoleMutation()

  // Executives & Owners vs Staff & Community
  const executivesAndOwners = useMemo(() => {
    return teamMembers.filter(m => {
      const title = (m.role_title || '').toLowerCase()
      return title.includes('owner') || title.includes('executive') || title.includes('founder') || title.includes('lead')
    })
  }, [teamMembers])

  const staffAndReporters = useMemo(() => {
    return teamMembers.filter(m => {
      const title = (m.role_title || '').toLowerCase()
      return !title.includes('owner') && !title.includes('executive') && !title.includes('founder') && !title.includes('lead')
    })
  }, [teamMembers])

  // Filtered users for Add Member Search
  const candidateUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return []
    const teamUserIds = new Set(teamMembers.map(m => m.user_id))
    const q = userSearchQuery.toLowerCase()

    return allUsers.filter(u => 
      !teamUserIds.has(u.id) && 
      (u.discord_username?.toLowerCase().includes(q) || u.discord_id?.includes(q))
    ).slice(0, 6)
  }, [allUsers, userSearchQuery, teamMembers])

  const openAddModal = () => {
    setUserSearchQuery('')
    setSelectedUser(null)
    setCustomRoleTitle('Executive')
    setIsAddModalOpen(true)
  }

  const handleConfirmAddMember = () => {
    if (!selectedUser || !customRoleTitle.trim()) return

    addMutation.mutate({ 
      userId: selectedUser.id, 
      roleTitle: customRoleTitle.trim(), 
      adminId: adminProfile?.id, 
      adminName: adminProfile?.discord_username 
    }, {
      onSuccess: () => {
        toast.success(`Added ${selectedUser.discord_username} as ${customRoleTitle}`)
        setIsAddModalOpen(false)
        setSelectedUser(null)
      },
      onError: (err: any) => {
        toast.error('Failed to add team member', { description: err.message })
      }
    })
  }

  const handleConfirmRemove = () => {
    if (!memberToDelete) return

    removeMutation.mutate({ 
      id: memberToDelete.id, 
      adminId: adminProfile?.id, 
      adminName: adminProfile?.discord_username 
    }, {
      onSuccess: () => {
        toast.success('Team member removed')
        setMemberToDelete(null)
      },
      onError: (err: any) => {
        toast.error('Failed to remove team member', { description: err.message })
      }
    })
  }

  const handleMove = (memberId: string, direction: 'up' | 'down', groupMembers: typeof teamMembers) => {
    const indexInGroup = groupMembers.findIndex(m => m.id === memberId)
    const targetIndexInGroup = direction === 'up' ? indexInGroup - 1 : indexInGroup + 1
    
    if (targetIndexInGroup < 0 || targetIndexInGroup >= groupMembers.length) return

    const newMembers = [...teamMembers]
    const currentMember = groupMembers[indexInGroup]
    const targetMember = groupMembers[targetIndexInGroup]
    
    const fullIndexCurrent = newMembers.findIndex(m => m.id === currentMember.id)
    const fullIndexTarget = newMembers.findIndex(m => m.id === targetMember.id)
    
    newMembers[fullIndexCurrent] = targetMember
    newMembers[fullIndexTarget] = currentMember

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
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-white/40 text-base">edit_note</span>
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold text-sm">Site Content</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">Team & About Directory</h1>
          <p className="text-white/40 font-headline text-sm max-w-xl">
            Curate team leadership, administrators, and reporters displayed on the public About page.
          </p>
        </FramerIn>

        <FramerIn delay={0.1} className="shrink-0">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-4 bg-realm-green text-zinc-950 rounded-xl font-headline font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            Add Team Member
          </button>
        </FramerIn>
      </div>

      {/* Main Content Layout - Centered 1 Column */}
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Search Bar for Members */}
        {teamMembers.length > 0 && (
          <FramerIn delay={0.15} className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search active team members by username or role..."
              value={listSearchQuery}
              onChange={(e) => setListSearchQuery(e.target.value)}
              className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl pl-11 pr-10 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-realm-green transition-all outline-none"
            />
            {listSearchQuery && (
              <button onClick={() => setListSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white z-10">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </FramerIn>
        )}

        {/* SECTION 1: EXECUTIVES & LEADERSHIP */}
        <FramerIn delay={0.2} className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-headline font-bold text-white leading-tight">
                  Leadership & Executives
                </h2>
                <p className="text-xs text-white/40 font-body">Owners, Founders & Executive Directors</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-white/30">
              {executivesAndOwners.length} members
            </span>
          </div>

          <div className="space-y-2.5">
            {executivesAndOwners
              .filter(m => {
                if (!listSearchQuery.trim()) return true
                const q = listSearchQuery.toLowerCase()
                return (m.profiles?.discord_username || '').toLowerCase().includes(q) || (m.role_title || '').toLowerCase().includes(q)
              })
              .map((member, index, array) => (
                <div
                  key={member.id}
                  className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-4 rounded-xl flex items-center justify-between gap-4 hover:border-white/20 transition-all group"
                >
                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMove(member.id, 'up', executivesAndOwners)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-0 transition-all"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(member.id, 'down', executivesAndOwners)}
                      disabled={index === array.length - 1}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-0 transition-all"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={member.profiles?.discord_avatar || '/logoRE.png'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info & Editable Role */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-bold text-white text-sm truncate leading-snug">
                      {member.profiles?.discord_username || 'Unknown User'}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5">
                      <input
                        type="text"
                        value={member.role_title}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        className="bg-white/[0.03] hover:bg-white/[0.06] focus:bg-white/[0.08] text-[11px] text-realm-green font-headline font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/5 focus:border-realm-green/50 outline-none transition-all w-full max-w-[220px]"
                        placeholder="Role Title"
                        title="Click to edit role title"
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => setMemberToDelete({
                      id: member.id,
                      name: member.profiles?.discord_username || 'Member',
                      role: member.role_title
                    })}
                    className="p-2.5 rounded-xl bg-white/5 text-white/20 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    title="Remove from Team"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

            {executivesAndOwners.length === 0 && (
              <div className="py-8 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-xl text-white/30 text-xs italic">
                No leadership or executive members added yet.
              </div>
            )}
          </div>
        </FramerIn>

        {/* SECTION 2: STAFF, ADMINS & REPORTERS */}
        <FramerIn delay={0.25} className="space-y-3 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-headline font-bold text-white leading-tight">
                  Staff, Admins & Reporters
                </h2>
                <p className="text-xs text-white/40 font-body">Community Admins, Moderators & Reviewers</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-white/30">
              {staffAndReporters.length} members
            </span>
          </div>

          <div className="space-y-2.5">
            {staffAndReporters
              .filter(m => {
                if (!listSearchQuery.trim()) return true
                const q = listSearchQuery.toLowerCase()
                return (m.profiles?.discord_username || '').toLowerCase().includes(q) || (m.role_title || '').toLowerCase().includes(q)
              })
              .map((member, index, array) => (
                <div
                  key={member.id}
                  className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-4 rounded-xl flex items-center justify-between gap-4 hover:border-white/20 transition-all group"
                >
                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMove(member.id, 'up', staffAndReporters)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-0 transition-all"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(member.id, 'down', staffAndReporters)}
                      disabled={index === array.length - 1}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-0 transition-all"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={member.profiles?.discord_avatar || '/logoRE.png'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info & Editable Role */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-bold text-white text-sm truncate leading-snug">
                      {member.profiles?.discord_username || 'Unknown User'}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5">
                      <input
                        type="text"
                        value={member.role_title}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        className="bg-white/[0.03] hover:bg-white/[0.06] focus:bg-white/[0.08] text-[11px] text-sky-400 font-headline font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/5 focus:border-sky-400/50 outline-none transition-all w-full max-w-[220px]"
                        placeholder="Role Title"
                        title="Click to edit role title"
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => setMemberToDelete({
                      id: member.id,
                      name: member.profiles?.discord_username || 'Member',
                      role: member.role_title
                    })}
                    className="p-2.5 rounded-xl bg-white/5 text-white/20 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    title="Remove from Team"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

            {staffAndReporters.length === 0 && (
              <div className="py-8 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-xl text-white/30 text-xs italic">
                No staff or reporter members added yet.
              </div>
            )}
          </div>
        </FramerIn>
      </div>

      {/* MODAL: ADD TEAM MEMBER */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-zinc-950 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-realm-green/10 text-realm-green flex items-center justify-center border border-realm-green/20">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-headline font-bold text-white text-lg leading-tight">Add Team Member</h2>
                    <p className="text-white/40 text-xs font-headline">Search Discord user and assign platform title.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* User Search & Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                    1. Search & Select User
                  </label>
                  
                  {selectedUser ? (
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-realm-green/10 border border-realm-green/30">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedUser.discord_avatar || '/logoRE.png'}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-white/10"
                        />
                        <div>
                          <div className="text-white font-headline font-bold text-sm leading-tight">
                            {selectedUser.discord_username}
                          </div>
                          <div className="text-[10px] font-mono text-white/40 mt-0.5">
                            ID: {selectedUser.discord_id || selectedUser.id.substring(0, 12)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedUser(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-headline font-bold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none z-10" />
                        <input
                          type="text"
                          placeholder="Type Discord username or ID..."
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-realm-green transition-all outline-none"
                        />
                      </div>

                      {/* Candidates Search Results */}
                      {candidateUsers.length > 0 && (
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] divide-y divide-white/5 overflow-hidden">
                          {candidateUsers.map(user => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => setSelectedUser(user)}
                              className="w-full flex items-center justify-between p-3 hover:bg-white/5 text-left transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={user.discord_avatar || '/logoRE.png'}
                                  alt=""
                                  className="w-8 h-8 rounded-lg object-cover border border-white/10"
                                />
                                <div>
                                  <div className="text-xs font-bold text-white group-hover:text-realm-green transition-colors">
                                    {user.discord_username}
                                  </div>
                                  <div className="text-[10px] font-mono text-white/30">
                                    {user.discord_id || user.id.substring(0, 8)}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-headline font-bold text-realm-green uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                Select
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {userSearchQuery && candidateUsers.length === 0 && (
                        <p className="text-center py-4 text-xs text-white/30 italic">
                          No matching available users found.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Role Template Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                    2. Choose Preset Role Template
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {PRESET_ROLES.map(role => {
                      const Icon = role.icon
                      const isSelected = customRoleTitle === role.label
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setCustomRoleTitle(role.label)}
                          className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                            isSelected
                              ? 'bg-realm-green/10 border-realm-green/40 text-white'
                              : 'bg-white/[0.02] border-white/5 hover:border-white/15 text-white/60'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg border shrink-0 ${role.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-headline font-bold text-white leading-none mb-1">
                              {role.label}
                            </div>
                            <div className="text-[10px] text-white/30 font-body leading-tight line-clamp-1">
                              {role.desc}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Custom Role Title Input */}
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                    3. Display Role Title
                  </label>
                  <input
                    type="text"
                    value={customRoleTitle}
                    onChange={(e) => setCustomRoleTitle(e.target.value)}
                    placeholder="e.g. Founder & Lead Developer"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-realm-green transition-all"
                  />
                  <p className="text-[10px] text-white/30 mt-1 font-body">
                    This exact title will appear under the member's profile on the public About page.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3 bg-white/[0.01]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 rounded-xl text-xs font-headline font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddMember}
                  disabled={!selectedUser || !customRoleTitle.trim() || addMutation.isPending}
                  className="px-6 py-3 rounded-xl bg-realm-green text-zinc-950 font-headline font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50"
                >
                  {addMutation.isPending ? 'Adding...' : 'Confirm Addition'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION MODAL: REMOVE MEMBER */}
      <ConfirmationModal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Team Member"
        message={`Are you sure you want to remove "${memberToDelete?.name}" (${memberToDelete?.role}) from the team list? They will no longer be displayed on the About page.`}
        confirmLabel="Remove Member"
        isDangerous={true}
      />
    </AnimatedPage>
  )
}
