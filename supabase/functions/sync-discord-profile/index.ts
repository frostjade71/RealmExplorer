import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DISCORD_BOT_TOKEN = Deno.env.get('DISCORD_BOT_TOKEN')
const DISCORD_API = 'https://discord.com/api/v10'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let body: any = {}
    try {
      body = await req.json()
    } catch {
      body = {}
    }

    let userId = body.user_id
    let discordId = body.discord_id
    const providerToken = body.provider_token

    if (!userId) {
      const authHeader = req.headers.get('Authorization')
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
        if (!userError && user) {
          userId = user.id
        }
      }
    }

    if (!userId && !discordId) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id or discord_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If discordId not provided, fetch from profiles
    let currentProfile: any = null
    if (userId) {
      const { data: prof } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      currentProfile = prof
      if (!discordId && prof?.discord_id) {
        discordId = prof.discord_id
      }
    } else if (discordId) {
      const { data: prof } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('discord_id', discordId)
        .single()
      currentProfile = prof
      if (prof?.id) {
        userId = prof.id
      }
    }

    let discordUser: any = null

    if (providerToken) {
      try {
        const res = await fetch(`${DISCORD_API}/users/@me`, {
          headers: { Authorization: `Bearer ${providerToken}` }
        })
        if (res.ok) {
          discordUser = await res.json()
        }
      } catch (err) {
        console.warn('Failed to fetch via provider_token:', err)
      }
    }

    if (!discordUser && discordId && DISCORD_BOT_TOKEN) {
      try {
        const res = await fetch(`${DISCORD_API}/users/${discordId}`, {
          headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
        })
        if (res.ok) {
          discordUser = await res.json()
        } else {
          console.error(`Discord API /users/${discordId} error status: ${res.status}`)
        }
      } catch (err) {
        console.error('Failed to fetch via Bot token:', err)
      }
    }

    if (!discordUser) {
      return new Response(
        JSON.stringify({ error: 'Could not fetch Discord user details' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let decorationUrl: string | null = null
    if (discordUser.avatar_decoration_data?.asset) {
      decorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${discordUser.avatar_decoration_data.asset}.png?size=240&passthrough=true`
    }

    let avatarUrl: string | null = null
    if (discordUser.avatar) {
      const isAnimated = discordUser.avatar.startsWith('a_')
      avatarUrl = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${isAnimated ? 'gif' : 'png'}?size=256`
    }

    let bannerUrl: string | null = null
    if (discordUser.banner) {
      const isAnimated = discordUser.banner.startsWith('a_')
      bannerUrl = `https://cdn.discordapp.com/banners/${discordUser.id}/${discordUser.banner}.${isAnimated ? 'gif' : 'png'}?size=1024`
    }

    const updates: Record<string, any> = {
      discord_avatar_decoration: decorationUrl,
      updated_at: new Date().toISOString()
    }
    if (avatarUrl) updates.discord_avatar = avatarUrl
    if (discordUser.id) updates.discord_id = discordUser.id
    if (bannerUrl && (!currentProfile?.discord_banner || !currentProfile.discord_banner.startsWith('http') || currentProfile.discord_banner.includes('cdn.discordapp.com/banners/'))) {
      updates.discord_banner = bannerUrl
    }

    if (userId) {
      const { data: updatedProfile, error: updateError } = await supabaseClient
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (updateError) {
        console.error('Failed to update profile:', updateError)
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, profile: updatedProfile, decoration: decorationUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, decoration: decorationUrl, discordUser }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('Error in sync-discord-profile:', err)
    return new Response(
      JSON.stringify({ error: err.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

