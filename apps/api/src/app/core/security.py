"""Workspace API-key verification, signed tokens, and reversible secret storage.

HMAC tokens and XOR-wrapped secrets keyed off Settings.SECRET_KEY.
DEFAULT_WORKSPACE_API_KEY is the demo master key (valid for any existing workspace).
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import time

TOKEN_TTL_SECONDS = 24 * 60 * 60


def _secret() -> str:
    from app.core.config import settings

    return settings.SECRET_KEY


def _demo_api_key() -> str:
    from app.core.config import settings

    return settings.DEFAULT_WORKSPACE_API_KEY


def hash_key(api_key: str) -> str:
    return hashlib.sha256(api_key.encode("utf-8")).hexdigest()


def encrypt_secret(plain: str) -> str:
    """Reversible wrap for provider keys. Prefix marks the scheme so legacy plaintext can still decrypt."""
    key = hashlib.sha256(_secret().encode("utf-8")).digest()
    data = plain.encode("utf-8")
    out = bytes(b ^ key[i % len(key)] for i, b in enumerate(data))
    return "xor:" + base64.urlsafe_b64encode(out).decode("ascii")


def decrypt_secret(token: str | None) -> str | None:
    if not token:
        return None
    if not token.startswith("xor:"):
        return token
    raw = base64.urlsafe_b64decode(token[4:].encode("ascii"))
    key = hashlib.sha256(_secret().encode("utf-8")).digest()
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(raw)).decode("utf-8")


def _workspace_exists(workspace_id: str) -> bool | None:
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
                text("SELECT key_hash FROM workspace_api_keys WHERE workspace_id = :wid"),
                {"wid": workspace_id},
            ).fetchall()
        finally:
            db.close()
    except Exception:
        return False
    target = hash_key(api_key)
    return any(hmac.compare_digest(str(row[0]), target) for row in rows)


def verify_workspace(api_key: str | None, workspace_id: str | None) -> bool:
    if not api_key or not workspace_id:
        return False
    env_key = _demo_api_key()
    from app.core.config import settings

    if (
        settings.MOCK_MODE
        and env_key
        and hmac.compare_digest(api_key, env_key)
        and _workspace_exists(workspace_id) is not False
    ):
        return True
    return bool(_db_key_matches(api_key, workspace_id))


def create_token(workspace_id: str | int) -> str:
    expires_at = int(time.time()) + TOKEN_TTL_SECONDS
    payload = f"{workspace_id}:{expires_at}"
    sig = hmac.new(_secret().encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    raw = f"{payload}:{sig}"
    return base64.urlsafe_b64encode(raw.encode("utf-8")).decode("ascii")


def verify_token(token: str | None) -> str | None:
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


def get_workspace_from_header(headers) -> str | None:
    get = getattr(headers, "get", None)
    if get is None:
        return None
    workspace_id = headers.get("x-workspace-id")
    api_key = headers.get("x-api-key")
    if workspace_id and api_key and verify_workspace(api_key, str(workspace_id)):
        return str(workspace_id)
    authorization = headers.get("authorization")
    if authorization and authorization.lower().startswith("bearer "):
        return verify_token(authorization[7:].strip())
    session = headers.get("perfos-session")
    if session:
        return verify_token(session)
    return None
