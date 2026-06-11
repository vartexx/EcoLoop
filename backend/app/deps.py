"""Dependency wiring (FastAPI dependency-injection providers).

Centralises construction of the repository so routes depend on the abstract
interface, not a concrete backend. The choice of Firestore vs in-memory is driven
by configuration, and the repository is built once and reused (cached).
"""

from __future__ import annotations

from functools import lru_cache

from app.config import Settings, get_settings
from app.storage.base_store import SnapshotStore


@lru_cache
def get_repository() -> SnapshotStore:
    """Get the configured snapshot repository."""
    settings: Settings = get_settings()
    if settings.use_firestore:
        from app.storage.firestore_store import FirestoreSnapshotStore

        return FirestoreSnapshotStore(project_id=settings.project_id)
    from app.storage.memory_store import InMemorySnapshotStore

    return InMemorySnapshotStore()
