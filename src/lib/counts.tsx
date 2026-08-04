import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Category } from './catalog'

/**
 * Shared count store — the single source of truth wired through Counts → Reconciliation → Settlement.
 *
 * Data is keyed by party so the Merchandise (artist) and Craft-Vendor experiences stay separate:
 * artists carry merch categories only, vendors carry craft / food / beverage / retail.
 *
 * Physical inventory counts drive settlement. The POS number is recorded alongside so
 * discrepancies surface per SKU; correcting POS on the Reconciliation page recalculates
 * gross sales everywhere downstream.
 */
export interface Sku {
  id: string
  itemId: string
  variant: string
  price: number
  /** physical count at load-in */
  initial: number
  /** giveaways / samples */
  comp: number
  /** damage, loss, or spoilage */
  shrink: number
  /** physical count at load-out */
  ending: number
  /** units the POS rang up */
  posSold: number
  /** lbs per unit, for return shipment weight */
  weightLb: number
}

export interface Item {
  id: string
  partyId: string
  name: string
  category: Category
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

export interface SkuCalc {
  added: number
  totalIn: number
  /** what the shelf says was sold: totalIn − comp − shrink − ending */
  physicalSold: number
  /** posSold − physicalSold; non-zero = discrepancy needing reconciliation */
  variance: number
  varianceValue: number
  physicalGross: number
  posGross: number
}

/* ---------------- Seed catalogs ---------------- */

const seedItems: Item[] = [
  // ── Merchandise · Black Coyote (artist)
  { id: 'tee', partyId: 'black-coyote', name: 'Black Logo Tee', category: 'Apparel', unitCost: 7.1 },
  { id: 'hoodie', partyId: 'black-coyote', name: 'Circle Logo Hoodie', category: 'Apparel', unitCost: 18.4 },
  { id: 'longsleeve', partyId: 'black-coyote', name: 'Blue Long Sleeve', category: 'Apparel', unitCost: 11.2 },
  { id: 'vinyl', partyId: 'black-coyote', name: 'Wilder Seasons LP', category: 'Music', unitCost: 9.5 },
  { id: 'trucker', partyId: 'black-coyote', name: 'Red/White Trucker Hat', category: 'Accessories', unitCost: 8.6 },

  // ── Craft vendor · Ember & Clay (ceramics)
  { id: 'mug', partyId: 'ember-clay', name: 'Stoneware Mug', category: 'Craft', unitCost: 11 },
  { id: 'planter', partyId: 'ember-clay', name: 'Hand-thrown Planter', category: 'Craft', unitCost: 18 },
  { id: 'bowl', partyId: 'ember-clay', name: 'Serving Bowl', category: 'Craft', unitCost: 32 },

  // ── Concessionaire · Smokestack BBQ (food + beverage)
  { id: 'pork', partyId: 'smokestack-bbq', name: 'Pulled Pork Sandwich', category: 'Food', unitCost: 4.1 },
  { id: 'brisket', partyId: 'smokestack-bbq', name: 'Brisket Plate', category: 'Food', unitCost: 7.8 },
  { id: 'tea', partyId: 'smokestack-bbq', name: 'Sweet Tea', category: 'Beverage', unitCost: 0.65 },

  // ── Craft vendor · Iron City Prints (posters / retail)
  { id: 'poster', partyId: 'iron-city-prints', name: 'Furnace Fest Show Poster', category: 'Craft', unitCost: 6.5 },
  { id: 'artprint', partyId: 'iron-city-prints', name: 'Skyline Art Print', category: 'Craft', unitCost: 4.2 },
  { id: 'totebag', partyId: 'iron-city-prints', name: 'Screen-printed Tote', category: 'Retail', unitCost: 5.8 },
]

const mk = (
  itemId: string,
  variant: string,
  price: number,
  initial: number,
  comp: number,
  shrink: number,
  ending: number,
  posSold: number,
  weightLb = 0.4,
): Sku => ({ id: `${itemId}-${variant}`, itemId, variant, price, initial, comp, shrink, ending, posSold, weightLb })

// A few SKUs disagree with the POS on purpose — that's what Reconciliation exists to resolve.
const seedSkus: Sku[] = [
  // Merchandise · Black Coyote
  mk('tee', 'XS', 40, 24, 0, 0, 14, 10),
  mk('tee', 'S', 40, 48, 1, 0, 26, 21),
  mk('tee', 'M', 40, 140, 3, 1, 96, 53), // POS under by 1
  mk('tee', 'L', 40, 148, 2, 2, 88, 56),
  mk('tee', 'XL', 40, 108, 0, 0, 61, 48), // POS over by 1
  mk('tee', '2XL', 40, 60, 0, 0, 38, 22),
  mk('hoodie', 'S', 60, 20, 0, 0, 14, 6, 1.4),
  mk('hoodie', 'M', 60, 40, 1, 0, 24, 14, 1.4), // POS under by 1
  mk('hoodie', 'L', 60, 40, 1, 0, 17, 26, 1.4), // POS under by 2
  mk('hoodie', 'XL', 60, 20, 0, 0, 11, 9, 1.4),
  mk('longsleeve', 'M', 45, 36, 0, 1, 20, 15, 0.6),
  mk('longsleeve', 'L', 45, 36, 0, 0, 18, 18, 0.6),
  mk('longsleeve', 'XL', 45, 24, 0, 0, 13, 11, 0.6),
  mk('vinyl', 'Vinyl', 30, 60, 2, 0, 34, 24, 0.9),
  mk('vinyl', 'CD', 15, 40, 0, 0, 31, 9, 0.2),
  mk('trucker', 'OS', 18, 40, 0, 0, 25, 15, 0.3),

  // Craft · Ember & Clay — small runs, breakage instead of shrink
  mk('mug', 'Small', 28, 48, 1, 2, 19, 37, 1.1), // POS under by 1 (60 in − 1 − 2 − 19 = 38)
  mk('mug', 'Large', 34, 36, 0, 1, 14, 22, 1.4), // POS over by 1
  mk('planter', 'Small', 42, 24, 0, 1, 9, 14, 2.2),
  mk('planter', 'Medium', 58, 18, 0, 0, 7, 11, 3.4),
  mk('bowl', 'OS', 85, 12, 0, 1, 5, 6, 4.0),

  // Food & beverage · Smokestack BBQ — consumed on site, waste not shrink
  mk('pork', 'Regular', 14, 220, 6, 4, 12, 256, 0), // POS under by 2 (280 in − 6 − 4 − 12 = 258)
  mk('pork', 'Combo', 18, 120, 2, 1, 8, 107, 0), // POS under by 2
  mk('brisket', 'Regular', 22, 140, 4, 3, 9, 124, 0),
  mk('brisket', 'Large', 28, 60, 1, 0, 6, 53, 0),
  mk('tea', '16 oz', 5, 300, 12, 8, 24, 350, 0), // POS under by 2 (396 in − 12 − 8 − 24 = 352)
  mk('tea', '25 oz', 8, 180, 4, 3, 15, 158, 0),

  // Prints · Iron City Prints
  mk('poster', 'OS', 35, 150, 4, 3, 61, 82, 0.3),
  mk('artprint', 'Small', 25, 80, 0, 1, 38, 41, 0.2),
  mk('artprint', 'Large', 45, 40, 0, 0, 21, 19, 0.4),
  mk('totebag', 'OS', 22, 60, 2, 0, 29, 28, 0.5), // POS under by 1
]

const seedReups: Reup[] = [
  { id: 1, skuId: 'tee-M', qty: 12, time: '9:12 PM', note: 'Flash print — restock from booth', by: 'Alex Diaz' },
  { id: 2, skuId: 'hoodie-L', qty: 6, time: '9:48 PM', note: 'Brought from the bus', by: 'Dana Reyes' },
  { id: 3, skuId: 'mug-Small', qty: 12, time: '4:30 PM', note: 'Restock from the van', by: 'Tasha Boyd' },
  { id: 4, skuId: 'pork-Regular', qty: 60, time: '6:05 PM', note: 'Second smoker batch pulled', by: 'Leo Márquez' },
  { id: 5, skuId: 'tea-16 oz', qty: 96, time: '7:20 PM', note: 'Fresh brew · 4 cambros', by: 'Leo Márquez' },
]

/* ---------------- Store ---------------- */

export interface PartyTotals {
  initial: number
  added: number
  totalIn: number
  comp: number
  shrink: number
  ending: number
  physicalSold: number
  posSold: number
  varianceUnits: number
  varianceValue: number
  /** absolute dollar error — SKU mistakes that wash out at the top line still show here */
  grossVarianceValue: number
  physicalGross: number
  posGross: number
  weightLb: number
}

interface CountsCtx {
  /** currently selected party — drives every downstream screen */
  partyId: string
  setPartyId: (id: string) => void

