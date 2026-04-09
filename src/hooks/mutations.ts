import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { ServerStatus, UserRole } from '../types'

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
    mutationFn: async (id: string) => {
      // 0. Get server data for asset cleanup
      const { data: server } = await supabase.from('servers').select('icon_url, banner_url').eq('id', id).single()

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
    mutationFn: async ({ id, status }: { id: string, status: ServerStatus }) => {
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
    mutationFn: async ({ id, role }: { id: string, role: UserRole }) => {
      const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    }
  })
}

export function useSubmitServerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (formData: any) => {
      const { error } = await supabase.from('servers').insert([formData])
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
      const { error } = await supabase.from('servers').update(formData).eq('id', id)
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

export function useSendMessageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ 
      serverId, 
      senderId, 
      subject, 
      message, 
      type 
    }: { 
      serverId: string; 
      senderId: string; 
      subject: string; 
      message: string; 
      type: 'contact' | 'rejection' 
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
    mutationFn: async ({ id, servers, profiles, ...winner }: any) => {
      const { error } = await supabase
        .from('otm_winners')
        .upsert(winner, { onConflict: 'month,category' })
      if (error) throw error

      // Notification if podium
      if (winner.server_id) {
        const { data: server } = await supabase.from('servers').select('owner_id, name').eq('id', winner.server_id).single()
        if (server && server.owner_id) {
          const categoryDisplay = winner.category.charAt(0).toUpperCase() + winner.category.slice(1)
          await supabase.from('notifications').insert({
            user_id: server.owner_id,
            type: 'otm_podium',
            title: 'OTM Winner !',
            message: `🎉Congratulations, Your Server ${server.name} is ${winner.month} ${categoryDisplay} Of The Month !`,
            related_id: winner.server_id
          } as any)
        }
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
    mutationFn: async (competitor: any) => {
      // Remove vote_url if it exists
      const { vote_url, ...cleanCompetitor } = competitor
      const { error } = await supabase
        .from('otm_competitors')
        .insert([cleanCompetitor])
      if (error) throw error

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
    mutationFn: async ({ id, servers, vote_url, ...data }: any) => {
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
