import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { tokens as t } from '../lib/tokens'
import { RoleSwitcher, useRole, roleMeta } from '../lib/roles'

/** RONIN logo block used in the sidebar. */
export function Logo() {
  return (
    <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${t.divider}` }}>
      <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '.14em', color: t.heading }}>RONIN</div>
      <div style={{ width: 26, height: 3, background: t.red, margin: '5px 0 5px' }} />
      <div style={{ fontSize: 8.5, letterSpacing: '.3em', color: '#8a8a8a', fontWeight: 600 }}>POINT OF SALE</div>
    </div>
  )
}

type NavItem = { label: string; to?: string; indent?: boolean; header?: boolean }

const topNav: NavItem[] = [
  { label: 'Dashboard' },
  { label: 'Orders' },
  { label: 'Reporting Glossary' },
  { label: 'Point of Sale Reports' },
  { label: 'Organizations' },
  { label: 'Payment Processors' },
  { label: 'Stripe Connect' },
  { label: 'Events' },
]

const merchRoutes: Record<string, string | undefined> = {
  Overview: '/overview',
  Configurations: '/configurations',
  'Merch Planning': '/planning',
  'Counts (In/Out)': '/counts',
  Reconciliation: '/reconciliation',
  Settlement: '/settlement',
  Terms: '/terms',
}

// Screens deferred past the October scope get a muted "later" tag (Planning module).
const deferred = new Set(['Merch Planning'])

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  if (item.header) {
    return (
      <div
        style={{
          padding: '10px 20px 4px',
          fontSize: 11,
          fontWeight: 700,
          color: t.heading,
          borderTop: `1px solid ${t.divider}`,
          marginTop: 6,
        }}
      >
        {item.label}
      </div>
    )
  }
  const base: React.CSSProperties = item.indent
    ? { padding: '6px 20px 6px 30px', fontSize: 12 }
    : { padding: '7px 20px' }
  const activeStyle: React.CSSProperties = active
    ? { color: t.red, fontWeight: 700, background: t.redTintBg, borderRight: `3px solid ${t.red}` }
    : {}
  const style = { ...base, ...activeStyle, color: activeStyle.color ?? t.secondary, display: 'block', textDecoration: 'none' }
  const tag = deferred.has(item.label) ? (
    <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '.06em', color: t.faint, border: `1px solid ${t.divider}`, borderRadius: 3, padding: '0 4px', marginLeft: 6, verticalAlign: 1 }}>LATER</span>
  ) : null
  const to = item.to
  if (to) return <Link to={to} style={style}>{item.label}{tag}</Link>
  return <div style={{ ...style, cursor: 'default' }}>{item.label}{tag}</div>
}

export function Sidebar({ active, showOverview }: { active?: string; showOverview?: boolean }) {
  const merch: NavItem[] = [
    { label: 'Merchandise', header: true },
    { label: 'Overview', indent: true },
    { label: 'Configurations', indent: true },
    { label: 'Merch Planning', indent: true },
    { label: 'Add Vendor/Company', indent: true },
    { label: 'Counts (In/Out)', indent: true },
    { label: 'Reconciliation', indent: true },
    { label: 'Settlement', indent: true },
    { label: 'Merch reports', indent: true },
    { label: 'Terms', indent: true },
  ].map((i) => ({ ...i, to: merchRoutes[i.label] }))

  return (
    <aside
      style={{
        width: 196,
        flex: 'none',
        background: t.cardBg,
        borderRight: `1px solid ${t.cardBorder}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Logo />
      <nav style={{ padding: '12px 0', fontSize: 12.5, color: t.secondary, display: 'flex', flexDirection: 'column' }}>
        {topNav.map((i) => (
          <NavRow key={i.label} item={i} active={i.label === active} />
        ))}
        {merch.map((i) => (
          <NavRow key={i.label} item={i} active={i.label === active} />
        ))}
      </nav>
    </aside>
  )
}

export function TopBar() {
  const { role } = useRole()
  const who = roleMeta[role]
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: t.cardBg,
        borderBottom: `1px solid ${t.cardBorder}`,
        padding: '10px 24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          border: `1px solid ${t.inputBorder}`,
          borderRadius: 4,
          padding: '6px 12px',
          fontSize: 12.5,
          color: t.body2,
          minWidth: 150,
          justifyContent: 'space-between',
        }}
      >
        Ronin POS <span style={{ color: t.muted2 }}>▾</span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          border: `1px solid ${t.inputBorder}`,
          borderRadius: 4,
          padding: '6px 12px',
          fontSize: 12.5,
          color: t.muted,
          minWidth: 170,
          justifyContent: 'space-between',
        }}
      >
        Spring Music Fest 2026 <span style={{ color: t.muted2 }}>▾</span>
      </div>
      <div style={{ flex: 1 }} />
      <RoleSwitcher />
      <div
        style={{
          position: 'relative',
          width: 18,
          height: 18,
          border: '1.5px solid #666666',
          borderRadius: '4px 4px 6px 6px',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: -5,
            right: -5,
            width: 10,
            height: 10,
            background: t.red,
            borderRadius: '50%',
            color: '#fff',
            fontSize: 7,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          4
        </span>
      </div>
      <div
        style={{
          width: 18,
          height: 18,
          border: '1.5px solid #666666',
          borderRadius: '50%',
          fontSize: 11,
          color: '#666666',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
        }}
      >
        ?
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: who.avatarBg,
            color: '#fff',
            fontSize: 10.5,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {who.initials}
        </div>
        <div style={{ fontSize: 11, lineHeight: 1.25 }}>
          <b>{who.who.split(' · ')[0]}</b>
          <br />
          <span style={{ color: t.muted2 }}>{who.label}</span>
        </div>
      </div>
    </header>
  )
}

/**
 * Shared admin chrome: 196px sidebar + top bar, page content in `children`.
 * `rail` renders an optional secondary column between sidebar and main (Counts uses this).
 */
function ScopeStrip() {
  const { role, scopeLabel } = useRole()
  if (role === 'organizer') return null
  return (
    <div style={{ background: role === 'vendor' ? '#1a1a1a' : '#22402a', color: '#fff', fontSize: 11.5, padding: '5px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontWeight: 700 }}>{roleMeta[role].label} view</span>
      <span style={{ opacity: 0.75 }}>scoped to {scopeLabel} — {roleMeta[role].who}</span>
    </div>
  )
}

export function AdminLayout({
  active,
  showOverview,
  children,
  rail,
}: {
  active?: string
  showOverview?: boolean
  children: ReactNode
  rail?: ReactNode
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.pageBg, color: t.body, fontFamily: t.font }}>
      <Sidebar active={active} showOverview={showOverview} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <ScopeStrip />
        {rail ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', minWidth: 0 }}>
            {rail}
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
