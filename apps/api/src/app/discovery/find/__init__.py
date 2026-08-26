"""FIND / spy stage — collect competitors' ads from public sources.

Adapters (one file per source) wrap MIT/Apache-2.0 OSS collectors and
normalize every result into shared Pydantic schemas (``SpyAd``,
``Advertiser``, ``CreativeAsset``) for ingestion, dedupe, storage, and
persona-to-channel mapping. Works keyless against public libraries;
mock-safe by default.
"""
