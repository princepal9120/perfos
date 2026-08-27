"""PerfOS CLI — drive the whole ad lifecycle from a terminal.

    perfos search "Notion" --limit 10     # spy the public ad libraries
    perfos winners                        # ranked competitor winners
    perfos clone <ad_id> --generate       # remix a winner into your own hooks
    perfos loop --persona saas            # find -> ... -> double-down (dry run)
    perfos mcp                            # stdio MCP server for Claude/Cursor

Talks to a running PerfOS API (``PERFOS_API_URL``, default localhost:8000) so
the CLI, the MCP server, and the dashboard all share one code path.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any

import httpx

API_URL = os.environ.get("PERFOS_API_URL", "http://127.0.0.1:8000").rstrip("/")
WORKSPACE_ID = os.environ.get("PERFOS_WORKSPACE_ID", "1")
TOKEN = os.environ.get("PERFOS_API_TOKEN", "")
# Measurement routes are workspace-scoped; the demo key matches the backend default.
API_KEY = os.environ.get("PERFOS_API_KEY", "perfos-demo-key")


def _call(endpoint: str, *, method: str = "GET", body: Any = None, params: Any = None) -> Any:
    headers = {
        "Accept": "application/json",
        "X-Workspace-Id": WORKSPACE_ID,
        "X-API-Key": API_KEY,
    }
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    try:
        resp = httpx.request(
            method, f"{API_URL}/api{endpoint}", json=body, params=params,
            headers=headers, timeout=300.0,
        )
    except httpx.HTTPError as exc:
        raise SystemExit(f"perfos: cannot reach API at {API_URL} ({exc})") from exc
    if resp.status_code >= 400:
        raise SystemExit(f"perfos: API {resp.status_code}: {resp.text[:400]}")
    return resp.json() if resp.content else {}


def _table(rows: list[dict], columns: list[str]) -> str:
    if not rows:
        return "(no results)"
    widths = {c: max(len(c), *(len(str(r.get(c, ""))[:48]) for r in rows)) for c in columns}
    head = "  ".join(c.upper().ljust(widths[c]) for c in columns)
    sep = "  ".join("-" * widths[c] for c in columns)
    body = "\n".join(
        "  ".join(str(r.get(c, ""))[:48].ljust(widths[c]) for c in columns) for r in rows
    )
    return f"{head}\n{sep}\n{body}"


def _emit(data: Any, as_json: bool, columns: list[str] | None = None) -> None:
    if as_json or not columns or not isinstance(data, list):
        print(json.dumps(data, indent=2, default=str))
        return
    print(_table(data, columns))


def cmd_search(a: argparse.Namespace) -> None:
    data = _call(
        "/discovery",
        method="POST",
        body={
            "query": a.query,
            "persona": a.persona,
            "channels": a.channels.split(",") if a.channels else None,
            "country": a.country,
            "limit": a.limit,
        },
    )
    _emit(data, a.json, ["ad_id", "platform", "advertiser", "score", "tier", "hook"])


def cmd_winners(a: argparse.Namespace) -> None:
    data = _call("/winners", params={"limit": a.limit})
    _emit(data, a.json, ["ad_id", "platform", "competitor", "score", "tier", "title"])


def cmd_clone(a: argparse.Namespace) -> None:
    data = _call("/clone", method="POST", body={"ad_id": a.ad_id, "generate": a.generate})
    if a.json:
        print(json.dumps(data, indent=2, default=str))
        return
    src = data["source"]
    print(f"{src['advertiser']} · {src['platform']} · score {src['score']} ({src['tier']})")
    print(f"  original: {src.get('hook') or '(none)'}\n")
    for i, line in enumerate(data["variants"], 1):
        print(f"  {i}. {line}")
    for asset in data.get("assets", []):
        print(f"  asset: {asset['asset_url']} ({asset.get('provider')})")


def cmd_generate(a: argparse.Namespace) -> None:
    print(json.dumps(_call("/create", method="POST", body={"persona": a.persona}), indent=2))


def cmd_assets(a: argparse.Namespace) -> None:
    _emit(_call("/assets"), a.json, ["asset_url", "provider", "duration_s"])


def cmd_loop(a: argparse.Namespace) -> None:
    data = _call(
        "/loop",
        method="POST",
        body={"persona": a.persona, "dry_run": not a.live, "query": a.query},
    )
    if a.json:
        print(json.dumps(data, indent=2, default=str))
        return
    print(f"loop persona={data.get('persona')} dry_run={data.get('dry_run')}")
    for stage, count in (data.get("stages") or {}).items():
        print(f"  {stage:<12} {count}")
    for d in data.get("decisions") or []:
        print(f"  decision: {d.get('asset_id')} -> {d.get('decision')} ({d.get('reason')})")


def cmd_status(a: argparse.Namespace) -> None:
    print(json.dumps(_call("/loop/status"), indent=2, default=str))


def cmd_capabilities(a: argparse.Namespace) -> None:
    data = _call("/capabilities")
    _emit(
        data if a.json else data.get("capabilities", []),
        a.json,
        ["id", "safety", "cli", "mcp"],
    )


def cmd_measure(a: argparse.Namespace) -> None:
    print(json.dumps(_call(f"/{a.metric}"), indent=2, default=str))


def cmd_mcp(a: argparse.Namespace) -> None:
    from app.mcp_server import main as mcp_main

    mcp_main()


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="perfos", description=__doc__.split("\n")[0])
    p.add_argument("--json", action="store_true", help="raw JSON instead of a table")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("search", help="search public ad libraries for a competitor")
    s.add_argument("query")
    s.add_argument("--persona", default="saas")
    s.add_argument("--channels", help="comma-separated, e.g. meta,tiktok")
    s.add_argument("--country", default="US")
    s.add_argument("--limit", type=int, default=30)
    s.set_defaults(func=cmd_search)

    w = sub.add_parser("winners", help="ranked competitor winners")
    w.add_argument("--limit", type=int, default=20)
    w.set_defaults(func=cmd_winners)

    c = sub.add_parser("clone", help="remix a winner into your own hooks")
    c.add_argument("ad_id")
    c.add_argument("--generate", action="store_true", help="also render clips")
    c.set_defaults(func=cmd_clone)

    g = sub.add_parser("generate", help="generate creative from the top winners")
    g.add_argument("--persona", default="saas")
    g.set_defaults(func=cmd_generate)

    sub.add_parser("assets", help="list generated creative").set_defaults(func=cmd_assets)

    lo = sub.add_parser("loop", help="run the full lifecycle once")
    lo.add_argument("--persona", default="saas")
    lo.add_argument("--query", help="competitor/keyword to spy live")
    lo.add_argument("--live", action="store_true", help="disable dry run (still policy-gated)")
    lo.set_defaults(func=cmd_loop)

    sub.add_parser("status", help="last lifecycle run").set_defaults(func=cmd_status)

    sub.add_parser(
        "capabilities", help="discover REST, CLI, and MCP capabilities"
    ).set_defaults(func=cmd_capabilities)

    m = sub.add_parser("measure", help="measurement endpoints")
    m.add_argument(
        "metric",
        choices=["reconcile", "attribution", "iroas", "creatives", "anomalies", "briefing"],
    )
    m.set_defaults(func=cmd_measure)

    sub.add_parser("mcp", help="run the stdio MCP server").set_defaults(func=cmd_mcp)
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    args.func(args)
    return 0


if __name__ == "__main__":
    sys.exit(main())
