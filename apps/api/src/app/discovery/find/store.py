"""SQLite store for discovered spy ads (FIND stage persistence).

Dedupe contract: an ad is identified by (workspace_id, ad_id, persona_tag).
Re-ingesting the same ad bumps ``seen_count`` / ``last_seen_at`` and backfills
previously-empty fields instead of inserting a duplicate row.

Deliberately uses its OWN SQLite database (``DISCOVERY_SPY_DB_URL``, default
``./data/discovery_spy.db``) rather than the main PerfOS DB, so spy data can
never interfere with seeded measurement/demo aggregates.
"""

import os
from collections.abc import Iterator, Mapping
from contextlib import contextmanager
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from sqlalchemy import JSON, String, UniqueConstraint, create_engine, event, or_, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

from app.discovery.score.winner_tiers import EMERGING, HIGH_CONF, LOSER, WINNER

DEFAULT_DB_URL = "sqlite:///./data/discovery_spy.db"

# Lazily-created engines, keyed by URL so tests can redirect per-call.
_engines: dict[str, Engine] = {}
_sessionmakers: dict[str, sessionmaker] = {}


class Base(DeclarativeBase):
    """Isolated base for discovery tables."""


def _sqlite_url(url: str) -> bool:
    return url.startswith("sqlite") and ":memory:" not in url


class _SqliteColumnMigrator:
    """Adds ORM columns that are missing from an already-created SQLite table.

    ``create_all`` is a no-op for existing tables, and spy DB files ship on disk, so
    every column added after the first release needs this additive ALTER TABLE pass.
    """

    def __init__(self, engine: Engine) -> None:
        self._engine = engine

    def run(self) -> None:
        if self._engine.dialect.name != "sqlite":
            return
        with self._engine.begin() as conn:
            for table in Base.metadata.tables.values():
                rows = conn.exec_driver_sql(f'PRAGMA table_info("{table.name}")').fetchall()
                existing = {row[1] for row in rows}
                if not existing:
                    continue
                for col in table.columns:
                    if col.name in existing:
                        continue
                    ddl = col.type.compile(self._engine.dialect)
                    conn.exec_driver_sql(
                        f'ALTER TABLE "{table.name}" ADD COLUMN "{col.name}" {ddl}'
                    )


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
    _SqliteColumnMigrator(engine).run()
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
    cta: Mapped[str | None]
    landing_url: Mapped[str | None]
    media_urls: Mapped[list | None] = mapped_column(JSON, default=list)
    raw: Mapped[dict | None] = mapped_column(JSON, default=dict)
    score: Mapped[float | None]
    tier: Mapped[str | None] = mapped_column(String(32))
    start_date: Mapped[datetime | None]
    variant_count: Mapped[int | None]
    seen_count: Mapped[int] = mapped_column(default=1)
    first_seen_at: Mapped[datetime]
    last_seen_at: Mapped[datetime]

    def as_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {}
        for col in self.__table__.columns:
            val = getattr(self, col.name)
            out[col.name] = val.isoformat() if isinstance(val, datetime) else val
        return out


