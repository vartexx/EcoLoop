"""Liveness and status API endpoints."""

from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["status"])


@router.get("/status")
def status() -> dict[str, str]:
    """Liveness probe returning simple health status."""
    return {"status": "ok"}
