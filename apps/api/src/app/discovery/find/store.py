"""SQLite store for discovered spy ads (FIND stage persistence).

Dedupe contract: an ad is identified by (workspace_id, ad_id, persona_tag).
Re-ingesting the same ad bumps ``seen_count`` / ``last_seen_at`` and backfills
previously-empty fields instead of inserting a duplicate row.

Deliberately uses its OWN SQLite database (``DISCOVERY_SPY_DB_URL``, default
``./data/discovery_spy.db``) rather than the main PerfOS DB, so spy data can
never interfere with seeded measurement/demo aggregates.
"""

import os
from collections.abc import Iterator
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Mapping

from sqlalchemy import JSON, String, UniqueConstraint, create_engine, event, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

DEFAULT_DB_URL = "sqlite:///./data/discovery_spy.db"

# Lazily-created engines, keyed by URL so tests can redirect per-call.
_engines: dict[str, Engine] = {}
_sessionmakers: dict[str, sessionmaker] = {}


class Base(DeclarativeBase):
    """Isolated base for discovery tables."""


def _sqlite_url(url: str) -> bool:
    return url.startswith("sqlite") and ":memory:" not in url


def _engine_for(url: str) -> Engine:
    if url in _engines:
        return _engines[url]
    if _sqlite_url(url):
        Path(url.removeprefix("sqlite:///")).parent.mkdir(parents=True, exist_ok=True)
        engine = create_engine(
            url,
            future=True,
            connect_args={"check_same_thread": False, "timeout": 30},
        )
    else:
        engine = create_engine(url, future=True)

    @event.listens_for(engine, "connect")
    def _pragmas(dbapi_conn, _rec) -> None:  # noqa: ANN001
        if not _sqlite_url(url):
            return
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA journal_mode=WAL")
        cur.execute("PRAGMA busy_timeout=30000")
        cur.close()

    Base.metadata.create_all(bind=engine)
    _engines[url] = engine
    _sessionmakers[url] = sessionmaker(bind=engine, autoflush=False, future=True)
    return engine


def _db_url() -> str:
    return os.environ.get("DISCOVERY_SPY_DB_URL", DEFAULT_DB_URL)


@contextmanager
def _session(existing: Session | None) -> Iterator[Session]:
    """Yield the caller's session, or open+close a fresh one."""
    if existing is not None:
        yield existing
        return
    # Ensure the engine/sessionmaker for this URL exists before indexing it.
    _engine_for(_db_url())
    session = _sessionmakers[_db_url()]()
    try:
        yield session
        session.commit()
    finally:
        session.close()


