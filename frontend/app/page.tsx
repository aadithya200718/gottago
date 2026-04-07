'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  CloudRain,
  Thermometer,
  Wind,
  Shield,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  Fingerprint,
  MapPin,
  Wifi,
  Activity,
  FileText,
  Mail,
  Network,
  CloudSun,
  Video,
  UserCheck,
  Smartphone,
  Lock,
  Layers,
  Eye,
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
    icon: TrendingUp,
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

// 13-Layer Verification System data
const VERIFICATION_TIERS = [
  {
    tierName: 'Identity & Registration',
    tierColor: 'from-emerald-500 to-teal-500',
    tierBg: 'bg-emerald-500/5',
    tierBorder: 'border-emerald-500/20',
    tierIcon: UserCheck,
    layers: [
      {
        number: 1,
        name: 'Aadhaar Offline XML',
        description: 'UIDAI XML signature verification with XSD schema fallback. Validates document freshness (3-day expiry) to prevent replay attacks.',
        icon: Fingerprint,
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
        tech: 'pyaadhaar + lxml',
        cost: 'Free',
      },
      {
        number: 2,
        name: 'Firebase OTP + MSG91',
        description: 'Phone number verification via Firebase Auth with MSG91 fallback when the free-tier 100 SMS/day cap is hit.',
        icon: Smartphone,
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
        tech: 'Firebase Auth + MSG91',
        cost: 'Free',
      },
      {
        number: 3,
        name: 'Face Match (Selfie vs Aadhaar)',
        description: 'Browser-side face comparison using face-api.js with ≤0.5 Euclidean distance threshold. Pre-filters low-confidence detections (<0.7).',
        icon: Eye,
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
        tech: 'face-api.js',
        cost: 'Free',
      },
    ],
  },
  {
    tierName: 'Location & Activity',
    tierColor: 'from-blue-500 to-cyan-500',
    tierBg: 'bg-blue-500/5',
    tierBorder: 'border-blue-500/20',
    tierIcon: MapPin,
    layers: [
      {
        number: 4,
        name: 'GPS Geofence',
        description: 'Real-time GPS coordinate validation against registered delivery zones using Haversine distance formula.',
        icon: MapPin,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        tech: 'Browser Geolocation API',
        cost: 'Free',
      },
      {
        number: 5,
        name: 'Cell Tower Triangulation',
        description: 'OpenCelliD + Mozilla Location Services for tower-based position cross-check. Monthly database refresh via cron.',
        icon: Wifi,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        tech: 'OpenCelliD + MLS',
        cost: 'Free',
      },
      {
        number: 6,
        name: 'Wi-Fi Fingerprint',
        description: 'WiGLE database pre-downloaded quarterly for offline BSSID matching. Strong coverage in Indian commercial zones.',
        icon: Wifi,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        tech: 'WiGLE Database',
        cost: 'Free',
      },
      {
        number: 7,
        name: 'Motion Sensor CNN',
        description: 'Accelerometer/gyroscope pattern classification to detect riding, walking, or stationary states with real-world training data.',
        icon: Activity,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        tech: 'TensorFlow Lite',
        cost: 'Free',
      },
    ],
  },
  {
    tierName: 'Platform & Activity',
    tierColor: 'from-violet-500 to-purple-500',
    tierBg: 'bg-violet-500/5',
    tierBorder: 'border-violet-500/20',
    tierIcon: FileText,
    layers: [
      {
        number: 8,
        name: 'Bank Statement OCR',
        description: 'Camelot-based PDF table extraction for verifying Swiggy/Zomato UPI disbursements. Handles password-protected PDFs via pikepdf.',
        icon: FileText,
        color: 'text-violet-400',
        bg: 'bg-violet-400/10',
        tech: 'Camelot + pikepdf',
        cost: 'Free',
      },
      {
        number: 9,
        name: 'Email DKIM Validation',
        description: 'Verifies platform onboarding emails via DKIM signatures. SPF-only fallback for forwarded emails from Gmail/Yahoo.',
        icon: Mail,
        color: 'text-violet-400',
        bg: 'bg-violet-400/10',
        tech: 'dkimpy + SPF',
        cost: 'Free',
      },
    ],
  },
  {
    tierName: 'Fraud Detection',
    tierColor: 'from-amber-500 to-orange-500',
    tierBg: 'bg-amber-500/5',
    tierBorder: 'border-amber-500/20',
    tierIcon: Shield,
    layers: [
      {
        number: 10,
        name: 'Syndicate Detection (NetworkX)',
        description: 'Louvain community detection on worker relationship graphs with 3× temporal edge weighting for coordinated 6-hour fraud rings.',
        icon: Network,
        color: 'text-amber-400',
        bg: 'bg-amber-400/10',
        tech: 'NetworkX + Louvain',
        cost: 'Free',
      },
      {
        number: 11,
        name: 'Multi-Source Weather Validation',
        description: 'Open-Meteo (primary) + IMD ground-truth. >2mm/hr cross-source disagreement flags claims for manual review.',
        icon: CloudSun,
        color: 'text-amber-400',
        bg: 'bg-amber-400/10',
        tech: 'Open-Meteo + IMD',
        cost: 'Free',
      },
    ],
  },
  {
    tierName: 'Claim-Specific Verification',
    tierColor: 'from-rose-500 to-pink-500',
    tierBg: 'bg-rose-500/5',
    tierBorder: 'border-rose-500/20',
    tierIcon: Video,
    layers: [
      {
        number: 12,
        name: 'Video Proof with GPS Watermark',
        description: '15-second WebM proof recorded via MediaRecorder API. GPS coordinates, server timestamps, and device fingerprints burned into metadata.',
        icon: Video,
        color: 'text-rose-400',
        bg: 'bg-rose-400/10',
        tech: 'MediaRecorder + Supabase',
        cost: 'Free',
      },
      {
        number: 13,
        name: 'Multi-Sig Admin Approval',
        description: 'HMAC-SHA256 multi-signature verification for high-value claims. Per-admin secret keys stored in environment variables.',
        icon: Lock,
        color: 'text-rose-400',
        bg: 'bg-rose-400/10',
        tech: 'HMAC-SHA256',
        cost: 'Free',
      },
      {
        number: 14,
        name: 'Device Fingerprinting',
        description: 'FingerprintJS (Open Source) catches factory-reset phone exploits and multi-account fraud common on Indian gig platforms.',
        icon: Smartphone,
        color: 'text-rose-400',
        bg: 'bg-rose-400/10',
        tech: 'FingerprintJS OSS',
        cost: 'Free',
      },
    ],
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const layerCard = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
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
          <Image src="/logo.png" alt="GottaGO" width={36} height={36} className="h-9 w-9 rounded-lg object-contain" />
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

      {/* ═══════════ 13-LAYER VERIFICATION SECTION ═══════════ */}
      <section className="relative z-10 px-6 pb-24 max-w-6xl mx-auto">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute bottom-20 -right-20 h-72 w-72 rounded-full bg-rose-500/5 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold mb-4">
            <Layers className="h-3.5 w-3.5" />
            VERIFICATION ARCHITECTURE
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            13-Layer Verification Framework
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto flex flex-col gap-2">
            <span>Defense-in-depth fraud prevention across identity, location, activity, and claims.</span>
            <span>A robust, independently verifiable system to protect the platform and delivery partners without reliance on single points of failure.</span>
          </p>
        </motion.div>

        {VERIFICATION_TIERS.map((tier, tierIdx) => {
          const TierIcon = tier.tierIcon
          return (
            <motion.div
              key={tier.tierName}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={stagger}
              className="mb-12 last:mb-0"
            >
              {/* Tier header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${tier.tierColor} flex items-center justify-center shadow-lg`}>
                  <TierIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                    Tier {tierIdx + 1}
                  </p>
                  <h3 className="text-lg font-bold text-text-primary">{tier.tierName}</h3>
                </div>
              </div>

              {/* Layer cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tier.layers.map((layer) => {
                  const LayerIcon = layer.icon
                  return (
                    <motion.div key={layer.number} variants={layerCard}>
                      <Card
                        className={`p-5 h-full ${tier.tierBg} border ${tier.tierBorder} hover:border-opacity-50 transition-all duration-300 group relative overflow-hidden`}
                      >
                        {/* Hover glow */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                          <div className={`absolute top-0 right-0 h-24 w-24 rounded-full bg-gradient-to-br ${tier.tierColor} opacity-10 blur-2xl`} />
                        </div>

                        <div className="relative z-10">
                          {/* Layer number + icon row */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-mono font-bold ${layer.color} opacity-60`}>
                                L{layer.number.toString().padStart(2, '0')}
                              </span>
                              <div className={`h-8 w-8 rounded-lg ${layer.bg} flex items-center justify-center`}>
                                <LayerIcon className={`h-4 w-4 ${layer.color}`} />
                              </div>
                            </div>
                          </div>

                          <h4 className="text-sm font-semibold text-text-primary mb-2 group-hover:text-brand-primary transition-colors">
                            {layer.name}
                          </h4>
                          <p className="text-xs text-text-secondary leading-relaxed mb-3">
                            {layer.description}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-text-muted bg-surface-card px-2 py-0.5 rounded">
                              {layer.tech}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}

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
            <Image src="/logo.png" alt="GottaGO" width={20} height={20} className="h-5 w-5 rounded object-contain" />
            <span>GottaGO</span>
          </div>
          <span>Parametric income protection for delivery workers</span>
        </div>
      </footer>
    </div>
  )
}
