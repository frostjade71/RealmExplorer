import { useGlobalStats, useAdminServers, useAdminUsers, useCategoryRequests } from '../hooks/queries'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn, FramerInList } from '../components/FramerIn'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AlertTriangle, HardDrive, ExternalLink, RefreshCw } from 'lucide-react'

export function AdminOverviewPage() {
  const { profile, isAdmin } = useAuth()
  useGlobalStats()
  const { data: servers = [] } = useAdminServers()
  const { data: catRequests = [] } = useCategoryRequests()
  useAdminUsers()
  
  const [latency, setLatency] = useState<number | null>(null)
  const [dbStatus, setDbStatus] = useState<'online' | 'offline' | 'checking'>('checking')
  const [topFiles, setTopFiles] = useState<any[]>([])
  const [loadingStorage, setLoadingStorage] = useState(false)

  const pendingServers = servers.filter(s => ['pending', 'Review Icon', 'Review Cover', 'Review Icon & Cover', 'Review Gallery', 'Review Icon & Gallery', 'Review Cover & Gallery', 'Review All Assets'].includes(s.status)).length
  const pendingCatRequests = catRequests.filter(r => r.status === 'pending').length
  const totalVotes = servers.reduce((acc, s) => acc + (s.votes || 0), 0)

  const fetchStorageHealth = async () => {
    setLoadingStorage(true)
    try {
      const { data, error } = await supabase.rpc('get_top_storage_consumers' as any)
      if (error) throw error
      setTopFiles((data as any[]) || [])
    } catch (e) {
      console.error('Failed to fetch storage health:', e)
    } finally {
      setLoadingStorage(false)
    }
  }

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
    fetchStorageHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const quickStats = [
    { label: 'Pending Approvals', value: pendingServers, icon: 'pending_actions', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Category Sug.', value: pendingCatRequests, icon: 'add_circle', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
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
          <h1 className="text-3xl md:text-4xl font-pixel text-white mb-4">Welcome, {profile?.discord_username || 'Staff'}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/40 font-headline text-xs md:text-sm max-w-2xl leading-relaxed">
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
            <div className="hidden sm:block text-white/20">|</div>
            <p>
              You have <span className="text-orange-500 font-bold">{pendingServers + pendingCatRequests} tasks</span> to review.
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
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                      {server.icon_url ? (
                        <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-white/20 text-xl">dns</span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{server.name}</div>
                      <div className="text-[10px] text-white/40 font-mono tracking-tighter">
                        {server.type === 'realm' && server.ip_or_code 
                          ? (server.ip_or_code.startsWith('http') ? server.ip_or_code : `https://realms.gg/${server.ip_or_code}`) 
                          : (server.ip_or_code || 'No IP')}
                      </div>
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

        <FramerIn delay={0.5} className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-realm-green/10 to-transparent border border-realm-green/20 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
              <span className="material-symbols-outlined text-[120px]">bolt</span>
            </div>
            <h3 className="font-pixel text-white text-sm mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-realm-green">bolt</span>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link to="/admin/servers" className="flex items-center gap-4 p-4 bg-zinc-950/50 hover:bg-zinc-950 border border-white/5 hover:border-realm-green/30 rounded-2xl transition-all group relative">
                <span className="material-symbols-outlined text-xl text-white/40 group-hover:text-realm-green transition-colors">rule</span>
                <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">Manage Servers</span>
                {pendingServers > 0 && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-orange-500 text-zinc-950 text-[10px] font-pixel px-1.5 py-0.5 rounded-md animate-pulse">
                    {pendingServers}
                  </span>
                )}
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

          {/* Storage Health Audit */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-pixel text-white text-[10px] uppercase tracking-widest flex items-center gap-2">
                <HardDrive className="w-3.5 h-3.5 text-realm-green" />
                Storage Egress Health
              </h3>
              <button 
                onClick={fetchStorageHealth}
                disabled={loadingStorage}
                className="hover:rotate-180 transition-transform duration-500"
              >
                <RefreshCw className={`w-3 h-3 text-white/20 ${loadingStorage ? 'animate-spin text-realm-green' : ''}`} />
              </button>
            </div>
            <div className="p-4 space-y-4">
               {topFiles.length > 0 ? (
                 <div className="space-y-3">
                    {topFiles.map((file, i) => {
                      const isDanger = file.size_kb > 500
                      const isWarning = file.size_kb > 250
                      return (
                        <div key={i} className="flex items-center justify-between group">
                          <div className="flex flex-col min-w-0 flex-1 pr-4">
                            <span className="text-[10px] text-white/60 font-mono truncate">{file.name.split('/').pop()}</span>
                            <div className="flex items-center gap-2 mt-1">
                               <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded leading-none ${
                                 isDanger ? 'bg-red-500 text-white' : 
                                 isWarning ? 'bg-orange-500 text-zinc-950' : 
                                 'bg-zinc-800 text-zinc-400'
                               }`}>
                                 {Math.round(file.size_kb)} KB
                               </span>
                               {isWarning && <AlertTriangle className={`w-3 h-3 ${isDanger ? 'text-red-500' : 'text-orange-500'}`} />}
                            </div>
                          </div>
                          <a 
                            href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${file.bucket_id}/${file.name}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-realm-green hover:text-zinc-950"
                          >
                             <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )
                    })}
                 </div>
               ) : (
                 <div className="py-4 text-center text-white/20 text-[10px] italic">No storage data available.</div>
               )}
               <p className="text-[8px] text-white/20 uppercase tracking-tighter leading-tight mt-4 border-t border-white/5 pt-4">
                 Files {'>'} 250KB hit your egress limits quickly. Convert to WebP and resize images before uploading.
               </p>
            </div>
          </div>
        </FramerIn>
      </div>
    </AnimatedPage>
  )
}
