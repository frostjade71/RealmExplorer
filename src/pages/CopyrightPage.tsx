import { Copyright, FileText, Mail, Info, AlertTriangle, RefreshCw } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { MetaTags } from '../components/MetaTags'

export function CopyrightPage() {
  return (
    <AnimatedPage>
      <MetaTags 
        title="Copyright Policy - Realm Explorer"
        description="Learn about Realm Explorer's copyright and DMCA policies, including how to report infringement and file counter-notifications."
        url="/copyright"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-24">
        <FramerIn className="mb-10 md:mb-16 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-realm-green/10 text-realm-green mb-6">
            <Copyright size={32} className="md:w-10 md:h-10" />
          </div>
          <h1 className="text-xl sm:text-3xl md:text-5xl font-pixel text-white uppercase tracking-tighter mb-4 px-2">Copyright Policy</h1>
          <p className="text-zinc-500 font-headline text-xs md:text-lg">Last Updated: May 9, 2026</p>
        </FramerIn>

        <div className="space-y-8 md:space-y-12 font-headline w-full">
          {/* Overview */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <Info className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">Overview</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                We take claims of copyright infringement seriously. We will respond to notices of alleged copyright infringement that comply with applicable law. If you believe any materials accessible on or from Realm Explorer (the "Website") infringe your copyright, you may request removal of those materials by submitting written notification to our designated copyright agent.
              </p>
            </div>
          </section>

          {/* DMCA Notice */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full overflow-hidden">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <FileText className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">DMCA Notice</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                In accordance with the Digital Millennium Copyright Act (DMCA), your written notice must include:
              </p>
              <div className="flex justify-center w-full">
                <ul className="list-disc list-inside space-y-2.5 text-[10px] md:text-xs text-left max-w-md">
                  <li>Your physical or electronic signature.</li>
                  <li>Identification of the copyrighted work you believe to have been infringed.</li>
                  <li>Identification of the material you believe to be infringing in a precise manner.</li>
                  <li>Adequate information by which we can contact you (name, address, telephone, email).</li>
                  <li>A statement of good faith belief that use of the material is not authorized.</li>
                  <li>A statement that the information in the notice is accurate.</li>
                  <li>A statement, under penalty of perjury, that you are authorized to act on behalf of the owner.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Designated Agent */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full overflow-hidden">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <Mail className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">Copyright Agent</h2>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-xl p-5 md:p-6 w-full max-w-lg">
              <div className="text-zinc-300 font-headline text-[8px] md:text-xs space-y-1">
                <p>Copyright Manager</p>
                <p>Web Developer | Realm Explorer</p>
                <p>154 Delgado Ave.</p>
                <p>Barugo, Leyte Philippines, 6519</p>
                <p>Email: support@realmexplorer.xyz</p>
                <p>Personal Email: jaderbypenaranda@gmail.com</p>
              </div>
            </div>
            <p className="mt-4 text-zinc-500 text-[10px] md:text-xs italic max-w-md">
              Note: Failure to comply with all requirements of Section 512(c)(3) of the DMCA may render your notice ineffective.
            </p>
          </section>

          {/* Counter Notice */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full overflow-hidden">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <RefreshCw className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">Counter Notice</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                If you believe your content was removed by mistake, you may file a counter-notification including:
              </p>
              <div className="flex justify-center w-full">
                <ul className="list-disc list-inside space-y-2.5 text-[10px] md:text-xs text-left max-w-md">
                  <li>Your physical or electronic signature.</li>
                  <li>Identification of the material that was removed and its original location.</li>
                  <li>Your contact information (name, address, phone, email).</li>
                  <li>A statement under penalty of perjury of good faith belief that removal was a mistake.</li>
                  <li>Consent to the jurisdiction of the Federal District Court and acceptance of service.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Repeat Infringers */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full overflow-hidden">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <AlertTriangle className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-[12px] md:text-2xl font-pixel text-white uppercase tracking-tighter text-center w-full leading-tight">Repeat Infringers</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                It is our policy in appropriate circumstances to disable and/or terminate the accounts of users who are repeat infringers.
              </p>
            </div>
          </section>
        </div>

        <FramerIn className="mt-16 text-center text-zinc-500 text-xs md:text-sm font-headline">
          <p>Questions regarding copyright? Contact us via Discord.</p>
        </FramerIn>
      </div>
    </AnimatedPage>
  )
}
