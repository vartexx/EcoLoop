"""Unit tests for the API rate limiter middleware."""

from __future__ import annotations


def test_rate_limiter_blocks_calculation(client):
    # The rate limit for evaluations is 10 per minute.
    # Send 10 evaluations successfully:
    for _ in range(10):
        resp = client.post(
            "/api/footprint/evaluate",
            json={
                "transport": {"car_km_per_week": 10},
                "diet": "vegan",
            },
        )
        assert resp.status_code == 200

    # The 11th request should be blocked (HTTP 429)
    blocked_resp = client.post(
        "/api/footprint/evaluate",
        json={
            "transport": {"car_km_per_week": 10},
            "diet": "vegan",
        },
    )
    assert blocked_resp.status_code == 429
    assert blocked_resp.json()["detail"] == "Too many requests. Please try again later."
    assert "Retry-After" in blocked_resp.headers


def test_rate_limiter_blocks_snapshots(client):
    calc = {
        "breakdown_kg": {"transport": 0.0, "home": 0.0, "diet": 900.0, "consumption": 0.0},
        "total_annual_kg": 900.0,
        "total_annual_tonnes": 0.9,
        "comparison": {
            "global_average_annual_kg": 4800.0,
            "sustainable_target_annual_kg": 2000.0,
            "ratio_to_global_average": 0.188,
            "ratio_to_sustainable_target": 0.45,
        }
    }
    device_id = "rate-limit-device-id"

    # Write rate limit is 5 requests per minute.
    # Save 5 snapshots successfully:
    for _ in range(5):
        resp = client.post(
            "/api/history/snapshots",
            json={
                "device_id": device_id,
                "input": {"diet": "vegan"},
                "result": calc,
            },
        )
        assert resp.status_code == 201

    # The 6th request should be blocked
    blocked_resp = client.post(
        "/api/history/snapshots",
        json={
            "device_id": device_id,
            "input": {"diet": "vegan"},
            "result": calc,
        },
    )
    assert blocked_resp.status_code == 429
    assert blocked_resp.json()["detail"] == "Too many requests. Please try again later."
