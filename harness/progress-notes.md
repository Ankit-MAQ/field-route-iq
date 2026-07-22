# Progress Notes (edit after each run)

Use this file to keep the next run focused and cheap.

## Status board

- Pricing: draft generated (compile errors remain)
- Audit: draft generated
- Settlement: draft generated (compile errors remain)

## Stable decisions

- Money rounding must be 2dp half-up across all outputs.
- Promotion tie-breaks: larger discount, then earlier `validFrom`, then lexicographically smaller `id`.
- Settlement aggregates priced outputs and must call `priceOrder`.

## Known pitfalls to avoid

- Naive `Math.round(x * 100) / 100` can break half-up expectations due to float artifacts.
- BOGO with matched line but zero free units is not applicable.
- Threshold promo is evaluated after line-level nets and is at most one per order.
- Stops visited/missed must respect route stop order and visited should be deduplicated.

## Run log

Append concise notes each run:

- 2026-07-22 run 1:
  - Model: gpt-5-mini
  - Scope: intended pricing only; actual output touched pricing + audit + settlement
  - Outcome: implementation generated, TypeScript compile failed
  - Follow-up: repair-only run for pricing + settlement import/type errors (`verbatimModuleSyntax`: use `import type`, remove unused types)
