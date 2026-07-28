import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { Btn, EditCell, EditLegend, MetricTile, PageHead, marginHealth } from '../components/ui'
import { tokens as t, money } from '../lib/tokens'

type Group = 'apparel' | 'acc'
interface Row {
  id: number
  group: Group
  name: string
  blank: string
  colors: string
  sizes: number[] // apparel: [S,M,L,XL,2XL]; acc: [total]
  costPer: number
  oneTime: number
  retail: number
}

// Pure calc — mirrors Planning.dc.html's row() logic. Reused for row cells and footer totals.
function calc(r: Row) {
  const total = r.sizes.reduce((a, b) => a + b, 0)
  const allIn = total * r.costPer + r.oneTime
  const gp = total * r.retail
  const net = gp - allIn
  const margin = gp > 0 ? (net / gp) * 100 : 0
  return { total, allIn, perUnit: total ? allIn / total : 0, gp, net, margin, low: margin < 50 }
}

const initialRows: Row[] = [
  { id: 1, group: 'apparel', name: 'SS Lineup Tee', blank: 'G2000', colors: '3 / 1', sizes: [120, 300, 300, 180, 60], costPer: 7.1, oneTime: 623, retail: 35 },
  { id: 2, group: 'apparel', name: 'Circle Logo Hoodie', blank: 'G185', colors: '2 / 0', sizes: [60, 140, 140, 80, 20], costPer: 18.4, oneTime: 670, retail: 60 },
  { id: 3, group: 'apparel', name: 'Lineup Longsleeve', blank: 'G2400', colors: '3 / 0', sizes: [40, 110, 110, 60, 20], costPer: 11.2, oneTime: 465, retail: 40 },
  { id: 4, group: 'apparel', name: 'Windbreaker', blank: 'Custom', colors: '1 / 1', sizes: [30, 70, 70, 40, 10], costPer: 26.5, oneTime: 480, retail: 75 },
  { id: 5, group: 'acc', name: 'Dad Hat', blank: 'Rich. 115', colors: '1 / 0', sizes: [500], costPer: 9.8, oneTime: 280, retail: 18 },
  { id: 6, group: 'acc', name: 'Trucker Hat', blank: 'Rich. 112', colors: '1 / 0', sizes: [400], costPer: 8.6, oneTime: 240, retail: 25 },
  { id: 7, group: 'acc', name: 'Tote Bag', blank: 'Liberty', colors: '2 / 0', sizes: [300], costPer: 6.4, oneTime: 180, retail: 20 },
  { id: 8, group: 'acc', name: 'Sticker Pack', blank: '—', colors: '3 / 0', sizes: [500], costPer: 1.1, oneTime: 90, retail: 5 },
]

const th: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 700,
  color: t.muted,
  borderBottom: '1px solid #eeeeee',
}
const numTd: React.CSSProperties = { textAlign: 'right', borderBottom: `1px solid ${t.divider3}` }

function MarginPill({ margin }: { margin: number; low?: boolean }) {
  const h = marginHealth(margin)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        borderRadius: 999,
        padding: '2px 9px',
        fontWeight: 700,
        background: h.bg,
        color: h.color,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: h.dot }} />
      {margin.toFixed(1)}%
    </span>
  )
}

