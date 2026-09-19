import { useMemo } from 'react'
import { format, subDays } from 'date-fns'
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

interface ServerPlayerChartProps {
  livePlayers?: { online: number; max: number }
  playerHistory: any[]
}

export default function ServerPlayerChart({ livePlayers, playerHistory }: ServerPlayerChartProps) {
  const playerChartData = useMemo(() => {
    if (!livePlayers && playerHistory.length === 0) return null;
    
    const labels: string[] = [];
    const dataPoints: number[] = [];
    
    for (let i = 7; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateString = format(date, 'yyyy-MM-dd');
      
      labels.push(format(date, 'MMM dd'));
      
      const historyRecord = playerHistory.find(h => h.record_date === dateString);
      let count = historyRecord ? historyRecord.max_players : 0;
      
      if (i === 0 && livePlayers) {
        count = Math.max(count, livePlayers.online);
      }
      
      dataPoints.push(count);
    }

    return {
      labels,
      datasets: [
        {
          fill: true,
          label: 'Players',
          data: dataPoints,
          borderColor: '#4EC44E',
          backgroundColor: (context: ScriptableContext<'line'>) => {
            const ctx = context.chart.ctx
            const gradient = ctx.createLinearGradient(0, 0, 0, 80)
            gradient.addColorStop(0, 'rgba(78, 196, 78, 0.3)')
            gradient.addColorStop(1, 'rgba(78, 196, 78, 0)')
            return gradient
          },
          borderWidth: 2,
          pointBackgroundColor: '#4EC44E',
          pointBorderColor: '#fff',
          pointHoverRadius: 4,
          pointRadius: 0, 
          tension: 0.4,
        }
      ]
    }
  }, [livePlayers, playerHistory]);

  const playerChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(24, 24, 27, 0.9)',
        titleFont: { family: 'Inter', size: 10, weight: 'bold' as const },
        bodyFont: { family: 'Inter', size: 11 },
        padding: 8,
        cornerRadius: 6,
        displayColors: false,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }
    },
    scales: {
      x: { display: false },
      y: { display: false, min: 0 }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }

  if (!playerChartData) return null;

  return (
    <div className="pt-2">
      <div className="text-[9px] font-headline text-zinc-500 uppercase tracking-widest mb-2 flex items-center justify-between">
        <span>Player Activity</span>
        <span className="text-emerald-400">Past Week</span>
      </div>
      <div className="h-16 w-full opacity-80 hover:opacity-100 transition-opacity">
        <Line data={playerChartData} options={playerChartOptions} />
      </div>
    </div>
  )
}
