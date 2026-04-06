import { Wallet, ArrowUpRight, ShieldCheck, Landmark } from 'lucide-react'
import { AdminPageShell } from '@/components/admin-page-shell'
import { Button } from '@/components/ui/button'

const VAULTS = [
  {
    name: 'Mumbai Monsoon Pool',
    balance: 'Rs. 18.4L',
    utilization: '62%',
    runway: '11 days',
    status: 'Healthy',
  },
  {
    name: 'Delhi Heat Reserve',
    balance: 'Rs. 11.2L',
    utilization: '48%',
    runway: '17 days',
    status: 'Stable',
  },
  {
    name: 'National AQI Buffer',
    balance: 'Rs. 7.9L',
    utilization: '71%',
    runway: '8 days',
    status: 'Watchlist',
  },
]

const KPIS = [
  { label: 'Total protected liquidity', value: 'Rs. 37.5L', hint: '+4.8% week-over-week', icon: Wallet },
  { label: 'Emergency buffer ratio', value: '1.82x', hint: 'Above solvency threshold', icon: ShieldCheck },
  { label: 'Pending top-ups', value: '3', hint: 'Next sweep at 18:00 IST', icon: Landmark },
]

export default function AdminVaultsPage() {
  return (
    <AdminPageShell
      eyebrow="Capital Command"
      title="Vault control center"
      description="Track liquidity pools, review utilization, and monitor runway before automated rebalancing kicks in."
      actions={
        <>
          <Button variant="outline" className="border-surface-border bg-transparent">
            Export vault ledger
          </Button>
          <Button className="bg-brand-primary text-[#031018] hover:brightness-110">
            Queue rebalance
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {KPIS.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-xl border border-surface-border bg-surface-card p-6">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-brand-primary" />
                <ArrowUpRight className="h-4 w-4 text-text-muted" />
              </div>
              <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-text-muted">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-text-primary">{item.value}</p>
              <p className="mt-2 text-sm text-text-secondary">{item.hint}</p>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-surface-border bg-surface-card">
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Active pools</h2>
            <p className="text-sm text-text-secondary">Live liquidity and reserve pressure by region.</p>
          </div>
          <span className="rounded-full bg-status-success/10 px-3 py-1 text-xs font-medium text-status-success">
            Auto-sweep enabled
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-border/70 text-[11px] uppercase tracking-[0.22em] text-text-muted">
                <th className="px-6 py-3 font-medium">Vault</th>
                <th className="px-6 py-3 font-medium">Balance</th>
                <th className="px-6 py-3 font-medium">Utilization</th>
                <th className="px-6 py-3 font-medium">Runway</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {VAULTS.map((vault) => (
                <tr key={vault.name} className="border-b border-surface-border/40 last:border-b-0">
                  <td className="px-6 py-4 text-sm font-medium text-text-primary">{vault.name}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{vault.balance}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{vault.utilization}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{vault.runway}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary">
                      {vault.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageShell>
  )
}
