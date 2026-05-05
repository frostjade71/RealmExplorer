import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, userId } = await req.json()

    if (!code || !userId) {
      throw new Error('Voucher code and User ID are required')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Validate Voucher
    const { data: voucher, error: voucherError } = await supabaseClient
      .from('vouchers')
      .select('*')
      .eq('code', code)
      .single()

    if (voucherError || !voucher) {
      throw new Error('Invalid voucher code')
    }

    if (voucher.is_used) {
      throw new Error('This voucher has already been used')
    }

    if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
      throw new Error('This voucher has expired')
    }

    // 2. Calculate New Expiration
    const { data: currentProfile } = await supabaseClient
      .from('profiles')
      .select('subscription_expires_at, discord_username')
      .eq('id', userId)
      .single()

    let newExpiration = new Date()
    if (currentProfile?.subscription_expires_at) {
      const currentExp = new Date(currentProfile.subscription_expires_at)
      if (currentExp > new Date()) {
        newExpiration = currentExp
      }
    }
    
    // Add months based on voucher duration
    const monthsToAdd = voucher.duration_months || 1
    newExpiration.setMonth(newExpiration.getMonth() + monthsToAdd)

    // 3. Perform Updates (Transaction-like)
    
    // 3a. Update Voucher status
    const { error: updateVoucherError } = await supabaseClient
      .from('vouchers')
      .update({
        is_used: true,
        used_by: userId,
        used_at: new Date().toISOString()
      })
      .eq('id', voucher.id)

    if (updateVoucherError) throw updateVoucherError

    // 3b. Update Profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .update({ 
        role: 'explorer+',
        subscription_expires_at: newExpiration.toISOString()
      })
      .eq('id', userId)
      .select('discord_username, discord_id')
      .single()

    if (profileError) throw profileError

    // 3c. Restore Archived Servers
    const { error: restoreError } = await supabaseClient
      .from('servers')
      .update({ status: 'approved' })
      .eq('owner_id', userId)
      .eq('status', 'archived')
    
    if (restoreError) {
      console.error('Failed to restore archived servers:', restoreError)
    }

    // 3d. Record Audit Log
    await supabaseClient.from('audit_logs').insert({
      user_id: userId,
      discord_username: profile?.discord_username,
      action: 'redeem_voucher',
      target_id: voucher.id,
      details: {
        voucher_code: code,
        duration_months: monthsToAdd,
        new_expiration: newExpiration.toISOString()
      }
    })

    // 4. Send Notifications
    try {
      // In-App Notification
      await supabaseClient.from('notifications').insert({
        user_id: userId,
        type: 'welcome',
        title: 'Redeemed!',
        message: `You have successfully redeemed a subscription to explorer+ for ${monthsToAdd} month! Enjoy all premium benefits!`,
        related_id: 'upgrade'
      })

      // Discord DM (if available)
      if (profile?.discord_id) {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-discord-dm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            discord_id: profile.discord_id,
            subject: 'Voucher Redeemed - Welcome to Explorer+!',
            message: `You have successfully redeemed your ${monthsToAdd} month subscription for Explorer+, enjoy your benefits! You now have access to increased server limits, custom banners, priority shuffle, and more. Thank you for supporting Realm Explorer!`,
            type: 'welcome',
            admin_name: 'Realm Explorer Team'
          })
        })
      }

      // Discord Audit Log
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/discord-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          type: 'payment', // We can reuse payment type or create a new one, but payment fits the "upgrade" event
          payload: {
            username: profile?.discord_username || 'Unknown User',
            amount: 'Voucher',
            currency: code,
            orderId: 'VOUCHER-REDEEM'
          }
        })
      })
    } catch (err) {
      console.error('Failed to send notifications:', err)
    }

    return new Response(JSON.stringify({ success: true, message: 'Voucher redeemed successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
