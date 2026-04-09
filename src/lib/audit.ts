import { supabase } from './supabase'

export async function logAction(
  action: string, 
  details: any = {}, 
  userId?: string | null, 
  username?: string | null, 
  targetId?: string | null
) {
  try {
    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId,
      discord_username: username,
      action,
      target_id: targetId,
      details
    })
    if (error) throw error
  } catch (error) {
    console.error('Failed to log action:', error)
  }
}
