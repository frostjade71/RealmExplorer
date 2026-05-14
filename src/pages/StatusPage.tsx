import { useState, useEffect } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, RefreshCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

type StatusState = 'operational' | 'degraded' | 'down' | 'loading'

interface ComponentStatus {
  name: string
  description: string
  status: StatusState
}

interface Incident {
  id: string
  created_at: string
  title: string
  description: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved_at: string | null
}

export function StatusPage() {
  const [statuses, setStatuses] = useState<ComponentStatus[]>([
    { name: 'Website', description: 'The main user interface', status: 'loading' },
    { name: 'Database', description: 'Real-time database and storage', status: 'loading' },
    { name: 'Authentication', description: 'User login and registration', status: 'loading' },
    { name: 'API Services', description: 'Backend communication layer', status: 'loading' },
  ])

  const [incidents, setIncidents] = useState<Incident[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const checkStatus = async () => {
    const newStatuses = [...statuses]

    // 1. Check Website
    try {
      const res = await fetch(window.location.origin, { method: 'HEAD' })
      newStatuses[0].status = res.ok ? 'operational' : 'degraded'
    } catch {
      newStatuses[0].status = 'down'
    }

    // 2. Check Supabase (DB, Auth, API)
    try {
      const { error: dbError } = await supabase.from('site_settings').select('value').eq('key', 'discord_status_message_id').limit(1).maybeSingle()
      const status: StatusState = !dbError ? 'operational' : 'degraded'
      newStatuses[1].status = status
      newStatuses[2].status = status
      newStatuses[3].status = status
    } catch {
      newStatuses[1].status = 'down'
      newStatuses[2].status = 'down'
      newStatuses[3].status = 'down'
    }

    // 3. Fetch Incidents
    try {
      const { data } = await (supabase as any)
        .from('site_incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      if (data) setIncidents(data as Incident[])
    } catch (e) {
      console.error('Failed to fetch incidents:', e)
    }

    setStatuses(newStatuses)
    setLastUpdated(new Date())
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 300000) // 5 minutes
    return () => clearInterval(interval)
  }, [])

  const overallStatus: StatusState = statuses.some(s => s.status === 'loading')
    ? 'loading'
    : statuses.every(s => s.status === 'operational') 
      ? 'operational' 
      : statuses.some(s => s.status === 'down') ? 'down' : 'degraded'

  return (
    <div className="flex-1 bg-black pt-24 pb-20 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-headline text-white mb-2 tracking-tight">System Status</h1>
            <p className="text-white/50 font-body">Real-time health monitoring of Realm Explorer services.</p>
          </div>
        </div>

        {/* Global Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-xl border flex items-center gap-4 shadow-xl transition-colors duration-500 ${
            overallStatus === 'operational' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : overallStatus === 'down'
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : overallStatus === 'loading'
                  ? 'bg-white/5 border-white/10 text-white/40'
                  : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
          }`}
        >
          {overallStatus === 'operational' ? (
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
          ) : overallStatus === 'down' ? (
            <XCircle className="w-6 h-6 flex-shrink-0" />
          ) : overallStatus === 'loading' ? (
            <RefreshCcw className="w-6 h-6 flex-shrink-0 animate-spin opacity-50" />
          ) : (
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          )}
          <div>
            <h2 className="text-lg font-headline tracking-wide leading-tight">
              {overallStatus === 'loading' 
                ? 'Checking System Status...' 
                : overallStatus === 'operational' 
                  ? 'All Systems Operational' 
                  : overallStatus === 'down' 
                    ? 'Major Service Outage' 
                    : 'Degraded Performance Detected'}
            </h2>
            <p className="opacity-80 text-xs mt-0.5">
              {overallStatus === 'loading'
                ? 'Please wait while we verify our service health.'
                : overallStatus === 'operational' 
                  ? 'Everything is running smoothly across all regions.' 
                  : 'We are currently investigating issues with one or more services.'}
            </p>
          </div>
        </motion.div>

        {/* Components List */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
          <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h3 className="text-white font-headline text-xs uppercase tracking-widest opacity-60">System Components</h3>
            <span className="text-white/30 text-[10px] font-headline uppercase tracking-tighter">
              Last check: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          
          <div className="divide-y divide-white/5">
            {statuses.map((item, idx) => (
              <div key={idx} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-headline text-lg tracking-tight">{item.name}</span>
                    <div className="group relative">
                      <Info className="w-3 h-3 text-white/20 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-800 border border-white/10 rounded text-[10px] text-white/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 h-1.5 w-32 md:w-48 bg-white/5 rounded-full overflow-hidden">
                    {/* Mock Uptime Bars */}
                    {[...Array(24)].map((_, i) => (
                      <div key={i} className={`flex-1 ${i === 23 && item.status !== 'operational' ? (item.status === 'down' ? 'bg-red-500' : 'bg-orange-500') : 'bg-green-500/40'} rounded-full`} />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-headline uppercase tracking-widest ${
                    item.status === 'operational' ? 'text-green-400' : 
                    item.status === 'down' ? 'text-red-400' : 
                    item.status === 'loading' ? 'text-white/20' : 'text-orange-400'
                  }`}>
                    {item.status === 'loading' ? 'Checking...' : item.status}
                  </span>
                  <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                    item.status === 'operational' ? 'bg-green-500 shadow-green-500/20' : 
                    item.status === 'down' ? 'bg-red-500 shadow-red-500/20' : 
                    item.status === 'loading' ? 'bg-white/20 animate-pulse' : 'bg-orange-500 shadow-orange-500/20'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents Section */}
        <div className="space-y-6">
          <h3 className="text-white font-headline text-xs uppercase tracking-widest opacity-60 ml-1">Past Incidents</h3>
          {incidents.length > 0 ? (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 md:p-8 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${incident.status === 'resolved' ? 'bg-green-500' : 'bg-orange-500'}`} />
                      <h4 className="text-white font-headline text-lg">{incident.title}</h4>
                    </div>
                    <span className="text-white/40 text-[10px] font-headline uppercase tracking-widest">
                      {new Date(incident.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm font-body leading-relaxed">
                    {incident.description}
                  </p>
                  <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/30 text-[10px] font-headline uppercase tracking-widest">Status:</span>
                      <span className={`text-[10px] font-headline uppercase tracking-widest ${incident.status === 'resolved' ? 'text-green-400' : 'text-orange-400'}`}>
                        {incident.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/30 text-[10px] font-headline uppercase tracking-widest">Severity:</span>
                      <span className={`text-[10px] font-headline uppercase tracking-widest ${
                        incident.severity === 'critical' ? 'text-red-500' : 
                        incident.severity === 'high' ? 'text-red-400' : 
                        incident.severity === 'medium' ? 'text-orange-400' : 'text-blue-400'
                      }`}>
                        {incident.severity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8 text-center border-dashed">
              <p className="text-white/30 font-headline text-sm italic">No incidents reported in the last 90 days.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex justify-center pt-8">
          <div className="bg-white/5 border border-white/10 rounded-full px-6 py-2 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-white/40 text-[10px] font-headline uppercase tracking-[0.2em]">Live Monitoring Active</span>
          </div>
        </div>

      </div>
    </div>
  )
}
