import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    let discordPayload: any = null;
    let targetWebhook: string | undefined;

    if (type === 'approval') {
      const { serverName, adminName, slug, iconUrl, approvalType = 'new_listing', target = 'public', previousStatus } = payload;
      targetWebhook = target === 'public' ? WEBHOOK_URL : LOGS_WEBHOOK_URL;
      
      const serverUrl = `https://www.realmexplorer.xyz/server/${slug}`;
      const title = approvalType === 'new_listing' ? 'New Server Published!' : 'Visual Assets Approved';
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
            { name: 'Moderator', value: adminName || 'Unknown', inline: true },
            { name: 'Listing URL', value: `[View Server](${serverUrl})`, inline: true }
          ],
          footer: { text: target === 'public' ? 'Web Notification' : 'Internal Audit Log' },
          timestamp: new Date().toISOString()
        }]
      };
    } else if (type === 'staff_review') {
      const { serverName, status = 'pending', iconUrl } = payload;
      targetWebhook = STAFF_WEBHOOK_URL;
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
      const { username, amount, currency, orderId } = payload;
      targetWebhook = LOGS_WEBHOOK_URL;
      
      discordPayload = {
        username: 'Realm Explorer | Payments',
        embeds: [{
          title: '💰 New Explorer+ Upgrade!',
          description: `**${username}** has just purchased **Explorer+**!`,
          color: 0xf1c40f, // Gold
          fields: [
            { name: 'Amount', value: `$${amount} ${currency}`, inline: true },
            { name: 'Order ID', value: `\`${orderId}\``, inline: true }
          ],
          footer: { text: 'Subscription System' },
          timestamp: new Date().toISOString()
        }]
      };
    } else if (type === 'log') {
      const { action, adminName, details, color = 0x34495e } = payload;
      targetWebhook = LOGS_WEBHOOK_URL;
      
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
      targetWebhook = LOGS_WEBHOOK_URL;
      
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

    if (!targetWebhook) {
      console.warn(`Target webhook for type ${type} is not configured.`);
      return new Response(JSON.stringify({ message: 'Webhook not configured' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(targetWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      throw new Error(`Discord Webhook failed with status ${response.status}`);
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
