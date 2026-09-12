"""
Yield & Harvest Estimation Service
==================================
Provides rule-based agronomic calculations for expected yield ranges,
growth progress %, harvest calendar windows, harvest ETA, and mandi-grounded
gross value and net profit projections.
"""

from datetime import date, datetime, timezone, timedelta
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.market import Market, MarketPrice
from app.schemas.yield_estimate import YieldEstimateResponse


# ==============================================================================
# Agronomic Benchmark Tables (22 Canonical Indian Crops)
# Source: Published agricultural data from ICAR & State Agricultural Departments
# Yields in Quintals/Acre (1 Quintal = 100 kg, 1 Hectare ≈ 2.471 Acres)
# ==============================================================================

CROP_YIELD_BENCHMARKS: Dict[str, Dict[str, Any]] = {
    # Cereals & Grains
    "rice": {
        "min_yield_per_acre": 18.0,
        "max_yield_per_acre": 26.0,
        "min_duration_days": 105,
        "max_duration_days": 135,
        "category": "cereals",
    },
    "maize": {
        "min_yield_per_acre": 16.0,
        "max_yield_per_acre": 24.0,
        "min_duration_days": 90,
        "max_duration_days": 110,
        "category": "cereals",
    },
    # Pulses & Legumes
    "chickpea": {
        "min_yield_per_acre": 5.0,
        "max_yield_per_acre": 9.0,
        "min_duration_days": 95,
        "max_duration_days": 115,
        "category": "pulses",
    },
    "kidneybeans": {
        "min_yield_per_acre": 4.0,
        "max_yield_per_acre": 7.5,
        "min_duration_days": 85,
        "max_duration_days": 105,
        "category": "pulses",
    },
    "pigeonpeas": {
        "min_yield_per_acre": 5.0,
        "max_yield_per_acre": 8.5,
        "min_duration_days": 140,
        "max_duration_days": 180,
        "category": "pulses",
    },
    "mothbeans": {
        "min_yield_per_acre": 3.0,
        "max_yield_per_acre": 5.5,
        "min_duration_days": 65,
        "max_duration_days": 80,
        "category": "pulses",
    },
    "mungbean": {
        "min_yield_per_acre": 3.5,
        "max_yield_per_acre": 6.0,
        "min_duration_days": 60,
        "max_duration_days": 75,
        "category": "pulses",
    },
    "blackgram": {
        "min_yield_per_acre": 3.5,
        "max_yield_per_acre": 6.5,
        "min_duration_days": 70,
        "max_duration_days": 85,
        "category": "pulses",
    },
    "lentil": {
        "min_yield_per_acre": 4.0,
        "max_yield_per_acre": 7.0,
        "min_duration_days": 110,
        "max_duration_days": 130,
        "category": "pulses",
    },
    # Fruits & Orchard Crops
    "pomegranate": {
        "min_yield_per_acre": 35.0,
        "max_yield_per_acre": 55.0,
        "min_duration_days": 150,
        "max_duration_days": 180,
        "category": "fruits",
    },
    "banana": {
        "min_yield_per_acre": 120.0,
        "max_yield_per_acre": 200.0,
        "min_duration_days": 300,
        "max_duration_days": 365,
        "category": "fruits",
    },
    "mango": {
        "min_yield_per_acre": 30.0,
        "max_yield_per_acre": 60.0,
        "min_duration_days": 120,
        "max_duration_days": 150,
        "category": "fruits",
    },
    "grapes": {
        "min_yield_per_acre": 60.0,
        "max_yield_per_acre": 100.0,
        "min_duration_days": 120,
        "max_duration_days": 140,
        "category": "fruits",
    },
    "watermelon": {
        "min_yield_per_acre": 80.0,
        "max_yield_per_acre": 140.0,
        "min_duration_days": 75,
        "max_duration_days": 95,
        "category": "fruits",
    },
    "muskmelon": {
        "min_yield_per_acre": 60.0,
        "max_yield_per_acre": 100.0,
        "min_duration_days": 70,
        "max_duration_days": 90,
        "category": "fruits",
    },
    "apple": {
        "min_yield_per_acre": 40.0,
        "max_yield_per_acre": 80.0,
        "min_duration_days": 130,
        "max_duration_days": 160,
        "category": "fruits",
    },
    "orange": {
        "min_yield_per_acre": 45.0,
        "max_yield_per_acre": 80.0,
        "min_duration_days": 180,
        "max_duration_days": 240,
        "category": "fruits",
    },
    "papaya": {
        "min_yield_per_acre": 100.0,
        "max_yield_per_acre": 180.0,
        "min_duration_days": 240,
        "max_duration_days": 300,
        "category": "fruits",
    },
    "coconut": {
        "min_yield_per_acre": 30.0,
        "max_yield_per_acre": 50.0,
        "min_duration_days": 330,
        "max_duration_days": 365,
        "category": "fruits",
    },
    # Cash Crops
    "cotton": {
        "min_yield_per_acre": 6.0,
        "max_yield_per_acre": 12.0,
        "min_duration_days": 150,
        "max_duration_days": 180,
        "category": "cash_crops",
    },
    "jute": {
        "min_yield_per_acre": 10.0,
        "max_yield_per_acre": 16.0,
        "min_duration_days": 110,
        "max_duration_days": 130,
        "category": "cash_crops",
    },
    "coffee": {
        "min_yield_per_acre": 4.0,
        "max_yield_per_acre": 8.0,
        "min_duration_days": 210,
        "max_duration_days": 270,
        "category": "cash_crops",
    },
}

