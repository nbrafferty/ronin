import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Contact } from './parties'
import { nowTime } from './counts'

/**
 * Sign-off state for the two stages defined in the 2026-07-29 review.
 * - `initial`    — optional confirmation of the initial count. Never blocks selling.
 * - `settlement` — e-signature routed through the vendor/artist portal (DocuSign-style).
 * Either stage can be routed to a contact other than the party's default.
 */
export type SignOffStatus = 'none' | 'requested' | 'signed' | 'disputed'
export type Stage = 'initial' | 'settlement'

export interface SignOffRecord {
  status: SignOffStatus
  contact: Contact | null
  channel: 'Email' | 'Text'
  at: string | null
  note?: string
}

interface SignOffCtx {
  initial: SignOffRecord
  settlement: SignOffRecord
  request: (stage: Stage, contact: Contact, channel: 'Email' | 'Text') => void
  resolve: (stage: Stage, status: 'signed' | 'disputed', note?: string) => void
}

const empty: SignOffRecord = { status: 'none', contact: null, channel: 'Email', at: null }

const Ctx = createContext<SignOffCtx | null>(null)

export function SignOffProvider({ children }: { children: ReactNode }) {
  const [initial, setInitial] = useState<SignOffRecord>(empty)
  const [settlement, setSettlement] = useState<SignOffRecord>(empty)

  const setter = (stage: Stage) => (stage === 'initial' ? setInitial : setSettlement)

  const value: SignOffCtx = {
    initial,
    settlement,
    request: (stage, contact, channel) =>
      setter(stage)({ status: 'requested', contact, channel, at: nowTime() }),
    resolve: (stage, status, note) =>
      setter(stage)((r) => ({ ...r, status, at: nowTime(), note })),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSignOff() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useSignOff must be used inside SignOffProvider')
  return c
}