  items: Item[]
  skus: Sku[]
  reups: Reup[]
  calc: (sku: Sku) => SkuCalc
  setSku: (id: string, patch: Partial<Sku>) => void
  addReup: (skuId: string, qty: number, note: string, by?: string) => void
  skusForItem: (itemId: string) => Sku[]
  reupsForItem: (itemId: string) => Reup[]
  totals: PartyTotals
  flagged: Sku[]
  /** totals for any party, for roll-ups on the overview */
  totalsFor: (partyId: string) => PartyTotals
  locked: boolean
  setLocked: (v: boolean) => void
}

const Ctx = createContext<CountsCtx | null>(null)

const emptyTotals = (): PartyTotals => ({
  initial: 0, added: 0, totalIn: 0, comp: 0, shrink: 0, ending: 0,
  physicalSold: 0, posSold: 0, varianceUnits: 0, varianceValue: 0,
  grossVarianceValue: 0, physicalGross: 0, posGross: 0, weightLb: 0,
})

export function CountsProvider({ children }: { children: ReactNode }) {
  const [allSkus, setAllSkus] = useState<Sku[]>(seedSkus)
  const [reups, setReups] = useState<Reup[]>(seedReups)
  const [partyId, setPartyId] = useState('black-coyote')
  const [lockedIds, setLockedIds] = useState<string[]>([])

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

  const itemsFor = (pid: string) => seedItems.filter((i) => i.partyId === pid)
  const skusFor = (pid: string) => {
    const ids = new Set(itemsFor(pid).map((i) => i.id))
    return allSkus.filter((s) => ids.has(s.itemId))
  }

  const totalsFor = (pid: string): PartyTotals => {
    const acc = emptyTotals()
    for (const s of skusFor(pid)) {
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
  }

  const items = itemsFor(partyId)
  const skus = skusFor(partyId)
  const itemIds = new Set(items.map((i) => i.id))

  const value: CountsCtx = {
    partyId,
    setPartyId,
    items,
    skus,
    reups: reups.filter((r) => itemIds.has(r.skuId.slice(0, r.skuId.lastIndexOf('-')))),
    calc,
    setSku: (id, patch) => setAllSkus((ss) => ss.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    addReup: (skuId, qty, note, by = 'Alex Diaz') =>
      setReups((rs) => [...rs, { id: (rs.at(-1)?.id ?? 0) + 1, skuId, qty, note: note || 'Mid-show re-up', time: nowTime(), by }]),
    skusForItem: (itemId) => allSkus.filter((s) => s.itemId === itemId),
    reupsForItem: (itemId) => reups.filter((r) => r.skuId.slice(0, r.skuId.lastIndexOf('-')) === itemId),
    totals: useMemo(() => totalsFor(partyId), [allSkus, reups, partyId]),
    flagged: skus.filter((s) => calc(s).variance !== 0),
    totalsFor,
    locked: lockedIds.includes(partyId),
    setLocked: (v) => setLockedIds((ids) => (v ? [...new Set([...ids, partyId])] : ids.filter((i) => i !== partyId))),
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