# ==============================================================================
# Cultivation Cost Ratios by Crop Category
# Approximates total operational expenditure (seeds, fertilizer, irrigation,
# pest control, labor, harvesting) as a fraction of gross market revenue.
# Note: Rough agricultural economics approximation, not a farm-specific ledger.
# ==============================================================================

CROP_CATEGORY_COST_RATIOS: Dict[str, float] = {
    "cereals": 0.45,     # ~45% cost ratio -> net profit margin ~55%
    "pulses": 0.35,      # ~35% cost ratio -> net profit margin ~65% (low water/nitrogen needs)
    "fruits": 0.55,      # ~55% cost ratio -> net profit margin ~45% (high pruning/handling labor)
    "cash_crops": 0.50,  # ~50% cost ratio -> net profit margin ~50% (intensive pest & picking costs)
}

# ==============================================================================
# Descriptive Growth Stages by Category and Progress % Bands
# Generic stage descriptions (not a hardware-measured physiological diagnosis)
# ==============================================================================

GROWTH_STAGE_LABELS: Dict[str, Dict[str, str]] = {
    "cereals": {
        "0-25": "Germination & seedling establishment — normal emergence",
        "25-50": "Active tillering & vegetative growth — good canopy cover",
        "50-75": "Panicle initiation & flowering — critical grain formation phase",
        "75-100": "Grain filling & dough stage — ripening on schedule",
        "100+": "Full grain maturity — crop ready for harvest",
    },
    "pulses": {
        "0-25": "Seedling emergence & root nodulation initiation",
        "25-50": "Branching & vegetative development",
        "50-75": "Flowering & early pod formation — monitor for pod borer",
        "75-100": "Pod filling & seed hardening",
        "100+": "Physiological maturity reached — pods ready for harvest",
    },
    "fruits": {
        "0-25": "Early vegetative flush & shoot growth",
        "25-50": "Canopy expansion & flowering/blossom development",
        "50-75": "Fruit set & initial fruit enlargement",
        "75-100": "Fruit sizing, color development & sugar accumulation",
        "100+": "Fruit maturity reached — harvest window open",
    },
    "cash_crops": {
        "0-25": "Seedling emergence & root establishment",
        "25-50": "Vegetative growth & square/branch development",
        "50-75": "Flowering & boll/berry development",
        "75-100": "Boll opening / berry ripening / fiber maturation",
        "100+": "Harvest maturity reached — ready for picking",
    },
}


