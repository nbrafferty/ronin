import { type CSSProperties, type ReactNode } from 'react'
import { tokens as t } from '../lib/tokens'

/** Primary (red filled) / secondary (white bordered) buttons. */
export function Btn({
  children,
  variant = 'secondary',
  onClick,
  style,
  size = 'md',
  block,
}: {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  style?: CSSProperties
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
}) {
  const pad = size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 0' : '8px 16px'
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 13.5 : 12.5
  const base: CSSProperties = {
    fontFamily: 'inherit',
    fontSize,
    fontWeight: variant === 'primary' ? 700 : 600,
    padding: pad,
    borderRadius: 4,
    cursor: 'pointer',
    width: block ? '100%' : undefined,
    display: block ? 'block' : undefined,
    transition: 'background .12s, color .12s',
    ...(variant === 'primary'
      ? { border: 'none', background: t.red, color: '#fff' }
      : { border: `1px solid ${t.faint2}`, background: t.cardBg, color: t.body2 }),
    ...style,
  }
  return (
    <button
      style={base}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (variant === 'primary') e.currentTarget.style.background = t.redHover
        else e.currentTarget.style.background = t.rowBg
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') e.currentTarget.style.background = t.red
        else e.currentTarget.style.background = t.cardBg
      }}
    >
      {children}
    </button>
  )
}

/** Metric tile — white card; key tiles get a red left border. */
export function MetricTile({
  label,
  value,
  suffix,
  accent,
  icon,
  iconBg,
  iconColor,
  flex = 1,
}: {
  label: string
  value: ReactNode
  suffix?: ReactNode
  accent?: boolean
  icon?: ReactNode
  iconBg?: string
  iconColor?: string
  flex?: number
}) {
  return (
    <div
      style={{
        flex,
        background: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        borderLeft: accent ? `3px solid ${t.red}` : undefined,
        borderRadius: 6,
        padding: icon ? '12px 16px' : '12px 16px',
        display: icon ? 'flex' : undefined,
        alignItems: icon ? 'center' : undefined,
        gap: icon ? 12 : undefined,
      }}
    >
      {icon && (
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 6,
            background: iconBg,
            color: iconColor,
            fontWeight: 800,
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      )}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.muted2 }}>{label}</div>
        <div style={{ fontSize: icon ? 18 : 20, fontWeight: 800, color: t.heading, marginTop: 2 }}>
          {value}
          {suffix && <span style={{ fontSize: 11, fontWeight: 600, color: t.muted2, marginLeft: 4 }}>{suffix}</span>}
        </div>
      </div>
    </div>
  )
}

export type StatusKind = 'settled' | 'ready' | 'counting' | 'notin'

const statusStyles: Record<StatusKind, { label: string; bg: string; color: string; border: string }> = {
  settled: { label: 'Settled ✓', bg: t.greenBg, color: t.greenText, border: t.greenBorder },
  ready: { label: 'Ready to settle', bg: t.redTintBg, color: t.red, border: t.redTintBorder },
  counting: { label: 'Counting…', bg: '#f5f5f5', color: '#666666', border: '#e0e0e0' },
  notin: { label: 'Not counted in', bg: '#ffffff', color: t.muted2, border: t.inputBorder },
}

