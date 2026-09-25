import { useState, useEffect } from 'react';
import { SiDiscord } from 'react-icons/si';
import { Globe } from 'lucide-react';

export function DiscordInviteCard({ 
  inviteCode, 
  bannerImg, 
  logoImg,
  className,
  websiteUrl
}: { 
  inviteCode: string, 
  bannerImg?: string, 
  logoImg?: string,
  className?: string,
  websiteUrl?: string
}) {
  const [data, setData] = useState<{
    online: number;
    members: number;
    title: string;
    description: string;
    tags: string[];
    iconUrl?: string;
    bannerUrl?: string;
  } | null>(null);

  useEffect(() => {
    const fetchInviteData = async () => {
      try {
        const res = await fetch(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`);
        if (!res.ok) throw new Error('Failed to fetch invite data');
        const json = await res.json();
        
        const guildId = json.guild?.id;
        const iconHash = json.guild?.icon;
        
        let fetchedBannerUrl = undefined;
        if (guildId) {
          if (json.guild?.banner) {
            const ext = json.guild.banner.startsWith('a_') ? 'gif' : 'png';
            fetchedBannerUrl = `https://cdn.discordapp.com/banners/${guildId}/${json.guild.banner}.${ext}?size=512`;
          } else if (json.guild?.splash) {
            fetchedBannerUrl = `https://cdn.discordapp.com/splashes/${guildId}/${json.guild.splash}.png?size=512`;
          }
        }

        let fetchedIconUrl = undefined;
        if (guildId && iconHash) {
          const ext = iconHash.startsWith('a_') ? 'gif' : 'png';
          fetchedIconUrl = `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${ext}?size=256`;
        }
        
        setData({
          online: json.approximate_presence_count ?? 318,
          members: json.approximate_member_count ?? 3365,
          title: json.guild?.name || 'Realm Explorer | Find & Promote',
          description: (json.profile?.description || json.guild?.description || 'The Perfect Place To Advertise Your Minecraft Server/Realm! https://realmexplorer.xyz'),
          tags: (json.profile?.traits?.map((t: any) => t.label) || ["Advertise", "Partner With Us", "Find Servers", "Safe Communuty"]).slice(0, 4),
          iconUrl: fetchedIconUrl,
          bannerUrl: fetchedBannerUrl
        });
      } catch (err) {
        console.error("Error fetching Discord invite data", err);
        setData({
          online: 318,
          members: 3365,
          title: 'Realm Explorer | Find & Promote',
          description: 'The Perfect Place To Advertise Your Minecraft Server/Realm! https://realmexplorer.xyz',
          tags: ["Advertise", "Partner With Us", "Find Servers", "Safe Communuty"]
        });
      }
    };
    
    fetchInviteData();
  }, [inviteCode]);

  const displayData = data || {
    online: 318,
    members: 3365,
    title: 'Realm Explorer | Find & Promote',
    description: 'The Perfect Place To Advertise Your Minecraft Server/Realm! https://realmexplorer.xyz',
    tags: ["Advertise", "Partner With Us", "Find Servers", "Safe Communuty"],
    iconUrl: undefined,
    bannerUrl: undefined
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  return (
    <div className={`group bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800/50 flex flex-col text-left z-20 ${className || 'w-[350px] max-w-full'}`}>
      <div className="h-[120px] w-full relative bg-zinc-800">
        <img src={displayData.bannerUrl || bannerImg} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="px-4 pb-4 relative">
        <div className="absolute -top-10 left-4 p-1.5 bg-zinc-900 rounded-2xl">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-950 flex items-center justify-center">
            <img src={displayData.iconUrl || logoImg} alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="mt-10">
          <h3 className="text-white font-bold text-lg mb-1 font-sans">{displayData.title}</h3>
          <div className="flex items-center gap-3 text-[#b5bac1] text-sm font-sans mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#23a559]"></div>
              <span>{formatNumber(displayData.online)} Online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#80848e]"></div>
              <span>{formatNumber(displayData.members)} Members</span>
            </div>
          </div>
          
          <p className="text-[#dbdee1] text-sm leading-relaxed mb-4 font-sans whitespace-pre-wrap">
            {displayData.description.split(' ').map((word, i) => 
              word.startsWith('http') 
                ? <a key={i} href={word} target="_blank" rel="noreferrer" className="text-[#00a8fc] hover:underline">{word} </a>
                : word + ' '
            )}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {displayData.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-zinc-950 text-[#dbdee1] text-xs font-semibold rounded-full font-sans">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex gap-2 w-full">
            {websiteUrl && (
              <a 
                href={websiteUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#4e5058] hover:bg-[#6d6f78] text-white text-center font-semibold py-2.5 rounded text-sm transition-colors font-sans"
              >
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
            <a 
              href={`https://discord.gg/${inviteCode}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-center font-semibold py-2.5 rounded text-sm transition-colors font-sans"
            >
              <SiDiscord className="w-4 h-4" />
              Join Server
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
