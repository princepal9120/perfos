"""Workspace API-key verification, signed tokens, and reversible secret storage.

HMAC tokens and XOR-wrapped secrets keyed off Settings.SECRET_KEY.
DEFAULT_WORKSPACE_API_KEY is the demo master key (valid for any existing workspace).
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
import time

TOKEN_TTL_SECONDS = 24 * 60 * 60

KEY_PREFIX = "pk_"
SCOPES = ("read", "draft", "publish")


def scope_rank(scope: str) -> int:
    """Ascending privilege. Unknown scopes rank lowest so they can never escalate."""
    return SCOPES.index(scope) if scope in SCOPES else -1


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


def generate_api_key() -> str:
    """Return a fresh plaintext key. Only its hash is ever persisted."""
    return KEY_PREFIX + secrets.token_urlsafe(32)


def _db_key_scope(api_key: str, workspace_id: str) -> str | None:
    """Scope of the matching live key for this workspace, or None."""
    try:
        from sqlalchemy import text

        from app.core.db import SessionLocal
    except Exception:
        return None
    try:
        db = SessionLocal()
        try:
            rows = db.execute(
                text(
                    "SELECT key_hash, scope FROM workspace_api_keys "
                    "WHERE workspace_id = :wid AND revoked = 0"
                ),
                {"wid": workspace_id},
            ).fetchall()
        finally:
            db.close()
    except Exception:
        return None
    target = hash_key(api_key)
    for row in rows:
        if hmac.compare_digest(str(row[0]), target):
            return str(row[1])
    return None


def resolve_api_key(api_key: str | None, workspace_id: str | None) -> str | None:
    """Scope granted by this api key for this workspace, or None if it is not valid."""
    if not api_key or not workspace_id:
        return None
    env_key = _demo_api_key()
    from app.core.config import settings

    if (
        settings.MOCK_MODE
        and env_key
        and hmac.compare_digest(api_key, env_key)
        and _workspace_exists(workspace_id) is not False
    ):
        return "publish"
    return _db_key_scope(api_key, workspace_id)


def verify_workspace(api_key: str | None, workspace_id: str | None) -> bool:
    return resolve_api_key(api_key, workspace_id) is not None


def create_token(workspace_id: str | int, scope: str = "publish") -> str:
    expires_at = int(time.time()) + TOKEN_TTL_SECONDS
    payload = f"{workspace_id}:{scope}:{expires_at}"
    sig = hmac.new(_secret().encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    raw = f"{payload}:{sig}"
    return base64.urlsafe_b64encode(raw.encode("utf-8")).decode("ascii")


def verify_token_scoped(token: str | None) -> tuple[str, str] | None:
    if not token:
        return None
    try:
        raw = base64.urlsafe_b64decode(token.encode("ascii")).decode("utf-8")
        workspace_id, scope, expires_at, sig = raw.split(":", 3)
        payload = f"{workspace_id}:{scope}:{expires_at}"
        expected = hmac.new(
            _secret().encode("utf-8"), payload.encode("utf-8"), hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        if int(expires_at) < int(time.time()):
            return None
        if not workspace_id or scope_rank(scope) < 0:
            return None
        return workspace_id, scope
    except Exception:
        return None


def verify_token(token: str | None) -> str | None:
    result = verify_token_scoped(token)
    return result[0] if result else None


def resolve_credentials(headers) -> tuple[str, str] | None:
    """Return (workspace_id, scope) for the request, or None when unauthenticated."""
    if getattr(headers, "get", None) is None:
        return None
    workspace_id = headers.get("x-workspace-id")
    api_key = headers.get("x-api-key")
    if workspace_id and api_key:
        scope = resolve_api_key(api_key, str(workspace_id))
        if scope:
            return str(workspace_id), scope
    authorization = headers.get("authorization")
    if authorization and authorization.lower().startswith("bearer "):
        result = verify_token_scoped(authorization[7:].strip())
        if result:
            return result
    session = headers.get("perfos-session")
    if session:
        result = verify_token_scoped(session)
        if result:
            return result
    return None


def get_workspace_from_header(headers) -> str | None:
    result = resolve_credentials(headers)
    return result[0] if result else None
