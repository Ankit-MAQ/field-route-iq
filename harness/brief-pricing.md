# Distilled Brief — Part A Pricing (`priceOrder`)

Source of truth: `SPEC.md` §2–§7.

## Types (export all from `src/pricing/engine.ts`)

```ts
export interface CartLine { productId: string; qty: number }

export interface PriceOrderInput {
  lines: CartLine[]
  accountId: string
  date: string           // ISO date e.g. "2026-07-20"
}

export interface PricedLine {
  productId: string
  qty: number
  unitPrice: number      // from catalog
  gross: number          // unitPrice * qty, rounded
  appliedPromoId: string | null
  discount: number       // >= 0, rounded
  net: number            // gross - discount, floored at 0
}

export interface PricedOrder {
  lines: PricedLine[]
  orderLevel: { appliedPromoId: string | null; discount: number }
  subtotal: number       // sum of line nets
  total: number          // subtotal - orderLevel.discount, floored at 0
}
```

## Function

`priceOrder(input: PriceOrderInput): PricedOrder`

## Inputs and validation

- Unknown `accountId` -> `Error("Unknown account: <id>")`
- Any unknown product in cart -> `Error("Unknown product: <id>")`
- Any `qty <= 0` or non-integer -> `Error("Invalid qty for <productId>")`
- Empty `lines` is valid: zero totals, no promos.

## Promo filtering

Promotion is usable only if:

- `validFrom <= date <= validTo` (inclusive date compare)
- account segment is eligible when `eligibleSegments` exists

Inactive/ineligible promotions are ignored.

## Line-level promos

Types:

1. `percent_off`:
   - scope by `category` or `productIds`
   - discount = round2(gross * percent / 100)
2. `bogo`:
   - matches only exact product
   - groups = floor(qty / (buyQty + getQty))
   - freeUnits = groups * getQty
   - discount = round2(freeUnits * unitPrice)
   - discount 0 means not applicable

At most one line promo per line:

- choose max discount
- tie-break: earlier `validFrom`, then lexicographically smaller `id`

## Order-level promo (`threshold`)

Evaluate after line nets:

- qualifying subtotal is sum of post-line-discount nets in promo category
- qualifies when subtotal >= `minSubtotal`
- discount is fixed `amountOff`
- choose at most one threshold promo by max `amountOff`, same tie-break rules

## Stacking and totals

- Line promo + order promo may both apply
- Same line promo can apply independently to multiple lines
- `subtotal = round2(sum(line.net))`
- `total = round2(subtotal - orderDiscount)`, floored at 0

## Rounding (critical)

Use this exact half-up `round2` helper (exponential notation avoids float artifacts):

```ts
function round2(n: number): number {
  return Number(Math.round(parseFloat(n + 'e2')) + 'e-2');
}
```

Apply `round2` to every money output:

- line `gross`, `discount`, `net`
- order-level `discount`
- `subtotal`, `total`

Compute line `net = round2(gross - discount)`, floor at 0.

## TRAPS — DO NOT USE

- **DO NOT** read `src/legacy/pricingV1.ts` or `docs/NOTES.md` — they contain wrong rules.
- **DO NOT** use banker's rounding — use half-up.
- **DO NOT** treat `validTo` as exclusive — it is inclusive.
- **DO NOT** stack multiple line promos per line — at most one.
- **DO NOT** cap discounts at 40% — there is no cap.
- **DO NOT** limit BOGO to one group — it repeats: `floor(qty / (buyQty + getQty))` groups.
