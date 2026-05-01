import { Eye, Shield, Lock, Fingerprint } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { MetaTags } from '../components/MetaTags'

export function PrivacyPage() {
  return (
    <AnimatedPage>
      <MetaTags 
        title="Privacy Policy - Realm Explorer"
        description="Learn how Realm Explorer handles your data and protects your privacy."
        url="/privacy"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-24">
        <FramerIn className="mb-10 md:mb-16 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-realm-green/10 text-realm-green mb-6">
            <Shield size={32} className="md:w-10 md:h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-pixel text-white uppercase tracking-tighter mb-4 break-words px-2">Privacy Policy</h1>
          <p className="text-zinc-500 font-headline text-xs md:text-lg">Last Updated: May 1, 2026</p>
        </FramerIn>

        <div className="space-y-8 md:space-y-12 font-headline w-full">
          <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <Eye className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-lg md:text-2xl font-pixel text-white uppercase tracking-wide text-center w-full">Information We Collect</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                We collect information to provide better services to all our users. The types of information we collect include:
              </p>
              <div className="flex justify-center w-full">
                <ul className="list-disc list-inside text-[10px] md:text-xs text-left space-y-2.5">
                  <li><strong>Account Information:</strong> Discord ID, username, and avatar for authentication.</li>
                  <li><strong>Usage Data:</strong> Information about how you interact with our platform.</li>
                  <li><strong>Server Data:</strong> Information you provide when submitting a server listing.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <Lock className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-lg md:text-2xl font-pixel text-white uppercase tracking-wide text-center w-full">How We Use Data</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                We use the data we collect to:
              </p>
              <div className="flex justify-center w-full">
                <ul className="list-disc list-inside text-[10px] md:text-xs text-left space-y-2.5">
                  <li>Maintain and improve our services.</li>
                  <li>Personalize your experience on Realm Explorer.</li>
                  <li>Communicate with you regarding your account or listings.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <Fingerprint className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-lg md:text-2xl font-pixel text-white uppercase tracking-wide text-center w-full">Security</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                We prioritize the security of your data. We use industry-standard encryption and security measures to protect your information from unauthorized access.
              </p>
            </div>
          </section>
        </div>

        <FramerIn className="mt-16 text-center text-zinc-500 text-xs md:text-sm font-headline">
          <p>Your privacy is important to us. If you have concerns, please reach out via Discord.</p>
        </FramerIn>
      </div>
    </AnimatedPage>
  )
}
