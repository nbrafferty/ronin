import { useMemo, useState } from 'react'
import { tokens as t } from '../lib/tokens'
import { EditCell, HealthDot, marginHealth } from './ui'

/**
 * Category model — structured so vendor types can expand beyond apparel later
 * (beverage w/ vessel sizes, food, retail), each with its own sizing/attribute set.
 */
type Category = 'Apparel' | 'Music' | 'Beverage' | 'Food' | 'Retail'
const categoryAttrs: Record<Category, { label: string; options: string[]; attrName: string }> = {
  Apparel: { label: 'Sizes', attrName: 'size', options: ['XS', 'S', 'M', 'L', 'XL', '2XL'] },
  Music: { label: 'Format', attrName: 'format', options: ['Vinyl', 'CD', 'Cassette'] },
  Beverage: { label: 'Vessel size', attrName: 'vessel', options: ['12 oz', '16 oz', '20 oz', '25 oz'] },
  Food: { label: 'Portion', attrName: 'portion', options: ['Regular', 'Large'] },
  Retail: { label: 'Variant', attrName: 'variant', options: ['One size', 'Custom'] },
}

const label: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, color: t.muted, marginBottom: 5 }
const inputBox: React.CSSProperties = { border: `1px solid ${t.inputBorder}`, borderRadius: 4, padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }

export function ItemBuilderForm() {
  const [name, setName] = useState('SS Lineup Tee')
  const [cat, setCat] = useState<Category>('Apparel')
  const [attrs, setAttrs] = useState<string[]>(['S', 'M', 'L', 'XL', '2XL'])
  const [retail, setRetail] = useState(35)
  const [blankCost, setBlankCost] = useState(3.2)
  const [printCost, setPrintCost] = useState(3.9)

  const num = (v: string) => (v === '' || isNaN(Number(v)) ? 0 : Number(v))
  const cost = blankCost + printCost
  const net = retail - cost
  const pct = retail > 0 ? (net / retail) * 100 : 0
  const health = useMemo(() => marginHealth(pct), [pct])

  const toggleAttr = (o: string) => setAttrs((a) => (a.includes(o) ? a.filter((x) => x !== o) : [...a, o]))
  const conf = categoryAttrs[cat]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={label}>ITEM NAME *</div>
        <input value={name} onChange={(e) => setName(e.target.value)} style={inputBox} />
      </div>

      <div>
        <div style={label}>CATEGORY</div>
        <div style={{ display: 'flex', border: `1.5px solid ${t.inputBorder}`, borderRadius: 4, overflow: 'hidden', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
          {(Object.keys(categoryAttrs) as Category[]).map((c, i) => {
            const on = cat === c
            return (
              <button
                key={c}
                onClick={() => { setCat(c); setAttrs(categoryAttrs[c].options.slice(0, c === 'Apparel' ? 5 : 1)) }}
                style={{ flex: 1, padding: '7px 0', border: 'none', borderLeft: i > 0 ? `1.5px solid ${t.inputBorder}` : undefined, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, color: on ? t.red : t.secondary2, background: on ? t.redTintBg : '#fff' }}
              >
                {c}
              </button>
            )
          })}
        </div>
        <div style={{ fontSize: 11, color: t.muted2, marginTop: 5 }}>
          Categories expand beyond apparel — each vendor type carries its own attributes (apparel sizes, beverage vessel sizes, food portions…).
        </div>
      </div>

      {/* Category-specific sizing / attribute support */}
      <div>
        <div style={label}>{conf.label.toUpperCase()} · {conf.attrName} attribute</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {conf.options.map((o) => {
            const on = attrs.includes(o)
            return (
              <button
                key={o}
                onClick={() => toggleAttr(o)}
                style={{ fontSize: 11.5, fontWeight: on ? 700 : 600, color: on ? t.red : t.secondary2, border: `1.5px solid ${on ? t.red : t.inputBorder}`, borderRadius: 999, padding: '5px 14px', background: on ? t.redTintBg : '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {o}
              </button>
            )
          })}
        </div>
        <div style={{ fontSize: 11, color: t.muted2, marginTop: 5 }}>{attrs.length} {conf.attrName}{attrs.length === 1 ? '' : 's'} selected — each becomes a countable SKU variant.</div>
      </div>

      {/* Pricing */}
      <div>
        <div style={label}>PRICING</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {([
            { l: 'Retail', val: retail, set: setRetail, dp: 0 },
            { l: 'Blank / unit', val: blankCost, set: setBlankCost, dp: 2 },
            { l: 'Print / unit', val: printCost, set: setPrintCost, dp: 2 },
          ] as const).map((f) => (
            <div key={f.l} style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: t.muted2, marginBottom: 3 }}>{f.l}</div>
              <div style={{ background: t.editBg, border: `1px solid ${t.editBorder}`, borderRadius: 4, padding: '7px 10px', fontWeight: 700, fontSize: 14 }}>
                $<EditCell value={f.dp ? f.val.toFixed(f.dp) : f.val} type="number" minWidth={40} onChange={(v) => f.set(num(v))} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Margin health guide */}
      <div style={{ background: health.bg, border: `1px solid ${t.cardBorder}`, borderLeft: `3px solid ${health.dot}`, borderRadius: 6, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 18 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.muted2 }}>NET / UNIT</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: t.heading, marginTop: 3 }}>${net.toFixed(2)}</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 15, fontWeight: 800, color: health.color }}>
            <HealthDot pct={pct} /> {pct.toFixed(1)}% margin
          </div>
          <div style={{ fontSize: 11, color: health.color, fontWeight: 600, marginTop: 3 }}>
            {pct >= 50 ? 'healthy — clear of the 50% floor' : pct >= 40 ? 'watch — near the 50% floor' : 'low — raise retail or cut costs'}
          </div>
        </div>
      </div>
    </div>
  )
}
