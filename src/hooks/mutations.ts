import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { ServerStatus, UserRole } from '../types'
import { logAction } from '../lib/audit'

export function useVoteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, serverId }: { userId: string; serverId: string }) => {
      const { error } = await supabase.from('votes').insert({ user_id: userId, server_id: serverId })
      if (error) {
        if (error.code === '23505') throw new Error('Already voted') // unique violation
        throw error
      }
      return serverId
    },
    onSuccess: () => {
      // Invalidate all server queries and vote statuses to ensure UI sync
      queryClient.invalidateQueries({ queryKey: ['server'] })
      queryClient.invalidateQueries({ queryKey: ['servers'] })
      queryClient.invalidateQueries({ queryKey: ['voteStatus'] })
    }
  })
}

export function useDeleteServerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, adminId, adminName }: { id: string, adminId?: string | null, adminName?: string | null }) => {
      // 0. Get server data for asset cleanup and logging
      const { data: server } = await supabase.from('servers').select('icon_url, banner_url, name').eq('id', id).single()

      if (server) {
        const filesToDelete: string[] = []
        const getPath = (url: string) => {
          if (!url || !url.includes('server-assets/')) return null
          return url.split('server-assets/').pop()
        }

        const iconPath = getPath(server.icon_url || '')
        const bannerPath = getPath(server.banner_url || '')
        
        if (iconPath) filesToDelete.push(iconPath)
        if (bannerPath) filesToDelete.push(bannerPath)

        // 1. Remove from storage
        if (filesToDelete.length > 0) {
          await supabase.storage.from('server-assets').remove(filesToDelete)
        }
      }

      // 2. Remove related notifications (no FK cascade for related_id)
      await supabase.from('notifications').delete().eq('related_id', id)

      // 3. Delete DB record (Postgres CASCADE handles votes, ratings, etc.)
      const { error } = await supabase.from('servers').delete().eq('id', id)
      if (error) throw error

      // 4. Log Action
      if (server) {
        await logAction('SERVER_DELETED', { serverName: server.name }, adminId, adminName, id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userServers'] })
      queryClient.invalidateQueries({ queryKey: ['adminServers'] })
      queryClient.invalidateQueries({ queryKey: ['servers'] })
    }
  })
}

export function useUpdateServerStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, adminId, adminName }: { id: string, status: ServerStatus, adminId?: string | null, adminName?: string | null }) => {
      // 0. Get current server state before update
      const { data: server } = await supabase.from('servers').select('owner_id, name, status').eq('id', id).single()

      // 1. Update status
      const { error: statusError } = await supabase.from('servers').update({ status }).eq('id', id)
      if (statusError) throw statusError

      // 2. Notification if approved
      if (status === 'approved' && server?.owner_id) {
        let title = 'Listing Approved'
        let message = `Your server "${server.name}" has been approved!`

        if (server.status === 'Review Icon') {
          title = 'Icon Approved'
          message = `Your new icon for "${server.name}" has been approved!`
        } else if (server.status === 'Review Cover') {
          title = 'Cover Approved'
          message = `Your new cover for "${server.name}" has been approved!`
        } else if (server.status === 'Review Icon & Cover') {
          title = 'Assets Approved'
          message = `Your icon and cover for "${server.name}" have been approved!`
        }

        await supabase.from('notifications').insert({
          user_id: server.owner_id,
          type: 'approval',
          title,
          message,
          related_id: id
        } as any)
      }

      // 3. Log action
      await logAction(
        status === 'approved' ? 'SERVER_APPROVED' : 'SERVER_STATUS_CHANGED', 
        { serverName: server?.name, newStatus: status },
        adminId,
        adminName,
        id
      )

      // 3. If approved, cleanup messages
      if (status === 'approved') {
        const { error: msgError } = await supabase.from('server_messages').delete().eq('server_id', id)
        if (msgError) console.error('Failed to cleanup messages:', msgError)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServers'] })
      queryClient.invalidateQueries({ queryKey: ['servers'] })
      queryClient.invalidateQueries({ queryKey: ['userServers'] })
      queryClient.invalidateQueries({ queryKey: ['server'] })
      queryClient.invalidateQueries({ queryKey: ['serverMessages'] })
    }
  })
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, role, adminId, adminName }: { id: string, role: UserRole, adminId?: string | null, adminName?: string | null }) => {
      // Get target user name
      const { data: targetProfile } = await supabase.from('profiles').select('discord_username').eq('id', id).single()

      const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
      if (error) throw error

      await logAction(
        'ROLE_CHANGED',
        { targetUser: targetProfile?.discord_username, newRole: role },
        adminId,
        adminName,
        id
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    }
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, social_links, bio }: { id: string, social_links?: any[], bio?: string | null }) => {
      const updateData: any = {}
      if (social_links !== undefined) updateData.social_links = social_links
      if (bio !== undefined) updateData.bio = bio
      
      const { error } = await supabase.from('profiles').update(updateData).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  })
}

