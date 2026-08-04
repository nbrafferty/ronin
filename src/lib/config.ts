/**
 * Event configuration — contracted rates set pre-event and LOCKED before the show
 * (per the update spec: fee fields move to Configurations and lock pre-event).
 * In the .NET build these live on the event/vendor contract; settlement reads them read-only.
 */
export const eventConfig = {
  event: 'Furnace Fest 2026',
  date: 'Saturday, May 16, 2026',
  attendance: 25000,
  fees: {
    salesTaxPct: 10.25, // inclusive, retained by venue
    creditCardPct: 5.0, // on credit receipts
    concessionairePct: 5.0, // off top
  },
  defaultSplit: { vendor: 80, venue: 20 },
  locked: true,
  lockedBy: 'Alex Diaz',
  lockedAt: 'May 2, 2026',
} as const

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
