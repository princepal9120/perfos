"""SQLAlchemy engine/session wiring shared by the whole app."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    """Declarative base; all ORM models in app.models inherit from this."""


def _engine_kwargs() -> dict:
    kwargs: dict = {"future": True}
    if settings.DATABASE_URL.startswith("sqlite"):
        # FastAPI serves requests across threads; allow the shared sqlite connection.
        kwargs["connect_args"] = {"check_same_thread": False}
    return kwargs


engine = create_engine(settings.DATABASE_URL, **_engine_kwargs())

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
