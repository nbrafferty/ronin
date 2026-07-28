/**
 * Event configuration — contracted rates set pre-event and LOCKED before the show
 * (per the update spec: fee fields move to Configurations and lock pre-event).
 * In the .NET build these live on the event/vendor contract; settlement reads them read-only.
 */
export const eventConfig = {
  event: 'Spring Music Fest 2026',
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

export type CustomDeduction = { id: number; label: string; mode: '%' | '$'; value: number; basis: string }
