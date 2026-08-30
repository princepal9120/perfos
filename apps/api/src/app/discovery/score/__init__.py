"""SCORE / winner engine — turn collected spy ads into ranked winners.

Pipeline modules: normalize any ``SpyAd`` source to a canonical Ad, detect
hooks/angles with evidence spans, score longevity as a winner proxy, bucket
into winner tiers (high_conf/winner/emerging/loser), fit winners to a
persona's channels, diff winner DNA vs the user's own ads, and expose the
deterministic 0-100 adoracle score. Pure-Python, deterministic, no external
LLM calls.
"""
