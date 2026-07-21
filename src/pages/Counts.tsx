import { useMemo, useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { Btn, EditCell, EditLegend, MetricTile, PageHead } from '../components/ui'
import { tokens as t, money } from '../lib/tokens'

interface CRow {
  v: string
  price: number
  inC: number
  add: number
  comp: number
  out: number
  sold: number
}

function calcRow(r: CRow) {
  const tot = r.inC + r.add
  const avail = tot - r.comp - r.out
  const vr = r.sold - avail
  return { tot, gp: tot * r.price, gross: r.sold * r.price, vr }
}

function groupTotals(rows: CRow[]) {
  let inC = 0, add = 0, tot = 0, comp = 0, gp = 0, out = 0, sold = 0, gross = 0
  for (const r of rows) {
    const c = calcRow(r)
    inC += r.inC; add += r.add; tot += c.tot; comp += r.comp; gp += c.gp; out += r.out; sold += r.sold; gross += c.gross
  }
  const vr = sold - (tot - comp - out)
  return { inC, add, tot, comp, gp, out, sold, gross, vr }
}

const teeInit: CRow[] = [
  { v: 'XS', price: 40, inC: 24, add: 0, comp: 0, out: 14, sold: 10 },
  { v: 'S', price: 40, inC: 48, add: 0, comp: 1, out: 26, sold: 21 },
  { v: 'M', price: 40, inC: 152, add: 12, comp: 3, out: 96, sold: 62 },
  { v: 'L', price: 40, inC: 148, add: 0, comp: 2, out: 88, sold: 58 },
  { v: 'XL', price: 40, inC: 108, add: 0, comp: 0, out: 61, sold: 47 },
  { v: '2XL', price: 40, inC: 60, add: 0, comp: 0, out: 38, sold: 22 },
]
const hoodieInit: CRow[] = [
  { v: 'S', price: 60, inC: 20, add: 0, comp: 0, out: 14, sold: 6 },
  { v: 'M', price: 60, inC: 40, add: 0, comp: 1, out: 24, sold: 15 },
  { v: 'L', price: 60, inC: 40, add: 0, comp: 1, out: 17, sold: 22 },
  { v: 'XL', price: 60, inC: 20, add: 0, comp: 0, out: 11, sold: 9 },
]

const th: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, color: t.muted, borderBottom: '1px solid #eeeeee' }
const varColor = (v: number) => (v === 0 ? t.greenText2 : t.red)
const varLabel = (v: number) => (v === 0 ? '0' : (v > 0 ? '+' : '−') + Math.abs(v))

function ArtistRail() {
  return (
    <div style={{ width: 172, flex: 'none', background: '#fcfcfc', borderRight: `1px solid ${t.cardBorder}`, padding: '16px 10px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.muted2, padding: '0 8px 8px' }}>SAT MAY 16</div>
      <div style={{ display: 'flex', gap: 4, padding: '0 2px 10px' }}>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 700, color: t.red, border: `1.5px solid ${t.red}`, borderRadius: 999, padding: '4px 0', background: t.redTintBg }}>Artists</span>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 600, color: t.secondary2, border: `1.5px solid ${t.inputBorder}`, borderRadius: 999, padding: '4px 0', background: '#fff' }}>Festival Merch</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ background: '#fff', border: `1px solid ${t.red}`, borderRadius: 6, padding: '8px 10px', fontSize: 12, lineHeight: 1.35 }}>
          <b>Black Coyote</b>
          <br />
          <span style={{ color: t.greenText2, fontSize: 11 }}>✓ counted in · 12 SKUs</span>
        </div>
        <div style={{ border: '1px solid transparent', borderRadius: 6, padding: '8px 10px', fontSize: 12, lineHeight: 1.35, color: '#444444' }}>
          Neon Harvest
          <br />
          <span style={{ color: t.red, fontSize: 11 }}>2 items not counted</span>
        </div>
        <div style={{ border: '1px solid transparent', borderRadius: 6, padding: '8px 10px', fontSize: 12, lineHeight: 1.35, color: t.muted2 }}>
          Riverline
          <br />
          <span style={{ fontSize: 11, color: '#bbbbbb' }}>fly-in · not arrived</span>
        </div>
        <div style={{ border: '1px solid transparent', borderRadius: 6, padding: '8px 10px', fontSize: 12, lineHeight: 1.35, color: '#444444' }}>
          Gold Static
          <br />
          <span style={{ color: t.greenText2, fontSize: 11 }}>✓ counted in · 8 SKUs</span>
        </div>
        <div style={{ border: `1.5px dashed ${t.faint2}`, borderRadius: 6, padding: '8px 10px', fontSize: 12, color: t.muted, textAlign: 'center', marginTop: 4 }}>+ Add artist</div>
      </div>
    </div>
  )
}

