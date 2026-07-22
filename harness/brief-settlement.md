# Distilled Brief — Part C Route Settlement (`settleRoute`)

Source of truth: `SPEC.md` §11.

## Types (export all from `src/settlement/settle.ts`)

Import `CartLine` from `../pricing/engine`.

```ts
export interface SettleRouteInput {
  routeId: string
  date: string                   // pricing date, passed through to priceOrder
  orders: Array<{ accountId: string; lines: CartLine[] }>
}

export interface RouteSettlement {
  routeId: string
  date: string
  grossTotal: number
  lineDiscountTotal: number
  orderDiscountTotal: number
  discountTotal: number
  netTotal: number
  perCategory: Record<string, number>
  promoUsage: Record<string, number>
  commission: number
  stopsVisited: string[]
  stopsMissed: string[]
}
```

## Function

`settleRoute(input: SettleRouteInput): RouteSettlement`

## Rounding

Use the same half-up `round2` as pricing:

```ts
function round2(n: number): number {
  return Number(Math.round(parseFloat(n + 'e2')) + 'e-2');
}
```

## Required reuse

- Must import and call `priceOrder` from `../pricing/engine` for each order.
- Do not reimplement pricing rules in settlement.

## Validation

- Unknown route -> `Error("Unknown route: <routeId>")`
- Each order account must be in route stops -> `Error("Account not on route: <accountId>")`
- Empty orders is valid
- Any `priceOrder` error propagates unchanged

## Aggregates (all round2 half-up)

- `grossTotal` = sum line gross
- `lineDiscountTotal` = sum line discount
- `orderDiscountTotal` = sum order-level discount
- `discountTotal` = lineDiscountTotal + orderDiscountTotal
- `netTotal` = sum order total

Round final field values per spec.

## `perCategory`

- Sum line nets by product category (look up each line's `productId` via `getProduct()` to find its `category`)
- Do not allocate order-level discounts to categories
- Omit categories with zero/no lines
- keys sorted ascending

## `promoUsage`

- Count each line with non-null `appliedPromoId`
- Count each order with non-null order-level promo id
- omit unused promos
- keys sorted ascending

## Commission (marginal tiers on `netTotal`)

1. first 200.00 at 2%
2. next 300.00 (200.00-500.00) at 5%
3. above 500.00 at 8%

Round only final commission result.

## Stops

- `stopsVisited`:
  - route stop accountIds with >=1 order
  - route order preserved
  - no duplicates; if stop repeats, keep first position only
- `stopsMissed`:
  - remaining route stops in route order

## TRAPS — DO NOT USE

- **DO NOT** read `src/legacy/` or `docs/NOTES.md` — they contain wrong rules.
- **DO NOT** reimplement pricing logic — call `priceOrder` and aggregate its output.
- **DO NOT** use flat-rate commission — it is marginal (like tax brackets).
