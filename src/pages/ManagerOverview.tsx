import { useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { Btn, MetricTile, PageHead, StatusPill, type StatusKind } from '../components/ui'
import { tokens as t } from '../lib/tokens'

interface Artist {
  name: string
  stage: string
  skus: number
  worth: string
  unitsIn: number
  sold: number
  gross: string
  variance: number | null
  due: string
  status: StatusKind
}

const artists: Artist[] = [
  { name: 'Black Coyote', stage: 'Main Stage · 9:30 PM', skus: 12, worth: '$30,000', unitsIn: 712, sold: 287, gross: '$12,190', variance: 3, due: '$7,906', status: 'settled' },
  { name: 'Neon Harvest', stage: 'Main Stage · 7:45 PM', skus: 8, worth: '$21,400', unitsIn: 980, sold: 402, gross: '$8,340', variance: 0, due: '$5,420', status: 'counting' },
  { name: 'Gold Static', stage: 'River Stage · 6:00 PM', skus: 8, worth: '$18,200', unitsIn: 640, sold: 318, gross: '$6,020', variance: 0, due: '$3,910', status: 'ready' },
  { name: 'The Meters', stage: 'River Stage · 8:15 PM', skus: 14, worth: '$44,800', unitsIn: 1660, sold: 1204, gross: '$29,240', variance: 5, due: '$21,738', status: 'ready' },
  { name: 'Riverline', stage: 'Tent Stage · 5:00 PM', skus: 6, worth: '$12,600', unitsIn: 510, sold: 0, gross: '—', variance: null, due: '—', status: 'notin' },
  { name: 'Cedar & Smoke', stage: 'Tent Stage · 3:30 PM', skus: 5, worth: '$9,800', unitsIn: 420, sold: 186, gross: '$3,720', variance: 0, due: '$2,418', status: 'settled' },
  { name: 'Festival Merch', stage: 'All booths', skus: 22, worth: '$117,600', unitsIn: 3660, sold: 1930, gross: '$36,900', variance: 3, due: '—', status: 'counting' },
]

const filters: { label: string; kind: StatusKind | 'all' }[] = [
  { label: 'All · 18', kind: 'all' },
  { label: 'Ready to settle · 3', kind: 'ready' },
  { label: 'Counting · 2', kind: 'counting' },
  { label: 'Not counted in · 2', kind: 'notin' },
  { label: 'Settled · 11', kind: 'settled' },
]

const noteFor = (a: Artist): { text: string; color: string } => {
  if (a.variance) return { text: `${a.variance} variance units to reconcile`, color: t.red }
  if (a.status === 'settled') return { text: 'Payout sent · Stripe ACH', color: t.greenText }
  if (a.status === 'ready') return { text: 'Counts locked — queue for settlement', color: t.muted }
  if (a.status === 'counting') return { text: 'Count out in progress', color: t.muted }
  return { text: 'Fly-in — packing slip expected', color: t.muted }
}

const th: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, color: t.muted, borderBottom: '1px solid #eeeeee' }
const varColor = (v: number | null) => (v ? t.red : t.greenText2)
const fmtVar = (v: number | null) => (v === null ? '—' : String(v))

