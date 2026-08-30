"""Real transport checks for registered MCP servers."""

import json
import shlex
import subprocess
from typing import Any

import httpx


def check_transport(
    transport: str,
    endpoint: str | None,
    config: dict[str, Any] | None = None,
) -> tuple[str, dict[str, Any]]:
    """Return ``(status, discovered metadata)`` without inventing health.

    HTTP/SSE servers are probed over their configured endpoint. stdio servers
    receive an MCP initialize request through their configured command. Missing
    configuration is explicitly ``unconfigured``.
    """
    config = config or {}
    if transport in {"http", "sse"}:
        if not endpoint:
            return "unconfigured", {}
        try:
            response = httpx.get(endpoint, timeout=10.0, follow_redirects=True)
            response.raise_for_status()
            body: Any = response.json() if response.content else {}
            if not isinstance(body, dict):
                body = {}
            capabilities = body.get("capabilities") or body.get("tools") or {}
            return "connected", {"capabilities": capabilities}
        except Exception as exc:
            return "error", {"error": str(exc)}

    command = config.get("command")
    if not command:
        return "unconfigured", {}
    args = shlex.split(command) if isinstance(command, str) else [str(part) for part in command]
    request = json.dumps(
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "perfos", "version": "0.1.0"}},
        }
    )
    try:
        result = subprocess.run(
            args,
            input=request + "\n",
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
        if result.returncode != 0:
            return "error", {"error": result.stderr.strip() or f"exit {result.returncode}"}
        for line in result.stdout.splitlines():
            try:
                response = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(response, dict):
                return "connected", {"capabilities": response.get("result", {}).get("capabilities", {})}
        return "error", {"error": "stdio server returned no initialize response"}
    except Exception as exc:
        return "error", {"error": str(exc)}