export default function Planning() {
  const [rows, setRows] = useState<Row[]>(initialRows)
  const [projRates, setProjRates] = useState<[number, number, number]>([3, 4, 5])
  const [scenario, setScenario] = useState<{ tier: number; att: 20 | 25 | 30 }>({ tier: 2, att: 25 })

  const update = (id: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const setSize = (id: number, i: number, v: number) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, sizes: r.sizes.map((s, j) => (j === i ? v : s)) } : r)))

  const totals = useMemo(() => {
    let units = 0, cost = 0, gp = 0, net = 0
    for (const r of rows) {
      const c = calc(r)
      units += c.total
      cost += c.allIn
      gp += c.gp
      net += c.net
    }
    return {
      units,
      cost,
      gp,
      net,
      costPer: units ? cost / units : 0,
      margin: gp ? (net / gp) * 100 : 0,
      headroom: 56250 - cost,
    }
  }, [rows])

  const num = (v: string) => (v === '' || isNaN(Number(v)) ? 0 : Number(v))

  const apparel = rows.filter((r) => r.group === 'apparel')
  const acc = rows.filter((r) => r.group === 'acc')

  const addRow = () => {
    const id = Math.max(...rows.map((r) => r.id)) + 1
    setRows((rs) => [
      ...rs,
      { id, group: 'apparel', name: 'New Item', blank: 'G2000', colors: '1 / 0', sizes: [0, 0, 0, 0, 0], costPer: 0, oneTime: 0, retail: 0 },
    ])
  }

  return (
    <AdminLayout active="Merch Planning">
      <main style={{ padding: '20px 24px 32px' }}>
        <PageHead
          title="Spring Music Fest 2026 — Merch Planning"
          subtitle="Festival merch program · Build Sheet + Revenue Projection"
          actions={
            <>
              <Btn>↥ Export CSV</Btn>
              <Btn variant="primary">Port to Inventory →</Btn>
            </>
          }
        />

        {/* North Star tiles */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <MetricTile label="GROSS POTENTIAL" value={money(totals.gp)} accent />
          <MetricTile label="NET PROFIT" value={money(totals.net)} accent />
          <MetricTile label="COST PER ITEM" value={money(totals.costPer, 2)} />
          <MetricTile
            label="BLENDED MARGIN"
            value={
              <>
                {totals.margin.toFixed(1)}%{' '}
                <span style={{ fontSize: 11, fontWeight: 600, color: t.greenText2 }}>
                  {totals.margin >= 50 ? 'above 50% target' : 'below 50% target'}
                </span>
              </>
            }
          />
        </div>

        {/* Tool 1 · Build Sheet */}
        <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, overflow: 'hidden', marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${t.divider}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.heading }}>
              Tool 1 · Build Sheet{' '}
              <span style={{ fontSize: 11.5, fontWeight: 500, color: t.muted2, marginLeft: 8 }}>one row per item — calc columns update live</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <EditLegend />
              <Btn size="sm">Duplicate</Btn>
              <Btn size="sm" onClick={addRow}>+ Add Row</Btn>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 1240 }}>
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: 'left', padding: '9px 14px' }}>ITEM / DESIGN</th>
                  <th style={{ ...th, textAlign: 'left', padding: '9px 8px' }}>BLANK</th>
                  <th style={{ ...th, textAlign: 'center', padding: '9px 8px' }}>COLORS F/B</th>
                  {['S', 'M', 'L', 'XL', '2XL'].map((s) => (
                    <th key={s} style={{ ...th, textAlign: 'right', padding: '9px 6px' }}>{s}</th>
                  ))}
                  {['TOTAL', 'COST PER', 'ONE-TIME', 'TOTAL $', 'COST/UNIT', 'RETAIL', 'GROSS POT.', 'NET PROFIT'].map((s) => (
                    <th key={s} style={{ ...th, textAlign: 'right', padding: '9px 8px' }}>{s}</th>
                  ))}
                  <th style={{ ...th, textAlign: 'right', padding: '9px 14px' }}>MARGIN</th>
                </tr>
              </thead>
              <tbody>
                {/* Apparel group */}
                <tr style={{ background: t.rowBg }}>
                  <td colSpan={17} style={{ padding: '8px 14px', borderBottom: `1px solid ${t.divider}` }}>
                    <b style={{ fontSize: 12 }}>▼ Apparel</b> <span style={{ fontSize: 11, color: t.muted2 }}>size matrix</span>
                  </td>
                </tr>
                {apparel.map((r) => {
                  const c = calc(r)
                  return (
                    <tr key={r.id}>
                      <td style={{ padding: '6px 14px', borderBottom: `1px solid ${t.divider3}`, fontWeight: 600, color: t.heading, whiteSpace: 'nowrap' }}>{r.name}</td>
                      <td style={{ padding: '5px 8px', borderBottom: `1px solid ${t.divider3}` }}>
                        <EditCell value={r.blank} align="left" minWidth={44} onChange={(v) => update(r.id, { blank: v })} />
                      </td>
                      <td style={{ padding: '5px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'center' }}>
                        <EditCell value={r.colors} align="center" minWidth={34} onChange={(v) => update(r.id, { colors: v })} />
                      </td>
                      {r.sizes.map((s, i) => (
                        <td key={i} style={{ padding: '5px 6px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
                          <EditCell value={s} type="number" onChange={(v) => setSize(r.id, i, num(v))} />
                        </td>
                      ))}
                      <td style={{ padding: '6px 8px', ...numTd, fontWeight: 700, color: t.heading }}>{c.total.toLocaleString()}</td>
                      <td style={{ padding: '5px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
                        <EditCell value={r.costPer.toFixed(2)} prefix="$" type="number" minWidth={38} onChange={(v) => update(r.id, { costPer: num(v) })} />
                      </td>
                      <td style={{ padding: '6px 8px', ...numTd, color: t.muted }}>{money(r.oneTime)}</td>
                      <td style={{ padding: '6px 8px', ...numTd, color: '#666666' }}>{money(c.allIn)}</td>
                      <td style={{ padding: '6px 8px', ...numTd, color: '#666666' }}>{money(c.perUnit, 2)}</td>
                      <td style={{ padding: '5px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
                        <EditCell value={r.retail} prefix="$" type="number" minWidth={34} onChange={(v) => update(r.id, { retail: num(v) })} />
                      </td>
                      <td style={{ padding: '6px 8px', ...numTd, color: '#444444' }}>{money(c.gp)}</td>
                      <td style={{ padding: '6px 8px', ...numTd, color: '#444444' }}>{money(c.net)}</td>
                      <td style={{ padding: '6px 14px', ...numTd }}><MarginPill margin={c.margin} low={c.low} /></td>
                    </tr>
                  )
                })}
                {/* Accessories group */}
                <tr style={{ background: t.rowBg }}>
                  <td colSpan={17} style={{ padding: '8px 14px', borderBottom: `1px solid ${t.divider}` }}>
                    <b style={{ fontSize: 12 }}>▼ Accessories</b> <span style={{ fontSize: 11, color: t.muted2 }}>quantity only — size cells blank</span>
                  </td>
                </tr>
                {acc.map((r) => {
                  const c = calc(r)
                  return (
                    <tr key={r.id}>
                      <td style={{ padding: '6px 14px', borderBottom: `1px solid ${t.divider3}`, fontWeight: 600, color: t.heading, whiteSpace: 'nowrap' }}>{r.name}</td>
                      <td style={{ padding: '5px 8px', borderBottom: `1px solid ${t.divider3}` }}>
                        <EditCell value={r.blank} align="left" minWidth={44} onChange={(v) => update(r.id, { blank: v })} />
                      </td>
                      <td style={{ padding: '5px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'center' }}>
                        <EditCell value={r.colors} align="center" minWidth={34} onChange={(v) => update(r.id, { colors: v })} />
                      </td>
                      <td colSpan={5} style={{ padding: '6px 6px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'center', color: t.faint2 }}>—</td>
                      <td style={{ padding: '5px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
                        <EditCell value={r.sizes[0]} type="number" minWidth={34} onChange={(v) => setSize(r.id, 0, num(v))} />
                      </td>
                      <td style={{ padding: '5px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
                        <EditCell value={r.costPer.toFixed(2)} prefix="$" type="number" minWidth={38} onChange={(v) => update(r.id, { costPer: num(v) })} />
                      </td>
                      <td style={{ padding: '6px 8px', ...numTd, color: t.muted }}>{money(r.oneTime)}</td>
                      <td style={{ padding: '6px 8px', ...numTd, color: '#666666' }}>{money(c.allIn)}</td>
                      <td style={{ padding: '6px 8px', ...numTd, color: '#666666' }}>{money(c.perUnit, 2)}</td>
                      <td style={{ padding: '5px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
                        <EditCell value={r.retail} prefix="$" type="number" minWidth={34} onChange={(v) => update(r.id, { retail: num(v) })} />
                      </td>
                      <td style={{ padding: '6px 8px', ...numTd, color: '#444444' }}>{money(c.gp)}</td>
                      <td style={{ padding: '6px 8px', ...numTd, color: '#444444' }}>{money(c.net)}</td>
                      <td style={{ padding: '6px 14px', ...numTd }}><MarginPill margin={c.margin} low={c.low} /></td>
                    </tr>
                  )
                })}
                {/* Footer totals */}
                <tr style={{ background: t.rowBg2 }}>
                  <td style={{ padding: '9px 14px', fontWeight: 700, color: t.heading }}>Totals</td>
                  <td colSpan={7} />
                  <td style={{ padding: '9px 8px', textAlign: 'right', fontWeight: 700 }}>{totals.units.toLocaleString()}</td>
                  <td />
                  <td />
                  <td style={{ padding: '9px 8px', textAlign: 'right', fontWeight: 700 }}>{money(totals.cost)}</td>
                  <td style={{ padding: '9px 8px', textAlign: 'right', fontWeight: 700 }}>{money(totals.costPer, 2)}</td>
                  <td />
                  <td style={{ padding: '9px 8px', textAlign: 'right', fontWeight: 700 }}>{money(totals.gp)}</td>
                  <td style={{ padding: '9px 8px', textAlign: 'right', fontWeight: 700 }}>{money(totals.net)}</td>
                  <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 700 }}>{totals.margin.toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ padding: '9px 18px', borderTop: `1px solid ${t.divider}`, fontSize: 11, color: t.muted2 }}>
            One-time = screens/setup + tax + shipping + design fee · click a row to expand the fee breakdown · margins below the 50% floor flag red
          </div>
        </div>

        {/* Tool 2 + right column */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'stretch' }}>
          <div style={{ flex: 1.4, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${t.divider}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.heading }}>
                Tool 2 · Revenue Projection <span style={{ fontSize: 11.5, fontWeight: 500, color: t.muted2, marginLeft: 8 }}>attendance × $/head · margin assumption 55%</span>
              </div>
              <div style={{ fontSize: 11, color: t.muted2 }}>tap a cell to set your working scenario</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: 'left', padding: '10px 18px' }}>SPEND TIER</th>
                  {[20000, 25000, 30000].map((a, i) => (
                    <th key={a} style={{ ...th, textAlign: 'right', padding: i === 2 ? '10px 18px' : '10px 14px' }}>{a.toLocaleString()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(['Conservative', 'Average', 'Aggressive'] as const).map((tier, ti) => {
                  const rate = projRates[ti]
                  const cell = (att: number) => money((att * rate) / 1000) + 'k gross'
                  const spend = (att: number) => money((att * rate * 0.45) / 1000, 2).replace('.00', '') + 'k'
                  const cols: [20 | 25 | 30, number][] = [
                    [20, 20000],
                    [25, 25000],
                    [30, 30000],
                  ]
                  return (
                    <tr key={tier}>
                      <td style={{ padding: '10px 18px', borderBottom: `1px solid ${t.divider3}` }}>
                        <b>{tier}</b>{' '}
                        <span style={{ display: 'inline-flex', alignItems: 'center', background: t.editBg, border: `1px solid ${t.editBorder}`, borderRadius: 3, padding: '1px 5px', fontWeight: 600, marginLeft: 6 }}>
                          $
                          <EditCell value={rate} type="number" minWidth={12} align="left" onChange={(v) => setProjRates((p) => p.map((x, j) => (j === ti ? num(v) : x)) as [number, number, number])} />
                          /head
                        </span>
                      </td>
                      {cols.map(([attKey, att]) => {
                        const selected = scenario.tier === ti && scenario.att === attKey
                        return (
                          <td
                            key={att}
                            onClick={() => setScenario({ tier: ti, att: attKey })}
                            style={{
                              padding: attKey === 30 ? '8px 18px' : '8px 14px',
                              borderBottom: `1px solid ${t.divider3}`,
                              textAlign: 'right',
                              color: t.secondary,
                              cursor: 'pointer',
                              background: selected ? t.redTintBg : 'transparent',
                              borderLeft: selected ? `1.5px solid ${t.red}` : undefined,
                              borderRight: selected ? `1.5px solid ${t.red}` : undefined,
                            }}
                          >
                            {cell(att)}
                            <br />
                            <span style={{ fontSize: 11, color: t.muted2 }}>
                              spend <b style={{ color: selected ? t.red : t.muted2 }}>{spend(att)}</b>
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div style={{ padding: '11px 18px', fontSize: 11.5, color: t.secondary2, lineHeight: 1.5, borderTop: `1px solid ${t.divider}` }}>
              <b style={{ color: '#444444' }}>Framework guidance:</b> spend aggressively for the attendance you're certain of — confident of 25,000? Plan aggressively for 25,000 so you land in a safe mid-range if turnout runs higher.
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '16px 18px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.muted2, marginBottom: 8 }}>BUDGET CHECK · 25,000 / AGGRESSIVE</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '7px 0', borderBottom: `1px solid ${t.divider3}` }}>
                <span style={{ color: '#666666' }}>Build Sheet all-in cost</span>
                <b>{money(totals.cost)}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '7px 0', borderBottom: `1px solid ${t.divider3}` }}>
                <span style={{ color: '#666666' }}>Inventory budget @ 55% margin</span>
                <b>$56,250</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '7px 0' }}>
                <span style={{ color: '#666666' }}>Headroom</span>
                <b style={{ color: totals.headroom >= 0 ? t.greenText2 : t.red }}>
                  {money(Math.abs(totals.headroom))} {totals.headroom >= 0 ? 'under' : 'over'}
                </b>
              </div>
            </div>
            <div style={{ background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 6, padding: '14px 18px', fontSize: 12.5, color: t.greenText, lineHeight: 1.5 }}>
              <b>✓ You're in range.</b> The plan fits the aggressive budget for the attendance you're confident of — room to add inventory if pre-sales run hot.
            </div>
            <Btn variant="primary" size="lg">Port approved rows to Inventory →</Btn>
            <div style={{ fontSize: 11, color: t.muted2, textAlign: 'center', lineHeight: 1.5 }}>
              Maps Item → name, group → category, sizes → size matrix,
              <br />
              Cost Per → wholesale, Retail → price. No re-entry.
            </div>
            <div style={{ fontSize: 11.5, color: t.secondary2, textAlign: 'center' }}>
              Cost out a new item in the <Link to="/item-builder">Item Builder →</Link>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  )
}
