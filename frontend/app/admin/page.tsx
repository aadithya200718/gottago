'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Users,
  FileText,
  AlertTriangle,
  Wallet,
  Shield,
  Download,
  BarChart3,
  Map,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ReservePanel } from '@/components/reserve-panel'
import { ClaimsForecast } from '@/components/claims-forecast'
import { adminApi, triggersApi } from '@/lib/api'

const FraudHeatmap = dynamic(
  () => import('@/components/fraud-heatmap').then((mod) => mod.FraudHeatmap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] sm:h-[400px] bg-surface-card rounded-xl animate-pulse flex items-center justify-center">
        <p className="text-sm text-text-muted">Loading map...</p>
      </div>
    ),
  }
)

// --- Mock Data ---

const TRIGGER_TYPES = [
  { value: 'heavy_rainfall', label: 'Heavy Rainfall' },
  { value: 'extreme_heat', label: 'Extreme Heat' },
  { value: 'severe_aqi', label: 'Severe AQI' },
  { value: 'government_bandh', label: 'Government Bandh' },
  { value: 'compound_disruption', label: 'Compound Disruption' },
]

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru']

const ACTIVITY_LOG = [
  { timestamp: '14:23:05', eventId: 'EVT-a8f9-2bd1', type: 'Oracle Validation', target: 'Mumbai_SENS_12', status: 'verified' },
  { timestamp: '14:21:12', eventId: 'EVT-3c4d-91a2', type: 'Payout Execution', target: 'Batch_88A', status: 'completed' },
  { timestamp: '14:18:45', eventId: 'EVT-7e2a-5f3b', type: 'Policy Genesis', target: 'IS-9102-MUM', status: 'verified' },
  { timestamp: '14:15:02', eventId: 'EVT-1b4c-8f9d', type: 'Fraud Assessment', target: 'Claim-441-X', status: 'flagged' },
  { timestamp: '14:10:33', eventId: 'EVT-9d2e-1a5c', type: 'Oracle Validation', target: 'Delhi_SENS_04', status: 'verified' },
]

