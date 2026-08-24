# Competitor Feature Matrix (Performance Marketing OS, 2026)

Source: vendor sites + D2C Times comparison (June 2026). Stars/VC where known.

## The 6 features every leader ships
1. **Unified measurement** — MTA + MMM + Incrementality in one continuously
   calibrated loop. Compass (Triple Whale), Lifesight, Sellforte, Measured.
2. **iROAS** — incrementality-corrected ROAS per channel, not platform-inflated
   ROAS. Sellforte delivers this at campaign + ad-set level daily.
3. **Incrementality / geo testing** — holdout experiments that calibrate the
   model. Northbeam (native geo holdout, Mar 2026), Measured (geo-matched),
   Sellforte (Experiments Hub).
4. **Budget optimizer** — what-if reallocation to maximize incremental revenue.
   Measured Media Plan Optimizer, Sellforte marginal-return curves.
5. **Creative analytics** — fatigue detection, per-creative performance.
   Triple Whale Creative Cockpit.
6. **Anomaly detection** — auto-flag spend/revenue spikes. Implied by all.

## Per-vendor notes
- **Triple Whale** ($200-600/mo, Shopify SMB). Pixel + Sonar identity graph +
  CAPI. Moby 2 AI teammate. Creative Cockpit. MMM early/beta. 80+ connectors.
  Weakness: limited offline/CTV, MMM nascent.
- **Northbeam** ($1.5k-10k/mo, $10M-300M ARR). Multi-touch blended confidence +
  MMM. Native geo holdout (Mar 2026). Strong cross-channel. Weakness: steep
  price, 6-8 wk onboarding, web-only.
- **Measured** (enterprise, $35B media measured). Incrementality + MMM + 300+
  connectors. Media Plan Optimizer. MCP server for exec/analyst Q&A.
- **Sellforte** (retail/ecom). Always-on Causal Bayesian MMM + calibration
  multipliers + Media Buyer Agent that pushes approved changes to Meta/Google/
  TikTok via API. Closes loop measurement->recommendation->execution->learning.
- **Lifesight** — Autonomous MMM calibration, iROAS by channel, agentic UMM.

## The gap PerfOS fills
Every leader above **auto-pushes** approved (or even autonomous) changes to ad
platforms. None expose a **policy engine that blocks execution until a human
approves**, with a full audit trail + rollback plan. PerfOS's wedge:
measurement parity + competitor features, but **safe-by-default**: every
recommendation (budget shift, creative pause, experiment launch) is checked by
policy, logged, and requires explicit approval before any write to an ad account.

## Benchmark figures worth citing (real, sourced)
- Last-click Meta can undervalue Paid Social by up to 17x vs true incremental.
- Up to 40% of ad spend is non-incremental (Digiday / Lifesight).
- Northbeam blended model within 12% of econometric ground truth; last-click
  Meta within 19%.
- Triple Whale Pixel recovers ~85% of orders that would show as "direct".
- Demo dataset PerfOS uses: platforms claimed 5.5x ROAS, actual 3.9x (33% over).
