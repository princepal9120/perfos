"""Angle detection: which persuasion angle does an ad's copy lean on?

Deterministic, regex-only (mock-safe, no LLM calls). Pure functions consumed by
the rest of the score engine (longevity, adoracle port) via ``angle_vector``.

Angles follow the plan taxonomy: price / quality / fomo / social_proof plus the
standard direct-response set (authority, novelty, convenience, risk_reversal,
problem_solution, status).

Usage:
    hits = detect_angles("50% OFF today only - only 3 left!")
    # -> [AngleHit(angle='fomo', ...), AngleHit(angle='price', ...)]

Accepts a raw string or any ad-like mapping/object; known copy fields
(headline/body/description/...) are joined before scanning. Evidence offsets
are character spans into the exact string passed to ``detect_angles``.
"""

from __future__ import annotations

import re
from collections.abc import Iterable, Mapping

from pydantic import BaseModel

# Match-tier weights; density of cues raises confidence up to the 0-100 cap.
_STRONG, _MEDIUM, _WEAK = 25, 15, 8
_MAX_EVIDENCE = 5

_TEXT_FIELDS = (
    "headline",
    "body",
    "description",
    "text",
    "copy",
    "title",
    "message",
    "caption",
)

# angle id -> [(weight, [regex, ...]), ...] strongest tier first.
_PATTERN_TABLE: dict[str, list[tuple[int, list[str]]]] = {
    "price": [
        (_STRONG, [
            r"\$\s?\d[\d,.]*",
            r"\d+\s?%\s?(?:off|discount)",
            r"\b(?:save|savings?)\s+(?:\$?\d|\d+\s?%)",
            r"\bhalf\s+off\b",
        ]),
        (_MEDIUM, [
            r"\b(?:sale|deals?|discount(?:ed)?|markdown|clearance)\b",
            r"\bfree\s+(?:shipping|trial)\b",
            r"\bfor\s+just\b",
            r"\bbuy\s+\w+\s+get\s+\w+\b",
            r"\bstarting\s+(?:at|from)\b",
            r"\bunder\s+\$?\d",
        ]),
        (_WEAK, [
            r"\baffordable\b",
            r"\bcheap(?:er)?\b",
            r"\blowest\s+price\b",
            r"\bbest\s+value\b",
        ]),
    ],
    "quality": [
        (_STRONG, [
            r"\bpremium\b",
            r"\bhighest\s+quality\b",
            r"\bbest[-\s]in[-\s]class\b",
            r"\baward[-\s]winning\b",
            r"\bhandcraft(?:ed)?|handmade|artisan(?:al)?\b",
        ]),
        (_MEDIUM, [
            r"\b(?:top[-\s]grade|grade\s+a|durable|long[-\s]lasting|superior)\b",
            r"\b(?:craftsmanship|finest\s+materials)\b",
            r"\bluxur(?:y|ious)\b",
        ]),
        (_WEAK, [
            r"\bquality\b",
            r"\bwell[-\s]made\b",
            r"\bsturdy\b",
        ]),
    ],
    "fomo": [
        (_STRONG, [
            r"\blimited\s+(?:time|stock|edition|quantity|run)\b",
            r"\bwhile\s+supplies\s+last\b",
            r"\balmost\s+gone\b",
            r"\bselling\s+out\b",
            r"\blast\s+chance\b",
            r"\bfinal\s+(?:hours|call|few)\b",
            r"\bonly\s+\d+\s+(?:left|remaining)\b",
            r"\b\d+\s+left\s+in\s+stock\b",
            r"\b(?:ends?|expires?|closes?)\s+(?:tonight|today|soon|at\s+midnight)\b",
        ]),
        (_MEDIUM, [
            r"\btoday\s+only\b",
            r"\bdon'?t\s+miss\b",
            r"\bhurry\b",
            r"\bact\s+now\b",
            r"\bbefore\s+(?:it'?s|they'?re)\s+gone\b",
            r"\brunning\s+out\b",
            r"\bgoing\s+fast\b",
            r"\bonce\s+they'?re\s+gone\b",
        ]),
        (_WEAK, [
            r"\bfew\s+spots?\s+left\b",
            r"\bselling\s+quickly\b",
        ]),
    ],
    "social_proof": [
        (_STRONG, [
            r"\b\d+(?:\.\d+)?\s*stars?\b",
            r"\bas\s+seen\s+(?:on|in)\b",
            r"\bover\s+[\d,.]+k?\s+(?:customers|reviews|people|users)\b",
            r"\btrusted\s+by\b",
            r"\bjoin(?:ed)?\s+[\d,.]*\s*(?:thousand|million|billion)?\s*(?:of\s+)?(?:happy\s+)?(?:customers|users|members)\b",
            r"\bcustomer\s+reviews?\b",
            r"\btestimonials?\b",
        ]),
        (_MEDIUM, [
            r"\bbest[-\s]seller\b",
            r"\btop[-\s]rated\b",
            r"\b#\d\s+(?:rated|best)\b",
            r"\b\d+\s*\/\s*5\b",
            r"\bviral\b",
            r"\beveryone'?s\s+talking\b",
        ]),
        (_WEAK, [
            r"\bpopular\b",
            r"\bloved\s+by\b",
        ]),
    ],
    "authority": [
        (_STRONG, [
            r"\b(?:doctor|dermatologist|dentist|vet(?:erinarian)?)[-\s]recommended\b",
            r"\bpatented?\b",
            r"\bclinically\s+(?:proven|tested)\b",
            r"\bfda[-\s](?:approved|registered|cleared)\b",
            r"\bdeveloped\s+by\s+(?:doctors|experts|scientists)\b",
        ]),
        (_MEDIUM, [
            r"\b(?:certified|licensed|lab[-\s]tested)\b",
            r"\bbacked\s+by\s+science\b",
            r"\bproven\s+(?:results|formula|system)\b",
        ]),
        (_WEAK, [
            r"\bindustry[-\s]leading\b",
            r"\binvented\s+by\b",
        ]),
    ],
    "novelty": [
        (_STRONG, [
            r"\bintroducing\b",
            r"\bthe\s+world'?s\s+first\b",
            r"\bfirst\s+ever\b",
            r"\bnever\s+seen\s+before\b",
        ]),
        (_MEDIUM, [
            r"\bjust\s+dropped\b",
            r"\bbrand\s+new\b",
            r"\ball[-\s]new\b",
            r"\bnewly\s+(?:launched|released|improved)\b",
        ]),
        (_WEAK, [
            r"\bnew\b",
            r"\bfreshly\s+launched\b",
        ]),
    ],
    "convenience": [
        (_STRONG, [
            r"\bin\s+(?:under\s+)?\d+\s+(?:minutes|seconds)\b",
            r"\bone[-\s]click\b",
            r"\bno\s+(?:setup|assembly)\s+(?:required|needed)\b",
        ]),
        (_MEDIUM, [
            r"\beffortless(?:ly)?\b",
            r"\bhassle[-\s]free\b",
            r"\bfoolproof\b",
            r"\bplug\s+and\s+play\b",
        ]),
        (_WEAK, [
            r"\beasy\b",
            r"\bsimple\b",
            r"\bquick(?:ly)?\b",
            r"\binstant(?:ly)?\b",
            r"\bfast\b",
        ]),
    ],
    "risk_reversal": [
        (_STRONG, [
            r"\bmoney[-\s]back\s+guarantee\b",
            r"\b\d+[-\s]day\s+(?:money[-\s]back|guarantee|returns?)\b",
            r"\blifetime\s+(?:guarantee|warranty)\b",
            r"\bfree\s+returns\b",
            r"\bcancel\s+anytime\b",
        ]),
        (_MEDIUM, [
            r"\bno\s+questions\s+asked\b",
            r"\brisk[-\s]free\b",
            r"\bsatisfaction\s+guaranteed\b",
        ]),
        (_WEAK, [
            r"\bguarantee(?:d)?\b",
        ]),
    ],
    "problem_solution": [
        (_STRONG, [
            r"\btired\s+of\b",
            r"\bsay\s+goodbye\s+to\b",
            r"\bstruggl(?:e|ing)\s+with\b",
            r"\bsick\s+of\b",
        ]),
        (_MEDIUM, [
            r"\bditch\s+the\b",
            r"\bstop\s+(?:wasting|dealing)\b",
            r"\bthe\s+(?:real\s+)?(?:problem|fix|solution)\b",
        ]),
        (_WEAK, [
            r"\bfrustrat(?:ed|ing)\b",
            r"\bannoying\b",
        ]),
    ],
    "status": [
        (_STRONG, [
            r"\bturn\s+heads\b",
            r"\bstand\s+out\b",
            r"\bshow\s+off\b",
            r"\bfeel\s+(?:confident|beautiful|unstoppable)\b",
        ]),
        (_MEDIUM, [
            r"\bconfidence\b",
            r"\belegan(?:t|ce)\b",
            r"\bsophisticated\b",
            r"\blook\s+(?:younger|amazing|great)\b",
        ]),
        (_WEAK, [
            r"\bstylish\b",
            r"\btrendy\b",
            r"\biconic\b",
        ]),
    ],
}

