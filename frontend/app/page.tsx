'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  CloudRain,
  Thermometer,
  Wind,
  Shield,
  Zap,
  Brain,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const TRIGGERS = [
  { icon: CloudRain, label: 'Heavy Rain', payout: 'Rs.300', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { icon: Thermometer, label: 'Extreme Heat', payout: 'Rs.360', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { icon: Wind, label: 'Severe AQI', payout: 'Rs.240', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { icon: Shield, label: 'Govt. Bandh', payout: 'Rs.480', color: 'text-rose-400', bg: 'bg-rose-400/10' },
  { icon: Zap, label: 'Compound Disruption', payout: 'Rs.300', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
]

const FEATURES = [
  {
    icon: Zap,
    title: '5 Smart Triggers',
    description: 'Rain, heat, AQI, bandh, and compound disruption score with live signal checks.',
    color: 'text-brand-primary',
    bg: 'bg-brand-primary/10',
  },
  {
    icon: Brain,
    title: 'XGBoost Pricing',
    description: 'Premiums are personalized using zone risk, AQI history, weekly hours, season, and rating.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    icon: Clock,
    title: 'Zero-Touch Claims',
    description: 'Trigger fires -> claim created -> fraud check -> payout. No forms, no calls, no wait.',
    color: 'text-status-success',
    bg: 'bg-status-success/10',
  },
]

const VALUE_PROPS = [
  'Zero paperwork, ever',
  'Auto payouts in 2 hours',
  'Rs.80-318/week',
  'Mumbai / Delhi / Bengaluru',
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-80 w-80 rounded-full bg-purple-500/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-500/6 blur-3xl" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-text-primary">GottaGO</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="sm">Admin</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Register</Button>
          </Link>
        </div>
      </nav>

      <section className="relative z-10 px-6 pt-16 pb-20 max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl font-bold leading-tight mb-6"
        >
          India&apos;s first{' '}
          <span className="gradient-text">weekly income protection</span>{' '}
          for delivery partners
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto"
        >
          When rain, extreme heat, or a bandh destroys your earning day, GottaGO pays you
          automatically. Zero paperwork. Zero calls. Payout in 2 hours.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
        >
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto group">
              Get Covered Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/dashboard?worker_id=demo">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Demo Dashboard
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-text-secondary"
        >
          {VALUE_PROPS.map((value) => (
            <span key={value} className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-status-success flex-shrink-0" />
              {value}
            </span>
          ))}
        </motion.div>
      </section>

      <section className="relative z-10 px-6 pb-16 max-w-6xl mx-auto">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-text-muted mb-6">
          5 Parametric Triggers - We watch. You work.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {TRIGGERS.map(({ icon: Icon, label, payout, color, bg }, i) => (
            <motion.div
              key={label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Card className="text-center p-4 hover:shadow-glow-indigo cursor-default">
                <div className={`mx-auto mb-3 h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <p className="text-xs font-medium text-text-primary mb-1">{label}</p>
                <p className={`text-sm font-bold ${color}`}>{payout}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-6 pb-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description, color, bg }, i) => (
            <motion.div
              key={title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full">
                <div className={`h-12 w-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-6 pb-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-6 border border-surface-border rounded-card p-8 bg-surface-card/40">
          {[
            { value: '5', label: 'Trigger Types', icon: Zap },
            { value: '< 2hr', label: 'Payout Time', icon: Clock },
            { value: '3 Cities', label: 'Coverage', icon: Users },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="h-5 w-5 text-brand-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary">{value}</p>
              <p className="text-xs text-text-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-surface-border px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-primary" />
            <span>GottaGO</span>
          </div>
          <span>Parametric income protection for delivery workers</span>
        </div>
      </footer>
    </div>
  )
}
