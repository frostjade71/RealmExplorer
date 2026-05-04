import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const DISCORD_BOT_TOKEN = Deno.env.get('DISCORD_BOT_TOKEN');
const DISCORD_API = 'https://discord.com/api/v10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DMRequest {
  discord_id: string;
  subject: string;
  message: string;
  type: 'contact' | 'rejection' | 'welcome';
  server_name?: string;
  server_slug?: string;
  admin_name?: string;
  icon_url?: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!DISCORD_BOT_TOKEN) {
    console.error('CRITICAL: DISCORD_BOT_TOKEN is not set in secrets');
    return new Response(
      JSON.stringify({ error: 'Bot token not configured', dm_sent: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: DMRequest = await req.json();
    const { discord_id, subject, message, type, server_name, server_slug, admin_name, icon_url } = body;

    console.log(`Attempting DM to discord_id: ${discord_id} ${server_name ? `for server: ${server_name}` : ''}`);

    if (!discord_id) {
      console.error('No discord_id provided');
      return new Response(
        JSON.stringify({ error: 'No discord_id provided', dm_sent: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Open a DM channel with the user
    console.log('Opening DM channel...');
    const channelRes = await fetch(`${DISCORD_API}/users/@me/channels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient_id: discord_id }),
    });

    const channelBody = await channelRes.text();
    if (!channelRes.ok) {
      return new Response(
        JSON.stringify({ 
          error: `Cannot open DM channel (${channelRes.status})`, 
          dm_sent: false,
          discord_error: channelBody
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const channel = JSON.parse(channelBody);

    // Step 2: Build the embed
    const isRejection = type === 'rejection';
    const isWelcome = type === 'welcome';
    const serverUrl = server_slug ? `https://www.realmexplorer.xyz/server/${server_slug}` : 'https://www.realmexplorer.xyz';

    const embed: any = {
      title: isRejection 
        ? '❌ Server Listing Update' 
        : isWelcome 
          ? '✨ WELCOME TO THE EXPLORER+ FAMILY! ✨' 
          : '📧 Staff Message — Realm Explorer',
      description: isRejection
        ? `Your server **${server_name}** requires attention from our team.`
        : isWelcome
          ? `# Welcome to Explorer+! \nWe are thrilled to have you as part of our **Explorer+ Family**. Your support helps us keep Realm Explorer growing and thriving!\n\n## 🚀 Your Premium Perks are Active:\n- **Submit up to 5 Servers/Realms**: Expand your reach across the entire community.\n- **Custom Profile Banner**: Personalize your identity with a unique background.\n- **Extended Gallery**: Show off your worlds with up to 5 images per listing.\n- **Priority Exploration**: Your listings now have a higher chance to appear at the top!\n- **Golden Profile**: Stand out with premium golden borders on your profile and listings.\n- **Social Links**: Connect deeper with up to 6 social links.\n\n> **Need Help?**\n> If you have any questions or need help setting up your new features, feel free to reach out to our staff in the Discord server.`
          : `A staff member has reached out regarding your server **${server_name}**.`,
      color: isRejection ? 0xe74c3c : isWelcome ? 0xf1c40f : 0x4EC44E,
      fields: [
        { name: 'Subject', value: subject, inline: false },
      ],
      timestamp: new Date().toISOString(),
    };

    // Only add message as field if it's NOT a welcome message (welcome uses description for big text)
    if (!isWelcome) {
      embed.fields.push({ name: 'Message', value: message, inline: false });
    }

    if (admin_name || isWelcome) {
      embed.fields.push({ 
        name: 'From', 
        value: admin_name || (isWelcome ? 'Realm Explorer Team' : 'Realm Explorer Staff'), 
        inline: true 
      });
    }

    if (server_slug) {
      embed.fields.push({ name: 'Server Page', value: `[View Listing](${serverUrl})`, inline: true });
    } else if (isWelcome) {
      embed.fields.push({ name: 'Your Profile', value: `[View Profile](https://www.realmexplorer.xyz/dashboard)`, inline: true });
    }

    if (icon_url) {
      embed.thumbnail = { url: icon_url };
    }

    if (isRejection) {
      embed.footer = { text: 'Your listing has been temporarily removed. Please address the issue and resubmit.' };
    } else if (isWelcome) {
      embed.footer = { text: 'Thank you for supporting Realm Explorer! You now have access to all premium features.' };
    } else {
      embed.footer = { text: 'Please review and take action if needed. Visit realmexplorer.xyz for details.' };
    }

    // Step 3: Send the DM
    console.log(`Sending DM to channel ${channel.id}...`);
    const msgRes = await fetch(`${DISCORD_API}/channels/${channel.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ embeds: [embed] }),
    });

    const msgBody = await msgRes.text();
    if (!msgRes.ok) {
      return new Response(
        JSON.stringify({ 
          error: `Failed to send DM (${msgRes.status})`, 
          dm_sent: false,
          discord_error: msgBody
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, dm_sent: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: String(error), dm_sent: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
