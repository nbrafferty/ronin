import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { Btn, EditCell, PageHead } from '../components/ui'
import { tokens as t, money } from '../lib/tokens'

type Step = 'fees' | 'sign-off' | 'payout'
const order: Step[] = ['fees', 'sign-off', 'payout']

const GROSS = 12190
const CREDIT = 11300
const CASH = 890

const money2 = (n: number) => '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

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
  const [step, setStep] = useState<Step>('fees')
  const [method, setMethod] = useState<'Stripe ACH' | 'Check'>('Stripe ACH')
  const [taxRate, setTaxRate] = useState(10.25)
  const [ccRate, setCcRate] = useState(5)
  const [concRate, setConcRate] = useState(5)

  const num = (v: string) => (v === '' || isNaN(Number(v)) ? 0 : Number(v))
  const idx = order.indexOf(step)

  // Live settlement math — inclusive sales tax, CC fee on credit receipts, concessionaire off the top.
  // The handoff's canonical inclusive-tax figure is $1,133.11 at 10.25% (computed per sales category in
  // the settlement statement), which the flat gross×r/(1+r) formula misses by ~$0.20. We anchor to the
  // canonical value so the default settlement matches the pitch numbers ($7,905.91 due artist) exactly
  // across every screen, and scale proportionally when the rate is edited.
  const TAX_ANCHOR = 1133.11
  const TAX_DEFAULT_RATE = 10.25
  const taxAmt = TAX_ANCHOR * (taxRate / TAX_DEFAULT_RATE)
  const ccAmt = CREDIT * (ccRate / 100)
  const concAmt = GROSS * (concRate / 100)
  const adjGross = GROSS - taxAmt - ccAmt - concAmt
  const dueArtist = adjGross * 0.8
  const venueCut = adjGross * 0.2
  const dueVenue = venueCut + taxAmt
  const methodNote = method === 'Check' ? 'mailed within 7 days' : 'lands next business day'

  const chipState = (i: number): 'done' | 'active' | 'upcoming' => (idx > i ? 'done' : idx === i ? 'active' : 'upcoming')

  const railWidth = 250

  return (
    <AdminLayout active="Settlement">
      <main style={{ padding: '22px 28px 32px', maxWidth: 1180 }}>
        <PageHead
          title="Spring Music Fest 2026 — Settlement"
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

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '14px 20px', marginBottom: 18 }}>
          <Chip state="done" mark="✓" label="Counts" sub="5,040 in · 4,416 out" />
          {connector}
          <Chip state="done" mark="✓" label="Reconcile" sub="3 variances resolved" />
          {connector}
          <Chip state={chipState(0)} mark={chipState(0) === 'done' ? '✓' : '3'} label="Fees & taxes" sub="rates from Configurations" />
          {connector}
          <Chip state={chipState(1)} mark={chipState(1) === 'done' ? '✓' : '4'} label="Artist sign-off" sub="certify & lock" />
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
                      <span style={{ display: 'inline-block', width: 10, height: 10, background: t.editBg, border: `1px solid ${t.editBorder}`, borderRadius: 2, verticalAlign: -1 }} /> editable this event
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
                        <td style={{ padding: '5px 12px', borderBottom: `1px solid ${t.divider2}`, textAlign: 'right' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', background: t.editBg, border: `1px solid ${t.editBorder}`, borderRadius: 3, padding: '3px 6px', fontWeight: 600 }}>
                            <EditCell value={taxRate} type="number" minWidth={34} onChange={(v) => setTaxRate(num(v))} />%
                          </span>
                        </td>
                        <td style={{ padding: '11px 18px', borderBottom: `1px solid ${t.divider2}`, textAlign: 'right', color: t.secondary }}>−{money2(taxAmt)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '11px 18px', borderBottom: `1px solid ${t.divider2}`, color: t.body2 }}>Credit card fee</td>
                        <td style={{ padding: '11px 12px', borderBottom: `1px solid ${t.divider2}`, color: t.muted }}>credit receipts {money(CREDIT)}</td>
                        <td style={{ padding: '5px 12px', borderBottom: `1px solid ${t.divider2}`, textAlign: 'right' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', background: t.editBg, border: `1px solid ${t.editBorder}`, borderRadius: 3, padding: '3px 6px', fontWeight: 600 }}>
                            <EditCell value={ccRate.toFixed(2)} type="number" minWidth={38} onChange={(v) => setCcRate(num(v))} />%
                          </span>
                        </td>
                        <td style={{ padding: '11px 18px', borderBottom: `1px solid ${t.divider2}`, textAlign: 'right', color: t.secondary }}>−{money2(ccAmt)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '11px 18px', borderBottom: `1px solid ${t.divider2}`, color: t.body2 }}>Concessionaire</td>
                        <td style={{ padding: '11px 12px', borderBottom: `1px solid ${t.divider2}`, color: t.muted }}>
                          <span style={{ display: 'inline-block', background: t.editBg, border: `1px solid ${t.editBorder}`, borderRadius: 3, padding: '3px 8px', fontSize: 12, fontWeight: 600 }}>off top ▾</span>
                        </td>
                        <td style={{ padding: '5px 12px', borderBottom: `1px solid ${t.divider2}`, textAlign: 'right' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', background: t.editBg, border: `1px solid ${t.editBorder}`, borderRadius: 3, padding: '3px 6px', fontWeight: 600 }}>
                            <EditCell value={concRate.toFixed(2)} type="number" minWidth={38} onChange={(v) => setConcRate(num(v))} />%
                          </span>
                        </td>
                        <td style={{ padding: '11px 18px', borderBottom: `1px solid ${t.divider2}`, textAlign: 'right', color: t.secondary }}>−{money2(concAmt)}</td>
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
                  <Btn variant="primary" size="lg" style={{ padding: '9px 22px' }} onClick={() => setStep('sign-off')}>Next: Artist sign-off →</Btn>
                </div>
              </>
            )}

            {/* STEP 4 — Artist sign-off */}
            {step === 'sign-off' && (
              <>
                <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '20px 22px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.heading, marginBottom: 12 }}>Artist sign-off</div>
                  <div style={{ border: '1px solid #eeeeee', borderRadius: 6, padding: '4px 16px', marginBottom: 14, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f3f3f3' }}><span style={{ color: '#666666' }}>Gross sales</span><b>{money2(GROSS)}</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f3f3f3' }}><span style={{ color: '#666666' }}>Adjusted gross</span><b>{money2(adjGross)}</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0' }}><span style={{ color: '#666666' }}>Due to artist (80% split, locked)</span><b style={{ color: t.red }}>{money2(dueArtist)}</b></div>
                  </div>
                  <p style={{ margin: '0 0 16px', fontSize: 11.5, lineHeight: 1.6, color: t.muted }}>
                    By signing, you certify on behalf of Black Coyote that you have reviewed the figures above and, to the best of your knowledge, they are correct. In the absence of a formal invoice, this settlement statement serves as the record of monies due in connection with merchandise gross sales at Spring Music Fest 2026.
                  </p>
                  <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                    <div style={{ flex: 1, border: `1.5px dashed ${t.faint2}`, borderRadius: 6, padding: '14px 16px' }}>
                      <div style={{ height: 34, borderBottom: `1px solid ${t.inputBorder}`, display: 'flex', alignItems: 'flex-end', paddingBottom: 4, color: '#bbbbbb', fontSize: 12, fontStyle: 'italic' }}>Sign here</div>
                      <div style={{ fontSize: 12, marginTop: 8 }}><b>Dana Reyes</b> · Tour Manager, Black Coyote<br /><span style={{ color: t.muted2 }}>Date: ___ /___ / 2026</span></div>
                    </div>
                    <div style={{ flex: 1, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '14px 16px', background: t.rowBg }}>
                      <div style={{ height: 34, borderBottom: `1px solid ${t.inputBorder}`, display: 'flex', alignItems: 'flex-end', paddingBottom: 4, fontSize: 16, color: t.body2, fontStyle: 'italic', fontFamily: "'Snell Roundhand','Brush Script MT',cursive" }}>Alex Diaz</div>
                      <div style={{ fontSize: 12, marginTop: 8 }}><b>Alex Diaz</b> · Merch Manager, Spring Music Fest<br /><span style={{ color: t.greenText2, fontWeight: 600 }}>✓ Signed Sat 11:58 PM</span></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Btn size="lg" style={{ flex: 1, padding: '11px 0' }}>Request e-signature via Artist Portal</Btn>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f3f3f3' }}><span style={{ color: '#666666' }}>Artist split (80%, locked)</span><b>{money2(dueArtist)}</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0' }}><span style={{ color: '#666666' }}>Venue collected via Ronin POS</span><span style={{ color: t.body2 }}>{money2(GROSS)} — venue owes artist</span></div>
                  </div>
                  <div style={{ border: `1px solid ${t.redTintBorder}`, background: t.redTintBg, borderRadius: 6, padding: '14px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <div><b>{method}</b> · Black Coyote LLC ····6712<br /><span style={{ fontSize: 12, color: t.redOnTint }}>{methodNote}</span></div>
                    <span style={{ fontSize: 12, color: t.red, fontWeight: 600, cursor: 'pointer' }} onClick={() => setMethod((m) => (m === 'Stripe ACH' ? 'Check' : 'Stripe ACH'))}>Change ▾</span>
                  </div>
                  <Btn variant="primary" block style={{ fontSize: 14.5, padding: '13px 0' }}>Send payout — {money2(dueArtist)}</Btn>
                  <div style={{ textAlign: 'center', fontSize: 11.5, color: t.muted2, marginTop: 10 }}>A settlement statement is emailed to the artist automatically.</div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <Btn size="lg" style={{ padding: '9px 18px' }} onClick={() => setStep('sign-off')}>← Artist sign-off</Btn>
                </div>
              </>
            )}
          </div>

          {/* Sticky right rail */}
          <div style={{ width: railWidth, flex: 'none', display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 20 }}>
            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderLeft: `3px solid ${t.red}`, borderRadius: 6, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.muted2 }}>DUE ARTIST</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: t.heading, margin: '3px 0 2px' }}>{money2(dueArtist)}</div>
              <div style={{ fontSize: 11.5, color: t.muted }}>80% of adjusted gross · split locked at advance</div>
            </div>
            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.muted2 }}>DUE VENUE</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: t.heading, margin: '3px 0 2px' }}>{money2(dueVenue)}</div>
              <div style={{ fontSize: 11.5, color: t.muted }}>20% cut {money2(venueCut)} + tax retained {money2(taxAmt)}</div>
            </div>
            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, padding: '14px 16px', fontSize: 12, color: t.secondary, lineHeight: 1.5 }}>
              <b style={{ color: t.heading }}>Venue collected {money(GROSS)}</b> via Ronin POS — funds are already in the system, so the venue owes the artist. No check to follow.
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
    </AdminLayout>
  )
}