export function useSubmitServerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (formData: any) => {
      const { error } = await supabase.from('servers').insert([{ ...formData, last_edited_at: new Date().toISOString() }])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userServers'] })
      queryClient.invalidateQueries({ queryKey: ['adminServers'] })
    }
  })
}
export function useUpdateServerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...formData }: any) => {
      const { error } = await supabase.from('servers').update({ ...formData, last_edited_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server'] })
      queryClient.invalidateQueries({ queryKey: ['userServers'] })
      queryClient.invalidateQueries({ queryKey: ['servers'] })
      queryClient.invalidateQueries({ queryKey: ['adminServers'] })
    }
  })
}

export function useSubmitRatingMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ 
      userId, 
      serverId, 
      rating, 
      comment 
    }: { 
      userId: string; 
      serverId: string; 
      rating: number; 
      comment: string | null 
    }) => {
      // 1. Submit rating
      const { error } = await supabase
        .from('server_ratings')
        .upsert({ 
          user_id: userId, 
          server_id: serverId, 
          rating, 
          comment 
        }, { onConflict: 'user_id,server_id' })
      
      if (error) throw error
      return serverId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server'] })
      queryClient.invalidateQueries({ queryKey: ['serverRatings'] })
      queryClient.invalidateQueries({ queryKey: ['servers'] })
    }
  })
}

export function useDeleteRatingMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, serverId }: { userId: string; serverId: string }) => {
      const { error } = await supabase
        .from('server_ratings')
        .delete()
        .eq('user_id', userId)
        .eq('server_id', serverId)
      
      if (error) throw error
      return serverId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server'] })
      queryClient.invalidateQueries({ queryKey: ['serverRatings'] })
      queryClient.invalidateQueries({ queryKey: ['servers'] })
    }
  })
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ 
      serverId, 
      senderId, 
      subject, 
      message, 
      type,
      adminId,
      adminName 
    }: { 
      serverId: string; 
      senderId: string; 
      subject: string; 
      message: string; 
      type: 'contact' | 'rejection';
      adminId?: string | null;
      adminName?: string | null;
    }) => {
      // 1. Upsert the message (one per server)
      const { error: msgError } = await supabase
        .from('server_messages')
        .upsert({ 
          server_id: serverId, 
          sender_id: senderId, 
          subject, 
          message, 
          type 
        }, { onConflict: 'server_id' })
      
      if (msgError) throw msgError

      // 2. Update server status
      const newStatus: ServerStatus = type === 'rejection' ? 'rejected' : 'emailed'
      const { error: statusError } = await supabase.from('servers').update({ status: newStatus }).eq('id', serverId)
      
      if (statusError) throw statusError

      // 3. Create Notification
      const { data: server } = await supabase.from('servers').select('owner_id, name, status').eq('id', serverId).single()
      if (server && server.owner_id) {
        let title = type === 'rejection' ? 'Listing Rejected' : 'New Staff Message'
        let messageBody = type === 'rejection' 
          ? `Your server "${server.name}" listing was rejected. Please check your messages.` 
          : `A staff member sent a message regarding "${server.name}".`

        if (type === 'rejection') {
          if (server.status === 'Review Icon') {
            title = 'Icon Rejected'
            messageBody = `Your new icon for "${server.name}" was rejected. Please check your messages.`
          } else if (server.status === 'Review Cover') {
            title = 'Cover Rejected'
            messageBody = `Your new cover for "${server.name}" was rejected. Please check your messages.`
          } else if (server.status === 'Review Icon & Cover') {
            title = 'Assets Rejected'
            messageBody = `Your icon and cover for "${server.name}" were rejected. Please check your messages.`
          }
        }

        await supabase.from('notifications').insert({
          user_id: server.owner_id,
          type: type === 'rejection' ? 'rejection' : 'staff_outreach',
          title,
          message: messageBody,
          related_id: serverId
        } as any)
      }

      // 4. Log Action
      await logAction(
        type === 'rejection' ? 'SERVER_REJECTED' : 'SERVER_CONTACTED',
        { serverName: server?.name, subject },
        adminId,
        adminName,
        serverId
      )

      return serverId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serverMessages'] })
      queryClient.invalidateQueries({ queryKey: ['adminServers'] })
      queryClient.invalidateQueries({ queryKey: ['server'] })
      queryClient.invalidateQueries({ queryKey: ['userServers'] })
    }
  })
}

