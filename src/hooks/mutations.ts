import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { ServerStatus, UserRole, OTMCategory, OTMConfig } from '../types'
import { logAction } from '../lib/audit'
import { 
  sendApprovalNotification, 
  sendStaffReviewNotification, 
  sendLogNotification, 
  sendErrorNotification 
} from '../lib/discord'

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
    },
    onError: (error, variables) => {
      sendErrorNotification({
        error,
        context: 'User attempted to vote',
        userEmail: variables.userId
      })
    }
  })
}

export function useDeleteServerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, adminId, adminName }: { id: string, adminId?: string | null, adminName?: string | null }) => {
      // 0. Get server data for asset cleanup and logging
      const { data: server } = await supabase.from('servers').select('icon_url, banner_url, gallery, name').eq('id', id).single()

      if (server) {
        const filesToDelete: string[] = []
        const getPath = (url: string) => {
          if (!url || !url.includes('server-assets/')) return null
          return url.split('server-assets/').pop()
        }

        const iconPath = getPath(server.icon_url || '')
        const bannerPath = getPath(server.banner_url || '')
        const galleryPaths = (server.gallery || []).map((url: string) => getPath(url)).filter(Boolean) as string[]
        
        if (iconPath) filesToDelete.push(iconPath)
        if (bannerPath) filesToDelete.push(bannerPath)
        filesToDelete.push(...galleryPaths)

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
        await sendLogNotification({
          action: '🗑️ Server Deleted',
          adminName: adminName,
          details: `**${server.name}** has been permanently deleted from the platform.`,
          color: 0xe74c3c // Soft Red
        })
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
      const { data: server } = await supabase.from('servers').select('owner_id, name, status, slug, icon_url').eq('id', id).single()

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
        } else if (server.status === 'Review Gallery') {
          title = 'Gallery Approved'
          message = `Your new gallery pictures for "${server.name}" have been approved!`
        } else if (server.status === 'Review Icon & Gallery') {
          title = 'Assets Approved'
          message = `Your icon and gallery for "${server.name}" have been approved!`
        } else if (server.status === 'Review Cover & Gallery') {
          title = 'Assets Approved'
          message = `Your cover and gallery for "${server.name}" have been approved!`
        } else if (server.status === 'Review All Assets') {
          title = 'Assets Approved'
          message = `All visual assets for "${server.name}" have been approved!`
        }

        await supabase.from('notifications').insert({
          user_id: server.owner_id,
          type: 'approval',
          title,
          message,
          related_id: id
        } as any)

        // 2a. Discord Notification
        if (server.name && server.slug) {
          if (server.status === 'pending') {
            // New submission: Notify Public AND Logs
            await sendApprovalNotification({
              serverName: server.name,
              adminName: adminName || 'A Staff Member',
              slug: server.slug,
              iconUrl: server.icon_url,
              type: 'new_listing',
              target: 'public'
            })
            await sendApprovalNotification({
              serverName: server.name,
              adminName: adminName || 'A Staff Member',
              slug: server.slug,
              iconUrl: server.icon_url,
              type: 'new_listing',
              target: 'logs',
              previousStatus: server.status
            })
          } else {
            // Asset update: Notify Logs only
            await sendApprovalNotification({
              serverName: server.name,
              adminName: adminName || 'A Staff Member',
              slug: server.slug,
              iconUrl: server.icon_url,
              type: 'asset_update',
              target: 'logs',
              previousStatus: server.status
            })
          }
        }
      }

      // 3. Log action
      await logAction(
        status === 'approved' ? 'SERVER_APPROVED' : 'SERVER_STATUS_CHANGED', 
        { serverName: server?.name, newStatus: status },
        adminId,
        adminName,
        id
      )

      // 3a. Log to Discord if status changed but NOT approved (approvals handled above)
      if (status !== 'approved' && server?.name) {
        await sendLogNotification({
          action: '📝 Server Status Updated',
          adminName: adminName,
          details: `**${server.name}** status changed to **${status}** (previously: \`${server.status}\`).`,
        })
      }

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServers'] })
      queryClient.invalidateQueries({ queryKey: ['servers'] })
      queryClient.invalidateQueries({ queryKey: ['userServers'] })
      queryClient.invalidateQueries({ queryKey: ['server'] })
    },
    onError: (error, variables) => {
      sendErrorNotification({
        error,
        context: `Admin attempted to update ${variables.id} status to ${variables.status}`,
        userEmail: variables.adminId
      })
    }
  })
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, role, adminId, adminName }: { id: string, role: UserRole, adminId?: string | null, adminName?: string | null }) => {
      // Get target user details
      const { data: targetProfile } = await supabase.from('profiles').select('discord_username, role').eq('id', id).single()

      const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
      if (error) throw error

      await logAction(
        'ROLE_CHANGED',
        { targetUser: targetProfile?.discord_username, newRole: role },
        adminId,
        adminName,
        id
      )

      await sendLogNotification({
        action: '🔐 User Role Changed',
        adminName: adminName,
        details: `**${targetProfile?.discord_username}**'s role set to **${role}** (previously: \`${targetProfile?.role}\`).`,
        color: 0xf1c40f // Yellow
      })
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
      const { error } = await supabase.from('servers').insert([{ ...formData, status: 'pending', last_edited_at: new Date().toISOString() }])
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userServers'] })
      queryClient.invalidateQueries({ queryKey: ['adminServers'] })

      // Discord Staff Notification
      if (variables?.name) {
        sendStaffReviewNotification({
          serverName: variables.name,
          status: variables.status || 'pending',
          iconUrl: variables.icon_url
        })
      }
    },
    onError: (error, variables) => {
      sendErrorNotification({
        error,
        context: `User attempted to submit server: ${variables.name}`,
        userEmail: variables.owner_id
      })
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['server'] })
      queryClient.invalidateQueries({ queryKey: ['userServers'] })
      queryClient.invalidateQueries({ queryKey: ['servers'] })
      queryClient.invalidateQueries({ queryKey: ['adminServers'] })

      // Discord Staff Notification for asset reviews
      const isReviewStatus = variables?.status && (
        variables.status === 'Review Icon' || 
        variables.status === 'Review Cover' || 
        variables.status === 'Review Icon & Cover' ||
        variables.status === 'Review Gallery' ||
        variables.status === 'Review Icon & Gallery' ||
        variables.status === 'Review Cover & Gallery' ||
        variables.status === 'Review All Assets'
      );

      if (isReviewStatus && variables?.name) {
        sendStaffReviewNotification({
          serverName: variables.name,
          status: variables.status,
          iconUrl: variables.icon_url
        })
      }
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
      subject, 
      message, 
      type,
      adminId,
      adminName 
    }: { 
      serverId: string; 
      subject: string; 
      message: string; 
      type: 'contact' | 'rejection';
      adminId?: string | null;
      adminName?: string | null;
    }) => {
      // 1. Get server data and owner's discord_id for DM
      const { data: server } = await supabase
        .from('servers')
        .select('owner_id, name, status, slug, icon_url')
        .eq('id', serverId)
        .single()

      let ownerDiscordId: string | null = null
      if (server?.owner_id) {
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('discord_id')
          .eq('id', server.owner_id)
          .single()
        ownerDiscordId = ownerProfile?.discord_id || null
      }

      // 2. Send Discord DM via Edge Function
      let dmSent = false
      if (ownerDiscordId) {
        try {
          const { data: dmResult, error: dmError } = await supabase.functions.invoke('send-discord-dm', {
            body: {
              discord_id: ownerDiscordId,
              subject,
              message,
              type,
              server_name: server?.name || 'Unknown Server',
              server_slug: server?.slug || '',
              admin_name: adminName || 'Realm Explorer Staff',
              icon_url: server?.icon_url
            }
          })
          if (dmError) {
            console.error('Edge function error:', dmError)
          } else {
            dmSent = dmResult?.dm_sent === true
            if (!dmSent) {
              console.warn('DM not delivered:', dmResult)
            }
          }
        } catch (err) {
          console.error('Failed to invoke send-discord-dm:', err)
        }
      }

      // 3. Update server status (only for rejections — contact keeps server public)
      const newStatus: ServerStatus | null = type === 'rejection' ? 'rejected' : null
      if (newStatus) {
        const { error: statusError } = await supabase.from('servers').update({ status: newStatus }).eq('id', serverId)
        if (statusError) throw statusError
      }

      // 4. Create in-app notification (always, as fallback)
      if (server && server.owner_id) {
        let title = type === 'rejection' ? 'Listing Rejected' : 'New Staff Message'
        let messageBody = type === 'rejection' 
          ? `Your server "${server.name}" listing was rejected. Check your Discord DMs for details.` 
          : `A staff member sent a message regarding "${server.name}". Check your Discord DMs.`

        if (type === 'rejection') {
          if (server.status === 'Review Icon') {
            title = 'Icon Rejected'
            messageBody = `Your new icon for "${server.name}" was rejected. Check your Discord DMs for details.`
          } else if (server.status === 'Review Cover') {
            title = 'Cover Rejected'
            messageBody = `Your new cover for "${server.name}" was rejected. Check your Discord DMs for details.`
          } else if (server.status === 'Review Icon & Cover') {
            title = 'Assets Rejected'
            messageBody = `Your icon and cover for "${server.name}" were rejected. Check your Discord DMs for details.`
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

      // 5. Log Action
      await logAction(
        type === 'rejection' ? 'SERVER_REJECTED' : 'SERVER_CONTACTED',
        { serverName: server?.name, subject, dmSent },
        adminId,
        adminName,
        serverId
      )

      await sendLogNotification({
        action: type === 'rejection' ? '❌ Server Listing Rejected' : '📧 Staff Outreach Sent',
        adminName: adminName,
        details: type === 'rejection'
          ? `**${server?.name}** status changed to **rejected** (previously: \`${server?.status}\`).\n\n**Subject:** ${subject}\n**Discord DM:** ${dmSent ? '✅ Delivered' : '⚠️ Failed (in-app notification sent as fallback)'}`
          : `Staff message sent to **${server?.name}** owner.\n\n**Subject:** ${subject}\n**Discord DM:** ${dmSent ? '✅ Delivered' : '⚠️ Failed (in-app notification sent as fallback)'}`,
        color: type === 'rejection' ? 0xe67e22 : 0x3498db
      })

      return { serverId, dmSent }
    },
    onSuccess: () => {
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

export function useUpdateOTMSettingsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (config: OTMConfig) => {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'otm_global_config', value: config as any }, { onConflict: 'key' })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otmSettings'] })
    }
  })
}

