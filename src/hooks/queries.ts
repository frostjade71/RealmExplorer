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
  Report
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
        query = query.order('average_rating', { ascending: false })
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

export function useOTMCompetitors() {
  return useQuery({
    queryKey: ['otmCompetitors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('otm_competitors')
        .select('*, servers(*), profiles(*), otm_votes(count)')
        .order('created_at', { ascending: false })
      if (error) throw error
      
      // Map the nested count object to a total_votes property
      return (data as any[]).map(c => ({
        ...c,
        total_votes: c.otm_votes?.[0]?.count || 0
      })) as unknown as OTMCompetitor[]
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
        .select('competitor_id')
        .eq('user_id', userId!)
      
      if (error) throw error
      return (data || []).map((v: any) => v.competitor_id) as string[]
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
