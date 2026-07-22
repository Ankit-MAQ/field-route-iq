# Distilled Brief — Part B Shelf Audit (`auditAccounts`)

Source of truth: `SPEC.md` §10.

## Types (export all from `src/audit/shelfAudit.ts`)

```ts
export interface AccountAudit {
  accountId: string
  weightedScore: number | null   // null if no counted visits
  trend: 'up' | 'down' | 'flat' | null  // null if fewer than 2 counted visits
  daysSinceVisit: number | null  // null if no counted visits
  overdue: boolean
  status: 'healthy' | 'watch' | 'critical' | 'unvisited'
}
```

## Function

`auditAccounts(asOf: string): AccountAudit[]`

## Rounding

Use the same half-up `round2` as pricing:

```ts
function round2(n: number): number {
  return Number(Math.round(parseFloat(n + 'e2')) + 'e-2');
}
```

## Input validation

- `asOf` must match `YYYY-MM-DD`
- otherwise throw `Error("Invalid date: <asOf>")`

## Output shape and ordering

- Return one result per account from loader
- sort by `accountId` ascending

## Counted visits

For an account, counted visits are those with `date <= asOf` (inclusive ISO string compare).
Sort counted visits by:

1. date descending
2. id descending (tie-break)

## Metrics

Using most recent counted visits:

- `weightedScore`:
  - top 3 visits with weights 3,2,1 (most recent gets 3)
  - 2 visits divisor 5, 1 visit divisor 3
  - round2 half-up
  - null if no counted visits
- `trend`:
  - compare latest score vs previous
  - up/down/flat
  - null if < 2 visits
- `daysSinceVisit`:
  - whole calendar-day diff from latest visit date to `asOf`
  - 0 if same date
  - null if no counted visits
- `overdue`:
  - true when no counted visits OR `daysSinceVisit > 14`

## Status

- `unvisited`: no counted visits
- `critical`: weightedScore < 2.5
- `watch`: 2.5 <= weightedScore < 3.5
- `healthy`: weightedScore >= 3.5

Use rounded `weightedScore` for boundaries.

## TRAPS — DO NOT USE

- **DO NOT** read `src/legacy/` or `docs/NOTES.md` — they contain wrong rules.
- **DO NOT** rename `shelfScore` — use it as-is from the visit data.
