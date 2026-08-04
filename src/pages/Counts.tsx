import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { Btn, EditCell, EditLegend, MetricTile, PageHead } from '../components/ui'
import { Drawer, Modal } from '../components/overlays'
import { ItemBuilderForm } from '../components/ItemBuilderForm'
import { SignOffDrawer } from '../components/SignOff'
import { tokens as t, money } from '../lib/tokens'
import { useCounts, type Item, type Sku } from '../lib/counts'
import { parties, partyById, type PartyKind } from '../lib/parties'
import { useSignOff } from '../lib/signoff'

const th: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, color: t.muted, borderBottom: '1px solid #eeeeee' }
const varColor = (v: number) => (v === 0 ? t.greenText2 : t.red)
const varLabel = (v: number) => (v === 0 ? '0' : (v > 0 ? '+' : '−') + Math.abs(v))

/** Left rail — segmented Artists / Vendors switch with a matching add button per view. */
function PartyRail({
  kind,
  setKind,
  activeId,
  setActiveId,
}: {
  kind: PartyKind
  setKind: (k: PartyKind) => void
  activeId: string
  setActiveId: (id: string) => void
}) {
  const list = parties.filter((p) => p.kind === kind)
  return (
    <div style={{ width: 186, flex: 'none', background: '#fcfcfc', borderRight: `1px solid ${t.cardBorder}`, padding: '16px 10px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.muted2, padding: '0 8px 8px' }}>SAT MAY 16</div>
      <div style={{ display: 'flex', gap: 4, padding: '0 2px 10px' }}>
        {(['artist', 'vendor'] as const).map((k) => {
          const on = kind === k
          return (
            <button
              key={k}
              onClick={() => {
                setKind(k)
                const first = parties.find((p) => p.kind === k)
                if (first) setActiveId(first.id)
              }}
              style={{
                flex: 1,
                fontFamily: 'inherit',
                textAlign: 'center',
                fontSize: 11,
                fontWeight: on ? 700 : 600,
                color: on ? t.red : t.secondary2,
                border: `1.5px solid ${on ? t.red : t.inputBorder}`,
                borderRadius: 999,
                padding: '4px 0',
                background: on ? t.redTintBg : '#fff',
                cursor: 'pointer',
              }}
            >
              {k === 'artist' ? 'Artists' : 'Vendors'}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {list.map((p) => {
          const on = p.id === activeId
          return (
            <div
              key={p.id}
              onClick={() => setActiveId(p.id)}
              style={{
                background: on ? '#fff' : undefined,
                border: on ? `1px solid ${t.red}` : '1px solid transparent',
                borderRadius: 6,
                padding: '8px 10px',
                fontSize: 12,
                lineHeight: 1.35,
                cursor: 'pointer',
                color: on ? undefined : '#444444',
              }}
            >
              <b>{p.name}</b>
              <br />
              <span style={{ fontSize: 10.5, color: t.muted2 }}>{p.category}</span>
              <br />
              <span style={{ fontSize: 10.5, color: t.muted2 }}>{p.skus} SKUs</span>
            </div>
          )
        })}
        <div style={{ border: `1.5px dashed ${t.faint2}`, borderRadius: 6, padding: '8px 10px', fontSize: 12, color: t.muted, textAlign: 'center', marginTop: 4, cursor: 'pointer' }}>
          + Add {kind === 'artist' ? 'Artist' : 'Vendor'}
        </div>
      </div>
    </div>
  )
}

export default function Counts() {
  const nav = useNavigate()
  const { items, skus, calc, setSku, addReup, skusForItem, reupsForItem, reups, totals, flagged, locked, setLocked } = useCounts()
  const signoff = useSignOff()

  const [kind, setKind] = useState<PartyKind>('artist')
  const [activeId, setActiveId] = useState('black-coyote')
  const party = partyById(activeId)

  const [open, setOpen] = useState<Record<string, boolean>>({ tee: true, hoodie: true })
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<Item | null>(null)
  const [reupFor, setReupFor] = useState<Item | null>(null)
  const [signOffOpen, setSignOffOpen] = useState<null | 'initial' | 'settlement'>(null)
  const [showReconcile, setShowReconcile] = useState(false)
  const [finalized, setFinalized] = useState(false)
  const [carryFwd, setCarryFwd] = useState(false)
  const [showMargin, setShowMargin] = useState(false)

  const num = (v: string) => (v === '' || isNaN(Number(v)) ? 0 : Number(v))
  const ro = locked || finalized

  // Only Black Coyote has seeded SKU data in this prototype; other parties show an empty state.
  const hasData = activeId === 'black-coyote'

  const renderSkuRow = (s: Sku, item: Item) => {
    const c = calc(s)
    const margin = item.unitCost ? ((s.price - item.unitCost) / s.price) * 100 : null
    return (
      <tr key={s.id}>
        <td style={{ padding: '7px 14px', borderBottom: `1px solid ${t.divider3}` }} />
        <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}` }}>
          <span style={{ display: 'inline-block', minWidth: 26, textAlign: 'center', background: '#f1f1f1', borderRadius: 3, padding: '2px 6px', fontWeight: 600, color: t.secondary }}>{s.variant}</span>
        </td>
        <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#444444' }}>{money(s.price, 2)}</td>
        <td style={{ padding: '4px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
          <EditCell value={s.initial} type="number" minWidth={34} disabled={ro} onChange={(v) => setSku(s.id, { initial: num(v) })} />
        </td>
        <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: c.added ? t.greenText2 : t.faint, fontWeight: c.added ? 700 : 400 }}>{c.added ? `+${c.added}` : '—'}</td>
        <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', fontWeight: 600, color: t.heading }}>{c.totalIn}</td>
        <td style={{ padding: '4px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
          <EditCell value={s.comp} type="number" disabled={ro} onChange={(v) => setSku(s.id, { comp: num(v) })} />
        </td>
        <td style={{ padding: '4px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
          <EditCell value={s.shrink} type="number" disabled={ro} onChange={(v) => setSku(s.id, { shrink: num(v) })} />
        </td>
        <td style={{ padding: '4px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }}>
          <EditCell value={s.ending} type="number" minWidth={34} disabled={ro} onChange={(v) => setSku(s.id, { ending: num(v) })} />
        </td>
        <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#444444' }}>{s.posSold}</td>
        {/* Variance sits immediately right of Sold so per-SKU discrepancies are visible at a glance */}
        <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', fontWeight: 700, color: varColor(c.variance) }}>{varLabel(c.variance)}</td>
        {showMargin && (
          <td style={{ padding: '7px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: t.muted }}>{margin === null ? '—' : margin.toFixed(0) + '%'}</td>
        )}
        <td style={{ padding: '7px 14px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#444444' }}>{money(c.physicalGross, 2)}</td>
      </tr>
    )
  }

  const itemTotals = (itemId: string) => {
    const rows = skusForItem(itemId)
    return rows.reduce(
      (a, s) => {
        const c = calc(s)
        return {
          initial: a.initial + s.initial,
          added: a.added + c.added,
          totalIn: a.totalIn + c.totalIn,
          comp: a.comp + s.comp,
          shrink: a.shrink + s.shrink,
          ending: a.ending + s.ending,
          posSold: a.posSold + s.posSold,
          variance: a.variance + c.variance,
          gross: a.gross + c.physicalGross,
        }
      },
      { initial: 0, added: 0, totalIn: 0, comp: 0, shrink: 0, ending: 0, posSold: 0, variance: 0, gross: 0 },
    )
  }

  const colCount = showMargin ? 13 : 12

  return (
    <AdminLayout active="Counts (In/Out)" rail={<PartyRail kind={kind} setKind={setKind} activeId={activeId} setActiveId={setActiveId} />}>
      <main style={{ flex: 1, minWidth: 0, padding: '20px 24px 32px' }}>
        <PageHead
          title={`Furnace Fest 2026 — ${kind === 'artist' ? 'Artist' : 'Vendor'} Counts`}
          subtitle={
            <>
              {party.name} · {party.category} · {party.location}
            </>
          }
          actions={
            <>
              <Btn>↥ Export</Btn>
              <Btn onClick={() => setLocked(!locked)} style={locked ? { borderColor: t.red, color: t.red } : undefined}>
                {locked ? '🔒 Count Locked' : 'Lock Count'}
              </Btn>
              <Btn variant="primary" onClick={() => setAddItemOpen(true)}>+ Add Item</Btn>
            </>
          }
        />

        {finalized && (
          <div style={{ background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 6, padding: '10px 16px', fontSize: 12.5, color: t.greenText, marginBottom: 14 }}>
            <b>Show finalized.</b> Counts are locked and {party.name} is queued for settlement —{' '}
            <a onClick={() => nav('/settlement')} style={{ cursor: 'pointer' }}>go to Settlement →</a>
            {carryFwd && <> · ending count carried forward as next show's initial count.</>}
          </div>
        )}

        {!hasData ? (
          <div style={{ background: t.cardBg, border: `1px dashed ${t.faint2}`, borderRadius: 8, padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.heading }}>No items counted in yet for {party.name}</div>
            <div style={{ fontSize: 12.5, color: t.secondary2, marginTop: 6 }}>
              {party.category} · {party.skus} SKUs expected
            </div>
            <div style={{ marginTop: 14 }}>
              <Btn variant="primary" onClick={() => setAddItemOpen(true)}>+ Add Item</Btn>
            </div>
          </div>
        ) : (
          <>
            {/* KPIs — 30,000-ft summary */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <MetricTile label="TOTAL SKUS" value={skus.length} icon="◇" iconBg={t.redTintBg} iconColor={t.red} />
              <MetricTile label="UNITS COUNTED IN" value={totals.totalIn.toLocaleString()} suffix="incl. re-ups" icon="✓" iconBg="#f2f7f2" iconColor={t.greenText2} />
              <MetricTile label="VARIANCES" value={flagged.length} suffix={`SKUs · ${money(Math.abs(totals.varianceValue), 2)}`} icon="⚠" iconBg="#fdf6ec" iconColor="#c98a1e" />
              <MetricTile label="GROSS SALES" value={money(totals.physicalGross)} suffix="by count" icon="$" iconBg={t.redTintBg} iconColor={t.red} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 11.5, color: t.muted2 }}>
                Click an item name to open its count detail ·{' '}
                <label style={{ cursor: 'pointer', color: t.secondary }}>
                  <input type="checkbox" checked={showMargin} onChange={(e) => setShowMargin(e.target.checked)} style={{ verticalAlign: -2 }} /> show margin
                </label>
              </div>
              <EditLegend text="editable · Comp = giveaways · Shrink = damage / lost" />
            </div>

            {/* Counts grid */}
            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 1080 }}>
                <thead>
                  <tr>
                    <th style={{ ...th, textAlign: 'left', padding: '10px 14px', letterSpacing: '.04em' }}>ITEM</th>
                    <th style={{ ...th, textAlign: 'left', padding: '10px 8px' }}>VARIANT</th>
                    {['PRICE', 'INITIAL COUNT', 'RE-UPS', 'TOTAL IN', 'COMP', 'SHRINK', 'ENDING COUNT', 'SOLD', 'VARIANCE'].map((h) => (
                      <th key={h} style={{ ...th, textAlign: 'right', padding: '10px 8px' }}>{h}</th>
                    ))}
                    {showMargin && <th style={{ ...th, textAlign: 'right', padding: '10px 8px' }}>MARGIN</th>}
                    <th style={{ ...th, textAlign: 'right', padding: '10px 14px' }}>GROSS SALES ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const it = itemTotals(item.id)
                    const isOpen = open[item.id] ?? false
                    return (
                      <>
                        <tr key={item.id} style={{ background: t.rowBg }}>
                          <td colSpan={colCount} style={{ padding: '9px 14px', borderBottom: `1px solid ${t.divider}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span onClick={() => setOpen((o) => ({ ...o, [item.id]: !isOpen }))} style={{ color: '#666666', fontSize: 10, cursor: 'pointer' }}>{isOpen ? '▼' : '▶'}</span>
                              <div style={{ width: 30, height: 30, background: '#efefef', border: '1px solid #e2e2e2', borderRadius: 4 }} />
                              {/* Item name opens the detail drawer */}
                              <b
                                onClick={() => setDetailItem(item)}
                                style={{ fontSize: 12.5, color: t.red, cursor: 'pointer', textDecoration: 'underline', textDecorationColor: t.redTintBorder, textUnderlineOffset: 3 }}
                              >
                                {item.name}
                              </b>
                              <span style={{ fontSize: 11, color: t.muted2 }}>{item.category} · {skusForItem(item.id).length} variants</span>
                              <div style={{ flex: 1 }} />
                              <span style={{ fontSize: 11, color: it.variance === 0 ? t.greenText2 : t.red, fontWeight: 700 }}>
                                {it.variance === 0 ? '✓ reconciles' : `${varLabel(it.variance)} variance`}
                              </span>
                              {!ro && (
                                <button onClick={() => setReupFor(item)} style={{ fontFamily: 'inherit', fontSize: 11, fontWeight: 700, color: t.red, background: t.redTintBg, border: `1px solid ${t.redTintBorder}`, borderRadius: 4, padding: '3px 10px', cursor: 'pointer' }}>
                                  + Add re-up
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isOpen && skusForItem(item.id).map((s) => renderSkuRow(s, item))}
                        {isOpen && (
                          <tr style={{ background: t.rowBg2 }}>
                            <td style={{ padding: '8px 14px', borderBottom: '1px solid #eeeeee' }} />
                            <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', fontWeight: 700, color: t.heading }}>Total</td>
                            <td style={{ borderBottom: '1px solid #eeeeee' }} />
                            <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{it.initial}</td>
                            <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700, color: it.added ? t.greenText2 : undefined }}>{it.added ? `+${it.added}` : '—'}</td>
                            <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{it.totalIn}</td>
                            <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{it.comp}</td>
                            <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700, color: it.shrink ? t.red : undefined }}>{it.shrink}</td>
                            <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{it.ending}</td>
                            <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{it.posSold}</td>
                            <td style={{ padding: '8px 8px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700, color: varColor(it.variance) }}>{varLabel(it.variance)}</td>
                            {showMargin && <td style={{ borderBottom: '1px solid #eeeeee' }} />}
                            <td style={{ padding: '8px 14px', borderBottom: '1px solid #eeeeee', textAlign: 'right', fontWeight: 700 }}>{money(it.gross, 2)}</td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Re-up log */}
            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: `1px solid ${t.divider}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.heading }}>
                  Inventory re-up log <span style={{ fontWeight: 500, color: t.muted2, fontSize: 11.5, marginLeft: 6 }}>every restock is timestamped and rolls into the count total</span>
                </div>
                <span style={{ fontSize: 11.5, color: t.muted2 }}>{reups.length} re-ups · +{reups.reduce((a, r) => a + r.qty, 0)} units</span>
              </div>
              {reups.map((r, i) => {
                const sku = skus.find((s) => s.id === r.skuId)
                const item = items.find((it) => it.id === sku?.itemId)
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 18px', borderBottom: i < reups.length - 1 ? `1px solid ${t.divider3}` : 'none', fontSize: 12.5 }}>
                    <span style={{ color: t.muted2, width: 68, fontVariantNumeric: 'tabular-nums' }}>{r.time}</span>
                    <span style={{ fontWeight: 700, color: t.greenText2, width: 44 }}>+{r.qty}</span>
                    <span style={{ color: t.body2 }}><b>{item?.name}</b> · {sku?.variant}</span>
                    <span style={{ flex: 1, color: t.muted2 }}>{r.note}</span>
                    <span style={{ color: t.muted2, fontSize: 11.5 }}>{r.by}</span>
                  </div>
                )
              })}
            </div>

            {/* Sign-off + actions */}
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', marginTop: 16 }}>
              <div style={{ flex: 1, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '16px 18px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.heading, marginBottom: 4 }}>Sign-off</div>
                <div style={{ fontSize: 11.5, color: t.muted2, marginBottom: 12 }}>
                  Two stages. Initial sign-off is optional and never blocks selling — it just logs a timestamped confirmation.
                </div>

                {/* Initial sign-off */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: `1px solid ${t.divider3}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: t.heading }}>
                      Initial count sign-off
                      <span style={{ fontSize: 10, fontWeight: 700, color: party.requiresInitialSignOff ? t.red : t.muted2, border: `1px solid ${party.requiresInitialSignOff ? t.redTintBorder : t.divider}`, borderRadius: 3, padding: '1px 5px', marginLeft: 8 }}>
                        {party.requiresInitialSignOff ? 'REQUIRED FOR THIS PARTY' : 'OPTIONAL'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: t.muted2, marginTop: 2 }}>
                      {signoff.initial.status === 'none' && 'Not requested — selling is not blocked.'}
                      {signoff.initial.status === 'requested' && `Requested ${signoff.initial.at} · awaiting ${signoff.initial.contact?.name}`}
                      {signoff.initial.status === 'signed' && `✓ Confirmed by ${signoff.initial.contact?.name} · ${signoff.initial.at}`}
                      {signoff.initial.status === 'disputed' && `⚑ Disputed by ${signoff.initial.contact?.name}`}
                    </div>
                  </div>
                  <Btn size="sm" onClick={() => setSignOffOpen('initial')}>
                    {signoff.initial.status === 'none' ? 'Request sign-off' : 'View / resend'}
                  </Btn>
                </div>

                {/* Settlement sign-off */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: `1px solid ${t.divider3}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: t.heading }}>
                      Settlement sign-off
                      <span style={{ fontSize: 10, fontWeight: 700, color: party.requiresSettlementSignOff ? t.red : t.muted2, border: `1px solid ${party.requiresSettlementSignOff ? t.redTintBorder : t.divider}`, borderRadius: 3, padding: '1px 5px', marginLeft: 8 }}>
                        {party.requiresSettlementSignOff ? 'REQUIRED' : 'OPTIONAL'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: t.muted2, marginTop: 2 }}>
                      e-signature via the {party.kind === 'artist' ? 'artist' : 'vendor'} portal — no in-person screen signing.
                    </div>
                  </div>
                  <Btn size="sm" onClick={() => nav('/settlement')}>Go to settlement</Btn>
                </div>
              </div>

              <div style={{ width: 250, flex: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: t.secondary, cursor: 'pointer', padding: '2px 0 6px' }}>
                  <input type="checkbox" checked={carryFwd} onChange={(e) => setCarryFwd(e.target.checked)} />
                  Carry ending count → next show's initial
                </label>
                <Btn size="lg" style={{ fontWeight: 600 }}>Save Draft</Btn>
                <Btn size="lg" style={{ fontWeight: 600 }} onClick={() => nav('/reconciliation')}>Open Reconciliation</Btn>
                <Btn variant="primary" size="lg" onClick={() => (finalized ? undefined : setShowReconcile(true))}>
                  {finalized ? 'Show Finalized ✓' : 'Finalize Show'}
                </Btn>
                <div style={{ fontSize: 11, color: t.muted2, textAlign: 'center', lineHeight: 1.5 }}>
                  Finalizing opens reconciliation when variances exist, then locks counts and queues {party.name} for settlement.
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Item detail drawer — wired to the item name */}
      <Drawer
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        title={detailItem?.name ?? ''}
        subtitle={detailItem ? `${detailItem.category} · ${party.name} · count detail` : ''}
        width={620}
        footer={
          <>
            <Btn onClick={() => setDetailItem(null)}>Close</Btn>
            {detailItem && !ro && <Btn variant="primary" onClick={() => { setReupFor(detailItem); setDetailItem(null) }}>+ Add re-up</Btn>}
          </>
        }
      >
        {detailItem && <ItemDetail item={detailItem} />}
      </Drawer>

      {/* Add item */}
      <Drawer
        open={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        title="Add item"
        subtitle={`${party.name} · Furnace Fest 2026`}
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

      {/* Re-up */}
      <ReupModal item={reupFor} onClose={() => setReupFor(null)} />

      {/* Sign-off drawer */}
      <SignOffDrawer stage={signOffOpen} onClose={() => setSignOffOpen(null)} party={party} />

      {/* Finalize → reconciliation prompt */}
      <Modal
        open={showReconcile}
        onClose={() => setShowReconcile(false)}
        title="Reconcile before finalizing"
        width={620}
        footer={
          <>
            <Btn onClick={() => { setShowReconcile(false); nav('/reconciliation') }}>Open Reconciliation →</Btn>
            <Btn variant="primary" onClick={() => { setFinalized(true); setLocked(true); setShowReconcile(false) }}>Confirm &amp; finalize</Btn>
          </>
        }
      >
        {flagged.length === 0 ? (
          <div style={{ fontSize: 13, color: t.greenText, background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 6, padding: '12px 14px' }}>
            ✓ Every SKU reconciles — POS matches the physical count. Finalizing will lock this show.
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12.5, color: t.secondary, marginBottom: 12 }}>
              <b>{flagged.length} SKU{flagged.length === 1 ? '' : 's'}</b> disagree with the POS —{' '}
              <b style={{ color: t.red }}>{money(Math.abs(totals.varianceValue), 2)}</b> net.
              Physical counts are the source of truth for settlement; resolve each on the reconciliation page.
            </div>
            <div style={{ border: `1px solid ${t.cardBorder}`, borderRadius: 6, overflow: 'hidden' }}>
              {flagged.map((s, i) => {
                const c = calc(s)
                const item = items.find((it) => it.id === s.itemId)
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: i < flagged.length - 1 ? `1px solid ${t.divider3}` : 'none', fontSize: 12.5 }}>
                    <div style={{ flex: 1 }}>
                      <b>{item?.name}</b> · {s.variant}
                      <div style={{ fontSize: 11, color: t.muted2, marginTop: 1 }}>
                        counted {c.physicalSold} sold · POS {s.posSold}
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: t.red }}>{varLabel(c.variance)} · {money(Math.abs(c.varianceValue), 2)}</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </Modal>
    </AdminLayout>
  )
}

/** Per-item detail shown in the side drawer: variant-level counts, its re-up history, and totals. */
function ItemDetail({ item }: { item: Item }) {
  const { skusForItem, reupsForItem, calc } = useCounts()
  const rows = skusForItem(item.id)
  const reups = reupsForItem(item.id)
  const tot = rows.reduce(
    (a, s) => {
      const c = calc(s)
      return { totalIn: a.totalIn + c.totalIn, ending: a.ending + s.ending, sold: a.sold + c.physicalSold, gross: a.gross + c.physicalGross, variance: a.variance + c.variance, weight: a.weight + s.ending * s.weightLb }
    },
    { totalIn: 0, ending: 0, sold: 0, gross: 0, variance: 0, weight: 0 },
  )
  const cell: React.CSSProperties = { padding: '7px 8px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <MetricTile label="TOTAL IN" value={tot.totalIn} />
        <MetricTile label="SOLD" value={tot.sold} />
        <MetricTile label="ENDING" value={tot.ending} />
        <MetricTile label="GROSS" value={money(tot.gross)} accent />
      </div>

      <div style={{ background: '#fff', border: `1px solid ${t.cardBorder}`, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ padding: '11px 14px', borderBottom: `1px solid ${t.divider}`, fontSize: 12.5, fontWeight: 700, color: t.heading }}>Variant detail</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ fontSize: 10, fontWeight: 700, color: t.muted, borderBottom: '1px solid #eee', textAlign: 'left', padding: '7px 14px' }}>VARIANT</th>
              {['INITIAL', 'RE-UPS', 'COMP', 'SHRINK', 'ENDING', 'SOLD', 'VAR'].map((h) => (
                <th key={h} style={{ fontSize: 10, fontWeight: 700, color: t.muted, borderBottom: '1px solid #eee', textAlign: 'right', padding: '7px 8px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const c = calc(s)
              return (
                <tr key={s.id}>
                  <td style={{ padding: '7px 14px', borderBottom: `1px solid ${t.divider3}`, fontWeight: 600 }}>{s.variant}</td>
                  <td style={cell}>{s.initial}</td>
                  <td style={{ ...cell, color: c.added ? t.greenText2 : t.faint }}>{c.added ? `+${c.added}` : '—'}</td>
                  <td style={cell}>{s.comp}</td>
                  <td style={{ ...cell, color: s.shrink ? t.red : undefined }}>{s.shrink}</td>
                  <td style={cell}>{s.ending}</td>
                  <td style={cell}>{c.physicalSold}</td>
                  <td style={{ ...cell, fontWeight: 700, color: varColor(c.variance) }}>{varLabel(c.variance)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${t.cardBorder}`, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ padding: '11px 14px', borderBottom: `1px solid ${t.divider}`, fontSize: 12.5, fontWeight: 700, color: t.heading }}>
          Re-up history <span style={{ fontWeight: 500, color: t.muted2, fontSize: 11 }}>· {reups.length}</span>
        </div>
        {reups.length === 0 ? (
          <div style={{ padding: '12px 14px', fontSize: 12, color: t.muted2 }}>No re-ups logged for this item.</div>
        ) : (
          reups.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', gap: 10, padding: '9px 14px', borderBottom: i < reups.length - 1 ? `1px solid ${t.divider3}` : 'none', fontSize: 12 }}>
              <span style={{ color: t.muted2, width: 62 }}>{r.time}</span>
              <span style={{ fontWeight: 700, color: t.greenText2, width: 36 }}>+{r.qty}</span>
              <span style={{ width: 40, color: t.secondary }}>{r.skuId.split('-')[1]}</span>
              <span style={{ flex: 1, color: t.muted2 }}>{r.note}</span>
            </div>
          ))
        )}
      </div>

      <div style={{ fontSize: 11.5, color: t.muted2, lineHeight: 1.5 }}>
        Estimated return shipment weight for unsold stock: <b style={{ color: t.body2 }}>{tot.weight.toFixed(1)} lb</b> ({tot.ending} units) — feeds the label generator.
      </div>
    </div>
  )
}

function ReupModal({ item, onClose }: { item: Item | null; onClose: () => void }) {
  const { skusForItem, addReup } = useCounts()
  const [variant, setVariant] = useState('')
  const [qty, setQty] = useState('12')
  const [note, setNote] = useState('')
  if (!item) return null
  const rows = skusForItem(item.id)
  const v = variant || rows[0]?.id || ''
  return (
    <Modal
      open
      onClose={onClose}
      title={`Add re-up · ${item.name}`}
      width={440}
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={() => { addReup(v, Number(qty) || 0, note); onClose() }}>Log re-up (+{Number(qty) || 0})</Btn>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 12, color: t.secondary }}>Timestamped and added to this variant's count-in total.</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: t.muted, marginBottom: 5 }}>VARIANT</div>
            <select value={v} onChange={(e) => setVariant(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${t.inputBorder}`, borderRadius: 4, fontSize: 13, fontFamily: 'inherit' }}>
              {rows.map((s) => <option key={s.id} value={s.id}>{s.variant}</option>)}
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
