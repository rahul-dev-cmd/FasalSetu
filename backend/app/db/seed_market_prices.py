"""
FasalSetu Mandi & Market Prices Seeding Script
=============================================
SYNTHETIC DATA USED:
Live Agmarknet / data.gov.in API access requires API authentication credentials and dynamic session tokens.
This module populates a realistic, high-fidelity synthetic dataset modeled after Agmarknet reporting conventions:
- 20 major agricultural mandis across 5 Indian states (Punjab, Maharashtra, Madhya Pradesh, Uttar Pradesh, Karnataka).
- Covers all 22 canonical crop classes from Feature 1 (app.core.constants.VALID_CROPS).
- Realistic min, max, and modal commodity prices in Rs/quintal with mandi-level price spread variations (±10% to 25%).
- Historical / recent timestamps across consecutive recording dates.
"""

from datetime import date, timedelta
import logging
import random
from typing import List, Dict, Any

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, init_db
from app.models.market import Market, MarketPrice
from app.core.constants import VALID_CROPS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("fasalsetu_seed")

# 20 Prominent Indian Mandis across 5 key agricultural states
MANDI_DEFINITIONS: List[Dict[str, Any]] = [
    # Punjab (North / Grain belt)
    {"name": "Khanna Mandi", "state": "Punjab", "district": "Ludhiana", "latitude": 30.7046, "longitude": 76.2215},
    {"name": "Jalandhar APMC", "state": "Punjab", "district": "Jalandhar", "latitude": 31.3260, "longitude": 75.5762},
    {"name": "Amritsar Grain Market", "state": "Punjab", "district": "Amritsar", "latitude": 31.6340, "longitude": 74.8723},
    {"name": "Rajpura Mandi", "state": "Punjab", "district": "Patiala", "latitude": 30.4839, "longitude": 76.5939},

    # Maharashtra (West / Cash crops, pulses, fruits)
    {"name": "Vashi APMC", "state": "Maharashtra", "district": "Navi Mumbai", "latitude": 19.0760, "longitude": 72.9984},
    {"name": "Pune Gultekdi Mandi", "state": "Maharashtra", "district": "Pune", "latitude": 18.4975, "longitude": 73.8647},
    {"name": "Nashik Mandi", "state": "Maharashtra", "district": "Nashik", "latitude": 19.9975, "longitude": 73.7898},
    {"name": "Nagpur Cotton & Grain Market", "state": "Maharashtra", "district": "Nagpur", "latitude": 21.1458, "longitude": 79.0882},
    {"name": "Lasalgaon Mandi", "state": "Maharashtra", "district": "Nashik", "latitude": 20.1472, "longitude": 74.2274},

    # Madhya Pradesh (Central / Pulses, oilseeds, wheat)
    {"name": "Neemuch Mandi", "state": "Madhya Pradesh", "district": "Neemuch", "latitude": 24.4727, "longitude": 74.8698},
    {"name": "Indore Choithram APMC", "state": "Madhya Pradesh", "district": "Indore", "latitude": 22.6868, "longitude": 75.8452},
    {"name": "Ujjain Krishi Upaj Mandi", "state": "Madhya Pradesh", "district": "Ujjain", "latitude": 23.1765, "longitude": 75.7885},
    {"name": "Mandsaur APMC", "state": "Madhya Pradesh", "district": "Mandsaur", "latitude": 24.0725, "longitude": 75.0683},

    # Uttar Pradesh (North / Sugarcane, rice, pulses, fruits)
    {"name": "Azadpur APMC", "state": "Uttar Pradesh", "district": "Ghaziabad", "latitude": 28.6692, "longitude": 77.4538},
    {"name": "Agra Mandi", "state": "Uttar Pradesh", "district": "Agra", "latitude": 27.1767, "longitude": 78.0081},
    {"name": "Kanpur Grain Mandi", "state": "Uttar Pradesh", "district": "Kanpur Nagar", "latitude": 26.4499, "longitude": 80.3319},
    {"name": "Varanasi Mandi", "state": "Uttar Pradesh", "district": "Varanasi", "latitude": 25.3176, "longitude": 82.9739},

    # Karnataka (South / Cash crops, fruits, coffee)
    {"name": "Yeshwanthpur APMC", "state": "Karnataka", "district": "Bengaluru Urban", "latitude": 13.0280, "longitude": 77.5408},
    {"name": "Hubli Amargol APMC", "state": "Karnataka", "district": "Dharwad", "latitude": 15.3942, "longitude": 75.1235},
    {"name": "Mysuru Bandipalya Mandi", "state": "Karnataka", "district": "Mysuru", "latitude": 12.2797, "longitude": 76.6631},
]

