import { useState } from 'react'
import { tokens as t, money } from '../lib/tokens'
import { Btn } from '../components/ui'
import { Modal } from '../components/overlays'
import { useCounts } from '../lib/counts'
import { useSignOff } from '../lib/signoff'
import { useConfig } from '../lib/config'
import { useAdvance } from '../lib/advance'
import { partyById, type Contact } from '../lib/parties'
import { kindConfig, isConsumable, attributeFor } from '../lib/catalog'

type Stage = 'queued' | 'sent' | 'landed'
type Tab = 'today' | 'settlement' | 'advance' | 'catalog' | 'shipping' | 'history'

const bars = [14, 22, 34, 30, 48, 62, 55, 78, 100, 86]
const barColors = ['#eedddd', '#eedddd', '#e7c2c1', '#e7c2c1', '#dd9997', '#dd9997', '#d4706d', '#d4706d', '#c8201d', '#c8201d']

const feed = [
  { t: '10:47 PM', txt: 'Black Logo Tee · L ×2', amt: '$80' },
  { t: '10:46 PM', txt: 'Circle Logo Hoodie · M', amt: '$60' },
  { t: '10:44 PM', txt: 'Black Logo Tee · XL', amt: '$40' },
  { t: '10:43 PM', txt: 'Red/White Trucker Hat', amt: '$18' },
  { t: '10:41 PM', txt: 'Black Logo Tee · M ×3', amt: '$120' },
]

const field: React.CSSProperties = { width: '100%', padding: '8px 10px', border: `1px solid ${t.inputBorder}`, borderRadius: 4, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }
const label: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, color: t.muted, marginBottom: 5 }
const card: React.CSSProperties = { background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 8 }

