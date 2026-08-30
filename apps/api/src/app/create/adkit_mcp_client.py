"""Client wrapper around the adkit/ads-mcp server (spy + create + launch tools).

Mock-safe by default: when MOCK_MODE is on (repo default) or no adkit MCP URL
is configured, every call is answered by a deterministic local transport seeded
by the sha256 of the request — no network, no keys, no LLM calls.

The real transport speaks JSON-RPC 2.0 over HTTP to a running adkit/ads-mcp
server (ADKIT_MCP_URL) and is only exercised when the user connects keys.
Launches are NEVER live from here: receipts always come back paused and flagged
for human approval; external writes must still pass loop/safety_gate.py.
"""

from __future__ import annotations

import hashlib
import json
import os
import urllib.request
from typing import Any, Literal

from pydantic import BaseModel, Field

from app.core.config import settings

Channel = Literal["meta", "tiktok", "google", "linkedin", "x"]
CHANNELS: tuple[Channel, ...] = ("meta", "tiktok", "google", "linkedin", "x")


# --------------------------------------------------------------------------- #
# Models (Pydantic v2)
# --------------------------------------------------------------------------- #


class SpyQuery(BaseModel):
    """Ask the adkit spy tool what a competitor runs on a channel."""

    competitor: str = Field(min_length=1)
    channel: Channel = "meta"
    limit: int = Field(default=10, ge=1, le=50)


class SpyAd(BaseModel):
    ad_id: str
    competitor: str
    channel: Channel
    headline: str
    body: str
    cta: str
    landing_url: str
    media_type: Literal["video", "image"]
    days_running: int


class CreateBrief(BaseModel):
    """Winner-derived brief handed to the adkit create tool."""

    persona: str = Field(min_length=1)
    channel: Channel
    headline: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=1000)
    cta: str = Field(min_length=1, max_length=80)
    variants: int = Field(default=3, ge=1, le=10)
    source_ad_id: str | None = None


class ClipSpec(BaseModel):
    variant_id: str
    headline: str
    body: str
    cta: str
    spec_hash: str


class CreateJob(BaseModel):
    job_id: str
    status: Literal["queued"] = "queued"
    clips: list[ClipSpec]


class LaunchRequest(BaseModel):
    workspace_id: str = Field(min_length=1)
    ad_account_ref: str = Field(min_length=1)
    job_id: str = Field(min_length=1)
    daily_budget_micros: int = Field(gt=0)
    confirm_live: bool = False


class LaunchReceipt(BaseModel):
    receipt_id: str
    job_id: str
    status: Literal["paused_pending_approval"] = "paused_pending_approval"
    requires_approval: bool = True
    detail: str


# --------------------------------------------------------------------------- #
# Transports
# --------------------------------------------------------------------------- #


class AdkitTransport:
    """Interface: one method per adkit/ads-mcp tool group."""

    def spy(self, query: SpyQuery) -> list[SpyAd]:  # pragma: no cover - interface
        raise NotImplementedError

    def create(self, brief: CreateBrief) -> CreateJob:  # pragma: no cover
        raise NotImplementedError

    def launch(self, request: LaunchRequest) -> LaunchReceipt:  # pragma: no cover
        raise NotImplementedError


def _digest(*parts: Any) -> str:
    return hashlib.sha256(json.dumps(parts, sort_keys=True, default=str).encode()).hexdigest()


_HEADLINES = (
    "Stop scrolling if you have {pain}",
    "The {persona} secret to {gain}",
    "{gain} without the guesswork",
    "Why {competitor} fans are switching",
)
_BODIES = (
    "{persona}s use this to get {gain} in days, not months.",
    "Built for the modern {persona}. No fluff, just {gain}.",
    "Join thousands of {persona}s who fixed {pain} for good.",
)
_CTAS = ("Shop Now", "Learn More", "Get Started", "Try It Free")
_GAINS = ("clearer skin", "2x output", "faster shipping", "better sleep")
_PAINS = ("wasted spend", "slow results", "complicated setup", "hit-or-miss quality")


