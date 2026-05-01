import { ShieldCheck, Scale, FileText } from 'lucide-react'
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
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-pixel text-white uppercase tracking-tighter mb-4 break-words px-2">Terms of Service</h1>
          <p className="text-zinc-500 font-headline text-xs md:text-lg">Last Updated: May 1, 2026</p>
        </FramerIn>

        <div className="space-y-8 md:space-y-12 font-headline w-full">
          <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <FileText className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-lg md:text-2xl font-pixel text-white uppercase tracking-wide text-center w-full">Acceptance of Terms</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                By accessing and using Realm Explorer, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
              <p>
                We reserve the right to modify these terms at any time. Your continued use of the platform following any changes constitutes acceptance of those changes.
              </p>
            </div>
          </section>

          <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <ShieldCheck className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-lg md:text-2xl font-pixel text-white uppercase tracking-wide text-center w-full">User Conduct</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                Users are responsible for the content they post. Any content that is illegal, offensive, or violates the rights of others is strictly prohibited.
              </p>
              <div className="flex justify-center w-full">
                <ul className="list-disc list-inside text-[10px] md:text-xs text-left space-y-2.5">
                  <li>No spamming or unauthorized advertising.</li>
                  <li>No harassment or abusive behavior towards other community members.</li>
                  <li>No attempts to disrupt the service through technical means.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <Scale className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-lg md:text-2xl font-pixel text-white uppercase tracking-wide text-center w-full">Intellectual Property</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                The Realm Explorer brand, logos, and platform code are the property of Realm Explorer. Minecraft assets used are the property of Mojang Studios.
              </p>
            </div>
          </section>
        </div>

        <FramerIn className="mt-16 text-center text-zinc-500 text-xs md:text-sm font-headline">
          <p>If you have any questions regarding these terms, please contact us on Discord.</p>
        </FramerIn>
      </div>
    </AnimatedPage>
  )
}
