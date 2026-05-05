import { ShieldCheck, Scale, FileText, Zap, RefreshCw, Copyright, ShieldAlert } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { MetaTags } from '../components/MetaTags'

export function TermsPage() {
  return (
    <AnimatedPage>
      <MetaTags 
        title="Terms of Service - Realm Explorer"
        description="Read the terms of service for using Realm Explorer, the ultimate hub for Minecraft Server and Realm discovery."
        url="/terms"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-24">
        <FramerIn className="mb-10 md:mb-16 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-realm-green/10 text-realm-green mb-6">
            <Scale size={32} className="md:w-10 md:h-10" />
          </div>
          <h1 className="text-xl sm:text-3xl md:text-5xl font-pixel text-white uppercase tracking-tighter mb-4 px-2">Terms of Service</h1>
          <p className="text-zinc-500 font-headline text-xs md:text-lg">Effective Date: May 5, 2026</p>
        </FramerIn>

        <div className="space-y-8 md:space-y-12 font-headline w-full">
          {/* Acceptance */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <FileText className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">Acceptance</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                By using Realm Explorer, you agree to these Terms. If you do not agree, please do not use our services. We may update these terms at any time, and your continued use constitutes acceptance of those changes.
              </p>
            </div>
          </section>

          {/* User Conduct */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <ShieldAlert className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">User Conduct</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                Users are responsible for their content. Prohibited behavior includes:
              </p>
              <div className="flex justify-center w-full">
                <ul className="list-disc list-inside text-[10px] md:text-xs text-left space-y-2.5">
                  <li>Posting illegal, offensive, or infringing content.</li>
                  <li>Spamming, unauthorized advertising, or harassment.</li>
                  <li>Technical disruption or unauthorized access to our systems.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Subscriptions */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <Zap className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">Subscriptions</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                <strong>Explorer+</strong> is a monthly subscription billed at $2.99 USD (or current stated price). Subscriptions renew automatically every 30 days unless cancelled.
              </p>
              <p>
                Benefits include increased listing limits, priority exploration, and profile customization. We reserve the right to modify benefits or pricing with notice.
              </p>
            </div>
          </section>

          {/* Cancellation & Refunds */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <RefreshCw className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">Cancellations</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                You may cancel your subscription at any time via your Dashboard. 
              </p>
              <p>
                Refunds are provided on a case-by-case basis by creating a ticket at our <a href="https://discord.com/channels/1258132272419311676/1456663068363718758" target="_blank" rel="noopener noreferrer" className="text-realm-green hover:underline">Support Server</a>.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <Copyright className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">Ownership</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                Realm Explorer and its original content are owned by the platform operators. Minecraft and related assets are trademarks of Mojang Studios. We do not claim ownership over the server content you list, but you grant us a license to display it.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <ShieldCheck className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">Liability</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                Realm Explorer is provided "as is." We are not liable for any damages arising from your use of the site, including listing removals, service downtime, or interactions with other users.
              </p>
            </div>
          </section>
        </div>

        <FramerIn className="mt-16 text-center text-zinc-500 text-xs md:text-sm font-headline">
          <p>Need help with these terms? Reach out on Discord.</p>
        </FramerIn>
      </div>
    </AnimatedPage>
  )
}

