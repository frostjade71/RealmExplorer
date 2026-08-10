import { useState, useEffect } from 'react'
import { ShieldCheck, Scale, FileText, Zap, Copyright, ShieldAlert, Menu, X, ChevronRight, TrendingUp, Gavel } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { MetaTags } from '../components/MetaTags'

const termsSections = [
  { id: 'acceptance', title: 'Acceptance', icon: FileText },
  { id: 'user-conduct', title: 'User Conduct', icon: ShieldAlert },
  { id: 'voting', title: 'Voting Integrity', icon: TrendingUp },
  { id: 'appeals', title: 'Moderation & Appeals', icon: Gavel },
  { id: 'subscriptions', title: 'Subscriptions', icon: Zap },
  { id: 'ownership', title: 'Ownership', icon: Copyright },
  { id: 'liability', title: 'Liability', icon: ShieldCheck }
]

export function TermsPage() {
  const [activeSectionId, setActiveSectionId] = useState<string>(termsSections[0].id)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visibleEntries = entries.filter(entry => entry.isIntersecting)
      if (visibleEntries.length > 0) {
        const topEntry = visibleEntries.reduce((prev, current) => {
          return (prev.boundingClientRect.top < current.boundingClientRect.top) ? prev : current
        })
        setActiveSectionId(topEntry.target.id)
      }
    }, {
      rootMargin: '-20% 0px -70% 0px'
    })

    termsSections.forEach(section => {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const isMobile = window.innerWidth < 768;
      el.scrollIntoView({ behavior: 'smooth', block: isMobile ? 'end' : 'start' })
    }
  }

  return (
    <AnimatedPage>
      <MetaTags 
        title="Terms of Service - Realm Explorer"
        description="Read the terms of service for using Realm Explorer, the ultimate hub for Minecraft Server and Realm discovery."
        url="/terms"
      />
      
      <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8 items-start relative">
        
        <div className="md:hidden w-full flex items-center justify-between mb-4 bg-zinc-900/50 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <Scale size={20} />
            </div>
            <h1 className="font-body font-bold text-white text-lg">Terms</h1>
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
              <Scale size={20} />
            </div>
            <h1 className="font-body font-bold text-white text-xl tracking-tight">Terms of Service</h1>
          </div>

          <nav className="space-y-1">
            {termsSections.map((section) => {
              const isActive = section.id === activeSectionId
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSectionId(section.id)
                    handleScrollToSection(section.id)
                    setIsMobileMenuOpen(false)
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

        <FramerIn className="w-full md:flex-1 font-headline bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-10 backdrop-blur-sm">
          <div className="mb-10 md:mb-16 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-body font-bold text-white tracking-tight mb-4">Terms of Service</h1>
            <p className="text-zinc-500 font-headline text-xs md:text-lg">Effective Date: August 10, 2026</p>
          </div>

          <div className="w-full">
            
            <div id="acceptance" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Acceptance</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  By using Realm Explorer, you agree to these Terms. If you do not agree, please do not use our services. We may update these terms at any time, and your continued use constitutes acceptance of those changes.
                </p>
              </div>
            </div>

            {/* User Conduct */}
            <div id="user-conduct" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">User Conduct</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  Users are responsible for their content. Prohibited behavior includes:
                </p>
                <div className="w-full ml-2">
                  <ul className="list-disc list-inside">
                    <li className="mb-1">Posting illegal, offensive, or infringing content.</li>
                    <li className="mb-1">Spamming, unauthorized advertising, or harassment.</li>
                    <li className="mb-1">Technical disruption or unauthorized access to our systems.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div id="voting" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Voting Integrity</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  To maintain a fair ranking system, any attempt to manipulate votes through the use of bots, proxies, VPNs, or incentivized third-party voting services is strictly prohibited. We reserve the right to reset votes or permanently remove listings that engage in vote manipulation.
                </p>
              </div>
            </div>

            <div id="appeals" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Moderation & Appeals</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  We reserve the right to suspend or terminate your account or remove your listings at any time for violations of these Terms. If you believe your account was moderated in error, you may submit a request through our official Appeals system. However, all final moderation decisions rest solely with our administrative team.
                </p>
              </div>
            </div>

            <div id="subscriptions" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Subscriptions</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  <strong className="text-zinc-200">Explorer+</strong> is a monthly subscription billed at $2.49 USD (or current stated price). Subscriptions renew automatically every 30 days unless cancelled.
                </p>
                <p className="mb-3">
                  Benefits include increased listing limits, priority exploration, and profile customization. We reserve the right to modify benefits or pricing with notice.
                </p>
                <p className="mb-3">
                  You may cancel at any time via your Dashboard. Refunds are provided on a case-by-case basis by creating a ticket at our <a href="https://discord.com/channels/1258132272419311676/1456663068363718758" target="_blank" rel="noopener noreferrer" className="text-realm-green hover:underline">Support Server</a>.
                </p>
              </div>
            </div>

            {/* Intellectual Property */}
            <div id="ownership" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Ownership</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  Realm Explorer and its original content are owned by the platform operators. Minecraft and related assets are trademarks of <a href="https://www.minecraft.net/en-us/usage-guidelines" target="_blank" rel="noopener noreferrer" className="text-realm-green hover:underline">Mojang Studios</a>. We do not claim ownership over the server content you list, but you grant us a license to display it.
                </p>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div id="liability" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Liability</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  Realm Explorer is provided "as is." We are not liable for any damages arising from your use of the site, including listing removals, service downtime, or interactions with other users.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center text-zinc-500 text-xs md:text-sm font-headline">
            <p>Need help with these terms? Reach out on <a href="https://discord.com/channels/1258132272419311676/1456663068363718758" target="_blank" rel="noopener noreferrer" className="text-realm-green hover:underline">Discord</a>.</p>
          </div>
        </FramerIn>
      </div>
    </AnimatedPage>
  )
}
