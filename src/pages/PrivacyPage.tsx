import { useState, useEffect } from 'react'
import { Eye, Shield, Lock, CreditCard, UserCheck, Clock, Database, Cookie, ExternalLink, Globe, Menu, X, ChevronRight } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { MetaTags } from '../components/MetaTags'

const privacySections = [
  { id: 'data-collection', title: 'Data Collection', icon: Eye },
  { id: 'data-usage', title: 'How We Use Data', icon: Database },
  { id: 'payments', title: 'Payments', icon: CreditCard },
  { id: 'your-rights', title: 'Your Rights', icon: UserCheck },
  { id: 'retention', title: 'Retention', icon: Clock },
  { id: 'cookies', title: 'Cookies', icon: Cookie },
  { id: 'providers', title: 'Providers', icon: ExternalLink },
  { id: 'storage', title: 'Storage', icon: Globe },
  { id: 'security', title: 'Security', icon: Lock }
]

export function PrivacyPage() {
  const [activeSectionId, setActiveSectionId] = useState<string>(privacySections[0].id)
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

    privacySections.forEach(section => {
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
        title="Privacy Policy - Realm Explorer"
        description="Learn how Realm Explorer handles your data and protects your privacy."
        url="/privacy"
      />
      
      <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8 items-start relative">
        
        {/* Mobile Menu Toggle */}
        <div className="md:hidden w-full flex items-center justify-between mb-4 bg-zinc-900/50 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <Shield size={20} />
            </div>
            <h1 className="font-body font-bold text-white text-lg">Privacy Policy</h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <aside className={`
          w-full md:w-64 lg:w-72 flex-shrink-0 flex flex-col gap-2 font-headline
          ${isMobileMenuOpen ? 'block' : 'hidden'} md:block
          md:sticky md:top-24
        `}>
          <div className="hidden md:flex items-center gap-3 mb-8 px-2">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <Shield size={20} />
            </div>
            <h1 className="font-body font-bold text-white text-xl tracking-tight">Privacy Policy</h1>
          </div>

          <nav className="space-y-1">
            {privacySections.map((section) => {
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
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-body font-bold text-white tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-zinc-500 font-headline text-xs md:text-lg">Effective Date: May 5, 2026</p>
          </div>

          <div className="w-full">
            
            <div id="data-collection" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Data Collection</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  We collect information to provide and improve our services. This includes:
                </p>
                <div className="w-full ml-2">
                  <ul className="list-disc list-inside">
                    <li className="mb-1"><strong>Account Info:</strong> Discord ID, username, and avatar via OAuth.</li>
                    <li className="mb-1"><strong>Listing Data:</strong> IP addresses, descriptions, and images you submit.</li>
                    <li className="mb-1"><strong>Technical Data:</strong> Browser type, device info, and basic usage logs.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div id="data-usage" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">How We Use Data</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  Your data is processed based on legitimate interest and to fulfill our services:
                </p>
                <div className="w-full ml-2">
                  <ul className="list-disc list-inside">
                    <li className="mb-1">To authenticate your account and manage server listings.</li>
                    <li className="mb-1">To personalize your experience and show relevant content.</li>
                    <li className="mb-1">To prevent abuse, spam, and maintain platform security.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div id="payments" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Payments</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  For Explorer+ subscriptions, payments are handled by <strong>PayPal</strong>.
                </p>
                <p className="mb-3">
                  We share your User ID and transaction details with PayPal to process payments. We <strong>do not</strong> store your credit card or full financial details on our servers.
                </p>
              </div>
            </div>

            <div id="your-rights" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Your Rights</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  Under <a href="https://gdpr.eu/tag/gdpr/" target="_blank" rel="noopener noreferrer" className="text-realm-green hover:underline">GDPR (EU)</a>, <a href="https://oag.ca.gov/privacy/ccpa" target="_blank" rel="noopener noreferrer" className="text-realm-green hover:underline">CCPA (California)</a>, and <a href="https://lgpd-brazil.info/" target="_blank" rel="noopener noreferrer" className="text-realm-green hover:underline">LGPD (Brazil)</a>, you have rights to your data:
                </p>
                <div className="w-full ml-2">
                  <ul className="list-disc list-inside">
                    <li className="mb-1"><strong>Access:</strong> Request a copy of the data we hold about you.</li>
                    <li className="mb-1"><strong>Erasure:</strong> Request that we delete your account and personal data.</li>
                    <li className="mb-1"><strong>Portability:</strong> Request a machine-readable copy of your data.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div id="retention" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Retention</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  We retain account data as long as your account is active. Payment transaction records are kept for a minimum of 7 years to comply with financial and tax regulations.
                </p>
              </div>
            </div>

            <div id="cookies" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Cookies</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  We use cookies to keep you logged in and to track site performance:
                </p>
                <div className="w-full ml-2">
                  <ul className="list-disc list-inside">
                    <li className="mb-1"><strong>Essential:</strong> Required for login and session management (Supabase).</li>
                    <li className="mb-1"><strong>Analytics:</strong> Used to track site visits and speed (Vercel).</li>
                  </ul>
                </div>
              </div>
            </div>

            <div id="providers" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Providers</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  We use trusted third-party services to operate Realm Explorer:
                </p>
                <div className="w-full ml-2">
                  <ul className="list-disc list-inside">
                    <li className="mb-1"><a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer" className="text-realm-green hover:underline">Discord</a> (Authentication)</li>
                    <li className="mb-1"><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-realm-green hover:underline">Supabase</a> (Database & Auth)</li>
                    <li className="mb-1"><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-realm-green hover:underline">Vercel</a> (Hosting & Analytics)</li>
                    <li className="mb-1"><a href="https://www.paypal.com/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener noreferrer" className="text-realm-green hover:underline">PayPal</a> (Payments)</li>
                    <li className="mb-1"><a href="https://mcsrvstat.us/" target="_blank" rel="noopener noreferrer" className="text-realm-green hover:underline">mcsrvstat.us</a> (Minecraft Server Status API)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div id="storage" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Storage</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  Realm Explorer is operated from the <strong>United States</strong>. Personal data collected from users globally is transferred to and stored on servers located in the United States. By using the site, you consent to this transfer.
                </p>
              </div>
            </div>

            <div id="security" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Security</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  We use industry-standard encryption (SSL/TLS) and secure database practices (Supabase) to protect your data. However, no method of transmission over the internet is 100% secure.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center text-zinc-500 text-xs md:text-sm font-headline">
            <p>Questions about your privacy? Contact us via <a href="https://discord.com/channels/1258132272419311676/1456663068363718758" target="_blank" rel="noopener noreferrer" className="text-realm-green hover:underline">Discord</a>.</p>
          </div>
        </FramerIn>
      </div>
    </AnimatedPage>
  )
}
