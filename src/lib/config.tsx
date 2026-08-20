import { createContext, useContext, useState, type ReactNode } from 'react'

/**
 * Event configuration — contracted rates, splits, and operational defaults.
 *
 * Per the 2026-08-04 review this is now LIVE state, not a frozen constant:
 * split rates and fees must be editable at ANY point in the settlement flow,
 * including after a settlement has been generated. Editing a rate here ripples
 * straight through Settlement's math — that recompute is the demo-level
 * expression of re-settlement.
 *
 * "Locked pre-event" survives as provenance (who set the contracted rates and
 * when), not as an edit barrier.
 */
export interface EventConfig {
  event: string
  date: string
  attendance: number
  fees: {
    /** inclusive, retained by venue */
    salesTaxPct: number
    /** on credit receipts */
    creditCardPct: number
    /** off top */
    concessionairePct: number
  }
  defaultSplit: { vendor: number; venue: number }
  /** shipping: default units per box for label generation (task 6) */
  itemsPerBox: number
  lockedBy: string
  lockedAt: string
}

const initial: EventConfig = {
  event: 'Furnace Fest 2026',
  date: 'Saturday, May 16, 2026',
  attendance: 25000,
  fees: {
    salesTaxPct: 10.25,
    creditCardPct: 5.0,
    concessionairePct: 5.0,
  },
  defaultSplit: { vendor: 80, venue: 20 },
  itemsPerBox: 100,
  lockedBy: 'Alex Diaz',
  lockedAt: 'May 2, 2026',
}

interface ConfigCtx {
  cfg: EventConfig
  setFee: (key: keyof EventConfig['fees'], value: number) => void
  setAttendance: (value: number) => void
  setItemsPerBox: (value: number) => void
  setDefaultSplit: (vendorPct: number) => void
}

const Ctx = createContext<ConfigCtx | null>(null)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [cfg, setCfg] = useState<EventConfig>(initial)
  const value: ConfigCtx = {
    cfg,
    setFee: (key, v) => setCfg((c) => ({ ...c, fees: { ...c.fees, [key]: v } })),
    setAttendance: (v) => setCfg((c) => ({ ...c, attendance: v })),
    setItemsPerBox: (v) => setCfg((c) => ({ ...c, itemsPerBox: Math.max(1, Math.round(v)) })),
    setDefaultSplit: (vendorPct) =>
      setCfg((c) => ({ ...c, defaultSplit: { vendor: vendorPct, venue: 100 - vendorPct } })),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useConfig() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useConfig must be used inside ConfigProvider')
  return c
}

/**
 * A custom settlement line. `dir` lets the same row either deduct from or add to the payout —
 * deposit returns and product buybacks are additions, shipping and staff are deductions.
 */
export type CustomLine = {
  id: number
  label: string
  mode: '%' | '$'
  value: number
  dir: 'deduct' | 'add'
}