export function StatusPill({ kind, label }: { kind: StatusKind; label?: string }) {
  const s = statusStyles[kind]
  return (
    <span
      style={{
        display: 'inline-block',
        borderRadius: 999,
        padding: '3px 10px',
        fontSize: 11,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {label ?? s.label}
    </span>
  )
}

/**
 * Yellow inline-editable cell. Renders a numeric/text input styled identically to the
 * design's static yellow spans; recomputes happen in the parent via `onChange`.
 */
export function EditCell({
  value,
  onChange,
  width,
  minWidth = 26,
  align = 'right',
  prefix,
  type = 'text',
  disabled,
}: {
  value: string | number
  onChange?: (v: string) => void
  width?: number
  minWidth?: number
  align?: 'left' | 'right' | 'center'
  prefix?: string
  type?: 'text' | 'number'
  disabled?: boolean
}) {
  const display = prefix ? `${prefix}${value}` : String(value)
  return (
    <input
      value={display}
      onChange={(e) => onChange?.(prefix ? e.target.value.replace(prefix, '') : e.target.value)}
      inputMode={type === 'number' ? 'decimal' : undefined}
      disabled={disabled}
      // Size the field to its content (like the design's static chips) unless a fixed width is given.
      size={width ? undefined : Math.max(2, display.length)}
      style={{
        display: 'inline-block',
        minWidth,
        width,
        boxSizing: 'content-box',
        background: t.editBg,
        border: `1px solid ${t.editBorder}`,
        borderRadius: 3,
        padding: '2px 7px',
        fontWeight: 600,
        fontFamily: 'inherit',
        fontSize: 'inherit',
        color: 'inherit',
        textAlign: align,
        outline: 'none',
      }}
    />
  )
}

/** Legend: a small yellow chip + "editable" label. */
export function EditLegend({ text = 'editable' }: { text?: string }) {
  return (
    <div style={{ fontSize: 11, color: t.muted2 }}>
      <span
        style={{
          display: 'inline-block',
          width: 10,
          height: 10,
          background: t.editBg,
          border: `1px solid ${t.editBorder}`,
          borderRadius: 2,
          verticalAlign: -1,
        }}
      />{' '}
      {text}
    </div>
  )
}

/**
 * Margin-health indicator — 🟢 ≥50%, 🟡 40–49.9%, 🔴 <40%.
 * Used as a guide for less-experienced users (per the update spec).
 */
export function marginHealth(pct: number): { dot: string; color: string; bg: string; label: string } {
  if (pct >= 50) return { dot: '#3d8a44', color: t.greenText, bg: t.greenBg, label: 'healthy' }
  if (pct >= 40) return { dot: '#c98a1e', color: '#8a5d12', bg: '#fdf6ec', label: 'watch' }
  return { dot: t.red, color: t.red, bg: '#fdecea', label: 'low' }
}

export function HealthDot({ pct }: { pct: number }) {
  const h = marginHealth(pct)
  return <span title={`${h.label} margin`} style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: h.dot, verticalAlign: 0 }} />
}

/** Flat-rate / percentage toggle for custom deduction rows. */
export function RateModeToggle({ mode, onChange }: { mode: '%' | '$'; onChange: (m: '%' | '$') => void }) {
  return (
    <div style={{ display: 'inline-flex', border: `1.5px solid ${t.inputBorder}`, borderRadius: 4, overflow: 'hidden' }}>
      {(['%', '$'] as const).map((m, i) => {
        const on = mode === m
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            style={{
              fontFamily: 'inherit',
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 9px',
              border: 'none',
              borderLeft: i > 0 ? `1.5px solid ${t.inputBorder}` : undefined,
              cursor: 'pointer',
              color: on ? t.red : t.secondary2,
              background: on ? t.redTintBg : '#fff',
            }}
          >
            {m === '%' ? '%' : 'flat $'}
          </button>
        )
      })}
    </div>
  )
}

/** Page header row: title + subtitle on the left, actions on the right. */
export function PageHead({
  title,
  subtitle,
  breadcrumb,
  actions,
  titleSize = 19,
}: {
  title: string
  subtitle?: ReactNode
  breadcrumb?: ReactNode
  actions?: ReactNode
  titleSize?: number
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
      <div>
        {breadcrumb && <div style={{ fontSize: 11.5, color: t.muted2, marginBottom: 4 }}>{breadcrumb}</div>}
        <h1 style={{ margin: 0, fontSize: titleSize, fontWeight: 700, color: t.heading }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 12.5, color: t.secondary2, marginTop: 5 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  )
}
