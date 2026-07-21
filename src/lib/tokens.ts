/**
 * Ronin POS — Merchandise module design tokens.
 * Values are taken verbatim from the design handoff (design_handoff_merch_module/README.md).
 * Keeping them centralised lets the eventual .NET vendor-portal build map them onto its own theme.
 */
export const tokens = {
  // Primary red (actions / accent)
  red: '#c8201d',
  redHover: '#8f1512',
  redTintBg: '#fdf3f2',
  redTintBorder: '#f0c9c7',
  redOnTint: '#a04340',

  // Ink
  heading: '#111111',
  body: '#1a1a1a',
  body2: '#333333',
  secondary: '#555555',
  secondary2: '#777777',
  muted: '#888888',
  muted2: '#999999',
  faint: '#aaaaaa',
  faint2: '#cccccc',

  // Surfaces
  pageBg: '#f7f7f7',
  cardBg: '#ffffff',
  rowBg: '#fafafa',
  rowBg2: '#fbfbfb',
  cardBorder: '#e8e8e8',
  divider: '#f0f0f0',
  divider2: '#f2f2f2',
  divider3: '#f4f4f4',
  inputBorder: '#dddddd',

  // Editable cell (inline edit) — yellow = editable, everywhere
  editBg: '#fdf0c2',
  editBorder: '#ecd98a',

  // Success green
  greenText: '#2c6e33',
  greenText2: '#3d8a44',
  greenBg: '#eef7ef',
  greenBorder: '#bcdcc0',

  // Typography
  font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
} as const

/** $12,190 style formatting. */
export const money = (n: number, d = 0): string =>
  '$' + n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })
