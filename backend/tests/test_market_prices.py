"""
Tests for Feature 2: Market Price Comparison
===========================================
Validates GET /api/market-prices endpoint, query validation, sorting,
case-insensitive crop and state filtering, empty state responses, and error handling.
Runs strictly against an isolated in-memory SQLite database.
"""

import pytest


def test_valid_market_prices_query(client):
    """
    Test 1: Valid request (crop=rice) returns 200 with correctly structured JSON
    and markets sorted by modal_price descending.
    """
    response = client.get("/api/market-prices?crop=rice")
    assert response.status_code == 200
    data = response.json()

    assert data["crop"] == "rice"
    assert "markets" in data
    assert isinstance(data["markets"], list)
    assert len(data["markets"]) > 0

    # Verify best_price_market matches the first market's name
    assert "best_price_market" in data
    assert data["best_price_market"] == data["markets"][0]["market_name"]

    # Verify sorting: modal_price descending
    modal_prices = [m["modal_price"] for m in data["markets"]]
    assert modal_prices == sorted(modal_prices, reverse=True)

    # Verify market item structure
    for m in data["markets"]:
        assert isinstance(m["market_name"], str) and len(m["market_name"]) > 0
        assert isinstance(m["state"], str) and len(m["state"]) > 0
        assert isinstance(m["district"], str) and len(m["district"]) > 0
        assert isinstance(m["min_price"], (int, float))
        assert isinstance(m["max_price"], (int, float))
        assert isinstance(m["modal_price"], (int, float))
        assert m["min_price"] <= m["modal_price"] <= m["max_price"]
        assert isinstance(m["recorded_date"], str)
        # distance_km must be null since farmer coordinates are not provided
        assert m["distance_km"] is None


def test_missing_crop_parameter_returns_422(client):
    """
    Test 2: Request with a missing crop parameter returns 422.
    """
    response = client.get("/api/market-prices")
    assert response.status_code == 422
    data = response.json()
    error_str = str(data).lower()
    assert "crop" in error_str


def test_unrecognized_crop_returns_422(client):
    """
    Test 3: Request with an unrecognized crop value returns 422 naming the invalid crop.
    """
    response = client.get("/api/market-prices?crop=avocado")
    assert response.status_code == 422
    data = response.json()
    error_str = str(data).lower()
    assert "avocado" in error_str or "not recognized" in error_str


def test_non_matching_state_returns_empty_markets_200(client):
    """
    Test 4: Request for a crop/state combination with no matching data returns 200
    with an empty markets array and best_price_market: null.
    """
    response = client.get("/api/market-prices?crop=rice&state=NonExistentState")
    assert response.status_code == 200
    data = response.json()
    assert data["crop"] == "rice"
    assert data["markets"] == []
    assert data["best_price_market"] is None


def test_state_filter_case_insensitive(client):
    """
    Test 5: Explicitly verifies case-insensitive state filtering.
    Queries with 'maharashtra', 'MAHARASHTRA', and 'Maharashtra' must return
    the exact same matching markets from Maharashtra.
    """
    res_lower = client.get("/api/market-prices?crop=cotton&state=maharashtra")
    res_upper = client.get("/api/market-prices?crop=cotton&state=MAHARASHTRA")
    res_title = client.get("/api/market-prices?crop=cotton&state=Maharashtra")

    assert res_lower.status_code == 200
    assert res_upper.status_code == 200
    assert res_title.status_code == 200

    data_lower = res_lower.json()
    data_upper = res_upper.json()
    data_title = res_title.json()

    # All should return markets
    assert len(data_lower["markets"]) > 0
    # Results must match regardless of casing
    assert len(data_lower["markets"]) == len(data_upper["markets"]) == len(data_title["markets"])
    assert data_lower["best_price_market"] == data_upper["best_price_market"] == data_title["best_price_market"]

    # Verify all returned markets are indeed in Maharashtra
    for m in data_lower["markets"]:
        assert m["state"].lower() == "maharashtra"


def test_crop_query_case_insensitive(client):
    """
    Test 6: Verifies case-insensitive crop querying (e.g. 'RICE' or 'Rice' or '  rice  ').
    """
    res_caps = client.get("/api/market-prices?crop=RICE")
    assert res_caps.status_code == 200
    data = res_caps.json()
    assert data["crop"] == "rice"
    assert len(data["markets"]) > 0


def test_limit_query_parameter(client):
    """
    Test 7: Verifies limit parameter restricts the number of returned markets.
    """
    response = client.get("/api/market-prices?crop=rice&limit=3")
    assert response.status_code == 200
    data = response.json()
    assert len(data["markets"]) <= 3
