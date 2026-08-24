# License Matrix — OSS Candidates

Date: 2026-08-24. Verified by inspecting LICENSE file, `package.json` license field, and README license clause on each local clone.

## Rule from the brief
> "Never assume: 'It's on GitHub, therefore we can use it commercially.'"

This matrix exists because that assumption is wrong for at least one candidate (Adspirer).

## Verdict legend
- REUSE — clean permissive license, safe to fork/wrap/commercialize.
- TRAP — file/marketing says OSS but terms forbid commercial reuse. DO NOT USE as a base.
- REVIEW — permissive file but missing/ambiguous LICENSE file; get the file or legal confirmation before reuse.

| Project | Repo | LICENSE file | package.json | README clause | Verdict | Commercial-use risk |
|---|---|---|---|---|---|---|
| Advertising Hub core | itallstartedwithaidea/advertising-hub | MIT (LICENSE) | — | MIT | **REUSE** | None. Clean MIT. |
| Google Ads MCP (official) | googleads/google-ads-mcp | Apache-2.0 | — | — | **REUSE** | None. Apache-2.0. |
| Meta Ads MCP | mikusnuz/meta-ads-mcp | MIT | — | — | **REUSE** | None. |
| Paid-Media-MCP | Pauesome/Paid-Media-MCP | MIT | MIT | MIT | **REUSE** | None. |
| GoMarble Google Ads MCP | gomarble-ai/google-ads-mcp-server | MIT | — | MIT | **REUSE** | None. |
| GoMarble Facebook Ads MCP | gomarble-ai/facebook-ads-mcp-server | MIT | — | MIT | **REUSE** | None. |
| GoMarble AI Media Buyer | gomarble-ai/ai-media-buyer | MIT | MIT | MIT | **REUSE** | None. Methodologies/skills are reusable as reference. |
| GoMarble AI Ads OS | gomarble-ai/ai-ads-os | MIT | MIT | MIT | **REUSE** | None. 36 skills = best methodology reference. |
| Meta Ads Kit | TheMattBerman/meta-ads-kit | MIT | — | MIT/GPL mention | **REUSE** | GPL mention is in README body copy only; LICENSE file is MIT. Use MIT. |
| OpenAds | lamorim-net/openads-ai | **NONE in repo** | MIT | "MIT" | **REVIEW** | No LICENSE file present. package.json + README say MIT, but a missing LICENSE file is a real risk for a commercial product. Obtain the explicit LICENSE file or written grant before reuse. CLI/skills are reusable as reference regardless. |
| Adspirer / ads-mcp | amekala/ads-mcp | MIT (file) | — | **"Proprietary — See Terms of Service"** | **TRAP** | README line ~312 explicitly overrides the LICENSE file. It is a hosted SaaS competitor, not a reusable foundation. DO NOT reuse its server, tools, or agent. Reference its UX ideas only. |

## Key finding
`amekala/ads-mcp` (Adspirer) is the textbook example of the brief's warning. It ships an `LICENSE` file marked MIT but its own README states **"Proprietary — See Terms of Service."** When a license file and the terms of service conflict, the terms of service / explicit proprietary statement control for a commercial product. We treat it as closed-source. It is also a direct competitor (hosted MCP, $0–$167/mo).

## Dependency license note
- advertising-hub/core depends on: httpx, pydantic, python-dotenv (all permissive). Optional platform SDKs (google-ads, facebook-business, bingads) are permissive too but bring their own terms of use for the ad APIs themselves (API terms, not code license).
- All MCP servers above are Python (FastMCP) or Node (TypeScript). No copyleft contamination found in the reusable code paths.

## Action
- Fork/reuse: advertising-hub/core, googleads/google-ads-mcp, mikusnuz/meta-ads-mcp, Pauesome/Paid-Media-MCP, GoMarble servers + skills.
- Reference-only (do not copy code): OpenAds (until LICENSE resolved), GoMarble skills (methodology, MIT so actually copyable), Meta Ads Kit, Adspirer (UX only).
