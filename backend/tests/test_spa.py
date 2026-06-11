"""Tests for SPA routing and mounting in main.py.

Verifies that:
1. The SPA fallback returns index.html for unknown UI paths.
2. File requests are served if they exist under the static directory.
3. Assets mounted under /assets are correctly served.
4. API endpoints return 404 JSON instead of HTML when not found.
"""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

from fastapi.testclient import TestClient

if TYPE_CHECKING:
    import pytest


def test_spa_routing(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Test standard client-side routing, static assets, and api/ wildcard paths."""
    static_dir = tmp_path / "static"
    static_dir.mkdir()

    # Create dummy index.html
    index_file = static_dir / "index.html"
    index_file.write_text("Hello index.html", encoding="utf-8")

    # Create assets subdirectory and asset file
    assets_dir = static_dir / "assets"
    assets_dir.mkdir()
    asset_file = assets_dir / "main.css"
    asset_file.write_text("body { color: green; }", encoding="utf-8")

    # Create static file in the root
    favicon = static_dir / "favicon.ico"
    favicon.write_text("fake-ico-bytes", encoding="utf-8")

    # Override the _STATIC_DIR path in app.main
    monkeypatch.setattr("app.main._STATIC_DIR", static_dir)

    # Re-import or call create_app to build application with mocked static path
    from app.main import create_app

    app = create_app()
    client = TestClient(app)

    # 1. Unknown path -> index.html fallback
    response = client.get("/wizard/result")
    assert response.status_code == 200
    assert response.text == "Hello index.html"

    # 2. File in root static directory -> served directly
    response = client.get("/favicon.ico")
    assert response.status_code == 200
    assert response.text == "fake-ico-bytes"

    # 3. Mounted assets directory -> served via StaticFiles
    response = client.get("/assets/main.css")
    assert response.status_code == 200
    assert response.text == "body { color: green; }"

    # 4. Unknown api path -> JSON 404, NOT index.html fallback
    response = client.get("/api/v1/invalid-route")
    assert response.status_code == 404
    assert response.json() == {"detail": "Not Found"}
