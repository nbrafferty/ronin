import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

/**
 * Shared count store — the single source of truth wired through Counts → Reconciliation → Settlement.
 *
 * Physical inventory counts drive settlement (per the 2026-07-29 review). The POS number is
 * recorded alongside so discrepancies surface per SKU; correcting POS on the Reconciliation
 * page recalculates gross sales everywhere downstream.
 */
export interface Sku {
  id: string
  itemId: string
  variant: string
  price: number
  /** physical count at load-in */
  initial: number
  /** giveaways */
  comp: number
  /** damage / lost / shrinkage */
  shrink: number
  /** physical count at load-out */
  ending: number
  /** units the POS rang up */
  posSold: number
  /** grams/ounces not modelled; lbs per unit for shipment weight */
  weightLb: number
}

export interface Item {
  id: string
  partyId: string
  name: string
  category: string
  /** optional margin tracking — available but never required */
  unitCost?: number
}

export interface Reup {
  id: number
  skuId: string
  qty: number
  time: string
  note: string
  by: string
}

/** Per-SKU derived numbers. Physical counts are authoritative; POS is compared against them. */
export interface SkuCalc {
  added: number
  /** initial + re-ups */
  totalIn: number
  /** what the shelf says was sold: totalIn − comp − shrink − ending */
  physicalSold: number
  /** posSold − physicalSold; non-zero = discrepancy needing reconciliation */
  variance: number
  /** dollar value of the variance */
  varianceValue: number
  /** gross by physical counts (source of truth) */
  physicalGross: number
  /** gross as rung up */
  posGross: number
}

const items: Item[] = [
  { id: 'tee', partyId: 'black-coyote', name: 'Black Logo Tee', category: 'Apparel', unitCost: 7.1 },
  { id: 'hoodie', partyId: 'black-coyote', name: 'Circle Logo Hoodie', category: 'Apparel', unitCost: 18.4 },
  { id: 'longsleeve', partyId: 'black-coyote', name: 'Blue Long Sleeve', category: 'Apparel', unitCost: 11.2 },
  { id: 'trucker', partyId: 'black-coyote', name: 'Red/White Trucker Hat', category: 'Accessories', unitCost: 8.6 },
]

const mk = (itemId: string, variant: string, price: number, initial: number, comp: number, shrink: number, ending: number, posSold: number, weightLb = 0.4): Sku => ({
  id: `${itemId}-${variant}`,
  itemId,
  variant,
  price,
  initial,
  comp,
  shrink,
  ending,
  posSold,
  weightLb,
})

// Seeded so a few SKUs disagree with the POS — that's what Reconciliation exists to resolve.
const seedSkus: Sku[] = [
  mk('tee', 'XS', 40, 24, 0, 0, 14, 10),
  mk('tee', 'S', 40, 48, 1, 0, 26, 21),
  mk('tee', 'M', 40, 140, 3, 1, 96, 53), // POS under by 1 (an XL rung as M scenario)
  mk('tee', 'L', 40, 148, 2, 2, 88, 56),
  mk('tee', 'XL', 40, 108, 0, 0, 61, 48), // POS over by 1
  mk('tee', '2XL', 40, 60, 0, 0, 38, 22),
  mk('hoodie', 'S', 60, 20, 0, 0, 14, 6, 1.4),
  mk('hoodie', 'M', 60, 40, 1, 0, 24, 14, 1.4), // POS under by 1
  mk('hoodie', 'L', 60, 40, 1, 0, 17, 26, 1.4), // POS under by 2 after the +6 re-up
  mk('hoodie', 'XL', 60, 20, 0, 0, 11, 9, 1.4),
  mk('longsleeve', 'M', 45, 36, 0, 1, 20, 15, 0.6),
  mk('longsleeve', 'L', 45, 36, 0, 0, 18, 18, 0.6),
  mk('longsleeve', 'XL', 45, 24, 0, 0, 13, 11, 0.6),
  mk('trucker', 'OS', 18, 40, 0, 0, 25, 15, 0.3),
]

