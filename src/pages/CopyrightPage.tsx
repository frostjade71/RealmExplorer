import { useState, useEffect } from 'react'
import { Copyright, FileText, Mail, Info, AlertTriangle, RefreshCw, Menu, X, ChevronRight } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { MetaTags } from '../components/MetaTags'
import { toast } from 'sonner'

const copyrightSections = [
  { id: 'overview', title: 'Overview', icon: Info },
  { id: 'dmca-notice', title: 'DMCA Notice', icon: FileText },
  { id: 'copyright-agent', title: 'Copyright Agent', icon: Mail },
  { id: 'counter-notice', title: 'Counter Notice', icon: RefreshCw },
  { id: 'repeat-infringers', title: 'Repeat Infringers', icon: AlertTriangle }
]

export function CopyrightPage() {
  const [activeSectionId, setActiveSectionId] = useState<string>(copyrightSections[0].id)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const email = 'support@realmexplorer.xyz'
    navigator.clipboard.writeText(email)
    toast.success('Email Copied', {
      description: 'The email address has been copied to your clipboard.'
    })
  }

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

    copyrightSections.forEach(section => {
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
        title="Copyright Policy - Realm Explorer"
        description="Learn about Realm Explorer's copyright and DMCA policies, including how to report infringement and file counter-notifications."
        url="/copyright"
      />
      
      <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8 items-start relative">
        
        <div className="md:hidden w-full flex items-center justify-between mb-4 bg-zinc-900/50 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <Copyright size={20} />
            </div>
            <h1 className="font-body font-bold text-white text-lg">Copyright Policy</h1>
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
              <Copyright size={20} />
            </div>
            <h1 className="font-body font-bold text-white text-xl tracking-tight">Copyright Policy</h1>
          </div>

          <nav className="space-y-1">
            {copyrightSections.map((section) => {
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
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-body font-bold text-white tracking-tight mb-4">Copyright Policy</h1>
            <p className="text-zinc-500 font-headline text-xs md:text-lg">Last Updated: May 9, 2026</p>
          </div>

          <div className="w-full">
            
            <div id="overview" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Overview</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  We take claims of copyright infringement seriously. We will respond to notices of alleged copyright infringement that comply with applicable law. If you believe any materials accessible on or from Realm Explorer (the "Website") infringe your copyright, you may request removal of those materials by submitting written notification to our designated copyright agent.
                </p>
              </div>
            </div>

            <div id="dmca-notice" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">DMCA Notice</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  In accordance with the Digital Millennium Copyright Act (DMCA), your written notice must include:
                </p>
                <div className="w-full ml-2">
                  <ul className="list-disc list-inside">
                    <li className="mb-1">Your physical or electronic signature.</li>
                    <li className="mb-1">Identification of the copyrighted work you believe to have been infringed.</li>
                    <li className="mb-1">Identification of the material you believe to be infringing in a precise manner.</li>
                    <li className="mb-1">Adequate information by which we can contact you (name, address, telephone, email).</li>
                    <li className="mb-1">A statement of good faith belief that use of the material is not authorized.</li>
                    <li className="mb-1">A statement that the information in the notice is accurate.</li>
                    <li className="mb-1">A statement, under penalty of perjury, that you are authorized to act on behalf of the owner.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div id="copyright-agent" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Copyright Agent</h2>
              <div className="bg-black/40 border border-white/5 rounded-xl p-5 md:p-6 w-full max-w-lg mb-4">
                <div className="text-zinc-300 font-headline text-sm space-y-1">
                  <p>Copyright Manager</p>
                  <p>Web Developer | Realm Explorer</p>
                  <p>154 Delgado Ave.</p>
                  <p>Barugo, Leyte Philippines, 6519</p>
                  <p>Email: <a href="mailto:support@realmexplorer.xyz" onClick={handleEmailClick} className="text-realm-green hover:underline">support@realmexplorer.xyz</a></p>
                </div>
              </div>
              <p className="text-zinc-500 text-xs md:text-sm italic">
                Note: Failure to comply with all requirements of Section 512(c)(3) of the DMCA may render your notice ineffective.
              </p>
            </div>

            <div id="counter-notice" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Counter Notice</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  If you believe your content was removed by mistake, you may file a counter-notification including:
                </p>
                <div className="w-full ml-2">
                  <ul className="list-disc list-inside">
                    <li className="mb-1">Your physical or electronic signature.</li>
                    <li className="mb-1">Identification of the material that was removed and its original location.</li>
                    <li className="mb-1">Your contact information (name, address, phone, email).</li>
                    <li className="mb-1">A statement under penalty of perjury of good faith belief that removal was a mistake.</li>
                    <li className="mb-1">Consent to the jurisdiction of the Federal District Court and acceptance of service.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Repeat Infringers */}
            <div id="repeat-infringers" className="w-full mb-8 md:mb-16 scroll-mt-40 md:scroll-mt-32">
              <h2 className="text-2xl md:text-3xl font-body font-bold text-white tracking-tight mb-3">Repeat Infringers</h2>
              <div className="text-zinc-400 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-3">
                  It is our policy in appropriate circumstances to disable and/or terminate the accounts of users who are repeat infringers.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center text-zinc-500 text-xs md:text-sm font-headline">
            <p>Questions regarding copyright? Contact us via <a href="https://discord.com/channels/1258132272419311676/1456663068363718758" target="_blank" rel="noopener noreferrer" className="text-realm-green hover:underline">Discord</a>.</p>
          </div>
        </FramerIn>
      </div>
    </AnimatedPage>
  )
}