# Compiled once at import: angle -> [(weight, pattern), ...]
_COMPILED: dict[str, list[tuple[int, re.Pattern[str]]]] = {
    angle: [(weight, re.compile(pattern, re.IGNORECASE)) for weight, patterns in tiers for pattern in patterns]
    for angle, tiers in _PATTERN_TABLE.items()
}


class AngleEvidence(BaseModel):
    """One matched cue and its character span in the scanned text."""

    text: str
    start: int
    end: int


class AngleHit(BaseModel):
    angle: str
    score: int  # 0-100
    evidence: list[AngleEvidence]


def extract_text(ad: object) -> str:
    """Join known copy fields from a str, mapping, or ad-like object."""
    if ad is None:
        return ""
    if isinstance(ad, str):
        return ad
    getter = (lambda k: ad.get(k)) if isinstance(ad, Mapping) else (lambda k: getattr(ad, k, None))
    parts = []
    for field in _TEXT_FIELDS:
        value = getter(field)
        if isinstance(value, str) and value.strip():
            parts.append(value.strip())
    return " ".join(parts)


def detect_angles(ad: object) -> list[AngleHit]:
    """Detect persuasion angles in ad copy. Deterministic; best hits first."""
    text = extract_text(ad)
    hits: list[AngleHit] = []
    for angle, weighted_patterns in _COMPILED.items():
        score = 0
        evidence: list[AngleEvidence] = []
        for weight, pattern in weighted_patterns:
            for match in pattern.finditer(text):
                score += weight
                if len(evidence) < _MAX_EVIDENCE:
                    evidence.append(
                        AngleEvidence(text=match.group(0), start=match.start(), end=match.end())
                    )
        if score > 0:
            hits.append(AngleHit(angle=angle, score=min(score, 100), evidence=evidence))
    return sorted(hits, key=lambda hit: (-hit.score, hit.angle))


