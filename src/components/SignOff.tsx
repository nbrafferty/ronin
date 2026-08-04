import { useState } from 'react'
import { Drawer } from './overlays'
import { Btn } from './ui'
import { tokens as t } from '../lib/tokens'
import type { Contact, Party } from '../lib/parties'
import { useSignOff, type Stage } from '../lib/signoff'
import { useCounts } from '../lib/counts'

const label: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, color: t.muted, marginBottom: 6 }
const field: React.CSSProperties = { width: '100%', padding: '8px 10px', border: `1px solid ${t.inputBorder}`, borderRadius: 4, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }

/**
 * Request/track a sign-off. The contact is pre-populated from the party object but can be
 * re-routed to any of their people (or a one-off address) before sending.
 */
export function SignOffDrawer({ stage, onClose, party }: { stage: Stage | null; onClose: () => void; party: Party }) {
  const signoff = useSignOff()
  const { reups, skus, items, totals } = useCounts()

  const contacts: Contact[] = [party.contact, ...party.altContacts]
  const [pick, setPick] = useState(0)
  const [custom, setCustom] = useState<Contact | null>(null)
  const [channel, setChannel] = useState<'Email' | 'Text'>('Email')

  if (!stage) return null
  const rec = stage === 'initial' ? signoff.initial : signoff.settlement
  const chosen = custom ?? contacts[pick] ?? party.contact
  const isInitial = stage === 'initial'

  return (
    <Drawer
      open
      onClose={onClose}
      title={isInitial ? 'Request initial count sign-off' : 'Request settlement sign-off'}
      subtitle={`${party.name} · ${party.location}`}
      width={520}
      footer={
        rec.status === 'requested' ? (
          <>
            <Btn onClick={() => { signoff.resolve(stage, 'disputed'); onClose() }}>Mark disputed</Btn>
            <Btn variant="primary" onClick={() => { signoff.resolve(stage, 'signed'); onClose() }}>Mark signed</Btn>
          </>
        ) : (
          <>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" onClick={() => { signoff.request(stage, chosen, channel); onClose() }}>
              Send request
            </Btn>
          </>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {isInitial ? (
          <div style={{ background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 6, padding: '11px 14px', fontSize: 12, color: t.greenText, lineHeight: 1.5 }}>
            <b>Optional — selling is never blocked.</b> This logs a timestamped confirmation of the initial count and the re-ups below.
            {party.requiresInitialSignOff && <> This party is flagged <b>requiresInitialSignOff</b>, so it's expected but still non-blocking.</>}
          </div>
        ) : (
          <div style={{ background: t.redTintBg, border: `1px solid ${t.redTintBorder}`, borderRadius: 6, padding: '11px 14px', fontSize: 12, color: t.redOnTint, lineHeight: 1.5 }}>
            <b>e-signature via the portal.</b> The request lands on {party.name}'s portal page for signature — no in-person screen signing.
          </div>
        )}

        {rec.status !== 'none' && (
          <div style={{ border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '11px 14px', fontSize: 12.5, background: '#fff' }}>
            <b style={{ color: t.heading }}>Status:</b>{' '}
            {rec.status === 'requested' && <span style={{ color: '#8a5d12' }}>⏳ Requested {rec.at} · awaiting {rec.contact?.name}</span>}
            {rec.status === 'signed' && <span style={{ color: t.greenText }}>✓ Signed by {rec.contact?.name} at {rec.at}</span>}
            {rec.status === 'disputed' && <span style={{ color: t.red }}>⚑ Disputed by {rec.contact?.name} at {rec.at}</span>}
          </div>
        )}

        {/* Routing — default contact, their people, or a one-off */}
        <div>
          <div style={label}>ROUTE TO</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {contacts.map((c, i) => {
              const on = !custom && pick === i
              return (
                <div
                  key={c.email}
                  onClick={() => { setPick(i); setCustom(null) }}
                  style={{ border: `1.5px solid ${on ? t.red : t.inputBorder}`, background: on ? t.redTintBg : '#fff', borderRadius: 6, padding: '9px 12px', cursor: 'pointer', fontSize: 12.5 }}
                >
                  <b style={{ color: t.heading }}>{c.name}</b> <span style={{ color: t.muted2 }}>· {c.role}</span>
                  {i === 0 && <span style={{ fontSize: 10, fontWeight: 700, color: t.muted2, border: `1px solid ${t.divider}`, borderRadius: 3, padding: '1px 5px', marginLeft: 6 }}>DEFAULT</span>}
                  <div style={{ color: t.secondary, marginTop: 2 }}>{c.email} · {c.phone}</div>
                </div>
              )
            })}
            <div
              onClick={() => setCustom({ name: 'One-off recipient', role: 'Manual', email: '', phone: '' })}
              style={{ border: `1.5px dashed ${custom ? t.red : t.faint2}`, background: custom ? t.redTintBg : '#fff', borderRadius: 6, padding: '9px 12px', cursor: 'pointer', fontSize: 12.5, color: custom ? t.red : t.muted }}
            >
              + Route to someone else
            </div>
          </div>
          {custom && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input placeholder="Name" value={custom.name === 'One-off recipient' ? '' : custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} style={field} />
              <input placeholder="email@example.com" value={custom.email} onChange={(e) => setCustom({ ...custom, email: e.target.value })} style={field} />
            </div>
          )}
        </div>

        <div>
          <div style={label}>SEND VIA</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['Email', 'Text'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setChannel(c)}
                style={{ flex: 1, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, padding: '9px 0', borderRadius: 6, cursor: 'pointer', border: `1.5px solid ${channel === c ? t.red : t.inputBorder}`, color: channel === c ? t.red : t.secondary2, background: channel === c ? t.redTintBg : '#fff' }}
              >
                {c === 'Email' ? '✉ Email' : '💬 Text'}
              </button>
            ))}
          </div>
        </div>

        {/* What the recipient sees — includes every timestamped re-up */}
        <div style={{ border: `1px solid ${t.cardBorder}`, borderRadius: 6, background: '#fff', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${t.divider}`, fontSize: 12, fontWeight: 700, color: t.heading }}>
            Included in the request
          </div>
          <div style={{ padding: '10px 14px', fontSize: 12, color: t.secondary, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div>Initial count: <b style={{ color: t.heading }}>{totals.initial}</b> units across {skus.length} SKUs</div>
            <div>Re-ups: <b style={{ color: t.greenText2 }}>+{totals.added}</b> units in {reups.length} logged restocks</div>
            <div>Total counted in: <b style={{ color: t.heading }}>{totals.totalIn}</b> units</div>
            {!isInitial && <div>Ending count: <b style={{ color: t.heading }}>{totals.ending}</b> · sold {totals.physicalSold}</div>}
          </div>
          <div style={{ borderTop: `1px solid ${t.divider3}`, maxHeight: 140, overflowY: 'auto' }}>
            {reups.map((r) => {
              const sku = skus.find((s) => s.id === r.skuId)
              const item = items.find((i) => i.id === sku?.itemId)
              return (
                <div key={r.id} style={{ display: 'flex', gap: 10, padding: '7px 14px', fontSize: 11.5, borderBottom: `1px solid ${t.divider3}` }}>
                  <span style={{ color: t.muted2, width: 60 }}>{r.time}</span>
                  <span style={{ fontWeight: 700, color: t.greenText2, width: 32 }}>+{r.qty}</span>
                  <span style={{ flex: 1, color: t.secondary }}>{item?.name} · {sku?.variant}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Drawer>
  )
}
