'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Wind,
  FileText,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Wallet,
  Clock,
  CloudRain,
  Thermometer,
  Cloud,
  AlertTriangle,
} from 'lucide-react'

interface Claim {
  id?: string
  claim_number: string
  trigger_type: string
  trigger_timestamp: string
  payout_amount: number
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'flagged' | 'payout_failed' | 'error'
  fraud_score: number
  approved_at?: string
  paid_at?: string
  transaction_id?: string
  created_at?: string
}

interface ClaimsTimelineProps {
  claims: Claim[]
  onManualClaim?: () => void
  manualClaimLoading?: boolean
  onProcessPayout?: (claimId: string) => void
  payoutLoadingId?: string | null
}

const TRIGGER_LABELS: Record<string, string> = {
  heavy_rainfall: 'Heavy rainfall',
  extreme_heat: 'Extreme heat',
  severe_aqi: 'Severe AQI',
  government_bandh: 'Government bandh',
  compound_disruption: 'Compound disruption',
}

const getTriggerIcon = (type: string) => {
  switch (type) {
    case 'heavy_rainfall': return CloudRain
    case 'extreme_heat': return Thermometer
    case 'severe_aqi': return Wind
    case 'government_bandh': return AlertTriangle
    case 'compound_disruption': return Cloud
    default: return Wind
  }
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function getStages(claim: Claim) {
  const TriggerIcon = getTriggerIcon(claim.trigger_type)

  const stages = [
    {
      icon: TriggerIcon,
      label: `${TRIGGER_LABELS[claim.trigger_type] ?? claim.trigger_type} Trigger Detected`,
      detail: 'Verification in progress. Threshold breach confirmed in residential zone.',
      time: claim.trigger_timestamp,
      done: true,
      iconClass: 'bg-status-warning text-[#000000] shadow-[0_0_15px_rgba(234,179,8,0.4)]',
      lineClass: 'bg-status-warning',
      cardClass: 'border-status-warning/20 hover:border-status-warning/40',
      labelClass: 'text-status-warning',
    },
    {
      icon: FileText,
      label: 'Claim submitted',
      detail: `Documentation for claim ${claim.claim_number} received and verified.`,
      time: claim.created_at ?? claim.trigger_timestamp,
      done: true,
      iconClass: 'bg-brand-primary text-[#000000]',
      lineClass: 'bg-brand-primary',
      cardClass: 'border-transparent hover:border-surface-border',
      labelClass: 'text-brand-primary',
    },
    {
      icon: ShieldCheck,
      label: 'Fraud checks',
      detail:
        claim.fraud_score < 0.3
          ? 'Assessment completed by sovereign verification board.'
          : claim.fraud_score < 0.7
            ? 'Under review by verification board.'
            : 'Flagged for manual review.',
      time: null,
      done: true,
      iconClass: 'bg-brand-primary text-[#000000]',
      lineClass: 'bg-brand-primary',
      cardClass: 'border-transparent hover:border-surface-border',
      labelClass: 'text-brand-primary',
    },
  ]

  if (
    claim.status === 'approved' ||
    claim.status === 'paid' ||
    claim.status === 'payout_failed' ||
    claim.status === 'error'
  ) {
    stages.push({
      icon: CheckCircle,
      label: 'Approved',
      detail: `Payout of Rs.${claim.payout_amount.toFixed(2)} authorized into Vault.`,
      time: claim.approved_at ?? null,
      done: true,
      iconClass: 'bg-status-success text-[#000000]',
      lineClass: 'bg-status-success',
      cardClass: 'border-transparent hover:border-surface-border',
      labelClass: 'text-status-success',
    })
  } else if (claim.status === 'rejected') {
    stages.push({
      icon: XCircle,
      label: 'Rejected',
      detail: `Coverage denied. Fraud score exceeded threshold: ${claim.fraud_score}`,
      time: null,
      done: true,
      iconClass: 'bg-status-danger text-[#000000]',
      lineClass: 'bg-status-danger',
      cardClass: 'border-status-danger/20',
      labelClass: 'text-status-danger',
    })
  } else {
    stages.push({
      icon: Clock,
      label: 'Awaiting approval',
      detail: 'Pending work history confirmation.',
      time: null,
      done: false,
      iconClass: 'bg-brand-primary text-[#000000]',
      lineClass: 'bg-surface-border',
      cardClass: 'border-transparent',
      labelClass: 'text-brand-primary',
    })
  }

  if (claim.status === 'paid') {
    stages.push({
      icon: Wallet,
      label: 'Payout executed',
      detail: claim.transaction_id
        ? `Transaction ID: ${claim.transaction_id}`
        : 'Funds transferred to your registered wallet.',
      time: claim.paid_at ?? null,
      done: true,
      iconClass: 'bg-status-success text-[#000000]',
      lineClass: 'bg-status-success',
      cardClass: 'border-transparent hover:border-surface-border',
      labelClass: 'text-status-success',
    })
  } else if (claim.status === 'payout_failed' || claim.status === 'error') {
    stages.push({
      icon: XCircle,
      label: 'Payout retry required',
      detail: 'The disbursal attempt failed and can be safely retried from the dashboard.',
      time: null,
      done: true,
      iconClass: 'bg-status-danger text-[#000000]',
      lineClass: 'bg-status-danger',
      cardClass: 'border-status-danger/20 hover:border-status-danger/40',
      labelClass: 'text-status-danger',
    })
  } else if (claim.status !== 'rejected') {
    stages.push({
      icon: Wallet,
      label: 'Payout scheduled',
      detail: 'Vault release pending final approval.',
      time: null,
      done: false,
      iconClass: 'bg-surface-card text-text-muted border border-surface-border',
      lineClass: 'bg-transparent',
      cardClass: 'border-transparent',
      labelClass: 'text-text-muted',
    })
  }

  return stages
}

function formatTime(ts: string | null) {
  if (!ts) return ''
  try {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) return `${Math.max(1, Math.floor(diff / (1000 * 60)))} min ago`
    if (hours < 24) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    if (hours < 48) return 'Yesterday'
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

export function ClaimsTimeline({
  claims,
  onManualClaim,
  manualClaimLoading,
  onProcessPayout,
  payoutLoadingId,
}: ClaimsTimelineProps) {
  if (claims.length === 0) {
    return (
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Active claim timeline</h3>
        <div className="text-center py-12 rounded-xl bg-surface border border-surface-border">
          <ShieldCheck className="h-10 w-10 text-text-muted mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium text-text-secondary">No active claims</p>
          <p className="text-[10px] uppercase tracking-widest font-mono text-text-muted mt-2">
            Claims generate automatically upon triggers
          </p>
        </div>
        {onManualClaim ? (
          <div className="mt-4">
            <Button
              className="w-full"
              variant="outline"
              loading={manualClaimLoading}
              onClick={onManualClaim}
            >
              Create demo claim
            </Button>
          </div>
        ) : null}
      </section>
    )
  }

  return (
    <section className="mb-10">
      <h3 className="text-lg font-semibold text-text-primary mb-6">Active claim timeline</h3>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-0"
      >
        {claims.map((claim) => {
          const stages = getStages(claim)

          return (
            <div key={claim.claim_number} className="mb-8">
              {stages.map((stage, idx) => {
                const StageIcon = stage.icon
                const isLast = idx === stages.length - 1

                return (
                  <motion.div key={idx} variants={item} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${stage.iconClass}`}>
                        <StageIcon className="h-4 w-4" />
                      </div>
                      {!isLast ? (
                        <div className={`w-0.5 h-12 ${stage.lineClass}`}></div>
                      ) : null}
                    </div>
                    <div className="flex-1 pb-8">
                      {stage.done ? (
                        <div className={`bg-surface p-4 rounded-xl rounded-tl-none relative transition-all duration-300 border ${stage.cardClass}`}>
                          <p className={`text-xs font-bold mb-1 ${stage.labelClass}`}>{stage.label}</p>
                          <p className="text-sm text-text-secondary">{stage.detail}</p>
                          {stage.time ? (
                            <span className="absolute top-3 right-3 text-[10px] text-text-muted font-mono">
                              {formatTime(stage.time)}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <div className="pt-1.5 opacity-60">
                          <p className={`text-xs font-bold mb-1 ${stage.labelClass}`}>{stage.label}</p>
                          <p className="text-sm text-text-muted">{stage.detail}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
              {onProcessPayout && claim.id && (
                claim.status === 'approved' ||
                claim.status === 'pending' ||
                claim.status === 'payout_failed'
              ) ? (
                <motion.div variants={item} className="ml-12 -mt-3 mb-4">
                  <Button
                    size="sm"
                    variant={claim.status === 'payout_failed' ? 'destructive' : 'default'}
                    loading={payoutLoadingId === claim.id}
                    onClick={() => onProcessPayout(claim.id!)}
                  >
                    {claim.status === 'payout_failed' ? 'Retry payout' : 'Process payout'}
                  </Button>
                </motion.div>
              ) : null}
            </div>
          )
        })}

        {onManualClaim ? (
          <motion.div variants={item}>
            <Button
              className="w-full"
              variant="outline"
              loading={manualClaimLoading}
              onClick={onManualClaim}
            >
              File manual exception claim
            </Button>
          </motion.div>
        ) : null}
      </motion.div>
    </section>
  )
}
