import { Headset, LifeBuoy, MessageSquareMore, TimerReset } from 'lucide-react'
import { AdminPageShell } from '@/components/admin-page-shell'
import { Button } from '@/components/ui/button'

const SUPPORT_METRICS = [
  { label: 'Open conversations', value: '14', hint: 'Across WhatsApp, phone, and email', icon: Headset },
  { label: 'Median first response', value: '4m 12s', hint: 'Within target SLA', icon: TimerReset },
  { label: 'Escalations today', value: '2', hint: 'Both tied to payout identity checks', icon: LifeBuoy },
]

const QUEUE = [
  { id: 'SUP-201', subject: 'Missed payout confirmation', owner: 'Asha', channel: 'WhatsApp', priority: 'High' },
  { id: 'SUP-198', subject: 'Policy renewal question', owner: 'Dev', channel: 'Phone', priority: 'Medium' },
  { id: 'SUP-194', subject: 'City trigger eligibility', owner: 'Farhan', channel: 'Email', priority: 'Medium' },
  { id: 'SUP-193', subject: 'KYC document mismatch', owner: 'Nidhi', channel: 'WhatsApp', priority: 'High' },
]

export default function AdminSupportPage() {
  return (
    <AdminPageShell
      eyebrow="Ops Desk"
      title="Support console"
      description="Track worker issues, response SLAs, and escalation queues so demo operators can narrate the service workflow clearly."
      actions={
        <>
          <Button variant="outline" className="border-surface-border bg-transparent">
            Open macros
          </Button>
          <Button className="bg-brand-primary text-[#031018] hover:brightness-110">
            Create priority case
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {SUPPORT_METRICS.map((item) => {
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr,0.9fr]">
        <div className="rounded-xl border border-surface-border bg-surface-card">
          <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Active support queue</h2>
              <p className="text-sm text-text-secondary">Cases that are currently in motion.</p>
            </div>
            <MessageSquareMore className="h-5 w-5 text-text-muted" />
          </div>
          <div className="divide-y divide-surface-border/50">
            {QUEUE.map((ticket) => (
              <div key={ticket.id} className="flex flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-mono text-xs text-brand-primary">{ticket.id}</p>
                  <h3 className="mt-1 text-sm font-semibold text-text-primary">{ticket.subject}</h3>
                  <p className="mt-1 text-sm text-text-secondary">Owner: {ticket.owner} • Channel: {ticket.channel}</p>
                </div>
                <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary">
                  {ticket.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-6">
          <h2 className="text-lg font-semibold text-text-primary">Demo talk-track</h2>
          <div className="mt-6 space-y-4 text-sm text-text-secondary">
            <div className="rounded-xl border border-surface-border bg-surface p-4">
              Explain that support sees claim state, payout rail, and city trigger context in one console.
            </div>
            <div className="rounded-xl border border-surface-border bg-surface p-4">
              Show that high-priority tickets are escalated when identity checks delay automated payout release.
            </div>
            <div className="rounded-xl border border-surface-border bg-surface p-4">
              Mention that workers can resolve most cases without leaving WhatsApp.
            </div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  )
}
