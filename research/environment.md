# Environment Verification — AI Performance Marketing OS

Date: 2026-08-24

## Required skills

| Skill | Status | Notes |
|-------|--------|-------|
| /agent-reach | AVAILABLE | readiness_status: available. 15 platforms, multi-backend routing (OpenCLI / per-platform CLIs / APIs). Zero-config for 6 channels. Used for GitHub, web, Reddit, X, YouTube research. |
| /advise-project-approach | AVAILABLE | readiness_status: available. Used for ICP choice, wedge choice, architecture decisions, reuse vs build, pricing. Read-only by default; must ask before running OSS project scripts/tests. |

Neither skill was modified. Both are external capabilities consumed by this project.

## Tooling available
- `gh` CLI (GitHub). Verified below.
- `git` for cloning.
- Native web_search / web_extract as secondary research channel (complements agent-reach; does not replace it).
- Local dev: docker, node, python expected for later phases.

## Rules acknowledged
- Do NOT build the SaaS yet. Research -> decide -> gate -> then build.
- Do NOT run OSS project installs/tests without explicit go-ahead (advise-project-approach is read-only by default).
- Reuse OSS over new code wherever license + quality permit.
- Record every material decision in research/decisions/.
