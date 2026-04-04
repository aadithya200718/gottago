from datetime import date, timedelta
from fastapi import APIRouter, HTTPException

from db.supabase import get_supabase
from services.policy_service import generate_policy_number, create_policy_for_worker

router = APIRouter()


@router.get("/{worker_id}")
async def get_policy(worker_id: str):
    """Get full policy detail for a worker, including claims summary."""
    supabase = get_supabase()
    worker_result = (
        supabase.table("workers")
        .select("id, name, city, zone")
        .eq("worker_id", worker_id)
        .execute()
    )
    if not worker_result.data:
        raise HTTPException(status_code=404, detail="Worker not found")
    worker = worker_result.data[0]

    policy_result = (
        supabase.table("policies")
        .select("*")
        .eq("worker_id", worker["id"])
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not policy_result.data:
        raise HTTPException(status_code=404, detail="No policy found")

    policy = policy_result.data[0]

    # Claims summary
    claims_result = (
        supabase.table("claims")
        .select("id, payout_amount, status", count="exact")
        .eq("policy_id", policy["id"])
        .execute()
    )
    policy["claims_count"] = claims_result.count or 0
    policy["total_payout"] = sum(
        c["payout_amount"]
        for c in (claims_result.data or [])
        if c["status"] == "paid"
    )
    policy["worker_name"] = worker["name"]
    policy["worker_city"] = worker["city"]
    policy["worker_zone"] = worker["zone"]

    return policy


@router.post("/{policy_id}/renew")
async def renew_policy(policy_id: str):
    """Renew policy for another week."""
    supabase = get_supabase()
    today = date.today()
    result = (
        supabase.table("policies")
        .update({
            "end_date": (today + timedelta(days=7)).isoformat(),
            "status": "active",
        })
        .eq("id", policy_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"message": "Policy renewed for another week", "policy": result.data[0]}


@router.post("/{policy_id}/pause")
async def pause_policy(policy_id: str):
    supabase = get_supabase()
    result = (
        supabase.table("policies")
        .update({"status": "paused"})
        .eq("id", policy_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"message": "Policy paused", "policy": result.data[0]}


@router.post("/{policy_id}/resume")
async def resume_policy(policy_id: str):
    supabase = get_supabase()
    result = (
        supabase.table("policies")
        .update({"status": "active"})
        .eq("id", policy_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"message": "Policy resumed", "policy": result.data[0]}
