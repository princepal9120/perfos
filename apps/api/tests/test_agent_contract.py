from __future__ import annotations

from unittest.mock import patch

from app import cli


def test_capabilities_endpoint(client, auth_headers):
    response = client.get("/api/capabilities", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["workspace_id"] == "1"
    assert body["transports"]["mcp"]["http_path"] == "/mcp"
    assert any(item["id"] == "ads.loop" for item in body["capabilities"])
    assert all("token" not in str(item).lower() for item in body["capabilities"])


def test_cli_capabilities_uses_shared_api_surface(capsys):
    payload = {
        "capabilities": [
            {"id": "ads.search", "safety": "read", "cli": "perfos search", "mcp": "ads_search"}
        ]
    }
    with patch("app.cli._call", return_value=payload) as call:
        assert cli.main(["capabilities"]) == 0
    call.assert_called_once_with("/capabilities")
    assert "ads.search" in capsys.readouterr().out
