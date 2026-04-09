import { useGlobalStats, useAdminServers, useAdminUsers } from '../hooks/queries'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn, FramerInList } from '../components/FramerIn'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function AdminOverviewPage() {
  const { profile, isAdmin } = useAuth()
  useGlobalStats()
  const { data: servers = [] } = useAdminServers()
  useAdminUsers()
  
  const [latency, setLatency] = useState<number | null>(null)
  const [dbStatus, setDbStatus] = useState<'online' | 'offline' | 'checking'>('checking')

  const pendingServers = servers.filter(s => ['pending', 'Review Icon', 'Review Cover', 'Review Icon & Cover'].includes(s.status)).length
  const totalVotes = servers.reduce((acc, s) => acc + (s.votes || 0), 0)

  useEffect(() => {
    const checkHealth = async () => {
      const start = performance.now()
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1)
        if (error) throw error
        setLatency(Math.round(performance.now() - start))
        setDbStatus('online')
      } catch (e) {
        setDbStatus('offline')
        setLatency(null)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const quickStats = [
    { label: 'Pending Approvals', value: pendingServers, icon: 'pending_actions', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Emailed Owners', value: servers.filter(s => s.status === 'emailed').length, icon: 'mail', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Active Listings', value: servers.filter(s => s.status === 'approved').length, icon: 'dns', color: 'text-realm-green', bg: 'bg-realm-green/10' },
    { label: 'Total Influence', value: totalVotes, icon: 'stars', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ]

  return (
    <AnimatedPage>
      <div className="mb-12">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-realm-green text-sm">dashboard</span>
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold text-sm">Staff Dashboard</span>
          </div>
          <h1 className="text-4xl font-pixel text-white mb-4">Welcome, {profile?.discord_username || 'Staff'}</h1>
          <div className="flex items-center gap-4 text-white/40 font-headline text-sm max-w-2xl leading-relaxed">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dbStatus === 'online' ? 'bg-realm-green animate-pulse' : 'bg-red-500'}`} />
              <span className="uppercase tracking-widest text-[10px] font-bold">Database {dbStatus}</span>
            </div>
            {latency !== null && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">speed</span>
                <span className="uppercase tracking-widest text-[10px] font-bold">{latency}ms Response</span>
              </div>
            )}
            <div className="text-white/20">|</div>
            <p>
              You have <span className="text-orange-500 font-bold">{pendingServers} new submissions</span> to review.
            </p>
          </div>
        </FramerIn>
      </div>


      <FramerInList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {quickStats.map((stat, i) => {
          // Map futuristic labels to grounded ones
          const displayLabel = stat.label === 'Total Influence' ? 'Total Votes' : stat.label
          return (
            <div key={i} className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md group hover:border-white/20 transition-all duration-500">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
                <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
              </div>
              <div className="text-2xl font-pixel text-white mb-1">{stat.value.toLocaleString()}</div>
              <div className="text-[10px] font-headline text-white/40 uppercase tracking-widest font-bold">{displayLabel}</div>
            </div>
          )
        })}
      </FramerInList>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <FramerIn delay={0.4} className="lg:col-span-2">
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-pixel text-white text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-realm-green">history</span>
                Recent Submissions
              </h3>
              <Link to="/admin/servers" className="text-[10px] font-headline text-realm-green uppercase font-bold tracking-widest hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {servers.slice(0, 5).map(server => (
                <div key={server.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                      <span className="material-symbols-outlined text-white/20 text-xl">dns</span>
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{server.name}</div>
                      <div className="text-[10px] text-white/40 font-mono tracking-tighter">{server.ip_or_code}</div>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    server.status === 'approved' ? 'bg-realm-green/10 text-realm-green' :
                    server.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                    'bg-orange-500/10 text-orange-500'
                  }`}>
                    {server.status}
                  </div>
                </div>
              ))}
              {servers.length === 0 && (
                <div className="p-12 text-center text-white/20 italic text-sm">No recent server activity found.</div>
              )}
            </div>
          </div>
        </FramerIn>

        <FramerIn delay={0.5}>
          <div className="bg-gradient-to-br from-realm-green/10 to-transparent border border-realm-green/20 rounded-3xl p-8 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
              <span className="material-symbols-outlined text-[120px]">bolt</span>
            </div>
            <h3 className="font-pixel text-white text-sm mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-realm-green">bolt</span>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link to="/admin/servers" className="flex items-center gap-4 p-4 bg-zinc-950/50 hover:bg-zinc-950 border border-white/5 hover:border-realm-green/30 rounded-2xl transition-all group">
                <span className="material-symbols-outlined text-xl text-white/40 group-hover:text-realm-green transition-colors">rule</span>
                <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">Manage Servers</span>
              </Link>
              {isAdmin && (
                <>
                  <Link to="/admin/users" className="flex items-center gap-4 p-4 bg-zinc-950/50 hover:bg-zinc-950 border border-white/5 hover:border-realm-green/30 rounded-2xl transition-all group">
                    <span className="material-symbols-outlined text-xl text-white/40 group-hover:text-realm-green transition-colors">shield_person</span>
                    <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">User Management</span>
                  </Link>
                  <Link to="/admin/settings" className="flex items-center gap-4 p-4 bg-zinc-950/50 hover:bg-zinc-950 border border-white/5 hover:border-realm-green/30 rounded-2xl transition-all group">
                    <span className="material-symbols-outlined text-xl text-white/40 group-hover:text-realm-green transition-colors">settings_input_component</span>
                    <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">General Settings</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </FramerIn>
      </div>
    </AnimatedPage>
  )
}
