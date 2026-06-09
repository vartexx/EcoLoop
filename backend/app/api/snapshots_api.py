"""Tracking endpoints: save a footprint snapshot and list a device's history."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Path, Query

from app.deps import get_repository
from app.models import TimelineSnapshot, TimelineSnapshotCreate
from app.storage.base_store import SnapshotStore

router = APIRouter(prefix="/api/history/snapshots", tags=["snapshots"])

_DEVICE_ID = Path(min_length=8, max_length=128, pattern=r"^[A-Za-z0-9_-]+$")


@router.post("", response_model=TimelineSnapshot, status_code=201)
def create_snapshot(
    payload: TimelineSnapshotCreate, repo: SnapshotStore = Depends(get_repository)
) -> TimelineSnapshot:
    """Persist a footprint snapshot for the (anonymous) client device."""
    return repo.add(payload.device_id, payload.input, payload.result)


@router.get("/{device_id}", response_model=list[TimelineSnapshot])
def list_snapshots(
    device_id: str = _DEVICE_ID,
    limit: int = Query(50, ge=1, le=200),
    repo: SnapshotStore = Depends(get_repository),
) -> list[TimelineSnapshot]:
    """Return a device's snapshot history, newest first."""
    return repo.list_for_device(device_id, limit=limit)
