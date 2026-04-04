'use client'

import { NavBar } from '@/components/nav-bar'
import { ErrorBoundary } from '@/components/error-boundary'
import { MainSidebar } from '@/components/main-sidebar'
import { MobileNav } from '@/components/mobile-nav'
import { usePathname } from 'next/navigation'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboardOrAdmin = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  return (
    <>
      {!isDashboardOrAdmin && <NavBar />}
      {isDashboardOrAdmin && <MainSidebar />}
      <ErrorBoundary>
        <main className={isDashboardOrAdmin ? "flex-1 md:ml-64 p-0 lg:p-0" : ""}>
          {children}
        </main>
      </ErrorBoundary>
      {isDashboardOrAdmin && <MobileNav />}
    </>
  )
}