# Baseline price index per crop in Rs/quintal (realistic 2026 Indian commodity benchmarks)
BASE_PRICES_RS_PER_QUINTAL: Dict[str, float] = {
    "rice": 3300.0,
    "maize": 2350.0,
    "chickpea": 5850.0,
    "kidneybeans": 9800.0,
    "pigeonpeas": 8100.0,
    "mothbeans": 6700.0,
    "mungbean": 8400.0,
    "blackgram": 7800.0,
    "lentil": 6800.0,
    "pomegranate": 9500.0,
    "banana": 2200.0,
    "mango": 6200.0,
    "grapes": 7500.0,
    "watermelon": 1400.0,
    "muskmelon": 2000.0,
    "apple": 10500.0,
    "orange": 4800.0,
    "papaya": 2400.0,
    "coconut": 3500.0,
    "cotton": 7400.0,
    "jute": 5400.0,
    "coffee": 21000.0,
}


def seed_market_prices(db: Session) -> bool:
    """
    Idempotent seeding function. Checks if market data already exists.
    If empty, populates markets and market prices for all 22 valid crops.
    """
    existing_count = db.query(Market).count()
    if existing_count > 0:
        logger.info(f"Market data already seeded ({existing_count} markets found). Skipping seed.")
        return False

    logger.info("Seeding markets and realistic commodity prices...")
    random.seed(42)  # Deterministic seeds for reproducible test verification
    today = date(2026, 9, 11)

    market_objects: List[Market] = []
    for mandi in MANDI_DEFINITIONS:
        m = Market(
            name=mandi["name"],
            state=mandi["state"],
            district=mandi["district"],
            latitude=mandi.get("latitude"),
            longitude=mandi.get("longitude")
        )
        market_objects.append(m)
        db.add(m)

    db.flush()  # Assign IDs to markets

    # Market price spread generation:
    # Each market gets a base price multiplier based on state/location factors (±15%)
    # And entries for recent dates (e.g. today and past 2 days)
    price_records = []
    for m in market_objects:
        # Market-specific geographic price variation factor (between 0.88 and 1.15)
        market_factor = random.uniform(0.88, 1.15)

        for crop in VALID_CROPS:
            base_price = BASE_PRICES_RS_PER_QUINTAL.get(crop, 3000.0) * market_factor

            # Generate 2 date entries per crop per market (today and yesterday)
            for days_ago in [0, 1]:
                rec_date = today - timedelta(days=days_ago)
                day_jitter = random.uniform(-0.03, 0.03)

                modal_val = round(base_price * (1.0 + day_jitter), 2)
                min_val = round(modal_val * random.uniform(0.90, 0.96), 2)
                max_val = round(modal_val * random.uniform(1.04, 1.12), 2)

                price_records.append(
                    MarketPrice(
                        market_id=m.id,
                        crop=crop,
                        min_price=min_val,
                        max_price=max_val,
                        modal_price=modal_val,
                        recorded_date=rec_date
                    )
                )

    db.bulk_save_objects(price_records)
    db.commit()

    logger.info(
        f"Seeding completed: {len(market_objects)} markets, {len(price_records)} price records inserted."
    )
    return True


if __name__ == "__main__":
    init_db()
    with SessionLocal() as session:
        seed_market_prices(session)
