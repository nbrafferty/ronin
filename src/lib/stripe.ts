/**
 * Stripe payout status — MOCKED data source behind a clean interface.
 *
 * @chuck This is the seam for real Stripe wiring. Replace the body of
 * `getPayoutInfo` with a call against your payout records / Stripe Transfers
 * API; nothing upstream (Overview, Portal) knows the data is mocked. Statuses
 * map onto the transfer lifecycle:
 *
 *   not_requested    — no payout initiated for this party
 *   request_sent     — transfer created on our side, sent to Stripe
 *   request_received — Stripe acknowledged; funds in the 2-day settle window
 *   paid_out         — transfer landed in the vendor's account
 *   pending          — awaiting an upstream condition (e.g. balance settle)
 *   failed           — transfer errored; needs attention
 */
export type StripePayoutStatus =
  | 'not_requested'
  | 'request_sent'
  | 'request_received'
  | 'paid_out'
  | 'pending'
  | 'failed'

export interface PayoutInfo {
  status: StripePayoutStatus
  /** when the transfer was fired from our side */
  requestedAt?: string
  /** expected landing date (2-day Stripe settle) */
  scheduledFor?: string
  /** actual landing date once paid_out */
  paidAt?: string
  /** destination account tail */
  last4?: string
}

/** Display metadata for each status, using the existing status-pill palette. */
export const payoutStatusMeta: Record<
  StripePayoutStatus,
  { label: string; bg: string; color: string; border: string }
> = {
  not_requested: { label: 'No payout yet', bg: '#ffffff', color: '#999999', border: '#dddddd' },
  request_sent: { label: 'Request sent', bg: '#fdf6ec', color: '#8a5d12', border: '#f0dcae' },
  request_received: { label: 'Request received', bg: '#f5f5f5', color: '#666666', border: '#e0e0e0' },
  paid_out: { label: 'Paid out', bg: '#eef7ef', color: '#2c6e33', border: '#bcdcc0' },
  pending: { label: 'Pending', bg: '#f5f5f5', color: '#666666', border: '#e0e0e0' },
  failed: { label: 'Payout failed', bg: '#fdecea', color: '#c8201d', border: '#f0c9c7' },
}

// ---- MOCK DATA (swap for real Stripe wiring) --------------------------------

const mock: Record<string, PayoutInfo> = {
  'black-coyote': { status: 'request_sent', requestedAt: 'Sat May 16', scheduledFor: 'Mon May 18', last4: '6712' },
  'neon-harvest': { status: 'not_requested' },
  'gold-static': { status: 'request_received', requestedAt: 'Sat May 16', scheduledFor: 'Mon May 18', last4: '2210' },
  riverline: { status: 'not_requested' },
  'ember-clay': { status: 'pending', requestedAt: 'Sat May 16', scheduledFor: 'Tue May 19', last4: '8841' },
  'smokestack-bbq': { status: 'not_requested' },
  'iron-city-prints': { status: 'paid_out', requestedAt: 'Fri May 15', scheduledFor: 'Sun May 17', paidAt: 'Sun May 17', last4: '3306' },
  'festival-merch': { status: 'not_requested' },
}

export function getPayoutInfo(partyId: string): PayoutInfo {
  return mock[partyId] ?? { status: 'not_requested' }
}
