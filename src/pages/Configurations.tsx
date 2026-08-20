import { useEffect, useRef, useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { PageHead } from '../components/ui'
import { tokens as t } from '../lib/tokens'
import { useConfig } from '../lib/config'
import { roleMeta, type Role } from '../lib/roles'
import { parties } from '../lib/parties'

const card: React.CSSProperties = { background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6 }
const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: `1px solid ${t.divider3}`, fontSize: 13 }

const tiers: { role: Role; sees: string }[] = [
  { role: 'organizer', sees: 'Every vendor and all festival data — settlement, payouts, configuration.' },
  { role: 'vendorManager', sees: 'Only the vendors assigned to them (e.g. a merch manager over specific artists).' },
  { role: 'vendor', sees: 'Only their own booth — real-time sales and payout status.' },
]

/**
 * Click-to-edit inline number (2026-08-04 task 3).
 * Click the value → input appears → Enter/blur commits, Escape cancels.
 * Validation errors render inline and block the commit.
 */
function InlineNumber({
  value,
  onCommit,
  suffix = '',
  min = 0,
  max,
  decimals = 2,
  title = 'Click to edit',
}: {
  value: number
  onCommit: (v: number) => void
  suffix?: string
  min?: number
  max?: number
  decimals?: number
  title?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) ref.current?.select()
  }, [editing])

  const open = () => {
    setDraft(String(value))
    setError(null)
    setEditing(true)
  }
  const cancel = () => {
    setEditing(false)
    setError(null)
  }
  const commit = () => {
    const n = Number(draft)
    if (draft.trim() === '' || isNaN(n)) return setError('Enter a number')
    if (n < min) return setError(`Must be ≥ ${min}`)
    if (max !== undefined && n > max) return setError(`Must be ≤ ${max}`)
    onCommit(n)
    setEditing(false)
    setError(null)
  }

  if (!editing) {
    return (
      <span
        onClick={open}
        title={title}
        style={{
          display: 'inline-block',
          background: t.editBg,
          border: `1px solid ${t.editBorder}`,
          borderRadius: 3,
          padding: '3px 10px',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'text',
        }}
      >
        {value.toFixed(decimals).replace(/\.00$/, decimals === 0 ? '' : '.00')}
        {suffix}
      </span>
    )
  }
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <input
          ref={ref}
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setError(null) }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') cancel()
          }}
          onBlur={commit}
          inputMode="decimal"
          style={{
            width: 74,
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 700,
            textAlign: 'right',
            padding: '3px 8px',
            background: t.editBg,
            border: `1.5px solid ${error ? t.red : t.red}`,
            borderRadius: 3,
            outline: 'none',
          }}
        />
        {suffix && <span style={{ fontSize: 13, fontWeight: 700 }}>{suffix}</span>}
      </span>
      {error && <span style={{ fontSize: 10.5, color: t.red, fontWeight: 600 }}>{error}</span>}
    </span>
  )
}

/** Read-only system value — visually distinct from editable yellow fields. */
function LockedValue({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: t.rowBg, border: `1px solid ${t.cardBorder}`, borderRadius: 3, padding: '3px 10px', fontWeight: 600, color: t.secondary }}>
      {children} <span style={{ fontSize: 10, color: t.faint }}>🔒</span>
    </span>
  )
}

function Flag({ on }: { on: boolean }) {
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, borderRadius: 999, padding: '2px 10px', background: on ? t.redTintBg : '#f5f5f5', color: on ? t.red : t.muted2, border: `1px solid ${on ? t.redTintBorder : '#e0e0e0'}` }}>
      {on ? 'required' : 'optional'}
    </span>
  )
}

