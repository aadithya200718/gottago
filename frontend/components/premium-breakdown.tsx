'use client'

import { motion } from 'framer-motion'
import { Info } from 'lucide-react'

interface PremiumBreakdownData {
  base_premium: number
  multiplier: number
  flood_risk_impact: number
  aqi_risk_impact: number
  city_impact: number
  season_impact: number
  rating_discount: number
  raw_premium: number
  affordability_cap: number
  affordability_applied: boolean
  weekly_premium: number
  coverage_amount: number
  model_used?: string
}

interface PremiumBreakdownProps {
  breakdown: PremiumBreakdownData | null
  loading?: boolean
}

export function PremiumBreakdown({ breakdown, loading }: PremiumBreakdownProps) {
  if (loading) {
    return (
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Premium breakdown</h3>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-surface p-4 rounded-xl border border-surface-border">
              <div className="skeleton h-3 w-16 mb-2" />
              <div className="skeleton h-5 w-20" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (!breakdown) return null

  // Process factors
  const factors = [
    { label: 'Base Risk', value: breakdown.base_premium, type: 'neutral' },
    { label: 'Geography', value: breakdown.city_impact + breakdown.flood_risk_impact, type: 'neutral' },
    { label: 'Environment', value: breakdown.aqi_risk_impact + breakdown.season_impact, type: 'neutral' },
    { label: 'Experience', value: breakdown.rating_discount, type: 'decrease' },
  ]
  
  // Condense minor factors if they are 0
  const activeFactors = factors.filter(f => Math.abs(f.value) > 0 || f.label === 'Base Risk')

  return (
    <section className="mb-10">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Premium breakdown</h3>
        {breakdown.model_used && (
          <span className="text-[10px] text-text-muted font-mono tracking-widest uppercase">
            Model: {breakdown.model_used === 'xgboost' ? 'XGBoost' : 'Rule-based'}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {activeFactors.map((factor, i) => (
          <motion.div 
            key={factor.label}
            className="bg-surface p-4 rounded-xl border border-transparent hover:border-surface-border/50 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2 font-mono">
              {factor.label}
            </p>
            <p className={`font-mono text-lg font-medium ${
              factor.type === 'decrease' 
                ? 'text-status-success' 
                : factor.value > 0 && factor.label !== 'Base Risk' 
                  ? 'text-status-danger' 
                  : 'text-text-primary'
            }`}>
              {factor.value === 0 
                ? '-' 
                : factor.type === 'decrease' 
                  ? `-₹${Math.abs(factor.value).toFixed(2)}` 
                  : factor.label === 'Base Risk' 
                    ? `₹${factor.value.toFixed(2)}`
                    : `+₹${Math.abs(factor.value).toFixed(2)}`
              }
            </p>
          </motion.div>
        ))}

        {/* Total Weekly */}
        <motion.div 
          className="bg-brand-primary/10 p-4 rounded-xl border border-brand-primary/20 hover:border-brand-primary/40 transition-all duration-300 col-span-2 sm:col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: activeFactors.length * 0.1 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-brand-primary uppercase tracking-widest mb-2 font-mono">Total Weekly</p>
              <div className="flex items-baseline gap-1">
                <p className="font-mono font-bold text-brand-primary text-2xl tracking-tighter">
                  ₹{breakdown.weekly_premium.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Coverage Cap */}
        <motion.div 
          className="bg-surface p-4 rounded-xl border border-surface-border/50 transition-all duration-300 col-span-2 sm:col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: (activeFactors.length + 1) * 0.1 }}
        >
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2 font-mono">Coverage limit</p>
          <p className="font-mono text-status-success text-2xl font-bold tracking-tighter">
            ₹{breakdown.coverage_amount.toFixed(2)}
          </p>
        </motion.div>
      </div>
      
      {/* Affordability note */}
      {breakdown.affordability_applied && (
        <motion.div 
          className="mt-3 rounded-lg bg-surface border border-surface-border p-3 text-xs text-text-secondary flex items-start gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Info className="h-4 w-4 text-brand-primary flex-shrink-0 mt-0.5" />
          <p>
            Affordability ceiling applied. Premium capped at 3% of your weekly earnings (₹{breakdown.affordability_cap.toFixed(2)} limit).
          </p>
        </motion.div>
      )}
    </section>
  )
}
