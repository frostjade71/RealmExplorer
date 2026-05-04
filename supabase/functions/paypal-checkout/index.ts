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
      .select('subscription_expires_at')
      .eq('id', userId)
      .single()

    let newExpiration = new Date()
    if (currentProfile?.subscription_expires_at) {
      const currentExp = new Date(currentProfile.subscription_expires_at)
      if (currentExp > new Date()) {
        newExpiration = currentExp
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
      .select('discord_username')
      .single()

    if (profileError) throw profileError

    // RESTORE ARCHIVED SERVERS: If the user had servers archived during cancellation, re-approve them
    const { error: restoreError } = await supabaseClient
      .from('servers')
      .update({ status: 'approved' })
      .eq('owner_id', userId)
      .eq('status', 'archived')
    
    if (restoreError) {
      console.error('Failed to restore archived servers:', restoreError)
      // We don't fail the whole payment if this fails, but it's good to log
    }

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

    // 4. Send "Welcome to Explorer+" Notifications (In-app + DM)
    try {
      // 4a. Get Discord ID for DM
      const { data: userData } = await supabaseClient
        .from('profiles')
        .select('discord_id, discord_username')
        .eq('id', userId)
        .single()

      // 4b. Insert In-App Web Notification
      await supabaseClient.from('notifications').insert({
        user_id: userId,
        type: 'welcome',
        title: 'Welcome to the Explorer+ Family!',
        message: "You've unlocked exclusive banners, increased limits, and more. Your journey just got legendary!",
        related_id: null
      })

      // 4c. Send Discord DM
      if (userData?.discord_id) {
        const welcomeMessage = `Hello! We are thrilled to have you as part of our Explorer+ family. Your support means the world to us and helps us keep Realm Explorer growing.

As an Explorer+, you now have access to these exclusive perks:
- **Submit up to 5 servers**: Expand your reach across the community.
- **Custom Profile Banner**: Personalize your profile with a custom look.
- **Extended Gallery**: Show off your servers with up to 5 images per listing.
- **Priority Shuffle**: Get your listings seen more often.
- **Golden Profile**: Stand out with a premium look on your profile and servers.
- **Socials Links**: Add more links to connect with your community.
- **Faster Shuffle**: Shuffle cooldown reduced to 2 seconds.

If you have any questions or need help setting up your new features, feel free to reach out to our staff in the Discord server.

Thank you for being a part of Realm Explorer!
— The Realm Explorer Team`

        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-discord-dm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            discord_id: userData.discord_id,
            subject: 'Welcome to Explorer+!',
            message: '', // The message body is now handled by the 'welcome' type template in the function
            type: 'welcome',
            admin_name: 'Realm Explorer Team',
            icon_url: 'https://bwruljrnltvoojvzgiqm.supabase.co/storage/v1/object/public/main_bucket/Logo-Color-Change-removebg-preview.png'
          })
        })
      }
    } catch (err) {
      console.error('Failed to send welcome notifications:', err)
      // Non-blocking
    }

    // 5. Send Discord Audit Log Notification (Fire and Forget)
    try {
      console.log(`Sending Discord notification for user: ${profile?.discord_username || 'Unknown'}`)
      
      const notifyResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/discord-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          type: 'payment',
          payload: {
            username: profile?.discord_username || 'Unknown User',
            amount: amountValue,
            currency: currencyCode,
            orderId: orderId
          }
        })
      })

      if (!notifyResponse.ok) {
        const errorText = await notifyResponse.text()
        console.error(`Discord notification failed with status ${notifyResponse.status}: ${errorText}`)
      } else {
        console.log('Discord notification sent successfully')
      }
    } catch (err) {
      console.error('Discord Notification Error:', err)
      // Don't fail the whole request if notification fails
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