export function useResetOTMVotesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ adminId, adminName }: { adminId: string; adminName: string }) => {
      const { error } = await supabase.from('otm_votes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) throw error

      await logAction('OTM_VOTES_RESET', {}, adminId, adminName)
      await sendLogNotification({
        action: '🧹 OTM Votes Reset',
        adminName: adminName,
        details: 'All historical OTM votes have been permanently cleared.',
        color: 0x95a5a6
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otmCompetitors'] })
      queryClient.invalidateQueries({ queryKey: ['userOTMVotes'] })
    }
  })
}

export function useResetOTMCooldownsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ adminId, adminName }: { adminId: string; adminName: string }) => {
      const { error } = await supabase.rpc('reset_otm_cooldowns' as any)
      if (error) throw error

      await logAction('OTM_COOLDOWNS_RESET', { scope: 'global' }, adminId, adminName)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userOTMVotes'] })
    }
  })
}

// Remove useDeleteOTMCompetitorMutation as well

export function useOTMVoteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, serverId, targetUserId, category, voterName }: { userId: string; serverId?: string | null; targetUserId?: string | null; category: OTMCategory; voterName?: string }) => {
      const { error } = await supabase
        .from('otm_votes')
        .insert({ 
          user_id: userId, 
          server_id: serverId || null, 
          target_user_id: targetUserId || null,
          category 
        } as any)
      
      if (error) {
        if (error.code === '23505') throw new Error('Already voted recently')
        throw error
      }

      // Log Action
      await logAction('OTM_VOTE', { 
        voter: voterName || 'User', 
        target: serverId || targetUserId,
        category
      }, userId, voterName)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otmCompetitors'] })
      queryClient.invalidateQueries({ queryKey: ['userOTMVotes'] })
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    }
  })
}

