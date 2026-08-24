# itallstartedwithaidea org — sibling repos (flagged by user)

User pointed at github.com/itallstartedwithaidea. We cloned `advertising-hub` (the umbrella
repo). Its README + AGENTS.md reference these sibling repos in the same org. They were NOT
cloned yet (org-wide enumeration was blocked by a consent prompt mid-session).

## Named sibling repos (from advertising-hub README)
- itallstartedwithaidea/google-ads-mcp — Live Google Ads MCP server (referenced as the
  reference implementation for the MCP SPEC).
- itallstartedwithaidea/google-ads-api-agent — Enterprise Google Ads management on Claude.
- itallstartedwithaidea/google-ads-gemini-extension — Gemini CLI extension for Google Ads.
- itallstartedwithaidea/gemini-cli-googleadsagent — Gemini CLI fork with Google Ads commands.
- itallstartedwithaidea/creative-asset-validator — Multi-platform creative validation.
- itallstartedwithaidea/agency-agents — 7 production agent specs (the 25+ agents source).

## Why they matter
- `google-ads-mcp` is a likely clean OSS Google Ads MCP we can fork/wrap (companion to the
  MIT advertising-hub core). Worth cloning + license-checking before we finalize the
  connector layer.
- `creative-asset-validator` could feed the deferred creative-fatigue wedge.

## Action (deferred, needs consent for network enumerate)
Clone + license-check these when the network/org enumeration is permitted. Until then,
`advertising-hub/core` already gives us the canonical model + auth + normalizer we need for
the MVP, so the build is unblocked without them.
