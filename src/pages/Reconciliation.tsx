import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { Btn, PageHead } from '../components/ui'
import { tokens as t, money } from '../lib/tokens'

type Kind = 'variance' | 'shrink'
interface Flag {
  id: number
  item: string
  variant: string
  kind: Kind
  units: number
  price: number
  /** the two binary resolutions; `deduct` reduces the vendor payout by the item value */
  options: [{ label: string; deduct: boolean }, { label: string; deduct: boolean }]
}

const flags: Flag[] = [
  { id: 1, item: 'Black Logo Tee', variant: 'M', kind: 'variance', units: 3, price: 40, options: [{ label: 'Charge vendor', deduct: true }, { label: 'Recount / waive', deduct: false }] },
  { id: 2, item: 'Black Logo Tee', variant: 'L', kind: 'shrink', units: 2, price: 40, options: [{ label: 'Deduct from payout', deduct: true }, { label: 'Festival absorbs', deduct: false }] },
  { id: 3, item: 'Circle Logo Hoodie', variant: 'L', kind: 'variance', units: 1, price: 60, options: [{ label: 'Charge vendor', deduct: true }, { label: 'Recount / waive', deduct: false }] },
  { id: 4, item: 'Red/White Trucker Hat', variant: 'OS', kind: 'shrink', units: 1, price: 18, options: [{ label: 'Deduct from payout', deduct: true }, { label: 'Festival absorbs', deduct: false }] },
]

const BASE_PAYOUT = 7905.91
const kindBadge: Record<Kind, { label: string; bg: string; color: string; border: string }> = {
  variance: { label: 'Variance', bg: '#fdf6ec', color: '#8a5d12', border: '#f0dcae' },
  shrink: { label: 'Damage / shrink', bg: '#fdecea', color: t.red, border: t.redTintBorder },
}

export default function Reconciliation() {
  const nav = useNavigate()
  // resolution per flag: undefined = unresolved, 0/1 = chosen option index
  const [res, setRes] = useState<Record<number, 0 | 1 | undefined>>({})

  const { deductions, resolvedCount } = useMemo(() => {
    let deductions = 0
    let resolvedCount = 0
    for (const f of flags) {
      const choice = res[f.id]
      if (choice === undefined) continue
      resolvedCount++
      if (f.options[choice].deduct) deductions += f.units * f.price
    }
    return { deductions, resolvedCount }
  }, [res])

  const adjusted = BASE_PAYOUT - deductions
  const allResolved = resolvedCount === flags.length

  return (
    <AdminLayout active="Reconciliation">
      <main style={{ padding: '20px 24px 32px', maxWidth: 1120 }}>
        <PageHead
          title="Reconciliation — Black Coyote"
          subtitle="Spring Music Fest 2026 · resolve variances and damages · payout updates in real time"
          actions={<Btn onClick={() => nav('/settlement')} variant="primary">Continue to Settlement →</Btn>}
        />

        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          {/* Flags */}
          <div style={{ flex: 1, minWidth: 0, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${t.divider}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.heading }}>Flagged items <span style={{ fontWeight: 500, color: t.muted2, fontSize: 11.5, marginLeft: 6 }}>{resolvedCount} of {flags.length} resolved</span></div>
              <div style={{ fontSize: 11, color: t.muted2 }}>pick one option per row</div>
            </div>
            {flags.map((f, i) => {
              const badge = kindBadge[f.kind]
              const choice = res[f.id]
              const value = f.units * f.price
              return (
                <div key={f.id} style={{ padding: '14px 18px', borderBottom: i < flags.length - 1 ? `1px solid ${t.divider3}` : 'none', background: choice === undefined ? undefined : '#fcfdfc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.heading }}>{f.item}</span>
                      <span style={{ fontSize: 12, color: t.muted2 }}> · {f.variant}</span>
                      <span style={{ display: 'inline-block', marginLeft: 8, fontSize: 10.5, fontWeight: 700, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, borderRadius: 999, padding: '1px 8px' }}>{badge.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: t.secondary }}>{f.units} unit{f.units === 1 ? '' : 's'} · {money(value)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    {f.options.map((o, oi) => {
                      const on = choice === oi
                      return (
                        <button
                          key={oi}
                          onClick={() => setRes((r) => ({ ...r, [f.id]: on ? undefined : (oi as 0 | 1) }))}
                          style={{
                            fontFamily: 'inherit', fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 6, cursor: 'pointer',
                            border: `1.5px solid ${on ? (o.deduct ? t.red : t.greenText2) : t.inputBorder}`,
                            color: on ? (o.deduct ? t.red : t.greenText) : t.secondary2,
                            background: on ? (o.deduct ? t.redTintBg : t.greenBg) : '#fff',
                          }}
                        >
                          {on ? '● ' : ''}{o.label}{o.deduct ? ` (−${money(value)})` : ''}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Live payout adjustment */}
          <div style={{ width: 280, flex: 'none', display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 20 }}>
            <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderLeft: `3px solid ${t.red}`, borderRadius: 6, padding: '16px 18px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.muted2 }}>ADJUSTED PAYOUT</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: t.heading, margin: '4px 0 10px' }}>${adjusted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '6px 0', borderTop: `1px solid ${t.divider3}` }}>
                <span style={{ color: '#666666' }}>Base due vendor</span><b>{money(BASE_PAYOUT, 2)}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '6px 0' }}>
                <span style={{ color: '#666666' }}>Reconciliation deductions</span>
                <b style={{ color: deductions ? t.red : t.muted2 }}>{deductions ? '−' + money(deductions, 2) : '$0.00'}</b>
              </div>
            </div>
            <div style={{ background: allResolved ? t.greenBg : '#fdf6ec', border: `1px solid ${allResolved ? t.greenBorder : '#f0dcae'}`, borderRadius: 6, padding: '12px 14px', fontSize: 12, color: allResolved ? t.greenText : '#8a5d12', lineHeight: 1.5 }}>
              {allResolved ? <><b>✓ All items resolved.</b> The adjusted payout carries into settlement.</> : <><b>{flags.length - resolvedCount} item{flags.length - resolvedCount === 1 ? '' : 's'} left.</b> Resolve each variance and damage to lock the payout.</>}
            </div>
            <Btn variant="primary" size="lg" onClick={() => nav('/settlement')} style={{ opacity: allResolved ? 1 : 0.6 }}>Continue to Settlement →</Btn>
            <div style={{ fontSize: 11, color: t.muted2, textAlign: 'center', lineHeight: 1.5 }}>Deductions apply to the vendor's share; “absorbs / waive” leaves the payout unchanged.</div>
          </div>
        </div>
      </main>
    </AdminLayout>
  )
}
