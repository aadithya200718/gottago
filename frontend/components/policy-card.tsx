'use client'

import { motion } from 'framer-motion'
import { Calendar, Shield, RefreshCw, PauseCircle, PlayCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Policy {
  id: string
  policy_number: string
  status: 'active' | 'paused' | 'expired' | 'cancelled'
  start_date: string
  end_date: string
  weekly_premium: number
  coverage_amount: number
  claims_count?: number
  total_payout?: number
  worker_name?: string
  worker_city?: string
}

interface PolicyCardProps {
  policy: Policy | null
  loading?: boolean
  onRenew?: (id: string) => void
  onPause?: (id: string) => void
  onResume?: (id: string) => void
  renewLoading?: boolean
}

const STATUS_MAP = {
  active: { variant: 'default' as const, label: 'ACTIVE', styling: 'text-brand-primary bg-brand-primary/10 border-brand-primary/40' },
  paused: { variant: 'outline' as const, label: 'PAUSED', styling: 'text-text-muted bg-surface-card border-surface-border' },
  expired: { variant: 'status-danger' as const, label: 'EXPIRED', styling: 'text-status-danger bg-status-danger/10 border-status-danger/40' },
  cancelled: { variant: 'status-danger' as const, label: 'CANCELLED', styling: 'text-status-danger bg-status-danger/10 border-status-danger/40' },
}

export function PolicyCard({ policy, loading, onRenew, onPause, onResume, renewLoading }: PolicyCardProps) {
  if (loading) {
    return (
      <section className="mb-8">
        <div className="bg-surface rounded-xl p-6 relative overflow-hidden border border-surface-border">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="skeleton h-3 w-20 mb-2" />
              <div className="skeleton h-6 w-40" />
            </div>
            <div className="skeleton h-6 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="skeleton h-3 w-24 mb-2" />
              <div className="skeleton h-6 w-28" />
            </div>
            <div>
              <div className="skeleton h-3 w-24 mb-2" />
              <div className="skeleton h-6 w-28" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!policy) {
    return (
      <Card className="p-6 text-center bg-surface border border-surface-border rounded-xl">
        <Shield className="h-10 w-10 text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary">No active policy found.</p>
      </Card>
    )
  }

  const statusConfig = STATUS_MAP[policy.status]

  return (
    <section className="mb-8 group">
      <motion.div 
        className="bg-surface rounded-xl p-6 relative overflow-hidden border border-surface-border/50 hover:border-brand-primary/20 transition-all duration-500"
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">Policy Number</p>
            <h2 className="font-mono text-lg text-brand-primary tracking-tight group-hover:text-[#0ea5e9] transition-colors">
              {policy.policy_number}
            </h2>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusConfig.styling}`}>
            {statusConfig.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-[10px] text-text-muted uppercase mb-1 font-mono tracking-widest">Weekly coverage</p>
            <p className="text-xl font-bold text-text-primary font-mono tracking-tighter">
              {formatCurrency(policy.coverage_amount)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase mb-1 font-mono tracking-widest">Next premium</p>
            <p className="text-xl font-bold text-brand-primary font-mono tracking-tighter">
              {formatCurrency(policy.weekly_premium)}
            </p>
          </div>
        </div>
        
        {/* Coverage period & Actions */}
        <div className="flex items-center justify-between text-sm mt-2 mb-6">
          <span className="flex items-center gap-1.5 text-text-muted font-mono text-[10px] uppercase tracking-widest">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(policy.start_date)} - {formatDate(policy.end_date)}
          </span>
          <div className="flex gap-2">
            {policy.status === 'active' && (
              <>
                <Button variant="ghost" size="sm" onClick={() => onRenew?.(policy.id)} loading={renewLoading} className="h-8 text-xs bg-surface-card hover:bg-[#121f39] text-[#9babd2] hover:text-[#7bd0ff]">
                  <RefreshCw className="h-3 w-3 mr-1" /> Renew
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onPause?.(policy.id)} className="h-8 text-xs bg-surface-card hover:bg-[#121f39] text-[#9babd2] hover:text-[#7bd0ff]">
                  <PauseCircle className="h-3 w-3 mr-1" /> Pause
                </Button>
              </>
            )}
            {policy.status === 'paused' && (
              <Button size="sm" onClick={() => onResume?.(policy.id)} className="h-8 text-xs">
                <PlayCircle className="h-3 w-3 mr-1" /> Resume
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-surface-border/50 flex items-center gap-3">
          <Shield className="h-5 w-5 text-brand-primary group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium text-text-primary tracking-wide">Sovereign protection enabled</span>
        </div>
      </motion.div>
    </section>
  )
}
