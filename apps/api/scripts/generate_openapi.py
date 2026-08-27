"""Generate openapi.json from the FastAPI app and write it to api/ and web/."""
import json
import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent

sys.path.insert(0, str(REPO_ROOT / "apps/api/src"))

os.environ.setdefault("PERFOS_LIVE_DISCOVERY", "0")
os.environ.setdefault("MOCK_MODE", "1")
os.environ.setdefault("DATABASE_URL", "sqlite://")

from app.main import app

spec = app.openapi()

api_dir = REPO_ROOT / "apps/api"
web_dir = REPO_ROOT / "apps/web"

(api_dir / "openapi.json").write_text(json.dumps(spec, indent=2))
(web_dir / "openapi.json").write_text(json.dumps(spec, indent=2))

print(f"openapi.json written to:\n  {api_dir / 'openapi.json'}\n  {web_dir / 'openapi.json'}")
print(f"Spec has {len(spec.get('paths', {}))} paths, {len(spec.get('components', {}).get('schemas', {}))} schemas")