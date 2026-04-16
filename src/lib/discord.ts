import type { ServerStatus } from '../types';

const WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
const STAFF_WEBHOOK_URL = import.meta.env.VITE_DISCORD_STAFF_WEBHOOK_URL;
const LOGS_WEBHOOK_URL = import.meta.env.VITE_DISCORD_LOGS_WEBHOOK_URL;
const STAFF_ROLE_ID = import.meta.env.VITE_DISCORD_STAFF_ROLE_ID;
const MEMBER_ROLE_ID = import.meta.env.VITE_DISCORD_MEMBER_ROLE_ID;

export async function sendApprovalNotification(params: {
  serverName: string;
  adminName: string;
  slug: string;
  iconUrl?: string | null;
  type?: 'new_listing' | 'asset_update';
  target?: 'public' | 'logs';
  previousStatus?: string | null;
}) {
  const { serverName, adminName, slug, iconUrl, type = 'new_listing', target = 'public', previousStatus } = params;
  const targetWebhook = target === 'public' ? WEBHOOK_URL : LOGS_WEBHOOK_URL;

  if (!targetWebhook) {
    console.warn(`Discord Webhook (${target}) not configured. Skipping notification.`);
    return;
  }

  const serverUrl = `https://www.realmexplorer.xyz/server/${slug}`;

  // Customize message based on type
  const title = type === 'new_listing' 
    ? 'New Server Published!' 
    : 'Visual Assets Approved';
  
  let description = type === 'new_listing'
    ? `**${serverName}** has been approved and been Listed !`
    : `**${serverName}**'s new visual assets have been reviewed and approved.`;

  if (target === 'logs' && previousStatus) {
    description += `\n\n**${serverName}** status changed to **active** (previously: \`${previousStatus}\`).`;
  }

  const payload = {
    username: target === 'public' 
      ? 'Realm Explorer | Find & Promote Website'
      : 'Realm Explorer | Web Logs',
    content: (target === 'public' && type === 'new_listing' && MEMBER_ROLE_ID) 
      ? `<@&${MEMBER_ROLE_ID}>` 
      : undefined,
    embeds: [
      {
        title: title,
        description: description,
        url: serverUrl,
        color: 0x00ff00, // Realm Green
        thumbnail: iconUrl ? { url: iconUrl } : undefined,
        fields: [
          {
            name: 'Moderator',
            value: adminName,
            inline: true
          },
          {
            name: 'Listing URL',
            value: `[View Server](${serverUrl})`,
            inline: true
          }
        ],
        footer: {
          text: target === 'public' ? 'Web Notification' : 'Internal Audit Log'
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    const response = await fetch(targetWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord Webhook (${target}) failed with status ${response.status}`);
    }
  } catch (error) {
    console.error(`Failed to send Discord notification (${target}):`, error);
  }
}

export async function sendStaffReviewNotification(params: {
  serverName: string;
  status?: ServerStatus;
  iconUrl?: string | null;
}) {
  if (!STAFF_WEBHOOK_URL) {
    console.warn('Staff Discord Webhook URL not configured. Skipping notification.');
    return;
  }

  const { serverName, status = 'pending', iconUrl } = params;
  const adminPanelUrl = 'https://www.realmexplorer.xyz/admin/servers';

  // Determine the alert message based on status
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

  const payload = {
    username: 'Realm Explorer | Staff Alert',
    content: STAFF_ROLE_ID ? `<@&${STAFF_ROLE_ID}>` : undefined,
    embeds: [
      {
        title: alertTitle,
        description: alertMessage,
        color: 0xffa500, // Orange for pending/review
        thumbnail: iconUrl ? { url: iconUrl } : undefined,
        fields: [
          {
            name: 'Action Required',
            value: `Please visit the [Admin Dashboard](${adminPanelUrl}) to review and approve this update.`,
          }
        ],
        footer: {
          text: 'Staff Notification System'
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    const response = await fetch(STAFF_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Staff Webhook failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to send Staff notification:', error);
  }
}

export async function sendLogNotification(params: {
  action: string;
  adminName?: string | null;
  details: string;
  color?: number;
}) {
  if (!LOGS_WEBHOOK_URL) return;

  const { action, adminName, details, color = 0x34495e } = params; // Default Dark Blue/Gray

  const payload = {
    username: 'Realm Explorer | Web Logs',
    embeds: [
      {
        title: action,
        description: details,
        color: color,
        fields: adminName ? [
          {
            name: 'Moderator',
            value: adminName,
            inline: true
          }
        ] : [],
        footer: {
          text: 'Internal Audit Log'
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    await fetch(LOGS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Failed to send Discord log:', error);
  }
}

export async function sendErrorNotification(params: {
  error: any;
  context: string;
  userEmail?: string | null;
}) {
  if (!LOGS_WEBHOOK_URL) return;

  const { error, context, userEmail } = params;
  const errorMessage = error instanceof Error ? error.message : String(error);

  const payload = {
    username: 'Realm Explorer | Severe Error',
    embeds: [
      {
        title: '🔴 Critical System Error',
        description: `**Context:** ${context}\n**Error:** \`${errorMessage}\``,
        color: 0xff0000, // Red
        fields: userEmail ? [
          {
            name: 'User Impacted',
            value: userEmail,
            inline: true
          }
        ] : [],
        footer: {
          text: 'Error Monitoring System'
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    await fetch(LOGS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Failed to send Discord error log:', error);
  }
}
