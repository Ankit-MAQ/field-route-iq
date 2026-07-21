# Field Route IQ

A field-sales companion app for delivery reps: daily routes, account
profiles, promotions, a visit log, and on-site order capture. Built with
React + TypeScript + Vite, designed for tablet use in-store.

## Running

```bash
npm install
npm run dev      # start the dev server
npm test         # run the test suite (vitest)
npm run build    # type-check and produce a production build
```

## App tour

- **Dashboard** (`/`) — today's route and quick stats.
- **Routes** (`/routes`) — delivery routes and their ordered stops.
- **Accounts** (`/accounts`) — customer stores, with segment, region, and
  visit history.
- **Promotions** (`/promotions`) — current trade promotions and eligibility.
- **Visits** (`/visits`) — visit log, including submitted orders.
- **New Order** (`/orders/new`) — order capture for an account.

Static data lives in `src/data/*.json` and is read through the typed loaders
in `src/data/index.ts`. Submitted orders persist to `localStorage`
(`src/state/orders.ts`).

## Status: pricing is intentionally missing

The order screen currently totals the cart at list price — **no promotions
are applied**. The promotion & pricing engine described in [`SPEC.md`](SPEC.md)
is deliberately unimplemented (`src/pricing/` does not exist yet), and the
public pricing tests referenced there will fail until it is built. See
[`RULES.md`](RULES.md) for the workshop format.

Everything else — routing, data loaders, order persistence, the test setup —
is complete and green:

```bash
npm test         # passes (app smoke tests)
npm run build    # passes
```
