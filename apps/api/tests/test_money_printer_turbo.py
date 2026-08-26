"""Tests for the MoneyPrinterTurbo adapter (pure functions, mock mode only)."""

import pytest
from pydantic import ValidationError

from app.create.money_printer_turbo import (
    ClipRequest,
    build_task_payload,
    generate_clip,
)


def test_build_task_payload_maps_brief_fields():
    req = ClipRequest(
        subject="Glow serum 15s hook",
        script="Stop scrolling. Your skin is thirsty.",
        terms=["skincare", "glow up"],
        aspect="portrait",
        voice_name="zh-CN-XiaoxiaoNeural",
    )
    payload = build_task_payload(req)
    assert payload["video_subject"] == "Glow serum 15s hook"
    assert payload["video_script"].startswith("Stop scrolling")
    assert payload["video_terms"] == ["skincare", "glow up"]
    assert payload["video_aspect"] == "portrait"
    assert payload["voice_name"] == "zh-CN-XiaoxiaoNeural"


def test_build_task_payload_omits_empty_optionals():
    payload = build_task_payload(ClipRequest(subject="bare"))
    assert "video_terms" not in payload
    assert "voice_name" not in payload


def test_clip_request_requires_subject():
    with pytest.raises(ValidationError):
        ClipRequest(subject="")


def test_mock_generate_is_deterministic_and_offline(monkeypatch):
    # Even if someone flips MOCK_MODE off in env, this test pins mock behavior.
    monkeypatch.setattr("app.create.money_printer_turbo.settings.MOCK_MODE", True)
    req = ClipRequest(subject="same brief", script="x")
    first = generate_clip(req)
    second = generate_clip(req)
    assert first == second
    assert first.status == "completed"
    assert first.videos and first.task_id.startswith("mock-mpt-")


def test_live_mode_never_called_in_mock(monkeypatch):
    """Mock path must not touch network helpers."""
    monkeypatch.setattr("app.create.money_printer_turbo.settings.MOCK_MODE", True)

    def _explode(*args, **kwargs):
        raise AssertionError("network helper called in mock mode")

    monkeypatch.setattr("app.create.money_printer_turbo._http_json", _explode)
    result = generate_clip(ClipRequest(subject="offline", script="s"))
    assert result.status == "completed"
