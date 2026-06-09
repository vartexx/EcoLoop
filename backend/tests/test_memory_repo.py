"""Tests for the in-memory snapshot store."""

from __future__ import annotations

from app.engine.calculator_service import calculate_footprint
from app.models import FootprintProfile
from app.storage.memory_store import InMemorySnapshotStore


def _make(repo, device_id):
    data = FootprintProfile()
    return repo.add(device_id, data, calculate_footprint(data))


def test_add_returns_entry_with_id_and_timestamp():
    repo = InMemorySnapshotStore()
    entry = _make(repo, "device-abc123")
    assert entry.id
    assert entry.created_at
    assert entry.device_id == "device-abc123"


def test_list_is_scoped_to_device():
    repo = InMemorySnapshotStore()
    _make(repo, "device-aaaa1111")
    _make(repo, "device-bbbb2222")
    assert len(repo.list_for_device("device-aaaa1111")) == 1
    assert len(repo.list_for_device("device-bbbb2222")) == 1
    assert repo.list_for_device("device-unknown99") == []


def test_list_respects_limit():
    repo = InMemorySnapshotStore()
    for _ in range(5):
        _make(repo, "device-cccc3333")
    assert len(repo.list_for_device("device-cccc3333", limit=3)) == 3