export function useUpsertOTMWinnerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, servers, profiles, adminId, adminName, ...winner }: any) => {
      const { error } = await supabase
        .from('otm_winners')
        .upsert(winner, { onConflict: 'month,category' })
      if (error) throw error

      // Log Action
      await logAction(
        'OTM_WINNER_SET',
        { month: winner.month, category: winner.category, winner: winner.winner_name },
        adminId,
        adminName,
        winner.server_id
      )

      // Notification if podium
      const categoryDisplay = winner.category.charAt(0).toUpperCase() + winner.category.slice(1)
      
      if (winner.server_id) {
        const { data: server } = await supabase.from('servers').select('owner_id, name').eq('id', winner.server_id).single()
        if (server && server.owner_id) {
          await supabase.from('notifications').insert({
            user_id: server.owner_id,
            type: 'otm_podium',
            title: 'OTM Winner !',
            message: `🎉Congratulations, Your Server ${server.name} is ${winner.month} ${categoryDisplay} Of The Month !`,
            related_id: winner.server_id
          } as any)
        }
      } else if (winner.user_id) {
        await supabase.from('notifications').insert({
          user_id: winner.user_id,
          type: 'otm_podium',
          title: 'OTM Winner !',
          message: `🎉Congratulations! You have been selected as the ${winner.month} ${categoryDisplay} Of The Month !`,
          related_id: null
        } as any)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otmWinners'] })
    }
  })
}

export function useDeleteOTMWinnerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('otm_winners')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otmWinners'] })
    }
  })
}

export function useAddOTMCompetitorMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ adminId, adminName, ...competitor }: any) => {
      // Clean up for DB
      const { vote_url, profiles, ...cleanCompetitor } = competitor
      const { error } = await supabase
        .from('otm_competitors')
        .insert([cleanCompetitor])
      if (error) throw error

      // Log Action
      await logAction(
        'OTM_COMPETITOR_ADDED',
        { month: cleanCompetitor.month, category: cleanCompetitor.category },
        adminId,
        adminName,
        cleanCompetitor.server_id
      )

      // Notification
      const { data: server } = await supabase.from('servers').select('owner_id, name').eq('id', competitor.server_id)
        .single()
      if (server && server.owner_id) {
        await supabase.from('notifications').insert({
          user_id: server.owner_id,
          type: 'otm_competitor',
          title: 'OTM Competitor!',
          message: `Your ${server.name} is now a Competitor for ${competitor.category} OTM. Good Luck!`,
          related_id: competitor.server_id as any
        } as any)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otmCompetitors'] })
    }
  })
}

export function useUpdateOTMCompetitorMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, servers, profiles, vote_url, ...data }: any) => {
      const { error } = await supabase
        .from('otm_competitors')
        .update(data)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otmCompetitors'] })
    }
  })
}

export function useDeleteOTMCompetitorMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('otm_competitors')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otmCompetitors'] })
    }
  })
}

