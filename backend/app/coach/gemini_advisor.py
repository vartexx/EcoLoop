"""Personalized insights via Google Gemini on Vertex AI.

Design principle: **graceful degradation**. The public entry point,
``generate_insights``, attempts a Gemini call when enabled and *always* falls
back to the deterministic rule-based engine on any error (disabled flag, missing
credentials, network/quota failure, malformed response). The platform therefore
never fails to give the user advice, and every code path is testable without GCP
by toggling settings or patching ``_call_gemini``.

Authentication uses Application Default Credentials (the Cloud Run service
account in production) — there is no API key in the codebase.
"""

from __future__ import annotations

import json
import logging

from app.coach.rules_advisor import generate_rule_based_insights
from app.config import Settings
from app.models import ActionTip, AnalysisReport, CoachFeedback, FootprintProfile

logger = logging.getLogger(__name__)

_SYSTEM_INSTRUCTION = (
    "You are an encouraging green living mentor. Based on a user's yearly greenhouse "
    "gas footprint (in kg CO2e), write a brief summary and suggest 2 to 4 actionable, "
    "practical steps to decrease emissions in their highest sectors. Provide an "
    "estimated annual saving in kg CO2e for every step. Keep it constructive, helpful, and positive."
)

# Schema for Gemini structured (JSON) output.
_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "recommendations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "category": {"type": "string"},
                    "action": {"type": "string"},
                    "estimated_annual_savings_kg": {"type": "number"},
                },
                "required": ["category", "action", "estimated_annual_savings_kg"],
            },
        },
    },
    "required": ["summary", "recommendations"],
}


def _build_prompt(data: FootprintProfile, result: AnalysisReport) -> str:
    return (
        "Yearly carbon footprint profile (kg CO2e):\n"
        f"{json.dumps(result.breakdown_kg)}\n"
        f"Sum: {result.total_annual_kg} kg/yr ({result.total_annual_tonnes} tonnes/yr).\n"
        f"Sustainable standard: {result.comparison.sustainable_target_annual_kg} kg/yr.\n"
        f"Diet: {data.diet.value}. Vehicle fuel: {data.transport.car_fuel.value}.\n"
        "Provide specific coaching tips targeting the highest contributors."
    )


def _call_gemini(data: FootprintProfile, result: AnalysisReport, settings: Settings) -> CoachFeedback:
    """Invoke Gemini on Vertex AI and parse a structured response.

    Imported lazily so the SDK/credentials are only required when actually used —
    keeps unit tests and the rule-based path dependency-free.
    """
    from google import genai
    from google.genai import types

    client = genai.Client(
        vertexai=True, project=settings.project_id, location=settings.region
    )
    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=_build_prompt(data, result),
        config=types.GenerateContentConfig(
            system_instruction=_SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            response_schema=_RESPONSE_SCHEMA,
            temperature=0.4,
            max_output_tokens=4096,
        ),
    )
    payload = json.loads(response.text)
    recommendations = [
        ActionTip(
            category=str(r["category"]),
            action=str(r["action"]),
            estimated_annual_savings_kg=round(float(r["estimated_annual_savings_kg"]), 2),
        )
        for r in payload.get("recommendations", [])
    ]
    if not recommendations:
        raise ValueError("Gemini returned no recommendations")
    return CoachFeedback(
        summary=str(payload["summary"]),
        recommendations=recommendations[:4],
        source="gemini",
    )


def generate_insights(
    data: FootprintProfile, result: AnalysisReport, settings: Settings
) -> CoachFeedback:
    """Return personalized insights, preferring Gemini and falling back to rules."""
    if not settings.use_gemini:
        return generate_rule_based_insights(data, result)
    try:
        return _call_gemini(data, result, settings)
    except Exception as exc:  # noqa: BLE001 — any failure must degrade gracefully
        logger.warning("Gemini insight generation failed, using rule-based fallback: %s", exc)
        return generate_rule_based_insights(data, result)