// Removed useOTMUnvoteMutation as per overhaul (fixed voting with cooldown)

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
      await sendLogNotification({
        action: '🧹 Audit Logs Cleared',
        adminName: adminName,
        details: 'The system audit logs have been purged.',
        color: 0x95a5a6 // Gray
      })
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
      await sendLogNotification({
        action: '🗳️ Vote Logs Cleared',
        adminName: adminName,
        details: 'All server votes have been reset.',
        color: 0x95a5a6 // Gray
      })
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

export function useCreateBlogPostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ authorId, title, slug, category, content, image_url, is_featured, adminId, adminName }: any) => {
      // If this post is being featured, unfeature all others first
      if (is_featured) {
        await supabase.from('blog_posts').update({ is_featured: false }).eq('is_featured', true)
      }

      const { error } = await supabase.from('blog_posts').insert([{
        author_id: authorId,
        title,
        slug,
        category: category || 'Event/News',
        content,
        image_url,
        is_featured: !!is_featured,
        status: 'published'
      }])
      if (error) throw error

      await logAction('BLOG_POST_CREATED', { title }, adminId, adminName)
      await sendLogNotification({
        action: '📰 New Blog Post',
        adminName: adminName,
        details: `**${title}** has been published to the blog.`,
        color: 0x3498db // Blue
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] })
    }
  })
}

