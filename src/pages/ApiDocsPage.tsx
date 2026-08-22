import { useState, useEffect } from 'react'
import { Book, Code2, Server, Filter, ArrowRightLeft, Menu, X, ChevronRight, ChevronLeft, Braces, ShieldCheck, Zap, Copy, Check } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { MetaTags } from '../components/MetaTags'

const API_BASE = 'https://realmexplorer.xyz/api'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="absolute top-3 right-3 p-1.5 rounded-md bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-400 hover:text-zinc-200 transition-all"
      title="Copy"
    >
      {copied ? <Check size={14} className="text-realm-green" /> : <Copy size={14} />}
    </button>
  )
}

function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
  return (
    <div className="relative group">
      <CopyButton text={code} />
      <pre className="bg-zinc-950 border border-white/5 rounded-xl p-5 overflow-x-auto text-sm font-mono leading-relaxed">
        <code className={`language-${language} text-zinc-300`}>{code}</code>
      </pre>
    </div>
  )
}

type DocSection = {
  id: string
  title: string
  icon: React.ElementType
  content: React.ReactNode
}

const apiDocsSections: DocSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    icon: Book,
    content: (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-body font-bold text-white tracking-tight leading-tight">Public API <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 align-middle"><img src="/beta/93894-testergreen.png" alt="" className="w-4 h-4" /><span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Beta</span></span></h2>
          <p className="text-zinc-500 text-sm mt-2 font-mono">{API_BASE}/servers</p>
        </div>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          The Realm Explorer Public API allows you to fetch our directory of approved Minecraft servers and realms. Use it to display server listings on your own website, build tools, or integrate with your projects.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-realm-green/10"><Zap size={18} className="text-realm-green" /></div>
              <h3 className="font-body font-bold text-white text-sm">Free & Open</h3>
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed">No API key required. No authentication. Just fetch the URL and get JSON back.</p>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10"><ShieldCheck size={18} className="text-blue-400" /></div>
              <h3 className="font-body font-bold text-white text-sm">Safe Data Only</h3>
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed">Only approved servers are returned. No private data like IPs, realm codes, or owner info is ever exposed.</p>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 mt-6 flex gap-4">
          <ShieldCheck className="text-blue-400 flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="text-blue-400 font-body font-bold tracking-tight mb-1 text-sm">Rate Limiting</h4>
            <p className="text-blue-400/80 text-xs md:text-sm">Responses are cached at the edge for 5 minutes. Please don't poll more frequently than once per minute.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'endpoint',
    title: 'Endpoint',
    icon: Server,
    content: (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight">Endpoint</h2>
        </div>

        <div className="bg-zinc-950 border border-white/5 rounded-xl p-5 flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-md bg-realm-green/20 text-realm-green text-xs font-bold font-mono">GET</span>
          <code className="text-zinc-300 text-sm font-mono break-all">{API_BASE}/servers</code>
        </div>

        <h3 className="text-xl font-body font-bold text-white mt-10 mb-5 tracking-tight">Base URL</h3>
        <CodeBlock code={`${API_BASE}/servers`} language="text" />

        <h3 className="text-xl font-body font-bold text-white mt-10 mb-5 tracking-tight">Quick Example</h3>
        <CodeBlock code={`// Fetch all approved servers
fetch('${API_BASE}/servers')
  .then(res => res.json())
  .then(data => {
    console.log(data.data)  // Array of server objects
    console.log(data.total) // Total count
  })`} language="javascript" />

        <h3 className="text-xl font-body font-bold text-white mt-10 mb-5 tracking-tight">With Filters</h3>
        <CodeBlock code={`// Fetch top 10 realms sorted by votes
fetch('${API_BASE}/servers?type=realm&sort=votes&limit=10')
  .then(res => res.json())
  .then(data => {
    data.data.forEach(server => {
      console.log(server.name, '—', server.votes, 'votes')
    })
  })`} language="javascript" />
      </div>
    )
  },
  {
    id: 'parameters',
    title: 'Parameters',
    icon: Filter,
    content: (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight">Query Parameters</h2>
        </div>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          All parameters are optional. Combine them freely to filter and paginate results.
        </p>

        <div className="mt-8 space-y-4">
          {[
            { name: 'type', type: 'string', default: 'all', description: 'Filter by listing type.', values: 'server, realm' },
            { name: 'category', type: 'string', default: 'all', description: 'Filter by server category.', values: 'factions, kitpvp, skyblock, smp, modded, other' },
            { name: 'featured', type: 'boolean', default: 'false', description: 'Only return featured servers.', values: 'true' },
            { name: 'sort', type: 'string', default: 'votes', description: 'Sort order for results.', values: 'votes, newest, name' },
            { name: 'limit', type: 'integer', default: '50', description: 'Number of results per page (max 100).', values: '1–100' },
            { name: 'offset', type: 'integer', default: '0', description: 'Pagination offset (skip N results).', values: '0+' },
          ].map(param => (
            <div key={param.name} className="bg-zinc-900/50 border border-white/5 rounded-xl p-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <code className="text-realm-green font-mono font-bold text-sm">{param.name}</code>
                <span className="text-zinc-600 text-xs font-mono">{param.type}</span>
                <span className="text-zinc-700 text-xs">•</span>
                <span className="text-zinc-500 text-xs font-mono">default: {param.default}</span>
              </div>
              <p className="text-zinc-400 text-sm mb-2">{param.description}</p>
              <p className="text-zinc-500 text-xs font-mono">Values: {param.values}</p>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-body font-bold text-white mt-10 mb-5 tracking-tight">Example URLs</h3>
        <div className="space-y-3">
          {[
            { label: 'All servers', url: `${API_BASE}/servers` },
            { label: 'Only realms', url: `${API_BASE}/servers?type=realm` },
            { label: 'SMP category, newest first', url: `${API_BASE}/servers?category=smp&sort=newest` },
            { label: 'Featured, top 5', url: `${API_BASE}/servers?featured=true&limit=5` },
            { label: 'Page 2 (offset 50)', url: `${API_BASE}/servers?limit=50&offset=50` },
          ].map(example => (
            <div key={example.label} className="relative group">
              <CopyButton text={example.url} />
              <div className="bg-zinc-950 border border-white/5 rounded-lg p-4 pr-12">
                <p className="text-zinc-500 text-xs mb-1">{example.label}</p>
                <code className="text-zinc-300 text-xs font-mono break-all">{example.url}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'response',
    title: 'Response',
    icon: Braces,
    content: (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight">Response Format</h2>
        </div>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          All responses are JSON. Successful responses have this structure:
        </p>

        <CodeBlock code={`{
  "success": true,
  "total": 142,
  "limit": 50,
  "offset": 0,
  "data": [
    {
      "id": "a1b2c3d4-...",
      "name": "Cool SMP",
      "slug": "cool-smp",
      "description": "A fun survival multiplayer server...",
      "type": "server",
      "category": "smp",
      "icon_url": "https://...",
      "banner_url": "https://...",
      "tags": ["survival", "pvp", "economy"],
      "votes": 120,
      "average_rating": 4.5,
      "rating_count": 30,
      "featured": false,
      "website_url": "https://...",
      "discord_url": "https://discord.gg/...",
      "created_at": "2026-01-15T12:00:00Z"
    }
  ]
}`} />

        <h3 className="text-xl font-body font-bold text-white mt-10 mb-5 tracking-tight">Field Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-zinc-400 font-medium py-3 pr-4">Field</th>
                <th className="text-left text-zinc-400 font-medium py-3 pr-4">Type</th>
                <th className="text-left text-zinc-400 font-medium py-3">Description</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {[
                ['id', 'string', 'Unique server ID (UUID)'],
                ['name', 'string', 'Server display name'],
                ['slug', 'string', 'URL-friendly identifier'],
                ['description', 'string', 'Server description (may contain markdown)'],
                ['type', 'string', '"server" or "realm"'],
                ['category', 'string', 'factions, kitpvp, skyblock, smp, modded, other'],
                ['icon_url', 'string?', 'URL to server icon image'],
                ['banner_url', 'string?', 'URL to server banner image'],
                ['tags', 'string[]', 'Array of tag strings'],
                ['votes', 'number', 'Total vote count'],
                ['average_rating', 'number', 'Average star rating (1–5)'],
                ['rating_count', 'number', 'Number of ratings'],
                ['featured', 'boolean', 'Whether the server is featured'],
                ['website_url', 'string?', 'Server website URL'],
                ['discord_url', 'string?', 'Server Discord invite'],
                ['created_at', 'string', 'ISO 8601 timestamp'],
              ].map(([field, type, desc]) => (
                <tr key={field} className="border-b border-white/5">
                  <td className="py-3 pr-4 text-realm-green">{field}</td>
                  <td className="py-3 pr-4 text-zinc-500">{type}</td>
                  <td className="py-3 text-zinc-400 font-sans">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 mt-6 flex gap-4">
          <ShieldCheck className="text-amber-400 flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="text-amber-400 font-body font-bold tracking-tight mb-1 text-sm">Privacy</h4>
            <p className="text-amber-400/80 text-xs md:text-sm">Server IPs, realm codes, ports, and owner information are never included in API responses.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'examples',
    title: 'Code Examples',
    icon: Code2,
    content: (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight">Code Examples</h2>
        </div>

        <h3 className="text-lg font-body font-bold text-white mb-4 tracking-tight">JavaScript / HTML</h3>
        <p className="text-zinc-400 text-sm mb-4">Display servers on your website:</p>
        <CodeBlock code={`<div id="server-list"></div>

<script>
  fetch('${API_BASE}/servers?sort=votes&limit=10')
    .then(res => res.json())
    .then(({ data }) => {
      const container = document.getElementById('server-list')
      container.innerHTML = data.map(server => \`
        <div class="server-card">
          <img src="\${server.icon_url}" alt="\${server.name}" />
          <h3>\${server.name}</h3>
          <p>\${server.description}</p>
          <span>\${server.votes} votes</span>
          <a href="https://realmexplorer.xyz/server/\${server.slug}">
            View on Realm Explorer
          </a>
        </div>
      \`).join('')
    })
</script>`} language="html" />

        <h3 className="text-lg font-body font-bold text-white mt-10 mb-4 tracking-tight">React</h3>
        <CodeBlock code={`import { useState, useEffect } from 'react'

function ServerList() {
  const [servers, setServers] = useState([])

  useEffect(() => {
    fetch('${API_BASE}/servers?sort=votes&limit=10')
      .then(res => res.json())
      .then(data => setServers(data.data))
  }, [])

  return (
    <div>
      {servers.map(server => (
        <div key={server.id}>
          <img src={server.icon_url} alt={server.name} />
          <h3>{server.name}</h3>
          <p>{server.votes} votes</p>
        </div>
      ))}
    </div>
  )
}`} language="jsx" />

        <h3 className="text-lg font-body font-bold text-white mt-10 mb-4 tracking-tight">Python</h3>
        <CodeBlock code={`import requests

response = requests.get('${API_BASE}/servers', params={
    'type': 'realm',
    'sort': 'votes',
    'limit': 10
})

data = response.json()
for server in data['data']:
    print(f"{server['name']} — {server['votes']} votes")`} language="python" />

        <h3 className="text-lg font-body font-bold text-white mt-10 mb-4 tracking-tight">cURL</h3>
        <CodeBlock code={`curl "${API_BASE}/servers?type=realm&sort=votes&limit=10"`} language="bash" />
      </div>
    )
  },
  {
    id: 'attribution',
    title: 'Attribution',
    icon: ArrowRightLeft,
    content: (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight">Attribution & Guidelines</h2>
        </div>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          The Realm Explorer API is free to use. We only ask that you follow these guidelines:
        </p>

        <ul className="space-y-5 text-zinc-400 text-base list-none ml-2 mt-8">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">1</span>
            <div><strong className="text-zinc-200">Credit Realm Explorer.</strong> Include a "Powered by Realm Explorer" link or mention on your page.</div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">2</span>
            <div><strong className="text-zinc-200">Link back.</strong> When displaying servers, link them to their Realm Explorer page: <code className="text-zinc-500 text-xs">https://realmexplorer.xyz/server/{'{slug}'}</code></div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">3</span>
            <div><strong className="text-zinc-200">Don't abuse it.</strong> Avoid polling faster than once per minute. Cache results on your end when possible.</div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-realm-green/20 text-realm-green text-xs font-bold mt-0.5">4</span>
            <div><strong className="text-zinc-200">Don't misrepresent data.</strong> Don't modify server names, vote counts, or other data to mislead users.</div>
          </li>
        </ul>

        <div className="bg-realm-green/10 border border-realm-green/20 rounded-xl p-5 mt-8 flex gap-4">
          <Zap className="text-realm-green flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="text-realm-green font-body font-bold tracking-tight mb-1 text-sm">Questions?</h4>
            <p className="text-realm-green/80 text-xs md:text-sm">Join our <a href="https://discord.gg/G8CyUZjPRt" target="_blank" rel="noopener noreferrer" className="underline hover:text-realm-green transition-colors">Discord server</a> if you have questions or need help integrating the API.</p>
          </div>
        </div>
      </div>
    )
  }
]

export function ApiDocsPage() {
  const [activeSectionId, setActiveSectionId] = useState<string>(apiDocsSections[0].id)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
    window.addEventListener('switch-api-doc-tab', handleSwitchTab)
    return () => window.removeEventListener('switch-api-doc-tab', handleSwitchTab)
  }, [])

  const activeSection = apiDocsSections.find(s => s.id === activeSectionId) || apiDocsSections[0]
  const currentIndex = apiDocsSections.findIndex(s => s.id === activeSectionId)
  
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex !== -1 && currentIndex < apiDocsSections.length - 1

  return (
    <AnimatedPage>
      <MetaTags 
        title="API Documentation - Realm Explorer"
        description="Integrate Realm Explorer's server directory into your own website or tools. Free, open, no API key required."
        url="/api-docs"
      />
      
      <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8 items-start relative min-h-[calc(100vh-200px)]">
        
        {/* Mobile Menu Toggle */}
        <div className="md:hidden w-full flex items-center justify-between mb-4 bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <Code2 size={20} />
            </div>
            <h1 className="font-body font-bold text-white text-lg">API Docs</h1>
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
              <Code2 size={20} />
            </div>
            <h1 className="font-body font-bold text-white text-xl tracking-tight">API Docs</h1>
          </div>

          <nav className="space-y-1">
            {apiDocsSections.map((section) => {
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

          <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              onClick={() => {
                if (hasPrev) {
                  setActiveSectionId(apiDocsSections[currentIndex - 1].id)
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
                  setActiveSectionId(apiDocsSections[currentIndex + 1].id)
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
        </FramerIn>

      </div>
    </AnimatedPage>
  )
}