const seedReups: Reup[] = [
  { id: 1, skuId: 'tee-M', qty: 12, time: '9:12 PM', note: 'Flash print — restock from booth', by: 'Alex Diaz' },
  { id: 2, skuId: 'hoodie-L', qty: 6, time: '9:48 PM', note: 'Brought from the bus', by: 'Dana Reyes' },
]

interface CountsCtx {
  items: Item[]
  skus: Sku[]
  reups: Reup[]
  calc: (sku: Sku) => SkuCalc
  setSku: (id: string, patch: Partial<Sku>) => void
  addReup: (skuId: string, qty: number, note: string) => void
  skusForItem: (itemId: string) => Sku[]
  reupsForSku: (skuId: string) => Reup[]
  reupsForItem: (itemId: string) => Reup[]
  totals: {
    initial: number
    added: number
    totalIn: number
    comp: number
    shrink: number
    ending: number
    physicalSold: number
    posSold: number
    varianceUnits: number
    /** net dollar variance across all SKUs */
    varianceValue: number
    /** absolute dollar variance — SKU errors that wash out at the top line still show here */
    grossVarianceValue: number
    physicalGross: number
    posGross: number
    weightLb: number
  }
  /** SKUs whose POS and physical counts disagree */
  flagged: Sku[]
  locked: boolean
  setLocked: (v: boolean) => void
}

const Ctx = createContext<CountsCtx | null>(null)

export function CountsProvider({ children }: { children: ReactNode }) {
  const [skus, setSkus] = useState<Sku[]>(seedSkus)
  const [reups, setReups] = useState<Reup[]>(seedReups)
  const [locked, setLocked] = useState(false)

  const reupQty = useMemo(() => {
    const m: Record<string, number> = {}
    for (const r of reups) m[r.skuId] = (m[r.skuId] ?? 0) + r.qty
    return m
  }, [reups])

  const calc = (sku: Sku): SkuCalc => {
    const added = reupQty[sku.id] ?? 0
    const totalIn = sku.initial + added
    const physicalSold = totalIn - sku.comp - sku.shrink - sku.ending
    const variance = sku.posSold - physicalSold
    return {
      added,
      totalIn,
      physicalSold,
      variance,
      varianceValue: variance * sku.price,
      physicalGross: physicalSold * sku.price,
      posGross: sku.posSold * sku.price,
    }
  }

  const totals = useMemo(() => {
    const acc = {
      initial: 0, added: 0, totalIn: 0, comp: 0, shrink: 0, ending: 0,
      physicalSold: 0, posSold: 0, varianceUnits: 0, varianceValue: 0,
      grossVarianceValue: 0, physicalGross: 0, posGross: 0, weightLb: 0,
    }
    for (const s of skus) {
      const c = calc(s)
      acc.initial += s.initial
      acc.added += c.added
      acc.totalIn += c.totalIn
      acc.comp += s.comp
      acc.shrink += s.shrink
      acc.ending += s.ending
      acc.physicalSold += c.physicalSold
      acc.posSold += s.posSold
      acc.varianceUnits += c.variance
      acc.varianceValue += c.varianceValue
      acc.grossVarianceValue += Math.abs(c.varianceValue)
      acc.physicalGross += c.physicalGross
      acc.posGross += c.posGross
      acc.weightLb += s.ending * s.weightLb
    }
    return acc
  }, [skus, reups])

  const value: CountsCtx = {
    items,
    skus,
    reups,
    calc,
    setSku: (id, patch) => setSkus((ss) => ss.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    addReup: (skuId, qty, note) =>
      setReups((rs) => [
        ...rs,
        { id: (rs.at(-1)?.id ?? 0) + 1, skuId, qty, note: note || 'Mid-show re-up', time: nowTime(), by: 'Alex Diaz' },
      ]),
    skusForItem: (itemId) => skus.filter((s) => s.itemId === itemId),
    reupsForSku: (skuId) => reups.filter((r) => r.skuId === skuId),
    reupsForItem: (itemId) => reups.filter((r) => r.skuId.startsWith(itemId + '-')),
    totals,
    flagged: skus.filter((s) => calc(s).variance !== 0),
    locked,
    setLocked,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCounts() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCounts must be used inside CountsProvider')
  return c
}

export function nowTime() {
  const d = new Date()
  let h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m} ${ap}`
}
