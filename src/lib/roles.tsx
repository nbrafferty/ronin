import { createContext, useContext, useState, type ReactNode } from 'react'
import { tokens as t } from './tokens'

/**
 * Multi-tenant permission tiers (per the Jul 22 update spec).
 * - vendor:        sees only their own data (one booth).
 * - vendorManager: sees only the vendors assigned to them.
 * - organizer:     festival-level; sees every vendor and all data.
 * The real .NET backend enforces these; here the switcher demonstrates the scoping in the UI.
 */
export type Role = 'organizer' | 'vendorManager' | 'vendor'

export const roleMeta: Record<Role, { label: string; who: string; initials: string; avatarBg: string; scope: string[] | 'all' }> = {
  organizer: {
    label: 'Organizer',
    who: 'Alex Diaz · Festival',
    initials: 'AD',
    avatarBg: t.red,
    scope: 'all',
  },
  vendorManager: {
    label: 'Vendor Manager',
    who: 'Sam Okafor · Merch Mgr',
    initials: 'SO',
    avatarBg: '#2c6e33',
    // A merch manager over a specific slate of artists/vendors.
    scope: ['Black Coyote', 'Neon Harvest', 'Gold Static', 'The Meters'],
  },
  vendor: {
    label: 'Vendor',
    who: 'Dana Reyes · Black Coyote',
    initials: 'TM',
    avatarBg: '#1a1a1a',
    scope: ['Black Coyote'],
  },
}

interface RoleCtx {
  role: Role
  setRole: (r: Role) => void
  canSee: (vendorName: string) => boolean
  scopeLabel: string
}

const Ctx = createContext<RoleCtx>({ role: 'organizer', setRole: () => {}, canSee: () => true, scopeLabel: 'all vendors' })

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('organizer')
  const scope = roleMeta[role].scope
  const canSee = (name: string) => scope === 'all' || scope.includes(name)
  const scopeLabel = scope === 'all' ? 'all vendors' : scope.length === 1 ? '1 vendor' : `${scope.length} assigned vendors`
  return <Ctx.Provider value={{ role, setRole, canSee, scopeLabel }}>{children}</Ctx.Provider>
}

export const useRole = () => useContext(Ctx)

/** Segmented role switcher — lives in the top bar so the demo can show each permission tier. */
export function RoleSwitcher() {
  const { role, setRole } = useRole()
  const roles: Role[] = ['organizer', 'vendorManager', 'vendor']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: t.muted2 }}>VIEWING AS</span>
      <div style={{ display: 'flex', border: `1.5px solid ${t.inputBorder}`, borderRadius: 5, overflow: 'hidden' }}>
        {roles.map((r, i) => {
          const on = role === r
          return (
            <button
              key={r}
              onClick={() => setRole(r)}
              style={{
                fontFamily: 'inherit',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                border: 'none',
                borderLeft: i > 0 ? `1.5px solid ${t.inputBorder}` : undefined,
                cursor: 'pointer',
                color: on ? t.red : t.secondary2,
                background: on ? t.redTintBg : '#fff',
                whiteSpace: 'nowrap',
              }}
            >
              {roleMeta[r].label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
