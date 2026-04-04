"""
premium_calculator.py — XGBoost-backed premium calculation service.
Loaded once at startup via lru_cache, then reused for all requests.
Falls back to a rule-based calculation if the model file is not found.
"""
from __future__ import annotations
from functools import lru_cache
from pathlib import Path
import numpy as np

BASE_PREMIUM = 159  # Rs/week
MIN_PREMIUM = 80
AFFORDABILITY_RATIO = 0.03  # max 3% of weekly earnings

FEATURE_NAMES = [
    "city_mumbai", "city_delhi", "city_bengaluru",
    "month", "worker_weekly_baseline_inr",
    "zone_flood_risk_score", "zone_aqi_risk_score",
    "platform_rating", "avg_weekly_hours_logged",
]


@lru_cache(maxsize=1)
def _load_model():
    model_path = Path(__file__).parent / "models" / "premium_xgboost.json"
    if not model_path.exists():
        return None
    try:
        import xgboost as xgb
        model = xgb.XGBRegressor()
        model.load_model(str(model_path))
        return model
    except Exception:
        return None


def _rule_based_multiplier(
    city: str,
    zone_flood_risk: float,
    zone_aqi_risk: float,
    month: int,
    rating: float,
) -> float:
    """Fallback when XGBoost model is not available."""
    city_bonus = 0.15 if city == "Mumbai" else 0.1 if city == "Delhi" else 0.0
    monsoon = 0.2 if 6 <= month <= 9 else 0.15 if 4 <= month <= 6 else 0.0
    rating_disc = -((rating - 3.0) / 2.0) * 0.15
    return max(0.5, min(2.0,
        1.0 + zone_flood_risk * 0.6 + zone_aqi_risk * 0.4 + city_bonus + monsoon + rating_disc
    ))


def calculate_premium(
    city: str,
    zone_flood_risk: float,
    zone_aqi_risk: float,
    month: int,
    baseline_weekly_earnings: int,
    rating: float,
    weekly_hours: int,
) -> dict:
    """
    Calculate personalized weekly premium using XGBoost model.
    Returns full breakdown dict for UI rendering.
    """
    model = _load_model()

    if model is not None:
        features = np.array([[
            1 if city == "Mumbai" else 0,
            1 if city == "Delhi" else 0,
            1 if city == "Bengaluru" else 0,
            month,
            baseline_weekly_earnings,
            zone_flood_risk,
            zone_aqi_risk,
            rating,
            weekly_hours,
        ]], dtype=np.float32)
        multiplier = float(model.predict(features)[0])
    else:
        multiplier = _rule_based_multiplier(city, zone_flood_risk, zone_aqi_risk, month, rating)

    multiplier = max(0.5, min(2.0, multiplier))

    raw_premium = round(BASE_PREMIUM * multiplier)
    affordability_cap = round(baseline_weekly_earnings * AFFORDABILITY_RATIO)
    final_premium = max(MIN_PREMIUM, min(raw_premium, affordability_cap))

    coverage_amount = min(round(baseline_weekly_earnings * 4 * 0.55), 4800)

    # Per-factor contributions for the breakdown UI
    city_impact = round(
        (0.15 if city == "Mumbai" else 0.1 if city == "Delhi" else 0.0) * BASE_PREMIUM, 1
    )
    flood_impact = round(zone_flood_risk * 0.6 * BASE_PREMIUM, 1)
    aqi_impact = round(zone_aqi_risk * 0.4 * BASE_PREMIUM, 1)
    rating_discount = round(-((rating - 3.0) / 2.0 * 0.15) * BASE_PREMIUM, 1)
    season_impact = 0.0
    if 6 <= month <= 9:
        season_impact = round(0.2 * BASE_PREMIUM, 1)
    elif 4 <= month <= 6:
        season_impact = round(0.15 * BASE_PREMIUM, 1)

    return {
        "base_premium": BASE_PREMIUM,
        "multiplier": round(multiplier, 3),
        "flood_risk_impact": flood_impact,
        "aqi_risk_impact": aqi_impact,
        "city_impact": city_impact,
        "season_impact": season_impact,
        "rating_discount": rating_discount,
        "raw_premium": raw_premium,
        "affordability_cap": affordability_cap,
        "affordability_applied": raw_premium > affordability_cap,
        "weekly_premium": final_premium,
        "coverage_amount": coverage_amount,
        "model_used": "xgboost" if model is not None else "rule_based",
    }
