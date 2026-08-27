"""SQLAlchemy engine/session wiring shared by the whole app."""

from collections.abc import Generator

from sqlalchemy import create_engine, event, inspect
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    """Declarative base; all ORM models in app.models inherit from this."""


def _engine_kwargs() -> dict:
    kwargs: dict = {"future": True}
    if settings.DATABASE_URL.startswith("sqlite"):
        kwargs["connect_args"] = {"check_same_thread": False, "timeout": 30}
    return kwargs


engine = create_engine(settings.DATABASE_URL, **_engine_kwargs())


@event.listens_for(engine, "connect")
def _sqlite_pragmas(dbapi_conn, _connection_record) -> None:
    if not settings.DATABASE_URL.startswith("sqlite"):
        return
    cur = dbapi_conn.cursor()
    cur.execute("PRAGMA journal_mode=WAL")
    cur.execute("PRAGMA synchronous=NORMAL")
    cur.execute("PRAGMA busy_timeout=30000")
    cur.execute("PRAGMA foreign_keys=ON")
    cur.close()

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    future=True,
)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a scoped session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables. Imported lazily so models can `from app.core.db import Base`."""
    import app.models  # noqa: F401  (registers ORM mappings on Base.metadata)

    Base.metadata.create_all(bind=engine)
    _additive_sqlite_columns()


def _additive_sqlite_columns() -> None:
    """Apply the small, backwards-compatible schema additions without Alembic.

    PerfOS ships with SQLite for local operation. ``create_all`` does not alter
    existing tables, so the two correlation columns on the legacy audit table
    need an additive migration when an existing demo database is upgraded.
    """
    if engine.dialect.name != "sqlite":
        return
    table = Base.metadata.tables.get("audit_logs")
    if table is None:
        return
    with engine.begin() as conn:
        existing = {column[1] for column in inspect(conn).get_columns("audit_logs")}
        for column_name in ("command_id", "correlation_id"):
            if column_name not in existing:
                conn.exec_driver_sql(
                    f'ALTER TABLE audit_logs ADD COLUMN "{column_name}" VARCHAR(64)'
                )
