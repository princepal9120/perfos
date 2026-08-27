"""Durable workspace-scoped store for discovery winner signals.

The production/default store uses the main SQL database.  An explicit path is
retained as a small compatibility adapter for isolated unit tests and old local
scripts; application code never uses that JSON path.
"""

from __future__ import annotations

import json
from collections.abc import Mapping
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

DEFAULT_PATH = ".build/winners.json"


@dataclass
class WinnerSignal:
    """One discovered winning-ad signal."""

    ad_id: str
    platform: str | None = None
    competitor: str | None = None
    title: str | None = None
    landing_url: str | None = None
    score: float = 0.0
    tier: str = "loser"
    runtime_days: float = 0.0


_FIELDS = frozenset(WinnerSignal.__dataclass_fields__)  # type: ignore[attr-defined]


def _coerce(signal: Any) -> WinnerSignal:
    """Accept a WinnerSignal, a Mapping, or any object exposing the fields."""
    if isinstance(signal, WinnerSignal):
        return signal
    if isinstance(signal, Mapping):
        return WinnerSignal(**{k: v for k, v in signal.items() if k in _FIELDS})
    return WinnerSignal(
        **{
            k: getattr(signal, k)
            for k in ("ad_id", "platform", "competitor", "title", "landing_url", "score", "tier", "runtime_days")
        }
    )


class WinnerStore:
    """Workspace-scoped winners backed by SQLAlchemy (or explicit test JSON)."""

    def __init__(self, path: str | Path | None = None) -> None:
        self.path = Path(path) if path is not None else None
        self._signals: list[WinnerSignal] = []
        if self.path is not None and self.path.exists():
            try:
                raw = json.loads(self.path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                raw = []
            if isinstance(raw, list):
                self._signals = [_coerce(item) for item in raw]

    def add(self, signal: Any, *, workspace_id: int = 0, session: Any = None) -> WinnerSignal:
        """Append one signal (WinnerSignal, Mapping, or duck-typed) and persist."""
        coerced = _coerce(signal)
        if self.path is None and workspace_id <= 0:
            self._signals.append(coerced)
            return coerced
        if self.path is None:
            return self._db_add(coerced, workspace_id=workspace_id, session=session)
        self._signals.append(coerced)
        self._save()
        return coerced

    def all(self, workspace_id: int = 0, session: Any = None) -> list[WinnerSignal]:
        """Return every stored signal (insertion order)."""
        if self.path is None and workspace_id <= 0:
            return list(self._signals)
        if self.path is None:
            return self._db_all(workspace_id, session=session)
        return list(self._signals)

    def top(self, n: int, workspace_id: int = 0, session: Any = None) -> list[WinnerSignal]:
        """Highest-scoring signals first, capped at ``n``."""
        ranked = sorted(self.all(workspace_id, session=session), key=lambda s: s.score, reverse=True)
        return ranked[: max(int(n), 0)]

    def add_for_workspace(self, signal: Any, workspace_id: int, session: Any = None) -> WinnerSignal:
        """Persist a winner for an authenticated workspace."""
        coerced = _coerce(signal)
        if self.path is not None:
            # Compatibility stores are intentionally not shared between tenants.
            self._signals.append(coerced)
            self._save()
            return coerced
        if workspace_id <= 0:
            self._signals.append(coerced)
            return coerced
        return self._db_add(coerced, workspace_id, session=session)

    def _db_session(self):
        from app.core.db import SessionLocal, init_db

        init_db()
        return SessionLocal()

    @staticmethod
    def _from_db(row: Any) -> WinnerSignal:
        return WinnerSignal(
            ad_id=row.ad_id,
            platform=row.platform,
            competitor=row.competitor,
            title=row.title,
            landing_url=row.landing_url,
            score=float(row.score or 0.0),
            tier=row.tier or "loser",
            runtime_days=float(row.runtime_days or 0.0),
        )

    def _db_add(self, signal: WinnerSignal, workspace_id: int, session: Any = None) -> WinnerSignal:
        from app.models import Winner

        own = session is None
        db = session or self._db_session()
        try:
            row = (
                db.query(Winner)
                .filter(Winner.workspace_id == int(workspace_id), Winner.ad_id == signal.ad_id)
                .first()
            )
            if row is None:
                row = Winner(
                    workspace_id=int(workspace_id),
                    ad_id=signal.ad_id,
                    platform=signal.platform,
                    competitor=signal.competitor,
                    title=signal.title,
                    landing_url=signal.landing_url,
                    score=signal.score,
                    tier=signal.tier,
                    runtime_days=signal.runtime_days,
                )
                db.add(row)
            else:
                row.platform = signal.platform or row.platform
                row.competitor = signal.competitor or row.competitor
                row.title = signal.title or row.title
                row.landing_url = signal.landing_url or row.landing_url
                row.score, row.tier, row.runtime_days = signal.score, signal.tier, signal.runtime_days
            if own:
                db.commit()
                db.refresh(row)
            else:
                db.flush()
            return self._from_db(row)
        finally:
            if own:
                db.close()

    def _db_all(self, workspace_id: int, session: Any = None) -> list[WinnerSignal]:
        from app.models import Winner

        own = session is None
        db = session or self._db_session()
        try:
            rows = (
                db.query(Winner)
                .filter(Winner.workspace_id == int(workspace_id))
                .order_by(Winner.created_at, Winner.id)
                .all()
            )
            return [self._from_db(row) for row in rows]
        finally:
            if own:
                db.close()

    def _save(self) -> None:
        if self.path is None:
            return
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(
            json.dumps([asdict(s) for s in self._signals], indent=2),
            encoding="utf-8",
        )


__all__ = ["DEFAULT_PATH", "WinnerSignal", "WinnerStore"]
