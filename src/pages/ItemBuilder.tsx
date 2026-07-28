import { Link } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { Btn, PageHead } from '../components/ui'
import { ItemBuilderForm } from '../components/ItemBuilderForm'
import { tokens as t } from '../lib/tokens'

/**
 * Standalone Item Builder route. In the product this is primarily a slide-out (opened from
 * Counts / Overview via "+ Add Item"); this page hosts the same form for direct reference.
 */
export default function ItemBuilder() {
  return (
    <AdminLayout active="Counts (In/Out)">
      <main style={{ padding: '20px 24px 40px', maxWidth: 620 }}>
        <PageHead
          title="Item Builder"
          breadcrumb={<><Link to="/counts">Counts</Link> / Item Builder</>}
          subtitle="Add or edit a vendor item — name, category, pricing and sizing attributes."
        />
        <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 8, padding: '20px 22px' }}>
          <ItemBuilderForm />
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
