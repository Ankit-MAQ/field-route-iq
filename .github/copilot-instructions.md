# Copilot Harness Instructions (Field Route IQ)

You are implementing only the Field Operations Suite modules:

- `src/pricing/engine.ts` (`priceOrder`)
- `src/audit/shelfAudit.ts` (`auditAccounts`)
- `src/settlement/settle.ts` (`settleRoute`)

## Read order (keep context small)

1. `harness/run-scope.md` (what this run should change)
2. `harness/progress-notes.md` (what is already done / known issues)
3. The relevant distilled brief(s):
   - `harness/brief-pricing.md`
   - `harness/brief-audit.md`
   - `harness/brief-settlement.md`
4. `SPEC.md` only for missing detail or conflict resolution

`SPEC.md` is authoritative if any brief is incomplete or inconsistent.

## Execution rules

- Edit/create files only under `src/pricing`, `src/audit`, `src/settlement`.
- Use existing typed loaders from `src/data/index.ts`; do not read JSON files directly.
- Do not write or run tests.
- Keep implementations deterministic and spec-faithful.
- Reuse shared helper logic inside each module when helpful (especially safe rounding).

## Critical traps — DO NOT USE these sources

- **`src/legacy/pricingV1.ts`** — uses wrong rules (banker's rounding, cumulative stacking, exclusive validTo, single BOGO group). IGNORE.
- **`docs/NOTES.md`** — contains outdated meeting notes with contradictory rules (40% cap, gross-based threshold, etc.). IGNORE.
- **`src/legacy/discountMatrix.ts`** — irrelevant volume tier system. IGNORE.
- Trust ONLY your brief files and `SPEC.md`.

## Delivery rules

- If `harness/run-scope.md` limits this run to specific modules, do not modify others.
- If a scoped module is already complete, leave it unchanged.
- Do not do UI wiring; only the scored module entry points matter.
- Respect `harness/run-scope.md` literally:
  - edit only checked modules
  - if run mode is set to `repair-only`, make the minimum targeted fixes needed to satisfy TypeScript compile.

## TypeScript import rule

This repo uses `verbatimModuleSyntax`.

- Import runtime values with normal imports.
- Import types with `import type { ... }`.
- Never import unused types.