export function useUpdateBlogPostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, title, slug, category, content, image_url, is_featured, old_image_url, adminId, adminName }: any) => {
      // If this post is being featured, unfeature all others first
      if (is_featured) {
        await supabase.from('blog_posts').update({ is_featured: false }).eq('is_featured', true)
      }

      // 1. Update record
      const { error } = await supabase.from('blog_posts').update({
        title,
        slug,
        category,
        content,
        image_url,
        is_featured: !!is_featured,
        updated_at: new Date().toISOString()
      }).eq('id', id)
      
      if (error) throw error

      // 2. Cleanup old image if changed
      if (old_image_url && image_url !== old_image_url) {
        const getPath = (url: string) => {
          if (!url || !url.includes('blog-images/')) return null
          return url.split('blog-images/').pop()
        }
        const oldPath = getPath(old_image_url)
        if (oldPath) {
          await supabase.storage.from('blog-images').remove([oldPath])
        }
      }

      await logAction('BLOG_POST_UPDATED', { title }, adminId, adminName, id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] })
      queryClient.invalidateQueries({ queryKey: ['blogPost'] })
    }
  })
}

export function useDeleteBlogPostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, image_url, adminId, adminName }: { id: string, image_url?: string | null, adminId?: string, adminName?: string }) => {
      // 1. Cleanup image
      if (image_url) {
        const getPath = (url: string) => {
          if (!url || !url.includes('blog-images/')) return null
          return url.split('blog-images/').pop()
        }
        const path = getPath(image_url)
        if (path) {
          await supabase.storage.from('blog-images').remove([path])
        }
      }

      // 2. Delete record
      const { error } = await supabase.from('blog_posts').delete().eq('id', id)
      if (error) throw error

      await logAction('BLOG_POST_DELETED', { id }, adminId, adminName, id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] })
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

      await sendLogNotification({
        action: status === 'accepted' ? '✅ Category Request Accepted' : '❌ Category Request Rejected',
        adminName: adminName,
        details: `**Request:** ${request.subject}\n**Description:** ${request.description}`,
        color: status === 'accepted' ? 0x2ecc71 : 0xe74c3c
      })
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
      await sendLogNotification({
        action: '👤 Team Member Added',
        adminName: adminName,
        details: `**${profile?.discord_username}** joined the team as **${roleTitle}**.`,
        color: 0x8e44ad // Purple
      })
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
      
      await sendLogNotification({
        action: '👤 Team Member Removed',
        adminName: adminName,
        details: `**${(member as any)?.profiles?.discord_username}** has been removed from the team.`,
        color: 0xc0392b // Dark Red
      })
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
      // Get details before update
      const { data: member } = await supabase.from('team_members').select('role_title, profiles(discord_username)').eq('id', id).single()
      
      const { error } = await supabase.from('team_members').update({ role_title: roleTitle }).eq('id', id)
      if (error) throw error
      
      await logAction('TEAM_MEMBER_ROLE_UPDATED', { username: (member as any)?.profiles?.discord_username, newRole: roleTitle }, adminId, adminName)

      await sendLogNotification({
        action: '👤 Team Member Role Updated',
        adminName: adminName,
        details: `**${(member as any)?.profiles?.discord_username}**'s team role set to **${roleTitle}** (previously: \`${(member as any)?.role_title}\`).`,
        color: 0x8e44ad // Purple
      })
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

      await sendLogNotification({
        action: '🚩 Report Status Updated',
        adminName: adminName,
        details: `Report for **${serverName}** marked as **${status}** (previously: \`${report.status}\`).\n**Subject:** ${report.subject}`,
        color: status === 'resolved' ? 0x2ecc71 : status === 'rejected' ? 0xe74c3c : 0xf1c40f
      })
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

export function useToggleBlogPostLikeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ postId, userId, hasLiked }: { postId: string, userId: string, hasLiked: boolean }) => {
      if (hasLiked) {
        // Remove like
        const { error } = await supabase
          .from('blog_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
        if (error) throw error
      } else {
        // Add like
        const { error } = await supabase
          .from('blog_post_likes')
          .insert([{ post_id: postId, user_id: userId }])
        if (error) throw error
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blogPostLikes', variables.postId] })
    }
  })
}
