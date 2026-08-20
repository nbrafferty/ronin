import { createContext, useContext, useState, type ReactNode } from 'react'
import { parties, partyById, type Contact } from './parties'

/**
 * Artist / vendor Advance state (2026-08-04 review, task 7).
 *
 * Everything a party needs squared away BEFORE the event: catalog upload,
 * contacts (with a settlement signer), shipping/return addresses, and the
 * per-event info wiki. Readiness is computed, not stored, so the manager's
 * at-a-glance view on the Overview always reflects live state.
 */

export interface InventoryUpload {
  fileName: string
  rows: number
  errors: { row: number; message: string }[]
  uploadedAt: string
}

export interface AdvanceState {
  inventory: InventoryUpload | null
  contacts: Contact[]
  /** email of the contact flagged as settlement signer */
  signerEmail: string
  shippingAddress: string
  returnAddress: string
  /** per-event info mini-wiki: load-in, where to meet, schedule notes */
  wiki: string
  /** manual override for boxes per shipment (task 6); null = use computed default */
  boxOverride: number | null
}

const seed = (): Record<string, AdvanceState> => {
  const out: Record<string, AdvanceState> = {}
  for (const p of parties) {
    out[p.id] = {
      inventory: null,
      contacts: [p.contact, ...p.altContacts],
      signerEmail: p.contact.email,
      shippingAddress: '',
      returnAddress: '',
      wiki: '',
      boxOverride: null,
    }
  }
  // Black Coyote arrives mostly advanced so the demo shows both states.
  out['black-coyote'] = {
    ...out['black-coyote'],
    inventory: { fileName: 'black-coyote-catalog.csv', rows: 16, errors: [], uploadedAt: 'May 9' },
    shippingAddress: 'Furnace Fest Receiving · 3417 1st Ave N, Birmingham AL 35222',
    returnAddress: 'The Ryman · 116 Rep John Lewis Way N, Nashville TN 37219',
    wiki: 'Load-in via Gate C from 11:00 AM. Ask for Alex at the merch tent. Golf cart runs every 20 min from the lot. Count-in starts 1:00 PM sharp.',
  }
  out['iron-city-prints'] = {
    ...out['iron-city-prints'],
    inventory: { fileName: 'icp-items.csv', rows: 14, errors: [], uploadedAt: 'May 11' },
    shippingAddress: 'Booth 7, Craft Row',
    returnAddress: 'Iron City Prints · 2201 2nd Ave N, Birmingham AL',
  }
  return out
}

export interface ReadinessCheck {
  id: string
  label: string
  done: boolean
}

interface AdvanceCtx {
  get: (partyId: string) => AdvanceState
  set: (partyId: string, patch: Partial<AdvanceState>) => void
  /** checklist for one party — includes Stripe state from the party object */
  readiness: (partyId: string) => ReadinessCheck[]
  /** "4/6" style summary for manager-glance surfaces */
  readinessSummary: (partyId: string) => { done: number; total: number; complete: boolean }
}

const Ctx = createContext<AdvanceCtx | null>(null)

export function AdvanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Record<string, AdvanceState>>(seed)

  const get = (id: string) => state[id]
  const set = (id: string, patch: Partial<AdvanceState>) =>
    setState((s) => ({ ...s, [id]: { ...s[id], ...patch } }))

  const readiness = (id: string): ReadinessCheck[] => {
    const a = state[id]
    const p = partyById(id)
    const checks: ReadinessCheck[] = [
      { id: 'stripe', label: 'Stripe account connected', done: p.stripe === 'connected' },
      { id: 'inventory', label: 'Inventory uploaded', done: !!a.inventory && a.inventory.errors.length === 0 },
      { id: 'contacts', label: 'Contacts added', done: a.contacts.length > 0 },
      { id: 'signer', label: 'Settlement signer flagged', done: !!a.signerEmail },
      { id: 'addresses', label: 'Shipping & return addresses', done: !!a.shippingAddress && !!a.returnAddress },
    ]
    // Craft/food parity: permits & insurance replace nothing but add a doc requirement.
    if (p.kind === 'vendor') {
      checks.push({ id: 'permits', label: 'Permits & insurance on file', done: p.id === 'smokestack-bbq' })
    }
    return checks
  }

  const readinessSummary = (id: string) => {
    const checks = readiness(id)
    const done = checks.filter((c) => c.done).length
    return { done, total: checks.length, complete: done === checks.length }
  }

  return <Ctx.Provider value={{ get, set, readiness, readinessSummary }}>{children}</Ctx.Provider>
}

export function useAdvance() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAdvance must be used inside AdvanceProvider')
  return c
}
