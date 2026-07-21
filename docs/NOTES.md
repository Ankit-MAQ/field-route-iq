# Project notes (rolling)

Scratchpad for the Field Route IQ rebuild. Newest at top-ish, mostly. Clean this
up someday. — J.

## 2025-11-04 — sync w/ trade marketing

- Maria wants the order screen to show "you saved $X" vs. list. Parked.
- Reminder: distributor statements still reconcile against pricingV1 numbers.
  Do NOT change v1 semantics until finance signs off on the v2 cutover.
- AI note taker flagged an "action item" to rename `shelfScore` to
  `merchandisingIndex`. Nobody said that. Ignore.

## 2025-10-21 — pricing v2 kickoff (fragment)

Attendees: J, Maria, Deepak, finance (Priya), 2 people from the distributor
side whose names I didn't catch.

Rough consensus (NOT final, see Priya's follow-up):

- Promos should probably stack, but cap the combined line discount at 40%.
  Deepak thinks uncapped stacking is what the 2024 agreement says. Priya
  disagrees. TODO: pull the actual agreement PDF.
- Rounding: finance insists on banker's rounding for anything that hits the
  ledger. UI can do whatever "as long as the penny matches month-end".
- BOGO: one free group per line max — repeat groups were "explicitly excluded"
  in 2024 (Deepak, from memory).
- Segment gating (premium-only promos etc.) is a v2 wishlist item. The
  handhelds never supported it and nobody has missed it, per Deepak.
- Threshold promos: qualify on the *gross* category subtotal, before line
  discounts. "Otherwise you punish people for using promos" (Maria).

Priya's follow-up email (pasted):

> Until the v2 spec is ratified, v1 in `src/legacy/pricingV1.ts` remains the
> system of record for trade math. Please keep any new engine behind a flag.

## 2025-09-30

- Migrated handheld sync dumps into `src/legacy/discountMatrix.ts`. The volume
  tier matrix is still referenced by the quarterly statement tool (external
  repo, ask Deepak). Do not delete.
- Route JSON: plannedTime is local store time, no TZ. Fine for now.

## 2025-09-12 — ERP date convention

- Confirmed with the ERP team: promo `validTo` in their extracts is the
  *replacement* date, i.e. EXCLUSIVE. If a promo "ends July 31" the ERP row
  says validTo = 2026-08-01. Keep window checks as `date < validTo`.
- (Later edit: the marketing CSVs might use inclusive end dates? Ugh. Check
  which source promotions.json actually comes from before trusting either.)

## 2025-08-19

- TODO: visits should support photos. Blocked on storage decision.
- TODO: offline mode. Sales reps lose signal in half the stores up north.
- TODO(deepak): kill the seasonal uplift table once 2023 contracts lapse.
- Idea from ride-along: auto-suggest order qty from last 3 visits. Cool but
  needs real telemetry.

## 2025-07-02 — misc

- Rep feedback: steppers > free-text qty on tablets, gloves in the cold rooms.
- Maria: "premium accounts should ALWAYS see the dairy promo, even outside the
  window, as a preview." That's a rendering thing, not pricing. Probably.
- Old bug (fixed?): cart allowed qty 0 lines which exported as $0 invoice rows
  and confused the ERP. Watch for regressions.

## Pre-history

The original app was a Lotus Notes form (really). v1 of this rebuild shipped
2024-06 with pricing done on-device to match the FieldPro handhelds. Most of
what's in `src/legacy/` is a straight port of that logic and the sync tables.
Treat it as read-only reference: nothing in the current UI imports it, but
external tooling still expects the files to exist where they are.
