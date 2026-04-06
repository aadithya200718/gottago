import { BellRing, KeyRound, LockKeyhole, ShieldAlert } from 'lucide-react'
import { AdminPageShell } from '@/components/admin-page-shell'
import { Button } from '@/components/ui/button'

const CONTROLS = [
  { label: 'MFA coverage', value: '100%', hint: 'All operator accounts protected', icon: LockKeyhole },
  { label: 'Open alerts', value: '3', hint: 'Two medium, one high priority', icon: ShieldAlert },
  { label: 'Approval quorum', value: '2 of 3', hint: 'Treasury threshold active', icon: KeyRound },
]

const INCIDENTS = [
  {
    title: 'Unusual manual trigger pattern',
    detail: 'Three Delhi overrides fired inside a 12-minute window. Awaiting second approver sign-off.',
    severity: 'High',
  },
  {
    title: 'Failed admin login attempts',
    detail: 'Five blocked attempts from a new ASN. Geo-fencing held access.',
    severity: 'Medium',
  },
  {
    title: 'Expired API key review',
    detail: 'One support automation token expires in 36 hours.',
    severity: 'Low',
  },
]

export default function AdminSecurityPage() {
  return (
    <AdminPageShell
      eyebrow="Trust Layer"
      title="Security operations"
      description="Monitor access posture, approval controls, and incident queues across admin actions and payout triggers."
      actions={
        <>
          <Button variant="outline" className="border-surface-border bg-transparent">
            View audit log
          </Button>
          <Button className="bg-brand-primary text-[#031018] hover:brightness-110">
            Rotate credentials
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {CONTROLS.map((item) => {
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
        <div className="rounded-xl border border-surface-border bg-surface-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Incident queue</h2>
              <p className="text-sm text-text-secondary">Events requiring operator validation.</p>
            </div>
            <BellRing className="h-5 w-5 text-text-muted" />
          </div>
          <div className="mt-6 space-y-4">
            {INCIDENTS.map((incident) => (
              <div key={incident.title} className="rounded-xl border border-surface-border bg-surface p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{incident.title}</h3>
                    <p className="mt-2 text-sm text-text-secondary">{incident.detail}</p>
                  </div>
                  <span className="rounded-full bg-status-warning/10 px-3 py-1 text-xs font-medium text-status-warning">
                    {incident.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-6">
          <h2 className="text-lg font-semibold text-text-primary">Control checklist</h2>
          <div className="mt-6 space-y-4 text-sm text-text-secondary">
            <div className="rounded-xl border border-surface-border bg-surface p-4">
              Multi-sig approvals are enforced for manual disruption triggers.
            </div>
            <div className="rounded-xl border border-surface-border bg-surface p-4">
              Session expiry is set to 15 minutes for all privileged accounts.
            </div>
            <div className="rounded-xl border border-surface-border bg-surface p-4">
              Treasury exports remain read-only until a second approver signs off.
            </div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  )
}
