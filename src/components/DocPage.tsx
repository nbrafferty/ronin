import { type ReactNode } from 'react'
import { tokens as t } from '../lib/tokens'

/**
 * Minimal paged-document shell — a Letter sheet on a gray desk, 0.6in inset.
 * Mirrors the handoff's doc-page.js. In production this maps to the codebase's
 * own print/PDF pipeline; here @media print drops the desk so the sheet prints clean.
 */
export function DocPage({ children, margin = '0.6in' }: { children: ReactNode; margin?: string }) {
  return (
    <div style={{ background: '#e9e9e9', minHeight: '100vh', padding: '24px 0', fontFamily: t.font }} className="docdesk">
      <style>{`
        @media print {
          .docdesk { background: #fff !important; padding: 0 !important; }
          .docsheet { box-shadow: none !important; margin: 0 !important; }
          .docprint-hide { display: none !important; }
          @page { size: letter; margin: 0; }
        }
      `}</style>
      <div className="docprint-hide" style={{ maxWidth: '8.5in', margin: '0 auto 12px', display: 'flex', justifyContent: 'flex-end', padding: '0 8px' }}>
        <button
          onClick={() => window.print()}
          style={{ fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, padding: '8px 16px', border: 'none', borderRadius: 4, background: t.red, color: '#fff', cursor: 'pointer' }}
        >
          ↥ Print / Save PDF
        </button>
      </div>
      <div
        className="docsheet"
        style={{
          width: '8.5in',
          minHeight: '11in',
          boxSizing: 'border-box',
          margin: '0 auto',
          background: '#fff',
          boxShadow: '0 1px 6px rgba(0,0,0,.15)',
          padding: margin,
        }}
      >
        {children}
      </div>
    </div>
  )
}
