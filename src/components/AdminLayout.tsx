import { useLocation, Link, Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useAdminServers, useCategoryRequests, useReports } from '../hooks/queries'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import logo from '../assets/rerealm.webp'

export function AdminLayout() {
  const location = useLocation()
  const { isAdmin } = useAuth()
  const { data: servers = [] } = useAdminServers()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])
  const { data: catRequests = [] } = useCategoryRequests()

  const needsReviewCount = servers.filter(s => 
    ['pending', 'Review Icon', 'Review Cover', 'Review Icon & Cover', 'Review Gallery', 'Review Icon & Gallery', 'Review Cover & Gallery', 'Review All Assets'].includes(s.status)
  ).length

  const pendingCatRequestsCount = catRequests.filter(r => r.status === 'pending').length
  const { data: reports = [] } = useReports()
  const pendingReportsCount = reports.filter(r => r.status === 'pending' || r.status === 'reviewing').length

  const navItems = [
    { to: '/admin', label: 'Overview', icon: 'dashboard' },
    { 
      to: '/admin/servers', 
      label: 'Manage Servers', 
      icon: 'dns',
      indicatorCount: needsReviewCount 
    },
    { 
      to: '/admin/reports', 
      label: 'Manage Reports', 
      icon: 'flag',
      indicatorCount: pendingReportsCount 
    },
    { to: '/admin/blog', label: 'Manage Blog', icon: 'article' },
    ...(isAdmin ? [
      { to: '/admin/users', label: 'Manage Users', icon: 'group' },
      { to: '/admin/events', label: 'Manage Events', icon: 'event' },
      { 
        to: '/admin/category-requests', 
        label: 'Category Requests', 
        icon: 'add_circle',
        indicatorCount: pendingCatRequestsCount
      },
      { to: '/admin/about', label: 'Edit About', icon: 'edit_note' },
      { to: '/admin/settings', label: 'Global Settings', icon: 'settings' },
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: 'history' },
    ] : [])
  ]

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white selection:bg-realm-green selection:text-zinc-950">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Premium Glass Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 border-r border-white/5 bg-black/40 backdrop-blur-xl p-6 shrink-0 flex flex-col z-[70] transition-transform duration-500 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
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
                {item.indicatorCount && item.indicatorCount > 0 ? (
                  <span className="ml-auto bg-orange-500 text-zinc-950 text-[10px] font-pixel px-1.5 py-0.5 rounded-md animate-pulse shadow-lg shadow-orange-500/20">
                    {item.indicatorCount}
                  </span>
                ) : null}
                {isActive && (!item.indicatorCount || item.indicatorCount === 0) && (
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
            <p className="text-xs font-headline font-bold text-realm-green">v0.9.6-RC</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto relative scrollbar-thin">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/5 border border-white/10 rounded overflow-hidden flex items-center justify-center">
              <img src={logo} className="w-full h-full object-cover" alt="" />
            </div>
            <h2 className="text-lg font-pixel tracking-tighter text-white">ADMIN</h2>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Subtle background decorative element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-realm-green/5 blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-realm-green/5 blur-[100px] -z-10 pointer-events-none" />
        
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait" onExitComplete={() => { 
            const doScroll = () => {
              window.scrollTo(0, 0); 
              document.documentElement.scrollTop = 0; 
              document.body.scrollTop = 0;
              const root = document.getElementById('root');
              if (root) root.scrollTop = 0;
            };
            doScroll();
            setTimeout(doScroll, 50);
            setTimeout(doScroll, 150);
          }}>
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

