# Feature Spec — Field Operations Suite (Pricing · Shelf Audit · Route Settlement)

> **This is the challenge.** Three interdependent modules are missing from this app.
> Your agent must implement all three. Scoring is done against a hidden test suite
> written strictly from this document — if the spec is ambiguous to you, it was
> ambiguous to everyone; the spec text is the single source of truth.

## 1. Deliverables (all three are scored)

1. **Part A — Pricing engine** (§2–§7): `src/pricing/engine.ts` exporting

   ```ts
   export function priceOrder(input: PriceOrderInput): PricedOrder
   ```

2. **Part B — Shelf audit** (§10): `src/audit/shelfAudit.ts` exporting

   ```ts
   export function auditAccounts(asOf: string): AccountAudit[]
   ```

3. **Part C — Route settlement** (§11): `src/settlement/settle.ts` exporting

   ```ts
   export function settleRoute(input: SettleRouteInput): RouteSettlement
   ```

   Part C **must** import and reuse `priceOrder` from `../pricing/engine` — it is
   judged against *your* pricing module, so the parts must agree.

All modules read data via the loaders in `src/data/index.ts` (`getProducts`,
`getAccounts`, `getPromotions`, `getRoutes`, `getVisits`, `getProduct`, `getAccount`).
Do not re-read the JSON files directly. (The Order-screen UI wiring described in §8 is
**not scored** — skip it unless you have time to spare.)

## 2. Types

```ts
export interface CartLine { productId: string; qty: number }        // qty ≥ 1, integer

export interface PriceOrderInput {
  lines: CartLine[]
  accountId: string
  date: string                 // ISO date, e.g. "2026-07-20" — the pricing date
}

export interface PricedLine {
  productId: string
  qty: number
  unitPrice: number            // from catalog
  gross: number                // unitPrice * qty, rounded (§6)
  appliedPromoId: string | null
  discount: number             // ≥ 0, rounded (§6)
  net: number                  // gross - discount (never below 0)
}

export interface PricedOrder {
  lines: PricedLine[]
  orderLevel: { appliedPromoId: string | null; discount: number }
  subtotal: number             // sum of line nets
  total: number                // subtotal - orderLevel.discount, floored at 0
}
```

Catalog, accounts and promotions are loaded from `src/data/products.json`,
`src/data/accounts.json`, `src/data/promotions.json`. The engine must read them via
the existing typed loaders in `src/data/index.ts` (do not fetch).

## 3. Promotion types

Promotions live in `src/data/promotions.json`. Three `type` values exist:

### 3.1 `percent_off` (line-level)
```json
{ "type": "percent_off", "percent": 15, "scope": { "category": "beverages" } }
```
- `scope` has **either** `category` **or** `productIds` (array). The promo applies to a
  cart line if the line's product matches the scope.
- Line discount = `gross * percent / 100`, rounded per §6.

### 3.2 `bogo` (line-level)
```json
{ "type": "bogo", "productId": "p-cola-12", "buyQty": 2, "getQty": 1 }
```
- Applies only to lines whose `productId` matches.
- The deal **repeats**: for every complete group of `buyQty + getQty` units in the
  line, `getQty` units are free.
  - Example: buy 2 get 1, qty 7 → ⌊7 / 3⌋ = 2 groups → 2 free units.
- Line discount = `freeUnits * unitPrice`, rounded per §6.
- If `qty < buyQty + getQty`, the promo matches the line but yields **discount 0** —
  and a 0-discount promo is treated as **not applicable** for selection (§5).

### 3.3 `threshold` (order-level)
```json
{ "type": "threshold", "category": "snacks", "minSubtotal": 100, "amountOff": 12 }
```
- Evaluated **after** all line-level promos are applied.
- Qualifies when the sum of **line nets** (post line-discount) for products in
  `category` is **≥ `minSubtotal`** (inclusive).
- Order-level discount = `amountOff` (a fixed currency amount).

## 4. Validity & eligibility (all promotion types)

- Every promotion has `validFrom` and `validTo` (ISO dates). A promotion is active
  when `validFrom ≤ date ≤ validTo` — **both endpoints inclusive**. Compare dates as
  calendar dates; there is no time-of-day component.
- A promotion may have `eligibleSegments` (array of account segments, e.g.
  `["independent", "premium"]`). If present, the ordering account's `segment` must be
  in the list. If absent, all segments are eligible.