const STATUS_COLORS: Record<string, string> = {
  verified: 'text-status-success bg-status-success/10 border border-status-success/20',
  completed: 'text-[#38bdf8] bg-[#38bdf8]/10 border border-[#38bdf8]/20',
  flagged: 'text-status-danger bg-status-danger/10 border border-status-danger/20',
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function AdminPage() {
  const [reserves, setReserves] = useState<any>(null)
  const [forecast, setForecast] = useState<any>(null)
  const [zones, setZones] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [fireCity, setFireCity] = useState<string>('')
  const [fireTrigger, setFireTrigger] = useState<string>('')
  const [fireLoading, setFireLoading] = useState(false)
  const [fireResult, setFireResult] = useState<any>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const resData = await adminApi.getReserves()
      setReserves(resData)

      const forecastData = await adminApi.getClaimsForecast()
      setForecast(forecastData)

      const zonesData = await adminApi.getFraudHeatmap()
      setZones(zonesData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFireTrigger = async () => {
    if (!fireCity || !fireTrigger) return
    setFireLoading(true)
    setFireResult(null)
    try {
      const res = await triggersApi.fireTrigger({ city: fireCity, trigger_type: fireTrigger })
      setFireResult(res)
    } catch (err: any) {
      setFireResult({ error: err.message ?? 'Unknown error' })
    } finally {
      setFireLoading(false)
    }
  }

  const chartData = loading
    ? []
    : (forecast?.daily?.map((d: any) => ({
        date: d.date,
        rain_trigger_prob: 0.3,
        heat_trigger_prob: 0.2,
        aqi_trigger_prob: 0.1,
        estimated_claims: d.count,
        estimated_payout: d.payout,
      })) ?? [])

  return (
    <div className="min-h-screen bg-surface">
      <div className="w-full">
        {/* Header */}
        <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">Administrative terminal</h2>
            <p className="text-text-secondary text-sm">System oversight and risk management dashboard</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 bg-surface-card rounded-lg text-text-secondary hover:bg-surface-border transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 bg-surface-card rounded-lg px-3 py-2 border border-surface-border">
              <div className="w-8 h-8 rounded bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-xs">AD</div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-text-primary leading-tight">Admin Root</p>
                <p className="text-[10px] text-text-muted font-mono leading-tight">0x1f...9E2</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-10 space-y-8">
          {/* Stats Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <motion.div variants={item} className="bg-surface p-6 rounded-xl border border-surface-border transition-all hover:bg-surface-card">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-5 w-5 text-brand-primary" />
                <span className="text-xs font-mono text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">+12.5%</span>
              </div>
              <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Total workers</p>
              <h3 className="text-3xl font-bold font-mono text-text-primary">
                {reserves?.active_policies ? (reserves.active_policies * 4.2).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '-'}
              </h3>
            </motion.div>
            
            <motion.div variants={item} className="bg-surface p-6 rounded-xl border border-surface-border transition-all hover:bg-surface-card">
              <div className="flex items-center justify-between mb-4">
                <FileText className="h-5 w-5 text-brand-primary" />
                <span className="text-xs font-mono text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">Active</span>
              </div>
              <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Active policies</p>
              <h3 className="text-3xl font-bold font-mono text-text-primary">
                {reserves?.active_policies?.toLocaleString('en-IN') ?? '-'}
              </h3>
            </motion.div>

            <motion.div variants={item} className="bg-surface p-6 rounded-xl border border-surface-border transition-all hover:bg-surface-card">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="h-5 w-5 text-status-danger" />
                <span className="text-[10px] font-mono text-status-danger bg-status-danger/10 border border-status-danger/30 px-2 py-0.5 rounded uppercase tracking-wider">Critical</span>
              </div>
              <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Pending claims</p>
              <h3 className="text-3xl font-bold font-mono text-text-primary">
                {forecast?.total_claims ?? '-'}
              </h3>
            </motion.div>

            <motion.div variants={item} className="bg-surface p-6 rounded-xl border border-surface-border transition-all hover:bg-surface-card">
              <div className="flex items-center justify-between mb-4">
                <Wallet className="h-5 w-5 text-text-primary" />
                <span className="text-[10px] font-mono text-text-muted bg-surface-border/50 px-2 py-0.5 rounded uppercase tracking-wider">YTD</span>
              </div>
              <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Total payouts</p>
              <h3 className="text-3xl font-bold font-mono text-text-primary">
                {forecast?.total_payout ? `₹${(forecast.total_payout/1000).toFixed(1)}k` : '-'}
              </h3>
            </motion.div>
          </motion.div>

          {/* Alert Banner */}
          <motion.div variants={item} initial="hidden" animate="show" className="p-4 bg-status-warning/5 border border-status-warning/30 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-6 w-6 text-status-warning" />
              <div>
                <h4 className="text-sm font-bold text-status-warning">High AQI Warning - Delhi-NCR</h4>
                <p className="text-xs text-text-secondary mt-0.5">System-triggered verification protocol initiated based on local sensor data (Delhi_SENS_04).</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-status-warning text-[#000000] font-bold text-xs rounded-lg hover:opacity-90 transition-all flex-shrink-0">
              VIEW PROTOCOL
            </button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Claims Forecast */}
            <div className="lg:col-span-2 bg-surface rounded-xl border border-surface-border p-6 sm:p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Weekly claims forecast</h3>
                  <p className="text-sm text-text-secondary">Projected risk vs historical average</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-primary"></div>
                    <span className="text-xs text-text-secondary">Projected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-surface-border"></div>
                    <span className="text-xs text-text-secondary">Baseline</span>
                  </div>
                </div>
              </div>
              <div className="h-72 w-full">
                <ClaimsForecast data={chartData} isLoading={loading} />
              </div>
            </div>

            {/* Liquidity Reserve */}
            <div className="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 flex flex-col items-center">
              <div className="w-full flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Liquidity reserve</h3>
                  <p className="text-sm text-text-secondary">Solvency status across pools</p>
                </div>
              </div>
              <div className="flex-1 w-full flex items-center justify-center">
                <ReservePanel data={reserves} isLoading={loading} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Heatmap */}
            <div className="bg-surface rounded-xl border border-surface-border p-6">
              <div className="flex items-center gap-2 mb-2">
                <Map className="h-4 w-4 text-text-muted" />
                <h3 className="text-lg font-bold text-text-primary">Fraud risk heatmap</h3>
              </div>
              <p className="text-xs text-text-secondary mb-6">Real-time anomaly detection by region</p>
              <div className="h-64">
                <FraudHeatmap zones={zones} isLoading={loading} />
              </div>
            </div>

            {/* Manual Trigger Simulator */}
            <div className="bg-surface rounded-xl border border-surface-border p-6">
              <h3 className="text-lg font-bold text-text-primary mb-1">Manual protocol trigger</h3>
              <p className="text-xs text-text-secondary mb-6">Execute emergency governance actions</p>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5 font-mono">Select city region</p>
                    <Select value={fireCity} onValueChange={setFireCity}>
                      <SelectTrigger className="w-full bg-surface border-surface-border">
                        <SelectValue placeholder="City" />
                      </SelectTrigger>
                      <SelectContent>
                        {CITIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5 font-mono">Trigger type</p>
                    <Select value={fireTrigger} onValueChange={setFireTrigger}>
                      <SelectTrigger className="w-full bg-surface border-surface-border">
                        <SelectValue placeholder="Trigger" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRIGGER_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Security warning */}
                <div className="rounded-xl bg-status-warning/5 border border-status-warning/20 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-status-warning flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-status-warning">Security authorization required</p>
                      <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                        Manual triggers bypass automated oracle checks. All actions are immutable and recorded to the sovereign audit log. Multi-sig approval will be requested on execution.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleFireTrigger}
                  disabled={fireLoading}
                  className="w-full bg-status-warning hover:brightness-110 text-[#000000] font-bold"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {fireLoading ? 'Executing Protocol...' : 'Execute Trigger Protocol'}
                </Button>

                {fireResult && (
                  <div className="p-3 rounded-lg bg-surface-card border border-surface-border text-xs">
                    {fireResult.error ? (
                      <p className="text-status-danger">{fireResult.error}</p>
                    ) : (
                      <div className="space-y-1 text-text-secondary font-mono text-[10px] tracking-wider uppercase">
                        <p>Workers affected: <span className="font-bold text-white">{fireResult.workers_affected}</span></p>
                        <p>Claims created: <span className="font-bold text-status-success">{fireResult.claims_created}</span></p>
                        {fireResult.claims_skipped > 0 && (
                          <p>Claims skipped: <span className="font-bold text-status-warning">{fireResult.claims_skipped}</span></p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Activity Log */}
          <div className="bg-surface rounded-xl border border-surface-border pt-6 pb-2">
            <div className="px-6 flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-text-primary">System activity log</h3>
                <p className="text-xs text-text-secondary mt-0.5">Real-time protocol event stream</p>
              </div>
              <Button variant="outline" size="sm" className="bg-transparent border-surface-border text-xs font-mono">
                <Download className="h-3 w-3 mr-2" />
                Export CSV
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-surface-border/50">
                    <th className="px-6 py-3 text-[10px] font-mono text-text-muted uppercase tracking-widest">Timestamp</th>
                    <th className="px-6 py-3 text-[10px] font-mono text-text-muted uppercase tracking-widest">Event ID</th>
                    <th className="px-6 py-3 text-[10px] font-mono text-text-muted uppercase tracking-widest">Type</th>
                    <th className="px-6 py-3 text-[10px] font-mono text-text-muted uppercase tracking-widest">Target</th>
                    <th className="px-6 py-3 text-[10px] font-mono text-text-muted uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/30">
                  {ACTIVITY_LOG.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-card/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-[11px] text-text-secondary">{row.timestamp}</td>
                      <td className="px-6 py-4 font-mono text-[11px] text-text-primary">{row.eventId}</td>
                      <td className="px-6 py-4 text-xs text-text-secondary">{row.type}</td>
                      <td className="px-6 py-4 font-mono text-[11px] text-brand-primary">{row.target}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${STATUS_COLORS[row.status] ?? ''}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
