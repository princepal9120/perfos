"""JSON-file store for generated creative assets (CREATE stage persistence).

Appends assets to ``.build/assets.json`` (a single JSON list). Plain stdlib,
mock-safe, no DB — mirrors the lightweight style of the CREATE stage.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

DEFAULT_PATH = ".build/assets.json"

_FIELDS = ("source_ad_id", "brief_text", "asset_url", "duration_s", "provider")


def _to_record(obj: Any) -> dict[str, Any]:
    """Accept a mapping, dataclass, or plain object; return a flat record."""
    if isinstance(obj, dict):
        rec = dict(obj)
    else:
        rec = {k: getattr(obj, k) for k in _FIELDS if hasattr(obj, k)}
    rec.setdefault("source_ad_id", "")
    return rec


class AssetStore:
    """Persist generated assets to a JSON list on disk."""

    def __init__(self, path: str | Path = DEFAULT_PATH) -> None:
        self.path = Path(path)

    def add(
        self,
        asset: Any,
        *,
        source_ad_id: str | None = None,
    ) -> dict[str, Any]:
        """Append one asset and persist. ``source_ad_id`` overrides the field
        for asset types that don't carry it themselves."""
        rec = _to_record(asset)
        if source_ad_id is not None:
            rec["source_ad_id"] = source_ad_id
        records = self.all()
        records.append(rec)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(records, indent=2), encoding="utf-8")
        return rec

    def all(self) -> list[dict[str, Any]]:
        """Return every stored asset as plain dicts (empty list if none yet)."""
        if not self.path.exists():
            return []
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return []
        return data if isinstance(data, list) else []

    def by_source(self, ad_id: str) -> list[dict[str, Any]]:
        """All assets generated from a given source ad id."""
        return [r for r in self.all() if r.get("source_ad_id") == ad_id]


if __name__ == "__main__":  # minimal self-check
    import tempfile

    with tempfile.TemporaryDirectory() as tmp:
        store = AssetStore(Path(tmp) / "assets.json")

        @dataclass
        class FakeAsset:
            asset_url: str
            provider: str | None = None

        store.add(FakeAsset("http://x/1.mp4"), source_ad_id="ad-1")
        store.add({"asset_url": "http://x/2.mp4"}, source_ad_id="ad-2")
        assert len(store.all()) == 2
        assert [r["asset_url"] for r in store.by_source("ad-1")] == ["http://x/1.mp4"]
        assert store.by_source("missing") == []
    print("store self-check OK")


__all__ = ["AssetStore", "DEFAULT_PATH"]
