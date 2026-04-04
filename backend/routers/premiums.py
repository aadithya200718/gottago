from datetime import date
from typing import Literal
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from db.supabase import get_supabase
from ml.premium_calculator import calculate_premium

router = APIRouter()


class PremiumRequest(BaseModel):
    city: Literal["Mumbai", "Delhi", "Bengaluru"]
    zone: str
    month: int = Field(ge=1, le=12)
    baseline_weekly_earnings: int = Field(ge=1000, le=15000)
    rating: float = Field(ge=1.0, le=5.0)
    avg_weekly_hours: int = Field(ge=10, le=80)


@router.post("/calculate")
async def calculate_premium_endpoint(body: PremiumRequest):
    supabase = get_supabase()

    # Lookup zone risk scores from DB
    zone_result = (
        supabase.table("disruption_zones")
        .select("flood_risk_score, aqi_risk_score")
        .eq("city", body.city)
        .eq("zone_name", body.zone)
        .execute()
    )
    if zone_result.data:
        flood_risk = float(zone_result.data[0]["flood_risk_score"])
        aqi_risk = float(zone_result.data[0]["aqi_risk_score"])
    else:
        flood_risk, aqi_risk = 0.5, 0.5

    return calculate_premium(
        city=body.city,
        zone_flood_risk=flood_risk,
        zone_aqi_risk=aqi_risk,
        month=body.month,
        baseline_weekly_earnings=body.baseline_weekly_earnings,
        rating=body.rating,
        weekly_hours=body.avg_weekly_hours,
    )


@router.get("/{worker_id}/breakdown")
async def get_premium_breakdown(worker_id: str):
    supabase = get_supabase()

    # Get latest premium history
    worker_result = supabase.table("workers").select("id").eq("worker_id", worker_id).execute()
    if not worker_result.data:
        raise HTTPException(status_code=404, detail="Worker not found")

    history_result = (
        supabase.table("premium_history")
        .select("*, features_json")
        .eq("worker_id", worker_result.data[0]["id"])
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not history_result.data:
        raise HTTPException(status_code=404, detail="No premium history found")

    record = history_result.data[0]
    features = record["features_json"]

    return calculate_premium(
        city=features.get("city", "Mumbai"),
        zone_flood_risk=features.get("flood_risk", 0.5),
        zone_aqi_risk=features.get("aqi_risk", 0.5),
        month=date.today().month,
        baseline_weekly_earnings=features.get("earnings", 6000),
        rating=features.get("rating", 4.0),
        weekly_hours=features.get("hours", 40),
    )
