import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { Btn, PageHead } from '../components/ui'
import { ItemBuilderForm } from '../components/ItemBuilderForm'
import { tokens as t } from '../lib/tokens'
import { kindConfig } from '../lib/catalog'
import type { PartyKind } from '../lib/parties'

/**
 * Standalone Item Builder route. In the product this is primarily a slide-out (opened from
 * Counts / Overview via "+ Add Item"); this page hosts the same form for direct reference.
 */
export default function ItemBuilder() {
  const [kind, setKind] = useState<PartyKind>('artist')
  return (
    <AdminLayout active="Counts (In/Out)">
      <main style={{ padding: '20px 24px 40px', maxWidth: 620 }}>
        <PageHead
          title="Item Builder"
          breadcrumb={<><Link to="/counts">Counts</Link> / Item Builder</>}
          subtitle="Add or edit an item — name, category, pricing and attributes. The catalog differs by experience."
        />
        {/* Merchandise and Vendor catalogs never overlap */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', color: t.muted2 }}>CATALOG</span>
          {(['artist', 'vendor'] as const).map((k) => {
            const on = kind === k
            return (
              <button
                key={k}
                onClick={() => setKind(k)}
                style={{ fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, padding: '4px 14px', borderRadius: 999, cursor: 'pointer', border: `1.5px solid ${on ? t.red : t.inputBorder}`, color: on ? t.red : t.secondary2, background: on ? t.redTintBg : '#fff' }}
              >
                {k === 'artist' ? 'Merchandise' : 'Craft Vendor'}
              </button>
            )
          })}
          <span style={{ fontSize: 11, color: t.muted2 }}>{kindConfig[kind].countsTitle}</span>
        </div>
        <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 8, padding: '20px 22px' }}>
          <ItemBuilderForm kind={kind} />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <Btn>Cancel</Btn>
          <Btn>Save draft</Btn>
          <Btn variant="primary">Save item →</Btn>
        </div>
      </main>
    </AdminLayout>
  )
}
