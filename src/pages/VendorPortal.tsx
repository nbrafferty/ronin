import { useState } from 'react'
import { tokens as t, money } from '../lib/tokens'
import { Btn } from '../components/ui'
import { Modal } from '../components/overlays'
import { useCounts } from '../lib/counts'
import { useSignOff } from '../lib/signoff'
import { partyById, type Contact } from '../lib/parties'

type Stage = 'queued' | 'sent' | 'landed'
type Tab = 'today' | 'settlement' | 'finalized' | 'shipping' | 'people'

const bars = [14, 22, 34, 30, 48, 62, 55, 78, 100, 86]
const barColors = ['#eedddd', '#eedddd', '#e7c2c1', '#e7c2c1', '#dd9997', '#dd9997', '#d4706d', '#d4706d', '#c8201d', '#c8201d']

const feed = [
  { t: '10:47 PM', txt: 'Black Logo Tee · L ×2', amt: '$80' },
  { t: '10:46 PM', txt: 'Circle Logo Hoodie · M', amt: '$60' },
  { t: '10:44 PM', txt: 'Black Logo Tee · XL', amt: '$40' },
  { t: '10:43 PM', txt: 'Red/White Trucker Hat', amt: '$18' },
  { t: '10:41 PM', txt: 'Black Logo Tee · M ×3', amt: '$120' },
]

const party = partyById('black-coyote')
const field: React.CSSProperties = { width: '100%', padding: '8px 10px', border: `1px solid ${t.inputBorder}`, borderRadius: 4, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }
const label: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, color: t.muted, marginBottom: 5 }
const card: React.CSSProperties = { background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 8 }

