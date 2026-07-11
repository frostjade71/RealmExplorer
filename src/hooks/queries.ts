import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { 
  Server, 
  ServerCategory, 
  ServerType, 
  ServerStatus,
  Profile, 
  ServerRating, 
  OTMWinner, 
  OTMCompetitor,
  Notification,
  TeamMember,
  SiteSetting,
  CategoryRequest,
  Report,
  BlogPost,
  OTMCategory,
  OTMConfig,
  Badge,
  ServerStaff,
  ServerAppeal,
  Project,
  ProjectRating
} from '../types'

export function useServers(params?: {
  type?: ServerType
  category?: ServerCategory | null
  featured?: boolean
  searchQuery?: string
  sortBy?: string
  limit?: number
}) {
  return useQuery({
    queryKey: ['servers', params],
    queryFn: async () => {
      let query = supabase.from('public_servers').select('*, profiles(*)').eq('status', 'approved')

      if (params?.type) query = query.eq('type', params.type)
      if (params?.category) query = query.eq('category', params.category)
      if (params?.featured) query = query.eq('featured', true)
      if (params?.searchQuery) query = query.ilike('name', `%${params.searchQuery}%`)
      
      if (params?.sortBy === 'votes') {
        query = query.order('votes', { ascending: false })
      } else if (params?.sortBy === 'rating') {
        query = query.order('weighted_rating', { ascending: false })
      } else if (params?.sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true })
      } else {
        // Default to newest
        query = query.order('created_at', { ascending: false })
      }

      if (params?.limit) query = query.limit(params.limit)

      const { data, error } = await query
      if (error) throw error
      return data as unknown as Server[]
    }
  })
}

export function useTopVoters(serverId: string | undefined) {
  return useQuery({
    queryKey: ['topVoters', serverId],
    enabled: !!serverId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_top_voters' as any, {
        server_uuid: serverId!
      })
      if (error) throw error
      return data as { minecraft_username: string; vote_count: number }[]
    }
  })
}

export function useRecentVoters(serverId: string | undefined) {
  return useQuery({
    queryKey: ['recentVoters', serverId],
    enabled: !!serverId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('votes')
        .select('minecraft_username, created_at')
        .eq('server_id', serverId!)
        .not('minecraft_username', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5)
      if (error) throw error
      return data as unknown as { minecraft_username: string; created_at: string }[]
    }
  })
}

export function useServerRank(serverId: string | undefined) {
  return useQuery({
    queryKey: ['serverRank', serverId],
    enabled: !!serverId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_server_rank' as any, {
        server_uuid: serverId!
      })
      if (error) throw error
      return data as number | null
    }
  })
}

export function useServerPlayerHistory(serverId: string | undefined) {
  return useQuery({
    queryKey: ['serverPlayerHistory', serverId],
    enabled: !!serverId,
    queryFn: async () => {
      const eightDaysAgo = new Date()
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8)
      
      const { data, error } = await supabase
        .from('server_player_history' as any)
        .select('record_date, max_players')
        .eq('server_id', serverId!)
        .gte('record_date', eightDaysAgo.toISOString().split('T')[0])
        .order('record_date', { ascending: true })

      if (error) throw error
      return data as unknown as { record_date: string; max_players: number }[]
    }
  })
}

export function useServer(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: ['server', idOrSlug],
    enabled: !!idOrSlug,
    queryFn: async () => {
      // Use secure RPC that returns full server details (including connection info)
      // for a single server only — prevents bulk scraping of IPs/codes
      const { data, error } = await supabase.rpc('get_server_details', {
        server_slug: idOrSlug!
      })
      if (error) throw error
      if (!data) throw new Error('Server not found')

      const result = data as any
      const server = result.server || (result.id ? result : null)
      if (!server) throw new Error('Server data missing')

      let owner = result.owner || server.profiles || null

      // Fallback: If owner is missing but owner_id exists, fetch the profile manually
      if (!owner && server.owner_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', server.owner_id)
          .single()
        
        if (profile) owner = profile
      }

      return {
        server: server as Server,
        owner: owner as Profile | null
      }
    }
  })
}

