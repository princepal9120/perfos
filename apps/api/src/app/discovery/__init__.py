"""PerfOS Discovery — FIND + SCORE (the missing half of the ad lifecycle).

FIND (`discovery.find`): OSS adapters over public ad libraries
(MetaAdsCollector, meta-ads-scraper, TikTok Ad Library, Google Ads
Transparency, LinkedIn, X) that normalize competitor ads into ``SpyAd`` rows.
SCORE (`discovery.score`): winner engine — hook/angle detection, longevity,
winner tiers, persona fit, and the deterministic 0-100 adoracle scoring port.

Additive module; mock-safe by default, no external LLM calls.
"""
