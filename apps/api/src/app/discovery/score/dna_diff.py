"""DNA diff: compare a winning competitor ad against the user's existing ads.

Given one winning ad and a set of the user's own ad copies, extract each ad's
"dna" (hook type, angle, CTA type, surface signals), score pairwise similarity,
and report which winning traits the user's ads lack plus deterministic
recommendations. Pure functions only -- no network, no LLM, mock-safe.

Inputs are plain strings (or objects/dicts exposing body text), so this works
with any SpyAd source without coupling to sibling discovery modules.
"""

from __future__ import annotations

import re
from collections import Counter
from typing import Any

from pydantic import BaseModel, Field

__all__ = [
    "AdDna",
    "ExistingAdDiff",
    "WinnerDnaDiff",
    "extract_dna",
    "dna_similarity",
    "diff_winner_vs_ads",
]

# --- extraction tables ------------------------------------------------------

_HOOK_RULES: tuple[tuple[str, tuple[str, ...]], ...] = (
    (
        "question",
        (
            "what ", "why ", "how do ", "how does ", "did you ", "are you ",
            "ever wondered", "still ",
        ),
    ),
    ("how_to", ("how to ", "the secret to", "a simple way to", "step by step")),
    (
        "bold_claim",
        (
            "best ", "#1", "most ", "never ", "stop ", "nobody ", "everyone ",
            "no one ", "the fastest", "instantly", "overnight",
        ),
    ),
    ("story", ("i used to", "when i ", "i tried", "my ", "we tested", "honestly")),
    ("stat_lead", ("%", "x roi", "in 30 days", "in 7 days", "studies show")),
)

_ANGLE_RULES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("price", ("$", "free", "cheap", "affordable", "off", "discount", "deal", "save")),
    ("fomo", ("limited", "today only", "ends soon", "last chance", "hurry", "before it's gone", "selling fast")),
    ("proof", ("review", "rated", "stars", "customers", "testimonials", "trusted", "guarantee", "proven")),
    ("quality", ("premium", "best quality", "luxury", "durable", "handcrafted", "organic", "professional")),
)

_CTA_VERBS = (
    "shop", "buy", "get", "try", "start", "claim", "download", "book",
    "learn more", "subscribe", "order", "sign up", "grab",
)

_NUMBER_RE = re.compile(r"\d")
_EMOJI_RE = re.compile("[\U0001F000-\U0001FAFF\u2600-\u27BF]")
_TOKEN_RE = re.compile(r"[a-z0-9']+")

_FILLER = {
    "the", "a", "an", "and", "or", "to", "of", "for", "your", "you", "our",
    "is", "it", "this", "that", "with", "on", "in", "at", "be", "we", "i",
}


# --- models ------------------------------------------------------------------


class AdDna(BaseModel):
    """Canonical traits extracted from a single ad's copy."""

    hook_type: str = "direct"
    angle: str = "generic"
    cta_type: str | None = None
    has_numbers: bool = False
    has_emoji: bool = False
    word_count: int = 0
    proof_signals: list[str] = Field(default_factory=list)
    tokens: frozenset[str] = Field(default_factory=frozenset)


class ExistingAdDiff(BaseModel):
    """Per-ad comparison of one of the user's ads against the winner."""

    index: int
    label: str | None = None
    similarity: float
    matched_fields: list[str]
    differing_fields: list[str]


class WinnerDnaDiff(BaseModel):
    """Aggregated DNA diff of a winner vs all of the user's existing ads."""

    winner_dna: AdDna
    per_ad: list[ExistingAdDiff]
    avg_similarity: float
    # winner traits present in fewer than half of the user's ads
    gaps: list[str]
    # winner traits most of the user's ads already share
    overlaps: list[str]
    recommendations: list[str]


# --- core functions ----------------------------------------------------------


def _ad_body(ad: str | dict[str, Any] | Any) -> str:
    """Best-effort body text from a string, dict, or object (e.g. SpyAd)."""
    if isinstance(ad, str):
        return ad
    if isinstance(ad, dict):
        for key in ("body", "text", "copy", "creative_text", "title"):
            if isinstance(ad.get(key), str) and ad[key].strip():
                return ad[key]
        return ""
    for attr in ("body", "text", "copy", "creative_text"):
        val = getattr(ad, attr, None)
        if isinstance(val, str) and val.strip():
            return val
    return ""


def _label(ad: str | dict[str, Any] | Any, index: int) -> str | None:
    if isinstance(ad, dict):
        for key in ("id", "ad_id", "name"):
            if isinstance(ad.get(key), str):
                return ad[key]
        return None
    return getattr(ad, "id", None)


def _first_match(lowered: str, rules: tuple[tuple[str, tuple[str, ...]], ...]) -> str:
    for name, needles in rules:
        if any(needle in lowered for needle in needles):
            return name
    return ""


