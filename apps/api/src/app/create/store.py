"""Durable workspace-scoped store for generated creative assets.

The default application store uses the main SQL database. An explicit path is
kept as a compatibility adapter for old isolated tests and scripts.
"""

from __future__ import annotations

import json
from datetime import UTC
from uuid import uuid4
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

    def __init__(self, path: str | Path | None = None) -> None:
        self.path = Path(path) if path is not None else None
        self._records: list[dict[str, Any]] = []

    def add(
        self,
        asset: Any,
        *,
        source_ad_id: str | None = None,
        workspace_id: int = 0,
        run_id: str | None = None,
        brief_text: str | None = None,
        session: Any = None,
    ) -> dict[str, Any]:
        """Append one asset and persist. ``source_ad_id`` overrides the field
        for asset types that don't carry it themselves."""
        rec = _to_record(asset)
        if source_ad_id is not None:
            rec["source_ad_id"] = source_ad_id
        if brief_text is not None:
            rec["brief_text"] = brief_text
        if self.path is None and workspace_id <= 0:
            self._records.append(rec)
            return rec
        if self.path is None:
            return self._db_add(rec, workspace_id=workspace_id, run_id=run_id, session=session)
        records = self.all()
        records.append(rec)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(records, indent=2), encoding="utf-8")
        return rec

    def all(self, workspace_id: int = 0, session: Any = None) -> list[dict[str, Any]]:
        """Return every stored asset as plain dicts (empty list if none yet)."""
        if self.path is None and workspace_id <= 0:
            return list(self._records)
        if self.path is None:
            from app.core.db import SessionLocal, init_db
            from app.models import CreativeAsset

            own = session is None
            if own:
                init_db()
                db = SessionLocal()
            else:
                db = session
            try:
                rows = (
                    db.query(CreativeAsset)
                    .filter(CreativeAsset.workspace_id == int(workspace_id))
                    .order_by(CreativeAsset.created_at, CreativeAsset.id)
                    .all()
                )
                return [
                    {
                        "id": row.id,
                        "source_ad_id": row.source_ad_id,
                        "brief_text": row.brief_text,
                        "asset_url": row.asset_url,
                        "duration_s": row.duration_s,
                        "provider": row.provider,
                        "run_id": row.run_id,
                        "created_at": row.created_at.replace(tzinfo=UTC).isoformat(),
                    }
                    for row in rows
                ]
            finally:
                if own:
                    db.close()
        if not self.path.exists():
            return []
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return []
        return data if isinstance(data, list) else []

    def by_source(self, ad_id: str, workspace_id: int = 0, session: Any = None) -> list[dict[str, Any]]:
        """All assets generated from a given source ad id."""
        return [r for r in self.all(workspace_id, session=session) if r.get("source_ad_id") == ad_id]

    def _db_add(
        self,
        rec: dict[str, Any],
        *,
        workspace_id: int,
        run_id: str | None,
        session: Any = None,
    ) -> dict[str, Any]:
        from app.core.db import SessionLocal, init_db
        from app.models import CreativeAsset

        if session is None:
            init_db()
            db = SessionLocal()
            own = True
        else:
            db = session
            own = False
        try:
            row = CreativeAsset(
                id=uuid4().hex,
                workspace_id=int(workspace_id),
                source_ad_id=str(rec.get("source_ad_id") or ""),
                brief_text=rec.get("brief_text"),
                asset_url=str(rec.get("asset_url") or ""),
                duration_s=rec.get("duration_s"),
                provider=rec.get("provider"),
                run_id=run_id,
            )
            db.add(row)
            if own:
                db.commit()
                db.refresh(row)
            else:
                db.flush()
            return {
                "id": row.id,
                "source_ad_id": row.source_ad_id,
                "brief_text": row.brief_text,
                "asset_url": row.asset_url,
                "duration_s": row.duration_s,
                "provider": row.provider,
                "run_id": row.run_id,
                "created_at": row.created_at.replace(tzinfo=UTC).isoformat(),
            }
        finally:
            if own:
                db.close()


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
