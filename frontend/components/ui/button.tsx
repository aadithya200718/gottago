import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button text-sm font-semibold ring-offset-surface transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-target',
  {
    variants: {
      variant: {
        default:
          'bg-brand-primary text-[#0a0f1a] hover:bg-brand-primary-hover shadow-[4px_4px_0_#0a0f1a] border-2 border-brand-primary hover:shadow-solid-primary  active:translate-y-1 active:translate-x-1 active:shadow-none',
        outline:
          'border border-surface-border bg-transparent text-text-primary hover:bg-surface-card hover:border-brand-primary/50',
        ghost:
          'bg-transparent text-text-secondary hover:bg-surface-card hover:text-text-primary',
        destructive:
          'bg-status-danger/10 text-status-danger border border-status-danger/30 hover:bg-status-danger/20',
        success:
          'bg-status-success/10 text-status-success border border-status-success/30 hover:bg-status-success/20',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-9 px-4 py-2 text-xs',
        lg: 'h-14 px-8 py-4 text-base',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
