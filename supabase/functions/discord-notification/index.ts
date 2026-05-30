import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET, HEAD',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, payload } = await req.json();

    const WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL');
    const STAFF_WEBHOOK_URL = Deno.env.get('DISCORD_STAFF_WEBHOOK_URL');
    const LOGS_WEBHOOK_URL = Deno.env.get('DISCORD_LOGS_WEBHOOK_URL');

    const STAFF_ROLE_ID = Deno.env.get('DISCORD_STAFF_ROLE_ID');
    const MEMBER_ROLE_ID = Deno.env.get('DISCORD_MEMBER_ROLE_ID');
    const DISCORD_BOT_TOKEN = Deno.env.get('DISCORD_BOT_TOKEN');
    const PUBLIC_CHANNEL_ID = Deno.env.get('DISCORD_PUBLIC_CHANNEL_ID');

    let discordPayload: any = null;
    let targetEndpoint: string | undefined;
    let useBotApi = false;

    if (type === 'approval') {
      const { serverName, adminName, slug, iconUrl, approvalType = 'new_listing', target = 'public', previousStatus } = payload;
      
      // Determine if we should use Bot API or Webhook
      if (target === 'public' && DISCORD_BOT_TOKEN && PUBLIC_CHANNEL_ID) {
        useBotApi = true;
        targetEndpoint = `https://discord.com/api/v10/channels/${PUBLIC_CHANNEL_ID}/messages`;
      } else {
        targetEndpoint = target === 'public' ? WEBHOOK_URL : LOGS_WEBHOOK_URL;
      }
      
      const serverUrl = `https://www.realmexplorer.xyz/server/${slug}`;
      const title = approvalType === 'new_listing' ? '<:icon:1296934822362742937> New Server Published!' : 'Visual Assets Approved';
      let description = approvalType === 'new_listing'
        ? `**${serverName}** has been approved and been Listed !`
        : `**${serverName}**'s new visual assets have been reviewed and approved.`;

      if (target === 'logs' && previousStatus) {
        description += `\n\n**${serverName}** status changed to **active** (previously: \`${previousStatus}\`).`;
      }

      discordPayload = {
        username: target === 'public' ? 'Realm Explorer | Find & Promote Website' : 'Realm Explorer | Web Logs',
        content: (target === 'public' && approvalType === 'new_listing' && MEMBER_ROLE_ID) ? `<@&${MEMBER_ROLE_ID}>` : undefined,
        embeds: [{
          title: title,
          description: description,
          url: serverUrl,
          color: 0x00ff00, // Realm Green
          thumbnail: iconUrl ? { url: iconUrl } : undefined,
          fields: [
            { name: '<:icon:1429212335830077642> Moderator', value: adminName || 'Unknown', inline: true }
          ],
          footer: { text: target === 'public' ? 'Web Notification' : 'Internal Audit Log' },
          timestamp: new Date().toISOString()
        }],
        components: useBotApi ? [{
          type: 1,
          components: [{
            type: 2,
            style: 5, // Link Style
            label: "View Listing",
            url: serverUrl
          }]
        }] : undefined
      };
    } else if (type === 'staff_review') {
      const { serverName, status = 'pending', iconUrl } = payload;
      targetEndpoint = STAFF_WEBHOOK_URL;
      const adminPanelUrl = 'https://www.realmexplorer.xyz/admin/servers';

      let alertMessage = `**${serverName}** needs reviewing !`;
      let alertTitle = '📑 New Server Submission';

      if (status === 'Review Icon') {
        alertTitle = '🖼️ New Icon Review';
        alertMessage = `**${serverName}** has updated their icon and needs reviewing !`;
      } else if (status === 'Review Cover') {
        alertTitle = '🎨 New Cover Review';
        alertMessage = `**${serverName}** has updated their cover and needs reviewing !`;
      } else if (status === 'Review Icon & Cover') {
        alertTitle = '✨ New Assets Review';
        alertMessage = `**${serverName}** has updated their assets (icon & cover) and needs reviewing !`;
      } else if (status === 'Review Gallery') {
        alertTitle = '📸 New Gallery Review';
        alertMessage = `**${serverName}** has updated their gallery and needs reviewing !`;
      } else if (status === 'Review Icon & Gallery') {
        alertTitle = '🖼️ New Assets Review';
        alertMessage = `**${serverName}** has updated their icon and gallery and needs reviewing !`;
      } else if (status === 'Review Cover & Gallery') {
        alertTitle = '🎨 New Assets Review';
        alertMessage = `**${serverName}** has updated their cover and gallery and needs reviewing !`;
      } else if (status === 'Review All Assets') {
        alertTitle = '✨ Complete Assets Review';
        alertMessage = `**${serverName}** has updated all visual assets (icon, cover, & gallery) and needs reviewing !`;
      }

      discordPayload = {
        username: 'Realm Explorer | Staff Alert',
        content: STAFF_ROLE_ID ? `<@&${STAFF_ROLE_ID}>` : undefined,
        embeds: [{
          title: alertTitle,
          description: alertMessage,
          color: 0xffa500, // Orange
          thumbnail: iconUrl ? { url: iconUrl } : undefined,
          fields: [{
            name: 'Action Required',
            value: `Please visit the [Admin Dashboard](${adminPanelUrl}) to review and approve this update.`,
          }],
          footer: { text: 'Staff Notification System' },
          timestamp: new Date().toISOString()
        }]
      };
    } else if (type === 'payment') {
      const { username, amount, currency, orderId, purchaseType } = payload;
      targetEndpoint = LOGS_WEBHOOK_URL;
      
      const isSponsorship = purchaseType === 'sponsorship' || (username && username.includes('Sponsored Server:'));
      const embedTitle = isSponsorship ? '💎 New Server Sponsorship!' : '💰 New Explorer+ Upgrade!';
      const embedDesc = isSponsorship 
        ? `**${username}** has just sponsored their server!` 
        : `**${username}** has just purchased **Explorer+**!`;
      const embedColor = isSponsorship ? 0x00ffff : 0xf1c40f; // Cyan for sponsorship, Gold for Explorer+ cuz why not

      discordPayload = {
        username: 'Realm Explorer | Payments',
        embeds: [{
          title: embedTitle,
          description: embedDesc,
          color: embedColor,
          fields: [
            { 
              name: 'Amount', 
              value: amount === 'Voucher' ? `**Voucher**` : `$${amount} ${currency}`, 
              inline: true 
            },
            { 
              name: amount === 'Voucher' ? 'Voucher Code' : 'Order ID', 
              value: `\`${orderId === 'VOUCHER-REDEEM' ? currency : orderId}\``, 
              inline: true 
            }
          ],
          footer: { text: 'Internal Audit Log' },
          timestamp: new Date().toISOString()
        }]
      };
    } else if (type === 'log') {
      const { action, adminName, details, color = 0x34495e } = payload;
      targetEndpoint = LOGS_WEBHOOK_URL;
      
      discordPayload = {
        username: 'Realm Explorer | Web Logs',
        embeds: [{
          title: action || 'Log',
          description: details || 'No details provided',
          color: color,
          fields: adminName ? [{ 
            name: (action?.includes('Subscription Cancelled') || action?.includes('📉')) ? 'User' : 'Moderator', 
            value: adminName, 
            inline: true 
          }] : [],
          footer: { text: 'Internal Audit Log' },
          timestamp: new Date().toISOString()
        }]
      };
    } else if (type === 'error') {
      const { error, context, userEmail } = payload;
      targetEndpoint = LOGS_WEBHOOK_URL;
      
      const errorMessage = typeof error === 'string' ? error : JSON.stringify(error);

      discordPayload = {
        username: 'Realm Explorer | Severe Error',
        embeds: [{
          title: '🔴 Critical System Error',
          description: `**Context:** ${context || 'Unknown'}\n**Error:** \`${errorMessage}\``,
          color: 0xff0000, // Red
          fields: userEmail ? [{ name: 'User Impacted', value: userEmail, inline: true }] : [],
          footer: { text: 'Error Monitoring System' },
          timestamp: new Date().toISOString()
        }]
      };
    } else {
      return new Response(JSON.stringify({ error: 'Invalid notification type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!targetEndpoint) {
      console.warn(`Target endpoint for type ${type} is not configured.`);
      return new Response(JSON.stringify({ message: 'Endpoint not configured' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (useBotApi && DISCORD_BOT_TOKEN) {
      headers['Authorization'] = `Bot ${DISCORD_BOT_TOKEN}`;
      
      // Bot API (/messages) doesn't allow 'username' or 'avatar_url' in the root payload
      if (discordPayload.username) delete discordPayload.username;
      if (discordPayload.avatar_url) delete discordPayload.avatar_url;
    }

    const response = await fetch(targetEndpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Discord API Error (${targetEndpoint}):`, errorBody);
      throw new Error(`Discord request failed with status ${response.status}: ${errorBody}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in discord-notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
