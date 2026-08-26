"""In-memory + JSON-file store for discovery winner signals.

``WinnerStore`` keeps a ``WinnerSignal`` list in memory and mirrors it to a
JSON file (default ``.build/winners.json``) so results survive process restarts.
Tolerates a missing or corrupt file by starting empty rather than raising.
"""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Mapping

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
    """List of WinnerSignals persisted as JSON at ``path``."""

    def __init__(self, path: str | Path = DEFAULT_PATH) -> None:
        self.path = Path(path)
        self._signals: list[WinnerSignal] = []
        if self.path.exists():
            try:
                raw = json.loads(self.path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                raw = []
            if isinstance(raw, list):
                self._signals = [_coerce(item) for item in raw]

    def add(self, signal: Any) -> WinnerSignal:
        """Append one signal (WinnerSignal, Mapping, or duck-typed) and persist."""
        coerced = _coerce(signal)
        self._signals.append(coerced)
        self._save()
        return coerced

    def all(self) -> list[WinnerSignal]:
        """Return every stored signal (insertion order)."""
        return list(self._signals)

    def top(self, n: int) -> list[WinnerSignal]:
        """Highest-scoring signals first, capped at ``n``."""
        ranked = sorted(self._signals, key=lambda s: s.score, reverse=True)
        return ranked[: max(int(n), 0)]

    def _save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(
            json.dumps([asdict(s) for s in self._signals], indent=2),
            encoding="utf-8",
        )


__all__ = ["DEFAULT_PATH", "WinnerSignal", "WinnerStore"]
