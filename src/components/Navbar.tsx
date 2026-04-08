import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState, useRef } from 'react'
import { Menu, LogOut, LayoutDashboard, Home, Calendar, Globe, Info, Trophy } from 'lucide-react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { NotificationDropdown } from './NotificationDropdown'
import logo from '../assets/rerealm.webp'

export function Navbar() {
  const { user, profile, signInWithDiscord, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // Reset scroll instantly on path change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const accountMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuOpen && accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const navItems = [
    { label: 'Home', path: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Events', path: '/events', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Leaderboards', path: '/leaderboards', icon: <Trophy className="w-4 h-4" /> },
    { label: 'Servers', path: '/servers', icon: <Globe className="w-4 h-4" /> },
    { label: 'About', path: '/about', icon: <Info className="w-4 h-4" /> },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#1A3D1A]/80 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-green-900/10">
      <div className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-4 group">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-primary-container rounded-lg shadow-inner flex items-center justify-center overflow-hidden"
          >
            <img 
              className="w-full h-full object-cover" 
              alt="RE logo" 
              src={logo} 
            />
          </motion.div>
          <span className="text-xs font-pixel text-white hidden sm:block group-hover:text-realm-green transition-colors">Realm Explorer</span>
        </Link>
        <div className="hidden md:flex items-center gap-2 font-headline text-sm tracking-tight text-white">
          <LayoutGroup id="navbar-nav">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
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
                  <span className={`relative flex items-center gap-2 ${isActive ? 'text-realm-green font-bold' : 'text-white/60 group-hover:text-white font-medium'}`}>
                    {item.icon}
                    {item.label}
                  </span>
                </Link>
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
              className="bg-[#4EC44E] text-on-primary-container px-6 py-2 rounded-lg font-headline font-bold text-sm shadow-lg shadow-green-500/20"
            >
              Login with Discord
            </motion.button>
          ) : (
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <div className="relative" ref={accountMenuRef}>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMenuOpen(!menuOpen)}
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
                  {menuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 flex flex-col gap-1 z-50 overflow-hidden"
                    >
                      <Link 
                        to="/dashboard"
                        onClick={() => setMenuOpen(false)} 
                        className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      {profile?.role === 'admin' && (
                        <Link 
                          to="/admin"
                          onClick={() => setMenuOpen(false)} 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-realm-green hover:bg-zinc-800 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}
                      <button 
                        onClick={() => {
                          setMenuOpen(false)
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
          <button className="md:hidden text-white ml-2 p-2 rounded-lg hover:bg-white/10">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  )
}
