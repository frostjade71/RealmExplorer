import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useBanAppeals() {
  return useQuery({
    queryKey: ['ban_appeals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discord_ban_appeals')
        .select('*, profiles:user_id(discord_avatar, discord_banner)')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })
}

export function useSubmitBanAppeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { 
      discord_username: string, 
      discord_id: string, 
      appeal_reason: string,
      user_id?: string | null
    }) => {
      const { data, error } = await supabase
        .from('discord_ban_appeals')
        .insert([params])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ban_appeals'] })
    }
  })
}

export function useUpdateBanAppeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { id: string, status: string }) => {
      const { data, error } = await supabase
        .from('discord_ban_appeals')
        .update({ status: params.status })
        .eq('id', params.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ban_appeals'] })
    }
  })
}