def primary_angle(ad: object) -> AngleHit | None:
    """The dominant angle, or None when no cues matched."""
    hits = detect_angles(ad)
    return hits[0] if hits else None


def angle_vector(ad: object) -> dict[str, int]:
    """Full angle -> 0-100 vector (missing angles are 0) for downstream scorers."""
    vector = dict.fromkeys(_COMPILED, 0)
    vector.update({hit.angle: hit.score for hit in detect_angles(ad)})
    return vector


# --- Hook / CTA / offer theme extraction (keyword heuristics) ---------------
# Mock-safe: pure regex tables, no LLM calls. Themes are coarse buckets used by
# discovery reporting; evidence lists capped to keep payloads small.

_THEME_MAX_EVIDENCE = 3

_HOOK_TABLE: dict[str, list[str]] = {
    "question": [r"\?"],
    "pain_point": [
        r"\btired\s+of\b",
        r"\bstruggl(?:e|ing)\s+with\b",
        r"\bsick\s+of\b",
        r"\bdone\s+with\b",
        r"\bfrustrat(?:ed|ing)\b",
    ],
    "curiosity": [
        r"\bsecrets?\b",
        r"\bnobody\s+tells\s+you\b",
        r"\byou\s+won'?t\s+believe\b",
        r"\bhere'?s\s+why\b",
        r"\bwhat\s+(?:if|happens)\b",
        r"\btruth\s+about\b",
    ],
    "bold_claim": [
        r"\b(?:fastest|easiest)\s+\w+\b",
        r"\bnever\s+(?:again|look\s+back)\b",
        r"\bin\s+\d+\s+(?:days?|minutes?|seconds?)\b",
        r"#\d\b",
    ],
    "direct_callout": [
        r"\bcalling\s+all\b",
        r"\battention\b",
        r"\bPOV\b",
        r"\bif\s+you\s+want\b",
    ],
}

