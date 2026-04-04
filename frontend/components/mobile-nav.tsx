'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, Shield, User, History, HelpCircle } from 'lucide-react'

const DASHBOARD_MOBILE_NAV_ITEMS = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: Wallet, label: 'Vault', href: '/dashboard/vault' },
  { icon: Shield, label: 'Security', href: '/dashboard/security' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
]

const ADMIN_MOBILE_NAV_ITEMS = [
  { icon: Home, label: 'Overview', href: '/admin' },
  { icon: Wallet, label: 'Vaults', href: '/admin/vaults' },
  { icon: History, label: 'Transfers', href: '/admin/transactions' },
  { icon: Shield, label: 'Security', href: '/admin/security' },
  { icon: HelpCircle, label: 'Support', href: '/admin/support' },
]

export function MobileNav() {
  const pathname = usePathname()

  // Only show on dashboard routes for mobile
  if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/admin')) {
    return null
  }

  const navItems = pathname.startsWith('/admin')
    ? ADMIN_MOBILE_NAV_ITEMS
    : DASHBOARD_MOBILE_NAV_ITEMS

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#000000]/95 backdrop-blur-md flex justify-around items-center px-4 py-3 pb-safe z-50 border-t border-[#384869]/20 shadow-[0px_-4px_20px_rgba(0,0,0,0.4)]">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = item.href === '/dashboard' || item.href === '/admin'
          ? pathname === item.href
          : pathname.startsWith(item.href)
        
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center rounded-xl px-4 py-1 transition-transform active:scale-90 ${
              isActive
                ? 'bg-brand-primary/20 text-brand-primary'
                : 'text-text-secondary active:bg-surface-card hover:text-text-primary'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="font-sans text-[10px] font-medium uppercase tracking-widest mt-1">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
