"""
Water Irrigation Advisory Service
=================================
Calculates rule-based soil moisture estimates and irrigation urgency tiers (monitor, urgent, ok)
using real-time weather observations and short-term forecasts from Open-Meteo.
Deterministic Python agronomic logic — zero LLM tokens and zero sensor hardware dependencies.
"""

from datetime import datetime, timezone
import logging
from typing import Optional, Dict, Any, List, Tuple
import httpx

logger = logging.getLogger("fasalsetu_irrigation")

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
DEFAULT_SOIL_TYPE = "loamy"

# Canonical 22 crops categorized by water demand
HIGH_WATER_CROPS = {"rice", "banana", "jute"}
LOW_WATER_CROPS = {
    "chickpea", "lentil", "mothbeans", "mungbean",
    "blackgram", "pigeonpeas", "kidneybeans", "coconut"
}

# Soil categories and retention characteristics
SOIL_DRAINAGE_MAP = {
    "sandy": {"label": "sandy", "adjustment": -10.0, "tip": "Sandy soil drains rapidly; apply lighter, more frequent irrigation to prevent leaching."},
    "sand": {"label": "sandy", "adjustment": -10.0, "tip": "Sandy soil drains rapidly; apply lighter, more frequent irrigation to prevent leaching."},
    "clay": {"label": "clay", "adjustment": 8.0, "tip": "Clay soil retains water longer; ensure proper drainage to prevent root aeration stress."},
    "black": {"label": "black (clayey)", "adjustment": 8.0, "tip": "Black cotton soil holds moisture well; allow surface to dry slightly before re-irrigating."},
    "loamy": {"label": "loamy", "adjustment": 0.0, "tip": "Loamy soil provides balanced water retention; standard furrow or drip irrigation is suitable."},
    "alluvial": {"label": "alluvial", "adjustment": 0.0, "tip": "Alluvial soil has balanced moisture retention; standard irrigation intervals are recommended."},
    "silt": {"label": "silt", "adjustment": 2.0, "tip": "Silty soil retains moderate moisture; maintain good soil structure to avoid crusting."},
    "red": {"label": "red loam", "adjustment": -3.0, "tip": "Red soil has moderate permeability; irrigate at regular intervals without waterlogging."}
}


class WeatherServiceUnavailableException(Exception):
    """Raised when the Open-Meteo weather API request fails, times out, or returns invalid data."""
    pass


