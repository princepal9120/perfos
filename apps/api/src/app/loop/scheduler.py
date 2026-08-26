"""LOOP scheduler -- periodic driver for the find->score->create->launch->track cycle.

Runs ``run_loop`` on a fixed interval, ticking once per cycle. The tick body is
a placeholder: by default (``dry_run=True``) each pass only logs what it would
do; real work is injected via ``tick`` and runs only with ``dry_run=False``.
Mock-safe end-to-end by default, consistent with ``loop.safety_gate``.
"""

from __future__ import annotations

import asyncio
import logging
from collections.abc import Awaitable, Callable

logger = logging.getLogger(__name__)

TickFn = Callable[[], Awaitable[None] | None]

__all__ = ["LoopScheduler"]


class LoopScheduler:
    """Interval loop with start/stop lifecycle. Dry-run by default."""

    def __init__(self, interval: float = 60.0, *, tick: TickFn | None = None, dry_run: bool = True):
        if interval <= 0:
            raise ValueError("loop scheduler: interval must be > 0 seconds")
        self.interval = float(interval)
        self.tick = tick
        self.dry_run = bool(dry_run)
        self._stopped = True
        self._task: asyncio.Task[None] | None = None

    async def run_loop(self) -> None:
        """Tick every ``interval`` seconds until stopped or cancelled."""
        self._stopped = False
        logger.info("loop scheduler started (interval=%.1fs dry_run=%s)", self.interval, self.dry_run)
        try:
            while not self._stopped:
                await self._tick_once()
                await asyncio.sleep(self.interval)
        finally:
            self._stopped = True
            logger.info("loop scheduler stopped")

    def start(self) -> asyncio.Task[None]:
        """Schedule :meth:`run_loop` on the current running loop. Idempotent."""
        if self._task is not None and not self._task.done():
            return self._task
        self._task = asyncio.get_running_loop().create_task(self.run_loop())
        return self._task

    def stop(self) -> None:
        """Signal the loop to exit and cancel the pending sleep immediately."""
        self._stopped = True
        if self._task is not None and not self._task.done():
            self._task.cancel()

    async def _tick_once(self) -> None:
        if self.dry_run:
            # ponytail: placeholder tick; wire real find/score/create/launch pipeline when ready
            logger.info("[dry-run] loop tick (no external effects)")
            return
        if self.tick is None:
            logger.warning("loop scheduler: dry_run=False but no tick configured; skipping")
            return
        result = self.tick()
        if result is not None:
            await result


if __name__ == "__main__":  # smoke test: two dry-run ticks at 0.05s
    async def _demo() -> None:
        s = LoopScheduler(interval=0.05)
        task = s.start()
        await asyncio.sleep(0.12)
        s.stop()
        await asyncio.gather(task, return_exceptions=True)

    logging.basicConfig(level=logging.INFO)
    asyncio.run(_demo())