export function useUserServers(userId: string | undefined, status?: ServerStatus) {
  return useQuery({
    queryKey: ['userServers', userId, status],
    enabled: !!userId,
    queryFn: async () => {
      const isApproved = status === 'approved'
      const table = isApproved ? 'public_servers' : 'servers'

      let query: any = supabase.from(table as any).select('*')
      
      query = query.eq('owner_id', userId!)
      query = query.order('created_at', { ascending: false })
      
      if (status && !isApproved) {
        query = query.eq('status', status)
      }

      const { data, error } = await query
      if (error) throw error
      return data as unknown as Server[]
    }
  })
}

export function useProfileByUsername(username: string | undefined) {
  return useQuery({
    queryKey: ['profile', username],
    enabled: !!username,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('discord_username', username!)
        .single()
      if (error) throw error
      return data as unknown as Profile
    }
  })
}

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId!)
        .single()
      if (error) throw error
      return data as unknown as Profile
    }
  })
}

export function useGlobalStats() {
  return useQuery({
    queryKey: ['globalStats'],
    queryFn: async () => {
      const { count: serverCount } = await supabase.from('public_servers').select('*', { count: 'exact', head: true }).eq('status', 'approved')
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      return { servers: serverCount || 450, users: userCount || 12000 }
    }
  })
}

export function useAdminServers() {
  return useQuery({
    queryKey: ['adminServers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('servers').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as Server[]
    }
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as Profile[]
    }
  })
}
export function useUserVoteStatus(userId: string | undefined, serverId: string | undefined) {
  return useQuery({
    queryKey: ['voteStatus', userId, serverId],
    enabled: !!userId && !!serverId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cooldowns')
        .select('expires_at')
        .eq('user_id', userId!)
        .eq('server_id', serverId!)
        .maybeSingle()
      
      if (error) throw error
      
      if (data) {
        const expiresAt = new Date(data.expires_at).getTime()
        const now = new Date().getTime()
        const isCooldownActive = expiresAt > now
        
        // If the cooldown has expired, it's effectively like not having voted yet
        if (!isCooldownActive) return { hasVoted: false, lastVoteTime: null, expiresAt: null }

        // We back-calculate the "last vote time" as expiresAt - 24h for the timer to work
        const lastVoteTime = new Date(expiresAt - 24 * 60 * 60 * 1000).toISOString()
        
        return { 
          hasVoted: true, 
          lastVoteTime,
          expiresAt: data.expires_at
        }
      }

      return { hasVoted: false, lastVoteTime: null, expiresAt: null }
    }
  })
}

export function useServerRatings(serverId: string | undefined) {
  return useQuery({
    queryKey: ['serverRatings', serverId],
    enabled: !!serverId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('server_ratings')
        .select('*, profiles(*)')
        .eq('server_id', serverId!)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as unknown as (ServerRating & { profiles: Profile })[]
    }
  })
}

export function useProjectReviews(projectId: string | undefined) {
  return useQuery({
    queryKey: ['projectRatings', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_ratings' as any)
        .select('*, profiles(*)')
        .eq('project_id', projectId!)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as unknown as (ProjectRating & { profiles: Profile })[]
    }
  })
}