export default function ManagerOverview() {
  const [view, setView] = useState<'table' | 'cards'>('table')
  const [filter, setFilter] = useState<StatusKind | 'all'>('all')

  const visible = filter === 'all' ? artists : artists.filter((a) => a.status === filter)

  return (
    <AdminLayout active="Overview" showOverview>
      <main style={{ padding: '20px 24px 32px' }}>
        <PageHead
          title="Spring Music Fest 2026 — All Artists"
          subtitle="Saturday, May 16, 2026 · All Booths ▾ · every artist, all merch data, one page"
          actions={
            <>
              <Btn>↥ Export</Btn>
              <Btn variant="primary">Settle all ready →</Btn>
            </>
          }
        />

        {/* Metric tiles */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <MetricTile label="ARTISTS" value="18" />
          <MetricTile label="INVENTORY WORTH" value="$412,300" />
          <MetricTile label="GROSS SALES TODAY" value="$96,410" accent />
          <MetricTile label="VARIANCES" value="11" suffix="units" />
          <MetricTile label="UNSETTLED" value={<span style={{ color: t.red }}>5</span>} suffix="artists" />
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
                  fontSize: 12,
                  fontWeight: on ? 700 : 600,
                  color: on ? t.red : t.secondary2,
                  border: `1.5px solid ${on ? t.red : t.inputBorder}`,
                  borderRadius: 999,
                  padding: '4px 14px',
                  background: on ? t.redTintBg : '#fff',
                  cursor: 'pointer',
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
                  style={{
                    fontFamily: 'inherit',
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: '4px 14px',
                    border: 'none',
                    borderLeft: i === 1 ? `1.5px solid ${t.inputBorder}` : undefined,
                    cursor: 'pointer',
                    color: on ? t.red : t.secondary2,
                    background: on ? t.redTintBg : '#fff',
                  }}
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
            {visible.map((a) => {
              const note = noteFor(a)
              const attention = a.status === 'ready' || !!a.variance
              return (
                <div key={a.name} style={{ background: '#fff', border: `1px solid ${attention ? t.redTintBorder : t.cardBorder}`, borderRadius: 8, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: t.heading }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: t.muted2, marginTop: 2 }}>{a.stage}</div>
                    </div>
                    <StatusPill kind={a.status} />
                  </div>
                  <div style={{ display: 'flex', gap: 0, borderTop: `1px solid ${t.divider3}`, borderBottom: `1px solid ${t.divider3}`, padding: '10px 0' }}>
                    <Stat flex={1} label="SOLD" value={a.sold ? a.sold.toLocaleString() : '—'} />
                    <Stat flex={1.2} label="GROSS" value={a.gross} />
                    <Stat flex={1.2} label="DUE ARTIST" value={a.due} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: note.color }}>{note.text}</span>
                    <a href="#" style={{ fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap' }}>Detail →</a>
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
                  <th style={{ ...th, textAlign: 'left', padding: '10px 8px' }}>ARTIST</th>
                  {['SKUS', 'INVENTORY WORTH', 'UNITS IN', 'SOLD', 'GROSS SALES', 'VARIANCE', 'DUE ARTIST'].map((h) => (
                    <th key={h} style={{ ...th, textAlign: 'right', padding: '10px 10px' }}>{h}</th>
                  ))}
                  <th style={{ ...th, textAlign: 'left', padding: '10px 14px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((a) => (
                  <tr key={a.name}>
                    <td style={{ padding: '9px 0 9px 14px', borderBottom: `1px solid ${t.divider3}`, color: t.muted2, fontSize: 10 }}>▸</td>
                    <td style={{ padding: '9px 8px', borderBottom: `1px solid ${t.divider3}`, fontWeight: 700, color: t.heading }}>
                      {a.name} <span style={{ fontWeight: 500, color: t.muted2, fontSize: 11 }}>{a.stage}</span>
                    </td>
                    <td style={{ padding: '9px 10px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#666666' }}>{a.skus}</td>
                    <td style={{ padding: '9px 10px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#666666' }}>{a.worth}</td>
                    <td style={{ padding: '9px 10px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#666666' }}>{a.unitsIn.toLocaleString()}</td>
                    <td style={{ padding: '9px 10px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', fontWeight: 600 }}>{a.sold ? a.sold.toLocaleString() : '—'}</td>
                    <td style={{ padding: '9px 10px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', fontWeight: 600 }}>{a.gross}</td>
                    <td style={{ padding: '9px 10px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', fontWeight: 700, color: varColor(a.variance) }}>{fmtVar(a.variance)}</td>
                    <td style={{ padding: '9px 10px', borderBottom: `1px solid ${t.divider3}`, textAlign: 'right', color: '#444444' }}>{a.due}</td>
                    <td style={{ padding: '9px 14px', borderBottom: `1px solid ${t.divider3}` }}><StatusPill kind={a.status} /></td>
                  </tr>
                ))}
                {filter === 'all' && (
                  <tr style={{ background: t.rowBg2 }}>
                    <td style={{ padding: '10px 0 10px 14px' }} />
                    <td style={{ padding: '10px 8px', fontWeight: 700, color: t.heading }}>Festival total</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700 }}>142</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700 }}>$412,300</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700 }}>21,600</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700 }}>9,804</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700 }}>$96,410</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: t.red }}>11</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700 }}>$62,540</td>
                    <td style={{ padding: '10px 14px' }} />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ fontSize: 11, color: t.muted2, marginTop: 8 }}>
          Click an artist to expand per-item rows, or open their <a href="#">artist detail view</a> · "Ready to settle" artists queue into one-click settlement.
        </div>
      </main>
    </AdminLayout>
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
