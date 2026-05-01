import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useServer, useServerAnalytics } from '../hooks/queries'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { 
  BarChart2,
  TrendingUp,
  Users, 
  Star, 
  Calendar,
  ArrowLeft,
  MessageSquare
} from 'lucide-react'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
} from 'chart.js'
import type { ScriptableContext } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { format, subDays, addDays, startOfDay, eachDayOfInterval } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export function ServerAnalyticsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const { data: serverData, isLoading: serverLoading } = useServer(id)
  const { data: analytics, isLoading: analyticsLoading } = useServerAnalytics(id)
  
  const [timeframe, setTimeframe] = useState<'7days' | 'all'>('7days')

  const server = serverData?.server
  const isOwner = server?.owner_id === user?.id

  // Redirect if not owner
  if (!serverLoading && !isOwner) {
    navigate('/dashboard')
    return null
  }

  const chartData = useMemo(() => {
    if (!analytics?.votes) return null

    const now = new Date()
    const startDate = timeframe === '7days' ? subDays(now, 6) : new Date(server?.created_at || now)
    
    const interval = eachDayOfInterval({
      start: startOfDay(startDate),
      end: startOfDay(now)
    })

    const labels = interval.map(date => format(date, 'MMM dd'))
    const dataPoints = interval.map(date => {
      const dayStart = startOfDay(date)
      const nextDayStart = addDays(dayStart, 1)
      
      return analytics.votes.filter(vote => {
        const voteDate = new Date(vote.created_at)
        return voteDate >= dayStart && voteDate < nextDayStart
      }).length
    })

    return {
      labels,
      datasets: [
        {
          fill: true,
          label: 'Public Votes',
          data: dataPoints,
          borderColor: '#4EC44E',
          backgroundColor: (context: ScriptableContext<'line'>) => {
            const ctx = context.chart.ctx
            const gradient = ctx.createLinearGradient(0, 0, 0, 400)
            gradient.addColorStop(0, 'rgba(78, 196, 78, 0.4)')
            gradient.addColorStop(1, 'rgba(78, 196, 78, 0)')
            return gradient
          },
          borderWidth: 3,
          pointBackgroundColor: '#4EC44E',
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
          tension: 0.4,
        }
      ]
    }
  }, [analytics?.votes, timeframe, server?.created_at])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(24, 24, 27, 0.9)',
        titleFont: { family: 'Inter', size: 12, weight: 'bold' as const },
        bodyFont: { family: 'Inter', size: 14 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.4)',
          font: { size: 10, family: 'Inter' }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.4)',
          font: { size: 10, family: 'Inter' },
          stepSize: 1
        }
      }
    }
  }

  if (serverLoading || analyticsLoading) return <LoadingSpinner />
  if (!server) return <div className="p-12 text-center text-white">Server not found</div>

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <FramerIn delay={0.1}>
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-headline font-bold text-xs uppercase tracking-widest">Back to Dashboard</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="hidden md:flex w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 items-center justify-center text-emerald-400">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-pixel text-lg md:text-2xl text-white uppercase tracking-tight">Server Analytics</h1>
                <p className="text-zinc-500 font-headline text-[10px] md:text-xs uppercase tracking-[0.2em]">Performance Insights for {server.name}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center bg-zinc-900/50 border border-zinc-800 p-1 rounded-lg self-end md:self-auto">
            <button 
              onClick={() => setTimeframe('7days')}
              className={`px-4 py-2 rounded-md text-[10px] font-headline font-bold uppercase tracking-wider transition-all ${
                timeframe === '7days' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Last 7 Days
            </button>
            <button 
              onClick={() => setTimeframe('all')}
              className={`px-4 py-2 rounded-md text-[10px] font-headline font-bold uppercase tracking-wider transition-all ${
                timeframe === 'all' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </FramerIn>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={<Users className="w-5 h-5" />}
          label="Total Votes"
          value={server.votes.toLocaleString()}
          color="text-emerald-400"
          delay={0.2}
        />
        <StatCard 
          icon={<Star className="w-5 h-5" />}
          label="Avg Rating"
          value={server.average_rating.toFixed(1)}
          color="text-yellow-400"
          delay={0.3}
        />
        <StatCard 
          icon={<MessageSquare className="w-5 h-5" />}
          label="Total Reviews"
          value={server.rating_count.toLocaleString()}
          color="text-blue-400"
          delay={0.4}
        />
        <StatCard 
          icon={<Calendar className="w-5 h-5" />}
          label="Days Listed"
          value={Math.floor((new Date().getTime() - new Date(server.created_at).getTime()) / (1000 * 3600 * 24)).toString()}
          color="text-purple-400"
          delay={0.5}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <FramerIn delay={0.6} className="lg:col-span-2">
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="font-pixel text-[10px] md:text-xs text-white uppercase tracking-widest">Vote Trends</h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-headline font-bold">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                PUBLIC VOTES
              </div>
            </div>

            <div className="h-[350px] w-full">
              {chartData && <Line data={chartData} options={chartOptions} />}
            </div>
          </div>
        </FramerIn>

        {/* Recent Ratings Section */}
        <FramerIn delay={0.7}>
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 backdrop-blur-sm flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-4 h-4 text-yellow-400" />
              <h3 className="font-pixel text-[10px] md:text-xs text-white uppercase tracking-widest">Recent Rates</h3>
            </div>

            <div className="space-y-4 flex-grow overflow-y-auto pr-2 custom-scrollbar">
              {analytics?.ratings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-zinc-500 font-headline text-[10px] uppercase tracking-widest">No ratings yet</p>
                </div>
              ) : (
                analytics?.ratings.map((rating) => (
                  <div key={rating.id} className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50 group hover:border-zinc-700/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img 
                          src={rating.profiles.discord_avatar || `https://ui-avatars.com/api/?name=${rating.profiles.discord_username}&background=random`} 
                          alt="" 
                          className="w-6 h-6 rounded-full border border-zinc-800"
                        />
                        <span className="text-[10px] font-bold text-zinc-300">@{rating.profiles.discord_username}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-2.5 h-2.5 ${i < rating.rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-700'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-400 italic line-clamp-3 leading-relaxed mb-2">"{rating.comment || 'No comment provided.'}"</p>
                    <div className="text-[9px] text-zinc-600 font-headline uppercase tracking-widest">
                      {format(new Date(rating.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </FramerIn>
      </div>
    </AnimatedPage>
  )
}

function StatCard({ icon, label, value, color, delay }: { icon: any, label: string, value: string, color: string, delay: number }) {
  return (
    <FramerIn delay={delay}>
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 md:p-5 backdrop-blur-sm hover:border-zinc-700/50 transition-all group">
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-md bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mb-3 md:mb-4 ${color} group-hover:scale-110 transition-transform`}>
          {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4 md:w-5 h-5' })}
        </div>
        <div className="text-zinc-500 font-headline text-[8px] md:text-[10px] uppercase tracking-[0.2em] mb-1">{label}</div>
        <div className="text-lg md:text-2xl font-pixel text-white tracking-tight">{value}</div>
      </div>
    </FramerIn>
  )
}
