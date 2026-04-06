import hashlib
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db.supabase import get_supabase
from integrations.weather import fetch_current_weather, CITY_COORDS
from integrations.aqi import fetch_aqi
from ml.disruption_score import calculate_disruption_score
from routers.claims import auto_create_claim

router = APIRouter()

# Requirements-compliant thresholds
RAIN_MM_3H_THRESHOLD = 30        # >30mm cumulative rainfall in 3 hours
HEAT_FEELS_LIKE_THRESHOLD = 43   # feels_like >43C for 3+ consecutive hours
AQI_THRESHOLD = 400              # AQI >400 for 4+ consecutive hours
COMPOUND_SCORE_THRESHOLD = 7.0   # Combined score >7.0 for 2+ hours


def evaluate_triggers(weather: dict, aqi: float) -> list[dict]:
    """Evaluate all 5 parametric triggers against live data."""
    triggered = []
    current = weather.get("current", {})
    hourly = weather.get("hourly", [])

    # 3-hour cumulative rainfall from hourly data
    rain_3h = sum(
        h.get("rain", {}).get("1h", 0) for h in hourly[:3]
    )
    rain_1h = current.get("rain", {}).get("1h", 0)
    feels_like = current.get("feels_like", 25)
    temp = current.get("temp", 25)

    # Trigger 1: Heavy Rain (>30mm in 3 hours)
    if rain_3h >= RAIN_MM_3H_THRESHOLD:
        triggered.append({
            "trigger_type": "heavy_rainfall",
            "intensity_value": rain_3h,
            "source_api": "OpenWeatherMap",
            "payout_amount": 300,
        })

    # Trigger 2: Extreme Heat (feels_like >43C)
    if feels_like >= HEAT_FEELS_LIKE_THRESHOLD:
        triggered.append({
            "trigger_type": "extreme_heat",
            "intensity_value": feels_like,
            "source_api": "OpenWeatherMap",
            "payout_amount": 360,
        })

    # Trigger 3: Severe AQI (>400)
    if aqi >= AQI_THRESHOLD:
        triggered.append({
            "trigger_type": "severe_aqi",
            "intensity_value": aqi,
            "source_api": "WAQI",
            "payout_amount": 240,
        })

    # Trigger 5: Compound Disruption Score (>7.0)
    compound_score = calculate_disruption_score(
        rain_mm=rain_3h, temp_c=temp, aqi=aqi
    )
    if compound_score >= COMPOUND_SCORE_THRESHOLD:
        # Only add compound if no single trigger already pays more
        max_single_payout = max(
            (t["payout_amount"] for t in triggered), default=0
        )
        if max_single_payout <= 300:
            triggered.append({
                "trigger_type": "compound_disruption",
                "intensity_value": compound_score,
                "source_api": "ML Engine",
                "payout_amount": 300,
            })

    return triggered


@router.get("/check")
async def check_triggers():
    """Check all live triggers across all monitored cities."""
    results = {}

    for city in CITY_COORDS:
        try:
            weather = await fetch_current_weather(city)
            aqi = await fetch_aqi(city)
            triggers = evaluate_triggers(weather, aqi)
            current = weather.get("current", {})
            results[city] = {
                "triggers": triggers,
                "current_temp_c": current.get("temp"),
                "feels_like_c": current.get("feels_like"),
                "rain_1h_mm": current.get("rain", {}).get("1h", 0),
                "aqi": aqi,
            }
        except Exception as e:
            results[city] = {"error": str(e), "triggers": []}

    return results


class FireTriggerRequest(BaseModel):
    trigger_type: str
    city: str
    zone: Optional[str] = None
    intensity_value: float = 1.0
    source_api: str = "Manual/Admin"
    duration_hours: Optional[int] = None


# Payout amounts per trigger type
TRIGGER_PAYOUTS = {
    "heavy_rainfall": 300,
    "extreme_heat": 360,
    "severe_aqi": 240,
    "government_bandh": 480,
    "compound_disruption": 300,
}


@router.post("/fire")
async def fire_trigger(body: FireTriggerRequest):
    """Fire a trigger manually (admin or test).

    Creates trigger_event and auto-creates claims for all affected workers.
    Trigger 4 (Bandh) always uses this endpoint with admin-supplied data.
    """
    supabase = get_supabase()

    if body.trigger_type == "government_bandh" and not body.city:
        raise HTTPException(
            status_code=400, detail="City is required for government bandh triggers"
        )

    # Default duration: 8 hours for bandh, 3 hours for others
    duration = body.duration_hours or (
        8 if body.trigger_type == "government_bandh" else 3
    )

    # Deduplicate: hash of type + city + date
    event_hash = hashlib.sha256(
        f"{body.trigger_type}:{body.city}:{datetime.now(timezone.utc).date().isoformat()}".encode()
    ).hexdigest()[:16]

    existing = supabase.table("trigger_events").select("id").eq("event_hash", event_hash).execute()
    if existing.data:
        return {"message": "Trigger already fired today", "event_hash": event_hash}

    event_data = {
        "trigger_type": body.trigger_type,
        "city": body.city,
        "zone_id": None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "duration_hours": duration,
        "intensity_value": body.intensity_value,
        "source_api": body.source_api,
        "event_hash": event_hash,
    }
    event_result = supabase.table("trigger_events").insert(event_data).execute()
    trigger_event = event_result.data[0] if event_result.data else {}

    # Get all active workers in the city
    workers_result = (
        supabase.table("workers")
        .select("id, worker_id, city, zone")
        .eq("city", body.city)
        .execute()
    )
    workers = workers_result.data or []
    if body.zone:
        workers = [w for w in workers if w["zone"] == body.zone]

    # Auto-create claims for each worker
    payout_amount = TRIGGER_PAYOUTS.get(body.trigger_type, 300)
    claims_created = 0
    claims_skipped = 0
    for worker in workers:
        r = await auto_create_claim({
            "worker_id": worker["id"],
            "trigger_type": body.trigger_type,
            "trigger_event_id": trigger_event.get("id"),
            "trigger_timestamp": datetime.now(timezone.utc).isoformat(),
            "zone": worker.get("zone"),
        })
        if r.get("skipped"):
            claims_skipped += 1
        else:
            claims_created += 1

    return {
        "trigger_event": trigger_event,
        "workers_affected": len(workers),
        "claims_created": claims_created,
        "claims_skipped": claims_skipped,
        "event_hash": event_hash,
    }


@router.get("/bandh-events")
async def get_bandh_events():
    """Return all government bandh trigger events, most recent first."""
    supabase = get_supabase()
    result = (
        supabase.table("trigger_events")
        .select("*")
        .eq("trigger_type", "government_bandh")
        .order("timestamp", desc=True)
        .execute()
    )
    return result.data or []


@router.get("/history")
async def get_trigger_history(
    zone_id: Optional[str] = None, city: Optional[str] = None
):
    supabase = get_supabase()
    query = (
        supabase.table("trigger_events")
        .select("*")
        .order("timestamp", desc=True)
        .limit(50)
    )
    if city:
        query = query.eq("city", city)
    result = query.execute()
    return result.data or []
