"""LOOP track stage -- collect performance rows for executed launches.

Mock mode only (BUILD_PLAN_50): no platform connectors are called. Returns one
performance row per launch with impressions / spend / conversions derived
deterministically from the launch id, so runs are stable and testable.
"""

from __future__ import annotations

from typing import Any

__all__ = ["track_stage"]


def track_stage(launches: list[dict]) -> list[dict]:
    """Return mock performance rows for each launch.

    Each row is ``{"launch_id", "impressions", "spend", "conversions"}``.
    """
    rows: list[dict] = []
    for i, launch in enumerate(launches):
        if not isinstance(launch, dict):
            continue
        seed = int(launch.get("id") or i + 1) or 1
        rows.append(
            {
                "launch_id": launch.get("id"),
                "impressions": 1000 * seed,
                # ponytail: fixed CPM/CVR math instead of random noise; swap in
                # real connector data when connectors land
                "spend": round(1000 * seed * 0.012, 2),
                "conversions": seed,
            }
        )
    return rows


if __name__ == "__main__":
    out = track_stage([{"id": 3}, {"id": None}])
    assert len(out) == 2
    assert out[0] == {"launch_id": 3, "impressions": 3000, "spend": 36.0, "conversions": 3}
    assert set(out[1]) == {"launch_id", "impressions", "spend", "conversions"}
    assert track_stage([]) == []
    print("ok")
