import type { PartyKind } from './parties'

/**
 * The Merchandise and Craft-Vendor experiences are the same workflow with different
 * catalogs. Merchandise carries band merch only; Vendors carry everything else
 * (craft, food, beverage, retail). Category lists never overlap.
 */
export type MerchCategory = 'Apparel' | 'Music' | 'Accessories'
export type VendorCategory = 'Craft' | 'Food' | 'Beverage' | 'Retail'
export type Category = MerchCategory | VendorCategory

export const merchCategories: MerchCategory[] = ['Apparel', 'Music', 'Accessories']
export const vendorCategories: VendorCategory[] = ['Craft', 'Food', 'Beverage', 'Retail']

export const categoriesFor = (kind: PartyKind): Category[] =>
  kind === 'artist' ? merchCategories : vendorCategories

/** Per-category variant axis — what a "size" means for this kind of item. */
export const attributeFor: Record<Category, { label: string; noun: string; options: string[] }> = {
  // Merchandise
  Apparel: { label: 'Sizes', noun: 'size', options: ['XS', 'S', 'M', 'L', 'XL', '2XL'] },
  Music: { label: 'Format', noun: 'format', options: ['Vinyl', 'CD', 'Cassette'] },
  Accessories: { label: 'Variant', noun: 'variant', options: ['OS', 'Black', 'Red'] },
  // Craft vendors
  Craft: { label: 'Variant', noun: 'variant', options: ['Small', 'Medium', 'Large', 'OS'] },
  Food: { label: 'Portion', noun: 'portion', options: ['Regular', 'Large', 'Combo'] },
  Beverage: { label: 'Vessel size', noun: 'vessel', options: ['12 oz', '16 oz', '20 oz', '25 oz'] },
  Retail: { label: 'Variant', noun: 'variant', options: ['OS', 'Small', 'Large'] },
}

/**
 * Wording and behaviour that differ between the two experiences.
 * Everything else — counts, re-ups, reconciliation, settlement — is shared.
 */
export interface KindConfig {
  /** page + nav wording */
  noun: string
  nounPlural: string
  countsTitle: string
  addLabel: string
  /** column headers that carry different meaning per kind */
  compLabel: string
  compHint: string
  shrinkLabel: string
  shrinkHint: string
  /** unsold stock: merch ships home, food is written off */
  returnsStock: boolean
  endingHint: string
  reupHint: string
  /** portal chrome */
  portalName: string
}

export const kindConfig: Record<PartyKind, KindConfig> = {
  artist: {
    noun: 'artist',
    nounPlural: 'Artists',
    countsTitle: 'Merchandise Counts',
    addLabel: 'Add Artist',
    compLabel: 'COMP',
    compHint: 'Comp = giveaways / guest list',
    shrinkLabel: 'SHRINK',
    shrinkHint: 'Shrink = damaged / lost',
    returnsStock: true,
    endingHint: 'unsold stock ships home',
    reupHint: 'flash prints, merch off the bus',
    portalName: 'ARTIST PORTAL',
  },
  vendor: {
    noun: 'vendor',
    nounPlural: 'Vendors',
    countsTitle: 'Vendor Counts',
    addLabel: 'Add Vendor',
    compLabel: 'COMP',
    compHint: 'Comp = samples / staff',
    shrinkLabel: 'WASTE',
    shrinkHint: 'Waste = spoilage / breakage',
    returnsStock: true,
    endingHint: 'unsold stock packs out',
    reupHint: 'restock from the van or trailer',
    portalName: 'VENDOR PORTAL',
  },
}

/** Food and beverage are consumed on site — nothing ships back. */
export const isConsumable = (c: Category) => c === 'Food' || c === 'Beverage'
