"""Deterministic, rule-based insight engine.

This is the reliability backbone of the "Reduce" pillar: it runs entirely
offline with no external dependency, so the platform can always offer concrete,
personalized advice even when Gemini is unavailable or disabled. It is also fully
unit-testable because it is pure.

Strategy: rank the user's emission categories by size and emit targeted actions
for the biggest contributors, each with a quantified annual saving estimate.
"""

from __future__ import annotations

from app.engine import constants
from app.models import ActionTip, AnalysisReport, CoachFeedback, FootprintProfile

# Diet types ordered from highest to lowest annual footprint.
_DIET_LADDER = [
    constants.DietType.HEAVY_MEAT,
    constants.DietType.MEDIUM_MEAT,
    constants.DietType.LOW_MEAT,
    constants.DietType.PESCATARIAN,
    constants.DietType.VEGETARIAN,
    constants.DietType.VEGAN,
]


def _transport_recommendation(data: FootprintProfile, amount: float) -> ActionTip | None:
    t = data.transport
    flights_km = (
        t.short_haul_flights_per_year * constants.SHORT_HAUL_TRIP_KM
        + t.long_haul_flights_per_year * constants.LONG_HAUL_TRIP_KM
    )
    car_km_year = t.car_km_per_week * 52
    car_emissions = car_km_year * constants.CAR_FACTORS_PER_KM[t.car_fuel]
    flying = t.short_haul_flights_per_year + t.long_haul_flights_per_year > 0

    # Address whichever sub-source is larger: flying or driving.
    if flying and flights_km * constants.FLIGHT_LONG_HAUL_PER_KM > car_emissions:
        return ActionTip(
            category="transport",
            action="Reduce air travel by choosing rail lines where possible or using virtual meetings. Consolidating travel plans can cut aviation impact by 50%.",
            estimated_annual_savings_kg=round(0.5 * amount, 2),
        )
    if t.car_km_per_week > 0 and t.car_fuel != constants.CarFuel.ELECTRIC:
        # Estimate savings from switching the car to electric.
        current = car_km_year * constants.CAR_FACTORS_PER_KM[t.car_fuel]
        electric = car_km_year * constants.CAR_FACTORS_PER_KM[constants.CarFuel.ELECTRIC]
        saving = round(current - electric, 2)
        if saving > 0:
            return ActionTip(
                category="transport",
                action="Opt for walking, bicycling, or riding trains for local commutes, and evaluate migrating to a battery electric car for longer trips.",
                estimated_annual_savings_kg=saving,
            )
    if amount > 0:
        return ActionTip(
            category="transport",
            action="Share rides with colleagues or take mass transit for standard daily trips to decrease transit emissions.",
            estimated_annual_savings_kg=round(0.2 * amount, 2),
        )
    return None


def _home_recommendation(amount: float) -> ActionTip | None:
    if amount <= 0:
        return None
    return ActionTip(
        category="home",
        action="Select a green power tariff from your utility provider and audit window insulation or adjust thermostat bounds to save up to 33% of home energy load.",
        estimated_annual_savings_kg=round(0.33 * amount, 2),
    )


def _diet_recommendation(data: FootprintProfile) -> ActionTip | None:
    current = data.diet
    idx = _DIET_LADDER.index(current)
    if idx >= len(_DIET_LADDER) - 1:
        return None  # already vegan — nothing greener to suggest
    # Suggest stepping one rung down the ladder.
    target = _DIET_LADDER[idx + 1]
    saving = round(constants.DIET_ANNUAL_KG[current] - constants.DIET_ANNUAL_KG[target], 2)
    if saving <= 0:
        return None
    return ActionTip(
        category="diet",
        action=f"Transition to a {target.value.replace('_', ' ')} eating style — incorporating more vegetable-focused meals each week reduces agricultural emissions.",
        estimated_annual_savings_kg=saving,
    )


def _consumption_recommendation(amount: float) -> ActionTip | None:
    if amount <= 0:
        return None
    return ActionTip(
        category="consumption",
        action="Minimize new purchases, select long-lasting or recycled items, and direct organic matter away from trash dumps through composting.",
        estimated_annual_savings_kg=round(0.25 * amount, 2),
    )


def generate_rule_based_insights(
    data: FootprintProfile, result: AnalysisReport
) -> CoachFeedback:
    """Produce ranked, quantified recommendations from the footprint breakdown."""
    builders = {
        "transport": lambda amt: _transport_recommendation(data, amt),
        "home": _home_recommendation,
        "diet": lambda _amt: _diet_recommendation(data),
        "consumption": _consumption_recommendation,
    }

    # Rank categories by their share of emissions (largest first).
    ranked = sorted(result.breakdown_kg.items(), key=lambda kv: kv[1], reverse=True)

    recommendations: list[ActionTip] = []
    for category, amount in ranked:
        rec = builders[category](amount)
        if rec is not None:
            recommendations.append(rec)

    total = result.total_annual_kg
    target = constants.SUSTAINABLE_TARGET_ANNUAL_KG
    if total <= target:
        summary = (
            f"Your calculated footprint is {result.total_annual_tonnes} t CO2e/yr — which is at or below "
            f"the sustainable threshold of {target / 1000:.1f} t. Excellent job maintaining green habits!"
        )
    else:
        over = round((total - target) / 1000, 2)
        summary = (
            f"Your calculated footprint is {result.total_annual_tonnes} t CO2e/yr, which is about {over} t "
            f"over the sustainable threshold of {target / 1000:.1f} t. The suggestions below focus on your "
            "highest sources first for optimal carbon reduction."
        )

    return CoachFeedback(
        summary=summary,
        recommendations=recommendations[:4],
        source="rules",
    )
