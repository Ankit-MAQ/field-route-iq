# Quickstart — how to compete (5-minute read)

Goal: get an AI agent to build `src/pricing/engine.ts` per `SPEC.md`, **correctly and for the
fewest AI credits.** You build the *harness*; the agent builds the feature. See `RULES.md` for
the full rules, or open `guide.html` for the visual version.

## 0. One-time setup — do this BEFORE the session
- **Node 20+** — check with `node --version`.
- **Install the Copilot CLI:** `npm install -g @github/copilot`
- **Sign in:** run `copilot` and authenticate with the **GitHub account that has your Copilot
  license** (your work account — *not* a personal one). Verify: `copilot -p "hello"` should
  print an `AI Credits …` line. No line = wrong account / no Copilot access; fix it now.

## 1. Fork & clone
Fork this repo on GitHub (top-right button), then:
```bash
git clone https://github.com/<you>/field-route-iq
cd field-route-iq
npm install
```

## 2. Build your harness (this is the competition)
Author whatever helps your agent understand this brownfield repo fast and correctly — a
`.github/copilot-instructions.md`, a distilled spec, a repo-map of what to read and what to
ignore. **`SPEC.md` is the only source of truth; not everything else in the repo is reliable.**
All your competitive edge lives in these files + your model choice — not in a prompt.

## 3. Run the agent — it auto-records your cost
```bash
node agent-run.mjs --model <your-model>
```
This runs Copilot (CLI) with a fixed prompt against **your** harness files, writes only
`src/pricing/engine.ts`, then **adds the run's exact credits to `COST.txt`** and prints
`compiles: ✓/✗`. Cost is **cumulative** — a lean harness that lands it in one cheap run beats a
pile of retries. Switch `--model` to find the cheapest model your harness can carry.

## 4. Submit (and resubmit to climb)
```bash
git add src/pricing/engine.ts COST.txt
git commit -m submission
git push
```
The judge auto-discovers your fork at each **checkpoint** and posts your score + cost on the live
board (you won't see *which* tests failed — reason from the spec). Refine, re-run, push again.
**Pencils down = your last push.**

## Scoring
- **Gate:** your engine must pass **38/38 core** hidden tests to qualify.
- **Champion:** lowest total AI-credit cost among those who qualify. Ties → most of the 8 bonus
  edge-case tests, then earliest to qualify.
