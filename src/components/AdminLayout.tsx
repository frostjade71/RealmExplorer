import { useLocation, Link, Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useAdminServers, useAdminProjects, useCategoryRequests, useReports, useServerAppeals } from '../hooks/queries'
import { useBanAppeals } from '../hooks/appeals'
import { useState, useEffect, useRef } from 'react'
import logo from '../assets/rerealm.webp'
import { RoleBadge } from './RoleBadge'

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="font-mono text-[11px] text-white/30 tabular-nums">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  )
}

export function AdminLayout() {
  const location = useLocation()
  const { isAdmin, profile } = useAuth()
  const { data: servers = [] } = useAdminServers()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  const { data: catRequests = [] } = useCategoryRequests()
  const { data: appeals = [] } = useServerAppeals('pending')
  const { data: allBanAppeals = [] } = useBanAppeals()
  const banAppeals = allBanAppeals.filter((a: any) => a.status === 'pending')

  const needsReviewCount = servers.filter(s =>
    ['pending', 'Review Icon', 'Review Cover', 'Review Icon & Cover', 'Review Gallery', 'Review Icon & Gallery', 'Review Cover & Gallery', 'Review All Assets'].includes(s.status)
  ).length + appeals.length

  const pendingCatRequestsCount = catRequests.filter(r => r.status === 'pending').length
  const { data: reports = [] } = useReports()
  const pendingReportsCount = reports.filter(r => r.status === 'pending' || r.status === 'reviewing').length
  const { data: projects = [] } = useAdminProjects()
  const pendingProjectsCount = projects.filter(p => p.status === 'pending').length

  const totalPending = needsReviewCount + pendingReportsCount + banAppeals.length + pendingCatRequestsCount + pendingProjectsCount

  const navSections = [
    {
      label: 'Overview',
      items: [
        { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
      ]
    },
    {
      label: 'Moderation',
      items: [
        {
          to: '/admin/servers',
          label: 'Manage Servers',
          icon: 'dns',
          indicatorCount: needsReviewCount
        },
        {
          to: '/admin/projects',
          label: 'Manage Projects',
          icon: 'inventory_2',
          indicatorCount: pendingProjectsCount
        },
        {
          to: '/admin/reports',
          label: 'Manage Reports',
          icon: 'flag',
          indicatorCount: pendingReportsCount
        },
        {
          to: '/admin/appeals',
          label: 'Ban Appeals',
          icon: 'gavel',
          indicatorCount: banAppeals.length
        },
        { to: '/admin/blog', label: 'Manage Blog', icon: 'article' },
      ]
    },
    ...(isAdmin ? [{
      label: 'Admin',
      items: [
        { to: '/admin/users', label: 'Manage Users', icon: 'group' },
        { to: '/admin/events', label: 'Manage OTM', icon: 'event' },
        { to: '/admin/badges', label: 'Badges', icon: 'military_tech' },
        {
          to: '/admin/category-requests',
          label: 'Category Requests',
          icon: 'add_circle',
          indicatorCount: pendingCatRequestsCount
        },
        { to: '/admin/about', label: 'Edit About', icon: 'edit_note' },
        { to: '/admin/settings', label: 'Global Settings', icon: 'settings' },
        { to: '/admin/audit-logs', label: 'Audit Logs', icon: 'history' },
      ]
    }] : [])
  ]

  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white selection:bg-realm-green selection:text-zinc-950 relative overflow-hidden">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 border-r border-white/10 bg-white/[0.02] backdrop-blur-2xl px-4 py-6 shrink-0 flex flex-col z-[70] transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header — Logo + User */}
        <div className="mb-8 px-1">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
              <img src={logo} className="w-full h-full object-cover" alt="" />
            </div>
            <div>
              <h2 className="text-sm font-pixel tracking-tighter text-white leading-none">PANEL</h2>
              <p className="text-[9px] text-white/30 font-headline uppercase tracking-widest mt-0.5">Admin Control</p>
            </div>
          </div>

          {/* User identity card */}
          {profile && (
            <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-xl">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/5">
                {profile.discord_avatar ? (
                  <img
                    src={profile.discord_avatar}
                    alt={profile.discord_username || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-white/20 text-sm">person</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 flex items-center">
                <RoleBadge role={profile.role} />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-5 flex-grow overflow-y-auto scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-[9px] font-headline font-bold uppercase tracking-[0.2em] text-white/20 px-4 mb-2">
                {section.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const isActive = item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to)
                  const indicatorCount = (item as any).indicatorCount
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group mx-1.5 ${
                        isActive
                          ? 'bg-white/5 text-white'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {/* Active left border */}
                      {isActive && (
                        <div
                          className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-realm-green rounded-r-md"
                        />
                      )}
                      <span className={`material-symbols-outlined text-[17px] shrink-0 transition-all duration-200 ${
                        isActive ? 'text-white opacity-100' : 'opacity-50 group-hover:opacity-100'
                      }`}>
                        {item.icon}
                      </span>
                      <span className="font-headline text-[12px] font-bold tracking-tight truncate flex-1">{item.label}</span>
                      {indicatorCount && indicatorCount > 0 ? (
                        <span className="shrink-0 bg-orange-500 text-zinc-950 text-[9px] font-pixel px-1.5 py-0.5 rounded-md shadow-lg">
                          {indicatorCount}
                        </span>
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="pt-5 border-t border-white/5 mt-4">
          {/* Pending queue summary */}
          {totalPending > 0 && (
            <div className="mb-3 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500 text-[14px]">priority_high</span>
              <span className="text-[10px] font-headline font-bold text-orange-400">
                {totalPending} item{totalPending !== 1 ? 's' : ''} need attention
              </span>
            </div>
          )}

          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all group mb-3 mx-1.5"
          >
            <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            <span className="font-headline text-[10px] font-bold uppercase tracking-widest">Back to Site</span>
          </Link>

          <div className="px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-[9px] font-pixel text-white/20 uppercase tracking-widest">Version</p>
              <p className="text-[10px] font-headline font-bold text-realm-green mt-0.5">v2.0.0</p>
            </div>
            <LiveClock />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main ref={mainRef} className="flex-1 min-w-0 h-[100dvh] lg:h-screen overflow-y-auto relative scrollbar-thin main-scrollbar">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white/[0.02] backdrop-blur-2xl border-b border-white/10 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white/5 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center">
              <img src={logo} className="w-full h-full object-cover" alt="" />
            </div>
            <h2 className="text-sm font-pixel tracking-tighter text-white">ADMIN</h2>
          </div>
          <div className="flex items-center gap-2">
            {totalPending > 0 && (
              <span className="bg-orange-500 text-zinc-950 text-[9px] font-pixel px-1.5 py-0.5 rounded-md">{totalPending}</span>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">{isSidebarOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
