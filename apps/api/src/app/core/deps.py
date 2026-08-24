"""FastAPI dependencies for workspace-scoped auth.

Reads X-Workspace-Id + X-API-Key headers (or an Authorization: Bearer
token) and exposes get_current_workspace for all /api routes.
"""

from __future__ import annotations

from typing import Optional

from fastapi import Header, HTTPException, status

from app.core.security import get_workspace_from_header


def get_current_workspace(
    x_workspace_id: Optional[str] = Header(
        default=None, alias="X-Workspace-Id"
    ),
    x_api_key: Optional[str] = Header(default=None, alias="X-API-Key"),
    authorization: Optional[str] = Header(default=None),
) -> str | int:
    """Return the authenticated workspace_id or raise 401."""
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
    if x_workspace_id and x_workspace_id != workspace_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="X-Workspace-Id does not match credentials.",
        )
    # Workspace IDs are integers in the DB; coerce so filtered ORM queries
    # match int columns (a str "1" never equals int 1 and returns []).
    if workspace_id is not None and workspace_id.isdigit():
        return int(workspace_id)
    return workspace_id
