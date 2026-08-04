import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { Btn, EditCell, PageHead, RateModeToggle } from '../components/ui'
import { SignOffDrawer } from '../components/SignOff'
import { tokens as t, money } from '../lib/tokens'
import { eventConfig as cfg, type CustomLine } from '../lib/config'
import { useCounts } from '../lib/counts'
import { partyById, type Contact } from '../lib/parties'
import { useSignOff } from '../lib/signoff'

type Step = 'fees' | 'sign-off' | 'payout'
const order: Step[] = ['fees', 'sign-off', 'payout']

const money2 = (n: number) => '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const party = partyById('black-coyote')

const inlineField: React.CSSProperties = {
  flex: 1,
  padding: '7px 10px',
  border: `1px solid ${t.inputBorder}`,
  borderRadius: 4,
  fontSize: 12.5,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  minWidth: 0,
}

function Chip({ state, mark, label, sub }: { state: 'done' | 'active' | 'upcoming'; mark: string; label: string; sub: string }) {
  const style =
    state === 'done'
      ? { bg: '#1a1a1a', color: '#fff', border: '#1a1a1a', labelColor: t.heading }
      : state === 'active'
        ? { bg: t.red, color: '#fff', border: t.red, labelColor: t.heading }
        : { bg: '#fff', color: t.muted2, border: t.faint2, labelColor: t.muted }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: style.bg,
          color: style.color,
          fontSize: state === 'done' ? 11 : 11.5,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1.5px solid ${style.border}`,
        }}
      >
        {mark}
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.3 }}>
        <b style={{ color: style.labelColor }}>{label}</b>
        <br />
        <span style={{ color: t.muted2 }}>{sub}</span>
      </div>
    </div>
  )
}

const connector = <div style={{ flex: 1, height: 1.5, background: '#e0e0e0', margin: '0 16px' }} />

export default function Settlement() {
  const nav = useNavigate()
  const { totals: countsTotals, flagged } = useCounts()
  const signoff = useSignOff()
  const [signOffOpen, setSignOffOpen] = useState(false)
  const [step, setStep] = useState<Step>('fees')
  const [method, setMethod] = useState<'Stripe ACH' | 'Check'>('Stripe ACH')
  // Custom settlement lines — either direction (deposit returns / buybacks add; shipping deducts).
  const [customs, setCustoms] = useState<CustomLine[]>([
    { id: 1, label: 'Shipping (return freight)', mode: '$', value: 140, dir: 'deduct' },
    { id: 2, label: 'Booth deposit returned', mode: '$', value: 250, dir: 'add' },
  ])
  // Pause/queue the payout to a configurable release date.
  const [queued, setQueued] = useState(false)
  const [releaseDate, setReleaseDate] = useState('2026-05-20')
  // Settlement contact pre-populated from the vendor object, editable on this screen.
  const [contact, setContact] = useState<Contact>(party.contact)
  const [editContact, setEditContact] = useState(false)
  // Destination banking, editable before firing so we always know where money lands.
  const [bank, setBank] = useState({ account: 'Black Coyote LLC', last4: '6712', routing: '021000021' })
  const [editBank, setEditBank] = useState(false)

  const num = (v: string) => (v === '' || isNaN(Number(v)) ? 0 : Number(v))
  const idx = order.indexOf(step)

  // Pre-event fee rates are LOCKED (contracted, from Configurations) — read-only here.
  const { salesTaxPct: taxRate, creditCardPct: ccRate, concessionairePct: concRate } = cfg.fees

  // Gross comes from the reconciled physical counts — the source of truth for settlement.
  const GROSS = countsTotals.physicalGross
  const CREDIT = GROSS * 0.927 // credit/cash split held at the observed ratio for the demo
  const CASH = GROSS - CREDIT

  // Live settlement math — inclusive sales tax, CC fee on credit receipts, concessionaire off the top.
  const taxAmt = (GROSS * (taxRate / 100)) / (1 + taxRate / 100)
  const ccAmt = CREDIT * (ccRate / 100)
  const concAmt = GROSS * (concRate / 100)
  const customAmt = (c: CustomLine) => (c.mode === '%' ? (GROSS * c.value) / 100 : c.value)
  const signed = (c: CustomLine) => (c.dir === 'add' ? customAmt(c) : -customAmt(c))
  const customTotal = customs.reduce((a, c) => a + signed(c), 0)
  const adjGross = GROSS - taxAmt - ccAmt - concAmt + customTotal
  const dueArtist = adjGross * (cfg.defaultSplit.vendor / 100)
  const venueCut = adjGross * (cfg.defaultSplit.venue / 100)
  const dueVenue = venueCut + taxAmt
  const methodNote = method === 'Check' ? 'mailed within 7 days' : 'lands next business day'

  // Stripe funds take ~2 days to settle into the festival account before we can transfer out.
  const payoutDate = useMemo(() => {
    const d = new Date('2026-05-16T00:00:00')
    d.setDate(d.getDate() + 2)
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
  }, [])

  const setCustom = (id: number, patch: Partial<CustomLine>) => setCustoms((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  const addCustom = () => setCustoms((cs) => [...cs, { id: (cs.at(-1)?.id ?? 0) + 1, label: 'New line', mode: '$', value: 0, dir: 'deduct' }])
  const removeCustom = (id: number) => setCustoms((cs) => cs.filter((c) => c.id !== id))
  const lockChip = (rate: string) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: t.rowBg, border: `1px solid ${t.cardBorder}`, borderRadius: 3, padding: '3px 8px', fontWeight: 600, color: t.secondary }}>
      {rate} <span style={{ fontSize: 9.5, color: t.faint }}>🔒</span>
    </span>
  )

  const chipState = (i: number): 'done' | 'active' | 'upcoming' => (idx > i ? 'done' : idx === i ? 'active' : 'upcoming')

  const railWidth = 250

  return (
    <AdminLayout active="Settlement">
      <main style={{ padding: '22px 28px 32px', maxWidth: 1180 }}>
        <PageHead
          title="Furnace Fest 2026 — Settlement"
          titleSize={20}
          subtitle={
            <>
              Black Coyote · Saturday, May 16, 2026 · All Booths · Split 80 / 20 <span style={{ color: '#bbbbbb' }}>·</span> locked at advance
            </>
          }
          actions={
            <>
              <Btn>Export</Btn>
              <Link
                to="/settlement-statement"
                style={{ display: 'inline-block', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: '8px 16px', border: `1px solid ${t.faint2}`, borderRadius: 4, background: '#fff', color: t.body2 }}
              >
                Export PDF Statement
              </Link>
            </>
          }
        />

        {/* Unresolved variances block a clean settlement — counts are the basis */}
        {flagged.length > 0 && (
          <div style={{ background: '#fdf6ec', border: '1px solid #f0dcae', borderRadius: 6, padding: '10px 16px', fontSize: 12.5, color: '#8a5d12', marginBottom: 14 }}>
            <b>{flagged.length} SKU{flagged.length === 1 ? '' : 's'} still show a count variance.</b> Gross below is drawn from physical counts —{' '}
            <a onClick={() => nav('/reconciliation')} style={{ cursor: 'pointer' }}>resolve on the Reconciliation page →</a>
          </div>
        )}

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '14px 20px', marginBottom: 18 }}>
          <Chip state="done" mark="✓" label="Counts" sub={`${countsTotals.totalIn.toLocaleString()} in · ${countsTotals.ending.toLocaleString()} out`} />
          {connector}
          <Chip
            state={flagged.length ? 'active' : 'done'}
            mark={flagged.length ? '!' : '✓'}
            label="Reconcile"
            sub={flagged.length ? `${flagged.length} variance${flagged.length === 1 ? '' : 's'} open` : 'all variances resolved'}
          />
          {connector}
          <Chip state={chipState(0)} mark={chipState(0) === 'done' ? '✓' : '3'} label="Fees & taxes" sub="rates from Configurations" />
          {connector}
          <Chip state={chipState(1)} mark={chipState(1) === 'done' ? '✓' : '4'} label="Vendor sign-off" sub="certify & lock" />
          {connector}
          <Chip state={chipState(2)} mark={chipState(2) === 'done' ? '✓' : '5'} label="Payout" sub="Stripe / ACH" />
        </div>

        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* STEP 3 — Fees & taxes */}
            {step === 'fees' && (
              <>
                <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${t.divider}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.heading }}>Fees &amp; deductions</div>
                    <div style={{ fontSize: 11, color: t.muted2 }}>
                      🔒 contracted rates locked · from <Link to="/configurations">Configurations</Link>
                    </div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        {['LINE', 'BASIS', 'RATE', 'AMOUNT'].map((h, i) => (
                          <th
                            key={h}
                            style={{
                              textAlign: i >= 2 ? 'right' : 'left',
                              padding: i === 0 ? '10px 18px' : i === 3 ? '10px 18px' : '10px 12px',
                              fontSize: 11,
                              fontWeight: 600,
                              color: t.muted,
                              borderBottom: '1px solid #eeeeee',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '11px 18px', borderBottom: `1px solid ${t.divider2}`, fontWeight: 600, color: t.heading }}>Gross sales</td>
                        <td style={{ padding: '11px 12px', borderBottom: `1px solid ${t.divider2}`, color: t.muted }}>from counts · {money(CREDIT)} credit / {money(CASH)} cash</td>
                        <td style={{ padding: '11px 12px', borderBottom: `1px solid ${t.divider2}` }} />
                        <td style={{ padding: '11px 18px', borderBottom: `1px solid ${t.divider2}`, textAlign: 'right', fontWeight: 700, color: t.heading }}>{money2(GROSS)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '11px 18px', borderBottom: `1px solid ${t.divider2}`, color: t.body2 }}>Sales tax <span style={{ color: t.faint }}>(inclusive)</span></td>
                        <td style={{ padding: '11px 12px', borderBottom: `1px solid ${t.divider2}`, color: t.muted }}>gross sales</td>
                        <td style={{ padding: '11px 12px', borderBottom: `1px solid ${t.divider2}`, textAlign: 'right' }}>{lockChip(`${taxRate.toFixed(2)}%`)}</td>
                        <td style={{ padding: '11px 18px', borderBottom: `1px solid ${t.divider2}`, textAlign: 'right', color: t.secondary }}>−{money2(taxAmt)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '11px 18px', borderBottom: `1px solid ${t.divider2}`, color: t.body2 }}>Credit card fee</td>
                        <td style={{ padding: '11px 12px', borderBottom: `1px solid ${t.divider2}`, color: t.muted }}>credit receipts {money(CREDIT)}</td>
                        <td style={{ padding: '11px 12px', borderBottom: `1px solid ${t.divider2}`, textAlign: 'right' }}>{lockChip(`${ccRate.toFixed(2)}%`)}</td>
                        <td style={{ padding: '11px 18px', borderBottom: `1px solid ${t.divider2}`, textAlign: 'right', color: t.secondary }}>−{money2(ccAmt)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '11px 18px', borderBottom: `1px solid ${t.divider2}`, color: t.body2 }}>Concessionaire</td>
                        <td style={{ padding: '11px 12px', borderBottom: `1px solid ${t.divider2}`, color: t.muted }}>off top</td>
                        <td style={{ padding: '11px 12px', borderBottom: `1px solid ${t.divider2}`, textAlign: 'right' }}>{lockChip(`${concRate.toFixed(2)}%`)}</td>
                        <td style={{ padding: '11px 18px', borderBottom: `1px solid ${t.divider2}`, textAlign: 'right', color: t.secondary }}>−{money2(concAmt)}</td>
                      </tr>

                      {/* Custom lines — deduct or add, flat $ or % */}
                      {customs.map((c) => {
                        const adds = c.dir === 'add'
                        return (
                          <tr key={c.id}>
                            <td style={{ padding: '7px 18px', borderBottom: `1px solid ${t.divider2}` }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <button onClick={() => removeCustom(c.id)} title="Remove" style={{ fontFamily: 'inherit', border: 'none', background: 'none', color: t.faint, cursor: 'pointer', fontSize: 13, padding: 0 }}>✕</button>
                                <EditCell value={c.label} align="left" minWidth={150} onChange={(v) => setCustom(c.id, { label: v })} />
                              </span>
                            </td>
                            <td style={{ padding: '7px 12px', borderBottom: `1px solid ${t.divider2}` }}>
                              {/* +/- direction: additions cover deposit returns and product buybacks */}
                              <span style={{ display: 'inline-flex', border: `1.5px solid ${t.inputBorder}`, borderRadius: 4, overflow: 'hidden' }}>
                                {(['deduct', 'add'] as const).map((d, i) => {
                                  const on = c.dir === d
                                  const isAdd = d === 'add'
                                  return (
                                    <button
                                      key={d}
                                      onClick={() => setCustom(c.id, { dir: d })}
                                      title={isAdd ? 'Adds to the payout (deposit return, buyback)' : 'Deducts from the payout'}
                                      style={{
                                        fontFamily: 'inherit', fontSize: 11, fontWeight: 700, padding: '2px 10px', border: 'none',
                                        borderLeft: i ? `1.5px solid ${t.inputBorder}` : undefined, cursor: 'pointer',
                                        color: on ? (isAdd ? t.greenText : t.red) : t.secondary2,
                                        background: on ? (isAdd ? t.greenBg : t.redTintBg) : '#fff',
                                      }}
                                    >
                                      {isAdd ? '+ add' : '− deduct'}
                                    </button>
                                  )
                                })}
                              </span>
                            </td>
                            <td style={{ padding: '7px 12px', borderBottom: `1px solid ${t.divider2}`, textAlign: 'right' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', background: t.editBg, border: `1px solid ${t.editBorder}`, borderRadius: 3, padding: '3px 6px', fontWeight: 600 }}>
                                  {c.mode === '$' ? '$' : ''}<EditCell value={c.mode === '$' ? c.value.toFixed(2) : String(c.value)} type="number" minWidth={40} onChange={(v) => setCustom(c.id, { value: num(v) })} />{c.mode === '%' ? '%' : ''}
                                </span>
                                <RateModeToggle mode={c.mode} onChange={(m) => setCustom(c.id, { mode: m })} />
                              </span>
                            </td>
                            <td style={{ padding: '7px 18px', borderBottom: `1px solid ${t.divider2}`, textAlign: 'right', color: adds ? t.greenText : t.secondary, fontWeight: adds ? 700 : 400 }}>
                              {adds ? '+' : '−'}{money2(customAmt(c))}
                            </td>
                          </tr>
                        )
                      })}
                      <tr>
                        <td colSpan={4} style={{ padding: '8px 18px', borderBottom: `1px solid ${t.divider2}` }}>
                          <button onClick={addCustom} style={{ fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: t.red, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>+ Add custom line</button>
                          <span style={{ fontSize: 11, color: t.muted2, marginLeft: 10 }}>deduct (shipping, staff) or add (deposit return, product buyback) · flat $ or %</span>
                        </td>
                      </tr>

                      <tr>
                        <td style={{ padding: '13px 18px', fontWeight: 700, color: t.heading, background: t.rowBg }}>Adjusted gross</td>
                        <td style={{ padding: '13px 12px', background: t.rowBg }} />
                        <td style={{ padding: '13px 12px', background: t.rowBg }} />
                        <td style={{ padding: '13px 18px', textAlign: 'right', fontWeight: 700, fontSize: 14, color: t.heading, background: t.rowBg }}>{money2(adjGross)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                  <Btn size="lg" style={{ padding: '9px 18px' }}>← Reconcile</Btn>
                  <Btn variant="primary" size="lg" style={{ padding: '9px 22px' }} onClick={() => setStep('sign-off')}>Next: Vendor sign-off →</Btn>
                </div>
              </>
            )}

            {/* STEP 4 — Vendor sign-off */}
            {step === 'sign-off' && (
              <>
                <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '20px 22px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.heading, marginBottom: 12 }}>Vendor sign-off</div>
                  <div style={{ border: '1px solid #eeeeee', borderRadius: 6, padding: '4px 16px', marginBottom: 14, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f3f3f3' }}><span style={{ color: '#666666' }}>Gross sales</span><b>{money2(GROSS)}</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f3f3f3' }}><span style={{ color: '#666666' }}>Adjusted gross</span><b>{money2(adjGross)}</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0' }}><span style={{ color: '#666666' }}>Due to vendor (80% split, locked)</span><b style={{ color: t.red }}>{money2(dueArtist)}</b></div>
                  </div>
                  {/* Settlement contact — pre-populated from the vendor object, editable here */}
                  <div style={{ border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '12px 16px', marginBottom: 14, background: t.rowBg }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: 12.5 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.muted2, marginBottom: 3 }}>SETTLEMENT CONTACT</div>
                        <b style={{ color: t.heading }}>{contact.name}</b> <span style={{ color: t.muted2 }}>· {contact.role}</span>
                        <div style={{ color: t.secondary, marginTop: 2 }}>{contact.email} · {contact.phone}</div>
                      </div>
                      <span style={{ fontSize: 12, color: t.red, fontWeight: 600, cursor: 'pointer' }} onClick={() => setEditContact((v) => !v)}>
                        {editContact ? 'Done' : 'Edit / route elsewhere'}
                      </span>
                    </div>
                    {editContact && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                          {[party.contact, ...party.altContacts].map((c) => (
                            <button
                              key={c.email}
                              onClick={() => setContact(c)}
                              style={{
                                fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, padding: '4px 12px', borderRadius: 999, cursor: 'pointer',
                                border: `1.5px solid ${contact.email === c.email ? t.red : t.inputBorder}`,
                                color: contact.email === c.email ? t.red : t.secondary2,
                                background: contact.email === c.email ? t.redTintBg : '#fff',
                              }}
                            >
                              {c.name} · {c.role}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Name" style={inlineField} />
                          <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="Email" style={inlineField} />
                          <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="Phone" style={{ ...inlineField, width: 150 }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <p style={{ margin: '0 0 16px', fontSize: 11.5, lineHeight: 1.6, color: t.muted }}>
                    By signing, {contact.name} certifies on behalf of {party.name} that they have reviewed the figures above and, to the best of their knowledge, they are correct. In the absence of a formal invoice, this settlement statement serves as the record of monies due in connection with merchandise gross sales at Furnace Fest 2026.
                  </p>

                  {/* e-signature status — signed through the portal, not on this screen */}
                  <div style={{ border: `1.5px solid ${signoff.settlement.status === 'signed' ? t.greenBorder : t.redTintBorder}`, background: signoff.settlement.status === 'signed' ? t.greenBg : t.redTintBg, borderRadius: 6, padding: '14px 16px', marginBottom: 16, fontSize: 12.5, lineHeight: 1.55 }}>
                    {signoff.settlement.status === 'none' && (
                      <><b style={{ color: t.red }}>Not yet sent.</b> The request lands on {party.name}'s portal page for e-signature — no in-person screen signing.</>
                    )}
                    {signoff.settlement.status === 'requested' && (
                      <><b style={{ color: '#8a5d12' }}>⏳ Awaiting e-signature</b> from {signoff.settlement.contact?.name} · sent {signoff.settlement.at} via {signoff.settlement.channel}. Visible on their portal now.</>
                    )}
                    {signoff.settlement.status === 'signed' && (
                      <><b style={{ color: t.greenText }}>✓ Signed by {signoff.settlement.contact?.name}</b> at {signoff.settlement.at}. The countersigned statement is filed under Finalized Settlements in their portal.</>
                    )}
                    {signoff.settlement.status === 'disputed' && (
                      <><b style={{ color: t.red }}>⚑ Disputed by {signoff.settlement.contact?.name}.</b> Resolve on the <Link to="/reconciliation">Reconciliation page</Link>.</>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <Btn size="lg" style={{ flex: 1, padding: '11px 0' }} onClick={() => setSignOffOpen(true)}>
                      {signoff.settlement.status === 'none' ? 'Request e-signature via portal' : 'View / resend request'}
                    </Btn>
                    <Btn variant="primary" size="lg" style={{ flex: 1, padding: '11px 0' }} onClick={() => setStep('payout')}>Mark settled &amp; lock</Btn>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 11.5, color: t.muted2, marginTop: 10 }}>
                    The signed statement attaches to the settlement record — <Link to="/settlement-statement">view the PDF statement</Link>.
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                  <Btn size="lg" style={{ padding: '9px 18px' }} onClick={() => setStep('fees')}>← Fees &amp; taxes</Btn>
                  <Btn variant="primary" size="lg" style={{ padding: '9px 22px' }} onClick={() => setStep('payout')}>Next: Payout →</Btn>
                </div>
              </>
            )}

            {/* STEP 5 — Payout */}
            {step === 'payout' && (
              <>
                <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '20px 22px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.heading, marginBottom: 14 }}>Send payout to Black Coyote</div>
                  <div style={{ border: '1px solid #eeeeee', borderRadius: 6, padding: '4px 16px', marginBottom: 14, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f3f3f3' }}><span style={{ color: '#666666' }}>Adjusted gross</span><b>{money2(adjGross)}</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f3f3f3' }}><span style={{ color: '#666666' }}>Vendor split (80%, locked)</span><b>{money2(dueArtist)}</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0' }}><span style={{ color: '#666666' }}>Venue collected via Ronin POS</span><span style={{ color: t.body2 }}>{money2(GROSS)} — venue owes vendor</span></div>
                  </div>
                  {/* Destination — editable so we always know where the money lands before firing */}
                  <div style={{ border: `1px solid ${t.redTintBorder}`, background: t.redTintBg, borderRadius: 6, padding: '14px 16px', marginBottom: 14, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <b>{method}</b> · {bank.account} ····{bank.last4}
                        <br />
                        <span style={{ fontSize: 12, color: t.redOnTint }}>{methodNote}</span>
                        <div style={{ marginTop: 5, fontSize: 11.5 }}>
                          {party.stripe === 'connected' && <span style={{ color: t.greenText, fontWeight: 700 }}>✓ Stripe connected account linked</span>}
                          {party.stripe === 'invited' && <span style={{ color: '#8a5d12', fontWeight: 700 }}>⏳ Stripe invite sent — awaiting connection</span>}
                          {party.stripe === 'none' && (
                            <span style={{ color: t.red, fontWeight: 700 }}>
                              ⚑ No Stripe account ·{' '}
                              <button style={{ fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, color: t.red, background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
                                Send Stripe invite
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span style={{ fontSize: 12, color: t.red, fontWeight: 600, cursor: 'pointer' }} onClick={() => setMethod((m) => (m === 'Stripe ACH' ? 'Check' : 'Stripe ACH'))}>Change method ▾</span>
                        <span style={{ fontSize: 12, color: t.red, fontWeight: 600, cursor: 'pointer' }} onClick={() => setEditBank((v) => !v)}>{editBank ? 'Done' : 'Edit destination'}</span>
                      </div>
                    </div>
                    {editBank && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <input value={bank.account} onChange={(e) => setBank({ ...bank, account: e.target.value })} placeholder="Account name" style={inlineField} />
                        <input value={bank.routing} onChange={(e) => setBank({ ...bank, routing: e.target.value })} placeholder="Routing" style={{ ...inlineField, width: 120 }} />
                        <input value={bank.last4} onChange={(e) => setBank({ ...bank, last4: e.target.value })} placeholder="Acct ····" style={{ ...inlineField, width: 90 }} />
                      </div>
                    )}
                  </div>

                  {/* Pause / queue payout to a configurable release date */}
                  <div style={{ border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '12px 16px', marginBottom: 16, background: queued ? '#fdf6ec' : '#fff' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: t.body2, cursor: 'pointer' }}>
                      <input type="checkbox" checked={queued} onChange={(e) => setQueued(e.target.checked)} />
                      <b>Pause &amp; queue this payout</b> until a release date
                    </label>
                    {queued && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, fontSize: 12.5, color: t.secondary }}>
                        Release on
                        <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} style={{ fontFamily: 'inherit', fontSize: 12.5, padding: '5px 8px', border: `1px solid ${t.inputBorder}`, borderRadius: 4 }} />
                        <span style={{ fontSize: 11.5, color: '#8a5d12' }}>— held in the queue; auto-releases on this date.</span>
                      </div>
                    )}
                  </div>

                  {/* Stripe funds settle into the festival account first — transfer fires on a 2-day delay */}
                  <div style={{ border: `1px solid ${t.cardBorder}`, background: t.rowBg, borderRadius: 6, padding: '11px 14px', marginBottom: 14, fontSize: 12, color: t.secondary, lineHeight: 1.5 }}>
                    <b style={{ color: t.heading }}>Scheduled transfer: {queued ? new Date(releaseDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : payoutDate}</b>
                    <br />
                    Card funds take ~2 days to settle into the festival account, so the transfer fires on a 2-day delay
                    {queued && ' (or your chosen release date, whichever is later)'}.
                  </div>

                  <Btn variant="primary" block style={{ fontSize: 14.5, padding: '13px 0' }}>{queued ? `Queue payout — ${money2(dueArtist)}` : `Send payout — ${money2(dueArtist)}`}</Btn>
                  <div style={{ textAlign: 'center', fontSize: 11.5, color: t.muted2, marginTop: 10 }}>
                    Fires {queued ? 'on the release date' : payoutDate} · a settlement statement is emailed to {contact.name} automatically.
                  </div>
                </div>

                {/* Money buckets — where the revenue actually sits and settles out */}
                <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '14px 18px', marginTop: 12 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: t.heading, marginBottom: 4 }}>Money buckets</div>
                  <div style={{ fontSize: 11.5, color: t.muted2, marginBottom: 10 }}>All revenue lands in the general merch bucket, then settles out.</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[
                      { l: 'ARTIST / VENDOR', v: money2(dueArtist), note: `${cfg.defaultSplit.vendor}% split`, accent: true },
                      { l: 'FESTIVAL', v: money2(dueVenue), note: `${cfg.defaultSplit.venue}% cut + tax retained` },
                      { l: 'VENDOR MANAGER', v: money2(0), note: 'net after settle-out' },
                    ].map((b) => (
                      <div key={b.l} style={{ flex: 1, border: `1px solid ${t.cardBorder}`, borderLeft: b.accent ? `3px solid ${t.red}` : `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '10px 12px' }}>
                        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: t.muted2 }}>{b.l}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: t.heading, marginTop: 2 }}>{b.v}</div>
                        <div style={{ fontSize: 10.5, color: t.muted2, marginTop: 1 }}>{b.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: t.redTintBg, border: `1px solid ${t.redTintBorder}`, borderRadius: 6, padding: '12px 16px', marginTop: 12, fontSize: 12, color: t.redOnTint, lineHeight: 1.5 }}>
                  <b style={{ color: t.red }}>Flagship: fast, clear payouts.</b> Statements auto-email to the vendor / their merch company (e.g. Bravado) — next business day vs 30–45 days with legacy merch companies. This summary compiles Ronin's vendor payout worksheet line items (detailed builder to mirror Jeff's worksheet).
                </div>
                <div style={{ marginTop: 16 }}>
                  <Btn size="lg" style={{ padding: '9px 18px' }} onClick={() => setStep('sign-off')}>← Vendor sign-off</Btn>
                </div>
              </>
            )}
          </div>

          {/* Sticky right rail */}
          <div style={{ width: railWidth, flex: 'none', display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 20 }}>
            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderLeft: `3px solid ${t.red}`, borderRadius: 6, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.muted2 }}>DUE VENDOR</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: t.heading, margin: '3px 0 2px' }}>{money2(dueArtist)}</div>
              <div style={{ fontSize: 11.5, color: t.muted }}>80% of adjusted gross · split locked at advance</div>
            </div>
            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.muted2 }}>DUE VENUE</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: t.heading, margin: '3px 0 2px' }}>{money2(dueVenue)}</div>
              <div style={{ fontSize: 11.5, color: t.muted }}>20% cut {money2(venueCut)} + tax retained {money2(taxAmt)}</div>
            </div>
            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '14px 16px', fontSize: 12, color: t.secondary, lineHeight: 1.5 }}>
              <b style={{ color: t.heading }}>Venue collected {money(GROSS)}</b> via Ronin POS — funds are already in the system, so the venue owes the vendor. No check to follow.
            </div>
            <div style={{ background: t.redTintBg, border: `1px solid ${t.redTintBorder}`, borderRadius: 6, padding: '14px 16px', fontSize: 12, lineHeight: 1.5 }}>
              <b style={{ color: t.heading }}>{method}</b> <span style={{ color: '#666666' }}>····6712</span>
              <br />
              <span style={{ color: t.red, fontWeight: 600 }}>{methodNote}</span>
              <br />
              <span style={{ color: t.redOnTint }}>vs. 30–45 days with legacy merch companies</span>
            </div>
          </div>
        </div>
      </main>

      <SignOffDrawer stage={signOffOpen ? 'settlement' : null} onClose={() => setSignOffOpen(false)} party={party} />
    </AdminLayout>
  )
}
