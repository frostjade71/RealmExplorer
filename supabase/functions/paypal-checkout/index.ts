import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')
const PAYPAL_SECRET = Deno.env.get('PAYPAL_SECRET')
const PAYPAL_MODE = Deno.env.get('PAYPAL_MODE') || 'sandbox'
const PAYPAL_API = PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, userId, serverId } = await req.json()

    if (!orderId || !userId) {
      throw new Error('Order ID and User ID are required')
    }

    // 1. Get Access Token
    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`)
    const tokenResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    const { access_token } = await tokenResponse.json()

    // 2. Capture the Order
    const captureResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    })

    const captureData = await captureResponse.json()
    console.log('Capture Data:', JSON.stringify(captureData, null, 2))

    if (captureData.status !== 'COMPLETED') {
      const errorMessage = captureData.message || captureData.name || 'Unknown error'
      const details = captureData.details ? JSON.stringify(captureData.details) : ''
      throw new Error(`Capture failed: ${errorMessage} ${details}`)
    }

    // 3. Update Database (Supabase)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let newExpiration = new Date()
    let serverName = ''

    if (serverId) {
      // SERVER SPONSORING FLOW
      const { data: server, error: serverFetchError } = await supabaseClient
        .from('servers')
        .select('id, name, owner_id, sponsored_until')
        .eq('id', serverId)
        .single()

      if (serverFetchError || !server) {
        throw new Error('Server not found')
      }
      if (server.owner_id !== userId) {
        throw new Error('Unauthorized: You do not own this server')
      }

      serverName = server.name
      if (server.sponsored_until) {
        const currentExp = new Date(server.sponsored_until)
        if (currentExp > new Date()) {
          newExpiration = new Date(currentExp)
        }
      }
      newExpiration.setDate(newExpiration.getDate() + 30)

      const { error: serverUpdateError } = await supabaseClient
        .from('servers')
        .update({
          is_sponsored: true,
          sponsored_until: newExpiration.toISOString()
        })
        .eq('id', serverId)

      if (serverUpdateError) throw serverUpdateError
    } else {
      // STANDARD PROFILE EXPLORER+ FLOW
      const { data: currentProfile } = await supabaseClient
        .from('profiles')
        .select('subscription_expires_at, discord_username, discord_id')
        .eq('id', userId)
        .single()

      if (currentProfile?.subscription_expires_at) {
        const currentExp = new Date(currentProfile.subscription_expires_at)
        if (currentExp > new Date()) {
          newExpiration = new Date(currentExp)
        }
      }
      newExpiration.setMonth(newExpiration.getMonth() + 1)

      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({ 
          role: 'explorer+',
          subscription_expires_at: newExpiration.toISOString()
        })
        .eq('id', userId)

      if (profileError) throw profileError

      // RESTORE ARCHIVED SERVERS
      const { error: restoreError } = await supabaseClient
        .from('servers')
        .update({ status: 'approved' })
        .eq('owner_id', userId)
        .eq('status', 'archived')
      
      if (restoreError) console.error('Failed to restore archived servers:', restoreError)
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('discord_username, discord_id')
      .eq('id', userId)
      .single()

    // Insert Payment Record
    const amountValue = captureData.purchase_units[0].payments.captures[0].amount.value
    const currencyCode = captureData.purchase_units[0].payments.captures[0].amount.currency_code

    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: userId,
        amount: amountValue,
        currency: currencyCode,
        status: 'completed',
        paypal_order_id: orderId,
        paypal_payer_id: captureData.payer.payer_id,
      })

    if (paymentError) throw paymentError

    // Record Audit Log
    await supabaseClient.from('audit_logs').insert({
      user_id: userId,
      discord_username: profile?.discord_username,
      action: serverId ? 'server_sponsor_success' : 'payment_success',
      target_id: serverId ? serverId : orderId,
      details: {
        server_id: serverId || undefined,
        server_name: serverName || undefined,
        amount: amountValue,
        currency: currencyCode,
        method: 'paypal',
        new_expiration: newExpiration.toISOString()
      }
    })

    // 4. Send Notifications
    try {
      if (serverId) {
        // 4a. In-App Web Notification for Server Sponsor
        await supabaseClient.from('notifications').insert({
          user_id: userId,
          type: 'welcome',
          title: 'Server Sponsored Successfully!',
          message: `Your server "${serverName}" is now sponsored and will be featured on the directory page. Thank you for your support!`,
          related_id: serverId
        })

        // 4b. Discord DM
        if (profile?.discord_id) {
          await supabaseClient.functions.invoke('send-discord-dm', {
            headers: {
              'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            },
            body: {
              discord_id: profile.discord_id,
              subject: 'Server Sponsoring Active!',
              message: `Your server **${serverName}** is now successfully sponsored on Realm Explorer for 30 days! Thank you for supporting the platform.`,
              type: 'standard',
              admin_name: 'Realm Explorer Team',
              icon_url: 'https://bwruljrnltvoojvzgiqm.supabase.co/storage/v1/object/public/main_bucket/Logo-Color-Change-removebg-preview.png'
            }
          })
        }
      } else {
        // 4a. In-App Web Notification for Explorer+
        await supabaseClient.from('notifications').insert({
          user_id: userId,
          type: 'welcome',
          title: 'Welcome to the Explorer+ Family!',
          message: "You've unlocked exclusive banners, increased limits, and more. Your journey just got legendary!",
          related_id: 'upgrade'
        })

        // 4b. Discord DM
        if (profile?.discord_id) {
          await supabaseClient.functions.invoke('send-discord-dm', {
            headers: {
              'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            },
            body: {
              discord_id: profile.discord_id,
              subject: 'Welcome to Explorer+!',
              message: '',
              type: 'welcome',
              admin_name: 'Realm Explorer Team',
              icon_url: 'https://bwruljrnltvoojvzgiqm.supabase.co/storage/v1/object/public/main_bucket/Logo-Color-Change-removebg-preview.png'
            }
          })
        }
      }

      // 4c. Discord Audit Log Notification
      console.log('Invoking discord-notification...')
      await supabaseClient.functions.invoke('discord-notification', {
        headers: {
          'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        },
        body: {
          type: 'payment',
          payload: {
            username: serverId 
              ? `${profile?.discord_username || 'Unknown User'} (Sponsored Server: ${serverName})`
              : (profile?.discord_username || 'Unknown User'),
            amount: amountValue,
            currency: currencyCode,
            orderId: orderId,
            purchaseType: serverId ? 'sponsorship' : 'explorer+'
          }
        }
      })
    } catch (err) {
      console.error('Failed to send welcome notifications:', err)
    }

    return new Response(JSON.stringify({ success: true, data: captureData }), {
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