export function useOTMWinners() {
  return useQuery({
    queryKey: ['otmWinners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('otm_winners')
        .select('*, servers(*), profiles(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as OTMWinner[]
    }
  })
}

export function useOTMCompetitors(category: OTMCategory, enabled: boolean = true) {
  return useQuery({
    queryKey: ['otmCompetitors', category],
    enabled,
    queryFn: async () => {
      if (category === 'realm' || category === 'server') {
        const { data, error } = await supabase
          .from('public_servers')
          .select('*, otm_votes(count)')
          .eq('status', 'approved')
          .eq('type', category)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        return (data as any[]).map(s => ({
          id: s.id,
          category,
          server_id: s.id,
          user_id: null,
          total_votes: s.otm_votes?.[0]?.count || 0,
          created_at: s.created_at,
          servers: {
            name: s.name,
            description: s.description,
            icon_url: s.icon_url,
            slug: s.slug,
            banner_url: s.banner_url
          }
        })) as unknown as OTMCompetitor[]
      } else {
        // Developers/Builders
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .not('discord_username', 'is', null)
          .order('created_at', { ascending: false })
        
        if (profilesError) throw profilesError

        const { data: votesData, error: votesError } = await supabase
          .from('otm_votes')
          .select('target_user_id')
          .eq('category', category)
        
        if (votesError) throw votesError
        
        const voteCounts = (votesData || []).reduce((acc: any, vote: any) => {
           if (vote.target_user_id) {
             acc[vote.target_user_id] = (acc[vote.target_user_id] || 0) + 1
           }
           return acc
        }, {})

        return (profiles as any[]).map(p => ({
          id: p.id,
          category,
          server_id: null,
          user_id: p.id,
          total_votes: voteCounts[p.id] || 0,
          created_at: p.created_at,
          profiles: p as Profile
        })) as unknown as OTMCompetitor[]
      }
    }
  })
}

export function useUserOTMVotes(userId: string | undefined) {
  return useQuery({
    queryKey: ['userOTMVotes', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('otm_votes')
        .select('server_id, target_user_id, category, created_at')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return (data || []).map((v: any) => ({
        id: v.server_id || v.target_user_id,
        category: v.category,
        created_at: v.created_at
      }))
    }
  })
}

export function useOTMSettings() {
  return useQuery({
    queryKey: ['otmSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'otm_global_config')
        .maybeSingle()
      
      if (error) throw error
      
      const defaultConfig: OTMConfig = {
        competition_status: { realm: true, server: true, developer: true, builder: true },
        next_start_times: { realm: null, server: null, developer: null, builder: null },
        end_times: { realm: null, server: null, developer: null, builder: null }
      }

      if (!data) return defaultConfig
      return { ...defaultConfig, ...(data.value as any) } as OTMConfig
    }
  })
}

export function useNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: ['notifications', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Notification[]
    }
  })
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })
}

export function useVoteLogs() {
  return useQuery({
    queryKey: ['voteLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          *,
          profiles (discord_username, discord_id),
          servers (name)
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })
}

export function useCategoryRequests(userId?: string) {
  return useQuery({
    queryKey: ['categoryRequests', userId],
    queryFn: async () => {
      let query = supabase
        .from('category_requests')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false })
      
      if (userId) {
        query = query.eq('requester_id', userId)
      }

      const { data, error } = await query
      if (error) throw error
      return data as unknown as CategoryRequest[]
    }
  })
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*, profiles(*)')
        .order('display_order', { ascending: true })
      
      if (error) throw error
      return data as unknown as TeamMember[]
    }
  })
}

export function useSiteSetting(key: string) {
  return useQuery({
    queryKey: ['siteSetting', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', key)
        .single()
      
      if (error || !data) return null
      return data as unknown as SiteSetting
    }
  })
}

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*, profiles(*), servers(name, slug)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as unknown as Report[]
    }
  })
}

export function useBlogPosts(params?: { status?: 'draft' | 'published'; limit?: number }) {
  return useQuery({
    queryKey: ['blogPosts', params],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select('*, profiles(discord_username, discord_avatar)')
        .order('created_at', { ascending: false })

      if (params?.status) query = query.eq('status', params.status)
      if (params?.limit) query = query.limit(params.limit)

      const { data, error } = await query
      if (error) throw error
      return data as unknown as BlogPost[]
    }
  })
}

