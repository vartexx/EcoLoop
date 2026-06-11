"""Tests for the Gemini insights service and its graceful fallback."""

from __future__ import annotations

import app.coach.gemini_advisor as gemini
from app.config import Settings
from app.engine.calculator_service import calculate_footprint
from app.models import ActionTip, CoachFeedback, FootprintProfile


def _ctx():
    data = FootprintProfile()
    return data, calculate_footprint(data)


def test_disabled_gemini_uses_rules():
    data, result = _ctx()
    resp = gemini.generate_insights(data, result, Settings(use_gemini=False))
    assert resp.source == "rules"


def test_gemini_failure_falls_back_to_rules(monkeypatch):
    def boom(*_args, **_kwargs):
        raise RuntimeError("vertex unavailable")

    monkeypatch.setattr(gemini, "_call_gemini", boom)
    data, result = _ctx()
    resp = gemini.generate_insights(data, result, Settings(use_gemini=True))
    assert resp.source == "rules"
    assert resp.recommendations  # fallback still produces advice


def test_gemini_success_path(monkeypatch):
    canned = CoachFeedback(
        summary="Great progress!",
        recommendations=[
            ActionTip(category="diet", action="Eat more plants", estimated_annual_savings_kg=200.0)
        ],
        source="gemini",
    )
    monkeypatch.setattr(gemini, "_call_gemini", lambda *_a, **_k: canned)
    data, result = _ctx()
    resp = gemini.generate_insights(data, result, Settings(use_gemini=True))
    assert resp.source == "gemini"
    assert resp.summary == "Great progress!"


def test_call_gemini_success():
    from unittest.mock import MagicMock, patch

    from app.coach.gemini_advisor import _call_gemini

    data, result = _ctx()
    settings = Settings(use_gemini=True, project_id="mock-project", region="us-central1")

    with patch("google.genai.Client") as mock_client_cls:
        mock_client = MagicMock()
        mock_client_cls.return_value = mock_client

        mock_response = MagicMock()
        mock_response.text = '{"summary": "You are doing well!", "recommendations": [{"category": "diet", "action": "Eat vegan", "estimated_annual_savings_kg": 500.0}]}'
        mock_client.models.generate_content.return_value = mock_response

        resp = _call_gemini(data, result, settings)

        assert resp.source == "gemini"
        assert resp.summary == "You are doing well!"
        assert len(resp.recommendations) == 1
        assert resp.recommendations[0].category == "diet"
        assert resp.recommendations[0].estimated_annual_savings_kg == 500.0


def test_call_gemini_empty_recommendations():
    from unittest.mock import MagicMock, patch

    from app.coach.gemini_advisor import _call_gemini

    data, result = _ctx()
    settings = Settings(use_gemini=True, project_id="mock-project", region="us-central1")

    with patch("google.genai.Client") as mock_client_cls:
        mock_client = MagicMock()
        mock_client_cls.return_value = mock_client

        mock_response = MagicMock()
        mock_response.text = '{"summary": "No advice", "recommendations": []}'
        mock_client.models.generate_content.return_value = mock_response

        import pytest
        with pytest.raises(ValueError, match="Gemini returned no recommendations"):
            _call_gemini(data, result, settings)
