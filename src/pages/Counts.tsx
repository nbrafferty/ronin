import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { Btn, EditCell, EditLegend, MetricTile, PageHead } from '../components/ui'
import { Drawer, Modal } from '../components/overlays'
import { ItemBuilderForm } from '../components/ItemBuilderForm'
import { tokens as t, money } from '../lib/tokens'
import { useRole } from '../lib/roles'

type Group = 'tee' | 'hoodie'
interface CRow { v: string; price: number; inC: number; comp: number; shrink: number; out: number; sold: number }
interface Reup { id: number; group: Group; variant: string; qty: number; time: string; note: string }

const teeInit: CRow[] = [
  { v: 'XS', price: 40, inC: 24, comp: 0, shrink: 0, out: 14, sold: 10 },
  { v: 'S', price: 40, inC: 48, comp: 1, shrink: 0, out: 26, sold: 21 },
  { v: 'M', price: 40, inC: 140, comp: 3, shrink: 1, out: 96, sold: 62 },
  { v: 'L', price: 40, inC: 148, comp: 2, shrink: 2, out: 88, sold: 58 },
  { v: 'XL', price: 40, inC: 108, comp: 0, shrink: 0, out: 61, sold: 47 },
  { v: '2XL', price: 40, inC: 60, comp: 0, shrink: 0, out: 38, sold: 22 },
]
const hoodieInit: CRow[] = [
  { v: 'S', price: 60, inC: 20, comp: 0, shrink: 0, out: 14, sold: 6 },
  { v: 'M', price: 60, inC: 40, comp: 1, shrink: 0, out: 24, sold: 15 },
  { v: 'L', price: 60, inC: 40, comp: 1, shrink: 0, out: 17, sold: 22 },
  { v: 'XL', price: 60, inC: 20, comp: 0, shrink: 0, out: 11, sold: 9 },
]
const reupsInit: Reup[] = [
  { id: 1, group: 'tee', variant: 'M', qty: 12, time: '9:12 PM', note: 'Flash print — restock from booth' },
]