export function useOTMVoteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, competitorId }: { userId: string; competitorId: string }) => {
      const { error } = await supabase
        .from('otm_votes')
        .insert({ user_id: userId, competitor_id: competitorId })
      
      if (error) {
        if (error.code === '23505') throw new Error('Already voted for this competitor')
        if (error.code === 'P0001') throw new Error(error.message)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otmCompetitors'] })
      queryClient.invalidateQueries({ queryKey: ['userOTMVotes'] })
    }
  })
}

export function useOTMUnvoteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, competitorId }: { userId: string; competitorId: string }) => {
      const { error } = await supabase
        .from('otm_votes')
        .delete()
        .eq('user_id', userId)
        .eq('competitor_id', competitorId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otmCompetitors'] })
      queryClient.invalidateQueries({ queryKey: ['userOTMVotes'] })
    }
  })
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}

export function useClearAllNotificationsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from('notifications').delete().eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}

export function useClearAuditLogsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ adminId, adminName }: { adminId: string; adminName: string }) => {
      const { error } = await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
      if (error) throw error

      // Log the clearing action itself
      await logAction('AUDIT_LOGS_CLEARED', {}, adminId, adminName)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    }
  })
}

export function useClearVoteLogsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ adminId, adminName }: { adminId: string; adminName: string }) => {
      const { error } = await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
      if (error) throw error

      // Log the clearing action
      await logAction('VOTE_LOGS_CLEARED', {}, adminId, adminName)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voteLogs'] })
      queryClient.invalidateQueries({ queryKey: ['servers'] })
      queryClient.invalidateQueries({ queryKey: ['server'] })
    }
  })
}

export function useCreateCategoryRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { requester_id: string; subject: string; description: string }) => {
      const { error } = await supabase.from('category_requests').insert([data])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryRequests'] })
    }
  })
}

export function useUpdateCategoryRequestStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      adminId, 
      adminName 
    }: { 
      id: string; 
      status: 'accepted' | 'rejected'; 
      adminId?: string | null; 
      adminName?: string | null; 
    }) => {
      // 1. Get request details
      const { data: request } = await supabase
        .from('category_requests')
        .select('*')
        .eq('id', id)
        .single()
      
      if (!request) throw new Error('Request not found')

      // 2. Update status
      const { error: updateError } = await supabase
        .from('category_requests')
        .update({ status })
        .eq('id', id)
      
      if (updateError) throw updateError

      // 3. Create Notification for user
      await supabase.from('notifications').insert({
        user_id: request.requester_id,
        type: 'category_request_result',
        title: `Category Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your Request ${request.subject} has been ${status}.`,
        related_id: id
      } as any)

      // 4. Log Action
      await logAction(
        status === 'accepted' ? 'CATEGORY_REQUEST_ACCEPTED' : 'CATEGORY_REQUEST_REJECTED',
        { subject: request.subject, description: request.description },
        adminId,
        adminName,
        id
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryRequests'] })
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    }
  })
}
export function useDeleteCategoryRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, adminId, adminName }: { id: string; adminId?: string | null; adminName?: string | null }) => {
      // 1. Get details for the log before deleting
      const { data: request } = await supabase
        .from('category_requests')
        .select('*')
        .eq('id', id)
        .single()
      
      const { error } = await supabase.from('category_requests').delete().eq('id', id)
      if (error) throw error

      // 2. Log Action if request was found
      if (request) {
        await logAction(
          'CATEGORY_REQUEST_DELETED',
          { subject: request.subject, description: request.description },
          adminId,
          adminName,
          id
        )
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryRequests'] })
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    }
  })
}

export function useAddTeamMemberMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, roleTitle, adminId, adminName }: { userId: string, roleTitle: string, adminId?: string | null, adminName?: string | null }) => {
      // Get next display order
      const { data: currentMembers } = await supabase.from('team_members').select('display_order').order('display_order', { ascending: false }).limit(1)
      const nextOrder = currentMembers && currentMembers.length > 0 ? currentMembers[0].display_order + 1 : 0

      const { error } = await supabase.from('team_members').insert({
        user_id: userId,
        role_title: roleTitle,
        display_order: nextOrder
      })
      if (error) throw error

      const { data: profile } = await supabase.from('profiles').select('discord_username').eq('id', userId).single()
      
      await logAction('TEAM_MEMBER_ADDED', { username: profile?.discord_username, roleTitle }, adminId, adminName, userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] })
    }
  })
}