export function useBlogPost(slugOrId: string | undefined) {
  return useQuery({
    queryKey: ['blogPost', slugOrId],
    enabled: !!slugOrId,
    queryFn: async () => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId!)
      
      let query = supabase
        .from('blog_posts')
        .select('*, profiles(discord_username, discord_avatar)')
      
      if (isUuid) {
        query = query.eq('id', slugOrId!)
      } else {
        query = query.eq('slug', slugOrId!)
      }

      const { data, error } = await query.maybeSingle()
      if (error) throw error
      return data as unknown as BlogPost
    }
  })
}

export function useBlogPostLikes(postId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['blogPostLikes', postId, userId],
    enabled: !!postId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_post_likes')
        .select(`
          user_id,
          profiles (
            discord_username
          )
        `)
        .eq('post_id', postId!)

      if (error) throw error

      const usernames = data
        ?.map((l: any) => l.profiles?.discord_username)
        .filter(Boolean) || []

      const hasLiked = userId ? data?.some((l: any) => l.user_id === userId) : false

      return { 
        count: data?.length || 0, 
        hasLiked,
        likedBy: usernames
      }
    }
  })
}

export function useProjectLikes(projectId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['projectLikes', projectId, userId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_likes' as any)
        .select(`
          user_id,
          profiles (
            discord_username
          )
        `)
        .eq('project_id', projectId!)

      if (error) throw error

      const usernames = data
        ?.map((l: any) => l.profiles?.discord_username)
        .filter(Boolean) || []

      const hasLiked = userId ? data?.some((l: any) => l.user_id === userId) : false

      return { 
        count: data?.length || 0, 
        hasLiked,
        likedBy: usernames
      }
    }
  })
}

export function useBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase.from('badges').select('*').order('name', { ascending: true })
      if (error) throw error
      return data as unknown as Badge[]
    }
  })
}

