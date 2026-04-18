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
  OTMConfig
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
      let query = supabase.from('servers').select('*').eq('status', 'approved')

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

export function useServer(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: ['server', idOrSlug],
    enabled: !!idOrSlug,
    queryFn: async () => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug!)
      
      let query = supabase.from('servers').select('*')
      
      if (isUuid) {
        query = query.eq('id', idOrSlug!)
      } else {
        query = query.eq('slug', idOrSlug!)
      }

      const { data: server, error } = await query.single()
      if (error) throw error
      
      let ownerInfo: Profile | null = null
      if (server) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', server.owner_id as string).single()
        if (profile) ownerInfo = profile as unknown as Profile
      }

      return { server: server as unknown as Server, owner: ownerInfo }
    }
  })
}

export function useUserServers(userId: string | undefined, status?: ServerStatus) {
  return useQuery({
    queryKey: ['userServers', userId, status],
    enabled: !!userId,
    queryFn: async () => {
      let query = supabase
        .from('servers')
        .select('*')
        .eq('owner_id', userId!)
        .order('created_at', { ascending: false })
      
      if (status) {
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
      const { count: serverCount } = await supabase.from('servers').select('*', { count: 'exact', head: true }).eq('status', 'approved')
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

export function useServerMessages(serverId: string | undefined) {
  return useQuery({
    queryKey: ['serverMessages', serverId],
    enabled: !!serverId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('server_messages')
        .select('*, profiles(*)')
        .eq('server_id', serverId!)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
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
          .from('servers')
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
        const { data, error } = await supabase
          .from('profiles')
          .select('*, otm_votes(count)')
          .not('discord_username', 'is', null)
          .order('created_at', { ascending: false })
        
        if (error) throw error

        return (data as any[]).map(p => ({
          id: p.id,
          category,
          server_id: null,
          user_id: p.id,
          total_votes: p.otm_votes?.[0]?.count || 0,
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
        .select('server_id, target_user_id, created_at')
        .eq('user_id', userId!)
      
      if (error) throw error
      return (data || []).map((v: any) => ({
        id: v.server_id || v.target_user_id,
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
      // 1. Get total likes count
      const { count, error: countError } = await supabase
        .from('blog_post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId!)

      if (countError) throw countError

      // 2. Check if current user has liked
      let hasLiked = false
      if (userId) {
        const { data, error: likeError } = await supabase
          .from('blog_post_likes')
          .select('id')
          .eq('post_id', postId!)
          .eq('user_id', userId)
          .maybeSingle()
        
        if (likeError) throw likeError
        hasLiked = !!data
      }

      return { count: count || 0, hasLiked }
    }
  })
}
