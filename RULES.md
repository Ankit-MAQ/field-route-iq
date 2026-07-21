# Field Route IQ — Harness Hackathon

## The challenge
This is a working field-sales app missing **one feature**: the promotion & pricing
engine (`priceOrder`) specified in `SPEC.md`. Your job is to get an AI agent to build it
**correctly and for the fewest tokens.**

Any modern model writes this in a couple of minutes — so building it isn't the game.
**The game is the harness.** Everyone builds the same feature; you compete on how good,
and how *cheap*, your harness makes the agent's work.

> Proven on this exact repo: a bare agent scored **42/46 for 11.7 credits**. The same
> model with a lean harness (repo-map + distilled spec) scored **46/46 for 9.25 credits**
> — more correct, and ~20% cheaper, using half the tokens. That gap is what you're racing on.

## Format — an optimization race (90 min)
It's a **live leaderboard.** You submit as often as you like; at each **checkpoint** the
judge scores your latest submission and posts your **score + cost** — but *not which tests
failed.* You refine your harness, maybe switch models, and resubmit to climb.

- **Checkpoints:** ~T+25, ~T+55, and the final at T+80. Board updates at each.
- **Every run costs tokens, and it's cumulative.** You can't brute-force — each experiment
  spends real budget that counts against you. Spend wisely.

## Scoring
1. **Gate — "it works":** your `engine.ts` must pass **38/38 core** hidden tests to qualify.
   A good harness gets there; a bare build does not.
2. **Champion (the prize): lowest total credit cost** among everyone who clears the gate.
3. **Tie-breaks:** most of the 8 bonus edge-case tests passed, then earliest to reach the gate.

## You build the harness — the agent builds the feature
- **You may author freely:** `.github/copilot-instructions.md`, `AGENTS.md`, a distilled or
  annotated spec, a **repo-map / codegraph**, "read these / ignore those" guidance,
  subagent/prompt setups, MCP/config — and you pick your model.
- **The agent writes the feature only** (`src/pricing/engine.ts`). It may **not** write or
  run tests, and it does **not** score itself — there is no test suite in this repo.
- **You may not hand-write or hand-edit any code under `src/`.** You steer; the agent types.

## Submitting (fork model)
1. **Fork** this repo (top-right on GitHub) — that's your copy; no invite needed.
2. Run the agent with the provided wrapper — `node agent-run.mjs --model <yours>` — which
   builds the engine **and writes your cumulative cost to `COST.txt` automatically.** (See
   `QUICKSTART.md` for one-time Copilot-CLI setup.)
3. Commit `src/pricing/engine.ts` + `COST.txt` and **push to your fork.** Re-push anytime
   before pencils-down to update your score — the judge auto-discovers every fork.

## Rules
1. **Scored deliverable = `priceOrder` only** (SPEC §1.1). The OrderPage / UI wiring in the
   spec is **not scored** — skip it; don't spend credits on it.
2. **All spend counts** — exploration, failed runs, everything. Under-reporting `COST.txt`
   is a DQ; the top scorers screen-share their Copilot credit readout before prizes.
3. **Model choice is yours** and it's the biggest cost lever — *find the cheapest model your
   harness can carry to a passing build.*
4. **The agent must not write or run tests**, and must not score itself.
5. **Copying another fork's `engine.ts` = DQ.** The judge flags identical engines. Your
   harness files can stay local — only `engine.ts` + `COST.txt` need pushing.
6. **Frozen files** — don't edit `src/data/*.json`; the judge resets them to canonical
   before scoring.
7. **No test-suite fishing.** The hidden suite isn't in the repo and won't be discussed. It's
   written from `SPEC.md` — which you have. Read the spec carefully instead.
8. **Pencils down** = your last push before the final checkpoint.

## Strategy hints (this is the point)
- The agent is smart — it gets most of a clean spec right on its own. Your edge is making the
  brownfield **legible and small**: a repo-map so it doesn't wander, a distilled spec so it
  doesn't re-read everything. **Cheap comes from less context, not more.**
- More instructions is *not* always better — an overloaded harness can confuse a model and
  make it slower *and* wronger. Aim your guidance at the few hard parts.
- A big model brute-forces correctness but costs a fortune. A cheap model + a great harness
  can match it for a fraction. That's the whole game.
- Some files here are old and wrong. `SPEC.md` is the only source of truth — a good harness
  tells the agent which files to trust.
