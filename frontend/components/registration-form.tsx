'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Shield,
  User,
  MapPin,
  DollarSign,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Star,
  Zap,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { workersApi } from '@/lib/api'
import { ZONES_BY_CITY, CITIES, PLATFORMS, type Platform, type City } from '@/lib/zones'
import { estimatePremium, estimateCoverage } from '@/lib/premium-estimate'

interface FormData {
  name: string
  phone: string
  platform: Platform | ''
  city: City | ''
  zone: string
  worker_id: string
  rating: number
  avg_weekly_hours: number
  baseline_weekly_earnings: number
}

const INITIAL: FormData = {
  name: '',
  phone: '',
  platform: '',
  city: '',
  zone: '',
  worker_id: '',
  rating: 4.0,
  avg_weekly_hours: 40,
  baseline_weekly_earnings: 6000,
}

const STEPS = [
  { label: 'Personal', icon: User },
  { label: 'Work', icon: MapPin },
  { label: 'Earnings', icon: DollarSign },
]

export function RegistrationForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'submit', string>>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ policyNumber: string; workerId: string; premium: number } | null>(null)

  const set = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }, [])

  const premium = form.city && form.zone
    ? estimatePremium(form.city, form.zone, form.rating, form.avg_weekly_hours, form.baseline_weekly_earnings)
    : 159

  const coverage = estimateCoverage(form.baseline_weekly_earnings)

  const validateStep = (): boolean => {
    const newErrors: Partial<Record<keyof FormData | 'submit', string>> = {}
    if (step === 0) {
      if (!form.name.trim()) newErrors.name = 'Name is required'
      if (!/^\d{10}$/.test(form.phone)) newErrors.phone = 'Enter valid 10-digit mobile number'
      if (!form.platform) newErrors.platform = 'Select your platform'
    }
    if (step === 1) {
      if (!form.city) newErrors.city = 'Select your city'
      if (!form.zone) newErrors.zone = 'Select your zone'
      if (!form.worker_id.trim()) newErrors.worker_id = 'Worker ID is required'
    }
    if (step === 2) {
      if (form.baseline_weekly_earnings < 1000 || form.baseline_weekly_earnings > 15000)
        newErrors.baseline_weekly_earnings = 'Enter Weekly Earnings between Rs.1,000 and Rs.15,000'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const next = () => { if (validateStep()) setStep((s) => s + 1) }
  const back = () => setStep((s) => s - 1)

  const submit = async () => {
    if (!validateStep()) return
    setLoading(true)
    try {
      const result = await workersApi.register({
        name: form.name,
        phone: form.phone,
        platform: form.platform,
        city: form.city,
        zone: form.zone,
        worker_id: form.worker_id,
        rating: form.rating,
        avg_weekly_hours: form.avg_weekly_hours,
        baseline_weekly_earnings: form.baseline_weekly_earnings,
      }) as { policy_number: string; worker_id: string; weekly_premium: number }
      setSuccess({
        policyNumber: result.policy_number,
        workerId: result.worker_id,
        premium: result.weekly_premium ?? premium,
      })
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Registration failed. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto w-full">
        <Card className="card-glass border border-brand-primary/30 p-8 text-center relative overflow-hidden bg-surface-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="mx-auto mb-6 h-20 w-20 rounded-full bg-status-success-bg border-2 border-status-success/40 flex items-center justify-center animate-pulse-glow"
          >
            <CheckCircle className="h-10 w-10 text-status-success" />
          </motion.div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Coverage Active</h2>
          <p className="text-text-secondary mb-6 text-sm">Your GottaGO policy is live.</p>
          <div className="rounded-xl border border-surface-border bg-surface p-5 mb-6 text-left space-y-3 shadow-inner">
            <div className="flex justify-between items-center text-sm border-b border-surface-border pb-2">
              <span className="text-text-muted">Policy Number</span>
              <span className="policy-number font-mono text-sm tracking-widest">{success.policyNumber}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-surface-border pb-2">
              <span className="text-text-muted">Weekly Premium</span>
              <span className="font-semibold text-brand-primary">Rs.{success.premium}/week</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Max Coverage</span>
              <span className="font-semibold text-status-success">Up to Rs.{coverage}/week</span>
            </div>
          </div>
          <Button
            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-surface font-semibold shadow-solid-primary transition-all active:translate-y-1 active:shadow-none"
            onClick={() => router.push(`/dashboard?worker_id=${encodeURIComponent(form.worker_id)}`)}
          >
            Enter Dashboard
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left: Wizard Form */}
      <div className="lg:col-span-7 w-full flex flex-col h-full justify-between">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text-primary mb-2">Set up your GottaGO cover</h2>
          <p className="text-text-secondary">Complete 3 simple steps to get an instant quote.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10 w-full">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="flex items-center flex-1">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                    i < step
                      ? 'bg-status-success text-white shadow-glow-green border-2 border-status-success/30'
                      : i === step
                      ? 'bg-brand-primary text-white shadow-glow-sky border-2 border-brand-primary/30'
                      : 'bg-surface-card text-text-muted border-2 border-surface-border'
                  }`}
                >
                  {i < step ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className={`h-1 w-full ml-2 rounded-full ${i < step ? 'bg-status-success' : 'bg-surface-border'} transition-colors duration-300`} />
              </div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1 w-full"
          >
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-6 border-b border-surface-border pb-2 text-text-primary">
                {step === 0 && 'Personal Information'}
                {step === 1 && 'Work Profile'}
                {step === 2 && 'Earnings Baseline'}
              </h3>

              {step === 0 && (
                <div className="grid gap-5">
                  <Input
                    id="name"
                    label="Full Name"
                    placeholder="Rajesh Kumar"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    error={errors.name}
                  />
                  <Input
                    id="phone"
                    label="Mobile Number"
                    type="tel"
                    placeholder="9876543210"
                    adornment="+91"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    error={errors.phone}
                  />
                  <div>
                    <Select value={form.platform} onValueChange={(v) => set('platform', v as Platform)}>
                      <SelectTrigger label="Primary Platform" id="platform" error={errors.platform}>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.platform && <p className="mt-1 text-xs text-status-danger">{errors.platform}</p>}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Select value={form.city} onValueChange={(v) => { set('city', v as City); set('zone', '') }}>
                        <SelectTrigger label="City" id="city" error={errors.city}>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface-card border-surface-border">
                          {CITIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.city && <p className="mt-1 text-xs text-status-danger">{errors.city}</p>}
                    </div>
                    <div>
                      <Select value={form.zone} disabled={!form.city} onValueChange={(v) => set('zone', v)}>
                        <SelectTrigger label="Zone / Area" id="zone" error={errors.zone}>
                          <SelectValue placeholder={form.city ? 'Select zone' : 'Select city first'} />
                        </SelectTrigger>
                        <SelectContent className="bg-surface-card border-surface-border">
                          {form.city && ZONES_BY_CITY[form.city]?.map((z) => (
                            <SelectItem key={z} value={z}>{z}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.zone && <p className="mt-1 text-xs text-status-danger">{errors.zone}</p>}
                    </div>
                  </div>
                  <Input
                    id="worker_id"
                    label="Worker ID (from your app profile)"
                    placeholder="SWGMUM12345"
                    value={form.worker_id}
                    onChange={(e) => set('worker_id', e.target.value.toUpperCase())}
                    error={errors.worker_id}
                  />
                  <div className="bg-surface-card/40 p-4 rounded-xl border border-surface-border">
                    <label className="flex items-center justify-between text-sm font-medium text-text-primary mb-4">
                      <span>Platform Rating</span>
                      <span className="flex items-center font-bold px-2 py-1 bg-amber-400/10 text-amber-500 rounded-md">
                        {form.rating.toFixed(1)} <Star className="ml-1 h-3.5 w-3.5 fill-amber-500" />
                      </span>
                    </label>
                    <input
                      type="range" min={1.0} max={5.0} step={0.1}
                      value={form.rating}
                      onChange={(e) => set('rating', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="bg-surface-card/40 p-4 rounded-xl border border-surface-border">
                    <label className="flex items-center justify-between text-sm font-medium text-text-primary mb-4">
                      <span>Average Hours per Week</span>
                      <span className="font-mono font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-md">{form.avg_weekly_hours}h</span>
                    </label>
                    <input
                      type="range" min={10} max={80} step={5}
                      value={form.avg_weekly_hours}
                      onChange={(e) => set('avg_weekly_hours', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-6">
                  <div className="bg-surface-card p-6 rounded-xl border border-surface-border relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary rounded-l-xl" />
                    <Input
                      id="earnings"
                      label="Average Weekly Earnings (Rs.)"
                      type="number"
                      placeholder="6000"
                      adornment="₹"
                      min={1000}
                      max={15000}
                      value={form.baseline_weekly_earnings || ''}
                      onChange={(e) => set('baseline_weekly_earnings', parseInt(e.target.value) || 0)}
                      error={errors.baseline_weekly_earnings}
                    />
                    <p className="text-xs text-text-muted mt-3 flex items-start gap-2">
                      <Zap className="h-4 w-4 text-brand-primary shrink-0" />
                      We use your baseline earnings to calculate maximum parametric payouts during severe disruptions.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Navigation Actions */}
            <div className="flex gap-4 mt-12 bg-surface-card/30 p-4 rounded-xl border border-surface-border/50">
              {step > 0 && (
                <Button variant="outline" onClick={back} className="flex-1 bg-transparent border-surface-border hover:bg-surface-card">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              {step < 2 ? (
                <Button onClick={next} className="flex-[2] bg-brand-primary hover:bg-brand-primary-hover text-surface shadow-solid-primary hover:shadow-none hover:translate-y-1 transition-all">
                  Next Step
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={submit} loading={loading} className="flex-[2] bg-status-success hover:bg-status-success text-white border border-status-success hover:brightness-110 shadow-solid-primary hover:shadow-none hover:translate-y-1 transition-all">
                  <Shield className="h-4 w-4 mr-2" />
                  Finalize & Activate
                </Button>
              )}
            </div>
            {errors.submit && (
              <div className="mt-4 p-4 rounded-xl bg-status-danger-bg border border-status-danger/30 text-status-danger text-sm flex items-center justify-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4" />
                {errors.submit}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right: Live Quote Sidebar */}
      <div className="lg:col-span-5 w-full mt-12 lg:mt-0">
        <div className="sticky top-24">
          <Card className="card-glass bg-surface-card/80 border-brand-primary/20 p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-3xl rounded-full" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-primary" />
              Live Quote Estimate
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div className="bg-surface p-5 rounded-xl border border-surface-border flex flex-col items-center justify-center py-8">
                <p className="text-text-secondary text-sm font-medium mb-2">Estimated Weekly Premium</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg text-text-muted font-bold">₹</span>
                  <span className="text-5xl font-mono font-bold text-brand-primary tracking-tighter">
                    {premium}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm p-3 bg-surface rounded-lg border border-surface-border/50">
                  <span className="text-text-muted">Maximum Coverage</span>
                  <span className="font-mono font-semibold text-status-success">₹ {coverage} / wk</span>
                </div>
                
                <div className="flex items-center justify-between text-sm p-3 bg-surface rounded-lg border border-surface-border/50">
                  <span className="text-text-muted">Dynamic Zone Rating</span>
                  <span className="font-mono text-brand-primary font-medium text-right capitalize">
                    {form.city ? `${form.city}, ${form.zone || '...'}` : 'Pending data'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm p-3 bg-surface rounded-lg border border-surface-border/50">
                  <span className="text-text-muted">Platform Factor</span>
                  <span className="font-mono text-text-primary capitalize">
                    {form.platform || 'Pending'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-text-muted text-center leading-relaxed px-4 pt-2 border-t border-surface-border/50">
                Powered by XGBoost dynamic pricing. Premiums adjust weekly based on hyper-local weather risks.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
