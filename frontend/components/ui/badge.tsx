import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand-primary/15 text-brand-primary border border-brand-primary/30',
        success: 'bg-status-success-bg text-status-success border border-status-success/30',
        warning: 'bg-status-warning-bg text-status-warning border border-status-warning/30',
        danger: 'bg-status-danger-bg text-status-danger border border-status-danger/30',
        outline: 'border border-surface-border text-text-secondary',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