export default function Counts() {
  const [tee, setTee] = useState<CRow[]>(teeInit)
  const [hoodie, setHoodie] = useState<CRow[]>(hoodieInit)
  const [open, setOpen] = useState<{ tee: boolean; hoodie: boolean }>({ tee: true, hoodie: true })
  const [finalized, setFinalized] = useState(false)

  const num = (v: string) => (v === '' || isNaN(Number(v)) ? 0 : Number(v))
  const edit = (
    setter: React.Dispatch<React.SetStateAction<CRow[]>>,
    i: number,
    field: keyof CRow,
    v: number,
  ) => setter((rs) => rs.map((r, j) => (j === i ? { ...r, [field]: v } : r)))

  const teeT = useMemo(() => groupTotals(tee), [tee])
  const hoodieT = useMemo(() => groupTotals(hoodie), [hoodie])

  // Live tiles + rollup (trucker booth is a fixed summary; apparel is computed from the editable groups).
  const TRUCKER = { tot: 40, gross: 270, gpOther: 720 }
  const unitsCounted = teeT.tot + hoodieT.tot + TRUCKER.tot
  const grossSales = teeT.gross + hoodieT.gross + TRUCKER.gross
  const netVar = teeT.vr + hoodieT.vr
  const apparelInGross = tee.reduce((a, r) => a + r.inC * r.price, 0) + hoodie.reduce((a, r) => a + r.inC * r.price, 0)
  const apparelInAdded = tee.reduce((a, r) => a + (r.inC + r.add) * r.price, 0) + hoodie.reduce((a, r) => a + (r.inC + r.add) * r.price, 0)

  const renderRows = (rows: CRow[], setter: React.Dispatch<React.SetStateAction<CRow[]>>, price: number) =>
    rows.map((r, i) => {
      const c = calcRow(r)
      return (
        <tr key={r.v}>
          <td style={{ padding: '7px 14px', borderBottom: `1px solid ${t.divider3}` }} />
          <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}` }}>
            <span style={{ display: 'inline-block', minWidth: 26, textAlign: 'center', background: '#f1f1f1', borderRadius: 3, padding: '2px 6px', fontWeight: 600, color: t.secondary }}>{r.v}</span>
          </td>
          <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#444444' }}>{money(price, 2)}</td>
          <td style={{ padding: '4px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
            <EditCell value={r.inC} type="number" minWidth={34} disabled={finalized} onChange={(v) => edit(setter, i, 'inC', num(v))} />
          </td>
          <td style={{ padding: '4px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
            <EditCell value={r.add} type="number" disabled={finalized} onChange={(v) => edit(setter, i, 'add', num(v))} />
          </td>
          <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', fontWeight: 600, color: t.heading }}>{c.tot}</td>
          <td style={{ padding: '4px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
            <EditCell value={r.comp} type="number" disabled={finalized} onChange={(v) => edit(setter, i, 'comp', num(v))} />
          </td>
          <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#666666' }}>{money(c.gp)}</td>
          <td style={{ padding: '4px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
            <EditCell value={r.out} type="number" minWidth={34} disabled={finalized} onChange={(v) => edit(setter, i, 'out', num(v))} />
          </td>
          <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#444444' }}>{r.sold}</td>
          <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', fontWeight: 700, color: varColor(c.vr) }}>{varLabel(c.vr)}</td>
          <td style={{ padding: '7px 14px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#444444' }}>{money(c.gross, 2)}</td>
        </tr>
      )
    })

  const totalRow = (label: string, price: number, g: ReturnType<typeof groupTotals>) => (
    <tr style={{ background: t.rowBg2 }}>
      <td style={{ padding: '8px 14px', borderBottom: '1px solid #eeeeee' }} />
      <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', fontWeight: 700, color: t.heading }}>{label}</td>
      <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700, color: t.heading }}>{money(price, 2)}</td>
      <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{g.inC}</td>
      <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{g.add}</td>
      <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{g.tot}</td>
      <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{g.comp}</td>
      <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{money(g.gp)}</td>
      <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{g.out}</td>
      <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{g.sold}</td>
      <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700, color: varColor(g.vr) }}>{varLabel(g.vr)}</td>
      <td style={{ padding: '8px 14px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{money(g.gross, 2)}</td>
    </tr>
  )

  const groupHeader = (name: string, meta: string, key: 'tee' | 'hoodie') => (
    <tr style={{ background: t.rowBg }}>
      <td colSpan={12} style={{ padding: '9px 14px', borderBottom: `1px solid ${t.divider}`, cursor: 'pointer' }} onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#666666', fontSize: 10 }}>{open[key] ? '▼' : '▶'}</span>
          <div style={{ width: 30, height: 30, background: '#efefef', border: '1px solid #e2e2e2', borderRadius: 4 }} />
          <b style={{ fontSize: 12.5 }}>{name}</b>
          <span style={{ fontSize: 11, color: t.muted2 }}>{meta}</span>
        </div>
      </td>
    </tr>
  )

  return (
    <AdminLayout active="Counts (In/Out)" rail={<ArtistRail />}>
      <main style={{ flex: 1, minWidth: 0, padding: '20px 24px 32px' }}>
        <PageHead
          title="Spring Music Fest 2026 — Merchandise Counts"
          subtitle="Black Coyote · Saturday, May 16, 2026 · All Booths ▾"
          actions={
            <>
              <Btn>↥ Export</Btn>
              <Btn>Lock Count</Btn>
              <Btn variant="primary">+ Add Item</Btn>
            </>
          }
        />

        {finalized && (
          <div style={{ background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 6, padding: '10px 16px', fontSize: 12.5, color: t.greenText, marginBottom: 14 }}>
            <b>Show finalized.</b> Counts are locked and this artist is ready for settlement — <a href="/settlement">go to Settlement →</a>
          </div>
        )}

        {/* Metric tiles */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <MetricTile label="TOTAL SKUS" value="12" icon="◇" iconBg={t.redTintBg} iconColor={t.red} />
          <MetricTile label="UNITS COUNTED" value={unitsCounted.toLocaleString()} suffix="100% of starting" icon="✓" iconBg="#f2f7f2" iconColor={t.greenText2} />
          <MetricTile label="VARIANCES" value={Math.abs(netVar)} suffix="units" icon="⚠" iconBg="#fdf6ec" iconColor="#c98a1e" />
          <MetricTile label="GROSS SALES" value={money(grossSales)} suffix="today" icon="$" iconBg={t.redTintBg} iconColor={t.red} />
        </div>

        {/* Filter pills + legend */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.red, border: `1.5px solid ${t.red}`, borderRadius: 999, padding: '4px 14px', background: t.redTintBg }}>All Items · 4</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: t.secondary2, border: `1.5px solid ${t.inputBorder}`, borderRadius: 999, padding: '4px 14px', background: '#fff' }}>Not Counted · 1</span>
          </div>
          <EditLegend text="editable cell" />
        </div>

        {/* Counts grid */}
        <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 1020 }}>
            <thead>
              <tr>
                <th style={{ ...th, textAlign: 'left', padding: '10px 14px', letterSpacing: '.04em' }}>ITEM</th>
                <th style={{ ...th, textAlign: 'left', padding: '10px 8px' }}>VARIANT</th>
                {['PRICE', 'IN COUNT', 'ADDED', 'TOTAL IN', 'COMP', 'GROSS POTENTIAL', 'OUT COUNT', 'SOLD', 'VARIANCE'].map((h) => (
                  <th key={h} style={{ ...th, textAlign: 'right', padding: '10px 8px' }}>{h}</th>
                ))}
                <th style={{ ...th, textAlign: 'right', padding: '10px 14px' }}>GROSS SALES ($)</th>
              </tr>
            </thead>
            <tbody>
              {groupHeader('Black Logo Tee', 'Apparel · Festival Merch', 'tee')}
              {open.tee && renderRows(tee, setTee, 40)}
              {open.tee && totalRow('Total', 40, teeT)}

              {groupHeader('Circle Logo Hoodie', 'Apparel · Festival Merch', 'hoodie')}
              {open.hoodie && renderRows(hoodie, setHoodie, 60)}
              {open.hoodie && totalRow('Total', 60, hoodieT)}

              {/* Collapsed summary rows (per handoff, expansion is not built in the demo) */}
              <tr style={{ background: t.rowBg }}>
                <td colSpan={7} style={{ padding: '9px 14px', borderBottom: `1px solid ${t.divider}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#666666', fontSize: 10 }}>▶</span>
                    <div style={{ width: 30, height: 30, background: '#efefef', border: '1px solid #e2e2e2', borderRadius: 4 }} />
                    <b style={{ fontSize: 12.5 }}>Red/White Trucker Hat</b>
                    <span style={{ fontSize: 11, color: t.muted2 }}>Accessories · Festival Merch · OS</span>
                  </div>
                </td>
                <td style={{ padding: '9px 8px', borderBottom: `1px solid ${t.divider}`, textAlign: 'right', fontWeight: 700, color: t.heading }}>$720</td>
                <td style={{ padding: '9px 8px', borderBottom: `1px solid ${t.divider}`, textAlign: 'right', fontWeight: 700 }}>25</td>
                <td style={{ padding: '9px 8px', borderBottom: `1px solid ${t.divider}`, textAlign: 'right', fontWeight: 700 }}>15</td>
                <td style={{ padding: '9px 8px', borderBottom: `1px solid ${t.divider}`, textAlign: 'right', fontWeight: 700, color: t.greenText2 }}>0</td>
                <td style={{ padding: '9px 14px', borderBottom: `1px solid ${t.divider}`, textAlign: 'right', fontWeight: 700 }}>$270.00</td>
              </tr>
              <tr style={{ background: t.rowBg }}>
                <td colSpan={7} style={{ padding: '9px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.55 }}>
                    <span style={{ color: '#666666', fontSize: 10 }}>▶</span>
                    <div style={{ width: 30, height: 30, background: '#efefef', border: '1px solid #e2e2e2', borderRadius: 4 }} />
                    <b style={{ fontSize: 12.5 }}>Black Beanie</b>
                    <span style={{ fontSize: 11, color: t.muted2 }}>Accessories · Festival Merch · OS</span>
                  </div>
                </td>
                <td colSpan={5} style={{ padding: '9px 14px', textAlign: 'right', fontSize: 11.5, color: t.red, fontWeight: 600 }}>
                  Not counted — <a href="#">count in now</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Rollup + actions */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', marginTop: 16 }}>
          <div style={{ flex: 1, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '16px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.heading, marginBottom: 10 }}>Total Merchandise Value × Item</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: 'left', padding: '6px 0' }} />
                  <th style={{ ...th, textAlign: 'right', padding: '6px 10px' }}>APPAREL</th>
                  <th style={{ ...th, textAlign: 'right', padding: '6px 10px' }}>MUSIC</th>
                  <th style={{ ...th, textAlign: 'right', padding: '6px 10px' }}>OTHER</th>
                  <th style={{ ...th, textAlign: 'right', padding: '6px 0' }}>TOTAL MERCH VALUE</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Gross: In Count', apparel: apparelInGross, other: TRUCKER.gpOther },
                  { label: 'Gross: In Count + Added', apparel: apparelInAdded, other: TRUCKER.gpOther },
                  { label: 'Gross: In Count + Added + Comps', apparel: apparelInAdded, other: TRUCKER.gpOther },
                ].map((row, i, arr) => {
                  const border = i < arr.length - 1 ? `1px solid ${t.divider3}` : 'none'
                  return (
                    <tr key={row.label}>
                      <td style={{ padding: '8px 0', color: t.secondary, borderBottom: border }}>{row.label}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', borderBottom: border }}>{money(row.apparel)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', borderBottom: border, color: t.muted2 }}>$0</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', borderBottom: border }}>{money(row.other)}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, borderBottom: border }}>{money(row.apparel + row.other)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div style={{ width: 250, flex: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Btn size="lg" style={{ fontWeight: 600 }}>Save Draft</Btn>
            <Btn size="lg" style={{ fontWeight: 600 }}>Print Reconciliation</Btn>
            <Btn variant="primary" size="lg" onClick={() => setFinalized(true)}>{finalized ? 'Show Finalized ✓' : 'Finalize Show'}</Btn>
            <div style={{ fontSize: 11, color: t.muted2, textAlign: 'center', lineHeight: 1.5 }}>
              Finalizing this show locks counts and queues
              <br />
              Black Coyote for one-click settlement.
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  )
}
