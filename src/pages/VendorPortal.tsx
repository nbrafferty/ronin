import { useState } from 'react'
import { tokens as t } from '../lib/tokens'

type Stage = 'queued' | 'sent' | 'landed'

const bars = [14, 22, 34, 30, 48, 62, 55, 78, 100, 86]
const barColors = ['#eedddd', '#eedddd', '#e7c2c1', '#e7c2c1', '#dd9997', '#dd9997', '#d4706d', '#d4706d', '#c8201d', '#c8201d']

const items = [
  { name: 'Black Logo Tee', inC: 552, sold: 220, left: 323, gross: '$8,800' },
  { name: 'Circle Logo Hoodie', inC: 120, sold: 52, left: 66, gross: '$3,120' },
  { name: 'Red/White Trucker Hat', inC: 40, sold: 15, left: 25, gross: '$270' },
]

// Real-time sales feed — lets a vendor or their rep (e.g. Bravado) watch sales remotely, off-site.
const feed = [
  { t: '10:47 PM', txt: 'Black Logo Tee · L ×2', amt: '$80' },
  { t: '10:46 PM', txt: 'Circle Logo Hoodie · M', amt: '$60' },
  { t: '10:44 PM', txt: 'Black Logo Tee · XL', amt: '$40' },
  { t: '10:43 PM', txt: 'Red/White Trucker Hat', amt: '$18' },
  { t: '10:41 PM', txt: 'Black Logo Tee · M ×3', amt: '$120' },
  { t: '10:39 PM', txt: 'Circle Logo Hoodie · L', amt: '$60' },
]