export function useEntityBadges(targetId: string | undefined, targetType: 'user' | 'server') {
  return useQuery({
    queryKey: ['entityBadges', targetId, targetType],
    enabled: !!targetId,
    queryFn: async () => {
      // 1. Fetch manually assigned badges
      const { data: assigned, error } = await supabase
        .from('assigned_badges')
        .select('*, badge:badges(*)')
        .eq(targetType === 'user' ? 'user_id' : 'server_id', targetId!)
      
      if (error) throw error

      const results = (assigned || []).map((a: any) => ({
        ...a.badge,
        granted_at: a.granted_at,
        month: a.month
      })) as unknown as (Badge & { granted_at: string; month: string | null })[]

      // 2. Fetch automatic badges if it's a server
      if (targetType === 'server') {
        const [topVotesResult, topRatingsResult, serverResult, autoBadgesResult] = await Promise.all([
          supabase.from('public_servers').select('id').eq('status', 'approved').order('votes', { ascending: false }).limit(10),
          supabase.from('public_servers').select('id').eq('status', 'approved').order('weighted_rating', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('public_servers').select('created_at, profiles(role)').eq('id', targetId!).single(),
          supabase.from('badges').select('*').eq('type', 'automatic')
        ])

        const topVotes = topVotesResult.data || []
        const topRatings = topRatingsResult.data
        const server = serverResult.data
        const autoBadges = autoBadgesResult.data || []

        const now = new Date()
        
        // Fresh Server Check (<= 7 days old)
        if (server?.created_at) {
          const createdAt = new Date(server.created_at)
          const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
          if (diffDays <= 7) {
            const b = autoBadges.find(b => b.slug === 'fresh-server')
            if (b) results.push({ ...(b as unknown as Badge), granted_at: new Date().toISOString(), month: null })
          }
        }

        // Voting Rank Badge (RE Cod? for Top 10)
        const voteRank = topVotes.findIndex(s => s.id === targetId) + 1
        if (voteRank > 0 && voteRank <= 10) {
          const b = autoBadges.find(b => b.slug === 're-cod')
          if (b) results.push({ ...(b as unknown as Badge), granted_at: new Date().toISOString(), month: null })

          // Top 1, 2, 3 Specific Badges
          if (voteRank === 1) {
            const b = autoBadges.find(b => b.slug === 'top-votes')
            if (b) results.push({ ...(b as unknown as Badge), granted_at: new Date().toISOString(), month: null })
          } else if (voteRank === 2) {
            const b = autoBadges.find(b => b.slug === 'top-2-votes')
            if (b) results.push({ ...(b as unknown as Badge), granted_at: new Date().toISOString(), month: null })
          } else if (voteRank === 3) {
            const b = autoBadges.find(b => b.slug === 'top-3-votes')
            if (b) results.push({ ...(b as unknown as Badge), granted_at: new Date().toISOString(), month: null })
          }
        }
        if (topRatings?.id === targetId) {
          const b = autoBadges.find(b => b.slug === 'top-ratings')
          if (b) results.push({ ...(b as unknown as Badge), granted_at: new Date().toISOString(), month: null })
        }

        // Explorer+ Listing Badge
        if ((server as any)?.profiles?.role === 'explorer+') {
          const b = autoBadges.find(b => b.slug === 'explorer-plus')
          if (b) results.push({ ...(b as unknown as Badge), granted_at: new Date().toISOString(), month: null })
        }
      }

      return results
    }
  })
}

export function useAssignBadge() {
  return {
    mutateAsync: async ({ badgeId, userId, serverId, month }: { badgeId: string; userId?: string; serverId?: string; month?: string }) => {
      const { data, error } = await supabase
        .from('assigned_badges')
        .insert({
          badge_id: badgeId,
          user_id: userId || null,
          server_id: serverId || null,
          month: month || null
        } as any)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  }
}

export function useUnassignBadge() {
  return {
    mutateAsync: async (assignedBadgeId: string) => {
      const { error } = await supabase
        .from('assigned_badges')
        .delete()
        .eq('id', assignedBadgeId as any)
      
      if (error) throw error
    }
  }
}

export function usePaymentLogs() {
  return useQuery({
    queryKey: ['paymentLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments' as any)
        .select(`
          *,
          profiles (discord_username, discord_id)
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })
}

export function useServerStaff(serverId: string | undefined) {
  return useQuery({
    queryKey: ['serverStaff', serverId],
    enabled: !!serverId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('server_staff' as any)
        .select('*, profiles(*)')
        .eq('server_id', serverId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as unknown as (ServerStaff & { profiles: Profile })[]
    }
  })
}

export interface LiveServerStatus {
  online: boolean
  players?: {
    online: number
    max: number
  }
  version?: string
  motd?: {
    html: string[]
  }
}

export function useLiveServerStatus(server: Server | undefined | null) {
  return useQuery({
    queryKey: ['liveServerStatus', server?.id],
    enabled: !!server && server.type === 'server' && server.status === 'approved',
    queryFn: async () => {
      if (!server) return null

      // Prioritize Java IP
      const hasJavaIp = server.ip_or_code && server.ip_or_code !== 'None' && !server.ip_or_code.startsWith('http')
      const hasBedrockIp = !!server.bedrock_ip

      if (!hasJavaIp && !hasBedrockIp) return null

      try {
        let url = ''
        if (hasJavaIp) {
          const port = server.port && server.port !== 25565 ? `:${server.port}` : ''
          url = `https://api.mcsrvstat.us/3/${server.ip_or_code}${port}`
        } else if (hasBedrockIp) {
          const port = server.bedrock_port && server.bedrock_port !== 19132 ? `:${server.bedrock_port}` : ''
          url = `https://api.mcsrvstat.us/bedrock/3/${server.bedrock_ip}${port}`
        }

        if (!url) return null

        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch status')
        const data = await res.json()
        
        return data as LiveServerStatus
      } catch (err) {
        console.error('Failed to fetch live server status:', err)
        return null
      }
    },
    refetchInterval: 60000, // Refetch every minute
  })
}

