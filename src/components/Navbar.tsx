import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useGlobalStats } from '../hooks/queries'
import { useEffect, useState, useRef } from 'react'
import { Menu, LogOut, LayoutDashboard, Home, Calendar, Globe, Info, Trophy, ChevronDown, Star, Users, BookOpen, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { NotificationDropdown } from './NotificationDropdown'
import logo from '../assets/rerealm.webp'

export function Navbar() {
  const { user, profile, signInWithDiscord, signOut, isModerator } = useAuth()
  const { data: stats } = useGlobalStats()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Reset scroll instantly on path change
  useEffect(() => {
    window.scrollTo(0, 0)
    setMobileMenuOpen(false) // Close mobile menu on navigation
  }, [location.pathname])

  const accountMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuOpen && accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  const navItems = [
    { label: 'Home', path: '/', icon: <Home className="w-4 h-4" /> },
    { 
      label: 'Events', 
      path: '/events', 
      icon: <Calendar className="w-4 h-4" />,
      children: [
        { label: 'OTM', path: '/events', icon: <Star className="w-4 h-4" /> },
        { label: 'Leaderboards', path: '/leaderboards', icon: <Trophy className="w-4 h-4" /> },
      ]
    },
    { label: 'Servers', path: '/servers', icon: <Globe className="w-4 h-4" /> },
    { 
      label: 'About', 
      path: '/about', 
      icon: <Info className="w-4 h-4" />,
      children: [
        { label: 'Our Team', path: '/team', icon: <Users className="w-4 h-4" /> },
        { label: 'Blog', path: '/blog', icon: <BookOpen className="w-4 h-4" /> },
      ]
    },
  ]

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownTimeoutRef = useRef<number | null>(null)

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) window.clearTimeout(dropdownTimeoutRef.current)
    setActiveDropdown(label)
  }

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = window.setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-[#1A3D1A]/80 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-green-900/10 transition-all">
        <div className="flex justify-between items-center px-8 h-16 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-4 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-primary-container rounded-lg shadow-inner flex items-center justify-center overflow-hidden"
            >
              <img 
                className="w-full h-full object-cover" 
                alt="RE logo" 
                src={logo} 
              />
            </motion.div>
            <span className="text-xs font-pixel text-white hidden sm:block">Realm Explorer</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 font-headline text-sm tracking-tight text-white">
            <LayoutGroup id="navbar-nav">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const hasChildren = item.children && item.children.length > 0
                
                return (
                  <div 
                    key={item.path}
                    className="relative"
                    onMouseEnter={() => hasChildren && handleMouseEnter(item.label)}
                    onMouseLeave={() => hasChildren && handleMouseLeave()}
                  >
                    <Link
                      to={item.path}
                      className="relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors group"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 bg-white/10 rounded-lg"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        />
                      )}
                      <span className={`relative flex items-center gap-2 ${isActive ? 'text-white font-bold' : 'text-white/80 group-hover:text-white font-medium'}`}>
                        {item.icon}
                        {item.label}
                        {hasChildren && (
                          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                        )}
                      </span>
                    </Link>

                    {hasChildren && (
                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute left-0 mt-1 w-40 bg-zinc-900/90 border border-white/5 backdrop-blur-xl rounded-xl shadow-2xl py-2 flex flex-col gap-1 z-50 overflow-hidden"
                          >
                            {item.children?.map((child) => {
                              const isLinkActive = location.pathname === child.path
                              return (
                                <Link 
                                  key={child.path}
                                  to={child.path}
                                  onClick={() => setActiveDropdown(null)}
                                  className={`relative flex items-center gap-3 px-4 py-2 text-sm transition-colors group/child ${
                                    isLinkActive 
                                      ? 'text-white font-bold' 
                                      : 'text-white/80 hover:text-white hover:bg-white/5'
                                  }`}
                                >
                                  {isLinkActive && (
                                    <motion.div
                                      layoutId="nav-active"
                                      className="absolute inset-0 bg-white/10 rounded-lg"
                                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                    />
                                  )}
                                  <span className="relative flex items-center gap-3">
                                    {child.icon}
                                    {child.label}
                                  </span>
                                </Link>
                              )
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                )
              })}
            </LayoutGroup>
          </div>
          <div className="flex items-center gap-4">
            {!user ? (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={signInWithDiscord}
                className="bg-[#5865F2] text-white px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-headline font-bold text-[10px] sm:text-sm shadow-lg shadow-indigo-500/20 flex items-center gap-2"
              >
                <svg 
                  className="w-5 h-5 fill-current" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Login with Discord
              </motion.button>
            ) : (
              <div className="flex items-center gap-3">
                <NotificationDropdown />
                <div className="relative hidden md:block" ref={accountMenuRef}>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (window.innerWidth >= 768) {
                        setUserMenuOpen(!userMenuOpen)
                      }
                    }}
                    className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl transition-colors border border-white/5"
                  >
                    <img 
                      src={profile?.discord_avatar || `https://cdn.discordapp.com/embed/avatars/0.png`} 
                      alt="avatar" 
                      className="w-8 h-8 rounded-full bg-zinc-800"
                    />
                    <span className="text-sm font-headline text-white hidden sm:block">{profile?.discord_username || 'User'}</span>
                  </motion.button>
                  
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 flex flex-col gap-1 z-50 overflow-hidden"
                      >
                        <Link 
                          to={`/profile/${profile?.discord_username}`}
                          onClick={() => setUserMenuOpen(false)} 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                          <Users className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link 
                          to="/dashboard"
                          onClick={() => setUserMenuOpen(false)} 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Your Listings
                        </Link>
                        {isModerator && (
                            <Link 
                              to="/admin"
                              onClick={() => setUserMenuOpen(false)} 
                              className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-zinc-800 transition-colors"
                            >
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                        <button 
                          onClick={() => {
                            setUserMenuOpen(false)
                            signOut()
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 outline-none transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white ml-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] md:hidden"
              style={{ willChange: 'opacity' }}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="fixed right-0 top-0 bottom-0 w-[60%] bg-zinc-950 border-l border-white/10 z-[70] md:hidden flex flex-col shadow-2xl"
              style={{ willChange: 'transform' }}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                  <Link 
                    to="/" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 group"
                  >
                    <img 
                      src={logo} 
                      className="w-8 h-8 rounded-lg shadow-lg border border-white/10" 
                      alt="RE Logo" 
                    />
                  </Link>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                  >
                    <LogOut className="w-5 h-5 rotate-180" />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 flex-grow overflow-y-auto pr-2">
                  {navItems.map((item) => {
                      const isActive = location.pathname === item.path
                      const hasChildren = item.children && item.children.length > 0
                      const isServers = item.label === 'Servers'
                      
                      return (
                       <div key={item.path} className="flex flex-col gap-1">
                         <Link 
                           to={item.path}
                           className={`flex items-center gap-3 px-4 py-2 rounded-lg font-headline text-sm font-bold transition-all ${
                             isActive 
                               ? 'bg-realm-green text-zinc-950 shadow-lg shadow-realm-green/20 scale-[1.02]' 
                               : isServers
                                 ? 'text-realm-green border border-realm-green/30'
                                 : 'text-white/70 hover:text-white hover:bg-white/5'
                           }`}
                         >
                           <span className={`${isActive ? 'text-zinc-950' : 'text-realm-green'} transition-colors`}>
                             {item.icon}
                           </span>
                           {item.label}
                           
                           {isServers && (
                             <span className="ml-auto text-realm-green text-[10px] font-mono font-bold">
                               +{stats?.servers || 0}
                             </span>
                           )}
                         </Link>
                        
                        {hasChildren && (
                          <div className="flex flex-col gap-1 ml-4 border-l border-white/5 pl-2">
                            {item.children?.map(child => (
                               <Link 
                                 key={child.path}
                                 to={child.path}
                                 className={`flex items-center gap-3 px-4 py-2 rounded-lg font-headline text-xs font-semibold transition-all ${location.pathname === child.path ? 'text-realm-green bg-realm-green/10' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                               >
                                {child.icon}
                                {child.label}
                               </Link>
                            ))}
                          </div>
                        )}
                      </div>
                     )
                  })}
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col gap-4 mt-auto">
                  {!user ? (
                     <button 
                       onClick={signInWithDiscord}
                       className="w-full bg-[#5865F2] text-white py-2.5 rounded-lg font-headline font-bold text-xs shadow-lg flex items-center justify-center gap-2 hover:bg-[#4752c4] transition-colors"
                     >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      Login with Discord
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <Link 
                        to={`/profile/${profile?.discord_username}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors group"
                      >
                        <img 
                          src={profile?.discord_avatar || `https://cdn.discordapp.com/embed/avatars/0.png`} 
                          alt="" 
                          className="w-8 h-8 rounded-full border-2 border-realm-green/20"
                        />
                        <div className="flex flex-col overflow-hidden gap-1">
                          <span className="text-white text-xs font-bold truncate group-hover:text-realm-green transition-colors">{profile?.discord_username}</span>
                          <div className="bg-zinc-900 border-t border-l border-white/10 border-r border-b border-black/50 px-1.5 py-0.5 text-realm-green shadow-[1px_1px_0px_rgba(0,0,0,0.4)] w-fit inline-flex items-center">
                            <span className="text-[7px] uppercase font-pixel tracking-[0.1em]">{profile?.role || 'Member'}</span>
                          </div>
                        </div>
                      </Link>
                      
                      <div className={`grid ${isModerator ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                        <Link 
                          to="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex ${isModerator ? 'flex-col items-center justify-center gap-1.5 p-2' : 'items-center gap-3 px-4 py-3'} rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5`}
                        >
                          <LayoutDashboard className="w-4 h-4 text-white/60" />
                          <span className="text-[9px] font-headline font-bold uppercase tracking-widest text-white/40">Listings</span>
                        </Link>
                        {isModerator && (
                            <Link 
                              to="/admin"
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg bg-realm-green/10 hover:bg-realm-green/20 transition-colors border border-realm-green/20"
                            >
                              <ShieldCheck className="w-4 h-4 text-realm-green" />
                              <span className="text-[9px] font-headline font-bold uppercase tracking-widest text-realm-green/60 text-center">Admin Panel</span>
                            </Link>
                        )}
                      </div>

                        <button 
                          onClick={() => {
                            setMobileMenuOpen(false)
                            signOut()
                          }}
                          className="flex w-full items-center justify-center gap-3 px-4 py-2 rounded-lg font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors mt-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
