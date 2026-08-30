"""LOOP — end-to-end ad lifecycle orchestrator.

Runs find -> score -> create -> launch -> track -> double-down. Every
external write (launch) passes through ``loop.safety_gate`` (draft-first,
paused, human approval) reusing existing PerfOS policy; ROAS tracking folds
spy spend into attribution (``reconcile_spy``), then scales winners / kills
losers (``double_down``). Mock-safe end-to-end by default.
"""