_CTA_TABLE: dict[str, list[str]] = {
    "shop_now": [r"\b(?:shop|buy|order)\s+now\b", r"\badd\s+to\s+cart\b"],
    "learn_more": [r"\blearn\s+more\b", r"\bsee\s+how\b", r"\bfind\s+out\b", r"\bdiscover\b"],
    "sign_up": [
        r"\bsign\s+up\b",
        r"\bsubscribe\b",
        r"\bjoin\s+(?:us|now|today|free)\b",
        r"\bregister\b",
        r"\bget\s+started\b",
    ],
    "try_free": [
        r"\btry\s+(?:it\s+)?free\b",
        r"\bfree\s+trial\b",
        r"\bstart\s+(?:your\s+)?free\b",
        r"\bbook\s+a\s+(?:demo|call)\b",
    ],
    "claim_offer": [
        r"\bclaim\s+(?:your|yours|now|this)\b",
        r"\bredeem\b",
        r"\bgrab\s+yours\b",
        r"\bget\s+yours\b",
        r"\bsave\s+your\s+seat\b",
    ],
}

_OFFER_TABLE: dict[str, list[str]] = {
    "discount": [
        r"\d+\s?%\s?off",
        r"\$\d[\d,.]*\s+off",
        r"\bsave\s+(?:\$?\d|\d+%)",
        r"\bon\s+sale\b",
        r"\bcoupon\b",
    ],
    "bogo": [r"\bbuy\s+\w+\s+get\s+\w+\b", r"\btwo[-\s]for[-\s]one\b"],
    "free_shipping": [r"\bfree\s+(?:shipping|delivery)\b"],
    "free_trial": [r"\bfree\s+trial\b", r"\bfirst\s+month\s+free\b"],
    "bundle": [r"\bbundle\b", r"\bpackage\s+deal\b", r"\bvalue\s+pack\b"],
}

_THEME_COMPILED: dict[str, list[tuple[str, re.Pattern[str]]]] = {
    kind: [(name, re.compile(pattern, re.IGNORECASE)) for name, patterns in table.items() for pattern in patterns]
    for kind, table in (("hook", _HOOK_TABLE), ("cta", _CTA_TABLE), ("offer", _OFFER_TABLE))
}


def _scan_themes(kind: str, text: str) -> list[dict]:
    """[{theme, evidence}] for one table kind; deterministic order."""
    found: list[dict] = []
    for name, pattern in _THEME_COMPILED[kind]:
        evidence: list[str] = []
        for match in pattern.finditer(text):
            snippet = match.group(0)
            if snippet not in evidence:
                evidence.append(snippet)
            if len(evidence) >= _THEME_MAX_EVIDENCE:
                break
        if evidence:
            found.append({"theme": name, "evidence": evidence})
    return found


def _ad_id(ad: object) -> str | None:
    getter = (lambda k: ad.get(k)) if isinstance(ad, Mapping) else (lambda k: getattr(ad, k, None))
    for field in ("id", "ad_id"):
        value = getter(field)
        if value is not None:
            return str(value)
    return None


def extract_angles(ads: Iterable[object] | None) -> list[dict]:
    """Hook / CTA / offer themes per ad, as plain dicts (mock-safe heuristics).

    Accepts any iterable of ad-like objects/mappings/strings; known copy fields
    are joined via :func:`extract_text`. Each result carries the detected
    persuasion angles alongside the three theme buckets.
    """
    results: list[dict] = []
    if ads is None:
        return results
    for index, ad in enumerate(ads):
        text = extract_text(ad)
        hits = detect_angles(ad)
        results.append(
            {
                "index": index,
                "id": _ad_id(ad),
                "text": text,
                "hooks": _scan_themes("hook", text),
                "ctas": _scan_themes("cta", text),
                "offers": _scan_themes("offer", text),
                "primary_angle": hits[0].angle if hits else None,
                "angle_scores": {hit.angle: hit.score for hit in hits},
            }
        )
    return results