export function useRemoveTeamMemberMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, adminId, adminName }: { id: string, adminId?: string | null, adminName?: string | null }) => {
      // Get details before delete
      const { data: member } = await supabase.from('team_members').select('*, profiles(discord_username)').eq('id', id).single()
      
      const { error } = await supabase.from('team_members').delete().eq('id', id)
      if (error) throw error

      await logAction('TEAM_MEMBER_REMOVED', { username: (member as any)?.profiles?.discord_username }, adminId, adminName, (member as any)?.user_id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] })
    }
  })
}

export function useUpdateTeamMembersOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ members, adminId, adminName }: { members: { id: string, user_id: string, display_order: number }[], adminId?: string | null, adminName?: string | null }) => {
      const { error } = await supabase.from('team_members').upsert(members)
      if (error) throw error
      
      await logAction('TEAM_ORDER_UPDATED', { count: members.length }, adminId, adminName)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] })
    }
  })
}

export function useUpdateTeamMemberRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, roleTitle, adminId, adminName }: { id: string, roleTitle: string, adminId?: string | null, adminName?: string | null }) => {
      const { error } = await supabase.from('team_members').update({ role_title: roleTitle }).eq('id', id)
      if (error) throw error
      
      const { data: member } = await supabase.from('team_members').select('profiles(discord_username)').eq('id', id).single()
      await logAction('TEAM_MEMBER_ROLE_UPDATED', { username: (member as any)?.profiles?.discord_username, newRole: roleTitle }, adminId, adminName)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] })
    }
  })
}

export function useUpdateSiteSettingMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ key, value, adminId, adminName }: { key: string, value: any, adminId?: string | null, adminName?: string | null }) => {
      const { error } = await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
      if (error) throw error
      
      await logAction('SITE_SETTING_UPDATED', { key }, adminId, adminName)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['siteSetting', variables.key] })
    }
  })
}

export function useSubmitReportMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { reporter_id: string; server_id: string; subject: string; message: string }) => {
      const { error } = await supabase.from('reports').insert([data])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    }
  })
}

export function useUpdateReportStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      adminId, 
      adminName 
    }: { 
      id: string; 
      status: 'reviewing' | 'resolved' | 'rejected'; 
      adminId?: string | null; 
      adminName?: string | null; 
    }) => {
      // 1. Get report details before update
      const { data: report } = await supabase
        .from('reports')
        .select('*, servers(name, slug)')
        .eq('id', id)
        .single()
      
      if (!report) throw new Error('Report not found')

      const serverName = (report as any).servers?.name || 'Unknown Server'

      // 2. Update status
      const { error: updateError } = await supabase
        .from('reports')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
      
      if (updateError) throw updateError

      // 3. Create Notification for reporter
      let notificationMessage = ''
      if (status === 'reviewing') {
        notificationMessage = `Your Report to ${serverName} is now being reviewed`
      } else if (status === 'resolved') {
        notificationMessage = `Your Report to ${serverName} has been Resolved`
      } else if (status === 'rejected') {
        notificationMessage = `Your Report to ${serverName} has been rejected`
      }

      await supabase.from('notifications').insert({
        user_id: report.reporter_id,
        type: 'report_update',
        title: 'Report Update',
        message: notificationMessage,
        related_id: report.server_id
      } as any)

      // 4. Log Action
      const actionName = status === 'reviewing' ? 'REPORT_REVIEWED' : 
                        status === 'resolved' ? 'REPORT_RESOLVED' : 
                        'REPORT_REJECTED'

      await logAction(
        actionName,
        { serverName, subject: report.subject },
        adminId,
        adminName,
        id
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    }
  })
}

export function useDeleteReportMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, adminId, adminName }: { id: string; adminId?: string | null; adminName?: string | null }) => {
      const { data: report } = await supabase.from('reports').select('subject').eq('id', id).single()
      
      const { error } = await supabase.from('reports').delete().eq('id', id)
      if (error) throw error

      if (report) {
        await logAction('REPORT_DELETED', { subject: report.subject }, adminId, adminName, id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    }
  })
}
