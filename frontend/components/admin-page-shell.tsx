import { ReactNode } from 'react'

interface AdminPageShellProps {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
}

export function AdminPageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: AdminPageShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.32em] text-text-muted">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-text-secondary">
              {description}
            </p>
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {children}
      </div>
    </div>
  )
}
