import { AdminLayout } from '../components/AdminLayout'
import { Btn, PageHead } from '../components/ui'
import { tokens as t } from '../lib/tokens'
import { eventConfig as cfg } from '../lib/config'
import { roleMeta, type Role } from '../lib/roles'
import { parties } from '../lib/parties'

const card: React.CSSProperties = { background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6 }
const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: `1px solid ${t.divider3}`, fontSize: 13 }

const tiers: { role: Role; sees: string }[] = [
  { role: 'organizer', sees: 'Every vendor and all festival data — settlement, payouts, configuration.' },
  { role: 'vendorManager', sees: 'Only the vendors assigned to them (e.g. a merch manager over specific artists).' },
  { role: 'vendor', sees: 'Only their own booth — real-time sales and payout status.' },
]

function Flag({ on }: { on: boolean }) {
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, borderRadius: 999, padding: '2px 10px', background: on ? t.redTintBg : '#f5f5f5', color: on ? t.red : t.muted2, border: `1px solid ${on ? t.redTintBorder : '#e0e0e0'}` }}>
      {on ? 'required' : 'optional'}
    </span>
  )
}

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
          title="Configurations — Furnace Fest 2026"
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

        {/* Per-party sign-off flags — these drive the flow when a party is brought in */}
        <div style={{ ...card, marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${t.divider}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.heading }}>Sign-off requirements by party</div>
            <div style={{ fontSize: 11, color: t.muted2 }}>initial sign-off never blocks selling</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                {['PARTY', 'TYPE', 'CATEGORY', 'INITIAL SIGN-OFF', 'SETTLEMENT SIGN-OFF', 'STRIPE'].map((h, i) => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 700, color: t.muted, borderBottom: '1px solid #eee', textAlign: i > 2 ? 'center' : 'left', padding: '9px 16px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parties.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: '10px 16px', borderBottom: `1px solid ${t.divider3}`, fontWeight: 700, color: t.heading }}>{p.name}</td>
                  <td style={{ padding: '10px 16px', borderBottom: `1px solid ${t.divider3}` }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, borderRadius: 999, padding: '2px 9px', background: p.kind === 'artist' ? t.redTintBg : '#f2f7f2', color: p.kind === 'artist' ? t.red : t.greenText, border: `1px solid ${p.kind === 'artist' ? t.redTintBorder : t.greenBorder}` }}>
                      {p.kind === 'artist' ? 'Artist' : 'Vendor'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: `1px solid ${t.divider3}`, color: t.secondary }}>{p.category}</td>
                  <td style={{ padding: '10px 16px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'center' }}>
                    <Flag on={p.requiresInitialSignOff} />
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'center' }}>
                    <Flag on={p.requiresSettlementSignOff} />
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: p.stripe === 'connected' ? t.greenText : p.stripe === 'invited' ? '#8a5d12' : t.red }}>
                    {p.stripe === 'connected' ? '✓ connected' : p.stripe === 'invited' ? '⏳ invited' : '⚑ none'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '11px 18px', fontSize: 11.5, color: t.muted2 }}>
            <code style={{ fontSize: 11 }}>requiresInitialSignOff</code> / <code style={{ fontSize: 11 }}>requiresSettlementSignOff</code> live on the party object and drive the flow when that party is brought into a show.
          </div>
        </div>
      </main>
    </AdminLayout>
  )
}