def extract_dna(ad: str | dict[str, Any] | Any) -> AdDna:
    """Extract canonical dna traits from an ad copy (deterministic heuristics)."""
    body = _ad_body(ad)
    lowered = body.lower()
    words = lowered.split()

    hook_type = _first_match(lowered, _HOOK_RULES)
    if "?" in body.split(".")[0]:
        hook_type = hook_type or "question"
    angle = _first_match(lowered, _ANGLE_RULES)

    # CTA: verb occurring latest in the copy (CTAs sit at the end).
    positions = [
        (m.start(), verb)
        for verb in _CTA_VERBS
        if (m := re.search(rf"\b{re.escape(verb)}\b", lowered))
    ]
    cta_type = max(positions)[1] if positions else None

    proof_signals = sorted(
        signal for signal in ("review", "rated", "stars", "customers", "testimonials", "guarantee")
        if signal in lowered
    )

    tokens = frozenset(t for t in _TOKEN_RE.findall(lowered) if t not in _FILLER)

    return AdDna(
        hook_type=hook_type or "direct",
        angle=angle or "generic",
        cta_type=cta_type,
        has_numbers=bool(_NUMBER_RE.search(body)),
        has_emoji=bool(_EMOJI_RE.search(body)),
        word_count=len(words),
        proof_signals=proof_signals,
        tokens=tokens,
    )


_FIELD_WEIGHTS: dict[str, float] = {
    "hook_type": 2.0,
    "angle": 2.0,
    "cta_type": 1.5,
    "has_numbers": 0.5,
    "has_emoji": 0.5,
    "proof_signals": 1.5,
}


def dna_similarity(winner: AdDna, other: AdDna) -> float:
    """Deterministic 0..1 similarity between two ad dnas."""
    score = 0.0
    total = sum(_FIELD_WEIGHTS.values())
    for field, weight in _FIELD_WEIGHTS.items():
        if getattr(winner, field) == getattr(other, field):
            score += weight
    # token overlap (Jaccard) contributes up to ~2 points' worth of weight
    union = winner.tokens | other.tokens
    overlap = len(winner.tokens & other.tokens) / len(union) if union else 0.0
    return round(min(score / total * 0.8 + overlap * 0.2, 1.0), 4)


def diff_winner_vs_ads(
    winner: str | dict[str, Any] | Any,
    existing_ads: list[str | dict[str, Any] | Any],
) -> WinnerDnaDiff:
    """Compare a winner ad against the user's existing ads.

    Returns per-ad similarity, trait gaps (winner traits the user's ads mostly
    lack), overlaps, and deterministic mock-safe recommendations.
    """
    if not existing_ads:
        raise ValueError("existing_ads must contain at least one ad")

    winner_dna = extract_dna(winner)

    per_ad: list[ExistingAdDiff] = []
    match_counts: Counter[str] = Counter()

    for i, ad in enumerate(existing_ads):
        other_dna = extract_dna(ad)
        matched: list[str] = []
        differing: list[str] = []
        for field in _FIELD_WEIGHTS:
            w_val, o_val = getattr(winner_dna, field), getattr(other_dna, field)
            if w_val == o_val:
                matched.append(field)
                match_counts[field] += 1
            elif field != "proof_signals" or (w_val or o_val):
                differing.append(field)
        per_ad.append(
            ExistingAdDiff(
                index=i,
                label=_label(ad, i),
                similarity=dna_similarity(winner_dna, other_dna),
                matched_fields=matched,
                differing_fields=differing,
            )
        )

    n = len(existing_ads)
    gaps: list[str] = [f for f in _FIELD_WEIGHTS if match_counts[f] < n / 2 and f != "proof_signals"]
    overlaps: list[str] = [f for f in _FIELD_WEIGHTS if match_counts[f] >= n / 2]

    recommendations: list[str] = []
    if "hook_type" in gaps:
        recs = f"Try a '{winner_dna.hook_type}' opening hook; your current ads rarely use it."
        recommendations.append(recs)
    if "angle" in gaps:
        recommendations.append(
            f"Shift messaging toward the '{winner_dna.angle}' angle that is winning for competitors."
        )
    if "cta_type" in gaps and winner_dna.cta_type:
        recommendations.append(f"Use a '{winner_dna.cta_type}' CTA to mirror the winner.")
    if winner_dna.proof_signals and not any(extract_dna(a).proof_signals for a in map(_ad_body, existing_ads)):
        recommendations.append("Add social-proof signals (reviews, ratings, guarantees) absent from your ads.")
    if not recommendations:
        recommendations.append("Your ads already share the winner's dna; test copy variants, not structural changes.")

    return WinnerDnaDiff(
        winner_dna=winner_dna,
        per_ad=per_ad,
        avg_similarity=round(sum(p.similarity for p in per_ad) / n, 4),
        gaps=gaps,
        overlaps=overlaps,
        recommendations=recommendations,
    )
