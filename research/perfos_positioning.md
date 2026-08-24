# PerfOS Positioning & Build Plan

## Wedge
Local, BYOK, all-channels, policy-gated performance-marketing OS. The safe-by-
default alternative to Triple Whale / Northbeam / Sellforte, which auto-push.

## Channels to support (expand from 3 to 10)
Current backend enum: google, meta, shopify.
Add: tiktok, linkedin, pinterest, snapchat, amazon, reddit, twitter, youtube.
(13 total incl shopify as source-of-truth commerce.)

## Competitor features to fold in (see competitors.md)
1. Unified measurement (MTA + MMM + incrementality loop)
2. iROAS per channel (incrementality-corrected)
3. Incrementality / geo testing (holdout experiments)
4. Budget optimizer (what-if reallocation)
5. Creative analytics (fatigue + per-creative perf)
6. Anomaly detection (spend/revenue spikes)

## Safety layer (the differentiator)
Every recommendation from any of the above flows through:
policy check -> human approval -> audit log + rollback plan -> execution.
Existing services already implement this (services/execution.py, audit.py).
New features must use the SAME gate, never bypass it.

## Stack
Nx monorepo: apps/api (FastAPI, sqlite mock), apps/web (Next.js, static export).
Model for coding: opencode-go/ox-alpha-free.
Private GitHub: princepal9120/perfos.