class SpyAdRow(Base):
    """One discovered competitor ad, deduped per (workspace, ad id, persona)."""

    __tablename__ = "discovery_spy_ads"
    __table_args__ = (
        UniqueConstraint("workspace_id", "ad_id", "persona_tag"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(default=0, index=True)
    ad_id: Mapped[str] = mapped_column(String(255), index=True)
    persona_tag: Mapped[str] = mapped_column(String(64), default="", index=True)
    platform: Mapped[str | None] = mapped_column(String(64))
    competitor: Mapped[str | None] = mapped_column(String(255))
    advertiser: Mapped[str | None] = mapped_column(String(255))
    title: Mapped[str | None]
    body: Mapped[str | None]
    landing_url: Mapped[str | None]
    media_urls: Mapped[list | None] = mapped_column(JSON, default=list)
    raw: Mapped[dict | None] = mapped_column(JSON, default=dict)
    seen_count: Mapped[int] = mapped_column(default=1)
    first_seen_at: Mapped[datetime]
    last_seen_at: Mapped[datetime]

    def as_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {}
        for col in self.__table__.columns:
            val = getattr(self, col.name)
            out[col.name] = val.isoformat() if isinstance(val, datetime) else val
        return out


_TEXT_FIELDS = ("platform", "competitor", "advertiser", "title", "body", "landing_url")


def _field(ad: Any, name: str) -> Any:
    if isinstance(ad, Mapping):
        return ad.get(name)
    return getattr(ad, name, None)


def _normalize(ad: Any) -> dict[str, Any]:
    media = _field(ad, "media_urls") or []
    if isinstance(media, str):
        media = [media]
    return {
        "ad_id": str(_field(ad, "ad_id") or "").strip(),
        "platform": _field(ad, "platform"),
        "competitor": _field(ad, "competitor"),
        "advertiser": _field(ad, "advertiser"),
        "title": _field(ad, "title"),
        "body": _field(ad, "body") or _field(ad, "text"),
        "landing_url": _field(ad, "landing_url") or _field(ad, "url"),
        "media_urls": [str(m) for m in media],
        "raw": (_field(ad, "raw") if isinstance(_field(ad, "raw"), dict) else None),
    }


def upsert_ad(
    ad: Any,
    *,
    workspace_id: int = 0,
    persona_tag: str = "",
    session: Session | None = None,
) -> tuple[SpyAdRow, bool]:
    """Insert or dedupe-update one spy ad. Returns (row, created)."""
    data = _normalize(ad)
    if not data["ad_id"]:
        raise ValueError("spy ad is missing 'ad_id'")

    with _session(session) as db:
        row = db.execute(
            select(SpyAdRow).where(
                SpyAdRow.workspace_id == workspace_id,
                SpyAdRow.ad_id == data["ad_id"],
                SpyAdRow.persona_tag == persona_tag,
            )
        ).scalar_one_or_none()
        now = datetime.now(timezone.utc)
        if row is None:
            row = SpyAdRow(
                workspace_id=workspace_id,
                ad_id=data["ad_id"],
                persona_tag=persona_tag,
                first_seen_at=now,
                last_seen_at=now,
                **{k: v for k, v in data.items() if k != "ad_id"},
            )
            db.add(row)
            db.flush()
            db.expunge(row)  # detach so callers can read attrs after the session closes
            return row, True

        row.seen_count += 1
        row.last_seen_at = now
        # Backfill fields that were empty when first seen.
        for name in _TEXT_FIELDS:
            if not getattr(row, name) and data[name]:
                setattr(row, name, data[name])
        if not row.media_urls and data["media_urls"]:
            row.media_urls = data["media_urls"]
        if not row.raw and data["raw"]:
            row.raw = data["raw"]
        db.flush()
        db.expunge(row)  # detach so callers can read attrs after the session closes
        return row, False


def upsert_ads(
    ads: list[Any],
    *,
    workspace_id: int = 0,
    persona_tag: str = "",
) -> list[tuple[SpyAdRow, bool]]:
    """Bulk idempotent insert; one transaction for the whole batch."""
    engine = _engine_for(_db_url())
    results: list[tuple[SpyAdRow, bool]] = []
    with Session(engine) as db:
        for ad in ads:
            results.append(
                upsert_ad(ad, workspace_id=workspace_id, persona_tag=persona_tag, session=db)
            )
        db.commit()
    return results


def list_ads(
    *,
    workspace_id: int = 0,
    persona_tag: str | None = None,
    competitor: str | None = None,
    limit: int = 500,
) -> list[dict[str, Any]]:
    """List stored spy ads (newest first) as plain dicts."""
    _engine_for(_db_url())
    stmt = select(SpyAdRow).where(SpyAdRow.workspace_id == workspace_id)
    if persona_tag is not None:
        stmt = stmt.where(SpyAdRow.persona_tag == persona_tag)
    if competitor is not None:
        stmt = stmt.where(SpyAdRow.competitor == competitor)
    stmt = stmt.order_by(SpyAdRow.last_seen_at.desc()).limit(limit)
    with _sessionmakers[_db_url()]() as db:
        return [row.as_dict() for row in db.scalars(stmt)]


__all__ = [
    "SpyAdRow",
    "list_ads",
    "upsert_ad",
    "upsert_ads",
]
