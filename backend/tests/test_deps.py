"""Tests for dependency injection wiring in deps.py."""

from __future__ import annotations

from typing import TYPE_CHECKING
from unittest.mock import patch

from app import deps
from app.config import Settings, get_settings

if TYPE_CHECKING:
    import pytest


def test_get_repository_in_memory(monkeypatch: pytest.MonkeyPatch) -> None:
    """Verify that get_repository returns an InMemorySnapshotStore when firestore is disabled."""
    deps.get_repository.cache_clear()
    get_settings.cache_clear()

    mock_settings = Settings(use_firestore=False)
    monkeypatch.setattr("app.deps.get_settings", lambda: mock_settings)

    repo = deps.get_repository()
    from app.storage.memory_store import InMemorySnapshotStore

    assert isinstance(repo, InMemorySnapshotStore)

    deps.get_repository.cache_clear()
    get_settings.cache_clear()


def test_get_repository_firestore(monkeypatch: pytest.MonkeyPatch) -> None:
    """Verify that get_repository returns a FirestoreSnapshotStore when firestore is enabled."""
    deps.get_repository.cache_clear()
    get_settings.cache_clear()

    mock_settings = Settings(use_firestore=True, project_id="mock-project")
    monkeypatch.setattr("app.deps.get_settings", lambda: mock_settings)

    with patch("google.cloud.firestore.Client") as mock_client:
        repo = deps.get_repository()
        from app.storage.firestore_store import FirestoreSnapshotStore

        assert isinstance(repo, FirestoreSnapshotStore)
        mock_client.assert_called_once_with(project="mock-project")

    deps.get_repository.cache_clear()
    get_settings.cache_clear()
