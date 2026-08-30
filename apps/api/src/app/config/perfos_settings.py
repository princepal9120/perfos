"""PerfOS agent settings (env-driven): PERFOS_DRY_RUN, PERFOS_PERSONA."""

import os
from dataclasses import dataclass
from functools import lru_cache

_FALSY = {"0", "false", "no", "off"}


@dataclass(frozen=True)
class PerfosSettings:
    dry_run: bool = True
    persona: str = "saas"


@lru_cache(maxsize=1)
def get_settings() -> PerfosSettings:
    raw_dry_run = os.getenv("PERFOS_DRY_RUN")
    return PerfosSettings(
        dry_run=True if raw_dry_run is None else raw_dry_run.strip().lower() not in _FALSY,
        persona=os.getenv("PERFOS_PERSONA", "saas").strip() or "saas",
    )
