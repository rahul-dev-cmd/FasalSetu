"""
Live Verification Script for Feature 15b: Government Command Center Risk Map & Hotspots
========================================================================================
1. Authenticate as a government user
2. Query /api/government/risk-map/filters
3. Query /api/government/risk-map/hotspots (with crop=Rice & risk_level=High & time_range=60d)
4. Query /api/government/risk-map/hotspots/1 (single detail view)
5. Query /api/government/risk-map/markers
6. Query /api/government/risk-map/district-zones
7. Verify 403 Forbidden for a farmer account
"""

import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

def run_verification():
    ts = int(time.time())
    gov_phone = f"98881{ts % 100000:05d}"
    farmer_phone = f"97771{ts % 100000:05d}"

    print(f"--- 1. Registering & Logging in Government User ({gov_phone}) ---")
    signup_resp = requests.post(f"{BASE_URL}/auth/signup", json={
        "phone": gov_phone,
        "password": "GovPassword123!",
        "role": "government",
        "name": "State Command Center Officer"
    })
    print("Gov Signup Status:", signup_resp.status_code)
    gov_token = signup_resp.json()["access_token"]
    gov_headers = {"Authorization": f"Bearer {gov_token}"}

    print("\n--- 2. Fetching Filters & Legend Configuration ---")
    filters_resp = requests.get(f"{BASE_URL}/government/risk-map/filters", headers=gov_headers)
    print("Filters Status:", filters_resp.status_code)
    print("Filters Response:", json.dumps(filters_resp.json(), indent=2)[:350], "...\n")

    print("--- 3. Fetching Hotspots Filtered by crop=Rice & risk_level=High & time_range=60d ---")
    hotspots_resp = requests.get(
        f"{BASE_URL}/government/risk-map/hotspots?crop=Rice&risk_level=High&time_range=60d",
        headers=gov_headers
    )
    print("Hotspots Status:", hotspots_resp.status_code)
    hotspots = hotspots_resp.json()
    print(f"Returned {len(hotspots)} filtered hotspots:")
    for h in hotspots:
        print(f"  Rank #{h['rank']}: {h['district']} | {h['crop']} | {h['issue_type']} | Trend: {h['trend_label']} | Area: {h['affected_area_label']} | Econ: Rs {h['economic_impact_cr']} Cr")
    print("Sample historical_trend (60d):", json.dumps(hotspots[0]["historical_trend"], indent=2))

    print("\n--- 4. Fetching Hotspot #1 Full Detail ---")
    detail_resp = requests.get(f"{BASE_URL}/government/risk-map/hotspots/1", headers=gov_headers)
    print("Detail Status:", detail_resp.status_code)
    detail = detail_resp.json()
    print(f"District: {detail['district']} (Rank #{detail['rank']})")
    print("Interventions List:", detail["interventions_list"])
    print("Trend 30d sample:", detail["historical_trend_30d"][:2])
    print("Trend 60d sample:", detail["historical_trend_60d"][:2])
    print("Trend 90d sample:", detail["historical_trend_90d"][:2])

    print("\n--- 5. Fetching Map Markers ---")
    markers_resp = requests.get(f"{BASE_URL}/government/risk-map/markers", headers=gov_headers)
    print("Markers Status:", markers_resp.status_code)
    markers = markers_resp.json()
    print(f"Markers Count: {len(markers)}")
    print("First Marker:", json.dumps(markers[0], indent=2))

    print("\n--- 6. Fetching District Zones ---")
    zones_resp = requests.get(f"{BASE_URL}/government/risk-map/district-zones", headers=gov_headers)
    print("Zones Status:", zones_resp.status_code)
    zones = zones_resp.json()
    print(f"Zones Count: {len(zones)}")
    print("First Zone:", json.dumps(zones[0], indent=2))

    print("\n--- 7. Verifying Role Security (Farmer Token 403) ---")
    f_signup = requests.post(f"{BASE_URL}/auth/signup", json={
        "phone": farmer_phone,
        "password": "FarmerPassword123!",
        "role": "farmer",
        "name": "Kisan Ram"
    })
    farmer_token = f_signup.json()["access_token"]
    f_headers = {"Authorization": f"Bearer {farmer_token}"}
    forbidden_resp = requests.get(f"{BASE_URL}/government/risk-map/hotspots", headers=f_headers)
    print("Farmer Access Status:", forbidden_resp.status_code, "(Expected 403)")
    assert forbidden_resp.status_code == 403

    print("\n=== ALL LIVE VERIFICATIONS PASSED ===")

if __name__ == "__main__":
    run_verification()
