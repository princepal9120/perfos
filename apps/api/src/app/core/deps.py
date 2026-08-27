"""FastAPI dependencies for workspace-scoped auth."""

from __future__ import annotations

from collections.abc import Callable

from fastapi import Cookie, Header, HTTPException, status

from app.core.security import resolve_credentials, scope_rank

_UNAUTHENTICATED = "Missing or invalid credentials. Send X-Workspace-Id and X-API-Key headers, or a Bearer token."


def _credentials(
    x_workspace_id: str | None,
    x_api_key: str | None,
    authorization: str | None,
    perfos_session: str | None,
) -> tuple[int, str]:
    resolved = resolve_credentials(
        {
            "x-workspace-id": x_workspace_id,
            "x-api-key": x_api_key,
            "authorization": authorization,
            "perfos-session": perfos_session,
        }
    )
    if not resolved:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=_UNAUTHENTICATED)
    workspace_id, scope = resolved
    if x_workspace_id and str(x_workspace_id) != str(workspace_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="X-Workspace-Id does not match credentials.",
        )
    if not str(workspace_id).isdigit():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Workspace id must be an integer.",
        )
    return int(workspace_id), scope


def get_current_workspace(
    x_workspace_id: str | None = Header(default=None, alias="X-Workspace-Id"),
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    authorization: str | None = Header(default=None),
    perfos_session: str | None = Cookie(default=None, alias="perfos_session"),
) -> int:
    """Return the authenticated workspace id or raise 401."""
    return _credentials(x_workspace_id, x_api_key, authorization, perfos_session)[0]


def get_current_scope(
    x_workspace_id: str | None = Header(default=None, alias="X-Workspace-Id"),
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    authorization: str | None = Header(default=None),
    perfos_session: str | None = Cookie(default=None, alias="perfos_session"),
) -> str:
    return _credentials(x_workspace_id, x_api_key, authorization, perfos_session)[1]


def require_scope(minimum: str) -> Callable[..., int]:
    """Dependency factory gating an endpoint behind a minimum access level."""

    def dependency(
        x_workspace_id: str | None = Header(default=None, alias="X-Workspace-Id"),
        x_api_key: str | None = Header(default=None, alias="X-API-Key"),
        authorization: str | None = Header(default=None),
        perfos_session: str | None = Cookie(default=None, alias="perfos_session"),
    ) -> int:
        workspace_id, scope = _credentials(
            x_workspace_id, x_api_key, authorization, perfos_session
        )
        if scope_rank(scope) < scope_rank(minimum):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This credential has '{scope}' access; '{minimum}' is required.",
            )
        return workspace_id

    return dependency
