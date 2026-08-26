"""Loop configuration: stage order and shared run state."""

from dataclasses import dataclass, field

LOOP_STAGES = [
    "find",
    "score",
    "create",
    "launch",
    "track",
    "double-down",
]


@dataclass
class LoopState:
    """State for one closed-loop run through ``LOOP_STAGES``."""

    stage: str = LOOP_STAGES[0]
    iteration: int = 0
    context: dict = field(default_factory=dict)
