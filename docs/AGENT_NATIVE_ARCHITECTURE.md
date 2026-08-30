# PerfOS agent-native architecture

## Current shape

PerfOS is an Nx monorepo with a FastAPI control plane and a statically exported
Next.js dashboard. REST is the canonical remote boundary. The `perfos` CLI and
FastMCP server call the same REST endpoints, while the dashboard uses the typed
Axios client in `apps/web/lib/api.ts`.

The machine-readable contract is available from all three agent surfaces:

- REST: `GET /api/capabilities`
- CLI: `perfos capabilities` (`--json` for automation)
- MCP: `platform_capabilities`

All lifecycle HTTP routes require workspace authentication. External writes
remain dry-run by default and pass through policy, approval, and audit controls.

## Domain boundaries

- `app/api/routes.py`: workspace, measurement, recommendations, agents, MCP
  registry, integrations, command center, and chat.
- `app/discovery`: public-library collection, normalization, ranking, and ad
  library persistence.
- `app/create`: hook remix and creative asset generation.
- `app/loop`: find → score → create → launch → track → double-down orchestration.
- `app/agents` and `app/services`: analysis, policy, approval, execution, and
  audit behavior.
- `app/mcp_server.py`: production MCP adapter, including lifecycle tools.
- `app/cli.py`: automation-friendly terminal adapter.

## Remaining production hardening

The current build is safe for local/demo operation, but these changes should
precede multi-tenant autonomous execution:

1. Replace JSON/process-local winner, asset, loop, and launch-draft state with
   workspace-scoped database tables and append-only run events.
2. Introduce durable command IDs/idempotency keys and correlate every tool call,
   proposal, approval, execution, rollback, and audit event.
3. Replace timestamp-only agent dispatch and mocked MCP registry health with
   real transport adapters, capability discovery, and durable jobs.
4. Move browser authentication behind a server/session boundary; production
   builds no longer fall back to the demo API key, but static export still sends
   configured credentials from the browser.
5. Split the large core route module only after its behavior is locked with
   router-level contract tests.

Do not bypass the shared capability and policy vocabulary by adding UI-only,
CLI-only, or MCP-only actions. New user actions must be expressible through an
authenticated backend capability so humans and agents have equivalent access.
