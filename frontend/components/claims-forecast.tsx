'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts'

interface ForecastDay {
  date: string
  rain_trigger_prob: number
  heat_trigger_prob: number
  aqi_trigger_prob: number
  estimated_claims: number
  estimated_payout: number
}

interface ClaimsForecastProps {
  data: ForecastDay[]
  isLoading?: boolean
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const day = payload[0]?.payload as ForecastDay
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg p-3 text-xs">
      <p className="font-medium text-text-primary mb-2">{label}</p>
      <div className="space-y-1">
        <p className="text-blue-400">Rain: {(day.rain_trigger_prob * 100).toFixed(0)}%</p>
        <p className="text-orange-400">Heat: {(day.heat_trigger_prob * 100).toFixed(0)}%</p>
        <p className="text-amber-400">AQI: {(day.aqi_trigger_prob * 100).toFixed(0)}%</p>
        <div className="border-t border-surface-border pt-1 mt-1">
          <p className="text-text-secondary">Est. claims: {day.estimated_claims}</p>
          <p className="text-status-success font-medium">Est. payout: Rs.{day.estimated_payout.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  )
}

export function ClaimsForecast({ data, isLoading }: ClaimsForecastProps) {
  if (isLoading) {
    return (
      <div className="h-72 bg-surface-card rounded-xl animate-pulse flex items-center justify-center">
        <p className="text-sm text-text-muted">Loading forecast...</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-72 bg-surface-card rounded-xl flex items-center justify-center">
        <p className="text-sm text-text-muted">No forecast data available</p>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    name: formatDate(d.date),
    rain: Math.round(d.rain_trigger_prob * d.estimated_payout),
    heat: Math.round(d.heat_trigger_prob * d.estimated_payout),
    aqi: Math.round(d.aqi_trigger_prob * d.estimated_payout),
  }))

  const totalPayout = data.reduce((sum, d) => sum + d.estimated_payout, 0)
  const avgClaims = data.reduce((sum, d) => sum + d.estimated_claims, 0) / data.length

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} barSize={24}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `Rs.${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#9ca3af' }}
            iconType="circle"
          />
          <Bar dataKey="rain" name="Rain" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
          <Bar dataKey="heat" name="Heat" stackId="a" fill="#f97316" />
          <Bar dataKey="aqi" name="AQI" stackId="a" fill="#eab308" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between items-center mt-3 px-2 text-xs text-text-secondary">
        <span>Total est. payout: <span className="text-status-success font-medium">Rs.{totalPayout.toLocaleString('en-IN')}</span></span>
        <span>Avg claims/day: <span className="text-text-primary font-medium">{avgClaims.toFixed(1)}</span></span>
      </div>
    </div>
  )
}
