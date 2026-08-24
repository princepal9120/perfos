"""Lightweight workspace API-key verification and signed tokens.

No heavy auth deps: hashlib + hmac only. Keys come from env
(DEFAULT_WORKSPACE_API_KEY = demo/master key) or from the DB table
`workspace_api_keys` (workspace_id, key_hash) when it exists.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import os
import time
from typing import Optional

DEFAULT_KEY_ENV = "DEFAULT_WORKSPACE_API_KEY"
SECRET_ENV = "PERFOS_SECRET_KEY"
TOKEN_TTL_SECONDS = 24 * 60 * 60
_DEV_FALLBACK_SECRET = "perfos-dev-secret-do-not-use-in-prod"


def _secret() -> str:
    return (
        os.environ.get(SECRET_ENV)
        or os.environ.get(DEFAULT_KEY_ENV)
        or _DEV_FALLBACK_SECRET
    )


def hash_key(api_key: str) -> str:
    """Stable sha256 hex digest used for at-rest key comparison in the DB."""
    return hashlib.sha256(api_key.encode("utf-8")).hexdigest()


def _workspace_exists(workspace_id: str) -> Optional[bool]:
    """True/False if a session layer is reachable, None otherwise (mock mode)."""
    try:
        from sqlalchemy import text

        from app.core.db import SessionLocal
    except Exception:
        return None
    try:
        db = SessionLocal()
        try:
            row = db.execute(
                text("SELECT 1 FROM workspaces WHERE id = :wid"),
                {"wid": workspace_id},
            ).fetchone()
        finally:
            db.close()
    except Exception:
        return None
    return row is not None


def _db_key_matches(api_key: str, workspace_id: str) -> bool:
    try:
        from sqlalchemy import text

        from app.core.db import SessionLocal
    except Exception:
        return False
    try:
        db = SessionLocal()
        try:
            rows = db.execute(
                text(
                    "SELECT key_hash FROM workspace_api_keys "
                    "WHERE workspace_id = :wid"
                ),
                {"wid": workspace_id},
            ).fetchall()
        finally:
            db.close()
    except Exception:
        return False
    target = hash_key(api_key)
    return any(
        hmac.compare_digest(str(row[0]), target) for row in rows
    )


def verify_workspace(api_key: Optional[str], workspace_id: Optional[str]) -> bool:
    if not api_key or not workspace_id:
        return False
    env_key = os.environ.get(DEFAULT_KEY_ENV)
    if env_key and hmac.compare_digest(api_key, env_key):
        # Demo/master key: valid for any workspace; still require the
        # workspace to exist when a DB is actually reachable.
        if _workspace_exists(workspace_id) is not False:
            return True
    if _db_key_matches(api_key, workspace_id):
        return True
    return False


def create_token(workspace_id: str) -> str:
    """Signed-ish token: base64url("{workspace_id}:{expiry}:{hmac_sig}")."""
    expires_at = int(time.time()) + TOKEN_TTL_SECONDS
    payload = f"{workspace_id}:{expires_at}"
    sig = hmac.new(
        _secret().encode("utf-8"), payload.encode("utf-8"), hashlib.sha256
    ).hexdigest()
    raw = f"{payload}:{sig}"
    return base64.urlsafe_b64encode(raw.encode("utf-8")).decode("ascii")


def verify_token(token: Optional[str]) -> Optional[str]:
    """Return workspace_id for a valid, unexpired token, else None."""
    if not token:
        return None
    try:
        raw = base64.urlsafe_b64decode(token.encode("ascii")).decode("utf-8")
        workspace_id, expires_at, sig = raw.split(":", 2)
        payload = f"{workspace_id}:{expires_at}"
        expected = hmac.new(
            _secret().encode("utf-8"), payload.encode("utf-8"), hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        if int(expires_at) < int(time.time()):
            return None
        return workspace_id or None
    except Exception:
        return None


def get_workspace_from_header(headers) -> Optional[str]:
    """Resolve workspace_id from request headers.

    Accepts either X-Workspace-Id + X-API-Key, or an Authorization:
    Bearer <token>. Returns the workspace_id or None.
    """
    get = getattr(headers, "get", None)
    if get is None:
        return None
    workspace_id = headers.get("x-workspace-id")
    api_key = headers.get("x-api-key")
    if workspace_id and api_key and verify_workspace(api_key, workspace_id):
        return workspace_id
    authorization = headers.get("authorization")
    if authorization and authorization.lower().startswith("bearer "):
        return verify_token(authorization[7:].strip())
    return None
