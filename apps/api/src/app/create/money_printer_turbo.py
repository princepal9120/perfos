"""PerfOS adapter for harry0703/MoneyPrinterTurbo (MIT).

Generates short-form ad clips by driving a local MoneyPrinterTurbo instance
(HTTP API on 127.0.0.1:8080, optionally spawned as a subprocess). Mock-safe:
when ``settings.MOCK_MODE`` is true nothing leaves the process and results are
deterministic per request. PerfOS always supplies ``video_script`` / terms from
the winner brief, so MPT never invokes its own LLM pipeline.
"""

from __future__ import annotations

import hashlib
import json
import os
import subprocess
import time
import urllib.error
import urllib.request
from typing import Literal

from pydantic import BaseModel, Field

from app.core.config import settings

DEFAULT_MPT_URL = "http://127.0.0.1:8080"


class ClipRequest(BaseModel):
    """A clip generation job derived from a winning ad's creative DNA."""

    subject: str = Field(min_length=1)
    script: str = ""
    terms: list[str] = Field(default_factory=list)
    aspect: Literal["portrait", "landscape"] = "portrait"
    voice_name: str | None = None


class ClipResult(BaseModel):
    task_id: str
    status: str  # queued | completed | failed
    videos: list[str] = Field(default_factory=list)


def build_task_payload(req: ClipRequest) -> dict:
    """Map a PerfOS brief to MPT's ``POST /v1/videos`` body (pure)."""
    payload: dict = {
        "video_subject": req.subject,
        "video_script": req.script,
        "video_aspect": req.aspect,
    }
    if req.terms:
        payload["video_terms"] = req.terms
    if req.voice_name:
        payload["voice_name"] = req.voice_name
    return payload


def _mpt_base_url() -> str:
    return os.environ.get("MONEY_PRINTER_TURBO_URL", DEFAULT_MPT_URL).rstrip("/")


def _http_json(url: str, body: dict | None = None, timeout: int = 30) -> dict:
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json"} if data else {}
    req = urllib.request.Request(url, data=data, headers=headers, method="POST" if data else "GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode())
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"MoneyPrinterTurbo unreachable at {url}: {exc}") from exc


def _mock_generate(req: ClipRequest) -> ClipResult:
    """Deterministic offline result keyed by the request content."""
    digest = hashlib.sha256(
        json.dumps(build_task_payload(req), sort_keys=True).encode()
    ).hexdigest()
    task_id = f"mock-mpt-{digest[:12]}"
    ext = ".mp4"
    return ClipResult(
        task_id=task_id,
        status="completed",
        videos=[f"storage/tasks/{task_id}/final-1{ext}"],
    )


def ensure_server(
    cmd: list[str] | None = None,
    cwd: str | None = None,
    wait_seconds: int = 30,
) -> bool:
    """Spawn a local MPT API server (subprocess mode) and wait until it pings.

    Returns True when reachable (spawned or already up), False otherwise.
    """
    ping = f"{_mpt_base_url()}/ping"

    def alive() -> bool:
        try:
            _http_json(ping, timeout=3)
            return True
        except RuntimeError:
            return False

    if alive():
        return True
    if not cmd:
        return False
    subprocess.Popen(  # noqa: S603 - operator-configured command
        cmd,
        cwd=cwd,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    deadline = time.monotonic() + wait_seconds
    while time.monotonic() < deadline:
        if alive():
            return True
        time.sleep(1.0)
    return False


def generate_clip(req: ClipRequest, wait: bool = False, timeout: int = 120) -> ClipResult:
    """Generate one short clip. Mock-safe by default (MOCK_MODE=True).

    With ``wait=False`` (live mode) this returns immediately after MPT accepts
    the task; call :func:`poll_task` for progress.
    """
    if settings.MOCK_MODE:
        return _mock_generate(req)

    base = _mpt_base_url()
    resp = _http_json(f"{base}/v1/videos", build_task_payload(req))
    task_id = (resp.get("data") or {}).get("task_id")
    if not task_id:
        raise RuntimeError(f"MPT did not return a task id: {resp}")
    if wait:
        return poll_task(task_id, timeout=timeout)
    return ClipResult(task_id=task_id, status="queued")


def poll_task(task_id: str, timeout: int = 120) -> ClipResult:
    """Fetch final state of an MPT task (live mode only)."""
    resp = _http_json(f"{_mpt_base_url()}/v1/tasks/{task_id}", timeout=timeout)
    data = resp.get("data") or {}
    state = int(data.get("state", -1))  # MPT states: 4=completed, -1=failed
    if state == 4:
        status = "completed"
    elif state == -1:
        status = "failed"
    else:
        status = "processing"
    videos = [v.get("url") or v.get("file_path", "") for v in data.get("videos", [])]
    return ClipResult(task_id=task_id, status=status, videos=[v for v in videos if v])
