import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import nacl from "https://esm.sh/tweetnacl@1.0.3";

const DISCORD_BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN");
const DISCORD_ROTM_CHANNEL_ID = Deno.env.get("DISCORD_ROTM_CHANNEL_ID"); // Reusing the same channel env var
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

  // 1. Handle Discord Interactions (Pings)
  const signature = req.headers.get("X-Signature-Ed25519");
  if (signature) {
    const { valid, body } = await verifySignature(req);
    if (!valid) return new Response("Invalid request signature", { status: 401 });

    if (body.type === 1) {
      return new Response(JSON.stringify({ type: 1 }), { headers: { "Content-Type": "application/json" } });
    }
  }

  // 2. Handle Cron Job / Manual Update
  try {
    const standings = await fetchStandings(supabase);
    const { data: settingsData } = await supabase.from("site_settings").select("value").eq("key", "discord_sotm_message_id").single();
    let messageId = settingsData?.value;
    if (messageId === "INITIALIZING") messageId = null;

    if (!DISCORD_ROTM_CHANNEL_ID) {
      console.error("DISCORD_ROTM_CHANNEL_ID is not set");
      return new Response(JSON.stringify({ error: "Configuration missing" }), { status: 500 });
    }

    const discordUrl = `https://discord.com/api/v10/channels/${DISCORD_ROTM_CHANNEL_ID}/messages`;
    const payload = { 
      embeds: [generateEmbed(standings)],
      components: [generateComponents()]
    };

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
      if (data.id) {
        await supabase.from("site_settings").update({ value: data.id }).eq("key", "discord_sotm_message_id");
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

async function fetchStandings(supabase: any) {
  // Fetch Top 10 for 'server' category
  const { data, error } = await supabase
    .from("otm_votes")
    .select(`
      server_id,
      servers:server_id (
        name,
        slug
      )
    `)
    .eq("category", "server");

  if (error) throw error;

  const counts: Record<string, { name: string, slug: string, votes: number }> = {};
  data.forEach((vote: any) => {
    const server = vote.servers;
    if (!server) return;
    if (!counts[vote.server_id]) {
      counts[vote.server_id] = { name: server.name, slug: server.slug, votes: 0 };
    }
    counts[vote.server_id].votes++;
  });

  return Object.values(counts)
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 10);
}

function generateEmbed(standings: any[]) {
  const trophyEmojis = [
    "<a:gold:1502502111408296067>",   // 1st Place Animated
    "<a:silver:1502502159470559242>", // 2nd Place Animated
    "<a:bronze:1502502216337068203>", // 3rd Place Animated
    "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"
  ];
  
  let description = "Current standings for **Server of the Month**.\n\n";
  
  if (standings.length === 0) {
    description += "*No votes recorded yet for this month.*";
  } else {
    standings.forEach((entry, index) => {
      const emoji = trophyEmojis[index] || "•";
      if (index === 0) {
        description += `## ${emoji} ${entry.name}\n`;
      } else {
        description += `${emoji} **${entry.name}**\n`;
      }
      description += `└ <:votes:1502056182783676577> \`${entry.votes} votes\`\n\n`;
    });
  }

  return {
    title: "<:icon:1296934822362742937> SOTM Live Standings",
    description: description,
    color: 5162062, // RE Green (#4EC44E)
    timestamp: new Date().toISOString(),
    footer: { text: "Updates every 10 minutes • Realm Explorer Bot" }
  };
}

function generateComponents() {
  return {
    type: 1,
    components: [
      {
        type: 2,
        label: "Vote Now",
        style: 5, // Link Style
        url: "https://www.realmexplorer.xyz/sotm",
        emoji: { id: "1502056182783676577" },
      },
    ],
  };
}