export default function Configurations() {
  const { cfg, setFee, setAttendance, setItemsPerBox, setDefaultSplit } = useConfig()

  const feeRows = [
    { key: 'salesTaxPct' as const, label: 'Sales tax', note: 'inclusive · retained by venue' },
    { key: 'creditCardPct' as const, label: 'Credit card fee', note: 'on credit receipts' },
    { key: 'concessionairePct' as const, label: 'Concessionaire', note: 'off top' },
  ]

  return (
    <AdminLayout active="Configurations">
      <main style={{ padding: '20px 24px 32px', maxWidth: 1000 }}>
        <PageHead
          title={`Configurations — ${cfg.event}`}
          subtitle="Click any yellow value to edit it in place — Enter commits, Escape cancels. Edits flow through settlement immediately (re-settlement supported)."
        />

        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Fees — inline editable, per the any-point-editability rule */}
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${t.divider}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.heading }}>Fees &amp; deductions</div>
                <span style={{ fontSize: 11, color: t.muted2 }}>
                  <span style={{ display: 'inline-block', width: 10, height: 10, background: t.editBg, border: `1px solid ${t.editBorder}`, borderRadius: 2, verticalAlign: -1 }} /> click to edit
                </span>
              </div>
              {feeRows.map((f) => (
                <div key={f.key} style={rowStyle}>
                  <div>
                    <b style={{ color: t.heading }}>{f.label}</b> <span style={{ color: t.muted2, fontSize: 12 }}>{f.note}</span>
                  </div>
                  <InlineNumber value={cfg.fees[f.key]} suffix="%" min={0} max={100} onCommit={(v) => setFee(f.key, v)} />
                </div>
              ))}
              <div style={{ padding: '11px 18px', fontSize: 11.5, color: t.muted2, lineHeight: 1.5 }}>
                Rates are editable at any point in the settlement flow — changing one after a settlement has been
                generated recomputes it (re-settlement). The advance record below keeps the contracted provenance.
              </div>
            </div>

            {/* Deal terms + shipping defaults */}
            <div style={card}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.divider}`, fontSize: 14, fontWeight: 700, color: t.heading }}>Deal terms &amp; defaults</div>
              <div style={rowStyle}>
                <span style={{ color: t.secondary }}>Default split (vendor / venue)</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <InlineNumber value={cfg.defaultSplit.vendor} suffix="%" min={0} max={100} decimals={0} onCommit={setDefaultSplit} />
                  <span style={{ fontSize: 13, color: t.muted2 }}>/ {cfg.defaultSplit.venue}%</span>
                </span>
              </div>
              <div style={rowStyle}>
                <span style={{ color: t.secondary }}>Attendance <span style={{ fontSize: 11.5, color: t.muted2 }}>drives per-head metrics</span></span>
                <InlineNumber value={cfg.attendance} min={1} decimals={0} onCommit={setAttendance} />
              </div>
              <div style={rowStyle}>
                <span style={{ color: t.secondary }}>Items per shipping box <span style={{ fontSize: 11.5, color: t.muted2 }}>default for label generation · override per shipment</span></span>
                <InlineNumber value={cfg.itemsPerBox} min={1} decimals={0} onCommit={setItemsPerBox} />
              </div>
              <div style={{ ...rowStyle, borderBottom: 'none' }}>
                <span style={{ color: t.secondary }}>Event</span>
                <LockedValue>{cfg.event} · {cfg.date}</LockedValue>
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
            </div>
            <div style={{ background: t.rowBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '14px 18px', fontSize: 12.5, color: t.secondary, lineHeight: 1.5 }}>
              <b style={{ color: t.heading }}>Contracted at advance</b> by {cfg.lockedBy} on {cfg.lockedAt}. Kept as
              provenance — later edits are allowed and tracked against this baseline.
            </div>
          </div>
        </div>

        {/* Per-party sign-off flags */}
        <div style={{ ...card, marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${t.divider}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.heading }}>Sign-off requirements by party</div>
            <div style={{ fontSize: 11, color: t.muted2 }}>initial sign-off never blocks selling · one signer per vendor</div>
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
                  <td style={{ padding: '10px 16px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'center' }}><Flag on={p.requiresInitialSignOff} /></td>
                  <td style={{ padding: '10px 16px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'center' }}><Flag on={p.requiresSettlementSignOff} /></td>
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
