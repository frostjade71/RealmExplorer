import { Eye, Shield, Lock, CreditCard, UserCheck, Clock, Database, Cookie, ExternalLink, Globe } from 'lucide-react'
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
          <h1 className="text-xl sm:text-3xl md:text-5xl font-pixel text-white uppercase tracking-tighter mb-4 px-2">Privacy Policy</h1>
          <p className="text-zinc-500 font-headline text-xs md:text-lg">Effective Date: May 5, 2026</p>
        </FramerIn>

        <div className="space-y-8 md:space-y-12 font-headline w-full">
          {/* Information Collection */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <Eye className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">Data Collection</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                We collect information to provide and improve our services. This includes:
              </p>
              <div className="flex justify-center w-full">
                <ul className="list-disc list-inside text-[10px] md:text-xs text-left space-y-2.5">
                  <li><strong>Account Info:</strong> Discord ID, username, and avatar via OAuth.</li>
                  <li><strong>Listing Data:</strong> IP addresses, descriptions, and images you submit.</li>
                  <li><strong>Technical Data:</strong> Browser type, device info, and basic usage logs.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Usage */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <Database className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">How We Use Data</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                Your data is processed based on legitimate interest and to fulfill our services:
              </p>
              <div className="flex justify-center w-full">
                <ul className="list-disc list-inside text-[10px] md:text-xs text-left space-y-2.5">
                  <li>To authenticate your account and manage server listings.</li>
                  <li>To personalize your experience and show relevant content.</li>
                  <li>To prevent abuse, spam, and maintain platform security.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Payment Processing */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <CreditCard className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">Payments</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                For Explorer+ subscriptions, payments are handled by <strong>PayPal</strong>.
              </p>
              <p>
                We share your User ID and transaction details with PayPal to process payments. We <strong>do not</strong> store your credit card or full financial details on our servers.
              </p>
            </div>
          </section>

          {/* Privacy Rights */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <UserCheck className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">Your Rights</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                Under GDPR (EU), CCPA (California), and LGPD (Brazil), you have rights to your data:
              </p>
              <div className="flex justify-center w-full">
                <ul className="list-disc list-inside text-[10px] md:text-xs text-left space-y-2.5">
                  <li><strong>Access:</strong> Request a copy of the data we hold about you.</li>
                  <li><strong>Erasure:</strong> Request that we delete your account and personal data.</li>
                  <li><strong>Portability:</strong> Request a machine-readable copy of your data.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <Clock className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">Retention</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                We retain account data as long as your account is active. Payment transaction records are kept for a minimum of 7 years to comply with financial and tax regulations.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <Cookie className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">Cookies</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                We use cookies to keep you logged in and to track site performance:
              </p>
              <div className="flex justify-center w-full">
                <ul className="list-disc list-inside text-[10px] md:text-xs text-left space-y-2.5">
                  <li><strong>Essential:</strong> Required for login and session management (Supabase).</li>
                  <li><strong>Analytics:</strong> Used to track site visits and speed (Vercel).</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Service Providers */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <ExternalLink className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-wide text-center w-full">Providers</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                We use trusted third-party services to operate Realm Explorer:
              </p>
              <div className="flex justify-center w-full">
                <ul className="list-disc list-inside text-[10px] md:text-xs text-left space-y-2.5">
                  <li><a href="https://discord.com/privacy" target="_blank" className="text-realm-green hover:underline">Discord</a> (Authentication)</li>
                  <li><a href="https://supabase.com/privacy" target="_blank" className="text-realm-green hover:underline">Supabase</a> (Database & Auth)</li>
                  <li><a href="https://vercel.com/legal/privacy-policy" target="_blank" className="text-realm-green hover:underline">Vercel</a> (Hosting & Analytics)</li>
                  <li><a href="https://www.paypal.com/webapps/mpp/ua/privacy-full" target="_blank" className="text-realm-green hover:underline">PayPal</a> (Payments)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Location */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <Globe className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">Storage</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                Realm Explorer is operated from the <strong>United States</strong>. Personal data collected from users globally is transferred to and stored on servers located in the United States. By using the site, you consent to this transfer.
              </p>
            </div>
          </section>

          {/* Security */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <Lock className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">Security</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                We use industry-standard encryption (SSL/TLS) and secure database practices (Supabase) to protect your data. However, no method of transmission over the internet is 100% secure.
              </p>
            </div>
          </section>
        </div>

        <FramerIn className="mt-16 text-center text-zinc-500 text-xs md:text-sm font-headline">
          <p>Questions about your privacy? Contact us via Discord.</p>
        </FramerIn>
      </div>
    </AnimatedPage>
  )
}

