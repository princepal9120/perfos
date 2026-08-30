"""Hook remix — turn one proven winner's hook into 3 fresh variant lines.

Given a ``WinnerSignal`` from the discovery/score stage, produce three
deterministic remixes of its hook for the create stage (A22 runner feeds
these into clipgen/storyboards). Pure string transforms — no LLM calls,
no network, mock-safe by construction, same input always yields the same
three lines so downstream runs stay reproducible.

Degradation follows ``winner_tiers`` convention: missing/empty hooks fall
back to the CTA, then to an empty list rather than raising.
"""

from __future__ import annotations

from app.discovery.schemas import WinnerSignal

_TERMINAL = ".!?"
_ELLIPSIS = "..."


def _core(hook: str) -> str:
    """First sentence of the hook, terminal punctuation stripped."""
    head = hook.split("\n", 1)[0].strip()
    # Cut at the first sentence boundary (skip dots inside ellipses).
    for i, ch in enumerate(head):
        if ch in _TERMINAL and not head.startswith(_ELLIPSIS, i):
            head = head[:i]
            break
    return head.strip().rstrip(_TERMINAL).strip()


def _decap(s: str) -> str:
    """Lowercase the first letter unless the word looks like ALL-CAPS/proper."""
    if len(s) > 1 and s[:2].isupper() and s[1].isupper():
        return s
    return s[:1].lower() + s[1:]


def _sentence(s: str) -> str:
    return s if s.endswith(_TERMINAL) else s + "."


def _variants(hook: str, cta: str | None) -> list[str]:
    core = _core(hook)
    if not core:
        return []
    out = [
        f"What if {_decap(core)}?",
        f"Stop scrolling — {core}.",
        _cta_combo(core, cta),
    ]
    # Dedupe (case-insensitive), preserve order, cap at 3.
    seen: set[str] = set()
    unique = []
    for line in out:
        key = line.casefold()
        if key not in seen:
            seen.add(key)
            unique.append(line)
    return unique[:3]


def _cta_combo(core: str, cta: str | None) -> str:
    """Third beat: pair the hook with its proven CTA, else scarcity fallback."""
    tail = _sentence(cta.strip()) if cta and cta.strip() else "Before everyone else finds out."
    return f"{_sentence(core)} {tail}"


def remix_hook(winner: WinnerSignal) -> list[str]:
    """Return up to 3 remixed hook lines derived from ``winner``.

    Source priority: ``winner.hook`` then ``winner.cta``. Returns ``[]``
    when neither carries usable copy.
    """
    source = (winner.hook or "").strip()
    if not source:
        source = (winner.cta or "").strip()
        if not source:
            return []
    return _variants(source, winner.cta if (winner.hook or "").strip() else None)


if __name__ == "__main__":  # minimal runnable self-check
    from datetime import datetime

    w = WinnerSignal(
        platform="meta",
        advertiser="Acme",
        ad_id="a1",
        score=82.0,
        tier="winner",
        start_date=datetime(2026, 1, 1),
        hook="Glass skin in 14 days. Dermatologists hate this.",
        cta="Shop the routine",
    )
    lines = remix_hook(w)
    assert len(lines) == 3, lines
    assert len({line.casefold() for line in lines}) == 3
    assert any(line.startswith("What if ") for line in lines)
    assert any("Stop scrolling" in line for line in lines)
    assert any("Shop the routine." in line for line in lines)

    assert remix_hook(
        w.model_copy(update={"hook": None})
    ), "cta fallback should still produce variants"
    assert remix_hook(
        w.model_copy(update={"hook": None, "cta": None})
    ) == [], "no copy -> empty list"
    print("\n".join(lines))
