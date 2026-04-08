import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { 
  Server, 
  ServerCategory, 
  ServerType, 
  Profile, 
  ServerRating, 
  OTMWinner, 
  OTMCompetitor,
  Notification
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
      } else {
        query = query.order('created_at', { ascending: false })
      }

      if (params?.limit) query = query.limit(params.limit)

      const { data, error } = await query
      if (error) throw error
      return data as Server[]
    }
  })
}

export function useServer(id: string | undefined) {
  return useQuery({
    queryKey: ['server', id],
    enabled: !!id,
    queryFn: async () => {
      const { data: server, error } = await supabase
        .from('servers')
        .select('*')
        .eq('id', id!)
        .single()
      if (error) throw error
      
      let ownerInfo: Profile | null = null
      if (server.owner_id) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', server.owner_id).single()
        if (profile) ownerInfo = profile as Profile
      }

      return { server: server as Server, owner: ownerInfo }
    }
  })
}

export function useUserServers(userId: string | undefined) {
  return useQuery({
    queryKey: ['userServers', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .eq('owner_id', userId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Server[]
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
      return data as Server[]
    }
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data as Profile[]
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
      
      if (!data) return { hasVoted: false, lastVoteTime: null, expiresAt: null }
      
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
      return data as (ServerRating & { profiles: Profile })[]
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
        .select('*, servers(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as OTMWinner[]
    }
  })
}

export function useOTMCompetitors() {
  return useQuery({
    queryKey: ['otmCompetitors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('otm_competitors')
        .select('*, servers(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as OTMCompetitor[]
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
