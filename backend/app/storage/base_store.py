"""Repository abstraction for tracking footprint snapshots.

A small interface (Protocol) decouples the API from the storage backend. The
Firestore implementation is used in production; an in-memory implementation backs
local development and tests. This is what makes the persistence layer testable
without a database and swappable without touching route code.
"""

from __future__ import annotations

from typing import Protocol

from app.models import AnalysisReport, FootprintProfile, TimelineSnapshot


class SnapshotStore(Protocol):
    """Stores and retrieves footprint snapshots scoped to an anonymous client device."""

    def add(
        self, device_id: str, data: FootprintProfile, result: AnalysisReport
    ) -> TimelineSnapshot:
        """Persist a new snapshot and return it (with ID and timestamp)."""
        ...

    def list_for_device(self, device_id: str, limit: int = 50) -> list[TimelineSnapshot]:
        """Return a device's historical snapshots, newest first."""
        ...