const th: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, color: t.muted, borderBottom: '1px solid #eeeeee' }
const varColor = (v: number) => (v === 0 ? t.greenText2 : t.red)
const varLabel = (v: number) => (v === 0 ? '0' : (v > 0 ? '+' : '−') + Math.abs(v))
const nowTime = () => {
  const d = new Date()
  let h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m} ${ap}`
}

function VendorRail() {
  const { canSee } = useRole()
  const vendors = [
    { name: 'Black Coyote', note: '✓ counted in · 12 SKUs', color: t.greenText2, active: true },
    { name: 'Neon Harvest', note: '2 items not counted', color: t.red, active: false },
    { name: 'Riverline', note: 'fly-in · not arrived', color: '#bbbbbb', active: false },
    { name: 'Gold Static', note: '✓ counted in · 8 SKUs', color: t.greenText2, active: false },
  ].filter((v) => canSee(v.name))
  return (
    <div style={{ width: 172, flex: 'none', background: '#fcfcfc', borderRight: `1px solid ${t.cardBorder}`, padding: '16px 10px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.muted2, padding: '0 8px 8px' }}>SAT MAY 16</div>
      <div style={{ display: 'flex', gap: 4, padding: '0 2px 10px' }}>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 700, color: t.red, border: `1.5px solid ${t.red}`, borderRadius: 999, padding: '4px 0', background: t.redTintBg }}>Vendors</span>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 600, color: t.secondary2, border: `1.5px solid ${t.inputBorder}`, borderRadius: 999, padding: '4px 0', background: '#fff' }}>Festival</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {vendors.map((v) => (
          <div key={v.name} style={{ background: v.active ? '#fff' : undefined, border: v.active ? `1px solid ${t.red}` : '1px solid transparent', borderRadius: 6, padding: '8px 10px', fontSize: 12, lineHeight: 1.35, color: v.active ? undefined : '#444444' }}>
            <b>{v.name}</b>
            <br />
            <span style={{ color: v.color, fontSize: 11 }}>{v.note}</span>
          </div>
        ))}
        <div style={{ border: `1.5px dashed ${t.faint2}`, borderRadius: 6, padding: '8px 10px', fontSize: 12, color: t.muted, textAlign: 'center', marginTop: 4 }}>+ Add vendor</div>
      </div>
    </div>
  )
}

export default function Counts() {
  const nav = useNavigate()
  const [tee, setTee] = useState<CRow[]>(teeInit)
  const [hoodie, setHoodie] = useState<CRow[]>(hoodieInit)
  const [reups, setReups] = useState<Reup[]>(reupsInit)
  const [open, setOpen] = useState<{ tee: boolean; hoodie: boolean }>({ tee: true, hoodie: true })
  const [finalized, setFinalized] = useState(false)
  const [showReconcile, setShowReconcile] = useState(false)
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [reupOpen, setReupOpen] = useState<null | Group>(null)
  const [signoff, setSignoff] = useState<'none' | 'requested' | 'confirmed' | 'disputed'>('none')
  const [signoffOpen, setSignoffOpen] = useState(false)
  const [carryFwd, setCarryFwd] = useState(false)

  const num = (v: string) => (v === '' || isNaN(Number(v)) ? 0 : Number(v))
  const rowsFor = (g: Group) => (g === 'tee' ? tee : hoodie)
  const setterFor = (g: Group) => (g === 'tee' ? setTee : setHoodie)
  const addedFor = (g: Group, v: string) => reups.filter((r) => r.group === g && r.variant === v).reduce((a, r) => a + r.qty, 0)

  const calcRow = (g: Group, r: CRow) => {
    const added = addedFor(g, r.v)
    const tot = r.inC + added
    const avail = tot - r.comp - r.shrink - r.out
    const vr = r.sold - avail
    return { added, tot, avail, vr, gross: r.sold * r.price }
  }
  const groupTot = (g: Group) => {
    const rows = rowsFor(g)
    let inC = 0, added = 0, tot = 0, comp = 0, shrink = 0, out = 0, sold = 0, gross = 0
    for (const r of rows) {
      const c = calcRow(g, r)
      inC += r.inC; added += c.added; tot += c.tot; comp += r.comp; shrink += r.shrink; out += r.out; sold += r.sold; gross += c.gross
    }
    return { inC, added, tot, comp, shrink, out, sold, gross }
  }
  const edit = (g: Group, i: number, field: keyof CRow, v: number) => setterFor(g)((rs) => rs.map((r, j) => (j === i ? { ...r, [field]: v } : r)))

  const teeT = useMemo(() => groupTot('tee'), [tee, reups])
  const hoodieT = useMemo(() => groupTot('hoodie'), [hoodie, reups])

  const TRUCKER = { tot: 40, gross: 270 }
  const unitsCounted = teeT.tot + hoodieT.tot + TRUCKER.tot
  const grossSales = teeT.gross + hoodieT.gross + TRUCKER.gross

  // Variance + damage items feeding the reconciliation prompt.
  const reconItems = useMemo(() => {
    const out: { group: Group; v: string; price: number; vr: number; shrink: number }[] = []
    for (const g of ['tee', 'hoodie'] as Group[]) {
      rowsFor(g).forEach((r) => {
        const { vr } = calcRow(g, r)
        if (vr !== 0 || r.shrink > 0) out.push({ group: g, v: r.v, price: r.price, vr, shrink: r.shrink })
      })
    }
    return out
  }, [tee, hoodie, reups])
  const varianceUnits = reconItems.reduce((a, r) => a + Math.abs(r.vr), 0)
  const nameOf = (g: Group) => (g === 'tee' ? 'Black Logo Tee' : 'Circle Logo Hoodie')

  const groupName = (g: Group) => (g === 'tee' ? 'Black Logo Tee' : 'Circle Logo Hoodie')

  const renderRows = (g: Group) => {
    const rows = rowsFor(g)
    return rows.map((r, i) => {
      const c = calcRow(g, r)
      return (
        <tr key={r.v}>
          <td style={{ padding: '7px 14px', borderBottom: `1px solid ${t.divider3}` }} />
          <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}` }}>
            <span style={{ display: 'inline-block', minWidth: 26, textAlign: 'center', background: '#f1f1f1', borderRadius: 3, padding: '2px 6px', fontWeight: 600, color: t.secondary }}>{r.v}</span>
          </td>
          <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#444444' }}>{money(r.price, 2)}</td>
          <td style={{ padding: '4px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
            <EditCell value={r.inC} type="number" minWidth={34} disabled={finalized} onChange={(v) => edit(g, i, 'inC', num(v))} />
          </td>
          <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: c.added ? t.greenText2 : t.faint, fontWeight: c.added ? 700 : 400 }}>
            {c.added ? `+${c.added}` : '—'}
          </td>
          <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', fontWeight: 600, color: t.heading }}>{c.tot}</td>
          <td style={{ padding: '4px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
            <EditCell value={r.comp} type="number" disabled={finalized} onChange={(v) => edit(g, i, 'comp', num(v))} />
          </td>
          <td style={{ padding: '4px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
            <EditCell value={r.shrink} type="number" disabled={finalized} onChange={(v) => edit(g, i, 'shrink', num(v))} />
          </td>
          <td style={{ padding: '4px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
            <EditCell value={r.out} type="number" minWidth={34} disabled={finalized} onChange={(v) => edit(g, i, 'out', num(v))} />
          </td>
          <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#444444' }}>{r.sold}</td>
          <td style={{ padding: '7px 14px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#444444' }}>{money(c.gross, 2)}</td>
        </tr>
      )
    })
  }

  const totalRow = (g: Group) => {
    const gt = g === 'tee' ? teeT : hoodieT
    const price = g === 'tee' ? 40 : 60
    return (
      <tr style={{ background: t.rowBg2 }}>
        <td style={{ padding: '8px 14px', borderBottom: '1px solid #eeeeee' }} />
        <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', fontWeight: 700, color: t.heading }}>Total</td>
        <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700, color: t.heading }}>{money(price, 2)}</td>
        <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{gt.inC}</td>
        <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700, color: gt.added ? t.greenText2 : undefined }}>{gt.added ? `+${gt.added}` : '—'}</td>
        <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{gt.tot}</td>
        <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{gt.comp}</td>
        <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700, color: gt.shrink ? t.red : undefined }}>{gt.shrink}</td>
        <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{gt.out}</td>
        <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{gt.sold}</td>
        <td style={{ padding: '8px 14px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{money(gt.gross, 2)}</td>
      </tr>
    )
  }

  const groupHeader = (g: Group) => (
    <tr style={{ background: t.rowBg }}>
      <td colSpan={11} style={{ padding: '9px 14px', borderBottom: `1px solid ${t.divider}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span onClick={() => setOpen((o) => ({ ...o, [g]: !o[g] }))} style={{ color: '#666666', fontSize: 10, cursor: 'pointer' }}>{open[g] ? '▼' : '▶'}</span>
          <div style={{ width: 30, height: 30, background: '#efefef', border: '1px solid #e2e2e2', borderRadius: 4 }} />
          <b style={{ fontSize: 12.5 }}>{groupName(g)}</b>
          <span style={{ fontSize: 11, color: t.muted2 }}>Apparel · Festival Merch</span>
          <div style={{ flex: 1 }} />
          {!finalized && (
            <button onClick={() => setReupOpen(g)} style={{ fontFamily: 'inherit', fontSize: 11, fontWeight: 700, color: t.red, background: t.redTintBg, border: `1px solid ${t.redTintBorder}`, borderRadius: 4, padding: '3px 10px', cursor: 'pointer' }}>
              + Add re-up
            </button>
          )}
        </div>
      </td>
    </tr>
  )

  return (
    <AdminLayout active="Counts (In/Out)" rail={<VendorRail />}>
      <main style={{ flex: 1, minWidth: 0, padding: '20px 24px 32px' }}>
        <PageHead
          title="Spring Music Fest 2026 — Merchandise Counts"
          subtitle="Black Coyote · Saturday, May 16, 2026 · All Booths ▾"
          actions={
            <>
              <Btn>↥ Export</Btn>
              <Btn>Lock Count</Btn>
              <Btn variant="primary" onClick={() => setAddItemOpen(true)}>+ Add Item</Btn>
            </>
          }
        />

        {finalized && (
          <div style={{ background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 6, padding: '10px 16px', fontSize: 12.5, color: t.greenText, marginBottom: 14 }}>
            <b>Show finalized.</b> Counts are locked and this vendor is queued for settlement —{' '}
            <a onClick={() => nav('/settlement')} style={{ cursor: 'pointer' }}>go to Settlement →</a>
            {carryFwd && <> · ending inventory carried forward as next show's starting count.</>}
          </div>
        )}

        {/* KPIs — kept as the 30,000-ft summary */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <MetricTile label="TOTAL SKUS" value="12" icon="◇" iconBg={t.redTintBg} iconColor={t.red} />
          <MetricTile label="UNITS COUNTED" value={unitsCounted.toLocaleString()} suffix="incl. re-ups" icon="✓" iconBg="#f2f7f2" iconColor={t.greenText2} />
          <MetricTile label="VARIANCES" value={varianceUnits} suffix="units" icon="⚠" iconBg="#fdf6ec" iconColor="#c98a1e" />
          <MetricTile label="GROSS SALES" value={money(grossSales)} suffix="today" icon="$" iconBg={t.redTintBg} iconColor={t.red} />
        </div>

        {/* Filter pills + legend */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.red, border: `1.5px solid ${t.red}`, borderRadius: 999, padding: '4px 14px', background: t.redTintBg }}>All Items · 4</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: t.secondary2, border: `1.5px solid ${t.inputBorder}`, borderRadius: 999, padding: '4px 14px', background: '#fff' }}>Not Counted · 1</span>
          </div>
          <EditLegend text="editable cell · Comp = giveaways · Shrink = damaged / lost" />
        </div>

        {/* Counts grid */}
        <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 1040 }}>
            <thead>
              <tr>
                <th style={{ ...th, textAlign: 'left', padding: '10px 14px', letterSpacing: '.04em' }}>ITEM</th>
                <th style={{ ...th, textAlign: 'left', padding: '10px 8px' }}>VARIANT</th>
                {['PRICE', 'IN COUNT', 'ADDED', 'TOTAL IN', 'COMP', 'SHRINK', 'OUT COUNT', 'SOLD'].map((h) => (
                  <th key={h} style={{ ...th, textAlign: 'right', padding: '10px 8px' }}>{h}</th>
                ))}
                <th style={{ ...th, textAlign: 'right', padding: '10px 14px' }}>GROSS SALES ($)</th>
              </tr>
            </thead>
            <tbody>
              {groupHeader('tee')}
              {open.tee && renderRows('tee')}
              {open.tee && totalRow('tee')}
              {groupHeader('hoodie')}
              {open.hoodie && renderRows('hoodie')}
              {open.hoodie && totalRow('hoodie')}

              <tr style={{ background: t.rowBg }}>
                <td colSpan={6} style={{ padding: '9px 14px', borderBottom: `1px solid ${t.divider}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#666666', fontSize: 10 }}>▶</span>
                    <div style={{ width: 30, height: 30, background: '#efefef', border: '1px solid #e2e2e2', borderRadius: 4 }} />
                    <b style={{ fontSize: 12.5 }}>Red/White Trucker Hat</b>
                    <span style={{ fontSize: 11, color: t.muted2 }}>Accessories · OS</span>
                  </div>
                </td>
                <td style={{ padding: '9px 8px', borderBottom: `1px solid ${t.divider}`, textAlign: 'right', fontWeight: 700 }}>40</td>
                <td style={{ padding: '9px 8px', borderBottom: `1px solid ${t.divider}`, textAlign: 'right', fontWeight: 700, color: t.greenText2 }}>0</td>
                <td style={{ padding: '9px 8px', borderBottom: `1px solid ${t.divider}`, textAlign: 'right', fontWeight: 700 }}>25</td>
                <td style={{ padding: '9px 8px', borderBottom: `1px solid ${t.divider}`, textAlign: 'right', fontWeight: 700 }}>15</td>
                <td style={{ padding: '9px 14px', borderBottom: `1px solid ${t.divider}`, textAlign: 'right', fontWeight: 700 }}>$270.00</td>
              </tr>
              <tr style={{ background: t.rowBg }}>
                <td colSpan={6} style={{ padding: '9px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.55 }}>
                    <span style={{ color: '#666666', fontSize: 10 }}>▶</span>
                    <div style={{ width: 30, height: 30, background: '#efefef', border: '1px solid #e2e2e2', borderRadius: 4 }} />
                    <b style={{ fontSize: 12.5 }}>Black Beanie</b>
                    <span style={{ fontSize: 11, color: t.muted2 }}>Accessories · OS</span>
                  </div>
                </td>
                <td colSpan={5} style={{ padding: '9px 14px', textAlign: 'right', fontSize: 11.5, color: t.red, fontWeight: 600 }}>
                  Not counted — <a href="#">count in now</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Re-up log */}
        <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: `1px solid ${t.divider}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.heading }}>Inventory re-up log <span style={{ fontWeight: 500, color: t.muted2, fontSize: 11.5, marginLeft: 6 }}>mid-show restocks feed back into the count-in total</span></div>
            <span style={{ fontSize: 11.5, color: t.muted2 }}>{reups.length} re-up{reups.length === 1 ? '' : 's'} · +{reups.reduce((a, r) => a + r.qty, 0)} units</span>
          </div>
          {reups.length === 0 ? (
            <div style={{ padding: '14px 18px', fontSize: 12, color: t.muted2 }}>No re-ups yet. Use <b>+ Add re-up</b> on an item to log a mid-show restock (flash print, merch off the bus).</div>
          ) : (
            reups.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 18px', borderBottom: i < reups.length - 1 ? `1px solid ${t.divider3}` : 'none', fontSize: 12.5 }}>
                <span style={{ color: t.muted2, width: 68, fontVariantNumeric: 'tabular-nums' }}>{r.time}</span>
                <span style={{ fontWeight: 700, color: t.greenText2, width: 44 }}>+{r.qty}</span>
                <span style={{ color: t.body2 }}><b>{nameOf(r.group)}</b> · {r.variant}</span>
                <span style={{ flex: 1, color: t.muted2 }}>{r.note}</span>
              </div>
            ))
          )}
        </div>

        {/* Sign-off + actions */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', marginTop: 16 }}>
          {/* Vendor sign-off flow */}
          <div style={{ flex: 1, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '16px 18px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.heading, marginBottom: 4 }}>Vendor sign-off</div>
            <div style={{ fontSize: 11.5, color: t.muted2, marginBottom: 12 }}>Confirm counts with the vendor by email or text — required before settlement.</div>
            {signoff === 'none' && (
              <>
                <Btn variant="primary" onClick={() => setSignoffOpen(true)}>Request vendor sign-off</Btn>
                <div style={{ fontSize: 11, color: t.muted2, marginTop: 10, lineHeight: 1.5 }}>
                  Fly-in / ship-in-a-box vendors: the festival counts alone and the request <b>auto-confirms after 24h unless disputed</b>.
                </div>
              </>
            )}
            {signoff === 'requested' && (
              <div style={{ background: '#fdf6ec', border: '1px solid #f0dcae', borderRadius: 6, padding: '12px 14px' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#8a5d12' }}>⏳ Awaiting Dana Reyes (Tour Manager)</div>
                <div style={{ fontSize: 11.5, color: '#8a5d12', marginTop: 3 }}>Request sent · auto-confirms in 24h unless disputed.</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <Btn size="sm" onClick={() => setSignoff('confirmed')}>Simulate confirm</Btn>
                  <Btn size="sm" onClick={() => setSignoff('disputed')}>Simulate dispute</Btn>
                </div>
              </div>
            )}
            {signoff === 'confirmed' && (
              <div style={{ background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 6, padding: '12px 14px', fontSize: 12.5, color: t.greenText }}>
                <b>✓ Signed off by Dana Reyes</b> · counts confirmed, no disputes. Ready to finalize.
              </div>
            )}
            {signoff === 'disputed' && (
              <div style={{ background: '#fdecea', border: `1px solid ${t.redTintBorder}`, borderRadius: 6, padding: '12px 14px', fontSize: 12.5, color: t.red }}>
                <b>⚑ Disputed by vendor</b> — resolve flagged items on the{' '}
                <a onClick={() => nav('/reconciliation')} style={{ cursor: 'pointer' }}>Reconciliation page →</a>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ width: 250, flex: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: t.secondary, cursor: 'pointer', padding: '2px 0 6px' }}>
              <input type="checkbox" checked={carryFwd} onChange={(e) => setCarryFwd(e.target.checked)} />
              Carry ending count → next show's start
            </label>
            <Btn size="lg" style={{ fontWeight: 600 }}>Save Draft</Btn>
            <Btn size="lg" style={{ fontWeight: 600 }}>Print Reconciliation</Btn>
            <Btn variant="primary" size="lg" onClick={() => (finalized ? undefined : setShowReconcile(true))}>{finalized ? 'Show Finalized ✓' : 'Finalize Show'}</Btn>
            <div style={{ fontSize: 11, color: t.muted2, textAlign: 'center', lineHeight: 1.5 }}>
              Finalizing prompts reconciliation of variances &amp; damages, then locks counts and queues Black Coyote for settlement.
            </div>
          </div>
        </div>
      </main>

      {/* Add Item slide-out */}
      <Drawer
        open={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        title="Add item"
        subtitle="Black Coyote · Spring Music Fest 2026"
        width={560}
        footer={
          <>
            <Btn onClick={() => setAddItemOpen(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={() => setAddItemOpen(false)}>Add to count →</Btn>
          </>
        }
      >
        <ItemBuilderForm />
      </Drawer>

      {/* Add re-up modal */}
      <ReupModal group={reupOpen} rows={reupOpen ? rowsFor(reupOpen) : []} onClose={() => setReupOpen(null)} onAdd={(variant, qty, note) => {
        setReups((rs) => [{ id: (rs.at(-1)?.id ?? 0) + 1, group: reupOpen!, variant, qty, time: nowTime(), note: note || 'Mid-show re-up' }, ...rs])
        setReupOpen(null)
      }} nameOf={nameOf} />

      {/* Reconciliation prompt on Finalize */}
      <Modal
        open={showReconcile}
        onClose={() => setShowReconcile(false)}
        title="Reconcile before finalizing"
        width={620}
        footer={
          <>
            <Btn onClick={() => { setShowReconcile(false); nav('/reconciliation') }}>Open full Reconciliation →</Btn>
            <Btn variant="primary" onClick={() => { setFinalized(true); setShowReconcile(false) }}>Confirm &amp; finalize</Btn>
          </>
        }
      >
        {reconItems.length === 0 ? (
          <div style={{ fontSize: 13, color: t.greenText, background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 6, padding: '12px 14px' }}>
            ✓ No variances or damages — counts reconcile cleanly. Finalizing will lock this show.
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12.5, color: t.secondary, marginBottom: 12 }}>
              {reconItems.length} item{reconItems.length === 1 ? '' : 's'} need a decision. Resolutions adjust the payout in real time — do a quick pass here or open the full page.
            </div>
            <div style={{ border: `1px solid ${t.cardBorder}`, borderRadius: 6, overflow: 'hidden' }}>
              {reconItems.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: i < reconItems.length - 1 ? `1px solid ${t.divider3}` : 'none', fontSize: 12.5 }}>
                  <div style={{ flex: 1 }}>
                    <b>{groupName(it.group)}</b> · {it.v}
                    <div style={{ fontSize: 11, color: t.muted2, marginTop: 1 }}>
                      {it.vr !== 0 && <span style={{ color: t.red }}>variance {varLabel(it.vr)} units </span>}
                      {it.shrink > 0 && <span style={{ color: t.red }}>· {it.shrink} shrink</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: t.muted2 }}>resolve on next page</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>

      {/* Request sign-off drawer */}
      <Drawer
        open={signoffOpen}
        onClose={() => setSignoffOpen(false)}
        title="Request vendor sign-off"
        subtitle="Black Coyote · count confirmation"
        width={460}
        footer={
          <>
            <Btn onClick={() => setSignoffOpen(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={() => { setSignoff('requested'); setSignoffOpen(false) }}>Send request</Btn>
          </>
        }
      >
        <SignoffForm />
      </Drawer>
    </AdminLayout>
  )
}

function ReupModal({ group, rows, onClose, onAdd, nameOf }: { group: 'tee' | 'hoodie' | null; rows: CRow[]; onClose: () => void; onAdd: (v: string, q: number, note: string) => void; nameOf: (g: 'tee' | 'hoodie') => string }) {
  const [variant, setVariant] = useState('')
  const [qty, setQty] = useState('12')
  const [note, setNote] = useState('')
  const v = variant || rows[0]?.v || ''
  if (!group) return null
  return (
    <Modal
      open={!!group}
      onClose={onClose}
      title={`Add re-up · ${nameOf(group)}`}
      width={440}
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={() => onAdd(v, Number(qty) || 0, note)}>Log re-up (+{Number(qty) || 0})</Btn>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 12, color: t.secondary }}>Logs a timestamped restock that adds to the count-in total for the selected variant.</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: t.muted, marginBottom: 5 }}>VARIANT</div>
            <select value={v} onChange={(e) => setVariant(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${t.inputBorder}`, borderRadius: 4, fontSize: 13, fontFamily: 'inherit' }}>
              {rows.map((r) => <option key={r.v} value={r.v}>{r.v}</option>)}
            </select>
          </div>
          <div style={{ width: 110 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: t.muted, marginBottom: 5 }}>QTY</div>
            <input value={qty} onChange={(e) => setQty(e.target.value)} inputMode="numeric" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${t.inputBorder}`, borderRadius: 4, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: t.muted, marginBottom: 5 }}>NOTE</div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Flash print, merch off the bus…" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${t.inputBorder}`, borderRadius: 4, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>
      </div>
    </Modal>
  )
}

