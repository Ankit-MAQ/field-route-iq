# Field Route IQ — Harness Hackathon Rules

## The challenge

This repo is a working field-sales app with one feature missing: the **promotion &
pricing engine** described in `SPEC.md`. Your job is to get an AI agent to build it —
**at the lowest cost**.

## Scoring

1. **Gate:** at pencils-down, the judge injects a hidden test suite (written strictly
   from `SPEC.md`) and runs it against your repo. You must pass **100% of the core
   tests** to qualify.
2. **Rank:** qualifying teams are ranked by **total API spend** (measured server-side
   by the metered proxy — the number on your key's ledger is final).
3. **Tie-breaks:** (a) most bonus edge-case tests passed, (b) earliest submission.

## The rules

1. **Agents write the feature code.** Humans may not hand-write or hand-edit anything
   under `src/`. You steer; the agent types.
2. **Humans build the harness.** You may freely author: instruction files
   (`.github/copilot-instructions.md`, `AGENTS.md`, `CLAUDE.md`), skills, specs, plans,
   progress/state files, MCP configuration, prompts, and subagent definitions.
3. **Use your team's API key only**, pointed at the workshop proxy. Any spend on the
   key counts — including failed runs, exploration, and abandoned sessions. Spend
   before the start signal or after pencils-down disqualifies.
4. **Don't touch the tests' behavior:** you may not modify `package.json` test
   scripts, vitest config, or the public test file. Adding *more* tests of your own is
   allowed (and smart).
5. **No test-suite fishing.** The hidden suite is not in this repo, not on the proxy,
   and not something the facilitators will discuss. Prompting your agent to guess it
   is pointless — it's written from `SPEC.md`, which you already have.
6. **Pencils down** means: push your final commit. The judge checks out that commit.
7. Any model available through the proxy is allowed. Model choice is part of your
   cost strategy.

## Strategy hints (read them — this is the point of the workshop)

- Tokens are spent reading, not just writing. What does your agent *not* need to read?
- `SPEC.md` is long. Is all of it relevant at every step?
- The repo contains code that will mislead a naive agent. A good harness makes the
  agent immune to it.
- Planner → generator → evaluator beats one giant prompt. Cheap models can run some
  of those roles.
- The public tests tell you when the easy 80% works. The hidden suite is why you
  write your *own* edge-case tests before pencils-down.

## Logistics

- Format: single session, ~2 hours.
  - 0:00–0:10 — kickoff, keys handed out
  - 0:10–1:30 — agent window (hard stop)
  - 1:30–1:50 — live judging + leaderboard
  - 1:50–2:00 — winner & debrief
- Pre-reading (sent the day before): this file + `SPEC.md` + the repo. Plan your
  harness before the clock starts; you just can't spend tokens until keys are issued.
