# Ronin POS — Festival Merchandise Module (Demo)

A working front-end demo of a festival merchandise-management module for **Ronin POS**, covering
the full life of a festival merch program:

> **Pre-Event planning → Run-of-Show counts → Settlement + payout**, plus a cross-cutting **Artist
> Portal** and an aggregated **Manager Overview**.

Built for a sales pitch — working UI, **mocked/local data, no backend**. Functional benchmarks:
AtVenu and Square. This demo is the foundation for Ronin's full .NET vendor-portal build; it is
written in React so the components, state model, and pure calc functions map cleanly onto that
stack later.

## Screens

| Route | Screen | Highlights |
|-------|--------|-----------|
| `/overview` | **Manager Overview** | Every artist, one page. Live filter pills + table/cards toggle. |
| `/planning` | **Merch Planning** | Build Sheet (editable, live North Star numbers) + Revenue Projection. |
| `/item-builder` | **Item Builder** | Cost out one item; margin bar recomputes live. `healthy` / `below target` demo toggle. |
| `/counts` | **Merch Counts (In/Out)** | Accordion groups, editable count cells, live rollup, **Finalize Show**. |
| `/settlement` | **Settlement** | The pitch hero — 5-step stepper, live fee math, sticky rail. |
| `/settlement-statement` | **Settlement Statement** | Printable / PDF settlement record (Letter format). |
| `/artist-portal` | **Artist Portal** | Artist-side hero: real-time sales, locked splits, payout visibility. `queued`/`sent`/`landed` toggle. |
| `/` | Demo index | Links to every screen. |

## Interactions

- **Inline editing** — every yellow cell is a live input; totals, margins, rollups and the
  settlement rail recompute on change.
- **Settlement stepper** — linear next/back nav; the right rail persists; rate edits ripple to the
  rail live.
- **Manager Overview** — filter pills filter the row/card set; the view toggle switches table↔cards.
- **Counts** — accordion groups expand/collapse; **Finalize Show** locks the counts and shows the
  confirmation banner.
- **Demo-state toggles** — Item Builder (`marginScenario`) and Artist Portal (`payoutStage`) expose
  the alternate states called out in the design handoff.

## Design fidelity

Colors, typography, spacing and copy follow the handoff's design tokens verbatim
(`src/lib/tokens.ts`). The canonical pitch figures — gross `$12,190`, adjusted gross `$9,882.39`,
due artist `$7,905.91` (80%), due venue `$3,109.59` — are consistent across every screen.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

## Structure

```
src/
  lib/tokens.ts          Design tokens + money() helper
  components/
    AdminLayout.tsx      Sidebar + top bar chrome (196px sidebar, org/event switchers)
    DocPage.tsx          Letter-format print shell for the statement
    ui.tsx               Btn, MetricTile, StatusPill, EditCell, PageHead
  pages/                 One file per screen (see table above)
  App.tsx                Routes
```

Calc logic lives in small **pure functions** (`calc()` in Planning, `calcRow()`/`groupTotals()` in
Counts, the settlement math in Settlement) so it can be lifted straight into the .NET build and
unit-tested independently of the UI.

> Real build note: counts, fee rates, splits and payout status come from the backend; splits and
> deal terms are **locked at advance** and read-only at settlement.