class IrrigationService:
    """Service for fetching weather data and generating rule-based irrigation advisories."""

    def __init__(self, timeout_seconds: float = 10.0):
        self.timeout = timeout_seconds

    def fetch_weather(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Fetches live weather and forecast data from Open-Meteo with an explicit 10-second timeout.
        Retrieves current temperature, humidity, precipitation, past 3 days rainfall, and next 2 days forecast.
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,precipitation",
            "daily": "precipitation_sum,temperature_2m_max,temperature_2m_min",
            "past_days": 3,
            "forecast_days": 3,
            "timezone": "auto"
        }

        try:
            logger.info("Calling Open-Meteo API for coordinates (lat=%s, lon=%s)", latitude, longitude)
            response = httpx.get(
                OPEN_METEO_FORECAST_URL,
                params=params,
                timeout=self.timeout
            )
            if response.status_code != 200:
                logger.error("Open-Meteo returned HTTP %s: %s", response.status_code, response.text)
                raise WeatherServiceUnavailableException(
                    f"Open-Meteo service responded with status {response.status_code}"
                )
            return response.json()
        except httpx.TimeoutException as exc:
            logger.error("Open-Meteo request timed out after %s seconds: %s", self.timeout, exc)
            raise WeatherServiceUnavailableException("Weather data request timed out") from exc
        except httpx.RequestError as exc:
            logger.error("Open-Meteo network request failed: %s", exc)
            raise WeatherServiceUnavailableException("Weather service unreachable") from exc
        except Exception as exc:
            logger.error("Unexpected error fetching Open-Meteo data: %s", exc, exc_info=True)
            raise WeatherServiceUnavailableException("Failed to retrieve weather data") from exc

    def calculate_advisory(
        self,
        weather_data: Dict[str, Any],
        crop: str,
        soil_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Computes rule-based soil moisture estimate and irrigation urgency tier from weather metrics,
        crop water demands, and soil retention characteristics.
        """
        clean_crop = crop.strip().lower()

        # Resolve soil type and modifiers
        clean_soil = (soil_type or "").strip().lower()
        if not clean_soil or clean_soil not in SOIL_DRAINAGE_MAP:
            resolved_soil = DEFAULT_SOIL_TYPE
            soil_display = f"{DEFAULT_SOIL_TYPE} (default assumption)"
            soil_info = SOIL_DRAINAGE_MAP[DEFAULT_SOIL_TYPE]
        else:
            resolved_soil = clean_soil
            soil_display = SOIL_DRAINAGE_MAP[clean_soil]["label"]
            soil_info = SOIL_DRAINAGE_MAP[clean_soil]

        current = weather_data.get("current", {})
        daily = weather_data.get("daily", {})

        current_temp = float(current.get("temperature_2m", 25.0))
        current_humidity = float(current.get("relative_humidity_2m", 60.0))
        current_precip = float(current.get("precipitation", 0.0))

        precip_series = daily.get("precipitation_sum", [])
        # past_days=3 means indices 0, 1, 2 are past days, index 3 is today, indices 4, 5 are next 2 days
        if len(precip_series) >= 4:
            recent_rainfall = sum(precip_series[:4])
        else:
            recent_rainfall = sum(precip_series)

        if len(precip_series) >= 6:
            forecast_rainfall = sum(precip_series[4:6])
        elif len(precip_series) > 4:
            forecast_rainfall = sum(precip_series[4:])
        else:
            forecast_rainfall = 0.0

        # Base estimated moisture percentage (0-100%) from recent cumulative rainfall
        if recent_rainfall >= 40.0:
            base_moisture = 85.0
        elif recent_rainfall >= 25.0:
            base_moisture = 72.0
        elif recent_rainfall >= 12.0:
            base_moisture = 58.0
        elif recent_rainfall >= 4.0:
            base_moisture = 42.0
        else:
            base_moisture = 24.0

        # Atmospheric evaporation adjustments (temperature & humidity)
        if current_temp > 35.0 and current_humidity < 40.0:
            base_moisture -= 14.0  # Intense evaporative loss
        elif current_temp > 32.0:
            base_moisture -= 8.0
        elif current_temp < 20.0:
            base_moisture += 5.0

        if current_humidity > 75.0:
            base_moisture += 6.0

        if current_precip > 0.0:
            base_moisture += 5.0

        # Soil type physical retention modifier
        base_moisture += soil_info["adjustment"]

        # Crop sensitivity modifier
        if clean_crop in HIGH_WATER_CROPS and base_moisture < 55.0:
            base_moisture -= 5.0  # High-demand crops deplete available water faster
        elif clean_crop in LOW_WATER_CROPS and base_moisture < 40.0:
            base_moisture += 5.0  # Drought-hardy crops tolerate lower moisture

        # Clamp moisture percentage between 5% and 95%
        moisture_percent = int(max(5, min(95, round(base_moisture))))

        # Determine categorical moisture level
        if moisture_percent >= 60:
            soil_moisture_level = "high"
        elif moisture_percent >= 35:
            soil_moisture_level = "medium"
        else:
            soil_moisture_level = "low"

        # Determine urgency tier (ok, urgent, monitor) & recommendation
        if moisture_percent >= 60 or forecast_rainfall >= 15.0:
            urgency = "ok"
            if forecast_rainfall >= 15.0:
                recommendation = f"Significant rainfall expected soon (~{forecast_rainfall:.1f} mm in next 48h). Postpone irrigation to avoid waterlogging."
            else:
                recommendation = "Adequate soil moisture detected. No immediate irrigation required."
        elif moisture_percent < 35 or (moisture_percent < 45 and clean_crop in HIGH_WATER_CROPS and forecast_rainfall < 3.0 and current_temp > 30.0):
            urgency = "urgent"
            recommendation = "Immediate irrigation recommended within 24–48 hours to prevent crop moisture stress."
        else:
            urgency = "monitor"
            recommendation = "Soil moisture is moderate. Monitor field conditions and plan to irrigate in 2–3 days if dry conditions continue."

        # Compile practical agronomic tips
        tips: List[str] = [
            "Irrigate during early morning or late evening hours to minimize evaporative water loss.",
            soil_info["tip"]
        ]

        if current_temp > 32.0:
            tips.append("High temperatures accelerate topsoil evaporation; consider mulching to conserve root-zone moisture.")
        elif forecast_rainfall > 5.0 and forecast_rainfall < 15.0:
            tips.append(f"Light precipitation (~{forecast_rainfall:.1f} mm) is forecast; check field moisture before running tube-wells.")

        if clean_crop in HIGH_WATER_CROPS:
            tips.append(f"{clean_crop.title()} requires steady moisture during vegetative stages; avoid letting topsoil dry completely.")

        weather_summary = {
            "temperature_c": current_temp,
            "humidity_percent": current_humidity,
            "recent_rainfall_mm": round(recent_rainfall, 2),
            "forecast_rainfall_mm": round(forecast_rainfall, 2),
            "current_precipitation_mm": current_precip
        }

        utc_now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        return {
            "soil_moisture_level": soil_moisture_level,
            "moisture_percent": moisture_percent,
            "recommendation": recommendation,
            "urgency": urgency,
            "tips": tips,
            "last_updated": utc_now_iso,
            "is_estimate": True,
            "data_source": "Open-Meteo (weather-based estimate, not a direct soil sensor reading)",
            "crop": clean_crop,
            "soil_type": soil_display,
            "weather_summary": weather_summary
        }


# Global singleton instance
irrigation_service = IrrigationService()
