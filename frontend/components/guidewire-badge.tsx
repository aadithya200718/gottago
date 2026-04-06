import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GuidewireBadgeProps {
  className?: string
  showTooltip?: boolean
}

export function GuidewireBadge({ className, showTooltip = true }: GuidewireBadgeProps) {
  return (
    <div
      className={cn(
        'group relative inline-flex items-center gap-1.5 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-2.5 py-1 text-xs font-medium text-brand-primary',
        className
      )}
      title={
        showTooltip
          ? 'In production, this maps to Guidewire PolicyCenter/ClaimCenter REST API'
          : undefined
      }
    >
      <Shield className="h-3 w-3" />
      <span>Guidewire</span>
      {showTooltip && (
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-52 rounded-md bg-surface-card border border-surface-border p-2 text-[10px] text-text-secondary shadow-card group-hover:block z-50">
          Production mapping: Guidewire PolicyCenter / ClaimCenter / BillingCenter REST API
        </div>
      )}
    </div>
  )
}