function SignoffForm() {
  const [channel, setChannel] = useState<'Email' | 'Text'>('Email')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 12.5, color: t.secondary, lineHeight: 1.5 }}>
        Send the count summary to the vendor for confirmation. They can confirm or mark a discrepancy from their phone.
      </div>
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: t.muted, marginBottom: 6 }}>SEND VIA</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['Email', 'Text'] as const).map((c) => (
            <button key={c} onClick={() => setChannel(c)} style={{ flex: 1, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, padding: '9px 0', borderRadius: 6, cursor: 'pointer', border: `1.5px solid ${channel === c ? t.red : t.inputBorder}`, color: channel === c ? t.red : t.secondary2, background: channel === c ? t.redTintBg : '#fff' }}>
              {c === 'Email' ? '✉ Email' : '💬 Text'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ background: t.rowBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '12px 14px', fontSize: 12.5 }}>
        <div style={{ fontWeight: 700, color: t.heading }}>Dana Reyes · Tour Manager</div>
        <div style={{ color: t.secondary, marginTop: 2 }}>{channel === 'Email' ? 'dana@blackcoyote.band' : '+1 (512) 555‑0148'}</div>
      </div>
      <div style={{ fontSize: 11.5, color: t.muted2, lineHeight: 1.5 }}>
        Fly-in / ship-in-a-box vendor? The festival counts alone and this request <b>auto-confirms after 24h unless the vendor disputes</b>.
      </div>
    </div>
  )
}
