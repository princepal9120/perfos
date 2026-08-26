"""Pure-function tests for app.discovery.score.angles (no DB, no fixtures)."""

from dataclasses import dataclass

from app.discovery.score.angles import (
    angle_vector,
    detect_angles,
    extract_text,
    primary_angle,
)


def _hits_by_angle(text):
    return {hit.angle: hit for hit in detect_angles(text)}


def test_empty_and_none_inputs_yield_no_hits():
    assert detect_angles("") == []
    assert detect_angles(None) == []
    assert primary_angle("") is None
    assert angle_vector("").values() and set(angle_vector("").values()) == {0}


def test_price_detection_with_evidence_spans():
    text = "Save $20 today - was $99, now $79."
    hits = _hits_by_angle(text)
    price = hits["price"]
    assert price.score >= 25
    first = price.evidence[0]
    assert text[first.start : first.end] == "$20"


def test_fomo_scarcity_and_urgency():
    text = "Only 3 left in stock! Sale ends tonight."
    hits = _hits_by_angle(text)
    assert "fomo" in hits
    # Two strong cues (only 3 left + ends tonight) should beat a single weak cue.
    assert hits["fomo"].score >= 40


def test_social_proof_detection():
    hits = _hits_by_angle("4.9 stars from over 12,000 customers")
    proof = hits["social_proof"]
    assert proof.score >= 40  # two strong cues


def test_primary_angle_is_highest_score():
    text = "Save $20 - was $99, now $79. Premium craftsmanship."
    best = primary_angle(text)
    assert best is not None
    assert best.angle == "price"  # multiple $ cues beat one quality cue


def test_scores_capped_at_100():
    text = " ".join(["$1", "sale", "deal", "discount", "free shipping"] * 5)
    for hit in detect_angles(text):
        assert hit.score <= 100


def test_unrelated_copy_yields_no_hits():
    assert detect_angles("Check out our latest blog post about gardening.") == []


def test_extract_text_from_mapping_and_object():
    @dataclass
    class Ad:
        headline: str = "Hurry"
        body: str = "Limited time offer"

    obj_text = extract_text(Ad())
    map_text = extract_text({"headline": "Hurry", "body": "Limited time offer"})
    assert "Hurry" in obj_text and "Limited time offer" in obj_text
    assert obj_text == map_text
    # Object input flows through detection too.
    assert "fomo" in _hits_by_angle(Ad())


def test_angle_vector_includes_all_angles_with_zeros():
    vector = angle_vector("Just $19, buy now.")
    assert all(isinstance(v, int) for v in vector.values())
    assert vector["price"] > 0
    assert vector["status"] == 0
    assert len(vector) == len(angle_vector(""))  # stable key set


def test_deterministic_across_calls():
    text = "Trusted by 50,000 customers. Money-back guarantee."
    assert detect_angles(text) == detect_angles(text)