class MockAdkitTransport(AdkitTransport):
    """Deterministic offline answers seeded by request content."""

    def spy(self, query: SpyQuery) -> list[SpyAd]:
        base = _digest("adkit-spy", query.competitor.lower(), query.channel)[:12]
        ads: list[SpyAd] = []
        for i in range(query.limit):
            h = int.from_bytes(bytes.fromhex(_digest(base, i)[:8]), "big")
            fmt = {
                "pain": _PAINS[h % len(_PAINS)],
                "gain": _GAINS[(h // 7) % len(_GAINS)],
                "persona": (
                    "operator"
                    if query.competitor.lower().startswith(("saas", "b2b"))
                    else "shopper"
                ),
                "competitor": query.competitor,
            }
            ads.append(
                SpyAd(
                    ad_id=f"{query.channel}-{base}-{i:03d}",
                    competitor=query.competitor,
                    channel=query.channel,
                    headline=_HEADLINES[(h // 11) % len(_HEADLINES)].format(**fmt),
                    body=_BODIES[(h // 13) % len(_BODIES)].format(**fmt),
                    cta=_CTAS[(h // 17) % len(_CTAS)],
                    landing_url=(
                        f"https://example.com/{query.competitor.lower().replace(' ', '-')}"
                        f"?utm_source={query.channel}"
                    ),
                    media_type="video" if h % 3 else "image",
                    days_running=3 + (h % 60),
                )
            )
        return ads

    def create(self, brief: CreateBrief) -> CreateJob:
        dump = brief.model_dump(mode="json")
        base = _digest("adkit-create", dump)[:12]
        clips: list[ClipSpec] = []
        for i in range(brief.variants):
            h = int.from_bytes(bytes.fromhex(_digest(base, i)[:8]), "big")
            clips.append(
                ClipSpec(
                    variant_id=f"{base}-{i:02d}",
                    headline=brief.headline,
                    body=_BODIES[h % len(_BODIES)].format(
                        persona=brief.persona,
                        pain=_PAINS[h % len(_PAINS)],
                        gain=_GAINS[h % len(_GAINS)],
                    ),
                    cta=brief.cta,
                    spec_hash=_digest("clip", dump, i)[:16],
                )
            )
        return CreateJob(job_id=f"job-{base}", clips=clips)

    def launch(self, request: LaunchRequest) -> LaunchReceipt:
        receipt_id = f"rcpt-{_digest('adkit-launch', request.model_dump(mode='json'))[:12]}"
        return LaunchReceipt(
            receipt_id=receipt_id,
            job_id=request.job_id,
            detail=(
                f"Mock launch for job {request.job_id}: draft created PAUSED; "
                "human approval required before activation."
            ),
        )


class HttpAdkitTransport(AdkitTransport):
    """Thin JSON-RPC 2.0-over-HTTP client for a running adkit/ads-mcp server."""

    def __init__(self, url: str, timeout: float = 30.0) -> None:
        self.url = url.rstrip("/")
        self.timeout = timeout

    def _rpc(self, tool: str, arguments: dict[str, Any]) -> dict[str, Any]:
        body = json.dumps(
            {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/call",
                "params": {"name": tool, "arguments": arguments},
            }
        ).encode()
        req = urllib.request.Request(
            self.url, data=body, headers={"Content-Type": "application/json"}, method="POST"
        )
        with urllib.request.urlopen(req, timeout=self.timeout) as resp:
            envelope = json.loads(resp.read())
        if "error" in envelope:
            raise RuntimeError(f"adkit mcp error: {envelope['error']}")
        return envelope.get("result", {})

    def spy(self, query: SpyQuery) -> list[SpyAd]:
        raw = self._rpc("spy_ads", query.model_dump())
        return [SpyAd.model_validate(item) for item in raw.get("ads", [])]

    def create(self, brief: CreateBrief) -> CreateJob:
        result = self._rpc("create_ads", brief.model_dump())
        text = "".join(block.get("text", "") for block in result.get("content", []))
        return CreateJob.model_validate_json(text)

    def launch(self, request: LaunchRequest) -> LaunchReceipt:
        if not request.confirm_live:
            # Belt-and-braces: even the real path refuses unconfirmed launches.
            mock = MockAdkitTransport().launch(request)
            mock.detail = "confirm_live=false; live launch refused, paused draft returned."
            return mock
        receipt = self._rpc("launch_ads", request.model_dump(exclude={"confirm_live"}))
        return LaunchReceipt.model_validate(receipt)


# --------------------------------------------------------------------------- #
# Client facade
# --------------------------------------------------------------------------- #

DEFAULT_ADKIT_MCP_URL_ENV = "ADKIT_MCP_URL"


def resolve_transport(mock: bool | None = None, url: str | None = None) -> AdkitTransport:
    """Pick mock vs real transport. Mock wins unless MOCK_MODE is off AND a URL exists."""
    effective_mock = settings.MOCK_MODE if mock is None else mock
    url = url or os.environ.get(DEFAULT_ADKIT_MCP_URL_ENV, "")
    if not effective_mock and url:
        return HttpAdkitTransport(url)
    return MockAdkitTransport()


class AdkitMcpClient:
    """Facade used by the create pipeline / API layers.

    Usage:
        client = AdkitMcpClient()
        ads = client.spy(SpyQuery(competitor="Gymshark", channel="meta", limit=5))
        job = client.create(CreateBrief(...))
        receipt = client.launch(LaunchRequest(...))  # always a paused draft
    """

    def __init__(
        self,
        transport: AdkitTransport | None = None,
        *,
        mock: bool | None = None,
        url: str | None = None,
    ) -> None:
        self.transport = transport or resolve_transport(mock=mock, url=url)

    def spy(self, query: SpyQuery) -> list[SpyAd]:
        return self.transport.spy(SpyQuery.model_validate(query))

    def create(self, brief: CreateBrief) -> CreateJob:
        return self.transport.create(CreateBrief.model_validate(brief))

    def launch(self, request: LaunchRequest) -> LaunchReceipt:
        request = LaunchRequest.model_validate(request)
        if request.daily_budget_micros <= 0:  # unreachable via pydantic; explicit guard
            raise ValueError("daily_budget_micros must be positive")
        return self.transport.launch(request)
