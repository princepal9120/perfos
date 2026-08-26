"""FastAPI dependencies for workspace-scoped auth."""

from __future__ import annotations

from fastapi import Header, HTTPException, status

from app.core.security import get_workspace_from_header


def get_current_workspace(
    x_workspace_id: str | None = Header(default=None, alias="X-Workspace-Id"),
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    authorization: str | None = Header(default=None),
) -> int:
    """Return the authenticated workspace id or raise 401."""
    workspace_id = get_workspace_from_header(
        {
            "x-workspace-id": x_workspace_id,
            "x-api-key": x_api_key,
            "authorization": authorization,
        }
    )
    if not workspace_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid credentials. Send X-Workspace-Id "
            "and X-API-Key headers, or a Bearer token.",
        )
    if x_workspace_id and str(x_workspace_id) != str(workspace_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="X-Workspace-Id does not match credentials.",
        )
    if str(workspace_id).isdigit():
        return int(workspace_id)
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Workspace id must be an integer.",
    )
