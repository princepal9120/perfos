# Decision — Initial ICP

Decision date: 2026-08-24
Method: advise-project-approach (constraint-fit + comparable evidence, not popularity).
Evidence: research/competitors/landscape.md, research/customer-pain/evidence.md,
research/pricing/willingness-to-pay.md, OSS reverse-engineering in research/oss/.

## Candidates scored (1-5: pain, frequency, ad spend, willingness-to-pay,
## data availability, integration difficulty [inverse], sales complexity [inverse], competition)
| ICP | Pain | Freq | Spend | WTP | Data | Integ | Sales | Comp | Total |
|---|---|---|---|---|---|---|---|---|---|
| Solo DTC founder | 5 | 5 | 3 | 4 | 3 | 3 | 5 | 4 | 32 |
| E-com brand ($1-20M) | 5 | 5 | 4 | 4 | 4 | 3 | 4 | 4 | 33 |
| SaaS startup | 3 | 4 | 2 | 3 | 3 | 3 | 4 | 3 | 25 |
| Agency (manages many) | 5 | 5 | 4 | 5 | 4 | 2 | 2 | 3 | 30 |
| Growth team (mid) | 4 | 4 | 3 | 3 | 4 | 3 | 3 | 4 | 28 |
| Enterprise | 4 | 4 | 5 | 5 | 5 | 1 | 1 | 2 | 27 |

## Chosen ICP: E-commerce brands ($1M–$20M GMV) + solo DTC founders (merged "DTC operator")
Rationale (constraint fit):
- Highest combined pain + frequency + spend among reachable segments.
- The documented pain (attribution double-count 15–50%, manual reconciliation 16–30hr/mo,
  creative fatigue caught late) is acute and recurring for anyone running Meta+Google.
- Willingness to pay is proven: Triple Whale ($129–$749/mo) already sells to exactly this
  segment; Northbeam is too expensive for them, leaving a honesty gap we fill.
- Data availability is good: Shopify/Stripe revenue + Meta + Google are all accessible via
  existing OSS connectors (advertising-hub/core, GoMarble MCP, Pauesome adapter pattern).
- Integration difficulty is moderate (we reuse OSS connectors — not rebuilding).
- Sales complexity is LOW: self-serve SaaS, no enterprise procurement. This matters for a
  solo-founder building phase 1 (per brief: local-first, ship then scale).

## Rejected alternatives (and why)
- Enterprise: best WTP but integration/sales complexity kills a phase-1 solo build. Revisit
  at phase 3 (multi-account, SSO).
- Agency: high WTP and pain, but multi-client multi-tenant + sales complexity is a phase-2
  concern. Agencies are a future expansion, not the wedge ICP.
- SaaS startup: lower ad spend, lower attribution pain (long sales cycles, Lead-gen not
  commerce). Weaker fit for the reconciliation wedge.

## Failure condition / when to reconsider
If Shopify/Meta/Google connector reliability proves too low for self-serve, or if early
traction shows agencies convert better than DTC, shift ICP to agency (phase 2).
