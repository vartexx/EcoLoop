"""Footprint evaluation and sustainability advisor endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.coach.gemini_advisor import generate_insights
from app.config import Settings, get_settings
from app.engine.calculator_service import calculate_footprint
from app.models import AnalysisReport, CoachFeedback, FootprintProfile

router = APIRouter(prefix="/api", tags=["footprint"])


@router.post("/footprint/evaluate", response_model=AnalysisReport)
def evaluate(payload: FootprintProfile) -> AnalysisReport:
    """Compute the annual carbon footprint report for the supplied inputs."""
    return calculate_footprint(payload)


@router.post("/coach/advise", response_model=CoachFeedback)
def advise(
    payload: FootprintProfile, settings: Settings = Depends(get_settings)
) -> CoachFeedback:
    """Return personalized green coaching feedback (Gemini, with rule-based fallback)."""
    result = calculate_footprint(payload)
    return generate_insights(payload, result, settings)
