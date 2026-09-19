import { useGlobalStats, useAdminServers, useAdminUsers, useCategoryRequests, useReports, useAdminProjects, useServerAppeals, useVoteLogs } from '../hooks/queries'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn, FramerInList } from '../components/FramerIn'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { useBanAppeals } from '../hooks/appeals'
import { motion } from 'framer-motion'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend } from 'chart.js'

ChartJS.register(ArcElement, ChartTooltip, ChartLegend)

function StatCard({
  label,
  value,
  icon,
  color,
  borderColor,
  linkTo,
  changeCount,
  changeColor = 'text-realm-green',
  changeLabel = 'Last Week',
}: {
  label: string
  value: number
  icon: string
  color: string
  bg?: string
  borderColor?: string
  linkTo?: string
  changeCount?: number | string
  changeColor?: string
  changeLabel?: string
}) {
  const content = (
    <div className="relative overflow-hidden h-full">
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4`}>
          <span className={`material-symbols-outlined text-[20px] ${color}`}>{icon}</span>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-3xl font-headline font-bold text-white leading-none mb-2">{value.toLocaleString()}</div>
            <div className="text-[9px] font-headline font-bold text-white/40 uppercase tracking-[0.15em]">{label}</div>
          </div>
          {changeCount !== undefined && (
            <span className="text-[10px] font-headline font-semibold shrink-0 mb-1 whitespace-nowrap">
              <span className={changeColor}>+{changeCount}</span>{' '}
              <span className="text-white/40">{changeLabel}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )

  const baseClass = `relative isolate p-5 rounded-2xl transition-all duration-300 group cursor-default h-full ${borderColor}`

  if (linkTo) {
    return (
      <Link to={linkTo} className={`${baseClass} hover:scale-[1.02] block`}>
        {content}
      </Link>
    )
  }
  return <div className={baseClass}>{content}</div>
}

export function AdminOverviewPage() {
  const navigate = useNavigate()
  const { profile, isAdmin } = useAuth()
  useGlobalStats()
  const { data: servers = [] } = useAdminServers()
  const { data: catRequests = [] } = useCategoryRequests()
  const { data: reports = [] } = useReports()
  const { data: projects = [] } = useAdminProjects()
  const { data: appeals = [] } = useServerAppeals('pending')
  const { data: allBanAppeals = [] } = useBanAppeals()
  const { data: voteLogs = [] } = useVoteLogs()
  useAdminUsers()

  const banAppeals = allBanAppeals.filter((a: any) => a.status === 'pending')

  const [latency, setLatency] = useState<number | null>(null)
  const [dbStatus, setDbStatus] = useState<'online' | 'offline' | 'checking'>('checking')
  const [topFiles, setTopFiles] = useState<any[]>([])
  const [loadingStorage, setLoadingStorage] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const pendingServers = servers.filter(s =>
    ['pending', 'Review Icon', 'Review Cover', 'Review Icon & Cover', 'Review Gallery', 'Review Icon & Gallery', 'Review Cover & Gallery', 'Review All Assets'].includes(s.status)
  ).length + appeals.length

  const pendingCatRequests = catRequests.filter(r => r.status === 'pending').length
  const pendingReports = reports.filter(r => r.status === 'pending' || r.status === 'reviewing').length
  const pendingProjects = projects.filter(p => p.status === 'pending').length
  const totalVotes = servers.reduce((acc, s) => acc + (s.votes || 0), 0)
  const approvedServers = servers.filter(s => s.status === 'approved').length
  const totalPendingActions = pendingServers + pendingCatRequests + pendingReports + banAppeals.length + pendingProjects

  const fetchTopUploaders = async (showToast = false) => {
    setLoadingStorage(true)
    try {
      const { data, error } = await supabase.rpc('get_top_uploaders' as any)
      if (error) {
        // Fallback: Aggregate server uploads by owner
        const { data: serverUploads, error: serverErr } = await supabase
          .from('servers')
          .select('owner_id, owner_name, profiles(discord_username)')
        
        if (serverErr) throw serverErr
        
        if (serverUploads && serverUploads.length > 0) {
          const counts: Record<string, { username: string; user_id: string; upload_count: number }> = {}
          serverUploads.forEach((s: any) => {
            const uid = s.owner_id || 'unknown'
            const uname = s.profiles?.discord_username || s.owner_name || 'Anonymous'
            if (!counts[uid]) {
              counts[uid] = { username: uname, user_id: uid, upload_count: 0 }
            }
            counts[uid].upload_count += 1
          })
          const sorted = Object.values(counts).sort((a, b) => b.upload_count - a.upload_count).slice(0, 5)
          setTopFiles(sorted)
        } else {
          setTopFiles([])
        }
      } else {
        setTopFiles((data as any[]) || [])
      }

      if (showToast) {
        toast.success('Storage health data refreshed')
      }
    } catch (e: any) {
      console.error('Failed to fetch storage health:', e)
      if (showToast) {
        toast.error('Failed to refresh storage', { description: e.message || 'An error occurred' })
      }
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
    fetchTopUploaders()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const latencyColor = latency === null ? 'text-red-400' : latency < 100 ? 'text-realm-green' : latency < 300 ? 'text-yellow-400' : 'text-red-400'
  const latencyLabel = latency === null ? 'N/A' : `${latency}ms`

  const greeting = (() => {
    const h = currentTime.getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  const dateLabel = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  const sevenDaysAgo = useMemo(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), [])

  const totalPendingApprovals = pendingServers + pendingProjects
  const approvedProjects = projects.filter(p => p.status === 'approved').length
  const totalApprovedListings = approvedServers + approvedProjects

  const newSubmissionsCreatedLastWeek = useMemo(() => {
    const sCount = servers.filter(s => new Date(s.created_at) >= sevenDaysAgo).length
    const pCount = projects.filter(p => new Date(p.created_at) >= sevenDaysAgo).length
    return sCount + pCount
  }, [servers, projects, sevenDaysAgo])

  const approvedLastWeek = useMemo(() => {
    const sCount = servers.filter(s => s.status === 'approved' && new Date(s.created_at) >= sevenDaysAgo).length
    const pCount = projects.filter(p => p.status === 'approved' && new Date(p.created_at) >= sevenDaysAgo).length
    return sCount + pCount
  }, [servers, projects, sevenDaysAgo])

  const votesLastWeek = useMemo(() => {
    return voteLogs.filter((v: any) => new Date(v.created_at) >= sevenDaysAgo).length
  }, [voteLogs, sevenDaysAgo])

  const reportsLastWeek = useMemo(() => {
    return reports.filter(r => (r.status === 'pending' || r.status === 'reviewing') && new Date(r.created_at) >= sevenDaysAgo).length
  }, [reports, sevenDaysAgo])

  // Merged feed: servers + projects, newest first, capped at 6
  const recentSubmissions = useMemo(() => {
    const serverItems = servers.map(s => ({ ...s, _kind: 'server' as const }))
    const projectItems = projects.map(p => ({ ...p, _kind: 'project' as const }))
    return [...serverItems, ...projectItems]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6)
  }, [servers, projects])

  const quickStats = [
    {
      label: 'Pending Approvals',
      value: totalPendingApprovals,
      icon: 'pending_actions',
      color: 'text-white/40',
      bg: 'bg-orange-500/15',
      borderColor: totalPendingApprovals > 0
        ? 'bg-white/[0.03] ring-1 ring-inset ring-orange-500/30'
        : 'bg-white/[0.03] ring-1 ring-inset ring-white/5',
      changeCount: newSubmissionsCreatedLastWeek,
      changeColor: newSubmissionsCreatedLastWeek > 0 ? 'text-orange-400' : 'text-white/40',
    },
    {
      label: 'Active Listings',
      value: totalApprovedListings,
      icon: 'dns',
      color: 'text-white/40',
      bg: 'bg-realm-green/15',
      borderColor: 'bg-white/[0.03] ring-1 ring-inset ring-white/5',
      changeCount: approvedLastWeek,
      changeColor: approvedLastWeek > 0 ? 'text-realm-green' : 'text-white/40',
    },
    {
      label: 'Total Votes Cast',
      value: totalVotes,
      icon: 'stars',
      color: 'text-white/40',
      bg: 'bg-purple-500/15',
      borderColor: 'bg-white/[0.03] ring-1 ring-inset ring-white/5',
      changeCount: votesLastWeek,
      changeColor: votesLastWeek > 0 ? 'text-purple-400' : 'text-white/40',
    },
    {
      label: 'Pending Reports',
      value: pendingReports,
      icon: 'flag',
      color: 'text-white/40',
      bg: 'bg-red-500/15',
      borderColor: pendingReports > 0
        ? 'bg-white/[0.03] ring-1 ring-inset ring-red-500/30'
        : 'bg-white/[0.03] ring-1 ring-inset ring-white/5',
      changeCount: reportsLastWeek,
      changeColor: reportsLastWeek > 0 ? 'text-red-400' : 'text-white/40',
    },
  ]

  const priorityQueue = [
    {
      label: 'Server Approvals',
      count: pendingServers,
      icon: 'dns',
      color: 'text-white/40',
      to: '/admin/servers',
      description: 'Servers awaiting review',
    },
    {
      label: 'Project Approvals',
      count: pendingProjects,
      icon: 'inventory_2',
      color: 'text-white/40',
      to: '/admin/projects',
      description: 'Projects pending approval',
    },
    {
      label: 'Active Reports',
      count: pendingReports,
      icon: 'flag',
      color: 'text-white/40',
      to: '/admin/reports',
      description: 'Reports under review',
    },
    {
      label: 'Ban Appeals',
      count: banAppeals.length,
      icon: 'gavel',
      color: 'text-white/40',
      to: '/admin/appeals',
      description: 'Appeals awaiting decision',
    },
    {
      label: 'Category Requests',
      count: pendingCatRequests,
      icon: 'add_circle',
      color: 'text-white/40',
      to: '/admin/category-requests',
      description: 'New category suggestions',
      adminOnly: true,
    },
  ].filter(item => !item.adminOnly || isAdmin)

  return (
    <AnimatedPage>
      {/* ── Hero Header ── */}
      <FramerIn>
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Left: Greeting */}
            <div className="flex items-center gap-4">
              {profile?.discord_avatar && (
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-white/5 shrink-0">
                  <img
                    src={profile.discord_avatar}
                    alt={profile.discord_username || ''}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <p className="text-xs font-headline font-semibold text-white/40 mb-1">{dateLabel}</p>
                <h1 className="text-2xl md:text-3xl font-pixel text-white leading-tight">
                  {greeting}, {profile?.discord_username?.split('#')[0] || 'Staff'}
                </h1>
              </div>
            </div>

            {/* Right: System status */}
            <div className="flex items-center gap-2.5" title={`Database Ping: ${latencyLabel}`}>
              <span className="material-symbols-outlined text-[24px] text-white/40">database</span>
              <span className={`material-symbols-outlined text-[22px] ${dbStatus === 'online' ? latencyColor : 'text-red-400'}`}>sensors</span>
              <span className={`font-mono text-base md:text-lg font-bold tracking-tight ${dbStatus === 'online' ? latencyColor : 'text-red-400'}`}>
                {latencyLabel}
              </span>
            </div>
          </div>
        </div>
      </FramerIn>

      {/* ── Stat Cards ── */}
      <FramerInList className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {quickStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </FramerInList>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* ── Left: Recent Submissions ── */}
        <FramerIn delay={0.3} className="lg:col-span-2">
          <div className="bg-white/[0.03] ring-1 ring-inset ring-white/5 rounded-2xl overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px] text-white/40">history</span>
                  </div>
                  <h3 className="font-headline font-bold text-white text-sm">Recent Submissions</h3>
                </div>
              </div>

              <div className="divide-y divide-white/[0.03]">
                {recentSubmissions.map(item => {
                  const isProject = item._kind === 'project'
                  return (
                    <div
                      key={`${item._kind}-${item.id}`}
                      onClick={() => {
                        const tab = item.status === 'approved' ? 'approved' : item.status === 'rejected' ? 'rejected' : 'review'
                        navigate(`${isProject ? '/admin/projects' : '/admin/servers'}?tab=${tab}`)
                      }}
                      className="px-6 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                          {item.icon_url ? (
                            <img src={item.icon_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-white/20 text-lg">
                              {isProject ? 'inventory_2' : 'dns'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={isProject ? `/projects/${item.slug || item.id}` : `/server/${item.slug || item.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-white/70 text-sm hover:text-white transition-colors hover:underline underline-offset-2 block truncate leading-tight"
                          >
                            {item.name}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-headline font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/5 text-white/40">
                              <span className="material-symbols-outlined text-[10px]">
                                {isProject ? 'inventory_2' : 'dns'}
                              </span>
                              {isProject ? 'Project' : 'Server'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-headline font-bold uppercase tracking-wider ${
                          item.status === 'approved' ? 'text-realm-green' :
                          item.status === 'rejected' ? 'text-red-400' :
                          'text-orange-400'
                        }`}>
                          <span className="material-symbols-outlined text-[13px]">
                            {item.status === 'approved' ? 'check' : item.status === 'rejected' ? 'close' : 'schedule'}
                          </span>
                          {item.status}
                        </span>
                        <span className="material-symbols-outlined text-white/10 text-sm group-hover:text-white/60 group-hover:translate-x-0.5 transition-all">chevron_right</span>
                      </div>
                    </div>
                  )
                })}
                {recentSubmissions.length === 0 && (
                  <div className="py-14 text-center text-white/20 italic text-sm">No recent submissions.</div>
                )}
              </div>
            </div>

            {/* Bottom View All Link */}
            <div className="p-3.5 border-t border-white/5 flex justify-center gap-5">
              <Link
                to="/admin/servers"
                className="inline-flex items-center gap-1.5 font-headline font-bold text-[11px] text-white/40 hover:text-white/70 uppercase tracking-wider transition-colors group/srv"
              >
                <span className="material-symbols-outlined text-[13px]">dns</span>
                <span className="group-hover/srv:underline">All Servers</span>
              </Link>
              <span className="text-white/10 text-[11px]">·</span>
              <Link
                to="/admin/projects"
                className="inline-flex items-center gap-1.5 font-headline font-bold text-[11px] text-white/40 hover:text-white/70 uppercase tracking-wider transition-colors group/prj"
              >
                <span className="material-symbols-outlined text-[13px]">inventory_2</span>
                <span className="group-hover/prj:underline">All Projects</span>
              </Link>
            </div>
          </div>
        </FramerIn>

        {/* ── Right Column ── */}
        <FramerIn delay={0.4} className="flex flex-col gap-5">

          {/* Server Status Doughnut Chart */}
          <div className="bg-white/[0.03] ring-1 ring-inset ring-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2.5">
              <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px] text-white/40">donut_large</span>
              </div>
              <h3 className="font-headline font-bold text-white text-sm">Server Status</h3>
            </div>
            <div className="p-5">
              <div className="relative flex items-center justify-center">
                {/* Doughnut */}
                <div className="w-36 h-36">
                  <Doughnut
                    data={{
                      labels: ['Approved', 'Pending', 'Rejected', 'Archived'],
                      datasets: [{
                        data: [
                          servers.filter(s => s.status === 'approved').length,
                          servers.filter(s => ['pending','Review Icon','Review Cover','Review Icon & Cover','Review Gallery','Review Icon & Gallery','Review Cover & Gallery','Review All Assets'].includes(s.status)).length,
                          servers.filter(s => s.status === 'rejected').length,
                          servers.filter(s => s.status === 'archived').length,
                        ],
                        backgroundColor: [
                          'rgba(78, 196, 78, 0.85)',
                          'rgba(249, 115, 22, 0.85)',
                          'rgba(239, 68, 68, 0.85)',
                          'rgba(255,255,255, 0.10)',
                        ],
                        borderColor: [
                          'rgba(78, 196, 78, 0.3)',
                          'rgba(249, 115, 22, 0.3)',
                          'rgba(239, 68, 68, 0.3)',
                          'rgba(255,255,255,0.05)',
                        ],
                        borderWidth: 1.5,
                        hoverOffset: 6,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '72%',
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(24,24,27,0.95)',
                          titleFont: { family: 'Inter', size: 10, weight: 'bold' },
                          bodyFont: { family: 'Inter', size: 11 },
                          padding: 8,
                          cornerRadius: 8,
                          displayColors: true,
                          boxWidth: 8,
                          boxHeight: 8,
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.08)',
                        }
                      }
                    }}
                  />
                </div>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-headline font-bold text-white leading-none">{servers.length}</span>
                  <span className="text-[8px] font-headline font-bold text-white/30 uppercase tracking-widest mt-1">Total</span>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: 'Approved', color: 'bg-realm-green', count: servers.filter(s => s.status === 'approved').length },
                  { label: 'Pending', color: 'bg-orange-500', count: servers.filter(s => ['pending','Review Icon','Review Cover','Review Icon & Cover','Review Gallery','Review Icon & Gallery','Review Cover & Gallery','Review All Assets'].includes(s.status)).length },
                  { label: 'Rejected', color: 'bg-red-500', count: servers.filter(s => s.status === 'rejected').length },
                  { label: 'Archived', color: 'bg-white/20', count: servers.filter(s => s.status === 'archived').length },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
                    <span className="text-[10px] text-white/50 font-headline font-bold flex-1">{item.label}</span>
                    <span className="text-xs font-headline font-bold text-white/80">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Priority Queue */}
          <div className="bg-white/[0.03] ring-1 ring-inset ring-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2.5">
              <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px] text-white/40">priority_high</span>
              </div>
              <h3 className="font-headline font-bold text-white text-sm">Priority Queue</h3>
              {totalPendingActions > 0 && (
                <span className="ml-auto bg-orange-500 text-zinc-950 text-[10px] font-headline font-bold px-1.5 py-0.5 rounded-md">
                  {totalPendingActions}
                </span>
              )}
            </div>
            <div className="divide-y divide-white/[0.03]">
              {priorityQueue.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-transparent transition-colors group"
                >
                  <span className={`material-symbols-outlined text-[18px] ${item.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white/70 group-hover:text-white transition-colors">{item.label}</p>
                    <p className="text-[9px] text-white/30">{item.description}</p>
                  </div>
                  {item.count > 0 ? (
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className={`shrink-0 text-[10px] font-headline font-bold px-2 py-0.5 rounded-lg ${
                        item.count > 5 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      }`}
                    >
                      {item.count}
                    </motion.span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px] text-realm-green/60 shrink-0">check</span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Storage Health — right column */}
          <div className="bg-white/[0.03] ring-1 ring-inset ring-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-[15px] text-white/40">storage</span>
                </div>
                <h3 className="font-headline font-bold text-white text-sm">Storage Health</h3>
              </div>
              <button
                onClick={() => fetchTopUploaders(true)}
                disabled={loadingStorage}
                className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                title="Refresh"
              >
                <span className={`material-symbols-outlined text-[14px] text-white/30 ${loadingStorage ? 'animate-spin text-realm-green' : ''}`}>refresh</span>
              </button>
            </div>
            <div className="p-4 space-y-2">
              {topFiles.length > 0 ? (
                topFiles.map((uploader, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl group/storage">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-white/80 truncate">{uploader.username}</p>
                      <p className="text-[9px] font-headline font-bold text-realm-green uppercase tracking-wider">{uploader.upload_count} uploads</p>
                      <p className="text-[8px] font-mono text-white/30 truncate max-w-full">
                        {uploader.user_id}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(uploader.user_id)
                        toast.success('User ID copied to clipboard')
                      }}
                      className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white flex items-center justify-center text-white/30 transition-all shrink-0 cursor-pointer"
                      title="Copy User ID"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-white/20 text-sm italic">No storage data available.</div>
              )}
              <p className="text-[8px] text-white/15 uppercase tracking-tighter leading-tight mt-2 pt-3 border-t border-white/5">
                Top contributors by uploaded asset volume.
              </p>
            </div>
          </div>
        </FramerIn>
      </div>



      {/* ── System Health Strip ── */}

      <FramerIn delay={0.6}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Database',
              value: dbStatus === 'online' ? 'Online' : dbStatus === 'offline' ? 'Offline' : 'Checking...',
              icon: 'database',
              valueClass: dbStatus === 'online' ? 'text-realm-green' : 'text-red-400',
            },
            {
              label: 'Latency',
              value: latencyLabel,
              icon: 'sensors',
              valueClass: latencyColor,
            },
            {
              label: 'Total Servers',
              value: `${approvedServers} active`,
              icon: 'dns',
              valueClass: 'text-white/70',
            },
            {
              label: 'System Version',
              value: 'v2.0.0',
              icon: 'info',
              valueClass: 'text-realm-green',
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl">
              <span className="material-symbols-outlined text-[16px] text-white/20 shrink-0">{item.icon}</span>
              <div>
                <p className="text-[9px] font-headline font-bold text-white/25 uppercase tracking-wider">{item.label}</p>
                <p className={`text-[11px] font-headline font-bold mt-0.5 ${item.valueClass}`}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </FramerIn>
    </AnimatedPage>
  )
}
