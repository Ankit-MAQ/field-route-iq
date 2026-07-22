# AGENTS.md — Run Discipline for Field Route IQ

This repository is scored on three module entry points only.

## Objective

Implement spec-correct code for:

1. `src/pricing/engine.ts` → `priceOrder`
2. `src/audit/shelfAudit.ts` → `auditAccounts`
3. `src/settlement/settle.ts` → `settleRoute` (must call `priceOrder`)

## How to work each run

1. Read `harness/run-scope.md` to know this run's target module(s).
2. Read `harness/progress-notes.md` so you do not redo completed work.
3. Read only the relevant `harness/brief-*.md` file(s).
4. Consult `SPEC.md` only when details are missing or ambiguous.
5. Implement just the scoped module(s), with complete edge-case handling.
6. If run scope says `repair-only`, make minimal compile/typing fixes only.

## Constraints

- No tests (do not generate or run tests).
- No edits outside `src/pricing`, `src/audit`, `src/settlement`.
- No speculative refactors in unrelated app files.
- Throw exact error messages required by spec when specified.

## Done criteria per module

- All required exports/types and behavior from `SPEC.md` are implemented.
- Rounding and tie-break behavior exactly follows spec.
- Settlement reuses pricing implementation rather than duplicating rules.
