import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { Btn, EditCell, PageHead } from '../components/ui'
import { SignOffDrawer } from '../components/SignOff'
import { tokens as t, money } from '../lib/tokens'
import { useCounts, type Sku } from '../lib/counts'
import { partyById } from '../lib/parties'
import { kindConfig } from '../lib/catalog'

const money2 = (n: number) => (n < 0 ? '−' : '') + '$' + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const th: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: t.muted, borderBottom: '1px solid #eeeeee', letterSpacing: '.03em' }
const varLabel = (v: number) => (v === 0 ? '0' : (v > 0 ? '+' : '−') + Math.abs(v))
const varColor = (v: number) => (v === 0 ? t.greenText2 : t.red)

/**
 * How a SKU-level variance gets resolved. Physical counts remain the settlement basis;
 * the lever records *why* the POS disagreed and whether money moves.
 */
type Resolution = 'pos-error' | 'shrink' | 'charge' | 'waive'
const levers: { id: Resolution; label: string; hint: string; movesMoney: boolean }[] = [
  { id: 'pos-error', label: 'POS mis-ring', hint: 'Correct the POS count — wrong size rung up', movesMoney: false },
  { id: 'shrink', label: 'Move to shrink', hint: 'Damaged / lost — reclassify off the sold line', movesMoney: false },
  { id: 'charge', label: 'Charge vendor', hint: 'Vendor eats the missing stock at retail', movesMoney: true },
  { id: 'waive', label: 'Festival absorbs', hint: 'No adjustment to the payout', movesMoney: false },
]

