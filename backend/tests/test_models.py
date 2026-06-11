"""Tests for Pydantic input models and boundaries in models.py."""

from __future__ import annotations

import pytest
from app.models import ConsumptionInput, HomeInput, TransportInput
from pydantic import ValidationError


def test_transport_input_validation() -> None:
    """Verify bounds constraints on vehicle and transit inputs."""
    # Valid instance
    t = TransportInput(
        car_km_per_week=100.0,
        public_transit_km_per_week=50.0,
        short_haul_flights_per_year=5,
        long_haul_flights_per_year=2,
    )
    assert t.car_km_per_week == 100.0

    # Test negative limit
    with pytest.raises(ValidationError):
        TransportInput(car_km_per_week=-5.0)

    # Test overflow limit (exceeding _MAX_KM_WEEK which is 20_000.0)
    with pytest.raises(ValidationError):
        TransportInput(car_km_per_week=25000.0)


def test_home_input_validation() -> None:
    """Verify bounds constraints on household utility inputs."""
    # Valid instance
    h = HomeInput(electricity_kwh_per_month=250.0, natural_gas_kwh_per_month=120.0, household_size=3)
    assert h.household_size == 3

    # Test zero/negative household size
    with pytest.raises(ValidationError):
        HomeInput(household_size=0)

    # Test overflow household size (max is 50)
    with pytest.raises(ValidationError):
        HomeInput(household_size=100)


def test_consumption_input_validation() -> None:
    """Verify bounds constraints on lifestyle spending/waste inputs."""
    # Valid instance
    c = ConsumptionInput(goods_spend_usd_per_month=500.0, waste_kg_per_week=12.0)
    assert c.goods_spend_usd_per_month == 500.0

    # Test negative spend
    with pytest.raises(ValidationError):
        ConsumptionInput(goods_spend_usd_per_month=-10.0)

    # Test negative waste
    with pytest.raises(ValidationError):
        ConsumptionInput(waste_kg_per_week=-1.0)
