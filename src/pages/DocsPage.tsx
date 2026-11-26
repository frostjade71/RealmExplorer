import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Book, Power, HelpCircle, Trophy, Pickaxe, Menu, X, ChevronRight, ChevronLeft, Layout, ShieldAlert, ArrowUp, Link2, Sparkles } from 'lucide-react'
import { SiDiscord } from 'react-icons/si'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { MetaTags } from '../components/MetaTags'
import { CodeBlock } from '../components/CodeBlock'
import rerealmLogo from '../assets/rerealm.webp'

const VOTIFIER_API = 'https://www.realmexplorer.xyz/api/votifier'

const bedrockVotifierScript = `import { world, system } from "@minecraft/server";
import { http, HttpRequest, HttpRequestMethod, HttpHeader } from "@minecraft/server-net";

const API = "${VOTIFIER_API}";
const KEY = "re_your_secret_key";

function send(method, body) {
  const request = new HttpRequest(API);
  request.method = method;
  request.headers = [
    new HttpHeader("Authorization", "Bearer " + KEY),
    new HttpHeader("Content-Type", "application/json"),
  ];
  if (body) request.body = JSON.stringify(body);
  return http.request(request);
}

async function checkVotes() {
  const response = await send(HttpRequestMethod.Get);
  if (response.status !== 200) return;

  const { votes } = JSON.parse(response.body);
  const rewarded = [];

  for (const vote of votes) {
    const player = world.getAllPlayers().find(
      (p) => p.name.toLowerCase() === vote.username.toLowerCase()
    );
    if (!player) continue;

    player.runCommand("give @s diamond 3");
    player.sendMessage("Thanks for voting on Realm Explorer!");
    rewarded.push(vote.id);
  }

  if (rewarded.length > 0) {
    await send(HttpRequestMethod.Post, { ids: rewarded });
  }
}

system.runInterval(() => {
  checkVotes().catch((error) => console.warn("Vote check failed: " + error));
}, 20 * 60);`

type DocSection = {
  id: string
  title: string
  icon: React.ElementType
  content: React.ReactNode
  isHidden?: boolean
}

