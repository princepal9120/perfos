"""Agent-native parity for the Ad Library: every route reachable via MCP and CLI.

The Ad Library shipped as API + web only. These tests keep the agent surfaces
from drifting behind it again.
"""

import ast
import pathlib
import re

import pytest

SRC = pathlib.Path(__file__).resolve().parents[1] / "src" / "app"

# Every /ad-library route the API exposes, as (method, path-without-prefix).
AD_LIBRARY_ROUTES = {
    ("POST", "/ad-library/search"),
    ("GET", "/ad-library"),
    ("GET", "/ad-library/saved"),
    ("POST", "/ad-library/saved"),
    ("DELETE", "/ad-library/saved/{ad_id}"),
    ("GET", "/ad-library/competitors"),
    ("POST", "/ad-library/competitors"),
    ("DELETE", "/ad-library/competitors/{name}"),
    ("POST", "/ad-library/competitors/{name}/sync"),
    ("GET", "/ad-library/{ad_id}"),
}


def _mcp_endpoints() -> set[tuple[str, str]]:
    """(method, endpoint) pairs every @mcp.tool reaches, parsed from the source."""
    src = (SRC / "mcp_server.py").read_text()
    tree = ast.parse(src)
    found: set[tuple[str, str]] = set()
    for node in ast.walk(tree):
        if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            continue
        if not any(getattr(d, "attr", getattr(d, "id", "")) == "tool" for d in node.decorator_list):
            continue
        seg = ast.get_source_segment(src, node) or ""
        for ep, meth in re.findall(r'api_request\(\s*f?"([^"]+)"(?:[^)]*?method="(\w+)")?', seg):
            found.add(((meth or "GET").upper(), ep))
    return found


def _normalize(endpoint: str) -> str:
    """f-string interpolations become the route's path-param placeholder."""
    endpoint = re.sub(r"\{ad_id\}", "{ad_id}", endpoint)
    endpoint = re.sub(r"\{name\}", "{name}", endpoint)
    return endpoint


@pytest.mark.parametrize(("method", "path"), sorted(AD_LIBRARY_ROUTES))
def test_every_ad_library_route_has_an_mcp_tool(method, path):
    reachable = {(m, _normalize(e)) for m, e in _mcp_endpoints()}
    assert (method, path) in reachable, (
        f"{method} /api{path} is not reachable by an agent — add an @mcp.tool for it"
    )


def test_ad_library_routes_are_mounted():
    """Guards against the tools pointing at routes that no longer exist.

    Read from the OpenAPI schema, not app.routes: this FastAPI resolves included
    routers lazily, so app.routes holds _IncludedRouter objects until startup.
    """
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as c:
        paths = c.get("/openapi.json").json()["paths"]
    mounted = {
        (m.upper(), p.removeprefix("/api"))
        for p, ops in paths.items()
        for m in ops
        if p.startswith("/api/ad-library")
    }
    missing = AD_LIBRARY_ROUTES - mounted
    assert not missing, f"tools target unmounted routes: {sorted(missing)}"


def test_cli_exposes_the_ad_library():
    from app.cli import build_parser

    parser = build_parser()
    adlib = next(
        a for a in parser._subparsers._group_actions[0].choices.items() if a[0] == "adlib"
    )[1]
    commands = set(adlib._subparsers._group_actions[0].choices)
    assert {"search", "browse", "ad", "save", "saved", "competitors"} <= commands


def test_cli_tier_choices_match_the_scorer():
    """The Ad Library scores with winner_tiers, not winner_engine's longevity tiers."""
    from app.cli import build_parser
    from app.discovery.score import winner_tiers

    parser = build_parser()
    adlib = parser._subparsers._group_actions[0].choices["adlib"]
    browse = adlib._subparsers._group_actions[0].choices["browse"]
    tier_action = next(a for a in browse._actions if a.dest == "tier")

    expected = {winner_tiers.HIGH_CONF, winner_tiers.WINNER, winner_tiers.EMERGING, winner_tiers.LOSER}
    assert set(tier_action.choices) == expected


def test_mcp_browse_documents_the_right_tier_vocabulary():
    """Two tier vocabularies exist in this repo; the tool must name the correct one."""
    from app.mcp_server import adlib_browse

    doc = getattr(adlib_browse, "fn", adlib_browse).__doc__ or ""
    assert "high_conf" in doc
    assert "proven/strong" not in doc, "that is winner_engine's vocabulary, not the library's"
