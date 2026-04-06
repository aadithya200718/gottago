import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-700/50', className)}
    />
  )
}

export function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} />
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-xl bg-slate-800/30 border border-slate-700 p-4 space-y-3', className)}>
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

export function SkeletonChart({ className }: SkeletonProps) {
  return (
    <div className={cn('h-64 bg-slate-800/30 rounded-xl flex items-end gap-2 p-4', className)}>
      {[40, 65, 30, 80, 55, 70, 45].map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-slate-700/50 rounded-t animate-pulse"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  )
}
