import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import nacl from "https://esm.sh/tweetnacl@1.0.3";

const DISCORD_BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN");
const DISCORD_ROTM_CHANNEL_ID = Deno.env.get("DISCORD_ROTM_CHANNEL_ID");
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

serve(async (req: Request) => {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  // 1. Handle Discord Interactions (Refresh Button)
  const signature = req.headers.get("X-Signature-Ed25519");
  if (signature) {
    const { valid, body } = await verifySignature(req);
    if (!valid) return new Response("Invalid request signature", { status: 401 });

    if (body.type === 1) {
      return new Response(JSON.stringify({ type: 1 }), { headers: { "Content-Type": "application/json" } });
    }

    if (body.type === 3 && body.data.custom_id === "refresh_rotm") {
      const roles = body.member?.roles || [];
      if (!roles.includes(STAFF_ROLE_ID)) {
        return new Response(
          JSON.stringify({
            type: 4,
            data: { 
              content: "<:no:1440418582704947220> Only Staff's can manually refresh the ROTM standings.",
              flags: 64 
            }
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      const { data: configData } = await supabase.from("site_settings").select("value").eq("key", "otm_global_config").maybeSingle();
      const isActive = configData?.value?.competition_status?.realm ?? true;

      let recentWinner = null;
      if (!isActive) {
        try {
          recentWinner = await fetchRecentWinner(supabase, "realm");
        } catch (e) {
          console.error("Error fetching recent winner:", e);
        }
      }

      const standings = await fetchStandings(supabase);
      const { data: settingsData } = await supabase.from("site_settings").select("value").eq("key", "discord_rotm_message_id").single();
      const messageId = settingsData?.value;
      
        await fetch(`https://discord.com/api/v10/channels/${DISCORD_ROTM_CHANNEL_ID}/messages/${messageId}`, {
          method: "PATCH",
          headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ 
            embeds: [generateEmbed(standings, isActive, recentWinner)],
            components: [generateComponents(isActive)]
          }),
        });

      return new Response(
        JSON.stringify({
          type: 4,
          data: { 
            content: "<:check:1296934814414536779> ROTM Standings Updated!",
            flags: 64 
          }
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 2. Handle Cron Job / Manual Update
  try {
    const { data: configData } = await supabase.from("site_settings").select("value").eq("key", "otm_global_config").maybeSingle();
    const isActive = configData?.value?.competition_status?.realm ?? true;

    let recentWinner = null;
    if (!isActive) {
      try {
        recentWinner = await fetchRecentWinner(supabase, "realm");
      } catch (e) {
        console.error("Error fetching recent winner:", e);
      }
    }

    const standings = await fetchStandings(supabase);
    const { data: settingsData } = await supabase.from("site_settings").select("value").eq("key", "discord_rotm_message_id").single();
    let messageId = settingsData?.value;
    if (messageId === "INITIALIZING") messageId = null;

    if (!DISCORD_ROTM_CHANNEL_ID) {
      console.error("DISCORD_ROTM_CHANNEL_ID is not set");
      return new Response(JSON.stringify({ error: "Configuration missing" }), { status: 500 });
    }

    const discordUrl = `https://discord.com/api/v10/channels/${DISCORD_ROTM_CHANNEL_ID}/messages`;
    const payload = { 
      embeds: [generateEmbed(standings, isActive, recentWinner)],
      components: [generateComponents(isActive)]
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
        await supabase.from("site_settings").update({ value: data.id }).eq("key", "discord_rotm_message_id");
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    const err = error as any;
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

async function fetchStandings(supabase: any) {
  // Fetch Top 10 for 'realm' category
  const { data, error } = await supabase
    .from("otm_votes")
    .select(`
      server_id,
      servers:server_id (
        name,
        slug,
        icon_url
      )
    `)
    .eq("category", "realm");

  if (error) throw error;

  // Manual aggregation because Supabase JS client group by is limited
  const counts: Record<string, { name: string, slug: string, votes: number, icon_url: string | null }> = {};
  data.forEach((vote: any) => {
    const server = vote.servers;
    if (!server) return;
    if (!counts[vote.server_id]) {
      counts[vote.server_id] = { name: server.name, slug: server.slug, votes: 0, icon_url: server.icon_url };
    }
    counts[vote.server_id].votes++;
  });

  return Object.values(counts)
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 10);
}

function generateEmbed(standings: any[], isActive = true, recentWinner: any = null) {
  if (!isActive) {
    const defaultColor = 11032055; // Realm Purple (#a855f7)
    if (!recentWinner) {
      return {
        title: "<:icon:1271214161833103451> ROTM is Closed",
        color: defaultColor,
        footer: { text: "New OTM Competition will start soon." }
      };
    }

    const name = recentWinner.winner_name || recentWinner.servers?.name || "Unknown";
    const month = recentWinner.month || "";
    const imageUrl = recentWinner.winner_image_url || recentWinner.servers?.icon_url;
    const descriptionText = recentWinner.description || "";

    let embedDescription = `## <a:gold:1502502111408296067> Realm of the Month Winner\n`;
    embedDescription += `└ **${name}** (${month})\n\n`;
    if (descriptionText) {
      embedDescription += `${descriptionText}\n\n`;
    }

    return {
      title: "<:icon:1271214161833103451> ROTM is Closed",
      description: embedDescription.trim(),
      color: defaultColor,
      thumbnail: imageUrl ? { url: imageUrl } : undefined,
      image: recentWinner.servers?.banner_url ? { url: recentWinner.servers.banner_url } : undefined,
      footer: { text: "New OTM Competition will start soon." }
    };
  }

  const trophyEmojis = [
    "<a:gold:1502502111408296067>",   // 1st Place Animated
    "<a:silver:1502502159470559242>", // 2nd Place Animated
    "<a:bronze:1502502216337068203>", // 3rd Place Animated
    "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"
  ];
  
  let description = "Current standings for **Realm of the Month**.\n\n";
  
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
      description += `└ 🗳️ \`${entry.votes} votes\`\n\n`;
    });
  }

  return {
    title: "<:icon:1271214161833103451> ROTM Live Standings",
    description: description,
    color: 11032055, // Realm Purple (#a855f7)
    timestamp: new Date().toISOString(),
    thumbnail: standings[0]?.icon_url ? { url: standings[0].icon_url } : undefined,
    footer: { text: "Updates every 5 minutes • Realm Explorer Bot" }
  };
}

function generateComponents(isActive = true) {
  return {
    type: 1,
    components: [
      {
        type: 2,
        label: isActive ? "Vote Now" : "View",
        style: 5, // Link Style
        url: "https://www.realmexplorer.xyz/rotm",
        emoji: isActive ? { id: "1502056182783676577" } : undefined,
      },
    ],
  };
}

async function fetchRecentWinner(supabase: any, category: string) {
  const { data, error } = await supabase
    .from("otm_winners")
    .select(`
      month,
      winner_name,
      winner_image_url,
      description,
      server_id,
      servers:server_id (
        name,
        banner_url,
        icon_url
      )
    `)
    .eq("category", category)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}
