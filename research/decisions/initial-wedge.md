# Decision — Product Wedge (MVP scope)

Decision date: 2026-08-24
Method: advise-project-approach. Score each wedge on pain × frequency × money impact ×
competition × implementation difficulty (lower=better).

## Candidate wedges
| Wedge | Pain | Freq | Money | Competition | Difficulty | Pick? |
|---|---|---|---|---|---|---|
| A. AI daily performance analyst | 4 | 5 | 3 | High (Triple Whale Moby) | Low | runner-up |
| B. AI budget optimizer | 4 | 3 | 5 | Med | Med | maybe |
| C. AI creative fatigue detector | 4 | 4 | 4 | Low (niche) | Low | strong |
| D. AI attribution/reconciliation | 5 | 5 | 5 | Med (Northbeam too pricey) | Med | **WINNER** |
| E. AI campaign operator | 3 | 3 | 4 | High (Adspirer etc) | High | no |
| F. Full AI performance marketer | 5 | 5 | 5 | Med | Very high | no (too big) |

## Chosen wedge: D — Honest Cross-Channel Attribution & Reconciliation
("Show me what actually happened to my money, not what Meta and Google each claim.")

Why this wedge wins:
1. Highest pain + frequency + money impact. The 15–50% double-count is the single most
   documented, most expensive, least-solved problem for the ICP. It is the root cause behind
   "ROAS doesn't match," "Meta attribution inaccurate," "why is my P&L different from my
   dashboard."
2. Weak incumbent at our price point. Northbeam solves it rigorously but starts at $1,500/mo
   (out of reach for ICP). Triple Whale's free/cheap tiers lack MMM/incrementality. The
   category has a honesty gap at SMB price — exactly our opening.
3. Defensible moat from day one: the reconciliation logic + customer-specific memory +
   outcome history (brief Phase 32) is IP, not a connector. Connectors are commoditized
   (we reuse OSS); the truth layer is ours.
4. Natural expansion path: reconciliation → daily analyst (wedge A) → budget optimizer
   (B) → creative fatigue (C) → safe operator (E) → full CMO (F). Wedge D is the foundation
   the others build on, so we don't paint ourselves into a corner.

## What the MVP wedge delivers (concrete)
1. Connect Meta + Google (+ Shopify revenue as source of truth).
2. Pull spend + conversions from each platform.
3. Pull revenue from Shopify/Stripe (the real number).
4. Reconcile: compute blended MER (revenue ÷ total spend) and show the double-count gap
   (platform sum vs actual). Flag >10–15% over-count as a tracking-integrity issue.
5. Attribute revenue to channels with a model we can explain (blended + simple MTA-lite),
   anchored to actual sales.
6. Daily briefing: "Spend X, Revenue Y, Blended ROAS Z, Meta claims A, Google claims B,
   overlap = C. Recommended: ...".
7. Then (phase 2 of MVP): structured, approval-gated recommendation to reallocate budget
   from over-credited to under-credited channel — executed safely against mock then real.

## Rejected as the FIRST wedge
- F (full CMO): violates "do not build everything." Phase 37/39/40 target, not start.
- E (operator): high difficulty, high competition, high risk. We add execution AFTER truth.
- A (daily analyst): good but sits ON TOP of reconciliation; we include it as the delivery
  format, not the differentiator.

## Failure condition
If reconciliation alone proves too thin to justify $99+/mo (i.e. users see the gap but don't
pay), bundle wedge A (daily analyst) into the same MVP — they are complementary and the
daily briefing is the natural UI for the reconciliation output.
