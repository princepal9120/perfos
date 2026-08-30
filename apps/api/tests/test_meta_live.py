"""Live Meta collector — parsing and normalization (no network)."""

import json

import pytest

from app.discovery.find import meta_live
from app.discovery.schemas import AdRecord
from app.discovery.score.winner_engine import score_ads

NODE = {
    "ad_archive_id": "123",
    "collation_count": 4,
    "is_active": True,
    "page_name": "Acme Labs",
    "spend": None,
    "start_date": 1779433200,
    "snapshot": {
        "page_name": "Acme Labs",
        "cta_text": "Sign up",
        "link_url": "https://acme.test/home",
        "caption": "acme.test",
        "cards": [
            {
                "body": "Stop guessing your ROAS.",
                "title": "Know where the money went",
                "link_url": "https://acme.test/pricing",
                "video_hd_url": "https://cdn.test/a.mp4",
                "cta_text": "Sign Up",
            }
        ],
    },
}


def test_money_parses_suffixes_and_symbols():
    assert meta_live._money("$4K") == 4000.0
    assert meta_live._money("1.5M") == 1_500_000.0
    assert meta_live._money("2,500") == 2500.0
    assert meta_live._money("junk") is None


def test_spend_handles_every_shape_meta_returns():
    assert meta_live._spend(None) is None
    assert meta_live._spend(1234) == 1234.0
    assert meta_live._spend("$4K-$4.5K") == 4250.0
    assert meta_live._spend({"lower_bound": "100", "upper_bound": "$200"}) == 150.0
    assert meta_live._spend("no data") is None


def test_to_row_is_a_valid_ad_record():
    row = meta_live._to_row(NODE)
    ad = AdRecord(**row)
    assert ad.ad_id == "123"
    assert ad.advertiser == "Acme Labs"
    assert ad.platform == "meta"
    assert ad.variant_count == 4
    assert ad.creative_url == "https://cdn.test/a.mp4"
    assert ad.cta == "Sign Up"
    assert ad.start_date is not None


def test_to_row_extracts_the_landing_url():
    ad = AdRecord(**meta_live._to_row(NODE))
    assert ad.landing_url == "https://acme.test/pricing", "the card link wins over the snapshot"


def test_landing_url_falls_back_to_the_snapshot_without_cards():
    """Single-creative and DCO ads fill only snapshot.link_url; cards can be empty."""
    node = json.loads(json.dumps(NODE))
    node["snapshot"]["cards"] = []
    assert meta_live._to_row(node)["landing_url"] == "https://acme.test/home"


def test_landing_url_is_none_when_the_payload_has_no_link():
    node = json.loads(json.dumps(NODE))
    del node["snapshot"]["link_url"]
    del node["snapshot"]["cards"][0]["link_url"]
    assert meta_live._to_row(node)["landing_url"] is None


def test_landing_url_keeps_unresolved_macros_verbatim():
    """Meta serves the raw ad setup, so dynamic URLs still carry {{macro}} tokens."""
    node = json.loads(json.dumps(NODE))
    node["snapshot"]["cards"][0]["link_url"] = "https://acme.test/p?cid={{campaign.id}}"
    row = meta_live._to_row(node)
    assert row["landing_url"] == "https://acme.test/p?cid={{campaign.id}}"


def test_landing_url_survives_scoring():
    """score_ads must carry the destination through to the WinnerSignal."""
    signals = score_ads([AdRecord(**meta_live._to_row(NODE))])
    assert signals[0].landing_url == "https://acme.test/pricing"


def test_to_row_skips_nodes_without_an_id():
    assert meta_live._to_row({"snapshot": {}}) is None


def test_to_row_falls_back_to_body_when_untitled():
    node = json.loads(json.dumps(NODE))
    del node["snapshot"]["cards"][0]["title"]
    assert meta_live._to_row(node)["hook"] == "Stop guessing your ROAS."


def test_extract_connection_survives_braces_inside_ad_copy():
    payload = {"count": 1, "edges": [{"node": {"collated_results": [NODE]}}]}
    # A brace and an escaped quote inside copy would break a naive regex.
    payload["edges"][0]["node"]["collated_results"][0]["snapshot"]["cards"][0]["body"] = (
        'use {{macro}} and a \\" quote'
    )
    html = '<script>{"x":1,"search_results_connection":' + json.dumps(payload) + "}</script>"
    parsed = meta_live._extract_connection(html)
    assert parsed["count"] == 1
    assert parsed["edges"][0]["node"]["collated_results"][0]["ad_archive_id"] == "123"


def test_extract_connection_raises_when_absent():
    with pytest.raises(meta_live.LiveFetchError):
        meta_live._extract_connection("<html>nothing here</html>")


@pytest.mark.asyncio
async def test_collector_falls_back_to_fixtures_when_live_fails(monkeypatch):
    from app.discovery.find import meta_collector

    async def boom(*_args, **_kwargs):
        raise meta_live.LiveFetchError("blocked")

    monkeypatch.setenv("PERFOS_LIVE_DISCOVERY", "1")
    monkeypatch.setattr(meta_live, "fetch_meta_ads", boom)
    rows = await meta_collector.collect_meta_ads(filters={"query": "nimbus"})
    assert rows and all(r["ad_id"].startswith("MT-") for r in rows)


def test_walk_nodes_finds_ads_at_any_depth():
    """Paginated GraphQL nests results differently from the SSR blob."""
    payload = {
        "data": {"page": {"results": [[{"ad_archive_id": "1", "page_name": "A"}]]}},
        "extra": [{"nested": {"ad_archive_id": "2"}}],
        "noise": {"ad_archive_id": None},
    }
    found = {n["ad_archive_id"] for n in meta_live._walk_nodes(payload)}
    assert found == {"1", "2"}, "a null id is not an ad"


def test_walk_nodes_tolerates_scalars_and_empties():
    assert meta_live._walk_nodes({}) == []
    assert meta_live._walk_nodes([]) == []
    assert meta_live._walk_nodes("string") == []
    assert meta_live._walk_nodes(None) == []
