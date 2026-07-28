import { AdminLayout } from '../components/AdminLayout'
import { Btn, PageHead } from '../components/ui'
import { tokens as t } from '../lib/tokens'
import { eventConfig as cfg } from '../lib/config'
import { roleMeta, type Role } from '../lib/roles'

const card: React.CSSProperties = { background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6 }
const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: `1px solid ${t.divider3}`, fontSize: 13 }

const tiers: { role: Role; sees: string }[] = [
  { role: 'organizer', sees: 'Every vendor and all festival data — settlement, payouts, configuration.' },
  { role: 'vendorManager', sees: 'Only the vendors assigned to them (e.g. a merch manager over specific artists).' },
  { role: 'vendor', sees: 'Only their own booth — real-time sales and payout status.' },
]

export default function Configurations() {
  const feeRows = [
    { label: 'Sales tax', note: 'inclusive · retained by venue', value: `${cfg.fees.salesTaxPct.toFixed(2)}%` },
    { label: 'Credit card fee', note: 'on credit receipts', value: `${cfg.fees.creditCardPct.toFixed(2)}%` },
    { label: 'Concessionaire', note: 'off top', value: `${cfg.fees.concessionairePct.toFixed(2)}%` },
  ]
  return (
    <AdminLayout active="Configurations">
      <main style={{ padding: '20px 24px 32px', maxWidth: 1000 }}>
        <PageHead
          title="Configurations — Spring Music Fest 2026"
          subtitle="Contracted rates, splits, and permissions. Fee fields are set pre-event and locked before the show."
          actions={<Btn>Edit configuration</Btn>}
        />

        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Locked fees */}
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${t.divider}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.heading }}>Fees &amp; deductions</div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: t.greenText, background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 999, padding: '3px 10px' }}>
                  🔒 Locked pre-event
                </span>
              </div>
              {feeRows.map((f) => (
                <div key={f.label} style={rowStyle}>
                  <div>
                    <b style={{ color: t.heading }}>{f.label}</b> <span style={{ color: t.muted2, fontSize: 12 }}>{f.note}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <b style={{ fontSize: 14 }}>{f.value}</b>
                    <span style={{ fontSize: 10.5, color: t.faint }}>🔒</span>
                  </div>
                </div>
              ))}
              <div style={{ padding: '11px 18px', fontSize: 11.5, color: t.muted2 }}>
                These contracted rates flow into every settlement as read-only lines. Editing requires unlocking before the event —
                at settlement they can't be changed, only custom deductions can be added.
              </div>
            </div>

            {/* Split + attendance */}
            <div style={card}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.divider}`, fontSize: 14, fontWeight: 700, color: t.heading }}>Deal terms</div>
              <div style={rowStyle}>
                <span style={{ color: t.secondary }}>Default split (vendor / venue)</span>
                <b>{cfg.defaultSplit.vendor}% / {cfg.defaultSplit.venue}%</b>
              </div>
              <div style={rowStyle}>
                <span style={{ color: t.secondary }}>Split locked</span>
                <b>at advance · read-only at settlement</b>
              </div>
              <div style={{ ...rowStyle, borderBottom: 'none' }}>
                <span style={{ color: t.secondary }}>Attendance (drives per-head metrics)</span>
                <b>{cfg.attendance.toLocaleString()}</b>
              </div>
            </div>
          </div>

          {/* Permission tiers */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={card}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.divider}`, fontSize: 14, fontWeight: 700, color: t.heading }}>Permission tiers</div>
              {tiers.map((tier, i) => (
                <div key={tier.role} style={{ padding: '12px 18px', borderBottom: i < tiers.length - 1 ? `1px solid ${t.divider3}` : 'none', display: 'flex', gap: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', flex: 'none', background: roleMeta[tier.role].avatarBg, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {roleMeta[tier.role].initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: t.heading }}>{roleMeta[tier.role].label}</div>
                    <div style={{ fontSize: 11.5, color: t.secondary, marginTop: 2, lineHeight: 1.45 }}>{tier.sees}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: '11px 18px', fontSize: 11.5, color: t.muted2 }}>
                Switch tiers from the “Viewing as” control in the top bar to preview each scope.
              </div>
            </div>
            <div style={{ background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 6, padding: '14px 18px', fontSize: 12.5, color: t.greenText, lineHeight: 1.5 }}>
              <b>Locked by {cfg.lockedBy}</b> on {cfg.lockedAt}. Rates are frozen for the event so settlement math is reproducible and disputes reference a single source of truth.
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  )
}
