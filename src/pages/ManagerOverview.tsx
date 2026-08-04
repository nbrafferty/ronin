import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { Btn, MetricTile, PageHead, StatusPill, type StatusKind } from '../components/ui'
import { tokens as t, money } from '../lib/tokens'
import { useRole } from '../lib/roles'
import { eventConfig as cfg } from '../lib/config'
import { parties, type PartyKind } from '../lib/parties'
import { useCounts } from '../lib/counts'

/** Demo status per party — in the real build this comes off the count/settlement record. */
const statusOf: Record<string, StatusKind> = {
  'black-coyote': 'ready',
  'neon-harvest': 'counting',
  'gold-static': 'ready',
  riverline: 'notin',
  'ember-clay': 'ready',
  'smokestack-bbq': 'counting',
  'iron-city-prints': 'settled',
  'festival-merch': 'counting',
}

const th: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, color: t.muted, borderBottom: '1px solid #eeeeee' }
const varColor = (v: number) => (v ? t.red : t.greenText2)

export default function ManagerOverview() {
  const nav = useNavigate()
  const { canSee, role } = useRole()
  const { totalsFor, setPartyId } = useCounts()
  const [view, setView] = useState<'table' | 'cards'>('table')
  const [filter, setFilter] = useState<StatusKind | 'all'>('all')
  // Merchandise and craft vendors are separate books — look at one at a time, or both.
  const [scope, setScope] = useState<PartyKind | 'all'>('all')

  const rows = parties
    .filter((p) => canSee(p.name))
    .filter((p) => scope === 'all' || p.kind === scope)
    .map((p) => {
      const tot = totalsFor(p.id)
      return { party: p, tot, status: statusOf[p.id] ?? 'counting' }
    })

  const visible = filter === 'all' ? rows : rows.filter((r) => r.status === filter)

  const grand = rows.reduce(
    (a, r) => ({
      worth: a.worth + r.tot.totalIn * 0,
      unitsIn: a.unitsIn + r.tot.totalIn,
      sold: a.sold + r.tot.physicalSold,
      gross: a.gross + r.tot.physicalGross,
      variance: a.variance + Math.abs(r.tot.varianceUnits),
      skus: a.skus + r.party.skus,
    }),
    { worth: 0, unitsIn: 0, sold: 0, gross: 0, variance: 0, skus: 0 },
  )
  const perHead = grand.gross / cfg.attendance

  const counts = {
    all: rows.length,
    ready: rows.filter((r) => r.status === 'ready').length,
    counting: rows.filter((r) => r.status === 'counting').length,
    notin: rows.filter((r) => r.status === 'notin').length,
    settled: rows.filter((r) => r.status === 'settled').length,
  }
  const filters: { label: string; kind: StatusKind | 'all' }[] = [
    { label: `All · ${counts.all}`, kind: 'all' },
    { label: `Ready to settle · ${counts.ready}`, kind: 'ready' },
    { label: `Counting · ${counts.counting}`, kind: 'counting' },
    { label: `Not counted in · ${counts.notin}`, kind: 'notin' },
    { label: `Settled · ${counts.settled}`, kind: 'settled' },
  ]

  const open = (id: string) => {
    setPartyId(id)
    nav('/counts')
  }

  const scopeTitle = scope === 'artist' ? 'Merchandise' : scope === 'vendor' ? 'Craft Vendors' : 'All Vendors'

  return (
    <AdminLayout active="Overview" showOverview>
      <main style={{ padding: '20px 24px 32px' }}>
        <PageHead
          title={`Furnace Fest 2026 — ${role === 'organizer' ? scopeTitle : 'Your ' + scopeTitle}`}
          subtitle="Saturday, May 16, 2026 · All Booths ▾ · every party, all data, one page"
          actions={
            <>
              <Btn>↥ Export</Btn>
              <Btn variant="primary">Settle all ready →</Btn>
            </>
          }
        />

        {/* Merchandise vs Craft Vendors — the two books are kept separate */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ display: 'flex', border: `1.5px solid ${t.inputBorder}`, borderRadius: 5, overflow: 'hidden' }}>
            {([
              ['all', 'All'],
              ['artist', 'Merchandise'],
              ['vendor', 'Craft Vendors'],
            ] as const).map(([k, l], i) => {
              const on = scope === k
              return (
                <button
                  key={k}
                  onClick={() => setScope(k)}
                  style={{ fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, padding: '5px 16px', border: 'none', borderLeft: i ? `1.5px solid ${t.inputBorder}` : undefined, cursor: 'pointer', color: on ? t.red : t.secondary2, background: on ? t.redTintBg : '#fff' }}
                >
                  {l}
                </button>
              )
            })}
          </div>
          <span style={{ fontSize: 11.5, color: t.muted2 }}>
            {scope === 'artist' && 'Band merch only — apparel, music, accessories.'}
            {scope === 'vendor' && 'Craft, food, beverage and retail booths.'}
            {scope === 'all' && 'Both books combined.'}
          </span>
        </div>

        {/* Metric tiles */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <MetricTile label={scope === 'artist' ? 'ARTISTS' : scope === 'vendor' ? 'VENDORS' : 'PARTIES'} value={rows.length} />
          <MetricTile label="SKUS" value={grand.skus} />
          <MetricTile label="GROSS SALES TODAY" value={money(grand.gross)} accent />
          <MetricTile label="PER HEAD" value={`$${perHead.toFixed(2)}`} suffix={`/ ${cfg.attendance.toLocaleString()}`} />
          <MetricTile label="VARIANCES" value={<span style={{ color: grand.variance ? t.red : t.greenText2 }}>{grand.variance}</span>} suffix="units" />
        </div>

        {/* Filter pills + view toggle */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, alignItems: 'center' }}>
          {filters.map((f) => {
            const on = filter === f.kind
            return (
              <span
                key={f.label}
                onClick={() => setFilter(f.kind)}
                style={{
                  fontSize: 12, fontWeight: on ? 700 : 600, color: on ? t.red : t.secondary2,
                  border: `1.5px solid ${on ? t.red : t.inputBorder}`, borderRadius: 999, padding: '4px 14px',
                  background: on ? t.redTintBg : '#fff', cursor: 'pointer',
                }}
              >
                {f.label}
              </span>
            )
          })}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', border: `1.5px solid ${t.inputBorder}`, borderRadius: 5, overflow: 'hidden' }}>
            {(['table', 'cards'] as const).map((v, i) => {
              const on = view === v
              return (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{ fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, padding: '4px 14px', border: 'none', borderLeft: i ? `1.5px solid ${t.inputBorder}` : undefined, cursor: 'pointer', color: on ? t.red : t.secondary2, background: on ? t.redTintBg : '#fff' }}
                >
                  {v === 'table' ? 'Table' : 'Cards'}
                </button>
              )
            })}
          </div>
        </div>

        {/* Cards view */}
        {view === 'cards' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
            {visible.map(({ party: p, tot, status }) => {
              const attention = status === 'ready' || tot.varianceUnits !== 0
              return (
                <div key={p.id} onClick={() => open(p.id)} title="Open counts" style={{ background: '#fff', border: `1px solid ${attention ? t.redTintBorder : t.cardBorder}`, borderRadius: 8, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: t.heading }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: t.muted2, marginTop: 2 }}>{p.location}</div>
                    </div>
                    <StatusPill kind={status} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <KindTag kind={p.kind} />
                    <span style={{ fontSize: 11, color: t.muted2 }}>{p.category}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 0, borderTop: `1px solid ${t.divider3}`, borderBottom: `1px solid ${t.divider3}`, padding: '10px 0' }}>
                    <Stat flex={1} label="SOLD" value={tot.physicalSold ? tot.physicalSold.toLocaleString() : '—'} />
                    <Stat flex={1.2} label="GROSS" value={tot.physicalGross ? money(tot.physicalGross) : '—'} />
                    <Stat flex={1.2} label="DUE" value={tot.physicalGross ? money(tot.physicalGross * 0.649 * (p.splitPct / 80)) : '—'} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: tot.varianceUnits ? t.red : t.muted }}>
                      {tot.varianceUnits ? `${Math.abs(tot.varianceUnits)} variance units` : status === 'settled' ? 'Payout sent' : 'No variances'}
                    </span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: t.red }}>Detail →</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Table view */}
        {view === 'table' && (
          <div style={{ background: '#fff', border: `1px solid ${t.cardBorder}`, borderRadius: 6, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 980 }}>
              <thead>
                <tr>
                  <th style={{ width: 34, borderBottom: '1px solid #eeeeee' }} />
                  <th style={{ ...th, textAlign: 'left', padding: '10px 8px' }}>PARTY</th>
                  <th style={{ ...th, textAlign: 'left', padding: '10px 10px' }}>TYPE</th>
                  {['SKUS', 'UNITS IN', 'SOLD', 'GROSS SALES', 'VARIANCE', 'DUE'].map((h) => (
                    <th key={h} style={{ ...th, textAlign: 'right', padding: '10px 10px' }}>{h}</th>
                  ))}
                  <th style={{ ...th, textAlign: 'left', padding: '10px 14px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ party: p, tot, status }) => (
                  <tr key={p.id} onClick={() => open(p.id)} title="Open counts" style={{ cursor: 'pointer' }}>
                    <td style={{ padding: '9px 0 9px 14px', borderBottom: `1px solid ${t.divider3}`, color: t.muted2, fontSize: 10 }}>▸</td>
                    <td style={{ padding: '9px 8px', borderBottom: `1px solid ${t.divider3}`, fontWeight: 700, color: t.heading }}>
                      {p.name} <span style={{ fontWeight: 500, color: t.muted2, fontSize: 11 }}>{p.location}</span>
                    </td>
                    <td style={{ padding: '9px 10px', borderBottom: `1px solid ${t.divider3}` }}><KindTag kind={p.kind} /></td>
                    <td style={{ padding: '9px 10px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#666666' }}>{p.skus}</td>
                    <td style={{ padding: '9px 10px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#666666' }}>{tot.totalIn ? tot.totalIn.toLocaleString() : '—'}</td>
                    <td style={{ padding: '9px 10px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', fontWeight: 600 }}>{tot.physicalSold ? tot.physicalSold.toLocaleString() : '—'}</td>
                    <td style={{ padding: '9px 10px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', fontWeight: 600 }}>{tot.physicalGross ? money(tot.physicalGross) : '—'}</td>
                    <td style={{ padding: '9px 10px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', fontWeight: 700, color: varColor(tot.varianceUnits) }}>
                      {tot.totalIn ? (tot.varianceUnits === 0 ? '0' : (tot.varianceUnits > 0 ? '+' : '−') + Math.abs(tot.varianceUnits)) : '—'}
                    </td>
                    <td style={{ padding: '9px 10px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#444444' }}>
                      {tot.physicalGross ? money(tot.physicalGross * 0.649 * (p.splitPct / 80)) : '—'}
                    </td>
                    <td style={{ padding: '9px 14px', borderBottom: `1px solid ${t.divider3}` }}><StatusPill kind={status} /></td>
                  </tr>
                ))}
                {filter === 'all' && (
                  <tr style={{ background: t.rowBg2 }}>
                    <td style={{ padding: '10px 0 10px 14px' }} />
                    <td style={{ padding: '10px 8px', fontWeight: 700, color: t.heading }}>{scopeTitle} total</td>
                    <td />
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700 }}>{grand.skus}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700 }}>{grand.unitsIn.toLocaleString()}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700 }}>{grand.sold.toLocaleString()}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700 }}>{money(grand.gross)}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: grand.variance ? t.red : t.greenText2 }}>{grand.variance}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700 }}>{money(grand.gross * 0.649)}</td>
                    <td style={{ padding: '10px 14px' }} />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ fontSize: 11, color: t.muted2, marginTop: 8 }}>
          Click a row to open that party's counts · Merchandise and Craft Vendors keep separate catalogs but share the same settlement flow.
        </div>
      </main>
    </AdminLayout>
  )
}

function KindTag({ kind }: { kind: PartyKind }) {
  const merch = kind === 'artist'
  return (
    <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 999, padding: '2px 9px', whiteSpace: 'nowrap', background: merch ? t.redTintBg : '#f2f7f2', color: merch ? t.red : t.greenText, border: `1px solid ${merch ? t.redTintBorder : t.greenBorder}` }}>
      {merch ? 'Merch' : 'Vendor'}
    </span>
  )
}

function Stat({ label, value, flex }: { label: string; value: string; flex: number }) {
  return (
    <div style={{ flex }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: t.muted2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: t.heading, marginTop: 1 }}>{value}</div>
    </div>
  )
}
