import hashlib
from datetime import date, datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db.supabase import get_supabase
from services.fraud_service import run_fraud_checks

router = APIRouter()

# Trigger payout amounts (Rs.)
TRIGGER_PAYOUTS = {
    "heavy_rainfall": 300,
    "extreme_heat": 360,
    "severe_aqi": 240,
    "government_bandh": 480,
    "compound_disruption": 300,
}


@router.get("/{worker_id}")
async def get_claims(worker_id: str):
    supabase = get_supabase()
    worker_result = supabase.table("workers").select("id").eq("worker_id", worker_id).execute()
    if not worker_result.data:
        raise HTTPException(status_code=404, detail="Worker not found")

    claims_result = (
        supabase.table("claims")
        .select("*")
        .eq("worker_id", worker_result.data[0]["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return claims_result.data or []


@router.post("/auto-create")
async def auto_create_claim(body: dict):
    """Auto-create claim from trigger event.

    Runs fraud checks, enforces weekly caps, and creates the claim record.
    """
    supabase = get_supabase()
    worker_id = body.get("worker_id")
    trigger_type = body.get("trigger_type")

    if not all([worker_id, trigger_type]):
        raise HTTPException(status_code=400, detail="worker_id and trigger_type required")

    # Get worker
    worker_result = supabase.table("workers").select("*").eq("id", worker_id).execute()
    if not worker_result.data:
        raise HTTPException(status_code=404, detail="Worker not found")
    worker = worker_result.data[0]

    # Get active policy
    policy_result = (
        supabase.table("policies")
        .select("*")
        .eq("worker_id", worker_id)
        .eq("status", "active")
        .execute()
    )
    if not policy_result.data:
        return {"skipped": True, "reason": "No active policy"}

    policy = policy_result.data[0]
    payout_amount = TRIGGER_PAYOUTS.get(trigger_type, 300)

    # Cap check 1: max 2 payouts per week
    week_claims = (
        supabase.table("claims")
        .select("id, payout_amount, status")
        .eq("worker_id", worker_id)
        .eq("policy_id", policy["id"])
        .in_("status", ["approved", "paid"])
        .execute()
    )
    week_claims_data = week_claims.data or []
    if len(week_claims_data) >= 2:
        return {"skipped": True, "reason": "Weekly payout cap reached (max 2)"}

    # Cap check 2: 55% weekly ceiling
    weekly_ceiling = int(worker.get("baseline_weekly_earnings", 5000) * 0.55)
    week_paid = sum(
        c["payout_amount"] for c in week_claims_data
        if c["status"] in ("approved", "paid")
    )
    if week_paid + payout_amount > weekly_ceiling:
        return {
            "skipped": True,
            "reason": f"Weekly payout ceiling reached ({week_paid}/{weekly_ceiling})",
        }

    # Cap check 3: overlapping triggers (same type, same day)
    today_str = date.today().isoformat()
    today_same_type = (
        supabase.table("claims")
        .select("id")
        .eq("worker_id", worker_id)
        .eq("trigger_type", trigger_type)
        .gte("created_at", today_str)
        .execute()
    )
    if today_same_type.data:
        return {"skipped": True, "reason": f"Duplicate {trigger_type} trigger today"}

    # Duplicate prevention hash
    claim_hash = hashlib.sha256(
        f"{trigger_type}:{worker_id}:{policy['id']}:{today_str}".encode()
    ).hexdigest()[:12]
    claim_number = f"CL-{date.today().year}-{trigger_type[:3].upper()}-{claim_hash.upper()}"

    # Fraud checks (replaces random.uniform)
    fraud_result = await run_fraud_checks(
        claim_data={
            "trigger_type": trigger_type,
            "trigger_timestamp": body.get("trigger_timestamp"),
            "payout_amount": payout_amount,
            "trigger_zone": body.get("zone"),
        },
        worker=worker,
        policy=policy,
    )
    fraud_score = fraud_result["fraud_score"]
    recommendation = fraud_result["recommendation"]

    if recommendation == "approve":
        status = "approved"
    elif recommendation == "reject":
        status = "rejected"
    else:
        status = "pending"

    claim_data = {
        "claim_number": claim_number,
        "worker_id": worker_id,
        "policy_id": policy["id"],
        "trigger_type": trigger_type,
        "trigger_timestamp": body.get("trigger_timestamp", today_str),
        "payout_amount": payout_amount,
        "status": status,
        "fraud_score": fraud_score,
    }

    result = supabase.table("claims").insert(claim_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create claim")

    # Insert fraud flags
    for flag in fraud_result.get("flags", []):
        try:
            supabase.table("fraud_flags").insert({
                "claim_id": result.data[0]["id"],
                **flag,
            }).execute()
        except Exception:
            pass  # Non-critical; log in production

    return {
        "claim": result.data[0],
        "approved": status == "approved",
        "payout_amount": payout_amount,
        "fraud_score": fraud_score,
        "fraud_flags": fraud_result.get("flags", []),
    }


@router.get("/{claim_id}/detail")
async def get_claim_detail(claim_id: str):
    supabase = get_supabase()
    result = supabase.table("claims").select("*").eq("id", claim_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim = result.data[0]

    flags_result = supabase.table("fraud_flags").select("*").eq("claim_id", claim_id).execute()
    claim["fraud_flags"] = flags_result.data or []
    return claim


class FraudCheckRequest(BaseModel):
    pass


class ManualClaimRequest(BaseModel):
    worker_id: str
    trigger_type: str
    zone: str | None = None


@router.post("/manual")
async def create_manual_claim(body: ManualClaimRequest):
    """Create a manual claim for demo or support exception flows."""
    supabase = get_supabase()
    worker_result = (
        supabase.table("workers")
        .select("id, zone")
        .eq("worker_id", body.worker_id)
        .single()
        .execute()
    )
    if not worker_result.data:
        raise HTTPException(status_code=404, detail="Worker not found")

    worker = worker_result.data
    return await auto_create_claim({
        "worker_id": worker["id"],
        "trigger_type": body.trigger_type,
        "trigger_timestamp": datetime.now(timezone.utc).isoformat(),
        "zone": body.zone or worker.get("zone"),
    })


@router.post("/{claim_id}/fraud-check")
async def rerun_fraud_check(claim_id: str):
    """Re-run fraud checks on an existing claim."""
    supabase = get_supabase()
    claim_result = supabase.table("claims").select("*").eq("id", claim_id).single().execute()
    if not claim_result.data:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim = claim_result.data

    worker_result = supabase.table("workers").select("*").eq("id", claim["worker_id"]).single().execute()
    if not worker_result.data:
        raise HTTPException(status_code=404, detail="Worker not found")

    policy_result = supabase.table("policies").select("*").eq("id", claim["policy_id"]).single().execute()

    fraud_result = await run_fraud_checks(
        claim_data={
            "trigger_type": claim["trigger_type"],
            "trigger_timestamp": claim.get("trigger_timestamp"),
            "payout_amount": claim["payout_amount"],
            "trigger_zone": None,
        },
        worker=worker_result.data,
        policy=policy_result.data or {},
    )

    # Update claim with new fraud score
    supabase.table("claims").update({
        "fraud_score": fraud_result["fraud_score"],
    }).eq("id", claim_id).execute()

    return fraud_result


@router.post("/{claim_id}/payout")
async def process_claim_payout(claim_id: str):
    """Process payout for an approved claim."""
    supabase = get_supabase()
    claim_result = supabase.table("claims").select("*").eq("id", claim_id).single().execute()
    if not claim_result.data:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim = claim_result.data
    if claim["status"] not in ("approved", "pending", "payout_failed"):
        raise HTTPException(status_code=400, detail=f"Cannot pay claim with status: {claim['status']}")

    from services.payout_service import orchestrate_payout
    result = await orchestrate_payout(claim_id)
    return result
