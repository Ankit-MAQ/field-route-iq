# RUN SCOPE (edit this between `agent-run` executions)

## Current run target

Run mode: `repair-only`

Target modules for this run:

- [x] `src/pricing/engine.ts`
- [ ] `src/audit/shelfAudit.ts`
- [x] `src/settlement/settle.ts`

Mark only the modules you want changed in this run.

## Scope policy

- If only one box is checked, edit only that module.
- If multiple are checked, implement in dependency order:
  1. pricing
  2. audit
  3. settlement
- Settlement must import and reuse `priceOrder` from `../pricing/engine`.

## Practical staged strategy

- Run 1: pricing only
- Run 2: audit only
- Run 3: settlement only (assuming pricing is stable)

## Hard constraints for this run

- No tests.
- No UI edits.
- No data file edits.
- For this run, prioritize fixing TypeScript compile errors only.
