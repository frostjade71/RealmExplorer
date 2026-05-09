import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import nacl from "https://esm.sh/tweetnacl@1.0.3";

const DISCORD_BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN");
const DISCORD_CHANNEL_ID = Deno.env.get("DISCORD_CHANNEL_ID");
const DISCORD_PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const STAFF_ROLE_ID = "1456662864168222864";

// Helper to verify Discord signatures
async function verifySignature(request: Request) {
  const signature = request.headers.get("X-Signature-Ed25519");
  const timestamp = request.headers.get("X-Signature-Timestamp");
  const body = await request.text();

  if (!signature || !timestamp || !DISCORD_PUBLIC_KEY) return { valid: false };

  const isVerified = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + body),
    hexToUint8Array(signature),
    hexToUint8Array(DISCORD_PUBLIC_KEY)
  );

  return { valid: isVerified, body: isVerified ? JSON.parse(body) : null };
}

function hexToUint8Array(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)));
}

serve(async (req) => {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  // 1. Handle Discord Interactions
  const signature = req.headers.get("X-Signature-Ed25519");
  if (signature) {
    const { valid, body } = await verifySignature(req);
    if (!valid) return new Response("Invalid request signature", { status: 401 });

    if (body.type === 1) {
      return new Response(JSON.stringify({ type: 1 }), { headers: { "Content-Type": "application/json" } });
    }

    if (body.type === 3 && body.data.custom_id === "refresh_status") {
      const roles = body.member?.roles || [];
      if (!roles.includes(STAFF_ROLE_ID)) {
        return new Response(
          JSON.stringify({
            type: 4,
            data: { 
              content: "<:no:1440418582704947220> Only Staff's can manually refresh the status board.",
              flags: 64 
            }
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      // Success Path: Perform update then send ephemeral response
      const stats = await fetchStats(supabase);
      
      // Manually trigger the message update so the board refreshes
      const { data: settingsData } = await supabase.from("site_settings").select("value").eq("key", "discord_status_message_id").single();
      const messageId = settingsData?.value;
      
      if (messageId && messageId !== "INITIALIZING") {
        await fetch(`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages/${messageId}`, {
          method: "PATCH",
          headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ embeds: [generateEmbed(stats)] }),
        });
      }

      return new Response(
        JSON.stringify({
          type: 4, // Channel Message with Source
          data: { 
            content: "<:check:1296934814414536779> Status Updated!\n-# Only Staff's can Refresh",
            flags: 64 
          }
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 2. Handle Cron Job / Manual Update
  try {
    const stats = await fetchStats(supabase);
    const { data: settingsData } = await supabase.from("site_settings").select("value").eq("key", "discord_status_message_id").single();
    let messageId = settingsData?.value;
    if (messageId === "INITIALIZING") messageId = null;

    const discordUrl = `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`;
    const payload = { embeds: [generateEmbed(stats)] };

    if (messageId) {
      const res = await fetch(`${discordUrl}/${messageId}`, {
        method: "PATCH",
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 404) messageId = null;
    }

    if (!messageId) {
      const res = await fetch(discordUrl, {
        method: "POST",
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      await supabase.from("site_settings").update({ value: data.id }).eq("key", "discord_status_message_id");
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

async function fetchStats(supabase: any) {
  const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { count: serverCount } = await supabase.from("servers").select("*", { count: "exact", head: true });
  const { count: voteCount } = await supabase.from("votes").select("*", { count: "exact", head: true });
  return { userCount, serverCount, voteCount };
}

function generateEmbed(stats: any) {
  const onlineEmoji = "<a:online:1502469443094183966>";
  return {
    title: "<:logo:1498001412788064346> Realm Explorer - Live Status",
    description: "Real-time metrics from the Realm Explorer website.",
    color: 5763719,
    fields: [
      { name: "<:users:1436833472202412176> Total Users", value: `\`${stats.userCount || 0}\``, inline: true },
      { name: "<:servers:1296934822362742937> Active Servers", value: `\`${stats.serverCount || 0}\``, inline: true },
      { name: "<:votes:1502056182783676577> Total Votes", value: `\`${stats.voteCount || 0}\``, inline: true },
      { name: `${onlineEmoji} Database Status`, value: "Operational", inline: true },
      { name: `${onlineEmoji} Edge Status`, value: "Operational", inline: true },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "Updates every 5 minutes • Realm Explorer Bot" },
  };
}

