"""Tests for FirestoreSnapshotStore.

This file provides unit test coverage for the Firestore-backed storage module,
mocking the client calls to ensure offline testing capability and 100% code coverage.
"""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from app.models import AnalysisReport, FootprintProfile
from app.storage.firestore_store import FirestoreSnapshotStore


def test_firestore_snapshot_store() -> None:
    """Test standard actions (initialization, add, list) on FirestoreSnapshotStore."""
    with patch("google.cloud.firestore.Client") as mock_client_class:
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client

        # Initialize
        store = FirestoreSnapshotStore(project_id="mock-project")
        mock_client_class.assert_called_once_with(project="mock-project")

        # Mock collection/document/set sequence
        mock_doc = MagicMock()
        mock_client.collection.return_value.document.return_value.collection.return_value.document.return_value = (
            mock_doc
        )

        from app.engine.constants import CarFuel, DietType
        from app.models import Comparison, ConsumptionInput, HomeInput, TransportInput

        profile = FootprintProfile(
            transport=TransportInput(
                car_km_per_week=100.0,
                car_fuel=CarFuel.PETROL,
                public_transit_km_per_week=50.0,
                short_haul_flights_per_year=2,
                long_haul_flights_per_year=1,
            ),
            home=HomeInput(
                electricity_kwh_per_month=300.0,
                natural_gas_kwh_per_month=100.0,
                household_size=2,
            ),
            diet=DietType.VEGAN,
            consumption=ConsumptionInput(
                goods_spend_usd_per_month=150.0,
                waste_kg_per_week=10.0,
            ),
        )
        comparison = Comparison(
            global_average_annual_kg=4800.0,
            sustainable_target_annual_kg=2000.0,
            ratio_to_global_average=0.52,
            ratio_to_sustainable_target=1.25,
        )
        report = AnalysisReport(
            breakdown_kg={"diet": 1050.0, "transport": 1200.0, "home": 200.0, "consumption": 50.0},
            total_annual_kg=2500.0,
            total_annual_tonnes=2.5,
            comparison=comparison,
        )

        # 1. Test add
        snapshot = store.add("device_123", profile, report)
        mock_doc.set.assert_called_once()
        assert snapshot.device_id == "device_123"
        assert snapshot.input == profile
        assert snapshot.result == report

        # 2. Test list_for_device
        mock_snap = MagicMock()
        mock_snap.id = "snap_abc"
        mock_snap.to_dict.return_value = {
            "created_at": "2026-06-11T12:00:00Z",
            "input": profile.model_dump(mode="json"),
            "result": report.model_dump(mode="json"),
        }

        mock_client.collection.return_value.document.return_value.collection.return_value.order_by.return_value.limit.return_value.stream.return_value = [
            mock_snap
        ]

        results = store.list_for_device("device_123", limit=10)
        assert len(results) == 1
        assert results[0].id == "snap_abc"
        assert results[0].device_id == "device_123"
        assert results[0].input.diet == DietType.VEGAN
        assert results[0].result.total_annual_tonnes == 2.5
