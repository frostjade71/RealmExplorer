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
    const { orderId, userId } = await req.json()

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

    // Calculate Expiration: 1 month from now, or 1 month from current expiration if still active
    const { data: currentProfile } = await supabaseClient
      .from('profiles')
      .select('subscription_expires_at, discord_username, discord_id')
      .eq('id', userId)
      .single()

    let newExpiration = new Date()
    if (currentProfile?.subscription_expires_at) {
      const currentExp = new Date(currentProfile.subscription_expires_at)
      if (currentExp > new Date()) {
        newExpiration = new Date(currentExp)
      }
    }
    newExpiration.setMonth(newExpiration.getMonth() + 1)

    // Update Profile Role & Expiration
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

    // RESTORE ARCHIVED SERVERS
    const { error: restoreError } = await supabaseClient
      .from('servers')
      .update({ status: 'approved' })
      .eq('owner_id', userId)
      .eq('status', 'archived')
    
    if (restoreError) console.error('Failed to restore archived servers:', restoreError)

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

    // Record Audit Log (New: Consistent with vouchers)
    await supabaseClient.from('audit_logs').insert({
      user_id: userId,
      discord_username: profile?.discord_username,
      action: 'payment_success',
      target_id: orderId,
      details: {
        amount: amountValue,
        currency: currencyCode,
        method: 'paypal',
        new_expiration: newExpiration.toISOString()
      }
    })

    // 4. Send Notifications
    try {
      // 4a. In-App Web Notification
      await supabaseClient.from('notifications').insert({
        user_id: userId,
        type: 'welcome',
        title: 'Welcome to the Explorer+ Family!',
        message: "You've unlocked exclusive banners, increased limits, and more. Your journey just got legendary!",
        related_id: 'upgrade'
      })

      // 4b. Discord DM (Internal Function Call)
      if (profile?.discord_id) {
        console.log(`Invoking send-discord-dm for ${profile.discord_id}...`)
        await supabaseClient.functions.invoke('send-discord-dm', {
          headers: {
            'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          },
          body: {
            discord_id: profile.discord_id,
            subject: 'Welcome to Explorer+!',
            message: '', // The message body is handled by the 'welcome' type template
            type: 'welcome',
            admin_name: 'Realm Explorer Team',
            icon_url: 'https://bwruljrnltvoojvzgiqm.supabase.co/storage/v1/object/public/main_bucket/Logo-Color-Change-removebg-preview.png'
          }
        })
      }

      // 4c. Discord Audit Log Notification (Internal Function Call)
      console.log('Invoking discord-notification...')
      await supabaseClient.functions.invoke('discord-notification', {
        headers: {
          'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        },
        body: {
          type: 'payment',
          payload: {
            username: profile?.discord_username || 'Unknown User',
            amount: amountValue,
            currency: currencyCode,
            orderId: orderId
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
