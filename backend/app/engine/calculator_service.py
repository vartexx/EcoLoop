"""The carbon footprint calculation engine.

Pure, deterministic, side-effect-free functions: the same input always yields the
same output, with no I/O. This makes the engine trivially unit-testable and lets
the API compute results without touching the database or any external service.

All quantities are normalised to **annual kg CO2e** before being summed.
"""

from __future__ import annotations

from app.engine import constants
from app.models import (
    AnalysisReport,
    Comparison,
    ConsumptionInput,
    FootprintProfile,
    HomeInput,
    TransportInput,
)

_WEEKS_PER_YEAR = 52
_MONTHS_PER_YEAR = 12


def _transport_annual_kg(t: TransportInput) -> float:
    """Compute annual transport emissions in kg CO2e."""
    car = t.car_km_per_week * _WEEKS_PER_YEAR * constants.CAR_FACTORS_PER_KM[t.car_fuel]
    transit = t.public_transit_km_per_week * _WEEKS_PER_YEAR * constants.PUBLIC_TRANSIT_PER_KM
    flights = (
        t.short_haul_flights_per_year * constants.SHORT_HAUL_TRIP_KM * constants.FLIGHT_SHORT_HAUL_PER_KM
        + t.long_haul_flights_per_year * constants.LONG_HAUL_TRIP_KM * constants.FLIGHT_LONG_HAUL_PER_KM
    )
    return car + transit + flights


def _home_annual_kg(h: HomeInput) -> float:
    """Compute annual home utility emissions in kg CO2e."""
    electricity = h.electricity_kwh_per_month * _MONTHS_PER_YEAR * constants.ELECTRICITY_PER_KWH
    gas = h.natural_gas_kwh_per_month * _MONTHS_PER_YEAR * constants.NATURAL_GAS_PER_KWH
    # Household energy is shared, so attribute a per-person share.
    return (electricity + gas) / h.household_size


def _consumption_annual_kg(c: ConsumptionInput) -> float:
    """Compute annual consumption and waste emissions in kg CO2e."""
    goods = c.goods_spend_usd_per_month * _MONTHS_PER_YEAR * constants.GOODS_PER_USD_MONTHLY
    waste = c.waste_kg_per_week * _WEEKS_PER_YEAR * constants.WASTE_PER_KG
    return goods + waste


def calculate_footprint(data: FootprintProfile) -> AnalysisReport:
    """Compute the annual carbon footprint breakdown for a set of inputs."""
    breakdown = {
        "transport": round(_transport_annual_kg(data.transport), 2),
        "home": round(_home_annual_kg(data.home), 2),
        "diet": round(constants.DIET_ANNUAL_KG[data.diet], 2),
        "consumption": round(_consumption_annual_kg(data.consumption), 2),
    }
    total = round(sum(breakdown.values()), 2)

    comparison = Comparison(
        global_average_annual_kg=constants.GLOBAL_AVG_ANNUAL_KG,
        sustainable_target_annual_kg=constants.SUSTAINABLE_TARGET_ANNUAL_KG,
        ratio_to_global_average=round(total / constants.GLOBAL_AVG_ANNUAL_KG, 3),
        ratio_to_sustainable_target=round(total / constants.SUSTAINABLE_TARGET_ANNUAL_KG, 3),
    )

    return AnalysisReport(
        breakdown_kg=breakdown,
        total_annual_kg=total,
        total_annual_tonnes=round(total / 1000, 3),
        comparison=comparison,
    )