const docsSections: DocSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    icon: Book,
    content: (
      <div className="space-y-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-body font-bold text-white tracking-tight leading-tight">Welcome to <br className="hidden md:block" /> Realm Explorer</h2>
          <img src={rerealmLogo} alt="Realm Explorer" className="hidden md:block w-24 h-24 lg:w-32 lg:h-32 object-contain rounded-2xl animate-float" />
        </div>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Here at Realm Explorer, we provide a unified hub for Minecraft Servers, Realms, and custom projects. We offer a safe, comprehensive ecosystem built to empower players and creators to share, discover, and build the future of Minecraft together.
        </p>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          This documentation will guide you through everything you need to know about navigating the site, listing your creations, participating in competitions, and joining our community.
        </p>
        <div className="flex flex-row items-center gap-8 mt-6">
          <Link to="/servers" className="group flex items-center gap-2 text-white hover:text-realm-green transition-colors font-body font-bold text-lg">
            <Link2 size={20} className="text-realm-green group-hover:scale-110 transition-transform" />
            Discover
          </Link>
          <a href="https://discord.gg/G8CyUZjPRt" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-white hover:text-[#5865F2] transition-colors font-body font-bold text-lg">
            <Link2 size={20} className="text-[#5865F2] group-hover:scale-110 transition-transform" />
            Connect
          </a>
        </div>
      </div>
    )
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Power,
    content: (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight">Getting Started</h2>
        </div>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Before you can start listing your servers or projects, you'll need to create an account. We use Discord for authentication to ensure a safe and integrated experience.
        </p>
        
        <h3 className="text-xl font-body font-bold text-white mt-10 mb-5 tracking-tight">Account Setup</h3>
        <ul className="space-y-5 text-zinc-400 text-base list-none ml-2">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">1</span>
            <div>Click the <strong className="text-zinc-200">Login</strong> button in the top navigation bar.</div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">2</span>
            <div>You will be redirected to Discord. Authorize the Realm Explorer application to access your profile information.</div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">3</span>
            <div>Once authorized, you'll be redirected back to the site. You can now access your <strong className="text-zinc-200">Dashboard</strong> from the user dropdown menu.</div>
          </li>
        </ul>

        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 mt-8 flex gap-4">
          <ShieldAlert className="text-white flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="text-white font-body font-bold tracking-tight mb-1 text-sm">Privacy Note</h4>
            <p className="text-zinc-400 text-xs md:text-sm">We only request basic profile information (username and avatar) from Discord. We do not have access to your messages or friends list.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'listing-servers',
    title: 'Listing a Server',
    icon: Layout,
    content: (
      <div className="space-y-8">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight">Listing a Server</h2>
        </div>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Adding your server or realm to the directory is the best way to gain new players. Here is a breakdown of all the fields and features available when submitting your listing.
        </p>

        <div className="space-y-10 mt-10">
          <div>
            <h3 className="text-xl font-body font-bold text-white mb-5 flex items-center gap-2">Media & Assets</h3>
            <ul className="space-y-5 text-zinc-400 text-base list-none ml-2">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">1</span>
                <div><strong className="text-zinc-200">Server Icon:</strong> A square image representing your server. Required for all listings.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">2</span>
                <div><strong className="text-zinc-200">Cover Banner:</strong> A wide (video aspect ratio) banner displayed at the top of your server page.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">3</span>
                <div><strong className="text-zinc-200">Gallery:</strong> Showcase gameplay screenshots. <em className="text-zinc-500">(Standard: 1 image | Explorer+: Up to 5 images)</em></div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-body font-bold text-white mb-5 flex items-center gap-2">Core Details</h3>
            <ul className="space-y-5 text-zinc-400 text-base list-none ml-2">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">4</span>
                <div><strong className="text-zinc-200">Type & Category:</strong> Choose between a Java/Bedrock Server or a Bedrock Realm. Select a primary category (SMP, Factions, Skyblock, etc.).</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">5</span>
                <div><strong className="text-zinc-200">Name:</strong> Your server's name (Max 100 characters). Must be unique.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">6</span>
                <div><strong className="text-zinc-200">Connection Info:</strong> Provide a Java IP + Port, a Bedrock IP + Port, or a Realm Code. You can provide both Java and Bedrock IPs for crossplay servers.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">7</span>
                <div><strong className="text-zinc-200">Description:</strong> Full Markdown support for rich formatting. <em className="text-zinc-500">(Standard: 2000 chars | Explorer+: 5000 chars)</em></div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-body font-bold text-white mb-5 flex items-center gap-2">Community Features</h3>
            <ul className="space-y-5 text-zinc-400 text-base list-none ml-2">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">8</span>
                <div><strong className="text-zinc-200">Social Links:</strong> Add up to 4 links to your Website, Discord, YouTube, TikTok, and more.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">9</span>
                <div><strong className="text-zinc-200">Verify on Discord First:</strong> An advanced feature that forces players to verify in your Discord server before they can view the connection IP or Realm Code. <em className="text-zinc-500">Requires a Discord social link.</em></div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">10</span>
                <div><strong className="text-zinc-200">Staff List:</strong> Credit your team by linking their Realm Explorer accounts with specific roles (Owner, Admin, Mod, Helper). <em className="text-zinc-500">(Standard: Up to 3 | Explorer+: Up to 6)</em></div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-body font-bold text-white mb-5 flex items-center gap-2">
              Integrations
              <span className="text-sm font-normal text-zinc-500 ml-1">(optional for voting rewards)</span>
            </h3>
            <ul className="space-y-5 text-zinc-400 text-base list-none ml-2">
              <li id="votifier-integration" className="flex items-start gap-3 scroll-mt-32">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">11</span>
                <div>
                  <strong className="text-zinc-200">Votifier Integration:</strong> Configure NuVotifier (IP, Port, Token, Public Key) to securely send vote rewards directly to your server in-game when a user votes on Realm Explorer.
                  <div className="mt-3">
                    <button 
                      onClick={() => window.dispatchEvent(new CustomEvent('switch-doc-tab', { detail: 'nuvotifier' }))}
                      className="group flex items-center gap-2 bg-zinc-800/50 hover:bg-realm-green/20 text-realm-green px-3 py-2 rounded-lg text-sm font-body font-bold transition-all border border-transparent hover:border-realm-green/30"
                    >
                      <Link2 size={16} className="text-realm-green" />
                      Read NuVotifier Setup Guide
                    </button>
                  </div>
                </div>
              </li>
              <li id="bedrock-votifier-integration" className="flex items-start gap-3 scroll-mt-32">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">12</span>
                <div>
                  <strong className="text-zinc-200">Bedrock Votifier:</strong> For Bedrock Dedicated Servers, including NetherNet. Turn it on to get a secret key, then let your server collect new votes from Realm Explorer and reward players in-game. No open port is needed.
                  <div className="mt-3">
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('switch-doc-tab', { detail: 'bedrock-votifier' }))}
                      className="group flex items-center gap-2 bg-zinc-800/50 hover:bg-realm-green/20 text-realm-green px-3 py-2 rounded-lg text-sm font-body font-bold transition-all border border-transparent hover:border-realm-green/30"
                    >
                      <Link2 size={16} className="text-realm-green" />
                      Read Bedrock Votifier Setup Guide
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'projects',
    title: 'Adding a Project',
    icon: Pickaxe,
    content: (
      <div className="space-y-8">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight">Adding a Project</h2>
        </div>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Adding your project, mod, or add-on to the directory is a great way to share your creations. Here is a breakdown of all the fields and features available when submitting your project.
        </p>

        <div className="space-y-10 mt-10">
          <div>
            <h3 className="text-xl font-body font-bold text-white mb-5 flex items-center gap-2">Media & Assets</h3>
            <ul className="space-y-5 text-zinc-400 text-base list-none ml-2">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">1</span>
                <div><strong className="text-zinc-200">Project Icon:</strong> A square image representing your project. Required for all listings.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">2</span>
                <div><strong className="text-zinc-200">Gallery:</strong> Showcase gameplay screenshots or features. <em className="text-zinc-500">(Max 1 image, up to 5MB)</em></div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-body font-bold text-white mb-5 flex items-center gap-2">Core Details</h3>
            <ul className="space-y-5 text-zinc-400 text-base list-none ml-2">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">3</span>
                <div><strong className="text-zinc-200">Project File:</strong> Upload your creation (e.g., .zip, .jar, .mcaddon, .mcpack) up to 30MB.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">4</span>
                <div><strong className="text-zinc-200">Name & Category:</strong> Choose a unique name (Max 100 characters) and select a category such as Mods, Add-ons, Resource Packs, or Builds.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">5</span>
                <div><strong className="text-zinc-200">License:</strong> Select a standard license (like MIT, Apache 2.0, or GPLv3) or upload a custom license file.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">6</span>
                <div><strong className="text-zinc-200">Description:</strong> Provide a brief tagline and a full detailed description with Markdown support to explain your project.</div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-body font-bold text-white mb-5 flex items-center gap-2">Community & Updates</h3>
            <ul className="space-y-5 text-zinc-400 text-base list-none ml-2">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">7</span>
                <div><strong className="text-zinc-200">Social Links:</strong> Add up to 4 links to your Website, Discord, GitHub, YouTube, and more.</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">8</span>
                <div><strong className="text-zinc-200">Changelogs:</strong> Keep your users updated by adding version titles, descriptions, and attaching new project files for each release.</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'voting',
    title: 'Voting & Leaderboards',
    icon: ArrowUp,
    content: (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight">Voting & Leaderboards</h2>
        </div>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Visibility on Realm Explorer is heavily driven by community interaction. The more votes your listing receives, the higher it will appear on the Leaderboards and category pages.
        </p>
        
        <h3 className="text-xl font-body font-bold text-white mt-8 mb-4 tracking-tight">How Voting Works</h3>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Users can vote for a server or project once per day. Voting requires a registered account to prevent abuse.
        </p>
        
        <ul className="list-disc list-inside text-zinc-400 text-sm md:text-base space-y-2 mt-4 ml-2">
          <li>Votes reset quarterly (usually every 3 months or more) to give new listings a fair chance.</li>
          <li>Encourage your community to vote by providing the direct link to your listing page.</li>
          <li>Listings with the most votes are featured on the homepage.</li>
          <li>
            Give your players in-game rewards using NuVotifier.{' '}
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('switch-doc-tab', { detail: 'listing-servers' }))
                setTimeout(() => {
                  const el = document.getElementById('votifier-integration')
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }
                }, 100)
              }}
              className="inline-flex items-center gap-1 text-realm-green hover:underline font-bold text-sm ml-1 transition-all"
            >
              <Link2 size={14} /> Setup Votifier
            </button>
          </li>
        </ul>

        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 mt-8 flex gap-4">
          <ShieldAlert className="text-white flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="text-white font-body font-bold tracking-tight mb-1 text-sm">Anti-Cheat Policy</h4>
            <p className="text-zinc-400 text-xs md:text-sm">We actively monitor for vote manipulation (botting, alt accounts). Listings caught manipulating votes will be penalized or removed from the directory.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'competitions',
    title: 'OTM Competitions',
    icon: Trophy,
    content: (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight">Of The Month (OTM)</h2>
        </div>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Every month, Realm Explorer hosts OTM competitions to highlight the best servers and creators in the community. Winners receive special badges on their listings and profiles.
        </p>

        <h3 className="text-xl font-body font-bold text-white mt-10 mb-5 tracking-tight">The Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 border-l-4 border-l-purple-500 hover:bg-zinc-900/80 transition-colors">
            <h4 className="font-body font-bold text-white text-lg tracking-tight mb-2">
              ROTM
            </h4>
            <p className="text-zinc-400 text-sm mb-2"><strong className="text-zinc-200">Realm of the Month:</strong> Recognizes the most outstanding Minecraft Bedrock Realm. Judged by the community on activity, builds, and uniqueness.</p>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 border-l-4 border-l-blue-500 hover:bg-zinc-900/80 transition-colors">
            <h4 className="font-body font-bold text-white text-lg tracking-tight mb-2">
              SOTM
            </h4>
            <p className="text-zinc-400 text-sm mb-2"><strong className="text-zinc-200">Server of the Month:</strong> Awarded to the best dedicated server. Factors include uptime, player base, and custom features.</p>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 border-l-4 border-l-green-500 hover:bg-zinc-900/80 transition-colors">
            <h4 className="font-body font-bold text-white text-lg tracking-tight mb-2">
              DOTM
            </h4>
            <p className="text-zinc-400 text-sm mb-2"><strong className="text-zinc-200">Developer of the Month:</strong> Highlights talented developers creating addons, plugins, or tools for the community.</p>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 border-l-4 border-l-orange-500 hover:bg-zinc-900/80 transition-colors">
            <h4 className="font-body font-bold text-white text-lg tracking-tight mb-2">
              BOTM
            </h4>
            <p className="text-zinc-400 text-sm mb-2"><strong className="text-zinc-200">Builder of the Month:</strong> Showcases incredible builders creating maps, spawns, and breathtaking in-game architecture.</p>
          </div>
        </div>

        <h3 className="text-xl font-body font-bold text-white mt-10 mb-5 tracking-tight">How it Works</h3>
        <ul className="space-y-5 text-zinc-400 text-base list-none ml-2">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">1</span>
            <div><strong className="text-zinc-200">Event Pages:</strong> Visit a category's page (like <Link to="/rotm" className="text-realm-green hover:underline">/rotm</Link>) to see the previous month's winners displayed in a cinematic showcase. Below the winners, you'll find the active candidates for the current month.</div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">2</span>
            <div><strong className="text-zinc-200">Voting & Cooldowns:</strong> Log in to cast your vote for your favorite candidates. Once you vote for a candidate, a <strong className="text-zinc-200">24-hour cooldown</strong> timer begins before you can vote for that same candidate again.</div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">3</span>
            <div><strong className="text-zinc-200">Real-Time Standings:</strong> Visit <Link to="/otm-standings" className="text-realm-green hover:underline">/otm-standings</Link> to view the live leaderboards. Here you can see the top 3 podium placements and search through the full rankings of every competitor across all four categories.</div>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 'community',
    title: 'Community & Support',
    icon: HelpCircle,
    content: (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight">Community & Support</h2>
        </div>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Realm Explorer is built by and for the community. We're here to help you succeed!
        </p>

        <h3 className="text-xl font-body font-bold text-white mt-8 mb-4 tracking-tight">Need Help?</h3>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          If you have questions that aren't answered in this documentation, or if you're experiencing a bug, the fastest way to get help is through our Discord server.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <a 
            href="https://discord.gg/JZ39eTGSgN" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-3 rounded-lg font-body font-bold text-sm tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <SiDiscord size={18} />
            Join our Discord
          </a>
          <a 
            href="/appeal" 
            className="inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 px-6 py-3 rounded-lg font-body font-bold text-sm tracking-wider transition-all hover:scale-105 active:scale-95"
          >
            Submit an Appeal
          </a>
        </div>
      </div>
    )
  },
  {
    id: 'nuvotifier',
    title: 'NuVotifier Setup',
    icon: Link2,
    isHidden: true,
    content: (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight">NuVotifier Setup Guide</h2>
        </div>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          NuVotifier is a secure way for Realm Explorer to notify your Minecraft server whenever a player votes for it. By configuring NuVotifier, you can automatically give players in-game rewards like items, currency, or ranks.
        </p>

        <h3 className="text-xl font-body font-bold text-white mt-10 mb-5 tracking-tight">How to Configure NuVotifier</h3>
        <ul className="space-y-5 text-zinc-400 text-base list-none ml-2">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">1</span>
            <div>
              <strong className="text-zinc-200">Install the Plugin:</strong> Install the NuVotifier plugin on your Minecraft server and configure its internal settings. Ensure the Votifier port is open and accessible from the outside.{' '}
              <a href="https://www.spigotmc.org/resources/nuvotifier.13449/" target="_blank" rel="noopener noreferrer" className="text-realm-green hover:underline">Download official NuVotifier here.</a>
              <div className="mt-2 text-sm text-zinc-500 italic">
                Note: NuVotifier is a plugin built for Java servers and only works for Java Edition setups. Bedrock servers use Bedrock Votifier instead.
              </div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">2</span>
            <div>
              <strong className="text-zinc-200">Enable in Realm Explorer:</strong> During your server submission (or when editing your server), turn on the <strong>Enable Votifier</strong> toggle in the Integrations tab.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">3</span>
            <div>
              <strong className="text-zinc-200">Enter Credentials:</strong>
              <ul className="mt-2 space-y-2 list-disc list-inside text-sm text-zinc-500">
                <li><strong className="text-zinc-300">Votifier IP:</strong> The public IP address where your server's Votifier is listening.</li>
                <li><strong className="text-zinc-300">Votifier Port:</strong> The port your Votifier is bound to (usually 8192).</li>
                <li><strong className="text-zinc-300">Votifier Token:</strong> If using NuVotifier protocol v2, enter your secure token.</li>
                <li><strong className="text-zinc-300">Public Key:</strong> If using Votifier protocol v1, enter your public key block.</li>
              </ul>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">4</span>
            <div><strong className="text-zinc-200">Reward Listeners:</strong> Realm Explorer will now forward vote packets containing the voter's username. Make sure you have a reward listener plugin (like VotingPlugin, SuperBVote, etc.) installed to process the vote and give the player their reward!</div>
          </li>
        </ul>

        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 mt-8 flex gap-4">
          <Sparkles className="text-white flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="text-white font-body font-bold tracking-tight mb-1 text-sm">Running a Bedrock Server?</h4>
            <p className="text-zinc-400 text-xs md:text-sm">
              Bedrock Dedicated Servers, including NetherNet, are supported through Bedrock Votifier.{' '}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('switch-doc-tab', { detail: 'bedrock-votifier' }))}
                className="text-realm-green hover:underline font-bold"
              >
                Read the Bedrock Votifier Setup Guide
              </button>
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 mt-4 flex gap-4">
          <ShieldAlert className="text-white flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="text-white font-body font-bold tracking-tight mb-1 text-sm">Security</h4>
            <p className="text-zinc-400 text-xs md:text-sm">Your Votifier credentials (especially your token and public key) are securely encrypted and safely stored in our database. They are never exposed publicly.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'bedrock-votifier',
    title: 'Bedrock Votifier Setup',
    icon: Link2,
    isHidden: true,
    content: (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight">Bedrock Votifier Setup Guide</h2>
        </div>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Bedrock Votifier lets a Bedrock Dedicated Server reward players who vote on Realm Explorer. A script on a Bedrock server cannot accept incoming connections, on RakNet or on NetherNet, so the classic Votifier cannot reach it. Bedrock Votifier works the other way round: your server asks Realm Explorer for new votes, so there is no port to open.
        </p>

        <h3 className="text-xl font-body font-bold text-white mt-10 mb-5 tracking-tight">How to Set It Up</h3>
        <ul className="space-y-5 text-zinc-400 text-base list-none ml-2">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">1</span>
            <div>
              <strong className="text-zinc-200">Get Your Secret Key:</strong> Edit your server on Realm Explorer, turn on <strong>Enable Bedrock Votifier</strong>, copy the secret key and submit the form. The key is only shown once. If you lose it, generate a new one.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">2</span>
            <div>
              <strong className="text-zinc-200">Allow Web Requests:</strong> Add <code className="text-zinc-300 text-xs font-mono">"@minecraft/server-net"</code> to <code className="text-zinc-300 text-xs font-mono">allowed_modules</code> in your server's <code className="text-zinc-300 text-xs font-mono">config/default/permissions.json</code>, and add the module as a dependency in your behavior pack's <code className="text-zinc-300 text-xs font-mono">manifest.json</code>.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">3</span>
            <div>
              <strong className="text-zinc-200">Add the Script:</strong> Use the example below in your behavior pack. It checks for votes once a minute, rewards voters who are online, and tells Realm Explorer which votes were rewarded.
            </div>
          </li>
        </ul>

        <h3 className="text-xl font-body font-bold text-white mt-10 mb-4 tracking-tight">Example Script</h3>
        <CodeBlock code={bedrockVotifierScript} language="javascript" />

        <h3 className="text-xl font-body font-bold text-white mt-10 mb-4 tracking-tight">API Reference</h3>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Both requests need the header <code className="text-zinc-300 text-xs font-mono">Authorization: Bearer YOUR_SECRET_KEY</code>. Any server software that can make web requests can use this API.
        </p>

        <div className="space-y-3">
          <div className="bg-zinc-950 border border-white/5 rounded-xl p-4 flex items-center gap-3 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-realm-green/20 text-realm-green text-xs font-bold font-mono">GET</span>
            <code className="text-zinc-300 text-sm font-mono break-all">{VOTIFIER_API}</code>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">Returns up to 100 votes that have not been claimed yet, oldest first.</p>
          <CodeBlock code={`{
  "success": true,
  "votes": [
    { "id": 1042, "username": "Steve", "voted_at": "2026-11-26T13:20:11.482+00:00" }
  ]
}`} />
        </div>

        <div className="space-y-3">
          <div className="bg-zinc-950 border border-white/5 rounded-xl p-4 flex items-center gap-3 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-realm-green/20 text-realm-green text-xs font-bold font-mono">POST</span>
            <code className="text-zinc-300 text-sm font-mono break-all">{VOTIFIER_API}</code>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">Claims votes you have rewarded so they are not returned again. Send the vote ids as JSON.</p>
          <CodeBlock code={`{ "ids": [1042] }`} />
          <CodeBlock code={`{
  "success": true,
  "claimed": 1
}`} />
        </div>

        <ul className="list-disc list-inside text-zinc-400 text-sm md:text-base space-y-2 mt-4 ml-2">
          <li>A vote stays available for 7 days, so a player who votes while offline is rewarded the next time they join.</li>
          <li>The username is the name the voter typed on the vote page. Ask your players to enter their exact gamertag.</li>
          <li>Check for votes no more than once every 30 seconds.</li>
          <li>Realms cannot make web requests, so Bedrock Votifier only works on Bedrock Dedicated Servers.</li>
        </ul>

        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 mt-8 flex gap-4">
          <ShieldAlert className="text-white flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="text-white font-body font-bold tracking-tight mb-1 text-sm">Security</h4>
            <p className="text-zinc-400 text-xs md:text-sm">Treat your secret key like a password. Anyone who has it can claim your server's votes. Realm Explorer only stores a fingerprint of the key, which is why it cannot be shown again.</p>
          </div>
        </div>
      </div>
    )
  }
]

