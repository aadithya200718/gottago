'use client'

interface ReserveData {
  active_policies: number
  weekly_premium_pool: number
  pending_payout_liability: number
  reserve_ratio: number
  signal: 'green' | 'amber' | 'red'
  recommendation: string
}

interface ReservePanelProps {
  data: ReserveData | null
  isLoading?: boolean
}

const SIGNAL_CONFIG = {
  green: {
    bg: 'bg-status-success',
    glow: 'shadow-glow-green',
    text: 'text-status-success',
    label: 'Healthy',
  },
  amber: {
    bg: 'bg-status-warning',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
    text: 'text-status-warning',
    label: 'Caution',
  },
  red: {
    bg: 'bg-status-danger',
    glow: 'shadow-glow-red',
    text: 'text-status-danger',
    label: 'Critical',
  },
}

function formatINR(amount: number): string {
  return amount.toLocaleString('en-IN')
}

export function ReservePanel({ data, isLoading }: ReservePanelProps) {
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-surface animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-16 bg-surface-border rounded-lg animate-pulse" />
          <div className="h-16 bg-surface-border rounded-lg animate-pulse" />
          <div className="h-4 bg-surface-border rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="w-full text-center">
        <p className="text-sm text-text-secondary">No reserve data</p>
      </div>
    )
  }

  const signal = SIGNAL_CONFIG[data.signal] ?? SIGNAL_CONFIG.green
  const ratioPercent = Math.min((data.reserve_ratio / 3) * 100, 100)

  return (
    <div className="w-full space-y-5 mt-4">
      {/* Traffic light */}
      <div className="flex flex-col items-center gap-2">
        <div className={`h-16 w-16 rounded-full ${signal.bg} ${signal.glow} shadow-lg animate-pulse flex items-center justify-center`}>
          <span className="text-white font-mono text-xs font-bold">{data.reserve_ratio.toFixed(1)}x</span>
        </div>
        <span className={`text-sm font-semibold ${signal.text}`}>{signal.label}</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-brand-primary/10 border border-brand-primary/20 p-3 text-center">
          <p className="text-[10px] text-brand-primary uppercase tracking-wider">Premium pool</p>
          <p className="text-lg font-bold font-mono text-brand-primary mt-1">Rs.{formatINR(data.weekly_premium_pool)}</p>
        </div>
        <div className="rounded-lg bg-status-danger/10 border border-status-danger/20 p-3 text-center">
          <p className="text-[10px] text-status-danger uppercase tracking-wider">Pending payouts</p>
          <p className="text-lg font-bold font-mono text-status-danger mt-1">Rs.{formatINR(data.pending_payout_liability)}</p>
        </div>
      </div>

      {/* Reserve ratio bar */}
      <div>
        <div className="flex justify-between text-[10px] text-text-secondary mb-1">
          <span>0x</span>
          <span>Reserve ratio</span>
          <span>3x</span>
        </div>
        <div className="h-2 bg-surface-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              data.reserve_ratio >= 2 ? 'bg-status-success' :
              data.reserve_ratio >= 1 ? 'bg-status-warning' : 'bg-status-danger'
            }`}
            style={{ width: `${ratioPercent}%` }}
          />
        </div>
      </div>

      {/* Recommendation */}
      <p className="text-xs text-text-secondary leading-relaxed">{data.recommendation}</p>

      {/* Active policies badge */}
      <div className="text-center">
        <span className="text-[10px] bg-surface border border-surface-border text-text-secondary px-3 py-1 rounded-full">
          {data.active_policies} active policies
        </span>
      </div>
    </div>
  )
}
