import { Link } from 'react-router-dom'
import { Logo } from '../components/AdminLayout'
import { tokens as t } from '../lib/tokens'

const inScope = [
  { to: '/overview', title: 'Manager Overview', desc: 'Every vendor, one page — table + cards, live filters, per-head, drill-down to counts.' },
  { to: '/counts', title: 'Count-In / Count-Out', desc: 'Comp + Shrink split, timestamped re-up log, sign-off flow, Finalize → reconcile.' },
  { to: '/reconciliation', title: 'Reconciliation', desc: 'Resolve variances & damages; payout adjusts in real time.' },
  { to: '/settlement', title: 'Settlement & Payout', desc: 'Locked fees, custom deductions, pause/queue — the flagship payout module.' },
  { to: '/settlement-statement', title: 'Settlement Statement', desc: 'Printable / PDF settlement record (Letter format).' },
  { to: '/configurations', title: 'Configurations', desc: 'Contracted fee rates locked pre-event; permission tiers.' },
  { to: '/item-builder', title: 'Item Builder', desc: 'Slide-out: name, category, pricing, sizing attributes, margin health.' },
  { to: '/vendor-portal', title: 'Vendor Portal', desc: 'Remote real-time sales feed, locked split, payout visibility.' },
  { to: '/terms', title: 'Terms & Conditions', desc: 'Ronin facilitates communication; agreements between third parties.' },
]
const deferred = [
  { to: '/planning', title: 'Merch Planning', desc: 'Inventory / margin projections — deferred past the October scope.' },
]

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: t.pageBg, color: t.body, fontFamily: t.font }}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, padding: '32px 0 20px', borderBottom: `1px solid ${t.cardBorder}` }}>
          <div style={{ width: 196 }}><Logo /></div>
          <div style={{ paddingBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: t.heading }}>Festival Merchandise Module <span style={{ fontSize: 12, fontWeight: 700, color: t.muted2 }}>· 2nd draft</span></h1>
            <div style={{ fontSize: 13, color: t.secondary2, marginTop: 6 }}>
              Working front-end demo · Spring Music Fest 2026 · count-in/out → reconciliation → settlement &amp; payout
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: t.muted2, marginTop: 26, marginBottom: 10 }}>OCTOBER SCOPE</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {inScope.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              style={{ display: 'block', background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderLeft: `3px solid ${t.red}`, borderRadius: 8, padding: '18px 20px', textDecoration: 'none', color: t.body }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: t.heading }}>{s.title}</div>
              <div style={{ fontSize: 12.5, color: t.secondary2, marginTop: 6, lineHeight: 1.5 }}>{s.desc}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.red, marginTop: 10 }}>Open →</div>
            </Link>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: t.muted2, marginTop: 26, marginBottom: 10 }}>DEFERRED (LATER)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {deferred.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              style={{ display: 'block', background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderLeft: `3px solid ${t.faint2}`, borderRadius: 8, padding: '18px 20px', textDecoration: 'none', color: t.body, opacity: 0.85 }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: t.heading }}>{s.title} <span style={{ fontSize: 9, fontWeight: 700, color: t.faint, border: `1px solid ${t.divider}`, borderRadius: 3, padding: '0 4px' }}>LATER</span></div>
              <div style={{ fontSize: 12.5, color: t.secondary2, marginTop: 6, lineHeight: 1.5 }}>{s.desc}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.secondary2, marginTop: 10 }}>Open →</div>
            </Link>
          ))}
        </div>

        <div style={{ fontSize: 11.5, color: t.muted2, marginTop: 26, lineHeight: 1.6 }}>
          Mocked / local data — no backend. Vendors are relabeled from “artists”; switch permission tiers from the top bar.
          Benchmarks: AtVenu &amp; Square. Built as the foundation for Ronin's full .NET vendor-portal build.
        </div>
      </div>
    </div>
  )
}
