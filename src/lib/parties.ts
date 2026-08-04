/**
 * Vendor / Artist objects — the "vendor object" the update spec refers to.
 * A party is either an `artist` (band merch) or a `vendor` (craft, food, concessionaire).
 * The sign-off flags drive the flow when a party is brought into a show.
 */
export type PartyKind = 'artist' | 'vendor'

export interface Contact {
  name: string
  role: string
  email: string
  phone: string
}

export interface Party {
  id: string
  name: string
  kind: PartyKind
  /** stage + set time for artists; booth for vendors */
  location: string
  category: string
  skus: number
  /** primary settlement contact, pre-populated onto the settlement screen */
  contact: Contact
  /** additional people the party can route things to (they manage this themselves in the portal) */
  altContacts: Contact[]
  requiresInitialSignOff: boolean
  requiresSettlementSignOff: boolean
  stripe: 'connected' | 'invited' | 'none'
  splitPct: number
}

export const parties: Party[] = [
  {
    id: 'black-coyote',
    name: 'Black Coyote',
    kind: 'artist',
    location: 'Main Stage · 9:30 PM',
    category: 'Band merch',
    skus: 12,
    contact: { name: 'Dana Reyes', role: 'Tour Manager', email: 'dana@blackcoyote.band', phone: '+1 (512) 555-0148' },
    altContacts: [
      { name: 'Priya Nadeem', role: 'Business Manager', email: 'priya@bcmgmt.com', phone: '+1 (512) 555-0193' },
      { name: 'Marcus Hale', role: 'Merch Seller', email: 'marcus@blackcoyote.band', phone: '+1 (512) 555-0177' },
    ],
    requiresInitialSignOff: false,
    requiresSettlementSignOff: true,
    stripe: 'connected',
    splitPct: 80,
  },
  {
    id: 'neon-harvest',
    name: 'Neon Harvest',
    kind: 'artist',
    location: 'Main Stage · 7:45 PM',
    category: 'Band merch',
    skus: 8,
    contact: { name: 'Iris Chen', role: 'Tour Manager', email: 'iris@neonharvest.com', phone: '+1 (615) 555-0121' },
    altContacts: [],
    requiresInitialSignOff: true,
    requiresSettlementSignOff: true,
    stripe: 'invited',
    splitPct: 80,
  },
  {
    id: 'gold-static',
    name: 'Gold Static',
    kind: 'artist',
    location: 'River Stage · 6:00 PM',
    category: 'Band merch',
    skus: 8,
    contact: { name: 'Ray Ellis', role: 'Tour Manager', email: 'ray@goldstatic.co', phone: '+1 (205) 555-0164' },
    altContacts: [],
    requiresInitialSignOff: false,
    requiresSettlementSignOff: true,
    stripe: 'connected',
    splitPct: 80,
  },
  {
    id: 'riverline',
    name: 'Riverline',
    kind: 'artist',
    location: 'Tent Stage · 5:00 PM',
    category: 'Band merch · fly-in',
    skus: 6,
    contact: { name: 'Jo Barnes', role: 'Tour Manager', email: 'jo@riverline.fm', phone: '+1 (404) 555-0110' },
    altContacts: [],
    requiresInitialSignOff: false,
    requiresSettlementSignOff: true,
    stripe: 'none',
    splitPct: 80,
  },
  {
    id: 'ember-clay',
    name: 'Ember & Clay',
    kind: 'vendor',
    location: 'Craft Row · Booth 12',
    category: 'Craft · ceramics',
    skus: 9,
    contact: { name: 'Tasha Boyd', role: 'Owner', email: 'tasha@emberandclay.com', phone: '+1 (205) 555-0132' },
    altContacts: [],
    requiresInitialSignOff: true,
    requiresSettlementSignOff: true,
    stripe: 'connected',
    splitPct: 85,
  },
  {
    id: 'smokestack-bbq',
    name: 'Smokestack BBQ',
    kind: 'vendor',
    location: 'Food Alley · Booth 3',
    category: 'Concessionaire · food',
    skus: 6,
    contact: { name: 'Leo Márquez', role: 'Operator', email: 'leo@smokestackbbq.com', phone: '+1 (205) 555-0155' },
    altContacts: [],
    requiresInitialSignOff: false,
    requiresSettlementSignOff: false,
    stripe: 'connected',
    splitPct: 75,
  },
  {
    id: 'iron-city-prints',
    name: 'Iron City Prints',
    kind: 'vendor',
    location: 'Craft Row · Booth 7',
    category: 'Craft · posters',
    skus: 14,
    contact: { name: 'Wes Draper', role: 'Owner', email: 'wes@ironcityprints.com', phone: '+1 (205) 555-0188' },
    altContacts: [],
    requiresInitialSignOff: false,
    requiresSettlementSignOff: true,
    stripe: 'invited',
    splitPct: 85,
  },
  {
    id: 'festival-merch',
    name: 'Festival Merch',
    kind: 'vendor',
    location: 'All booths',
    category: 'House vendor',
    skus: 22,
    contact: { name: 'Alex Diaz', role: 'Merch Manager', email: 'alex@roninpos.com', phone: '+1 (205) 555-0100' },
    altContacts: [],
    requiresInitialSignOff: false,
    requiresSettlementSignOff: false,
    stripe: 'connected',
    splitPct: 100,
  },
]

export const partyById = (id: string) => parties.find((p) => p.id === id)!
export const partiesOfKind = (k: PartyKind) => parties.filter((p) => p.kind === k)
