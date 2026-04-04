import logging
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter

from db.supabase import get_supabase
from integrations.weather import fetch_7day_forecast, CITY_COORDS
from integrations.aqi import fetch_aqi
from services.learning_service import (
    run_full_learning_cycle,
    recalibrate_zone_risks,
    retrain_fraud_model,
    compute_adaptive_thresholds,
)

router = APIRouter()
logger = logging.getLogger(__name__)

# Historical AQI baselines for forecasting when API fails
AQI_BASELINES = {"Mumbai": 0.1, "Delhi": 0.3, "Bengaluru": 0.05}


@router.get("/claims-forecast")
async def get_claims_forecast():
    """7-day claims forecast using live weather forecast + historical patterns."""
    supabase = get_supabase()
    now = datetime.now(timezone.utc)
    seven_days_ago = (now - timedelta(days=7)).isoformat()

    # Historical claims for context
    claims_result = (
        supabase.table("claims")
        .select("created_at, payout_amount, status, trigger_type")
        .gte("created_at", seven_days_ago)
        .execute()
    )
    claims = claims_result.data or []

    by_day: dict[str, dict] = defaultdict(lambda: {"count": 0, "payout": 0, "approved": 0})
    for claim in claims:
        day = claim["created_at"][:10]
        by_day[day]["count"] += 1
        by_day[day]["payout"] += claim["payout_amount"]
        if claim["status"] in ("approved", "paid"):
            by_day[day]["approved"] += 1

    # Count active workers per city
    workers_result = supabase.table("workers").select("city").execute()
    workers_per_city: dict[str, int] = defaultdict(int)
    for w in (workers_result.data or []):
        workers_per_city[w["city"]] += 1

    # Weather-based forecast
    forecast_days = []
    for city in CITY_COORDS:
        try:
            daily = await fetch_7day_forecast(city)
            for day in daily:
                dt_str = datetime.fromtimestamp(day.get("dt", 0), tz=timezone.utc).strftime("%Y-%m-%d")
                rain = day.get("rain", 0)
                feels_like_day = day.get("feels_like", {}).get("day", 25) if isinstance(day.get("feels_like"), dict) else 25
                aqi_prob = AQI_BASELINES.get(city, 0.1)

                rain_prob = min(rain / 30.0, 1.0)
                heat_prob = max(0, min((feels_like_day - 35) / 8, 1.0))
                max_prob = max(rain_prob, heat_prob, aqi_prob)
                est_claims = int(workers_per_city.get(city, 5) * max_prob * 0.6)
                est_payout = est_claims * 320

                forecast_days.append({
                    "date": dt_str,
                    "city": city,
                    "rain_trigger_prob": round(rain_prob, 2),
                    "heat_trigger_prob": round(heat_prob, 2),
                    "aqi_trigger_prob": round(aqi_prob, 2),
                    "estimated_claims": est_claims,
                    "estimated_payout": est_payout,
                })
        except Exception as e:
            logger.warning("Weather forecast failed for %s: %s", city, e)

    # Aggregate forecast by date
    by_forecast_date: dict[str, dict] = defaultdict(
        lambda: {"rain_trigger_prob": 0, "heat_trigger_prob": 0, "aqi_trigger_prob": 0, "estimated_claims": 0, "estimated_payout": 0}
    )
    for fd in forecast_days:
        d = by_forecast_date[fd["date"]]
        d["rain_trigger_prob"] = max(d["rain_trigger_prob"], fd["rain_trigger_prob"])
        d["heat_trigger_prob"] = max(d["heat_trigger_prob"], fd["heat_trigger_prob"])
        d["aqi_trigger_prob"] = max(d["aqi_trigger_prob"], fd["aqi_trigger_prob"])
        d["estimated_claims"] += fd["estimated_claims"]
        d["estimated_payout"] += fd["estimated_payout"]

    forecast_list = [{"date": k, **v} for k, v in sorted(by_forecast_date.items())]

    return {
        "period_days": 7,
        "total_claims": len(claims),
        "total_payout": sum(c["payout_amount"] for c in claims if c["status"] in ("approved", "paid")),
        "by_trigger": _group_by_trigger(claims),
        "daily": [{**{"date": k}, **v} for k, v in sorted(by_day.items())],
        "forecast": forecast_list,
    }


@router.get("/fraud-heatmap")
async def get_fraud_heatmap():
    """Return fraud risk scores per zone for map visualization."""
    supabase = get_supabase()
    zones_result = supabase.table("disruption_zones").select("*").execute()
    zones = zones_result.data or []

    heatmap = []
    for zone in zones:
        heatmap.append({
            "zone_id": zone["id"],
            "zone_name": zone["zone_name"],
            "city": zone["city"],
            "lat": zone["lat"],
            "lon": zone["lon"],
            "flood_risk": zone["flood_risk_score"],
            "aqi_risk": zone["aqi_risk_score"],
            "combined_risk": round((zone["flood_risk_score"] + zone["aqi_risk_score"]) / 2, 2),
        })

    return heatmap


@router.get("/reserves")
async def get_reserve_status():
    """Reserve fund status with traffic-light recommendation."""
    supabase = get_supabase()

    policies_result = (
        supabase.table("policies")
        .select("weekly_premium", count="exact")
        .eq("status", "active")
        .execute()
    )
    active_count = policies_result.count or 0
    premium_pool = sum(p["weekly_premium"] for p in (policies_result.data or []))

    payouts_result = (
        supabase.table("claims")
        .select("payout_amount")
        .in_("status", ["approved", "pending"])
        .execute()
    )
    pending_payout = sum(c["payout_amount"] for c in (payouts_result.data or []))

    ratio = premium_pool / max(pending_payout, 1)
    if ratio >= 2.0:
        signal = "green"
        recommendation = f"Reserves healthy. Rs.{premium_pool:,} collected vs Rs.{pending_payout:,} pending."
    elif ratio >= 1.0:
        signal = "amber"
        recommendation = f"Reserves adequate but watch closely. Ratio: {ratio:.1f}x"
    else:
        signal = "red"
        recommendation = f"Pending payouts exceed reserves. Add Rs.{pending_payout - premium_pool:,} to maintain solvency."

    return {
        "active_policies": active_count,
        "weekly_premium_pool": premium_pool,
        "pending_payout_liability": pending_payout,
        "reserve_ratio": round(ratio, 2),
        "signal": signal,
        "recommendation": recommendation,
    }


def _group_by_trigger(claims: list[dict]) -> dict:
    groups: dict[str, dict] = defaultdict(lambda: {"count": 0, "total_payout": 0})
    for c in claims:
        t = c["trigger_type"]
        groups[t]["count"] += 1
        if c["status"] in ("approved", "paid"):
            groups[t]["total_payout"] += c["payout_amount"]
    return dict(groups)


@router.post("/learn")
async def trigger_learning_cycle():
    """Run the full self-learning cycle: recalibrate zones, retrain fraud
    model, and compute adaptive thresholds from operational data."""
    return await run_full_learning_cycle()


@router.post("/recalibrate-zones")
async def trigger_zone_recalibration():
    """Recalibrate zone risk scores using EMA on actual claim history."""
    return await recalibrate_zone_risks()


@router.post("/retrain-fraud-model")
async def trigger_fraud_retraining():
    """Retrain the Isolation Forest on real claim features."""
    return await retrain_fraud_model()


@router.get("/adaptive-thresholds")
async def get_adaptive_thresholds():
    """Get per-city recommended trigger thresholds learned from history."""
    return await compute_adaptive_thresholds()
