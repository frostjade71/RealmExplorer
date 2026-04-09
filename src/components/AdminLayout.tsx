import { useLocation, Link, Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/rerealm.webp'

export function AdminLayout() {
  const location = useLocation()
  const { isAdmin } = useAuth()

  const navItems = [
    { to: '/admin', label: 'Overview', icon: 'dashboard' },
    { to: '/admin/servers', label: 'Manage Servers', icon: 'dns' },
    ...(isAdmin ? [
      { to: '/admin/users', label: 'Manage Users', icon: 'group' },
      { to: '/admin/settings', label: 'Global Settings', icon: 'settings' },
      { to: '/admin/events', label: 'Manage Events', icon: 'event' },
    ] : [])
  ]

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white selection:bg-realm-green selection:text-zinc-950">
      {/* Premium Glass Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-xl p-6 shrink-0 flex flex-col sticky top-0 h-screen z-50">
        <div className="mb-10 px-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-white/5 border border-white/10 rounded overflow-hidden flex items-center justify-center">
              <img src={logo} className="w-full h-full object-cover" alt="" />
            </div>
            <h2 className="text-xl font-pixel tracking-tighter text-white">ADMIN PANEL</h2>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 flex-grow">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-realm-green/10 text-realm-green shadow-[inset_0_0_10px_rgba(133,252,126,0.05)]' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-60 group-hover:opacity-100'}`}>
                  {item.icon}
                </span>
                <span className="font-headline text-sm font-bold tracking-tight">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="ml-auto w-1 h-1 rounded-full bg-realm-green shadow-[0_0_8px_#85fc7e]" 
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="pt-6 border-t border-white/5">
          <Link 
            to="/" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all group"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="font-headline text-xs font-bold uppercase tracking-widest">Back to Site</span>
          </Link>
          <div className="mt-4 px-4 py-2 bg-white/5 border border-white/5 rounded-lg">
            <p className="text-[10px] font-pixel text-white/20 uppercase tracking-widest">System Version</p>
            <p className="text-xs font-headline font-bold text-realm-green">v0.1.1-beta</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen relative overflow-hidden">
        {/* Subtle background decorative element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-realm-green/5 blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-realm-green/5 blur-[100px] -z-10 pointer-events-none" />
        
        <div className="p-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