export default function VendorPortal() {
  const [stage, setStage] = useState<Stage>('queued')
  const sent = stage === 'sent' || stage === 'landed'
  const landed = stage === 'landed'

  const stageLabel = landed ? 'PAID ✓' : sent ? 'SENT' : 'QUEUED'
  const stageColor = landed ? t.greenText : t.red
  const stageNote = landed ? 'Landed Monday 9:14 AM' : sent ? 'Sent — lands next business day' : 'Arriving tomorrow'

  const dot3 = { bg: sent ? '#1a1a1a' : t.red, color: '#fff', border: sent ? '#1a1a1a' : t.red, mark: sent ? '✓' : '→' }
  const dot4 = { bg: landed ? t.red : '#fff', color: landed ? '#fff' : t.muted2, border: landed ? t.red : t.faint2, mark: landed ? '✓' : '4' }

  const td: React.CSSProperties = { padding: '9px 10px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }
  const th: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, color: t.muted, borderBottom: '1px solid #eeeeee', textAlign: 'right' }

  return (
    <div style={{ minHeight: '100vh', background: t.pageBg, color: t.body, fontFamily: t.font }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 14, background: t.cardBg, borderBottom: `1px solid ${t.cardBorder}`, padding: '12px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '.14em', color: t.heading }}>RONIN</span>
          <span style={{ width: 3, height: 3 }} />
          <span style={{ fontSize: 11, letterSpacing: '.18em', color: '#8a8a8a', fontWeight: 600 }}>VENDOR PORTAL</span>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: t.secondary2, background: t.pageBg, border: `1px solid ${t.cardBorder}`, borderRadius: 999, padding: '3px 10px' }}>🔗 Remote view · no on-site access needed</span>
        <div style={{ fontSize: 12.5, color: t.secondary2 }}>Spring Music Fest 2026 <span style={{ color: '#bbbbbb' }}>·</span> Sat May 16</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1a1a1a', color: '#fff', fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>TM</div>
          <div style={{ fontSize: 11, lineHeight: 1.25 }}><b>Dana Reyes</b><br /><span style={{ color: t.muted2 }}>Tour Manager · Black Coyote</span></div>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '26px 24px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: t.heading }}>Black Coyote</h1>
            <div style={{ fontSize: 12.5, color: t.secondary2, marginTop: 4 }}>Main Stage · Saturday, May 16, 2026</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: t.redTintBg, border: `1px solid ${t.redTintBorder}`, borderRadius: 999, padding: '6px 14px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.red }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: t.red }}>LIVE — updates as counts close</span>
          </div>
        </div>

        {/* Hero card */}
        <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 8, padding: '26px 28px 22px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', color: t.muted2 }}>GROSS SALES TODAY</div>
              <div style={{ fontSize: 44, fontWeight: 800, color: t.heading, letterSpacing: '-.01em', margin: '4px 0 2px' }}>$12,190</div>
              <div style={{ fontSize: 12.5, color: t.secondary2 }}>287 units sold · avg $42.47 / unit</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 88, flex: 'none' }}>
              {bars.map((h, i) => (
                <div key={i} style={{ width: 16, height: `${h}%`, background: barColors[i], borderRadius: '2px 2px 0 0' }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#bbbbbb', marginTop: 6 }}>
            <span>sales by hour</span>
            <span>2pm — 11pm</span>
          </div>
        </div>

        {/* Split + payout */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          <div style={{ flex: 1, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 8, padding: '18px 20px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', color: t.muted2 }}>YOUR SPLIT</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: t.heading, margin: '4px 0 2px' }}>80% <span style={{ fontSize: 12, fontWeight: 600, color: t.greenText2 }}>locked at advance</span></div>
            <div style={{ fontSize: 12.5, color: t.secondary2 }}>Your share so far: <b style={{ color: t.heading }}>$7,905.91</b> of adjusted gross</div>
          </div>
          <div style={{ flex: 1.3, background: t.cardBg, border: `1px solid ${t.redTintBorder}`, borderRadius: 8, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', color: t.muted2 }}>PAYOUT · STRIPE ACH ····6712</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: stageColor }}>{stageLabel}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: t.heading, margin: '4px 0 2px' }}>$7,905.91</div>
            <div style={{ fontSize: 12.5, color: t.red, fontWeight: 600 }}>{stageNote} <span style={{ color: t.redOnTint, fontWeight: 500 }}>— vs 30–45 days with legacy merch companies</span></div>
          </div>
        </div>

        {/* Items + timeline */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ flex: 1.3, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.divider}`, fontSize: 13.5, fontWeight: 700, color: t.heading }}>Your items</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: 'left', padding: '9px 18px' }}>ITEM</th>
                  <th style={{ ...th, padding: '9px 10px' }}>IN</th>
                  <th style={{ ...th, padding: '9px 10px' }}>SOLD</th>
                  <th style={{ ...th, padding: '9px 10px' }}>LEFT</th>
                  <th style={{ ...th, padding: '9px 18px' }}>GROSS</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.name}>
                    <td style={{ padding: '9px 18px', borderBottom: `1px solid ${t.divider3}`, fontWeight: 600 }}>{it.name}</td>
                    <td style={{ ...td, color: '#666666' }}>{it.inC}</td>
                    <td style={{ ...td, fontWeight: 600 }}>{it.sold}</td>
                    <td style={{ ...td, color: '#666666' }}>{it.left}</td>
                    <td style={{ ...td, padding: '9px 18px', fontWeight: 600 }}>{it.gross}</td>
                  </tr>
                ))}
                <tr style={{ background: t.rowBg2 }}>
                  <td style={{ padding: '9px 18px', fontWeight: 700 }}>Total</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700 }}>712</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700 }}>287</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700 }}>414</td>
                  <td style={{ padding: '9px 18px', textAlign: 'right', fontWeight: 700 }}>$12,190</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ flex: 1, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 8, padding: '16px 18px' }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading, marginBottom: 12 }}>Money timeline</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <TimelineNode mark="✓" bg="#1a1a1a" color="#fff" border="#1a1a1a" title="Count out finalized" sub="Sat 11:40 PM" line />
              <TimelineNode mark="✓" bg="#1a1a1a" color="#fff" border="#1a1a1a" title="Settlement reconciled" sub="Sat 11:52 PM · statement emailed" line />
              <TimelineNode mark={dot3.mark} bg={dot3.bg} color={dot3.color} border={dot3.border} title="Payout sent · Stripe ACH" sub="Sun 9:00 AM" line />
              <TimelineNode mark={dot4.mark} bg={dot4.bg} color={dot4.color} border={dot4.border} title="In your account" sub="Mon, next business day" />
            </div>
          </div>
        </div>

        {/* Real-time sales feed */}
        <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 8, overflow: 'hidden', marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${t.divider}` }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: t.heading }}>Live sales feed</div>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: t.red }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.red }} /> streaming
            </span>
          </div>
          <div>
            {feed.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 18px', borderBottom: i < feed.length - 1 ? `1px solid ${t.divider3}` : 'none', fontSize: 12.5 }}>
                <span style={{ color: t.muted2, fontVariantNumeric: 'tabular-nums', width: 62 }}>{f.t}</span>
                <span style={{ flex: 1, color: t.body2 }}>{f.txt}</span>
                <span style={{ fontWeight: 700, color: t.heading }}>{f.amt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demo-state toggle for payout stage */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, fontSize: 11.5, color: t.muted2 }}>
          <span style={{ fontWeight: 700, letterSpacing: '.04em' }}>DEMO STATE · PAYOUT</span>
          {(['queued', 'sent', 'landed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              style={{
                fontFamily: 'inherit',
                fontSize: 11.5,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 999,
                cursor: 'pointer',
                border: `1.5px solid ${stage === s ? t.red : t.inputBorder}`,
                color: stage === s ? t.red : t.secondary2,
                background: stage === s ? t.redTintBg : t.cardBg,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}

function TimelineNode({
  mark, bg, color, border, title, sub, line,
}: { mark: string; bg: string; color: string; border: string; title: string; sub: string; line?: boolean }) {
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
