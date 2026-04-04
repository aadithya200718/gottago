import hashlib
from typing import Literal
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from db.supabase import get_supabase
from services.policy_service import create_policy_for_worker
from ml.premium_calculator import calculate_premium

router = APIRouter()


class WorkerCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone: str = Field(pattern=r"^\d{10}$")
    platform: Literal["Swiggy", "Zomato", "Both"]
    city: Literal["Mumbai", "Delhi", "Bengaluru"]
    zone: str
    worker_id: str = Field(min_length=3, max_length=50)
    rating: float = Field(ge=1.0, le=5.0)
    avg_weekly_hours: int = Field(ge=10, le=80)
    baseline_weekly_earnings: int = Field(ge=1000, le=15000)


class WorkerResponse(BaseModel):
    id: str
    worker_id: str
    policy_number: str
    weekly_premium: int
    coverage_amount: int
    message: str


@router.post("/register", response_model=WorkerResponse, status_code=201)
async def register_worker(body: WorkerCreate):
    supabase = get_supabase()

    # Check duplicate worker_id
    existing = supabase.table("workers").select("id").eq("worker_id", body.worker_id).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="Worker ID already registered")

    # Hash phone before storage
    phone_hash = hashlib.sha256(body.phone.encode()).hexdigest()

    # Get zone risk scores from database
    zone_data = (
        supabase.table("disruption_zones")
        .select("flood_risk_score, aqi_risk_score")
        .eq("city", body.city)
        .eq("zone_name", body.zone)
        .execute()
    )
    if zone_data.data:
        flood_risk = float(zone_data.data[0]["flood_risk_score"])
        aqi_risk = float(zone_data.data[0]["aqi_risk_score"])
    else:
        flood_risk, aqi_risk = 0.5, 0.5  # defaults if zone not found

    # Calculate premium via XGBoost
    from datetime import date
    breakdown = calculate_premium(
        city=body.city,
        zone_flood_risk=flood_risk,
        zone_aqi_risk=aqi_risk,
        month=date.today().month,
        baseline_weekly_earnings=body.baseline_weekly_earnings,
        rating=body.rating,
        weekly_hours=body.avg_weekly_hours,
    )

    # Insert worker
    worker_data = {
        "name": body.name,
        "phone_hash": phone_hash,
        "platform": body.platform.lower(),
        "city": body.city,
        "zone": body.zone,
        "worker_id": body.worker_id,
        "rating": body.rating,
        "avg_weekly_hours": body.avg_weekly_hours,
        "baseline_weekly_earnings": body.baseline_weekly_earnings,
    }
    result = supabase.table("workers").insert(worker_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create worker")

    worker = result.data[0]
    weekly_premium = breakdown["weekly_premium"]
    coverage_amount = breakdown["coverage_amount"]

    # Auto-create policy
    policy = await create_policy_for_worker(
        worker_id=worker["id"],
        worker_city=body.city,
        weekly_premium=weekly_premium,
        coverage_amount=coverage_amount,
        supabase=supabase,
    )

    # Record premium history
    supabase.table("premium_history").insert({
        "worker_id": worker["id"],
        "policy_id": policy["id"],
        "calculated_premium": weekly_premium,
        "base_premium": 159,
        "multiplier": breakdown["multiplier"],
        "features_json": {
            "city": body.city,
            "zone": body.zone,
            "flood_risk": flood_risk,
            "aqi_risk": aqi_risk,
            "rating": body.rating,
            "hours": body.avg_weekly_hours,
            "earnings": body.baseline_weekly_earnings,
        },
    }).execute()

    return WorkerResponse(
        id=worker["id"],
        worker_id=body.worker_id,
        policy_number=policy["policy_number"],
        weekly_premium=weekly_premium,
        coverage_amount=coverage_amount,
        message="Registration successful. You're covered!",
    )


@router.get("/{worker_id}")
async def get_worker(worker_id: str):
    supabase = get_supabase()
    result = supabase.table("workers").select("*").eq("worker_id", worker_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Worker not found")
    worker = result.data[0]

    # Get active policy
    policy_result = (
        supabase.table("policies")
        .select("*")
        .eq("worker_id", worker["id"])
        .eq("status", "active")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    worker["active_policy"] = policy_result.data[0] if policy_result.data else None
    return worker
