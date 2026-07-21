import { Link } from 'react-router-dom'
import { Logo } from '../components/AdminLayout'
import { tokens as t } from '../lib/tokens'

const screens = [
  { to: '/overview', title: 'Manager Overview', desc: 'Every artist, all merch data, one page — table + cards, live filters.' },
  { to: '/planning', title: 'Merch Planning', desc: 'Build Sheet + Revenue Projection with live North Star numbers.' },
  { to: '/item-builder', title: 'Item Builder', desc: 'Cost out one item; the margin bar recomputes as you type.' },
  { to: '/counts', title: 'Merch Counts (In/Out)', desc: 'Fast count entry, accordion groups, Finalize Show.' },
  { to: '/settlement', title: 'Settlement', desc: 'One-click settlement — 5-step stepper, live fee math, sticky rail.' },
  { to: '/settlement-statement', title: 'Settlement Statement', desc: 'Printable / PDF settlement record (Letter format).' },
  { to: '/artist-portal', title: 'Artist Portal', desc: 'Artist-side hero: real-time sales, locked splits, payout visibility.' },
]

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: t.pageBg, color: t.body, fontFamily: t.font }}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, padding: '32px 0 20px', borderBottom: `1px solid ${t.cardBorder}` }}>
          <div style={{ width: 196 }}><Logo /></div>
          <div style={{ paddingBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: t.heading }}>Festival Merchandise Module</h1>
            <div style={{ fontSize: 13, color: t.secondary2, marginTop: 6 }}>
              Working front-end demo · Spring Music Fest 2026 · pre-event planning → run-of-show counts → settlement &amp; payout
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14, marginTop: 24 }}>
          {screens.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              style={{
                display: 'block',
                background: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                borderLeft: `3px solid ${t.red}`,
                borderRadius: 8,
                padding: '18px 20px',
                textDecoration: 'none',
                color: t.body,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: t.heading }}>{s.title}</div>
              <div style={{ fontSize: 12.5, color: t.secondary2, marginTop: 6, lineHeight: 1.5 }}>{s.desc}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.red, marginTop: 10 }}>Open →</div>
            </Link>
          ))}
        </div>

        <div style={{ fontSize: 11.5, color: t.muted2, marginTop: 26, lineHeight: 1.6 }}>
          Mocked / local data — no backend. Yellow cells are editable and calc columns recompute live.
          Benchmarks: AtVenu &amp; Square. Built as the foundation for Ronin's full .NET vendor-portal build.
        </div>
      </div>
    </div>
  )
}
