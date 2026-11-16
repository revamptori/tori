"""
Tests for flap framework engine configuration.
Tests the actual flap Rust engine in the production configuration,
verifying that FLAP_ENGINE=rust never silently falls back and requires the Rust extension.
"""
import os
import pytest
import flap
from flap import Flap

def test_flap_engine_resolution_auto():
    """Verify default engine resolution."""
    engine = flap.get_engine("auto")
    expected = "rust" if flap.is_rust_available() else "python"
    assert engine == expected

def test_flap_engine_explicit_python(monkeypatch):
    """Verify FLAP_ENGINE=python selects python fallback."""
    monkeypatch.setenv("FLAP_ENGINE", "python")
    assert flap.get_engine() == "python"

def test_flap_engine_rust_requires_rust_extension(monkeypatch):
    """
    Test flap's strict engine contract:
    When FLAP_ENGINE=rust is enforced in production, flap must NOT silently
    fall back to Python. If the compiled Rust core (_flap) is missing, it
    must raise RuntimeError.
    """
    monkeypatch.setenv("FLAP_ENGINE", "rust")
    assert flap.get_engine() == "rust"

    # Simulate environment where Rust extension is not compiled
    orig_avail = flap._RUST_AVAILABLE
    try:
        flap._RUST_AVAILABLE = False
        test_app = Flap("test_rust")
        @test_app.get("/")
        def h(req): return "ok"

        with pytest.raises(RuntimeError, match="FLAP_ENGINE=rust selected but Rust extension not available"):
            test_app.run(host="127.0.0.1", port=0, engine="rust")
    finally:
        flap._RUST_AVAILABLE = orig_avail

def test_flap_engine_rust_execution_mocked_extension():
    """
    Test that when the Rust engine is available, app.run delegates to _flap.run.
    """
    test_app = Flap("test_rust_mock")
    @test_app.get("/ping")
    def ping(req): return "pong"

    # Mock the _flap extension with a fake run function
    called_args = []
    class MockRustExtension:
        @staticmethod
        def run(app_instance, host, port, workers):
            called_args.append((host, port, workers))

    orig_avail = flap._RUST_AVAILABLE
    orig_flap = getattr(flap, "_flap", None)
    try:
        flap._RUST_AVAILABLE = True
        flap._flap = MockRustExtension

        test_app.run(host="0.0.0.0", port=9999, workers=2, engine="rust")
        assert len(called_args) == 1
        assert called_args[0] == ("0.0.0.0", 9999, 2)
    finally:
        flap._RUST_AVAILABLE = orig_avail
        flap._flap = orig_flap

def test_flap_invalid_engine_name():
    """Verify that invalid engine values raise ValueError."""
    with pytest.raises(ValueError, match="Invalid FLAP_ENGINE"):
        flap.get_engine("invalid_engine_name")
