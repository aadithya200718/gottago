import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  adornment?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, adornment, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {adornment && (
            <div className="absolute inset-y-0 left-3 flex items-center text-text-muted text-sm">
              {adornment}
            </div>
          )}
          <input
            type={type}
            id={id}
            className={cn(
              'flex w-full min-h-12 rounded-input border border-surface-border bg-surface px-4 py-3 text-sm text-text-primary',
              'placeholder:text-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-colors duration-150',
              adornment && 'pl-10',
              error && 'border-status-danger focus:ring-status-danger/30',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-status-danger">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