export function DocsPage() {
  const location = useLocation()
  const [activeSectionId, setActiveSectionId] = useState<string>(() => {
    const params = new URLSearchParams(location.search)
    return params.get('tab') || docsSections[0].id
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '')
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }, [location.hash, activeSectionId])


  const handleScrollToTop = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
      document.body.scrollTo({ top: 0, behavior: 'smooth' })
      const root = document.getElementById('root')
      if (root) root.scrollTo({ top: 0, behavior: 'smooth' })
    }, 50)
  }

  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      setActiveSectionId(e.detail)
      handleScrollToTop()
    }
    window.addEventListener('switch-doc-tab', handleSwitchTab)
    return () => window.removeEventListener('switch-doc-tab', handleSwitchTab)
  }, [])

  const visibleSections = docsSections.filter(s => !s.isHidden)
  const activeSection = docsSections.find(s => s.id === activeSectionId) || docsSections[0]
  const currentIndex = visibleSections.findIndex(s => s.id === activeSectionId)
  
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex !== -1 && currentIndex < visibleSections.length - 1

  return (
    <AnimatedPage>
      <MetaTags 
        title="Documentation - Realm Explorer"
        description="Learn how to use Realm Explorer, list your servers, and explore the community."
        image="/meta-preview/RE-docs.webp"
        url="/docs"
      />
      
      <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8 items-start relative min-h-[calc(100vh-200px)]">
        
        {/* Mobile Menu Toggle */}
        <div className="md:hidden w-full flex items-center justify-between mb-4 bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <Book size={20} />
            </div>
            <h1 className="font-body font-bold text-white text-lg">Docs</h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <aside className={`
          w-full md:w-64 lg:w-72 flex-shrink-0 flex flex-col gap-2 font-headline
          ${isMobileMenuOpen ? 'block' : 'hidden'} md:block
          md:sticky md:top-24
        `}>
          <div className="hidden md:flex items-center gap-3 mb-8 px-2">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <Book size={20} />
            </div>
            <h1 className="font-body font-bold text-white text-xl tracking-tight">Docs</h1>
          </div>

          <nav className="space-y-1">
            {visibleSections.map((section) => {
              const isActive = section.id === activeSectionId
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSectionId(section.id)
                    setIsMobileMenuOpen(false)
                    handleScrollToTop()
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-200
                    ${isActive 
                      ? 'bg-realm-green/10 text-realm-green font-medium' 
                      : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-realm-green' : 'text-zinc-500'} />
                    <span>{section.title}</span>
                  </div>
                  {isActive && <ChevronRight size={16} />}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <FramerIn className="flex-grow w-full md:w-auto font-headline bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-10 backdrop-blur-sm min-h-[500px] flex flex-col justify-between">
          <div>
            {activeSection.content}
          </div>

          {activeSection.isHidden ? (
            <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-end">
              <button
                onClick={() => {
                  setActiveSectionId('listing-servers')
                  handleScrollToTop()
                }}
                className="flex items-center gap-2 px-6 h-10 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 font-body font-bold text-sm transition-all"
              >
                <ChevronLeft size={16} /> Back
              </button>
            </div>
          ) : (
            <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  if (hasPrev) {
                    setActiveSectionId(visibleSections[currentIndex - 1].id)
                    handleScrollToTop()
                  }
                }}
                disabled={!hasPrev}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-lg transition-all
                  ${hasPrev 
                    ? 'bg-zinc-800 text-white hover:bg-zinc-700' 
                    : 'bg-zinc-900 text-zinc-600 cursor-not-allowed opacity-50'}
                `}
                title="Previous Step"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => {
                  if (hasNext) {
                    setActiveSectionId(visibleSections[currentIndex + 1].id)
                    handleScrollToTop()
                  }
                }}
                disabled={!hasNext}
                className={`
                  flex items-center justify-center px-6 h-10 rounded-lg font-body font-bold text-sm transition-all
                  ${hasNext 
                    ? 'bg-realm-green text-zinc-950 hover:bg-realm-green/90' 
                    : 'bg-zinc-900 text-zinc-600 cursor-not-allowed opacity-50'}
                `}
              >
                Next
              </button>
            </div>
          )}
        </FramerIn>

      </div>
    </AnimatedPage>
  )
}
