"""A35: launch_from_winner connector tests (mock-safe, no network)."""

from app.connectors.launch_from_winner import (
    WinnerBrief,
    launch_from_winner,
    list_launched,
    reset_launched,
)


def setup_function():
    reset_launched()


def test_creates_paused_campaign_from_brief():
    result = launch_from_winner(
        WinnerBrief(
            platform="meta",
            name="UGC Hook Test",
            source_ad_id="spy-123",
            daily_budget=75.0,
        )
    )
    assert result["success"] is True
    assert result["status"] == "paused"
    assert result["platform"] == "meta"
    assert result["daily_budget"] == 75.0
    assert result["name"] == "UGC Hook Test"
    # Stored and retrievable.
    assert list_launched()[0]["id"] == result["id"]
    assert len(list_launched("meta")) == 1
    assert list_launched("google") == []


def test_accepts_plain_dict_and_fills_defaults():
    result = launch_from_winner({"source_ad_id": "spy-9"})
    assert result["success"] is True
    assert result["status"] == "paused"
    assert result["platform"] == "meta"  # default
    assert result["daily_budget"] == 50.0  # default
    assert "Winner" in result["name"] or "spy-9" in result["name"]


def test_rejects_unknown_platform():
    result = launch_from_winner({"platform": "bing", "name": "x"})
    assert result["success"] is False
    assert result["error"] == "unknown_platform"
    assert list_launched() == []


def test_rejects_invalid_budget_and_normalizes_platform():
    bad = launch_from_winner({"daily_budget": -5})
    assert bad["success"] is False
    assert bad["error"] == "invalid_brief"

    ok = launch_from_winner({"platform": "  GOOGLE ", "source_ad_id": "g-1"})
    assert ok["success"] is True
    assert ok["platform"] == "google"


def test_ids_are_unique_across_launches():
    a = launch_from_winner({"source_ad_id": "s1"})
    b = launch_from_winner({"source_ad_id": "s2"})
    assert a["id"] != b["id"]