- Inactive or ineligible promotions are ignored entirely.

## 5. Stacking & selection rules

1. **At most one line-level promotion per cart line.** If several active, eligible
   line-level promotions apply to the same line, choose the one with the **largest
   discount** for that line ("best for customer").
2. **Tie-break** (equal discounts): earlier `validFrom` wins; if still tied, the
   promotion whose `id` sorts first lexicographically wins.
3. A promotion whose computed discount for a line is **0** is not applicable to that
   line (see BOGO partial groups, §3.2).
4. **At most one order-level promotion per order.** If several `threshold` promos
   qualify, choose the one with the largest `amountOff`; tie-break as in rule 2.
5. Line-level and order-level promotions **do stack** with each other (a line promo
   plus an order promo on the same order is normal).
6. The same promotion may be applied to multiple different lines if its scope matches
   them (a `percent_off` on a category can discount every line in that category).

## 6. Rounding & money

- **Every** money value in the output is rounded to **2 decimal places, half-up** —
  `gross`, `discount`, `net`, `subtotal`, `total`, and the order-level discount.
  Half-up means `1.005 → 1.01`; and beware float artifacts: `2.175` is stored as
  `2.17499…`, so a naive `Math.round(x*100)/100` gives `2.17` when the spec requires `2.18`.
- Round each line's `gross` and `discount` independently, then
  `net = round2(gross − discount)`, clamped at 0. (A raw subtraction of two rounded
  operands can still leave `18.669999…`; the output must be `18.67` — round it.)
- `subtotal = round2(sum of line nets)`. `total = round2(subtotal − orderLevel.discount)`,
  clamped at 0.

## 7. Edge cases the engine must handle

- Empty `lines` → valid result: no lines, subtotal 0, total 0, no promos applied.
- Unknown `productId` in a cart line → throw `Error("Unknown product: <id>")`.
- Unknown `accountId` → throw `Error("Unknown account: <id>")`.
- `qty` ≤ 0 or non-integer → throw `Error("Invalid qty for <productId>")`.
- A threshold promo may push `total` toward 0 but never negative.

## 8. UI acceptance (Order screen) — not scored

- Adding products to the cart recalculates pricing live (on every cart change).
- Each line shows the applied promotion **name** (not id) or "—".
- The summary block has `data-testid` hooks: `order-subtotal`, `order-discount`,
  `order-total` (text content = formatted number with 2 decimals, no currency symbol).
- The submit button (`data-testid="submit-order"`) is disabled when the cart is empty.

## 9. Scoring — hidden tests, judged at the end

**This repo ships with no tests.** Your agent builds all three modules from this document
and must not write or run tests. At judging time a hidden suite — written strictly from
this spec, covering every rule and edge case in Parts A, B, and C — is run against your
modules to score correctness. Part C is exercised through *your* `priceOrder`, so pricing
mistakes surface in settlement too. This document is the entire surface: read it carefully.

---

## 10. Part B — Shelf Audit (`src/audit/shelfAudit.ts`)

Field managers need a health readout per account, computed from the visit log.

### 10.1 Signature & types

```ts
export interface AccountAudit {
  accountId: string
  weightedScore: number | null   // §10.3, rounded per §6; null if no counted visits
  trend: 'up' | 'down' | 'flat' | null   // §10.4; null if fewer than 2 counted visits
  daysSinceVisit: number | null  // §10.5; null if no counted visits
  overdue: boolean               // §10.5
  status: 'healthy' | 'watch' | 'critical' | 'unvisited'   // §10.6
}

export function auditAccounts(asOf: string): AccountAudit[]
```

- `asOf` must match `YYYY-MM-DD`; otherwise throw `Error("Invalid date: <asOf>")`.
- Returns **one entry per account** in `accounts.json`, sorted by `accountId` ascending.

### 10.2 Counted visits

For each account, count only visits with `date ≤ asOf` (inclusive; compare ISO strings).
Order counted visits **most recent first**: `date` descending, ties broken by `id`
descending. ("Latest" below always means the first visit in this order.)

### 10.3 Weighted score

Take up to the **3 most recent** counted visits with weights **3, 2, 1** (most recent
gets 3). `weightedScore = round2( Σ(weightᵢ × shelfScoreᵢ) / Σ(weightᵢ) )` using §6
half-up rounding. With 2 visits the divisor is 5; with 1 visit it is 3 (i.e. the score
itself); with 0 visits `weightedScore` is `null`.

