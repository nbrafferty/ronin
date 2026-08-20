# Craft / Food Vendor Gap Audit
**Source:** 2026-08-04 review, task 10 — flows reviewed as a craft/food vendor manager
**Date:** 2026-08-20

The build is merch-first by history. The craft experience shares the count → reconcile → settle
spine (deliberately — one workflow, two catalogs), but several assumptions bake in "band merch"
thinking. This is the gap list, split into what was fixed in this pass vs. what needs product/
engineering decisions in the real build.

---

## Fixed in this pass (parity fixes shipped)

| # | Gap | Fix |
|---|-----|-----|
| 1 | Portal notification for settlement sign-off only surfaced for artists | Bell + banner + "Awaiting signature from {name}" pending state now render off `party.kind`-neutral state — verified for both vendor types |
| 2 | Advance readiness treated all parties identically | Craft/food vendors get an extra **Permits & insurance on file** readiness item (health permit, CoI) — merch artists don't need it |
| 3 | Shipping tab assumed everything ships home | Food/beverage stock is excluded from return shipments and counted as waste; all-consumable vendors (Smokestack BBQ) get a "Nothing to ship — pack-out is a booth breakdown" state instead of label generation |
| 4 | "Shrink" wording is merch jargon | Craft/food book uses **WASTE** (spoilage/breakage) with matching hints, via `kindConfig` |
| 5 | Box calc / labels irrelevant for consumables | Box computation runs on shippable units only, so a food vendor's label count is never inflated by unsold portions |
| 6 | One-signer rule ambiguous for vendors | "One signer per vendor is sufficient" noted on portal signing card and Configurations sign-off table, both kinds |

## Open gaps (documented, not built — need product decisions)

### G1 — Gross-sales / percentage-based settlement mode ⭐ biggest
Craft and food vendors often have **no SKU-level inventory** at all: a food truck doesn't count in
140 sandwiches. What matters is **gross sales × percentage rent** (or flat booth fee + %).
- Needed: a per-party settlement mode — `unit-reconciled` (current) vs `gross-based`.
- In gross mode the settlement statement starts from POS gross (or self-reported gross), skips the
  physical-count variance machinery, and applies booth fee / % rent / deductions.
- The custom +/− settlement lines already cover flat booth fees; the mode switch is the missing piece.

### G2 — Reconciliation without unit counts
For gross-mode vendors, reconciliation should compare **POS gross vs. self-reported / Z-report gross**,
not units. The resolution levers (recount, POS error, charge/waive) translate, but operate on dollars.
Current reconciliation page would show a craft vendor a wall of unit columns they never counted.

### G3 — Booth fee / flat-rent representation
Craft rows often pay `flat fee + % of gross over a threshold`. Today the split is a single `splitPct`.
Needed on the party record: `boothFee`, `pctOfGross`, optional `threshold` — flowing into settlement
as first-class lines rather than manually-added custom lines each event.

### G4 — Multi-day stall inventory vs. per-day counts
Merch counts reset per show day. A craft vendor at a 3-day festival carries the same stock across
days; ending count of day 1 = initial of day 2. Needs a carryover chain (the carryover checkbox
exists on Counts; the chain itself isn't modeled).

### G5 — Documents on the advance
Permits & insurance is now a readiness *check*, but there's no upload slot. Advance needs a documents
section (health permit, CoI, W-9) with expiry dates — expiring CoI should flag the readiness check red.

### G6 — Cash-heavy reporting
Food rows skew cash. The credit-card fee line currently assumes a fixed card share of gross (92.7% in
the demo). Real build needs per-party tender mix from POS so the cc-fee deduction is computed on
actual card receipts per vendor.

### G7 — Terminology sweep
"Merch manager", "count-in", "shipment" language leaks into the craft book in a few captions.
`kindConfig` covers the big labels; a final copy pass should route every user-facing string through it.

## Recommended order for the real build
1. **G1 + G3** (settlement mode + fee model) — unlocks the actual craft business model.
2. **G2** (gross reconciliation) — reuse the lever pattern on dollars.
3. **G5** (documents) — cheap, high compliance value.
4. **G4, G6, G7** — follow-on polish.