export default function Reconciliation() {
  const nav = useNavigate()
  const { items, skus, calc, setSku, totals, flagged, partyId } = useCounts()
  const party = partyById(partyId)
  const cfgK = kindConfig[party.kind]

  const [view, setView] = useState<'sku' | 'overall'>('sku')
  const [onlyFlagged, setOnlyFlagged] = useState(true)
  const [res, setRes] = useState<Record<string, Resolution | undefined>>({})
  const [routeOpen, setRouteOpen] = useState(false)

  const num = (v: string) => (v === '' || isNaN(Number(v)) ? 0 : Number(v))

  const visible = onlyFlagged ? skus.filter((s) => calc(s).variance !== 0) : skus

  // Charges are the only lever that moves money; everything else is bookkeeping.
  const { charges, resolvedCount } = useMemo(() => {
    let charges = 0
    let resolvedCount = 0
    for (const s of skus) {
      const r = res[s.id]
      if (!r) continue
      if (calc(s).variance !== 0) resolvedCount++
      if (r === 'charge') charges += Math.abs(calc(s).varianceValue)
    }
    return { charges, resolvedCount }
  }, [res, skus])

  const allResolved = flagged.length > 0 && resolvedCount >= flagged.length
  // Settlement basis: physical counts, plus anything charged back to the vendor.
  const settlementGross = totals.physicalGross + charges

  /** Apply the lever's mechanical effect so the numbers actually move. */
  const applyLever = (s: Sku, lever: Resolution) => {
    setRes((r) => ({ ...r, [s.id]: lever }))
    const c = calc(s)
    if (lever === 'pos-error') {
      // Trust the shelf: snap the POS number to the physical count.
      setSku(s.id, { posSold: c.physicalSold })
    } else if (lever === 'shrink' && c.variance < 0) {
      // Units missing from the shelf that the POS never sold → reclassify as shrink.
      setSku(s.id, { shrink: s.shrink + Math.abs(c.variance), ending: s.ending })
    }
  }

  const itemName = (id: string) => items.find((i) => i.id === id)?.name ?? id

  return (
    <AdminLayout active="Reconciliation">
      <main style={{ padding: '20px 24px 32px' }}>
        <PageHead
          title={`Reconciliation — ${party.name}`}
          subtitle={`Furnace Fest 2026 · ${party.category} · physical counts are the source of truth`}
          actions={
            <>
              <Btn onClick={() => setRouteOpen(true)}>Route sign-off →</Btn>
              <Btn variant="primary" onClick={() => nav('/settlement')}>Continue to Settlement →</Btn>
            </>
          }
        />

        {/* View switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', border: `1.5px solid ${t.inputBorder}`, borderRadius: 5, overflow: 'hidden' }}>
            {(['sku', 'overall'] as const).map((v, i) => {
              const on = view === v
              return (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{ fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, padding: '5px 16px', border: 'none', borderLeft: i ? `1.5px solid ${t.inputBorder}` : undefined, cursor: 'pointer', color: on ? t.red : t.secondary2, background: on ? t.redTintBg : '#fff' }}
                >
                  {v === 'sku' ? 'SKU level' : 'Overall'}
                </button>
              )
            })}
          </div>
          {view === 'sku' && (
            <label style={{ fontSize: 12, color: t.secondary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={onlyFlagged} onChange={(e) => setOnlyFlagged(e.target.checked)} />
              only SKUs with a variance ({flagged.length})
            </label>
          )}
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 11.5, color: t.muted2 }}>
            SKU-level errors can cancel out at the top line — check both views.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {view === 'sku' ? (
              <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 800 }}>
                  <thead>
                    <tr>
                      <th style={{ ...th, textAlign: 'left', padding: '10px 14px' }}>ITEM / SKU</th>
                      <th style={{ ...th, textAlign: 'right', padding: '10px 8px' }}>PRICE</th>
                      <th style={{ ...th, textAlign: 'right', padding: '10px 8px' }}>INITIAL COUNT</th>
                      <th style={{ ...th, textAlign: 'right', padding: '10px 8px' }}>RE-UPS</th>
                      <th style={{ ...th, textAlign: 'right', padding: '10px 8px' }}>ENDING COUNT</th>
                      <th style={{ ...th, textAlign: 'right', padding: '10px 8px' }}>COUNTED SOLD</th>
                      <th style={{ ...th, textAlign: 'right', padding: '10px 8px', color: t.red }}>POS SOLD</th>
                      <th style={{ ...th, textAlign: 'right', padding: '10px 8px' }}>VARIANCE</th>
                      <th style={{ ...th, textAlign: 'right', padding: '10px 14px' }}>$ VARIANCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((s) => {
                      const c = calc(s)
                      const chosen = res[s.id]
                      const hasLevers = c.variance !== 0 || !!chosen
                      const mainRow = (
                        <tr key={s.id} style={{ background: chosen ? '#fcfdfc' : undefined }}>
                          <td style={{ padding: '9px 14px', borderBottom: `1px solid ${t.divider3}` }}>
                            <b style={{ color: t.heading }}>{itemName(s.itemId)}</b>
                            <span style={{ color: t.muted2 }}> · {s.variant}</span>
                          </td>
                          <td style={{ padding: '9px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: t.secondary }}>{money(s.price, 2)}</td>
                          <td style={{ padding: '9px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: t.secondary }}>{s.initial}</td>
                          <td style={{ padding: '9px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: c.added ? t.greenText2 : t.faint }}>{c.added ? `+${c.added}` : '—'}</td>
                          <td style={{ padding: '9px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: t.secondary }}>{s.ending}</td>
                          <td style={{ padding: '9px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', fontWeight: 700, color: t.heading }}>{c.physicalSold}</td>
                          {/* POS is correctable right here — it recalculates gross downstream */}
                          <td style={{ padding: '5px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
                            <EditCell value={s.posSold} type="number" minWidth={32} onChange={(v) => setSku(s.id, { posSold: num(v) })} />
                          </td>
                          <td style={{ padding: '9px 8px', borderBottom: hasLevers ? 'none' : `1px solid ${t.divider3}`, textAlign: 'right', fontWeight: 700, color: varColor(c.variance) }}>{varLabel(c.variance)}</td>
                          <td style={{ padding: '9px 14px', borderBottom: hasLevers ? 'none' : `1px solid ${t.divider3}`, textAlign: 'right', fontWeight: 600, color: varColor(c.variance) }}>
                            {c.variance === 0 ? <span style={{ color: t.greenText2, fontSize: 11 }}>✓ reconciles</span> : money2(c.varianceValue)}
                          </td>
                        </tr>
                      )
                      // Resolution levers get their own full-width row so nothing scrolls out of view.
                      const leverRow = hasLevers ? (
                        <tr key={s.id + '-res'} style={{ background: chosen ? '#fcfdfc' : undefined }}>
                          <td colSpan={9} style={{ padding: '0 14px 10px', borderBottom: `1px solid ${t.divider3}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 10.5, fontWeight: 700, color: t.muted, letterSpacing: '.03em' }}>RESOLVE:</span>
                              {levers.map((l) => {
                                const on = chosen === l.id
                                return (
                                  <button
                                    key={l.id}
                                    title={l.hint}
                                    onClick={() => (on ? setRes((r) => ({ ...r, [s.id]: undefined })) : applyLever(s, l.id))}
                                    style={{
                                      fontFamily: 'inherit', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, cursor: 'pointer',
                                      border: `1.5px solid ${on ? (l.movesMoney ? t.red : t.greenText2) : t.inputBorder}`,
                                      color: on ? (l.movesMoney ? t.red : t.greenText) : t.secondary2,
                                      background: on ? (l.movesMoney ? t.redTintBg : t.greenBg) : '#fff',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {on ? '● ' : ''}{l.label}
                                    {l.movesMoney && <span style={{ fontWeight: 600 }}> ({money2(Math.abs(c.varianceValue))})</span>}
                                  </button>
                                )
                              })}
                              <span style={{ fontSize: 11, color: t.muted2, marginLeft: 4 }}>
                                {chosen ? levers.find((l) => l.id === chosen)?.hint : 'pick one'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : null
                      return [mainRow, leverRow]
                    })}
                    {visible.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ padding: '26px 14px', textAlign: 'center', fontSize: 13, color: t.greenText }}>
                          ✓ Every SKU reconciles — the POS matches the physical count.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Overall view — the top-line rollup, where offsetting SKU errors wash out */
              <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.divider}`, fontSize: 14, fontWeight: 700, color: t.heading }}>
                  Overall variance
                  <span style={{ fontWeight: 500, color: t.muted2, fontSize: 11.5, marginLeft: 8 }}>whole-show rollup</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <tbody>
                    {[
                      ['Initial count', `${totals.initial} units`, null],
                      ['Re-ups logged', `+${totals.added} units`, null],
                      ['Total counted in', `${totals.totalIn} units`, null],
                      ['Comps', `${totals.comp} units`, null],
                      [cfgK.shrinkLabel === 'WASTE' ? 'Waste (spoilage / breakage)' : 'Shrink (damage / lost)', `${totals.shrink} units`, null],
                      ['Ending count', `${totals.ending} units`, null],
                    ].map(([l, v]) => (
                      <tr key={l as string}>
                        <td style={{ padding: '10px 18px', borderBottom: `1px solid ${t.divider3}`, color: t.secondary }}>{l}</td>
                        <td style={{ padding: '10px 18px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', fontWeight: 600 }}>{v}</td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ padding: '11px 18px', borderBottom: `1px solid ${t.divider3}`, color: t.heading, fontWeight: 700 }}>Sold by physical count</td>
                      <td style={{ padding: '11px 18px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', fontWeight: 700 }}>{totals.physicalSold} units · {money(totals.physicalGross, 2)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '11px 18px', borderBottom: `1px solid ${t.divider3}`, color: t.heading, fontWeight: 700 }}>Sold per POS</td>
                      <td style={{ padding: '11px 18px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', fontWeight: 700 }}>{totals.posSold} units · {money(totals.posGross, 2)}</td>
                    </tr>
                    <tr style={{ background: t.rowBg }}>
                      <td style={{ padding: '13px 18px', color: t.heading, fontWeight: 700 }}>Net variance</td>
                      <td style={{ padding: '13px 18px', textAlign: 'right', fontWeight: 800, fontSize: 14, color: varColor(totals.varianceUnits) }}>
                        {varLabel(totals.varianceUnits)} units · {money2(totals.varianceValue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ padding: '12px 18px', background: '#fdf6ec', borderTop: `1px solid ${t.divider}`, fontSize: 12, color: '#8a5d12', lineHeight: 1.55 }}>
                  <b>Why both views matter.</b> The net figure above is only {money2(totals.varianceValue)}, but{' '}
                  <b>{money(totals.grossVarianceValue, 2)}</b> of SKU-level error is hiding inside it — an XL rung up as an M nets to zero
                  here while both SKUs are wrong. {flagged.length} SKU{flagged.length === 1 ? '' : 's'} still need a decision.
                </div>
              </div>
            )}
          </div>

          {/* Dollar summary rail — money follows the counts */}
          <div style={{ width: 290, flex: 'none', display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 20 }}>
            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderLeft: `3px solid ${t.red}`, borderRadius: 6, padding: '16px 18px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.muted2 }}>GROSS SALES · BY COUNT</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: t.heading, margin: '4px 0 10px' }}>{money(settlementGross, 2)}</div>
              <Row label="Counted in" v={`${totals.totalIn} units`} />
              <Row label="Counted out (ending)" v={`${totals.ending} units`} />
              <Row label="Sold by count" v={`${totals.physicalSold} units`} strong />
              <Row label="Gross by count" v={money(totals.physicalGross, 2)} strong />
              <Row label="Gross per POS" v={money(totals.posGross, 2)} muted />
              <div style={{ borderTop: `1px solid ${t.divider3}`, marginTop: 6, paddingTop: 6 }}>
                <Row label="Overall $ variance" v={money2(totals.varianceValue)} color={varColor(totals.varianceUnits)} strong />
                <Row label="SKU-level $ error" v={money(totals.grossVarianceValue, 2)} color={totals.grossVarianceValue ? '#8a5d12' : t.greenText2} />
                <Row label="Charged to vendor" v={charges ? '+' + money(charges, 2) : '$0.00'} color={charges ? t.red : t.muted2} />
              </div>
            </div>

            <div style={{ background: allResolved || flagged.length === 0 ? t.greenBg : '#fdf6ec', border: `1px solid ${allResolved || flagged.length === 0 ? t.greenBorder : '#f0dcae'}`, borderRadius: 6, padding: '12px 14px', fontSize: 12, color: allResolved || flagged.length === 0 ? t.greenText : '#8a5d12', lineHeight: 1.5 }}>
              {flagged.length === 0 ? (
                <><b>✓ Fully reconciled.</b> Physical counts and the POS agree. Settlement will use {money(settlementGross, 2)}.</>
              ) : allResolved ? (
                <><b>✓ All variances resolved.</b> Settlement basis is {money(settlementGross, 2)} from physical counts.</>
              ) : (
                <><b>{flagged.length - resolvedCount} SKU{flagged.length - resolvedCount === 1 ? '' : 's'} unresolved.</b> Pick a resolution on each flagged line — settlement uses the physical count as the basis.</>
              )}
            </div>

            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '12px 14px', fontSize: 12, lineHeight: 1.5 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.muted2, marginBottom: 6 }}>SIGN-OFF ROUTING</div>
              <div style={{ color: t.secondary }}>
                Default: <b style={{ color: t.heading }}>{party.contact.name}</b> · {party.contact.role}
              </div>
              <div style={{ marginTop: 8 }}>
                <Btn size="sm" onClick={() => setRouteOpen(true)}>Route to someone else →</Btn>
              </div>
            </div>

            <Btn variant="primary" size="lg" onClick={() => nav('/settlement')}>Continue to Settlement →</Btn>
            <div style={{ fontSize: 11, color: t.muted2, textAlign: 'center', lineHeight: 1.5 }}>
              Correcting a POS number here recalculates gross sales and flows through settlement and payout.
            </div>
          </div>
        </div>
      </main>

      <SignOffDrawer stage={routeOpen ? 'settlement' : null} onClose={() => setRouteOpen(false)} party={party} />
    </AdminLayout>
  )
}

function Row({ label, v, strong, muted, color }: { label: string; v: string; strong?: boolean; muted?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12.5, padding: '5px 0' }}>
      <span style={{ color: muted ? t.muted2 : '#666666' }}>{label}</span>
      <b style={{ color: color ?? (muted ? t.muted2 : t.heading), fontWeight: strong ? 700 : 600 }}>{v}</b>
    </div>
  )
}
