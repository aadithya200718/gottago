'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Wallet,
  History,
  Shield,
  HelpCircle,
  LogOut,
} from 'lucide-react'

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
  { icon: Wallet, label: 'Vaults', href: '/admin/vaults' },
  { icon: History, label: 'Transactions', href: '/admin/transactions' },
  { icon: Shield, label: 'Security', href: '/admin/security' },
  { icon: HelpCircle, label: 'Support', href: '/admin/support' },
]

export function MainSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#000000] border-r border-[#384869]/20 p-4 z-50">
      <div className="mb-10 px-4 mt-2">
        <h1 className="text-lg font-black text-[#7bd0ff]">GottaGO</h1>
        <p className="text-[10px] tracking-widest text-[#9babd2] font-mono opacity-60">SOVEREIGN VAULT</p>
      </div>
      
      <nav className="flex-1 space-y-2">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/admin'
            ? pathname === item.href
            : pathname.startsWith(item.href)
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out ${
                isActive
                  ? 'bg-brand-primary/20 text-brand-primary' // #004c69 with #7bd0ff
                  : 'text-text-secondary hover:bg-surface-card hover:text-text-primary'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-sans text-sm tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </nav>
      
      <div className="mt-auto pt-4 border-t border-surface-border">
        <button className="w-full flex items-center gap-3 text-text-secondary px-4 py-3 hover:bg-surface-card hover:text-text-primary transition-all duration-200 ease-in-out rounded-lg">
          <LogOut className="h-5 w-5" />
          <span className="font-sans text-sm tracking-wide">Logout</span>
        </button>
      </div>
    </aside>
  )
}