### 10.4 Trend

Requires at least 2 counted visits: compare the latest score `s₁` to the previous `s₂`
— `'up'` if `s₁ > s₂`, `'down'` if `s₁ < s₂`, `'flat'` if equal. Otherwise `null`.

### 10.5 Recency

`daysSinceVisit` = whole calendar days from the latest counted visit's date to `asOf`
(date-only arithmetic; same day → 0). `null` if no counted visits.
`overdue` = `true` when `daysSinceVisit` is `null` **or** strictly greater than **14**.
(Exactly 14 days is *not* overdue.)

### 10.6 Status

- `'unvisited'` — no counted visits.
- `'critical'` — `weightedScore < 2.5`.
- `'watch'` — `2.5 ≤ weightedScore < 3.5`.
- `'healthy'` — `weightedScore ≥ 3.5`.

Boundaries are decided on the **rounded** `weightedScore` (exactly 2.5 → watch;
exactly 3.5 → healthy).

---

## 11. Part C — Route Settlement (`src/settlement/settle.ts`)

End-of-day: given the orders captured along a route, produce the route's settlement.

### 11.1 Signature & types

```ts
export interface SettleRouteInput {
  routeId: string
  date: string                    // pricing date, passed through to priceOrder
  orders: Array<{ accountId: string; lines: CartLine[] }>
}

export interface RouteSettlement {
  routeId: string
  date: string
  grossTotal: number              // §11.3
  lineDiscountTotal: number
  orderDiscountTotal: number
  discountTotal: number
  netTotal: number
  perCategory: Record<string, number>   // §11.4
  promoUsage: Record<string, number>    // §11.5
  commission: number              // §11.6
  stopsVisited: string[]          // §11.7
  stopsMissed: string[]
}

export function settleRoute(input: SettleRouteInput): RouteSettlement
```

### 11.2 Validation & pricing

- Unknown `routeId` (via `getRoutes()`) → throw `Error("Unknown route: <routeId>")`.
- Every order's `accountId` must be one of the route's stops; otherwise throw
  `Error("Account not on route: <accountId>")`. Multiple orders for the same stop are
  allowed. An empty `orders` array is valid.
- Price **each order** by calling `priceOrder({ lines, accountId, date })` from
  `../pricing/engine`. All of §11.3–§11.6 aggregate over those results. Any error
  thrown by `priceOrder` propagates unchanged.

### 11.3 Money totals (all rounded per §6, half-up 2dp)

- `grossTotal` = round2( sum of every priced line's `gross` ).
- `lineDiscountTotal` = round2( sum of every priced line's `discount` ).
- `orderDiscountTotal` = round2( sum of every order's `orderLevel.discount` ).
- `discountTotal` = round2( lineDiscountTotal + orderDiscountTotal ).
- `netTotal` = round2( sum of every order's `total` ).

### 11.4 Per-category nets

`perCategory` maps each product category that appears in the orders to
round2( sum of its lines' `net` ). Categories with no lines are **absent** (not 0).
**Order-level discounts are NOT allocated to categories.** Keys sorted ascending.

### 11.5 Promotion usage

`promoUsage` counts applications: each priced **line** with `appliedPromoId` adds 1 to
that promo; each order's `orderLevel.appliedPromoId` (when non-null) adds 1. Promos
never applied are absent. Keys sorted ascending.

### 11.6 Commission — marginal tiers on `netTotal`

Commission is **marginal** (like tax brackets), computed on `netTotal`, rounded per §6
only at the end:

| Tier | Portion of netTotal | Rate |
|---|---|---|
| 1 | first 200.00 | 2% |
| 2 | over 200.00 up to 500.00 | 5% |
| 3 | over 500.00 | 8% |

Example: netTotal 316.86 → 200×2% + 116.86×5% = 4.00 + 5.843 = 9.843 → **9.84**.
(A flat single-rate reading is wrong.)

### 11.7 Stops

- `stopsVisited` = the route's stop `accountId`s that have **≥ 1 order**, in **route
  stop order**, no duplicates (even if an account appears twice as a stop, list it once,
  at its first position).
- `stopsMissed` = the remaining stop accountIds, in route stop order.
