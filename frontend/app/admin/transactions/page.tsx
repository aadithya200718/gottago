import { ArrowDownLeft, ArrowUpRight, Clock3, ReceiptText } from 'lucide-react'
import { AdminPageShell } from '@/components/admin-page-shell'
import { Button } from '@/components/ui/button'

const SUMMARY = [
  { label: 'Settled today', value: 'Rs. 4.2L', hint: '128 successful disbursals', icon: ArrowUpRight },
  { label: 'Queued transfers', value: '19', hint: 'Awaiting treasury window', icon: Clock3 },
  { label: 'Chargeback watch', value: '2', hint: 'Flagged for review', icon: ArrowDownLeft },
]

const TRANSACTIONS = [
  { id: 'TXN-7841', worker: 'Arjun P.', city: 'Mumbai', amount: 'Rs. 480', rail: 'UPI', status: 'Settled' },
  { id: 'TXN-7840', worker: 'Sana R.', city: 'Delhi', amount: 'Rs. 360', rail: 'Wallet', status: 'Queued' },
  { id: 'TXN-7838', worker: 'Imran K.', city: 'Bengaluru', amount: 'Rs. 300', rail: 'UPI', status: 'Settled' },
  { id: 'TXN-7835', worker: 'Nisha T.', city: 'Delhi', amount: 'Rs. 240', rail: 'Bank', status: 'Review' },
]

export default function AdminTransactionsPage() {
  return (
    <AdminPageShell
      eyebrow="Treasury Rail"
      title="Transaction monitor"
      description="Audit payout movement across payment rails, queued settlements, and exceptions that need manual approval."
      actions={
        <>
          <Button variant="outline" className="border-surface-border bg-transparent">
            Download audit CSV
          </Button>
          <Button className="bg-brand-primary text-[#031018] hover:brightness-110">
            Force settlement batch
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {SUMMARY.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-xl border border-surface-border bg-surface-card p-6">
              <Icon className="h-5 w-5 text-brand-primary" />
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
            <h2 className="text-lg font-semibold text-text-primary">Recent transaction flow</h2>
            <p className="text-sm text-text-secondary">Most recent payouts and the current settlement state.</p>
          </div>
          <ReceiptText className="h-5 w-5 text-text-muted" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-border/70 text-[11px] uppercase tracking-[0.22em] text-text-muted">
                <th className="px-6 py-3 font-medium">Transaction</th>
                <th className="px-6 py-3 font-medium">Worker</th>
                <th className="px-6 py-3 font-medium">City</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Rail</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((transaction) => (
                <tr key={transaction.id} className="border-b border-surface-border/40 last:border-b-0">
                  <td className="px-6 py-4 font-mono text-sm text-text-primary">{transaction.id}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{transaction.worker}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{transaction.city}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{transaction.amount}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{transaction.rail}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary">
                      {transaction.status}
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
