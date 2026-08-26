"""Tests for app.discovery.score.dna_diff (pure functions, mock-safe)."""

from app.discovery.score.dna_diff import (
    dna_similarity,
    diff_winner_vs_ads,
    extract_dna,
)

WINNER = (
    "Stop wasting money on ads that don't convert. "
    "How to 3x your ROAS in 30 days with proven tactics. "
    "Trusted by 10,000+ customers. Get started today."
)

EXISTING = [
    # shares angle=proof, hook=how_to-ish, CTA "get", numbers
    "Our premium organic serum is rated 5 stars by customers. Get yours now.",
    # generic direct ad, price angle
    "Affordable skincare deals. Shop today and save.",
]


def test_extract_dna_fields() -> None:
    dna = extract_dna(WINNER)
    assert dna.hook_type == "how_to"  # first matching rule wins
    assert dna.angle == "proof"
    assert dna.cta_type == "get"  # \bstart\b does not match "started"
    assert dna.has_numbers is True
    assert "customers" in dna.proof_signals


def test_extract_dna_empty_is_safe() -> None:
    dna = extract_dna("")
    assert dna.hook_type == "direct"
    assert dna.angle == "generic"
    assert dna.cta_type is None
    assert dna.word_count == 0


def test_similarity_bounds_and_ordering() -> None:
    close = extract_dna(
        "Stop wasting money. How to 3x your ROAS in 30 days. Trusted by customers. Get started today."
    )
    far = extract_dna(EXISTING[1])
    assert 0.0 <= dna_similarity(extract_dna(WINNER), far) <= 1.0
    assert dna_similarity(extract_dna(WINNER), close) > dna_similarity(extract_dna(WINNER), far)


def test_diff_reports_gaps_and_recommendations() -> None:
    result = diff_winner_vs_ads(WINNER, EXISTING)
    assert len(result.per_ad) == 2
    # ad0 shares proof angle + get CTA -> closer to winner than the price ad
    assert result.per_ad[0].similarity > result.per_ad[1].similarity
    assert "angle" in result.overlaps
    assert "hook_type" in result.gaps
    assert any("hook" in r for r in result.recommendations)


def test_diff_accepts_dicts_and_objects() -> None:
    class FakeSpyAd:
        id = "ad-1"
        body = "Limited offer: best deal ends today! Hurry, buy now."

    result = diff_winner_vs_ads({"body": WINNER}, [{"id": "x", "text": EXISTING[0]}, FakeSpyAd()])
    labels = {p.label for p in result.per_ad}
    assert labels == {"x", "ad-1"}
    fomo_ad = next(p for p in result.per_ad if p.label == "ad-1")
    assert "angle" in fomo_ad.differing_fields  # winner=proof vs fomo ad


def test_diff_requires_existing_ads() -> None:
    try:
        diff_winner_vs_ads(WINNER, [])
    except ValueError:
        return
    raise AssertionError("expected ValueError for empty existing_ads")