export default function VendorPortal() {
  const [tab, setTab] = useState<Tab>('today')
  const [stage, setStage] = useState<Stage>('queued')
  const { items, skus, calc, totals } = useCounts()
  const signoff = useSignOff()

  const sent = stage === 'sent' || stage === 'landed'
  const landed = stage === 'landed'
  const stageLabel = landed ? 'PAID ✓' : sent ? 'SENT' : 'QUEUED'
  const stageColor = landed ? t.greenText : t.red
  const stageNote = landed ? 'Landed Monday 9:14 AM' : sent ? 'Sent — lands next business day' : 'Scheduled Mon May 18'

  const tabs: { id: Tab; label: string; badge?: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'settlement', label: 'Settlement', badge: signoff.settlement.status === 'requested' ? '1' : undefined },
    { id: 'finalized', label: 'Finalized Settlements' },
    { id: 'shipping', label: 'Shipping & Labels' },
    { id: 'people', label: 'My People' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: t.pageBg, color: t.body, fontFamily: t.font }}>
      <header style={{ background: t.cardBg, borderBottom: `1px solid ${t.cardBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '.14em', color: t.heading }}>RONIN</span>
            <span style={{ fontSize: 11, letterSpacing: '.18em', color: '#8a8a8a', fontWeight: 600 }}>VENDOR PORTAL</span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: t.secondary2, background: t.pageBg, border: `1px solid ${t.cardBorder}`, borderRadius: 999, padding: '3px 10px' }}>🔗 Remote view · no on-site access needed</span>
          <div style={{ fontSize: 12.5, color: t.secondary2 }}>Furnace Fest 2026 <span style={{ color: '#bbbbbb' }}>·</span> Sat May 16</div>
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

        {/* Signature request banner — visible from any tab */}
        {signoff.settlement.status === 'requested' && tab !== 'settlement' && (
          <div style={{ background: t.redTintBg, border: `1.5px solid ${t.redTintBorder}`, borderRadius: 8, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1, fontSize: 13, color: t.body2 }}>
              <b style={{ color: t.red }}>Signature requested.</b> Your settlement statement is ready for e-signature.
            </div>
            <Btn variant="primary" onClick={() => setTab('settlement')}>Review &amp; sign →</Btn>
          </div>
        )}

        {tab === 'today' && <TodayTab stage={stage} setStage={setStage} stageLabel={stageLabel} stageColor={stageColor} stageNote={stageNote} sent={sent} landed={landed} />}
        {tab === 'settlement' && <SettlementTab />}
        {tab === 'finalized' && <FinalizedTab />}
        {tab === 'shipping' && <ShippingTab />}
        {tab === 'people' && <PeopleTab />}
      </main>
    </div>
  )
}

/* ---------- Today: real-time sales + money timeline ---------- */
function TodayTab({ stage, setStage, stageLabel, stageColor, stageNote, sent, landed }: any) {
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
function SettlementTab() {
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

  if (signoff.settlement.status === 'signed') {
    return (
      <div style={{ ...card, padding: '28px 26px', textAlign: 'center' }}>
        <div style={{ fontSize: 34 }}>✓</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.greenText, marginTop: 6 }}>Settlement signed</div>
        <div style={{ fontSize: 12.5, color: t.secondary2, marginTop: 6, lineHeight: 1.6 }}>
          Signed by {signoff.settlement.contact?.name ?? party.contact.name} at {signoff.settlement.at}.<br />
          The countersigned statement is filed under <b>Finalized Settlements</b>.
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
        <div style={{ fontSize: 15, fontWeight: 700, color: t.heading }}>Merchandise settlement · Furnace Fest 2026</div>
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
          A countersigned PDF is filed to Finalized Settlements once the festival signs.
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

/* ---------- Finalized settlements ---------- */
function FinalizedTab() {
  const rows = [
    { event: 'Furnace Fest 2026', date: 'May 16, 2026', gross: '$12,190.00', due: '$7,905.91', status: 'Both parties signed', file: 'SMF26-0516-BC.pdf' },
    { event: 'Riverside Sessions', date: 'Apr 04, 2026', gross: '$6,420.00', due: '$4,167.10', status: 'Both parties signed', file: 'RS26-0404-BC.pdf' },
  ]
  return (
    <div style={{ ...card, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.divider}`, fontSize: 13.5, fontWeight: 700, color: t.heading }}>
        Finalized settlements <span style={{ fontWeight: 500, color: t.muted2, fontSize: 11.5, marginLeft: 6 }}>viewable once both parties have signed</span>
      </div>
      {rows.map((r, i) => (
        <div key={r.file} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < rows.length - 1 ? `1px solid ${t.divider3}` : 'none' }}>
          <div style={{ width: 34, height: 40, border: `1px solid ${t.inputBorder}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: t.red, background: '#fff' }}>PDF</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.heading }}>{r.event}</div>
            <div style={{ fontSize: 11.5, color: t.muted2, marginTop: 2 }}>{r.date} · gross {r.gross} · due you <b style={{ color: t.body2 }}>{r.due}</b></div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: t.greenText, background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 999, padding: '3px 10px' }}>✓ {r.status}</span>
          <a href="#" style={{ fontSize: 12, fontWeight: 700 }}>View / download →</a>
        </div>
      ))}
    </div>
  )
}

/* ---------- Shipping & labels ---------- */
function ShippingTab() {
  const { totals, skus } = useCounts()
  const [labels, setLabels] = useState([{ id: 1, name: 'UPS_return_1of3.pdf', boxes: 1 }])
  const [boxes, setBoxes] = useState('3')
  const weight = skus.reduce((a, s) => a + s.ending * s.weightLb, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ ...card, padding: '18px 20px' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading, marginBottom: 4 }}>Return shipment</div>
        <div style={{ fontSize: 11.5, color: t.muted2, marginBottom: 14 }}>Calculated from your ending counts — no manual weighing.</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            ['UNSOLD UNITS', String(totals.ending)],
            ['EST. WEIGHT', `${weight.toFixed(1)} lb`],
            ['BOXES', boxes],
          ].map(([l, v]) => (
            <div key={l} style={{ flex: 1, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '12px 14px' }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: t.muted2 }}>{l}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: t.heading, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, padding: '18px 20px' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading, marginBottom: 4 }}>Upload pre-sent return labels</div>
        <div style={{ fontSize: 11.5, color: t.muted2, marginBottom: 12 }}>
          Send us your labels ahead of the show — one per inbound box — and we'll match them to your boxes. No email needed.
        </div>
        <div
          onClick={() => setLabels((l) => [...l, { id: l.length + 1, name: `UPS_return_${l.length + 1}of${boxes}.pdf`, boxes: 1 }])}
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
          <div style={{ fontSize: 11.5, color: labels.length === Number(boxes) ? t.greenText : '#8a5d12', marginTop: 10, fontWeight: 600 }}>
            {labels.length === Number(boxes)
              ? `✓ ${labels.length} labels matched to ${boxes} boxes.`
              : `${labels.length} of ${boxes} labels uploaded — UPS reissues the shipment if label count and box count differ, so match them exactly.`}
          </div>
        </div>
      </div>

      <div style={{ ...card, padding: '18px 20px' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading, marginBottom: 4 }}>Or generate labels here</div>
        <div style={{ fontSize: 11.5, color: t.muted2, marginBottom: 12 }}>Skip fedex.com / ups.com — return address can be your next tour stop.</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 2 }}>
            <div style={label}>RETURN ADDRESS</div>
            <input defaultValue="The Ryman · 116 Rep John Lewis Way N, Nashville TN" style={field} />
          </div>
          <div style={{ width: 110 }}>
            <div style={label}># BOXES</div>
            <input value={boxes} onChange={(e) => setBoxes(e.target.value)} inputMode="numeric" style={field} />
          </div>
        </div>
        <Btn variant="primary">Generate {boxes} labels via ShipStation →</Btn>
        <div style={{ fontSize: 11, color: t.muted2, marginTop: 8 }}>ShipStation API integration in progress · UPS QR codes supported.</div>
      </div>
    </div>
  )
}

/* ---------- My people: vendor routes their own contacts ---------- */
function PeopleTab() {
  const [people, setPeople] = useState<Contact[]>([party.contact, ...party.altContacts])
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<Contact>({ name: '', role: '', email: '', phone: '' })

  return (
    <div style={{ ...card, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${t.divider}` }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading }}>My people</div>
          <div style={{ fontSize: 11.5, color: t.muted2, marginTop: 2 }}>Add your business manager or seller so statements route to the right person — the festival doesn't have to.</div>
        </div>
        <Btn onClick={() => setAdding(true)}>+ Add person</Btn>
      </div>
      {people.map((p, i) => (
        <div key={p.email + i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: `1px solid ${t.divider3}`, fontSize: 12.5 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: i === 0 ? '#1a1a1a' : '#e8e8e8', color: i === 0 ? '#fff' : t.secondary, fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {p.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <b style={{ color: t.heading }}>{p.name}</b> <span style={{ color: t.muted2 }}>· {p.role}</span>
            <div style={{ color: t.secondary, marginTop: 1 }}>{p.email} · {p.phone}</div>
          </div>
          {i === 0 ? (
            <span style={{ fontSize: 10, fontWeight: 700, color: t.red, background: t.redTintBg, border: `1px solid ${t.redTintBorder}`, borderRadius: 999, padding: '2px 9px' }}>PRIMARY · SIGNS</span>
          ) : (
            <span style={{ fontSize: 11.5, color: t.red, fontWeight: 700, cursor: 'pointer' }}>Make primary</span>
          )}
        </div>
      ))}
      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add a person"
        width={440}
        footer={
          <>
            <Btn onClick={() => setAdding(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={() => { if (draft.name) setPeople((ps) => [...ps, draft]); setDraft({ name: '', role: '', email: '', phone: '' }); setAdding(false) }}>Add</Btn>
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
