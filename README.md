# Field Route IQ

A field-sales companion app for delivery reps: daily routes, account
profiles, promotions, a visit log, and on-site order capture. Built with
React + TypeScript + Vite, designed for tablet use in-store.

## Running

```bash
npm install
npm run dev      # start the dev server
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

Three modules of the **Field Operations Suite** described in [`SPEC.md`](SPEC.md)
are deliberately unimplemented: the pricing engine (`src/pricing/engine.ts`), the
shelf audit (`src/audit/shelfAudit.ts`), and the route settlement
(`src/settlement/settle.ts`). Your job is to get an AI agent to build all three.
**This repo ships with no tests for them** — a hidden suite scores your work at
the end. See [`RULES.md`](RULES.md) for the format and [`QUICKSTART.md`](QUICKSTART.md)
for how to submit.

Everything else — routing, data loaders, order persistence — is complete:

```bash
npm run build    # passes
```