export default function VendorPortal() {
  const [tab, setTab] = useState<Tab>('today')
  const [stage, setStage] = useState<Stage>('queued')
  const [bellOpen, setBellOpen] = useState(false)
  const { partyId } = useCounts()
  const party = partyById(partyId)
  const cfgK = kindConfig[party.kind]
  const signoff = useSignOff()
  const advance = useAdvance()
  const ready = advance.readinessSummary(partyId)

  const sent = stage === 'sent' || stage === 'landed'
  const landed = stage === 'landed'
  const stageLabel = landed ? 'PAID ✓' : sent ? 'SENT' : 'QUEUED'
  const stageColor = landed ? t.greenText : t.red
  const stageNote = landed ? 'Landed Monday 9:14 AM' : sent ? 'Sent — lands next business day' : 'Scheduled Mon May 18'

  // ---- Notifications (2026-08-04 review, task 2): the sign-off request must be
  // unmissable in the portal, for BOTH vendor types, from any tab. ----
  const signerName = signoff.settlement.contact?.name ?? party.contact.name
  const notifications: { id: string; icon: string; txt: string; sub: string; go: Tab }[] = []
  if (signoff.settlement.status === 'requested') {
    notifications.push({
      id: 'settle-sign',
      icon: '✍️',
      txt: 'Settlement ready for e-signature',
      sub: `Awaiting signature from ${signerName} · sent ${signoff.settlement.at} via ${signoff.settlement.channel}`,
      go: 'settlement',
    })
  }
  if (signoff.initial.status === 'requested') {
    notifications.push({
      id: 'initial-sign',
      icon: '#',
      txt: 'Initial count confirmation requested',
      sub: `Awaiting confirmation from ${signoff.initial.contact?.name ?? party.contact.name}`,
      go: 'today',
    })
  }
  if (!ready.complete) {
    notifications.push({
      id: 'advance',
      icon: '☑',
      txt: `Advance incomplete — ${ready.done}/${ready.total} items done`,
      sub: 'Finish your advance so day-of runs itself',
      go: 'advance',
    })
  }

  const tabs: { id: Tab; label: string; badge?: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'settlement', label: 'Settlement', badge: signoff.settlement.status === 'requested' ? '1' : undefined },
    { id: 'advance', label: 'Advance', badge: ready.complete ? undefined : String(ready.total - ready.done) },
    { id: 'catalog', label: 'Catalog' },
    { id: 'shipping', label: party.kind === 'artist' ? 'Shipping & Labels' : 'Pack-out & Labels' },
    { id: 'history', label: 'History' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: t.pageBg, color: t.body, fontFamily: t.font }}>
      <header style={{ background: t.cardBg, borderBottom: `1px solid ${t.cardBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '.14em', color: t.heading }}>RONIN</span>
            <span style={{ fontSize: 11, letterSpacing: '.18em', color: '#8a8a8a', fontWeight: 600 }}>{cfgK.portalName}</span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: t.secondary2, background: t.pageBg, border: `1px solid ${t.cardBorder}`, borderRadius: 999, padding: '3px 10px' }}>🔗 Remote view · no on-site access needed</span>
          <div style={{ fontSize: 12.5, color: t.secondary2 }}>Furnace Fest 2026 <span style={{ color: '#bbbbbb' }}>·</span> Sat May 16</div>

          {/* Notification bell — settlement sign-off requests surface here (task 2) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setBellOpen((o) => !o)}
              title="Notifications"
              style={{ fontFamily: 'inherit', fontSize: 16, background: bellOpen ? t.pageBg : 'none', border: `1px solid ${bellOpen ? t.cardBorder : 'transparent'}`, borderRadius: 6, padding: '4px 8px', cursor: 'pointer', position: 'relative', lineHeight: 1 }}
            >
              🔔
              {notifications.length > 0 && (
                <span style={{ position: 'absolute', top: -3, right: -3, background: t.red, color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 999, padding: '1px 5px', border: '1.5px solid #fff' }}>{notifications.length}</span>
              )}
            </button>
            {bellOpen && (
              <div style={{ position: 'absolute', right: 0, top: 34, width: 330, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 8, boxShadow: '0 8px 28px rgba(0,0,0,.14)', zIndex: 40, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${t.divider}`, fontSize: 12, fontWeight: 700, color: t.heading }}>Notifications</div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '18px 14px', fontSize: 12, color: t.muted2, textAlign: 'center' }}>You're all caught up.</div>
                ) : (
                  notifications.map((n, i) => (
                    <div
                      key={n.id}
                      onClick={() => { setTab(n.go); setBellOpen(false) }}
                      style={{ display: 'flex', gap: 10, padding: '11px 14px', borderBottom: i < notifications.length - 1 ? `1px solid ${t.divider3}` : 'none', cursor: 'pointer', background: n.id === 'settle-sign' ? t.redTintBg : 'transparent' }}
                    >
                      <span style={{ fontSize: 15 }}>{n.icon}</span>
                      <div style={{ fontSize: 12, lineHeight: 1.4 }}>
                        <b style={{ color: n.id === 'settle-sign' ? t.red : t.heading }}>{n.txt}</b>
                        <div style={{ color: t.muted2, marginTop: 1 }}>{n.sub}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1a1a1a', color: '#fff', fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>TM</div>
            <div style={{ fontSize: 11, lineHeight: 1.25 }}><b>{party.contact.name}</b><br /><span style={{ color: t.muted2 }}>{party.contact.role} · {party.name}</span></div>
          </div>
        </div>
        {/* Portal tabs */}
        <div style={{ display: 'flex', gap: 2, padding: '0 28px', maxWidth: 940, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          {tabs.map((tb) => {
            const on = tab === tb.id
            return (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                style={{
                  fontFamily: 'inherit', fontSize: 12.5, fontWeight: on ? 700 : 600, padding: '10px 14px',
                  border: 'none', background: 'none', cursor: 'pointer',
                  color: on ? t.red : t.secondary2,
                  borderBottom: `2.5px solid ${on ? t.red : 'transparent'}`,
                }}
              >
                {tb.label}
                {tb.badge && (
                  <span style={{ marginLeft: 6, background: t.red, color: '#fff', fontSize: 9.5, fontWeight: 700, borderRadius: 999, padding: '1px 6px' }}>{tb.badge}</span>
                )}
              </button>
            )
          })}
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: '0 auto', padding: '24px 24px 44px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: t.heading }}>{party.name}</h1>
            <div style={{ fontSize: 12.5, color: t.secondary2, marginTop: 4 }}>{party.location} · Saturday, May 16, 2026</div>
          </div>
          {tab === 'today' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: t.redTintBg, border: `1px solid ${t.redTintBorder}`, borderRadius: 999, padding: '6px 14px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.red }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: t.red }}>LIVE — updates as counts close</span>
            </div>
          )}
        </div>

        {/* Signature request banner — visible from any tab, both vendor types (task 2) */}
        {signoff.settlement.status === 'requested' && tab !== 'settlement' && (
          <div style={{ background: t.redTintBg, border: `1.5px solid ${t.redTintBorder}`, borderRadius: 8, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1, fontSize: 13, color: t.body2 }}>
              <b style={{ color: t.red }}>Signature requested.</b> Your settlement statement is ready for e-signature — awaiting signature from <b>{signerName}</b>.
            </div>
            <Btn variant="primary" onClick={() => setTab('settlement')}>Review &amp; sign →</Btn>
          </div>
        )}

        {tab === 'today' && <TodayTab party={party} stage={stage} setStage={setStage} stageLabel={stageLabel} stageColor={stageColor} stageNote={stageNote} sent={sent} landed={landed} />}
        {tab === 'settlement' && <SettlementTab party={party} />}
        {tab === 'advance' && <AdvanceTab party={party} />}
        {tab === 'catalog' && <CatalogTab party={party} />}
        {tab === 'shipping' && <ShippingTab party={party} />}
        {tab === 'history' && <HistoryTab party={party} />}
      </main>
    </div>
  )
}

/* ---------- Today: real-time sales + money timeline ---------- */
function TodayTab({ party, stage, setStage, stageLabel, stageColor, stageNote, sent, landed }: any) {
  const { items, skus, calc, totals } = useCounts()
  const dot3 = { bg: sent ? '#1a1a1a' : t.red, color: '#fff', border: sent ? '#1a1a1a' : t.red, mark: sent ? '✓' : '→' }
  const dot4 = { bg: landed ? t.red : '#fff', color: landed ? '#fff' : t.muted2, border: landed ? t.red : t.faint2, mark: landed ? '✓' : '4' }
  const td: React.CSSProperties = { padding: '9px 10px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }
  const th: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, color: t.muted, borderBottom: '1px solid #eeeeee', textAlign: 'right' }

  const rows = items.map((it) => {
    const list = skus.filter((s) => s.itemId === it.id)
    const agg = list.reduce((a, s) => {
      const c = calc(s)
      return { inC: a.inC + c.totalIn, sold: a.sold + c.physicalSold, left: a.left + s.ending, gross: a.gross + c.physicalGross }
    }, { inC: 0, sold: 0, left: 0, gross: 0 })
    return { name: it.name, ...agg }
  })

  return (
    <>
      <div style={{ ...card, padding: '26px 28px 22px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', color: t.muted2 }}>GROSS SALES TODAY</div>
            <div style={{ fontSize: 44, fontWeight: 800, color: t.heading, letterSpacing: '-.01em', margin: '4px 0 2px' }}>{money(totals.physicalGross)}</div>
            <div style={{ fontSize: 12.5, color: t.secondary2 }}>{totals.physicalSold} units sold · avg {money(totals.physicalGross / Math.max(1, totals.physicalSold), 2)} / unit</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 88, flex: 'none' }}>
            {bars.map((h, i) => <div key={i} style={{ width: 16, height: `${h}%`, background: barColors[i], borderRadius: '2px 2px 0 0' }} />)}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#bbbbbb', marginTop: 6 }}>
          <span>sales by hour</span><span>2pm — 11pm</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
        <div style={{ ...card, flex: 1, padding: '18px 20px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', color: t.muted2 }}>YOUR SPLIT</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: t.heading, margin: '4px 0 2px' }}>{party.splitPct}% <span style={{ fontSize: 12, fontWeight: 600, color: t.greenText2 }}>locked at advance</span></div>
          <div style={{ fontSize: 12.5, color: t.secondary2 }}>Your share so far: <b style={{ color: t.heading }}>{money(totals.physicalGross * 0.649, 2)}</b> of adjusted gross</div>
        </div>
        <div style={{ ...card, flex: 1.3, border: `1px solid ${t.redTintBorder}`, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', color: t.muted2 }}>PAYOUT · STRIPE ACH ····6712</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: stageColor }}>{stageLabel}</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: t.heading, margin: '4px 0 2px' }}>{money(totals.physicalGross * 0.649, 2)}</div>
          <div style={{ fontSize: 12.5, color: t.red, fontWeight: 600 }}>{stageNote} <span style={{ color: t.redOnTint, fontWeight: 500 }}>— 2-day settle, then transfer</span></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ ...card, flex: 1.3, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.divider}`, fontSize: 13.5, fontWeight: 700, color: t.heading }}>Your items</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                <th style={{ ...th, textAlign: 'left', padding: '9px 18px' }}>ITEM</th>
                {['IN', 'SOLD', 'LEFT', 'GROSS'].map((h, i) => <th key={h} style={{ ...th, padding: i === 3 ? '9px 18px' : '9px 10px' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name}>
                  <td style={{ padding: '9px 18px', borderBottom: `1px solid ${t.divider3}`, fontWeight: 600 }}>{r.name}</td>
                  <td style={{ ...td, color: '#666666' }}>{r.inC}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{r.sold}</td>
                  <td style={{ ...td, color: '#666666' }}>{r.left}</td>
                  <td style={{ ...td, padding: '9px 18px', fontWeight: 600 }}>{money(r.gross)}</td>
                </tr>
              ))}
              <tr style={{ background: t.rowBg2 }}>
                <td style={{ padding: '9px 18px', fontWeight: 700 }}>Total</td>
                <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700 }}>{totals.totalIn}</td>
                <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700 }}>{totals.physicalSold}</td>
                <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700 }}>{totals.ending}</td>
                <td style={{ padding: '9px 18px', textAlign: 'right', fontWeight: 700 }}>{money(totals.physicalGross)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ ...card, flex: 1, padding: '16px 18px' }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading, marginBottom: 12 }}>Money timeline</div>
          <TimelineNode mark="✓" bg="#1a1a1a" color="#fff" border="#1a1a1a" title="Count out finalized" sub="Sat 11:40 PM" line />
          <TimelineNode mark="✓" bg="#1a1a1a" color="#fff" border="#1a1a1a" title="Settlement reconciled" sub="Sat 11:52 PM · statement sent" line />
          <TimelineNode mark={dot3.mark} bg={dot3.bg} color={dot3.color} border={dot3.border} title="Payout scheduled · Stripe ACH" sub="Mon May 18 · after 2-day settle" line />
          <TimelineNode mark={dot4.mark} bg={dot4.bg} color={dot4.color} border={dot4.border} title="In your account" sub="Tue, next business day" />
        </div>
      </div>

      <div style={{ ...card, overflow: 'hidden', marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${t.divider}` }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading }}>Live sales feed</div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: t.red }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.red }} /> streaming
          </span>
        </div>
        {feed.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 18px', borderBottom: i < feed.length - 1 ? `1px solid ${t.divider3}` : 'none', fontSize: 12.5 }}>
            <span style={{ color: t.muted2, fontVariantNumeric: 'tabular-nums', width: 62 }}>{f.t}</span>
            <span style={{ flex: 1, color: t.body2 }}>{f.txt}</span>
            <span style={{ fontWeight: 700, color: t.heading }}>{f.amt}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, fontSize: 11.5, color: t.muted2 }}>
        <span style={{ fontWeight: 700, letterSpacing: '.04em' }}>DEMO STATE · PAYOUT</span>
        {(['queued', 'sent', 'landed'] as const).map((s) => (
          <button key={s} onClick={() => setStage(s)} style={{ fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, padding: '4px 12px', borderRadius: 999, cursor: 'pointer', border: `1.5px solid ${stage === s ? t.red : t.inputBorder}`, color: stage === s ? t.red : t.secondary2, background: stage === s ? t.redTintBg : t.cardBg }}>
            {s}
          </button>
        ))}
      </div>
    </>
  )
}

