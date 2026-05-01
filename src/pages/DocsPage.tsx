import { Book, Compass, Rocket, HelpCircle } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { MetaTags } from '../components/MetaTags'

export function DocsPage() {
  return (
    <AnimatedPage>
      <MetaTags 
        title="Documentation - Realm Explorer"
        description="Learn how to use Realm Explorer, list your servers, and explore the community."
        url="/docs"
      />
      
      <div className="w-full max-w-2xl mx-auto px-4 py-8 md:py-24 flex flex-col items-center">
        <FramerIn className="mb-10 md:mb-16 text-center w-full flex flex-col items-center">
          <div className="inline-flex p-3 rounded-2xl bg-realm-green/10 text-realm-green mb-6">
            <Book size={28} className="md:w-10 md:h-10" />
          </div>
          <h1 className="text-xl sm:text-3xl md:text-5xl font-pixel text-white uppercase tracking-tight mb-4 break-words w-full text-center px-4">
            Documentation
          </h1>
          <p className="text-zinc-500 font-headline text-[10px] sm:text-xs md:text-lg max-w-xs sm:max-w-md mx-auto">
            Everything you need to know about Realm Explorer.
          </p>
        </FramerIn>

        <div className="space-y-8 md:space-y-12 font-headline w-full">
          <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <Rocket className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-lg md:text-2xl font-pixel text-white uppercase tracking-wide text-center w-full">Getting Started</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                Welcome to Realm Explorer! To start listing your servers, you first need to log in using your Discord account.
              </p>
              <div className="flex justify-center w-full">
                <ol className="list-decimal list-inside text-[10px] md:text-xs text-left space-y-2.5">
                  <li>Click the 'Login' button in the navigation bar.</li>
                  <li>Authorize Realm Explorer via Discord.</li>
                  <li>Once logged in, go to your Dashboard to manage your listings.</li>
                </ol>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <Compass className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-lg md:text-2xl font-pixel text-white uppercase tracking-wide text-center w-full">Listing Your Server</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                When submitting a server, make sure to provide accurate information and high-quality images.
              </p>
              <div className="flex justify-center w-full">
                <ul className="list-disc list-inside text-[10px] md:text-xs text-left space-y-2.5">
                  <li><strong>Title:</strong> The name of your server or realm.</li>
                  <li><strong>Category:</strong> Choose the best fit (SMP, KitPvP, Factions, etc.).</li>
                  <li><strong>Description:</strong> Tell players what makes your server unique.</li>
                  <li><strong>Media:</strong> Upload icons and banners to make your listing stand out.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-10 backdrop-blur-sm flex flex-col items-center text-center w-full">
            <div className="w-full flex flex-col items-center justify-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-realm-green/10 flex items-center justify-center">
                <HelpCircle className="text-realm-green w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-lg md:text-2xl font-pixel text-white uppercase tracking-wide text-center w-full">Need Help?</h2>
            </div>
            <div className="text-zinc-400 text-[11px] md:text-sm space-y-4 leading-relaxed max-w-xl w-full">
              <p>
                Can't find what you're looking for? Our Discord community is the best place to ask questions and get help from the team and other creators.
              </p>
            </div>
          </section>
        </div>

        <FramerIn className="mt-16 text-center text-zinc-500 text-xs md:text-sm font-headline">
          <p>We are constantly updating our documentation to better serve the community.</p>
        </FramerIn>
      </div>
    </AnimatedPage>
  )
}