class YieldService:
    """Service providing benchmark calculations for crop yield and harvest timelines."""

    def calculate_harvest_eta(
        self,
        today: date,
        harvest_window_start: date,
        harvest_window_end: date
    ) -> str:
        """
        Buckets day-count distance to harvest window into human-friendly phrases.
        """
        days_until_start = (harvest_window_start - today).days
        days_until_end = (harvest_window_end - today).days

        if days_until_end < 0:
            return "Harvest window passed"
        if days_until_start <= 0 <= days_until_end:
            return "Ready for harvest (in harvest window)"
        if days_until_start <= 7:
            return "in under a week"
        if days_until_start <= 14:
            return "in 1–2 weeks"
        if days_until_start <= 30:
            return "in 2–4 weeks"
        if days_until_start <= 60:
            return "in 1–2 months"
        if days_until_start <= 90:
            return "in 2–3 months"
        if days_until_start <= 120:
            return "in 3–4 months"
        if days_until_start <= 180:
            return "in 4–6 months"
        return "in over 6 months"

    def get_health_factor(self, category: str, progress_percent: int) -> str:
        """Returns descriptive growth stage label for progress band."""
        stages = GROWTH_STAGE_LABELS.get(category, GROWTH_STAGE_LABELS["cereals"])
        if progress_percent >= 100:
            return stages["100+"]
        if progress_percent >= 75:
            return stages["75-100"]
        if progress_percent >= 50:
            return stages["50-75"]
        if progress_percent >= 25:
            return stages["25-50"]
        return stages["0-25"]

    def determine_tracking_status(
        self,
        today: date,
        harvest_window_start: date,
        harvest_window_end: date,
        days_elapsed: int,
        duration_max: int,
        progress_percent: int
    ) -> str:
        """
        Determines schedule tracking status based on calendar elapsed days vs benchmark window.
        """
        if progress_percent >= 100 or today >= harvest_window_end:
            return "Ready for harvest"
        if today >= harvest_window_start:
            return "In harvest window"
        if days_elapsed > duration_max:
            return "Behind schedule"
        return "On track"

    def calculate_estimate(
        self,
        crop: str,
        land_size_acres: float,
        sowing_date: date,
        field_name: Optional[str],
        state: Optional[str],
        db: Session,
        reference_date: Optional[date] = None
    ) -> YieldEstimateResponse:
        """
        Calculates expected yield, harvest window, ETA, and market-grounded value.
        """
        normalized_crop = crop.strip().lower()
        benchmarks = CROP_YIELD_BENCHMARKS[normalized_crop]
        category = benchmarks["category"]

        today = reference_date if reference_date else date.today()
        days_elapsed = max(0, (today - sowing_date).days)

        duration_min = benchmarks["min_duration_days"]
        duration_max = benchmarks["max_duration_days"]
        avg_duration = (duration_min + duration_max) / 2.0

        # Progress % capped at 100
        progress_percent = min(100, max(0, int(round((days_elapsed / avg_duration) * 100))))

        # Harvest Calendar Window
        harvest_window_start = sowing_date + timedelta(days=duration_min)
        harvest_window_end = sowing_date + timedelta(days=duration_max)

        # Harvest ETA String
        harvest_eta = self.calculate_harvest_eta(today, harvest_window_start, harvest_window_end)

        # Tracking status
        tracking_status = self.determine_tracking_status(
            today=today,
            harvest_window_start=harvest_window_start,
            harvest_window_end=harvest_window_end,
            days_elapsed=days_elapsed,
            duration_max=duration_max,
            progress_percent=progress_percent
        )

        # Health factor (Growth Stage description)
        health_factor = self.get_health_factor(category, progress_percent)

        # Expected yield range
        expected_yield_min = round(benchmarks["min_yield_per_acre"] * land_size_acres, 1)
        expected_yield_max = round(benchmarks["max_yield_per_acre"] * land_size_acres, 1)

        # Market Price lookup & Valuation Grounding
        price_query = (
            db.query(MarketPrice)
            .join(Market, MarketPrice.market_id == Market.id)
            .filter(func.lower(MarketPrice.crop) == normalized_crop)
        )

        if state and state.strip():
            normalized_state = state.strip().lower()
            price_query = price_query.filter(func.lower(Market.state) == normalized_state)

        prices = price_query.all()

        price_data_available = False
        estimated_value_min: Optional[float] = None
        estimated_value_max: Optional[float] = None
        projected_profit_per_acre: Optional[float] = None

        if prices:
            price_data_available = True
            modal_prices = [p.modal_price for p in prices if p.modal_price is not None]
            if modal_prices:
                avg_modal_price = sum(modal_prices) / len(modal_prices)
                estimated_value_min = round(expected_yield_min * avg_modal_price)
                estimated_value_max = round(expected_yield_max * avg_modal_price)

                # Compounded profit estimation per acre:
                # Average yield/acre × modal price × (1 - category cultivation cost ratio)
                avg_yield_per_acre = (benchmarks["min_yield_per_acre"] + benchmarks["max_yield_per_acre"]) / 2.0
                gross_revenue_per_acre = avg_yield_per_acre * avg_modal_price
                cost_ratio = CROP_CATEGORY_COST_RATIOS.get(category, 0.45)
                profit_ratio = max(0.0, 1.0 - cost_ratio)
                projected_profit_per_acre = round(gross_revenue_per_acre * profit_ratio)

        final_field_name = field_name.strip() if field_name and field_name.strip() else "My Field"
        now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        return YieldEstimateResponse(
            field_name=final_field_name,
            crop_name=normalized_crop,
            last_updated=now_utc,
            expected_yield_min=expected_yield_min,
            expected_yield_max=expected_yield_max,
            yield_unit="quintals",
            harvest_window_start=harvest_window_start.isoformat(),
            harvest_window_end=harvest_window_end.isoformat(),
            harvest_eta=harvest_eta,
            estimated_value_min=estimated_value_min,
            estimated_value_max=estimated_value_max,
            progress_percent=progress_percent,
            tracking_status=tracking_status,
            health_factor=health_factor,
            projected_profit_per_acre=projected_profit_per_acre,
            price_data_available=price_data_available,
            is_estimate=True
        )


yield_service = YieldService()
