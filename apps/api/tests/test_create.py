"""Pure-logic tests for the CREATE / clips stage generators (A23).

No DB, no network: verifies clipgen.generate_clips returns 2 mock assets and
hook_remix.remix_hook produces 3 hook variants from a scored winner.
"""

import os

os.environ.setdefault("MOCK_MODE", "true")

from app.create.clipgen import generate_clips  # noqa: E402
from app.create.hook_remix import remix_hook  # noqa: E402
from app.create.schemas import CreativeBrief, GeneratedAsset  # noqa: E402
from app.discovery.schemas import WinnerSignal  # noqa: E402


def _brief() -> CreativeBrief:
    return CreativeBrief(
        source_ad_id="meta-abc-001",
        brief_text="Glow serum ad targeting GenZ shoppers.",
    )


def _winner() -> WinnerSignal:
    return WinnerSignal(
        platform="meta",
        advertiser="Gymshark",
        ad_id="meta-winner-001",
        score=87.5,
        tier="winner",
        hook="You need Gymshark.",
        cta="Shop Now",
    )


def test_generate_clips_returns_two_assets() -> None:
    clips = generate_clips(_brief())
    assert len(clips) == 2
    assert all(isinstance(c, GeneratedAsset) for c in clips)
    assert all(c.asset_url for c in clips)


def test_generate_clips_is_deterministic_per_brief() -> None:
    first = [c.asset_url for c in generate_clips(_brief())]
    second = [c.asset_url for c in generate_clips(_brief())]
    assert first == second


def test_remix_hook_returns_three_variants() -> None:
    hooks = remix_hook(_winner())
    assert len(hooks) == 3
    assert all(isinstance(h, str) and h.strip() for h in hooks)
    assert len(set(hooks)) == 3