export function useServerAppeals(status?: string) {
  return useQuery({
    queryKey: ['serverAppeals', status],
    queryFn: async () => {
      let query = supabase
        .from('server_appeals' as any)
        .select('*, server:servers(*), profile:profiles(*)')
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query
      if (error) throw error
      return data as unknown as ServerAppeal[]
    }
  })
}

export function useUserProjects(userId: string | undefined) {
  return useQuery({
    queryKey: ['userProjects', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects' as any)
        .select('*')
        .eq('owner_id', userId!)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as unknown as Project[]
    }
  })
}

export function useProject(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: ['project', idOrSlug],
    enabled: !!idOrSlug,
    queryFn: async () => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug!)
      let query = supabase.from('projects' as any).select('*')
      if (isUuid) {
        query = query.eq('id', idOrSlug!)
      } else {
        query = query.eq('slug', idOrSlug!)
      }

      const { data, error } = await query.maybeSingle()
      if (error) throw error
      if (!data) throw new Error('Project not found')
      
      const project = data as any
      
      // Fetch profile separately to avoid RLS join issues
      if (project.owner_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', project.owner_id)
          .single()
        
        if (profile) project.profiles = profile
      }

      return project as unknown as Project
    }
  })
}

export function useAdminProjects() {
  return useQuery({
    queryKey: ['adminProjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects' as any)
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as Project[]
    }
  })
}

export function useProjectSaves(projectId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['projectSaves', projectId, userId],
    enabled: !!projectId,
    queryFn: async () => {
      let query = supabase.from('project_saves' as any).select('id', { count: 'exact' }).eq('project_id', projectId)
      const { count: totalSaves } = await query
      
      let hasSaved = false
      if (userId) {
        const { data } = await supabase.from('project_saves' as any).select('id').eq('project_id', projectId).eq('user_id', userId).maybeSingle()
        hasSaved = !!data
      }
      
      return { totalSaves: totalSaves || 0, hasSaved }
    }
  })
}

export function useSavedProjects(userId: string | undefined) {
  return useQuery({
    queryKey: ['savedProjects', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_saves' as any)
        .select('project_id')
        .eq('user_id', userId!)
      
      if (error) throw error
      
      if (!data || data.length === 0) return []
      
      const projectIds = data.map((d: any) => d.project_id)
      
      const { data: projects, error: projectsError } = await supabase
        .from('projects' as any)
        .select('*')
        .in('id', projectIds)
      
      if (projectsError) throw projectsError
      return projects as unknown as Project[]
    }
  })
}

export function useServerSaves(serverId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['serverSaves', serverId, userId],
    enabled: !!serverId,
    queryFn: async () => {
      let query = supabase.from('server_saves' as any).select('id', { count: 'exact' }).eq('server_id', serverId)
      const { count: totalSaves } = await query
      
      let hasSaved = false
      if (userId) {
        const { data } = await supabase.from('server_saves' as any).select('id').eq('server_id', serverId).eq('user_id', userId).maybeSingle()
        hasSaved = !!data
      }
      
      return { totalSaves: totalSaves || 0, hasSaved }
    }
  })
}

export function useSavedServers(userId: string | undefined) {
  return useQuery({
    queryKey: ['savedServers', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('server_saves' as any)
        .select('server_id')
        .eq('user_id', userId!)
      
      if (error) throw error
      
      if (!data || data.length === 0) return []
      
      const serverIds = data.map((d: any) => d.server_id)
      
      const { data: servers, error: serversError } = await supabase
        .from('public_servers')
        .select('*, profiles(*)')
        .in('id', serverIds)
      
      if (serversError) throw serversError
      
      return servers as unknown as Server[]
    }
  })
}
