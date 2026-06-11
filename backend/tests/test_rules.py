"""Tests for the deterministic rule-based insights engine."""

from __future__ import annotations

from app.coach.rules_advisor import generate_rule_based_insights
from app.engine import constants
from app.engine.calculator_service import calculate_footprint
from app.models import ConsumptionInput, FootprintProfile, HomeInput, TransportInput


def _insights_for(data: FootprintProfile):
    return generate_rule_based_insights(data, calculate_footprint(data))


def test_source_is_rules_and_has_summary():
    data = FootprintProfile()
    resp = _insights_for(data)
    assert resp.source == "rules"
    assert resp.summary
    assert len(resp.recommendations) >= 1


def test_recommendations_target_largest_category_first():
    # Heavy car use makes transport dominate; it should be addressed first.
    data = FootprintProfile(
        transport=TransportInput(car_km_per_week=500, car_fuel=constants.CarFuel.PETROL),
        diet=constants.DietType.VEGAN,
    )
    resp = _insights_for(data)
    assert resp.recommendations[0].category == "transport"


def test_high_meat_diet_yields_diet_recommendation():
    data = FootprintProfile(diet=constants.DietType.HEAVY_MEAT)
    resp = _insights_for(data)
    categories = {r.category for r in resp.recommendations}
    assert "diet" in categories


def test_savings_are_positive_and_finite():
    data = FootprintProfile(
        transport=TransportInput(car_km_per_week=300, short_haul_flights_per_year=4),
        diet=constants.DietType.HEAVY_MEAT,
    )
    resp = _insights_for(data)
    for rec in resp.recommendations:
        assert rec.estimated_annual_savings_kg > 0
        assert rec.action


def test_already_green_user_still_gets_constructive_summary():
    data = FootprintProfile(diet=constants.DietType.VEGAN)
    resp = _insights_for(data)
    # Even a low footprint should produce a non-empty, encouraging response.
    assert resp.summary
    assert isinstance(resp.recommendations, list)


def test_flying_dominates_transport():
    data = FootprintProfile(
        transport=TransportInput(
            car_km_per_week=1,
            car_fuel=constants.CarFuel.PETROL,
            short_haul_flights_per_year=10,
        )
    )
    resp = _insights_for(data)
    rec = next(r for r in resp.recommendations if r.category == "transport")
    assert "Reduce air travel" in rec.action


def test_transport_no_car_but_has_emissions():
    data = FootprintProfile(
        transport=TransportInput(
            car_km_per_week=0,
            public_transit_km_per_week=1000,
        )
    )
    resp = _insights_for(data)
    rec = next(r for r in resp.recommendations if r.category == "transport")
    assert "Share rides" in rec.action


def test_zero_amount_recommendations():
    from app.coach.rules_advisor import _consumption_recommendation, _home_recommendation
    assert _home_recommendation(0) is None
    assert _consumption_recommendation(0) is None


def test_diet_saving_non_positive():
    from unittest.mock import patch
    with patch.dict(constants.DIET_ANNUAL_KG, {constants.DietType.MEDIUM_MEAT: 4000.0}):
        data = FootprintProfile(diet=constants.DietType.HEAVY_MEAT)
        resp = _insights_for(data)
        assert not any(r.category == "diet" for r in resp.recommendations)


def test_positive_home_and_consumption_emissions():
    data = FootprintProfile(
        home=HomeInput(electricity_kwh_per_month=100),
        consumption=ConsumptionInput(goods_spend_usd_per_month=100),
    )
    resp = _insights_for(data)
    categories = {r.category for r in resp.recommendations}
    assert "home" in categories
    assert "consumption" in categories
