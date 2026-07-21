import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { Btn, EditCell, PageHead } from '../components/ui'
import { tokens as t } from '../lib/tokens'

const SCREEN_FEE = 40
const UNITS_PLANNED = 960 // planning quantity used to amortise one-time costs per unit

const label: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, color: t.muted, marginBottom: 4 }
const inputBox: React.CSSProperties = {
  border: `1px solid ${t.inputBorder}`,
  borderRadius: 4,
  padding: '8px 12px',
  fontSize: 13,
}

export default function ItemBuilder() {
  const [scenario, setScenario] = useState<'healthy' | 'below target'>('healthy')
  const [front, setFront] = useState(3)
  const [back, setBack] = useState(1)
  const [blankCost, setBlankCost] = useState(3.2)
  const [printCost, setPrintCost] = useState(3.9)
  const [designFee, setDesignFee] = useState(250)
  const [tax, setTax] = useState(118)
  const [shipping, setShipping] = useState(95)
  const [retail, setRetail] = useState(35)

  const num = (v: string) => (v === '' || isNaN(Number(v)) ? 0 : Number(v))

  // Switching the demo scenario presets retail to a healthy vs. thin price point.
  const setScen = (s: 'healthy' | 'below target') => {
    setScenario(s)
    setRetail(s === 'below target' ? 18 : 35)
  }

  const screenCount = front + back
  const screensCost = screenCount * SCREEN_FEE
  const perUnitCost = blankCost + printCost
  const oneTimeTotal = screensCost + designFee + tax + shipping
  const oneTimePer = oneTimeTotal / UNITS_PLANNED
  const allInPerUnit = perUnitCost + oneTimePer
  const net = retail - allInPerUnit
  const pct = retail > 0 ? (net / retail) * 100 : 0
  const low = pct < 50

  const accent = low ? t.red : t.greenText2
  const marginBg = low ? '#fdecea' : t.greenBg
  const marginColor = low ? t.red : t.greenText
  const marginNote = low ? 'below the 50% floor — raise retail or cut costs' : 'clear of the 50% floor'

  return (
    <AdminLayout active="Merch Planning">
      <main style={{ padding: '20px 24px 32px', maxWidth: 1060 }}>
        <PageHead
          title="Item Builder"
          breadcrumb={<><Link to="/planning">Merch Planning</Link> / Item Builder</>}
          subtitle="Cost out a new item — the saved item becomes a Build Sheet row"
          actions={
            <>
              <Btn>Cancel</Btn>
              <Btn>Save Draft</Btn>
              <Btn variant="primary">Add to Build Sheet →</Btn>
            </>
          }
        />

        {/* Demo-state toggle for the margin scenario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 11.5, color: t.muted2 }}>
          <span style={{ fontWeight: 700, letterSpacing: '.04em' }}>DEMO STATE</span>
          {(['healthy', 'below target'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScen(s)}
              style={{
                fontFamily: 'inherit',
                fontSize: 11.5,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 999,
                cursor: 'pointer',
                border: `1.5px solid ${scenario === s ? t.red : t.inputBorder}`,
                color: scenario === s ? t.red : t.secondary2,
                background: scenario === s ? t.redTintBg : t.cardBg,
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          {/* Left column: artwork + print colors */}
          <div style={{ width: 320, flex: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: 16 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: t.heading, marginBottom: 10 }}>Design artwork</div>
              <div
                style={{
                  height: 220,
                  border: '1.5px dashed #cccccc',
                  borderRadius: 6,
                  background: 'repeating-linear-gradient(45deg,#fbfbfb,#fbfbfb 8px,#f4f4f4 8px,#f4f4f4 16px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  textAlign: 'center',
                }}
              >
                <div style={{ width: 34, height: 34, border: '1.5px solid #bbbbbb', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted2, fontSize: 16, background: '#fff' }}>↥</div>
                <div style={{ fontSize: 12, color: '#666666', fontWeight: 600 }}>Drag &amp; drop or click to upload</div>
                <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10.5, color: t.faint }}>front + back art · JPG, PNG up to 5MB</div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                {[
                  { l: 'Front', on: true },
                  { l: 'Back', on: false },
                  { l: '+ View', on: false },
                ].map((p) => (
                  <span
                    key={p.l}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: 11.5,
                      fontWeight: p.on ? 700 : 600,
                      color: p.on ? t.red : t.secondary2,
                      border: `1.5px solid ${p.on ? t.red : t.inputBorder}`,
                      borderRadius: 999,
                      padding: '5px 0',
                      background: p.on ? t.redTintBg : '#fff',
                    }}
                  >
                    {p.l}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: 16 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: t.heading, marginBottom: 4 }}>Print colors</div>
              <div style={{ fontSize: 11.5, color: t.muted2, marginBottom: 10 }}>Together these set the screen count and setup fee</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={label}>FRONT</div>
                  <div style={{ background: t.editBg, border: `1px solid ${t.editBorder}`, borderRadius: 4, padding: '8px 12px', fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
                    <EditCell value={front} type="number" minWidth={16} align="center" onChange={(v) => setFront(num(v))} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={label}>BACK</div>
                  <div style={{ background: t.editBg, border: `1px solid ${t.editBorder}`, borderRadius: 4, padding: '8px 12px', fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
                    <EditCell value={back} type="number" minWidth={16} align="center" onChange={(v) => setBack(num(v))} />
                  </div>
                </div>
                <div style={{ flex: 1.4 }}>
                  <div style={label}>SCREENS</div>
                  <div style={{ border: `1px solid #eeeeee`, borderRadius: 4, padding: '8px 12px', fontSize: 14, fontWeight: 700, textAlign: 'center', color: '#666666', background: t.rowBg }}>
                    {screenCount} × ${SCREEN_FEE}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: form + costs + margin bar */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '16px 18px' }}>
              <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                <div style={{ flex: 1.4 }}>
                  <div style={label}>ITEM NAME *</div>
                  <div style={{ ...inputBox, fontWeight: 600 }}>SS Lineup Tee</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={label}>CATEGORY</div>
                  <div style={{ display: 'flex', border: `1.5px solid ${t.inputBorder}`, borderRadius: 4, overflow: 'hidden', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
                    <span style={{ flex: 1, padding: '7px 0', color: t.red, background: t.redTintBg, borderRight: `1.5px solid ${t.inputBorder}` }}>Apparel</span>
                    <span style={{ flex: 1, padding: '7px 0', color: t.secondary2, borderRight: `1.5px solid ${t.inputBorder}` }}>Music</span>
                    <span style={{ flex: 1, padding: '7px 0', color: t.secondary2 }}>Other</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ flex: 1.4 }}>
                  <div style={label}>BLANK (GARMENT STYLE)</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      { l: 'G2000', on: true, dashed: false },
                      { l: 'G2400', on: false, dashed: false },
                      { l: 'Tultex 245', on: false, dashed: false },
                      { l: 'Custom…', on: false, dashed: true },
                    ].map((p) => (
                      <span
                        key={p.l}
                        style={{
                          fontSize: 11.5,
                          fontWeight: p.on ? 700 : 600,
                          color: p.on ? t.red : t.secondary2,
                          border: `1.5px ${p.dashed ? 'dashed' : 'solid'} ${p.on ? t.red : t.faint2}`,
                          borderRadius: 999,
                          padding: '5px 14px',
                          background: p.on ? t.redTintBg : undefined,
                        }}
                      >
                        {p.l}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={label}>GARMENT COLOR</div>
                  <div style={{ ...inputBox, color: t.body2, display: 'flex', justifyContent: 'space-between' }}>
                    Black <span style={{ color: t.muted2 }}>▾</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Costs table */}
            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: `1px solid ${t.divider}` }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: t.heading }}>Costs</div>
                <div style={{ fontSize: 11, color: t.muted2 }}>
                  <span style={{ display: 'inline-block', width: 10, height: 10, background: t.editBg, border: `1px solid ${t.editBorder}`, borderRadius: 2, verticalAlign: -1 }} /> editable · gray = auto-calculated
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px 18px', borderBottom: `1px solid ${t.divider3}`, color: t.secondary, width: '44%' }}>
                      Blank cost <span style={{ color: t.faint }}>/ unit</span>
                    </td>
                    <td style={{ padding: '6px 12px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
                      <EditCell value={blankCost.toFixed(2)} prefix="$" type="number" minWidth={60} onChange={(v) => setBlankCost(num(v))} />
                    </td>
                    <td style={{ padding: '10px 18px', borderBottom: `1px solid ${t.divider3}`, color: t.secondary, width: '30%' }}>
                      Screen / set up <span style={{ color: t.faint }}>one-time</span>
                    </td>
                    <td style={{ padding: '10px 18px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#666666', background: t.rowBg, fontWeight: 600 }}>
                      ${screensCost.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 18px', borderBottom: `1px solid ${t.divider3}`, color: t.secondary }}>
                      Print cost <span style={{ color: t.faint }}>/ unit · {front}F + {back}B</span>
                    </td>
                    <td style={{ padding: '6px 12px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
                      <EditCell value={printCost.toFixed(2)} prefix="$" type="number" minWidth={60} onChange={(v) => setPrintCost(num(v))} />
                    </td>
                    <td style={{ padding: '10px 18px', borderBottom: `1px solid ${t.divider3}`, color: t.secondary }}>
                      Design fee <span style={{ color: t.faint }}>one-time</span>
                    </td>
                    <td style={{ padding: '6px 18px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
                      <EditCell value={designFee.toFixed(2)} prefix="$" type="number" minWidth={60} onChange={(v) => setDesignFee(num(v))} />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 18px', color: t.heading, fontWeight: 700 }}>Cost per unit</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: t.heading, background: t.rowBg }}>
                      ${perUnitCost.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 18px', color: t.secondary }}>
                      Tax · Shipping <span style={{ color: t.faint }}>one-time</span>
                    </td>
                    <td style={{ padding: '6px 18px', textAlign: 'right' }}>
                      <EditCell value={tax} prefix="$" type="number" minWidth={44} onChange={(v) => setTax(num(v))} />{' '}
                      <EditCell value={shipping} prefix="$" type="number" minWidth={44} onChange={(v) => setShipping(num(v))} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Margin bar */}
            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderLeft: `3px solid ${accent}`, borderRadius: 6, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 22 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.muted2 }}>RETAIL PRICE</div>
                <div style={{ marginTop: 3 }}>
                  <span style={{ display: 'inline-block', background: t.editBg, border: `1px solid ${t.editBorder}`, borderRadius: 3, padding: '3px 6px', fontWeight: 700, fontSize: 15 }}>
                    $<EditCell value={retail} type="number" minWidth={28} onChange={(v) => setRetail(num(v))} />
                  </span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.muted2 }}>ALL-IN COST / UNIT</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: t.heading, marginTop: 4 }}>${allInPerUnit.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.muted2 }}>NET / UNIT</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: t.heading, marginTop: 4 }}>${net.toFixed(2)}</div>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'inline-block', borderRadius: 999, padding: '5px 14px', fontWeight: 700, fontSize: 14, background: marginBg, color: marginColor }}>
                  {pct.toFixed(1)}% margin
                </span>
                <div style={{ fontSize: 11, color: marginColor, marginTop: 4, fontWeight: 600 }}>{marginNote}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: t.muted2 }}>
              Floor-price check: retail is anchored to headliner pricing so artists can't undercut festival merch — set floors in <a href="#">Pricing</a>.
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  )
}
