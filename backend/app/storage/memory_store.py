"""In-memory SnapshotStore for local development and tests.

Thread-safe enough for a single-process dev server; data is ephemeral and lost on
restart. Selected automatically when ``USE_FIRESTORE=false``.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.models import AnalysisReport, FootprintProfile, TimelineSnapshot


class InMemorySnapshotStore:
    """An ephemeral SnapshotStore that holds data in local memory."""

    def __init__(self) -> None:
        """Initialize the in-memory snapshot store."""
        self._by_device: dict[str, list[TimelineSnapshot]] = {}

    def add(
        self, device_id: str, data: FootprintProfile, result: AnalysisReport
    ) -> TimelineSnapshot:
        """Add a new footprint snapshot for a device to local memory."""
        entry = TimelineSnapshot(
            id=uuid.uuid4().hex,
            created_at=datetime.now(timezone.utc).isoformat(),
            device_id=device_id,
            input=data,
            result=result,
        )
        self._by_device.setdefault(device_id, []).append(entry)
        return entry

    def list_for_device(self, device_id: str, limit: int = 50) -> list[TimelineSnapshot]:
        """List historical footprint snapshots for a device from local memory."""
        entries = self._by_device.get(device_id, [])
        # Newest first.
        return sorted(entries, key=lambda e: e.created_at, reverse=True)[:limit]
