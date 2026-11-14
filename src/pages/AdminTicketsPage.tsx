import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import maintenanceGif from '../assets/maintenance/maintenance.gif'

export function AdminTicketsPage() {
  return (
    <AnimatedPage>
      <div className="mb-8">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-white/40 text-base">confirmation_number</span>
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold text-sm">Moderation</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">Manage Tickets</h1>
          <p className="text-white/40 font-headline text-sm max-w-xl">
            Review user inquiries, support tickets, and moderation requests.
          </p>
        </FramerIn>
      </div>

      <FramerIn delay={0.1}>
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl pt-4 sm:pt-6 pb-12 px-6 flex flex-col items-center text-center min-h-[420px]">
          <div className="w-52 h-52 sm:w-64 sm:h-64 mb-3 flex items-center justify-center">
            <img 
              src={maintenanceGif} 
              alt="Under Maintenance" 
              className="w-full h-full object-contain select-none pointer-events-none"
            />
          </div>
          <h2 className="text-lg font-pixel text-white mb-2">Tickets will be built soon</h2>
          <p className="text-xs font-headline text-white/40 max-w-xs">
            This page is currently in development. Stay tuned.
          </p>
        </div>
      </FramerIn>
    </AnimatedPage>
  )
}
