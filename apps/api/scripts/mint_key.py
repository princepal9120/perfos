"""Mint a workspace API key. Bootstrap only — the plaintext is printed once.

Usage:
    cd apps/api && .venv/bin/python scripts/mint_key.py [--workspace 1] [--scope publish] [--name default]
"""

import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

os.environ.setdefault("MOCK_MODE", "true")

from app.core.db import SessionLocal, init_db  # noqa: E402
from app.core.security import generate_api_key, hash_key  # noqa: E402
from app.models import Workspace, WorkspaceApiKey  # noqa: E402


def mint(workspace_id: int, scope: str, name: str) -> None:
    init_db()
    db = SessionLocal()
    try:
        if db.get(Workspace, workspace_id) is None:
            raise SystemExit(f"workspace {workspace_id} does not exist; run scripts/seed.py first")
        plain = generate_api_key()
        db.add(
            WorkspaceApiKey(
                workspace_id=workspace_id,
                name=name,
                key_hash=hash_key(plain),
                scope=scope,
                prefix=plain[:11],
            )
        )
        db.commit()
        print(f"workspace={workspace_id} scope={scope} name={name}")
        print(plain)
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--workspace", type=int, default=1)
    parser.add_argument("--scope", choices=("read", "draft", "publish"), default="publish")
    parser.add_argument("--name", default="default")
    args = parser.parse_args()
    mint(args.workspace, args.scope, args.name)