/* ---------- Settlement: e-signature workflow ---------- */
function SettlementTab({ party }: { party: ReturnType<typeof partyById> }) {
  const signoff = useSignOff()
  const { totals } = useCounts()
  const [typed, setTyped] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [disputeOpen, setDisputeOpen] = useState(false)
  const [dispute, setDispute] = useState('')

  const gross = totals.physicalGross
  const adjusted = gross * 0.811
  const due = adjusted * (party.splitPct / 100)
  const canSign = agreed && typed.trim().length > 2
  const signerName = signoff.settlement.contact?.name ?? party.contact.name

  if (signoff.settlement.status === 'signed') {
    return (
      <div style={{ ...card, padding: '28px 26px', textAlign: 'center' }}>
        <div style={{ fontSize: 34 }}>✓</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.greenText, marginTop: 6 }}>Settlement signed</div>
        <div style={{ fontSize: 12.5, color: t.secondary2, marginTop: 6, lineHeight: 1.6 }}>
          Signed by {signoff.settlement.contact?.name ?? party.contact.name} at {signoff.settlement.at}.<br />
          The countersigned statement is filed under <b>History</b>.
        </div>
      </div>
    )
  }

  if (signoff.settlement.status === 'none') {
    return (
      <div style={{ ...card, padding: '28px 26px', textAlign: 'center', color: t.secondary2 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: t.heading }}>No settlement awaiting signature</div>
        <div style={{ fontSize: 12.5, marginTop: 6 }}>When the merch manager sends the statement, it lands here for e-signature.</div>
      </div>
    )
  }

  return (
    <>
      {signoff.settlement.status === 'disputed' && (
        <div style={{ background: '#fdecea', border: `1px solid ${t.redTintBorder}`, borderRadius: 8, padding: '12px 16px', marginBottom: 14, fontSize: 12.5, color: t.red }}>
          <b>⚑ You flagged a discrepancy.</b> The merch manager has been notified and is reviewing the counts.
        </div>
      )}

      <div style={{ ...card, padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.heading }}>Merchandise settlement · Furnace Fest 2026</div>
          {/* Pending state (task 2): who the festival is waiting on, by name */}
          <span style={{ fontSize: 11, fontWeight: 700, color: '#8a5d12', background: '#fdf6ec', border: '1px solid #f0dcae', borderRadius: 999, padding: '3px 11px', whiteSpace: 'nowrap' }}>
            ⏳ Awaiting signature from {signerName}
          </span>
        </div>
        <div style={{ fontSize: 12, color: t.muted2, marginTop: 3, marginBottom: 16 }}>Statement no. FF26-0516-BC · sent {signoff.settlement.at}</div>

        <div style={{ border: `1px solid ${t.divider}`, borderRadius: 6, padding: '4px 16px', marginBottom: 16, fontSize: 13 }}>
          {[
            ['Gross sales (by physical count)', money(gross, 2), false],
            ['Fees, taxes & deductions', '−' + money(gross - adjusted, 2), false],
            ['Adjusted gross', money(adjusted, 2), false],
            [`Due to you (${party.splitPct}% split, locked)`, money(due, 2), true],
          ].map(([l, v, strong], i, arr) => (
            <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #f3f3f3' : 'none' }}>
              <span style={{ color: '#666666' }}>{l}</span>
              <b style={{ color: strong ? t.red : t.heading, fontSize: strong ? 15 : 13 }}>{v}</b>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11.5, lineHeight: 1.6, color: t.muted, margin: '0 0 16px' }}>
          By typing your name below you certify on behalf of {party.name} that you have reviewed the figures above and,
          to the best of your knowledge, they are correct. This electronic signature carries the same legal effect as a
          handwritten signature.
        </p>

        <div style={{ marginBottom: 12 }}>
          <div style={label}>TYPE YOUR FULL NAME TO SIGN</div>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={party.contact.name}
            style={{ ...field, fontSize: 20, fontFamily: "'Snell Roundhand','Brush Script MT',cursive", fontStyle: 'italic', padding: '10px 14px' }}
          />
        </div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: t.secondary, cursor: 'pointer', marginBottom: 16 }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 2 }} />
          I agree to sign electronically and accept the settlement figures above.
        </label>

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn size="lg" style={{ flex: 1, padding: '11px 0' }} onClick={() => setDisputeOpen(true)}>Flag a discrepancy</Btn>
          <Btn
            variant="primary"
            size="lg"
            style={{ flex: 1.4, padding: '11px 0', opacity: canSign ? 1 : 0.5 }}
            onClick={() => canSign && signoff.resolve('settlement', 'signed')}
          >
            Sign &amp; return statement
          </Btn>
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: t.muted2, marginTop: 10 }}>
          One signer per {party.kind === 'artist' ? 'artist' : 'vendor'} is sufficient. A countersigned PDF is filed to History once the festival signs.
        </div>
      </div>

      <Modal
        open={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        title="Flag a discrepancy"
        width={480}
        footer={
          <>
            <Btn onClick={() => setDisputeOpen(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={() => { signoff.resolve('settlement', 'disputed', dispute); setDisputeOpen(false) }}>Send to merch manager</Btn>
          </>
        }
      >
        <div style={{ fontSize: 12.5, color: t.secondary, marginBottom: 12, lineHeight: 1.5 }}>
          Tell the merch manager what doesn't match. They'll re-open reconciliation and resend.
        </div>
        <textarea value={dispute} onChange={(e) => setDispute(e.target.value)} rows={4} placeholder="e.g. we counted 3 more hoodies out than the statement shows" style={{ ...field, resize: 'vertical' }} />
      </Modal>
    </>
  )
}

/* ---------- Advance: everything squared away before the event (task 7) ---------- */
const csvTemplateCols = ['ITEM NAME', 'CATEGORY', 'SIZE/VARIANT', 'PRICE', 'QTY IN']

function AdvanceTab({ party }: { party: ReturnType<typeof partyById> }) {
  const { partyId } = useCounts()
  const advance = useAdvance()
  const a = advance.get(partyId)
  const checks = advance.readiness(partyId)
  const summary = advance.readinessSummary(partyId)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<Contact>({ name: '', role: '', email: '', phone: '' })
  const [showTemplate, setShowTemplate] = useState(false)

  // Simulated CSV upload: first pass lands with row-level validation errors so the
  // fix-and-re-upload loop is demonstrable; the re-upload comes back clean.
  const simulateUpload = () => {
    advance.set(partyId, {
      inventory: {
        fileName: `${party.id}-inventory.csv`,
        rows: 12,
        errors: [
          { row: 4, message: 'PRICE is blank — every row needs a price' },
          { row: 9, message: 'Unknown size "XXL" — use 2XL (see template)' },
        ],
        uploadedAt: 'just now',
      },
    })
  }
  const simulateReupload = () => {
    advance.set(partyId, {
      inventory: { fileName: `${party.id}-inventory-v2.csv`, rows: 12, errors: [], uploadedAt: 'just now' },
    })
  }

  const inv = a.inventory
  const hasErrors = !!inv && inv.errors.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 7e — readiness checklist */}
      <div style={{ ...card, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading }}>Advance checklist</div>
            <div style={{ fontSize: 11.5, color: t.muted2, marginTop: 2 }}>Knock these out before load-in and day-of runs itself.</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: summary.complete ? t.greenText : t.red }}>
            {summary.done}/{summary.total} {summary.complete ? '· ready ✓' : 'done'}
          </span>
        </div>
        <div style={{ height: 6, background: '#f0f0f0', borderRadius: 999, margin: '12px 0 14px', overflow: 'hidden' }}>
          <div style={{ width: `${(summary.done / summary.total) * 100}%`, height: '100%', background: summary.complete ? t.greenText : t.red, borderRadius: 999 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px 18px' }}>
          {checks.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
              <span style={{ width: 17, height: 17, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: c.done ? t.greenBg : '#f5f5f5', color: c.done ? t.greenText : t.muted2, border: `1px solid ${c.done ? t.greenBorder : t.inputBorder}` }}>{c.done ? '✓' : ''}</span>
              <span style={{ color: c.done ? t.body2 : t.secondary2, fontWeight: c.done ? 600 : 500 }}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7a — inventory CSV upload */}
      <div style={{ ...card, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading }}>Inventory upload</div>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowTemplate((s) => !s) }} style={{ fontSize: 11.5, fontWeight: 700 }}>
            {showTemplate ? 'Hide template ↑' : 'View CSV template ↓'}
          </a>
        </div>
        <div style={{ fontSize: 11.5, color: t.muted2, marginBottom: 12 }}>
          Upload your full catalog as CSV — same shape you'd send AtVenu. We validate every row and tell you exactly what to fix.
        </div>
        {showTemplate && (
          <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, background: '#fafafa', border: `1px solid ${t.divider}`, borderRadius: 6, padding: '10px 12px', marginBottom: 12, overflowX: 'auto', color: t.secondary }}>
            {csvTemplateCols.join(',')}<br />
            Black Logo Tee,Apparel,M,40.00,140<br />
            Black Logo Tee,Apparel,L,40.00,148<br />
            Wilder Seasons LP,Music,Vinyl,35.00,80
          </div>
        )}

        {!inv && (
          <div
            onClick={simulateUpload}
            style={{ border: `1.5px dashed ${t.faint2}`, borderRadius: 8, padding: '22px', textAlign: 'center', cursor: 'pointer', background: 'repeating-linear-gradient(45deg,#fbfbfb,#fbfbfb 8px,#f6f6f6 8px,#f6f6f6 16px)' }}
          >
            <div style={{ fontSize: 20, color: t.muted2 }}>↥</div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: t.secondary, marginTop: 4 }}>Drag &amp; drop or click to upload your inventory CSV</div>
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10.5, color: t.faint, marginTop: 3 }}>.csv · one row per SKU</div>
          </div>
        )}

        {inv && (
          <div style={{ border: `1px solid ${hasErrors ? t.redTintBorder : t.greenBorder}`, background: hasErrors ? t.redTintBg : t.greenBg, borderRadius: 8, padding: '13px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: t.secondary, border: `1px solid ${t.inputBorder}`, borderRadius: 3, padding: '2px 5px', background: '#fff' }}>CSV</span>
              <b style={{ color: t.heading }}>{inv.fileName}</b>
              <span style={{ color: t.muted2 }}>· {inv.rows} rows · uploaded {inv.uploadedAt}</span>
              <span style={{ flex: 1 }} />
              {hasErrors ? (
                <span style={{ fontSize: 11, fontWeight: 700, color: t.red }}>✕ {inv.errors.length} rows need fixes</span>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 700, color: t.greenText }}>✓ all rows valid — catalog loaded</span>
              )}
            </div>
            {hasErrors && (
              <>
                <div style={{ marginTop: 10, borderTop: `1px solid ${t.redTintBorder}`, paddingTop: 8 }}>
                  {inv.errors.map((e) => (
                    <div key={e.row} style={{ fontSize: 12, color: t.red, padding: '3px 0' }}>
                      <b style={{ fontFamily: 'ui-monospace,Menlo,monospace' }}>Row {e.row}</b> — {e.message}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10 }}>
                  <Btn variant="primary" onClick={simulateReupload}>Re-upload corrected file</Btn>
                  <span style={{ fontSize: 11.5, color: t.muted2, marginLeft: 10 }}>Valid rows are held — only the flagged rows block the catalog.</span>
                </div>
              </>
            )}
            {!hasErrors && (
              <div style={{ marginTop: 8 }}>
                <a href="#" onClick={(e) => { e.preventDefault(); advance.set(partyId, { inventory: null }) }} style={{ fontSize: 11.5, fontWeight: 700 }}>Replace file</a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7b — contacts with settlement-signer flag (absorbs My People) */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${t.divider}` }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading }}>Contacts</div>
            <div style={{ fontSize: 11.5, color: t.muted2, marginTop: 2 }}>Add your people and flag who signs the settlement — one signer per {party.kind === 'artist' ? 'artist' : 'vendor'} is sufficient.</div>
          </div>
          <Btn onClick={() => setAdding(true)}>+ Add person</Btn>
        </div>
        {a.contacts.map((p, i) => {
          const isSigner = p.email === a.signerEmail
          return (
            <div key={p.email + i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: `1px solid ${t.divider3}`, fontSize: 12.5 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: isSigner ? '#1a1a1a' : '#e8e8e8', color: isSigner ? '#fff' : t.secondary, fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <b style={{ color: t.heading }}>{p.name}</b> <span style={{ color: t.muted2 }}>· {p.role}</span>
                <div style={{ color: t.secondary, marginTop: 1 }}>{p.email} · {p.phone}</div>
              </div>
              {isSigner ? (
                <span style={{ fontSize: 10, fontWeight: 700, color: t.red, background: t.redTintBg, border: `1px solid ${t.redTintBorder}`, borderRadius: 999, padding: '2px 9px' }}>✍ SIGNS SETTLEMENT</span>
              ) : (
                <span
                  onClick={() => advance.set(partyId, { signerEmail: p.email })}
                  style={{ fontSize: 11.5, color: t.red, fontWeight: 700, cursor: 'pointer' }}
                >
                  Make signer
                </span>
              )}
            </div>
          )
        })}
        <Modal
          open={adding}
          onClose={() => setAdding(false)}
          title="Add a person"
          width={440}
          footer={
            <>
              <Btn onClick={() => setAdding(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={() => { if (draft.name) advance.set(partyId, { contacts: [...a.contacts, draft] }); setDraft({ name: '', role: '', email: '', phone: '' }); setAdding(false) }}>Add</Btn>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {([['Name', 'name'], ['Role', 'role'], ['Email', 'email'], ['Phone', 'phone']] as const).map(([l, k]) => (
              <div key={k}>
                <div style={label}>{l.toUpperCase()}</div>
                <input value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} style={field} />
              </div>
            ))}
          </div>
        </Modal>
      </div>

      {/* 7c — shipping + return addresses */}
      <div style={{ ...card, padding: '18px 20px' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading, marginBottom: 4 }}>Addresses</div>
        <div style={{ fontSize: 11.5, color: t.muted2, marginBottom: 12 }}>
          Where inbound stock ships, and where unsold stock returns — {party.kind === 'artist' ? 'the return can be your next tour stop' : 'usually your studio or shop'}.
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={label}>SHIP INVENTORY TO</div>
            <input value={a.shippingAddress} placeholder="Festival receiving address" onChange={(e) => advance.set(partyId, { shippingAddress: e.target.value })} style={field} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={label}>RETURN UNSOLD STOCK TO</div>
            <input value={a.returnAddress} placeholder="Your return address" onChange={(e) => advance.set(partyId, { returnAddress: e.target.value })} style={field} />
          </div>
        </div>
      </div>

      {/* 7d — event info mini-wiki */}
      <div style={{ ...card, padding: '18px 20px' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading, marginBottom: 4 }}>Event info</div>
        <div style={{ fontSize: 11.5, color: t.muted2, marginBottom: 12 }}>
          Load-in gates, where to meet, count-in times — the festival keeps this current, and your notes sync back to the ops sheet.
        </div>
        <textarea
          value={a.wiki}
          onChange={(e) => advance.set(partyId, { wiki: e.target.value })}
          rows={4}
          placeholder="e.g. Load-in via Gate C from 11:00 AM. Ask for Alex at the merch tent…"
          style={{ ...field, resize: 'vertical', lineHeight: 1.55 }}
        />
      </div>
    </div>
  )
}

/* ---------- Catalog: the party's items across events (task 7 / catalog view) ---------- */
function CatalogTab({ party }: { party: ReturnType<typeof partyById> }) {
  const { items, skus, calc } = useCounts()
  const [reused, setReused] = useState(false)

  const rows = items.map((it) => {
    const list = skus.filter((s) => s.itemId === it.id)
    const sold = list.reduce((n, s) => n + calc(s).physicalSold, 0)
    const gross = list.reduce((n, s) => n + calc(s).physicalGross, 0)
    const prices = [...new Set(list.map((s) => s.price))]
    return {
      id: it.id,
      name: it.name,
      category: it.category,
      variants: list.map((s) => s.variant),
      price: prices.length === 1 ? money(prices[0]) : `${money(Math.min(...prices))}–${money(Math.max(...prices))}`,
      sold,
      gross,
      lastSold: sold > 0 ? 'Furnace Fest 2026 · this event' : 'Riverside Sessions · Apr 2026',
    }
  })
  const totalSold = rows.reduce((n, r) => n + r.sold, 0)
  const totalGross = rows.reduce((n, r) => n + r.gross, 0)
  const best = [...rows].sort((x, y) => y.sold - x.sold)[0]
  const th: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, color: t.muted, borderBottom: '1px solid #eeeeee', textAlign: 'left', padding: '9px 12px' }
  const td: React.CSSProperties = { padding: '10px 12px', borderBottom: `1px solid ${t.divider3}`, fontSize: 12.5, verticalAlign: 'top' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 14 }}>
        {[
          ['ITEMS IN CATALOG', String(rows.length)],
          ['BEST SELLER', best ? `${best.name} · ${best.sold} sold` : '—'],
          ['SOLD THIS EVENT', `${totalSold} units · ${money(totalGross)}`],
          ['AVG / UNIT', money(totalGross / Math.max(1, totalSold), 2)],
        ].map(([l, v]) => (
          <div key={l} style={{ ...card, flex: 1, padding: '14px 16px' }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: t.muted2 }}>{l}</div>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: t.heading, marginTop: 4, lineHeight: 1.3 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${t.divider}` }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading }}>Your catalog</div>
            <div style={{ fontSize: 11.5, color: t.muted2, marginTop: 2 }}>Items follow you event to event — no re-entering the same tee five times a summer.</div>
          </div>
          {reused ? (
            <span style={{ fontSize: 11.5, fontWeight: 700, color: t.greenText }}>✓ Catalog copied to your next event's advance</span>
          ) : (
            <Btn variant="primary" onClick={() => setReused(true)}>Re-use for next event →</Btn>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...th, paddingLeft: 18 }}>ITEM</th>
                <th style={th}>CATEGORY</th>
                <th style={th}>{party.kind === 'artist' ? 'SIZES / VARIANTS' : 'VARIANTS'}</th>
                <th style={{ ...th, textAlign: 'right' }}>PRICE</th>
                <th style={{ ...th, textAlign: 'right' }}>SOLD</th>
                <th style={{ ...th, paddingRight: 18 }}>LAST SOLD AT</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ ...td, paddingLeft: 18, fontWeight: 700, color: t.heading }}>{r.name}</td>
                  <td style={td}><span style={{ fontSize: 10.5, fontWeight: 700, color: t.secondary, background: '#f4f4f4', borderRadius: 999, padding: '2px 9px' }}>{r.category}</span></td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {r.variants.map((v) => (
                        <span key={v} style={{ fontSize: 10.5, fontFamily: 'ui-monospace,Menlo,monospace', border: `1px solid ${t.inputBorder}`, borderRadius: 3, padding: '1px 6px', color: t.secondary }}>{v}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 10, color: t.faint, marginTop: 3 }}>{attributeFor[r.category].label.toLowerCase()}</div>
                  </td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{r.price}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{r.sold}</td>
                  <td style={{ ...td, paddingRight: 18, color: t.secondary2, fontSize: 11.5 }}>{r.lastSold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ---------- Shipping & labels (box calc — task 6) ---------- */
function ShippingTab({ party }: { party: ReturnType<typeof partyById> }) {
  const { skus, items, partyId } = useCounts()
  const { cfg } = useConfig()
  const advance = useAdvance()
  const a = advance.get(partyId)
  const [labels, setLabels] = useState([{ id: 1, name: 'UPS_return_1of3.pdf' }])

  // Food and beverage are consumed on site — only shippable stock counts toward a return.
  const shippableIds = new Set(items.filter((i) => !isConsumable(i.category)).map((i) => i.id))
  const shippable = skus.filter((s) => shippableIds.has(s.itemId))
  const consumable = skus.filter((s) => !shippableIds.has(s.itemId))
  const weight = shippable.reduce((sum, s) => sum + s.ending * s.weightLb, 0)
  const shippableUnits = shippable.reduce((sum, s) => sum + s.ending, 0)
  const consumableUnits = consumable.reduce((sum, s) => sum + s.ending, 0)
  const nothingShips = shippable.length === 0

  // Box calc: ceil(items / items-per-box), items-per-box set in Configurations.
  // A manual override (persisted on the advance record) wins and drives label count.
  const computedBoxes = shippableUnits > 0 ? Math.ceil(shippableUnits / cfg.itemsPerBox) : 0
  const boxes = a.boxOverride ?? computedBoxes
  const overridden = a.boxOverride !== null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ ...card, padding: '18px 20px' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading, marginBottom: 4 }}>
          {party.kind === 'artist' ? 'Return shipment' : 'Pack-out'}
        </div>
        <div style={{ fontSize: 11.5, color: t.muted2, marginBottom: 14 }}>Calculated from your ending counts — no manual weighing.</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            ['SHIPPABLE UNITS', String(shippableUnits), null],
            ['EST. WEIGHT', `${weight.toFixed(1)} lb`, null],
          ].map(([l, v]) => (
            <div key={l as string} style={{ flex: 1, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '12px 14px' }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: t.muted2 }}>{l}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: t.heading, marginTop: 2 }}>{v}</div>
            </div>
          ))}
          <div style={{ flex: 1.2, border: `1px solid ${overridden ? '#ecd98a' : t.cardBorder}`, background: overridden ? '#fdf0c2' : 'transparent', borderRadius: 6, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: t.muted2 }}>BOXES</div>
              {overridden && (
                <a href="#" onClick={(e) => { e.preventDefault(); advance.set(partyId, { boxOverride: null }) }} style={{ fontSize: 10, fontWeight: 700 }}>reset to {computedBoxes}</a>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <input
                value={String(boxes)}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10)
                  advance.set(partyId, { boxOverride: Number.isNaN(n) ? null : Math.max(1, n) })
                }}
                inputMode="numeric"
                style={{ width: 54, fontSize: 18, fontWeight: 800, color: t.heading, fontFamily: 'inherit', border: `1px solid ${t.inputBorder}`, borderRadius: 4, padding: '2px 8px', background: '#fff' }}
              />
              <span style={{ fontSize: 10.5, color: t.muted2, lineHeight: 1.35 }}>
                {overridden ? 'manual override' : `auto: ${shippableUnits} ÷ ${cfg.itemsPerBox}/box`}
              </span>
            </div>
          </div>
        </div>
        {!nothingShips && (
          <div style={{ fontSize: 11, color: t.muted2, marginTop: 10, lineHeight: 1.5 }}>
            Estimate assumes <b>{cfg.itemsPerBox} items per box</b> (set in Configurations) — a guide only, edit boxes to match how you actually pack. Keep boxes under ~30 lbs.
          </div>
        )}
        {consumableUnits > 0 && (
          <div style={{ marginTop: 12, fontSize: 11.5, color: '#8a5d12', background: '#fdf6ec', border: '1px solid #f0dcae', borderRadius: 6, padding: '10px 12px', lineHeight: 1.5 }}>
            <b>{consumableUnits} consumable units excluded.</b> Food and beverage stock doesn't ship back — leftovers are recorded as waste on the count sheet, not returned inventory.
          </div>
        )}
      </div>

      {nothingShips ? (
        <div style={{ ...card, padding: '26px 20px', textAlign: 'center', color: t.secondary2 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading }}>Nothing to ship</div>
          <div style={{ fontSize: 12.5, marginTop: 6, lineHeight: 1.55 }}>
            {party.name} carries only consumable stock, so there are no return labels to generate.<br />
            Pack-out is a booth breakdown, not a shipment.
          </div>
        </div>
      ) : (
      <>
      <div style={{ ...card, padding: '18px 20px' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading, marginBottom: 4 }}>Upload pre-sent return labels</div>
        <div style={{ fontSize: 11.5, color: t.muted2, marginBottom: 12 }}>
          Send us your labels ahead of the show — one per inbound box — and we'll match them to your boxes. No email needed.
        </div>
        <div
          onClick={() => setLabels((l) => [...l, { id: l.length + 1, name: `UPS_return_${l.length + 1}of${boxes}.pdf` }])}
          style={{ border: `1.5px dashed ${t.faint2}`, borderRadius: 8, padding: '22px', textAlign: 'center', cursor: 'pointer', background: 'repeating-linear-gradient(45deg,#fbfbfb,#fbfbfb 8px,#f6f6f6 8px,#f6f6f6 16px)' }}
        >
          <div style={{ fontSize: 20, color: t.muted2 }}>↥</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: t.secondary, marginTop: 4 }}>Drag &amp; drop or click to upload labels</div>
          <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10.5, color: t.faint, marginTop: 3 }}>PDF, PNG · one label per box</div>
        </div>
        <div style={{ marginTop: 12 }}>
          {labels.map((l) => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${t.divider3}`, fontSize: 12.5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: t.red, border: `1px solid ${t.inputBorder}`, borderRadius: 3, padding: '2px 5px' }}>PDF</span>
              <span style={{ flex: 1, color: t.body2 }}>{l.name}</span>
              <span style={{ color: t.greenText, fontWeight: 700, fontSize: 11.5 }}>✓ matched to box {l.id}</span>
            </div>
          ))}
          <div style={{ fontSize: 11.5, color: labels.length === boxes ? t.greenText : '#8a5d12', marginTop: 10, fontWeight: 600 }}>
            {labels.length === boxes
              ? `✓ ${labels.length} labels matched to ${boxes} boxes.`
              : `${labels.length} of ${boxes} labels uploaded — UPS reissues the shipment if label count and box count differ, so match them exactly.`}
          </div>
        </div>
      </div>

      <div style={{ ...card, padding: '18px 20px' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading, marginBottom: 4 }}>Or generate labels here</div>
        <div style={{ fontSize: 11.5, color: t.muted2, marginBottom: 12 }}>Skip fedex.com / ups.com — {party.kind === 'artist' ? 'return address can be your next tour stop' : 'ships back to your studio or shop'}.</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 2 }}>
            <div style={label}>RETURN ADDRESS</div>
            <input
              value={a.returnAddress}
              placeholder="Set under Advance → Addresses"
              onChange={(e) => advance.set(partyId, { returnAddress: e.target.value })}
              style={field}
            />
          </div>
          <div style={{ width: 110 }}>
            <div style={label}># BOXES</div>
            <input
              value={String(boxes)}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                advance.set(partyId, { boxOverride: Number.isNaN(n) ? null : Math.max(1, n) })
              }}
              inputMode="numeric"
              style={field}
            />
          </div>
        </div>
        <Btn variant="primary">Generate {boxes} labels via ShipStation →</Btn>
        <div style={{ fontSize: 11, color: t.muted2, marginTop: 8 }}>ShipStation API integration in progress · UPS QR codes supported.</div>
      </div>
      </>
      )}
    </div>
  )
}

/* ---------- History: every event with this festival group (task 8) ---------- */
function HistoryTab({ party }: { party: ReturnType<typeof partyById> }) {
  const { totals } = useCounts()
  const events = [
    {
      id: 'ff26', event: 'Furnace Fest 2026', date: 'May 16, 2026', live: true,
      gross: money(totals.physicalGross, 2), units: totals.physicalSold,
      due: money(totals.physicalGross * 0.811 * (party.splitPct / 100), 2),
      status: 'Settlement in progress', file: null as string | null,
    },
    {
      id: 'rs26', event: 'Riverside Sessions', date: 'Apr 04, 2026', live: false,
      gross: '$6,420.00', units: 214, due: '$4,167.10',
      status: 'Both parties signed', file: 'RS26-0404.pdf',
    },
    {
      id: 'fh25', event: 'Fall Harvest Fest', date: 'Oct 12, 2025', live: false,
      gross: '$4,988.00', units: 171, due: '$3,236.21',
      status: 'Both parties signed', file: 'FH25-1012.pdf',
    },
  ]
  const totalGrossAll = 'across 3 events'

  return (
    <div style={{ ...card, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.divider}` }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading }}>Event history</div>
        <div style={{ fontSize: 11.5, color: t.muted2, marginTop: 2 }}>
          Every event you've worked with this festival group — sales at a glance, finalized settlements once both parties sign · {totalGrossAll}.
        </div>
      </div>
      {events.map((r, i) => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px', borderBottom: i < events.length - 1 ? `1px solid ${t.divider3}` : 'none', background: r.live ? '#fffcfb' : 'transparent' }}>
          <div style={{ width: 34, height: 40, border: `1px solid ${t.inputBorder}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: r.file ? t.red : t.muted2, background: '#fff' }}>{r.file ? 'PDF' : '···'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.heading }}>
              {r.event}
              {r.live && <span style={{ marginLeft: 8, fontSize: 9.5, fontWeight: 700, color: t.red, background: t.redTintBg, border: `1px solid ${t.redTintBorder}`, borderRadius: 999, padding: '1px 8px', verticalAlign: 'middle' }}>LIVE</span>}
            </div>
            <div style={{ fontSize: 11.5, color: t.muted2, marginTop: 2 }}>{r.date} · {r.units} units · gross {r.gross} · due you <b style={{ color: t.body2 }}>{r.due}</b></div>
          </div>
          {r.file ? (
            <>
              <span style={{ fontSize: 11, fontWeight: 700, color: t.greenText, background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 999, padding: '3px 10px' }}>✓ {r.status}</span>
              <a href="#" style={{ fontSize: 12, fontWeight: 700 }}>View / download →</a>
            </>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#8a5d12', background: '#fdf6ec', border: '1px solid #f0dcae', borderRadius: 999, padding: '3px 10px' }}>⏳ {r.status}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function TimelineNode({ mark, bg, color, border, title, sub, line }: { mark: string; bg: string; color: string; border: string; title: string; sub: string; line?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: bg, color, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', border: `1.5px solid ${border}` }}>{mark}</div>
        {line && <div style={{ width: 1.5, flex: 1, background: '#e0e0e0', minHeight: 18 }} />}
      </div>
      <div style={{ paddingBottom: line ? 14 : 0, fontSize: 12, lineHeight: 1.4 }}>
        <b>{title}</b>
        <br />
        <span style={{ color: t.muted2 }}>{sub}</span>
      </div>
    </div>
  )
}
