# Quickstart — how to compete (5-minute read)

Goal: get an AI agent to build `src/pricing/engine.ts` per `SPEC.md`, **correctly and for
the fewest AI credits.** You build the *harness*; the agent builds the feature. Read
`RULES.md` for the full rules; this is just the mechanics.

## 1. Get set up
1. Accept the repo invite (email, or https://github.com/tyecolemanmaq/field-route-iq/invitations).
2. Clone and make your branch:
   ```bash
   git clone https://github.com/tyecolemanmaq/field-route-iq
   cd field-route-iq
   npm install
   git checkout -b submit/<your-name>
   ```

## 2. Build your harness (this is the competition)
Author whatever helps your agent understand this brownfield repo fast and correctly —
a `.github/copilot-instructions.md`, a distilled/annotated version of the spec, a repo-map
of what to read and what to ignore. `SPEC.md` is the only source of truth; **some files
here are deliberately wrong** (`src/legacy/`, `docs/NOTES.md`) — a good harness tells the
agent to ignore them.

## 3. Run the agent (GitHub Copilot in VS Code)
- Open the repo in VS Code, open **Copilot Chat**, switch to **Agent** mode, pick your model.
- Point it at your harness and have it create **`src/pricing/engine.ts`**. That's the only
  file it should build. **Do not have it write or run tests** — there are none, and it must
  not score itself.
- Every run spends AI credits, and **your cost is cumulative** — so a lean harness that gets
  it right in one cheap run beats lots of expensive retries.

## 4. Read your cost  ← the number for COST.txt
In the **Copilot Chat input box**, hover (or click) the **context-window control** — the
popover shows **"total cost in credits … for the whole session."** That credits number is
your cost. (Do all your work in **one chat session** so it reflects your true total; hovering
an individual response shows that turn's cost.)

Put that number in a file `COST.txt` at the repo root:
```bash
echo "9.25" > COST.txt      # <- your total AI credits, e.g. 9.25
```
> 1 AI credit = $0.01. Credits already account for model price, so a cheaper model = fewer
> credits. Under-reporting is a DQ — the facilitator reconciles the top scores against the
> Copilot usage dashboard.

## 5. Submit (and resubmit to climb)
```bash
git add src/pricing/engine.ts COST.txt
git commit -m "submission"
git push -u origin submit/<your-name>
```
That's a submission. At each **checkpoint** the judge posts your score + cost on the live
board (you won't see *which* tests failed — reason from the spec). Refine your harness, maybe
switch models, update `COST.txt`, and **push again** to improve. **Pencils down = your last
push** before the final checkpoint.

## Scoring recap
- **Gate:** your engine must pass **38/38 core** hidden tests to qualify.
- **Champion:** lowest total AI-credit cost among those who qualify.
- **Sharpshooter:** most bonus edge tests passed.
