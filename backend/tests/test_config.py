"""Tests for configuration settings in config.py."""

from __future__ import annotations

from app.config import Settings, get_settings


def test_settings_properties() -> None:
    """Test environment settings loading and parsing."""
    settings = Settings(
        project_id="test-settings-proj",
        region="europe-west1",
        use_gemini=False,
        use_firestore=False,
        allowed_origins="https://app.ecoloop.dev,  https://ecoloop.dev  ",
    )

    assert settings.project_id == "test-settings-proj"
    assert settings.region == "europe-west1"
    assert not settings.use_gemini
    assert not settings.use_firestore
    # Verify spacing is stripped
    assert settings.origins_list == ["https://app.ecoloop.dev", "https://ecoloop.dev"]


def test_settings_singleton() -> None:
    """Verify that get_settings uses cache to return the same singleton instance."""
    s1 = get_settings()
    s2 = get_settings()
    assert s1 is s2