class SavedAdRow(Base):
    """One ad pinned to a named board (the "swipe file" side of the ad library)."""

    __tablename__ = "discovery_saved_ads"
    __table_args__ = (
        UniqueConstraint("workspace_id", "ad_id", "board"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(default=0, index=True)
    ad_id: Mapped[str] = mapped_column(String(255), index=True)
    board: Mapped[str] = mapped_column(String(64), default="default", index=True)
    note: Mapped[str | None]
    saved_at: Mapped[datetime]


class TrackedCompetitorRow(Base):
    """A competitor on the workspace watchlist, independent of whether ads exist yet."""

    __tablename__ = "discovery_tracked_competitors"
    __table_args__ = (
        UniqueConstraint("workspace_id", "name"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(default=0, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    platform: Mapped[str | None] = mapped_column(String(64))
    domain: Mapped[str | None] = mapped_column(String(255))
    tracked_at: Mapped[datetime]
    last_synced_at: Mapped[datetime | None]


_TEXT_FIELDS = ("platform", "competitor", "advertiser", "title", "body", "cta", "landing_url")
_SIGNAL_FIELDS = ("score", "tier", "start_date", "variant_count")


def _field(ad: Any, name: str) -> Any:
    if isinstance(ad, Mapping):
        return ad.get(name)
    return getattr(ad, name, None)


def _as_float(value: Any) -> float | None:
    if isinstance(value, bool) or not isinstance(value, (int, float, str)):
        return None
    try:
        return float(value)
    except ValueError:
        return None


def _as_int(value: Any) -> int | None:
    parsed = _as_float(value)
    return None if parsed is None else int(parsed)


def _as_datetime(value: Any) -> datetime | None:
    """Accept both real datetimes and the ISO strings that come back over JSON."""
    if isinstance(value, datetime):
        return value
    if isinstance(value, str) and value.strip():
        try:
            return datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
        except ValueError:
            return None
    return None


def _utc_naive(value: datetime | None) -> datetime | None:
    """SQLite drops tzinfo on write, so compare everything as naive UTC."""
    if value is None:
        return None
    if value.tzinfo is None:
        return value
    return value.astimezone(UTC).replace(tzinfo=None)


def _normalize(ad: Any) -> dict[str, Any]:
    media = _field(ad, "media_urls") or []
    if isinstance(media, str):
        media = [media]
    creative_url = _field(ad, "creative_url")
    if not media and creative_url:
        media = [creative_url]
    return {
        "ad_id": str(_field(ad, "ad_id") or "").strip(),
        "platform": _field(ad, "platform"),
        "competitor": _field(ad, "competitor"),
        "advertiser": _field(ad, "advertiser"),
        "title": _field(ad, "title") or _field(ad, "hook"),
        "body": _field(ad, "body") or _field(ad, "text"),
        "cta": _field(ad, "cta"),
        "landing_url": _field(ad, "landing_url") or _field(ad, "url"),
        "media_urls": [str(m) for m in media],
        "raw": (_field(ad, "raw") if isinstance(_field(ad, "raw"), dict) else None),
        "score": _as_float(_field(ad, "score")),
        "tier": _field(ad, "tier"),
        "start_date": _as_datetime(_field(ad, "start_date")),
        "variant_count": _as_int(_field(ad, "variant_count")),
    }


def _refresh_signals(row: SpyAdRow, data: Mapping[str, Any]) -> None:
    """Replace the volatile scoring signals on a re-scored ad.

    A None means "not scored on this pass", not "clear the stored value", so only
    supplied signals overwrite. Written out field by field because the house rule
    forbids getattr.
    """
    if data["score"] is not None:
        row.score = data["score"]
    if data["tier"] is not None:
        row.tier = data["tier"]
    if data["variant_count"] is not None:
        row.variant_count = data["variant_count"]
    if data["start_date"] is not None:
        row.start_date = data["start_date"]


def upsert_ad(
    ad: Any,
    *,
    workspace_id: int = 0,
    persona_tag: str = "",
    refresh: bool = False,
    session: Session | None = None,
) -> tuple[SpyAdRow, bool]:
    """Insert or dedupe-update one spy ad. Returns (row, created).

    ``refresh=True`` re-scores an existing row: score/tier/variant_count/start_date are
    overwritten instead of only backfilled. Text stays empty-only backfill either way,
    so a sparse re-sync can never blank out copy that was captured earlier.
    """
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
        now = datetime.now(UTC)
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
        for name in _TEXT_FIELDS + _SIGNAL_FIELDS:
            if not getattr(row, name) and data[name]:
                setattr(row, name, data[name])
        if not row.media_urls and data["media_urls"]:
            row.media_urls = data["media_urls"]
        if not row.raw and data["raw"]:
            row.raw = data["raw"]
        if refresh:
            _refresh_signals(row, data)
        db.flush()
        db.expunge(row)  # detach so callers can read attrs after the session closes
        return row, False


def upsert_ads(
    ads: list[Any],
    *,
    workspace_id: int = 0,
    persona_tag: str = "",
    refresh: bool = False,
) -> list[tuple[SpyAdRow, bool]]:
    """Bulk idempotent insert; one transaction for the whole batch."""
    engine = _engine_for(_db_url())
    results: list[tuple[SpyAdRow, bool]] = []
    with Session(engine) as db:
        for ad in ads:
            results.append(
                upsert_ad(
                    ad,
                    workspace_id=workspace_id,
                    persona_tag=persona_tag,
                    refresh=refresh,
                    session=db,
                )
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


def _iso(value: datetime | None) -> str | None:
    return None if value is None else value.isoformat()


def _domain_of(url: str | None) -> str | None:
    if not url:
        return None
    return urlparse(url).netloc.lower().removeprefix("www.") or None


def _freshest_ad(db: Session, ad_id: str, workspace_id: int) -> SpyAdRow | None:
    """The same ad_id exists once per persona_tag; the library shows the newest copy."""
    return db.scalars(
        select(SpyAdRow)
        .where(SpyAdRow.workspace_id == workspace_id, SpyAdRow.ad_id == ad_id)
        .order_by(SpyAdRow.last_seen_at.desc(), SpyAdRow.id.desc())
    ).first()


def _saved_boards(db: Session, workspace_id: int) -> dict[str, list[str]]:
    """ad_id -> the board names it is saved to, for one workspace."""
    boards: dict[str, list[str]] = {}
    stmt = select(SavedAdRow).where(SavedAdRow.workspace_id == workspace_id)
    for row in db.scalars(stmt):
        boards.setdefault(row.ad_id, []).append(row.board)
    return {ad_id: sorted(names) for ad_id, names in boards.items()}


class _AdLibraryProjection:
    """Renders a SpyAdRow into the canonical AdLibraryItem dict every endpoint returns."""

    def __init__(self, saved_boards: Mapping[str, list[str]]) -> None:
        self._saved_boards = saved_boards

    def item(self, row: SpyAdRow) -> dict[str, Any]:
        media = [str(m) for m in (row.media_urls or [])]
        boards = list(self._saved_boards.get(row.ad_id, []))
        return {
            "ad_id": row.ad_id,
            "platform": row.platform,
            "advertiser": row.advertiser or row.competitor,
            "title": row.title,
            "body": row.body,
            "cta": row.cta,
            "landing_url": row.landing_url,
            "media_urls": media,
            "creative_url": media[0] if media else None,
            "score": row.score,
            "tier": row.tier,
            "start_date": _iso(row.start_date),
            "first_seen_at": _iso(row.first_seen_at),
            "last_seen_at": _iso(row.last_seen_at),
            "runtime_days": self._runtime_days(row),
            "variant_count": row.variant_count,
            "seen_count": row.seen_count,
            "saved": bool(boards),
            "boards": boards,
        }

    def placeholder(self, ad_id: str) -> dict[str, Any]:
        """A board can hold an ad the FIND stage has since dropped; callers still need
        the canonical shape rather than a null."""
        now = datetime.now(UTC)
        return self.item(SpyAdRow(ad_id=ad_id, seen_count=0, first_seen_at=now, last_seen_at=now))

    @staticmethod
    def _runtime_days(row: SpyAdRow) -> float:
        last = _utc_naive(row.last_seen_at)
        anchor = _utc_naive(row.start_date) or _utc_naive(row.first_seen_at)
        if last is None or anchor is None:
            return 0.0
        return round(max((last - anchor).total_seconds() / 86400.0, 0.0), 2)


class _AdLibraryQuery:
    """Filters and sorts the ad library.

    ``runtime_days`` is derived rather than stored, so that filter and sort run in
    Python over the projected items. Rows are deduped by ad_id (the same ad exists
    once per persona_tag) keeping the most recently seen copy.
    """

    SORTS = {
        "recent": lambda item: item["last_seen_at"] or "",
        "score": lambda item: item["score"] if item["score"] is not None else -1.0,
        "runtime": lambda item: item["runtime_days"],
        "variants": lambda item: item["variant_count"] if item["variant_count"] is not None else -1,
    }

    def __init__(
        self,
        db: Session,
        *,
        workspace_id: int = 0,
        q: str | None = None,
        platform: str | None = None,
        competitor: str | None = None,
        tier: str | None = None,
        board: str | None = None,
        saved_only: bool = False,
        min_runtime_days: float | None = None,
        sort: str = "recent",
        limit: int = 60,
        offset: int = 0,
    ) -> None:
        self._db = db
        self._workspace_id = workspace_id
        self._q = (q or "").strip()
        self._platform = platform
        self._competitor = competitor
        self._tier = tier
        self._board = board
        self._saved_only = saved_only
        self._min_runtime_days = min_runtime_days
        self._sort = sort
        self._limit = max(limit, 0)
        self._offset = max(offset, 0)

    def run(self) -> dict[str, Any]:
        items = self._items()
        if self._min_runtime_days is not None:
            floor = float(self._min_runtime_days)
            items = [item for item in items if item["runtime_days"] >= floor]
        items.sort(key=self.SORTS.get(self._sort, self.SORTS["recent"]), reverse=True)
        window = items[self._offset : self._offset + self._limit] if self._limit else items
        return {"total": len(items), "items": window}

    def _items(self) -> list[dict[str, Any]]:
        projection = _AdLibraryProjection(_saved_boards(self._db, self._workspace_id))
        deduped: dict[str, dict[str, Any]] = {}
        for row in self._db.scalars(self._stmt()):
            if row.ad_id not in deduped:
                deduped[row.ad_id] = projection.item(row)
        return list(deduped.values())

    def _stmt(self):
        stmt = select(SpyAdRow).where(SpyAdRow.workspace_id == self._workspace_id)
        if self._q:
            like = f"%{self._q}%"
            stmt = stmt.where(
                or_(
                    SpyAdRow.advertiser.ilike(like),
                    SpyAdRow.competitor.ilike(like),
                    SpyAdRow.title.ilike(like),
                    SpyAdRow.body.ilike(like),
                    SpyAdRow.cta.ilike(like),
                )
            )
        if self._platform:
            stmt = stmt.where(SpyAdRow.platform == self._platform)
        if self._competitor:
            stmt = stmt.where(
                or_(
                    SpyAdRow.competitor.ilike(self._competitor),
                    SpyAdRow.advertiser.ilike(self._competitor),
                )
            )
        if self._tier:
            stmt = stmt.where(SpyAdRow.tier == self._tier)
        saved_ids = self._saved_ids()
        if saved_ids is not None:
            stmt = stmt.where(SpyAdRow.ad_id.in_(saved_ids))
        return stmt.order_by(SpyAdRow.last_seen_at.desc(), SpyAdRow.id.desc())

    def _saved_ids(self) -> set[str] | None:
        if self._board is None and not self._saved_only:
            return None
        stmt = select(SavedAdRow.ad_id).where(SavedAdRow.workspace_id == self._workspace_id)
        if self._board is not None:
            stmt = stmt.where(SavedAdRow.board == self._board)
        return set(self._db.scalars(stmt))


class _SavedAdsView:
    """The swipe-file page: per-board counts plus the ads on the selected board."""

    def __init__(self, db: Session, *, workspace_id: int = 0) -> None:
        self._db = db
        self._workspace_id = workspace_id

    def run(self, *, board: str | None = None, limit: int = 200) -> dict[str, Any]:
        saved = list(self._db.scalars(self._saved_stmt()))
        counts: dict[str, int] = {}
        for row in saved:
            counts[row.board] = counts.get(row.board, 0) + 1
        projection = _AdLibraryProjection(_saved_boards(self._db, self._workspace_id))

        items: list[dict[str, Any]] = []
        emitted: set[str] = set()
        for row in saved:
            if board is not None and row.board != board:
                continue
            if row.ad_id in emitted:
                continue
            emitted.add(row.ad_id)
            ad = _freshest_ad(self._db, row.ad_id, self._workspace_id)
            items.append(
                projection.item(ad) if ad is not None else projection.placeholder(row.ad_id)
            )
        capped = items[: max(limit, 0)] if limit else items
        return {
            "total": len(items),
            "items": capped,
            "boards": [{"board": name, "count": counts[name]} for name in sorted(counts)],
        }

    def _saved_stmt(self):
        return (
            select(SavedAdRow)
            .where(SavedAdRow.workspace_id == self._workspace_id)
            .order_by(SavedAdRow.saved_at.desc(), SavedAdRow.id.desc())
        )


_TIER_RANK = (HIGH_CONF, WINNER, EMERGING, LOSER)


class _CompetitorRoster:
    """Union of the tracked watchlist and every advertiser actually seen in the spy DB.

    Names are unioned case-insensitively; the tracked row's spelling wins as the label.
    """

    def __init__(self, db: Session, *, workspace_id: int = 0) -> None:
        self._db = db
        self._workspace_id = workspace_id

    @staticmethod
    def blank(name: str) -> dict[str, Any]:
        return {
            "name": name,
            "platform": None,
            "domain": None,
            "tracked": False,
            "ad_count": 0,
            "avg_score": None,
            "top_tier": None,
            "last_seen_at": None,
            "tracked_at": None,
            "last_synced_at": None,
        }

    def run(self) -> list[dict[str, Any]]:
        entries: dict[str, dict[str, Any]] = {}
        scores: dict[str, list[float]] = {}
        ad_ids: dict[str, set[str]] = {}

        for row in self._db.scalars(
            select(SpyAdRow).where(SpyAdRow.workspace_id == self._workspace_id)
        ):
            name = (row.advertiser or row.competitor or "").strip()
            if not name:
                continue
            key = name.lower()
            entry = entries.setdefault(key, self.blank(name))
            ad_ids.setdefault(key, set()).add(row.ad_id)
            if row.score is not None:
                scores.setdefault(key, []).append(float(row.score))
            self._absorb(entry, row)

        for tracked in self._db.scalars(
            select(TrackedCompetitorRow).where(
                TrackedCompetitorRow.workspace_id == self._workspace_id
            )
        ):
            key = tracked.name.strip().lower()
            entry = entries.setdefault(key, self.blank(tracked.name))
            entry["name"] = tracked.name
            entry["tracked"] = True
            entry["tracked_at"] = _iso(tracked.tracked_at)
            entry["last_synced_at"] = _iso(tracked.last_synced_at)
            entry["platform"] = tracked.platform or entry["platform"]
            entry["domain"] = tracked.domain or entry["domain"]

        roster = []
        for key, entry in entries.items():
            found = scores.get(key, [])
            entry["ad_count"] = len(ad_ids.get(key, set()))
            entry["avg_score"] = round(sum(found) / len(found), 2) if found else None
            roster.append(entry)
        roster.sort(key=lambda entry: (-entry["ad_count"], entry["name"].lower()))
        return roster

    def _absorb(self, entry: dict[str, Any], row: SpyAdRow) -> None:
        if not entry["platform"]:
            entry["platform"] = row.platform
        if not entry["domain"]:
            entry["domain"] = _domain_of(row.landing_url)
        last = _iso(row.last_seen_at)
        if last and (entry["last_seen_at"] is None or last > entry["last_seen_at"]):
            entry["last_seen_at"] = last
        if row.tier and self._tier_rank(row.tier) < self._tier_rank(entry["top_tier"]):
            entry["top_tier"] = row.tier

    @staticmethod
    def _tier_rank(tier: str | None) -> int:
        return _TIER_RANK.index(tier) if tier in _TIER_RANK else len(_TIER_RANK)


def _item_for(db: Session, ad_id: str, workspace_id: int) -> dict[str, Any] | None:
    row = _freshest_ad(db, ad_id, workspace_id)
    if row is None:
        return None
    return _AdLibraryProjection(_saved_boards(db, workspace_id)).item(row)


def search_ads(
    *,
    workspace_id: int = 0,
    q: str | None = None,
    platform: str | None = None,
    competitor: str | None = None,
    tier: str | None = None,
    board: str | None = None,
    saved_only: bool = False,
    min_runtime_days: float | None = None,
    sort: str = "recent",
    limit: int = 60,
    offset: int = 0,
) -> dict[str, Any]:
    """One page of the ad library: ``{"total": int, "items": [AdLibraryItem]}``."""
    _engine_for(_db_url())
    with _sessionmakers[_db_url()]() as db:
        return _AdLibraryQuery(
            db,
            workspace_id=workspace_id,
            q=q,
            platform=platform,
            competitor=competitor,
            tier=tier,
            board=board,
            saved_only=saved_only,
            min_runtime_days=min_runtime_days,
            sort=sort,
            limit=limit,
            offset=offset,
        ).run()


def get_ad(ad_id: str, *, workspace_id: int = 0) -> dict[str, Any] | None:
    """One AdLibraryItem, or None when the ad was never discovered."""
    key = str(ad_id).strip()
    if not key:
        return None
    _engine_for(_db_url())
    with _sessionmakers[_db_url()]() as db:
        return _item_for(db, key, workspace_id)


def save_ad(
    ad_id: str,
    *,
    workspace_id: int = 0,
    board: str = "default",
    note: str | None = None,
) -> dict[str, Any]:
    """Pin an ad to a board. Idempotent; re-saving only refreshes a supplied note."""
    key = str(ad_id).strip()
    if not key:
        raise ValueError("save_ad requires an 'ad_id'")
    board_name = (board or "default").strip() or "default"

    with _session(None) as db:
        row = db.execute(
            select(SavedAdRow).where(
                SavedAdRow.workspace_id == workspace_id,
                SavedAdRow.ad_id == key,
                SavedAdRow.board == board_name,
            )
        ).scalar_one_or_none()
        if row is None:
            db.add(
                SavedAdRow(
                    workspace_id=workspace_id,
                    ad_id=key,
                    board=board_name,
                    note=note,
                    saved_at=datetime.now(UTC),
                )
            )
        elif note is not None:
            row.note = note
        db.flush()
        item = _item_for(db, key, workspace_id)
        if item is not None:
            return item
        return _AdLibraryProjection(_saved_boards(db, workspace_id)).placeholder(key)


def unsave_ad(ad_id: str, *, workspace_id: int = 0, board: str = "default") -> bool:
    """Unpin an ad from one board. False when it was not pinned there."""
    key = str(ad_id).strip()
    board_name = (board or "default").strip() or "default"
    with _session(None) as db:
        row = db.execute(
            select(SavedAdRow).where(
                SavedAdRow.workspace_id == workspace_id,
                SavedAdRow.ad_id == key,
                SavedAdRow.board == board_name,
            )
        ).scalar_one_or_none()
        if row is None:
            return False
        db.delete(row)
        return True


def list_saved_ads(
    *,
    workspace_id: int = 0,
    board: str | None = None,
    limit: int = 200,
) -> dict[str, Any]:
    """Saved ads plus board counts: ``{"total", "items", "boards"}``."""
    _engine_for(_db_url())
    with _sessionmakers[_db_url()]() as db:
        return _SavedAdsView(db, workspace_id=workspace_id).run(board=board, limit=limit)


def track_competitor(
    name: str,
    *,
    workspace_id: int = 0,
    platform: str | None = None,
    domain: str | None = None,
) -> dict[str, Any]:
    """Add a competitor to the watchlist. Idempotent; fills in missing platform/domain."""
    key = str(name).strip()
    if not key:
        raise ValueError("track_competitor requires a 'name'")

    with _session(None) as db:
        row = db.execute(
            select(TrackedCompetitorRow).where(
                TrackedCompetitorRow.workspace_id == workspace_id,
                TrackedCompetitorRow.name == key,
            )
        ).scalar_one_or_none()
        if row is None:
            db.add(
                TrackedCompetitorRow(
                    workspace_id=workspace_id,
                    name=key,
                    platform=platform,
                    domain=domain,
                    tracked_at=datetime.now(UTC),
                )
            )
        else:
            row.platform = platform or row.platform
            row.domain = domain or row.domain
        db.flush()
        roster = _CompetitorRoster(db, workspace_id=workspace_id).run()
        return next(
            (entry for entry in roster if entry["name"].strip().lower() == key.lower()),
            _CompetitorRoster.blank(key),
        )


def untrack_competitor(name: str, *, workspace_id: int = 0) -> bool:
    """Drop a competitor from the watchlist. False when it was not tracked."""
    key = str(name).strip()
    with _session(None) as db:
        row = db.scalars(
            select(TrackedCompetitorRow).where(
                TrackedCompetitorRow.workspace_id == workspace_id,
                TrackedCompetitorRow.name.ilike(key),
            )
        ).first()
        if row is None:
            return False
        db.delete(row)
        return True


def mark_competitor_synced(name: str, *, workspace_id: int = 0) -> bool:
    """Stamp a tracked competitor's last sync. False when it is not on the watchlist.

    Only tracked competitors carry the stamp; an advertiser merely observed in the spy
    DB has no row to write to.
    """
    key = str(name).strip()
    with _session(None) as db:
        row = db.scalars(
            select(TrackedCompetitorRow).where(
                TrackedCompetitorRow.workspace_id == workspace_id,
                TrackedCompetitorRow.name.ilike(key),
            )
        ).first()
        if row is None:
            return False
        row.last_synced_at = datetime.now(UTC)
        return True


def list_competitors(*, workspace_id: int = 0) -> list[dict[str, Any]]:
    """AdLibraryCompetitor dicts: tracked watchlist ∪ advertisers seen in the spy DB."""
    _engine_for(_db_url())
    with _sessionmakers[_db_url()]() as db:
        return _CompetitorRoster(db, workspace_id=workspace_id).run()


__all__ = [
    "SavedAdRow",
    "SpyAdRow",
    "TrackedCompetitorRow",
    "get_ad",
    "list_ads",
    "list_competitors",
    "list_saved_ads",
    "mark_competitor_synced",
    "save_ad",
    "search_ads",
    "track_competitor",
    "unsave_ad",
    "untrack_competitor",
    "upsert_ad",
    "upsert_ads",
]
