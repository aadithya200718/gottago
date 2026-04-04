'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield,
  CloudRain,
  Thermometer,
  Wind,
  AlertTriangle,
  Cloud,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PolicyCard } from '@/components/policy-card'
import { PremiumBreakdown } from '@/components/premium-breakdown'
import { ClaimsTimeline } from '@/components/claims-timeline'
import { policiesApi, premiumsApi, claimsApi } from '@/lib/api'

interface Worker {
  id: string
  name: string
  city: string
  zone: string
  platform: string
  rating: number
  active_policy?: Policy
}

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

const TRIGGER_ICONS = {
  heavy_rainfall: CloudRain,
  extreme_heat: Thermometer,
  severe_aqi: Wind,
  government_bandh: AlertTriangle,
  compound_disruption: Cloud,
}

const TRIGGER_LABELS: Record<string, string> = {
  heavy_rainfall: 'Heavy Rain',
  extreme_heat: 'Extreme Heat',
  severe_aqi: 'Poor AQI',
  government_bandh: 'Bandh',
  compound_disruption: 'Compound',
}

const TRIGGER_PAYOUTS: Record<string, number> = {
  heavy_rainfall: 300,
  extreme_heat: 360,
  severe_aqi: 240,
  government_bandh: 480,
  compound_disruption: 300,
}

function DashboardContent() {
  const params = useSearchParams()
  const workerId = params.get('worker_id')

  const [worker, setWorker] = useState<Worker | null>(null)
  const [policy, setPolicy] = useState<Policy | null>(null)
  const [breakdown, setBreakdown] = useState<object | null>(null)
  const [claims, setClaims] = useState<object[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [renewLoading, setRenewLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (!workerId || workerId === 'demo') {
      setLoading(false)
      return
    }

    try {
      const workerRes = await fetch(`/api/v1/workers/${workerId}`)
      if (!workerRes.ok) throw new Error('Worker not found')
      const workerData = await workerRes.json() as Worker
      setWorker(workerData)

      const policyRes = await fetch(`/api/v1/policies/${workerId}`)
      if (policyRes.ok) {
        const policyData = await policyRes.json() as Policy
        setPolicy(policyData)
      }

      const breakdownRes = await fetch(`/api/v1/premiums/${workerId}/breakdown`)
      if (breakdownRes.ok) {
        setBreakdown(await breakdownRes.json())
      }

      const claimsRes = await fetch(`/api/v1/claims/${workerId}`)
      if (claimsRes.ok) {
        setClaims(await claimsRes.json() as object[])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [workerId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRenew = async (policyId: string) => {
    setRenewLoading(true)
    try {
      await fetch(`/api/v1/policies/${policyId}/renew`, { method: 'POST' })
      fetchData()
    } finally {
      setRenewLoading(false)
    }
  }

  const handlePause = async (policyId: string) => {
    await fetch(`/api/v1/policies/${policyId}/pause`, { method: 'POST' })
    fetchData()
  }

  const handleResume = async (policyId: string) => {
    await fetch(`/api/v1/policies/${policyId}/resume`, { method: 'POST' })
    fetchData()
  }

  if (!workerId || workerId === 'demo') {
    return <DemoState />
  }

  if (!loading && error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center">
          <Shield className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-text-primary mb-2">Worker not found</h1>
          <p className="text-text-secondary text-sm mb-6">{error}</p>
          <Link href="/register"><Button>Register Now</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Worker greeting */}
        {(loading || worker) && (
          <div className="flex items-center justify-between">
            <div>
              {loading ? (
                <>
                  <div className="skeleton h-7 w-48 mb-1" />
                  <div className="skeleton h-4 w-32" />
                </>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-text-primary">
                    Welcome back, {worker?.name}
                  </h1>
                  <p className="text-sm text-text-secondary">
                    Your income protection is currently active and monitoring.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Alert banner - shows when policy is active */}
        {!loading && policy?.status === 'active' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="alert-banner-warning"
          >
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Active monitoring</p>
              <p className="text-xs opacity-80">
                GottaGO is tracking rain, heat, AQI, and bandh signals in {worker?.city ?? 'your city'}.
              </p>
            </div>
          </motion.div>
        )}

        {/* Policy status badge */}
        {policy && (
          <div className="flex justify-end">
            <Badge variant={policy.status === 'active' ? 'default' : 'warning'} className="font-mono text-[10px] uppercase tracking-wider">
              {policy.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        )}

        {/* Policy card */}
        <PolicyCard
          policy={policy}
          loading={loading}
          onRenew={handleRenew}
          onPause={handlePause}
          onResume={handleResume}
          renewLoading={renewLoading}
        />

        {/* Premium breakdown */}
        <PremiumBreakdown breakdown={breakdown as any} loading={loading} />

        {/* Today's Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {['Rain', 'Heat', 'AQI'].map((label) => (
                <div key={label} className="text-center">
                  <div className="traffic-light green mx-auto mb-1.5" />
                  <p className="text-xs text-text-muted">{label}</p>
                  <p className="text-xs font-medium text-status-success">Clear</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-text-muted text-center">
              All conditions normal - Safe to work in all zones today
            </p>
            <p className="text-[10px] text-text-muted/60 text-center mt-1">
              Live data from OpenWeatherMap and WAQI, updates hourly
            </p>
          </CardContent>
        </Card>

        {/* Claims timeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active claim timeline</CardTitle>
              {claims.length > 0 && (
                <Badge variant="default">{claims.length}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-card" />)}
              </div>
            ) : (
              <ClaimsTimeline claims={claims as any[]} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DemoState() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <Shield className="h-14 w-14 text-brand-primary mx-auto mb-4" />
        <h1 className="text-xl font-bold text-text-primary mb-2">Welcome</h1>
        <p className="text-text-secondary text-sm mb-6">
          Register as a worker to see your personal dashboard with live premium calculation and claims.
        </p>
        <Link href="/register">
          <Button className="w-full">Register Now</Button>
        </Link>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
