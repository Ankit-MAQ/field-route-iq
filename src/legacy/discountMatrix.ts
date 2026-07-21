/**
 * Volume discount matrix — imported from the FieldPro handheld sync files.
 *
 * Tier discounts are percentages applied by (category, segment) at the
 * volume breakpoints in TIER_BREAKS. Retained for statement reconciliation
 * against pre-2025 invoices.
 */

export const TIER_BREAKS = [6, 12, 24, 48, 96] as const

export interface TierRow {
  category: string
  segment: string
  /** discount % at each TIER_BREAKS breakpoint */
  tiers: [number, number, number, number, number]
}

export const DISCOUNT_MATRIX: TierRow[] = [
  { category: 'beverages', segment: 'independent', tiers: [1.0, 2.0, 3.5, 5.0, 7.5] },
  { category: 'beverages', segment: 'chain', tiers: [1.5, 3.0, 4.5, 6.5, 9.0] },
  { category: 'beverages', segment: 'premium', tiers: [0.5, 1.5, 2.5, 4.0, 6.0] },
  { category: 'snacks', segment: 'independent', tiers: [1.0, 1.5, 3.0, 4.5, 6.5] },
  { category: 'snacks', segment: 'chain', tiers: [1.5, 2.5, 4.0, 6.0, 8.5] },
  { category: 'snacks', segment: 'premium', tiers: [0.5, 1.0, 2.0, 3.5, 5.5] },
  { category: 'dairy', segment: 'independent', tiers: [0.5, 1.0, 2.0, 3.0, 4.5] },
  { category: 'dairy', segment: 'chain', tiers: [1.0, 2.0, 3.0, 4.5, 6.0] },
  { category: 'dairy', segment: 'premium', tiers: [0.5, 1.0, 1.5, 2.5, 4.0] },
  { category: 'household', segment: 'independent', tiers: [2.0, 3.0, 4.5, 6.5, 9.5] },
  { category: 'household', segment: 'chain', tiers: [2.5, 4.0, 5.5, 8.0, 11.0] },
  { category: 'household', segment: 'premium', tiers: [1.5, 2.5, 3.5, 5.0, 7.0] },
]

/**
 * Seasonal uplift factors (multiplied into the tier discount) — negotiated
 * per region during the 2023 route-to-market review. Regions not listed
 * default to 1.0.
 */
export const SEASONAL_UPLIFT: Record<string, Record<string, number>> = {
  North: { Q1: 1.0, Q2: 1.05, Q3: 1.1, Q4: 1.0 },
  East: { Q1: 1.0, Q2: 1.0, Q3: 1.15, Q4: 1.05 },
  South: { Q1: 1.05, Q2: 1.1, Q3: 1.2, Q4: 1.0 },
  West: { Q1: 1.0, Q2: 1.05, Q3: 1.1, Q4: 1.05 },
}

/**
 * Legacy per-SKU overrides. A value here replaces the category tier row
 * entirely (used for slow movers the buyers wanted to protect).
 */
export const SKU_TIER_OVERRIDES: Record<string, [number, number, number, number, number]> = {
  'p-cola-12': [1.0, 2.5, 4.0, 6.0, 8.5],
  'p-water-24': [1.5, 3.0, 5.0, 7.5, 10.0],
  'p-energy-4': [0.5, 1.0, 2.0, 3.0, 4.5],
  'p-chips-lg': [1.0, 2.0, 3.5, 5.5, 7.5],
  'p-pretzel': [0.5, 1.5, 2.5, 4.0, 6.0],
  'p-trailmix': [0.5, 1.0, 2.0, 3.5, 5.0],
  'p-choc-bar': [1.0, 2.0, 3.0, 4.5, 6.5],
  'p-milk-gal': [0.0, 0.5, 1.0, 2.0, 3.0],
  'p-yogurt-6': [0.5, 1.0, 2.0, 3.0, 4.5],
  'p-cheese': [0.5, 1.5, 2.5, 3.5, 5.0],
  'p-paper-tw': [2.0, 3.5, 5.0, 7.5, 10.5],
  'p-dish-soap': [1.5, 2.5, 4.0, 6.0, 8.0],
}

/**
 * Accounts grandfathered onto 2022 contract pricing. The handhelds skipped
 * the matrix for these and used the flat rate below instead.
 */
export const GRANDFATHERED_FLAT_RATES: Record<string, number> = {
  'a-102': 4.25,
  'a-105': 4.25,
  'a-108': 3.75,
}

/**
 * Resolve the tier discount % for a quantity. Quantities below the first
 * breakpoint earn no volume discount.
 */
export function legacyTierDiscount(
  category: string,
  segment: string,
  productId: string,
  qty: number,
): number {
  let tierIndex = -1
  for (let i = 0; i < TIER_BREAKS.length; i++) {
    if (qty >= TIER_BREAKS[i]) tierIndex = i
  }
  if (tierIndex < 0) return 0

  const override = SKU_TIER_OVERRIDES[productId]
  if (override) return override[tierIndex]

  const row = DISCOUNT_MATRIX.find(
    (r) => r.category === category && r.segment === segment,
  )
  return row ? row.tiers[tierIndex] : 0
}

/**
 * Apply the regional seasonal uplift to a tier discount.
 * Quarter is "Q1".."Q4" derived from the order month.
 */
export function upliftedTierDiscount(
  baseDiscount: number,
  region: string,
  isoDate: string,
): number {
  const month = Number(isoDate.slice(5, 7))
  const quarter = `Q${Math.floor((month - 1) / 3) + 1}`
  const factor = SEASONAL_UPLIFT[region]?.[quarter] ?? 1.0
  return baseDiscount * factor
}
