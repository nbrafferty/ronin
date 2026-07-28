import { type ReactNode } from 'react'
import { tokens as t } from '../lib/tokens'

/** Right-hand slide-out drawer (Item Builder, sign-off, etc.). */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  width = 520,
  footer,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: ReactNode
  width?: number
  footer?: ReactNode
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, fontFamily: t.font }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(17,17,17,.34)' }} />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width,
          maxWidth: '94vw',
          background: t.pageBg,
          boxShadow: '-4px 0 24px rgba(0,0,0,.16)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'ronin-slidein .18s ease-out',
        }}
      >
        <style>{`@keyframes ronin-slidein{from{transform:translateX(24px);opacity:.4}to{transform:translateX(0);opacity:1}}`}</style>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '16px 20px', background: '#fff', borderBottom: `1px solid ${t.cardBorder}` }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.heading }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: t.muted2, marginTop: 3 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ fontFamily: 'inherit', fontSize: 18, lineHeight: 1, background: 'none', border: 'none', color: t.muted, cursor: 'pointer', padding: 2 }}>
            ✕
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>{children}</div>
        {footer && <div style={{ padding: '14px 20px', background: '#fff', borderTop: `1px solid ${t.cardBorder}`, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>{footer}</div>}
      </div>
    </div>
  )
}

/** Centered modal (Finalize Show reconciliation prompt). */
export function Modal({
  open,
  onClose,
  title,
  width = 560,
  footer,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  width?: number
  footer?: ReactNode
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.font }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(17,17,17,.4)' }} />
      <div style={{ position: 'relative', width, maxWidth: '94vw', maxHeight: '88vh', background: '#fff', borderRadius: 8, boxShadow: '0 12px 40px rgba(0,0,0,.24)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${t.divider}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.heading }}>{title}</div>
          <button onClick={onClose} style={{ fontFamily: 'inherit', fontSize: 18, lineHeight: 1, background: 'none', border: 'none', color: t.muted, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: '18px 20px', overflowY: 'auto' }}>{children}</div>
        {footer && <div style={{ padding: '14px 20px', borderTop: `1px solid ${t.divider}`, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>{footer}</div>}
      </div>
    </div>
  )
}
