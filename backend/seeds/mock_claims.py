"""Seed 60 mock claims (50 legit + 10 suspicious) for fraud model training.

Run: cd backend && python -m seeds.mock_claims
"""
import hashlib
import random
import uuid
from datetime import datetime, timedelta, timezone

from db.supabase import get_supabase

TRIGGER_TYPES = ["heavy_rainfall", "extreme_heat", "severe_aqi", "government_bandh", "compound_disruption"]
TRIGGER_PAYOUTS = {
    "heavy_rainfall": 300,
    "extreme_heat": 360,
    "severe_aqi": 240,
    "government_bandh": 480,
    "compound_disruption": 300,
}


def _generate_claim_number(trigger_type: str, index: int) -> str:
    h = hashlib.sha256(f"seed-{trigger_type}-{index}".encode()).hexdigest()[:12]
    return f"CL-2026-{trigger_type[:3].upper()}-{h.upper()}"


def seed_claims():
    supabase = get_supabase()
    now = datetime.now(timezone.utc)

    # Get all workers
    workers_result = supabase.table("workers").select("id, city, zone, rating, baseline_weekly_earnings").execute()
    workers = workers_result.data or []
    if not workers:
        print("No workers found. Run mock_workers.py first.")
        return

    # Get policies
    policies_result = supabase.table("policies").select("id, worker_id").eq("status", "active").execute()
    worker_policy_map = {p["worker_id"]: p["id"] for p in (policies_result.data or [])}

    claims_inserted = 0
    flags_inserted = 0

    # 50 legitimate claims
    for i in range(50):
        worker = random.choice(workers)
        policy_id = worker_policy_map.get(worker["id"])
        if not policy_id:
            continue

        trigger = random.choice(TRIGGER_TYPES)
        days_ago = random.randint(1, 30)
        ts = (now - timedelta(days=days_ago, hours=random.randint(0, 12))).isoformat()

        claim_data = {
            "claim_number": _generate_claim_number(trigger, i),
            "worker_id": worker["id"],
            "policy_id": policy_id,
            "trigger_type": trigger,
            "trigger_timestamp": ts,
            "payout_amount": TRIGGER_PAYOUTS[trigger],
            "status": "paid",
            "fraud_score": round(random.uniform(0.02, 0.25), 2),
            "transaction_id": f"SIM-{uuid.uuid4().hex[:12].upper()}",
            "paid_at": ts,
        }

        try:
            supabase.table("claims").insert(claim_data).execute()
            claims_inserted += 1
        except Exception as e:
            print(f"  Claim {i} failed: {e}")

    # 10 suspicious claims
    for i in range(10):
        worker = random.choice(workers)
        policy_id = worker_policy_map.get(worker["id"])
        if not policy_id:
            continue

        trigger = random.choice(TRIGGER_TYPES)
        days_ago = random.randint(1, 15)
        ts = (now - timedelta(days=days_ago)).isoformat()

        fraud_score = round(random.uniform(0.5, 0.9), 2)
        status = random.choice(["pending", "rejected"])

        claim_data = {
            "claim_number": _generate_claim_number(trigger, 50 + i),
            "worker_id": worker["id"],
            "policy_id": policy_id,
            "trigger_type": trigger,
            "trigger_timestamp": ts,
            "payout_amount": TRIGGER_PAYOUTS[trigger],
            "status": status,
            "fraud_score": fraud_score,
        }

        try:
            result = supabase.table("claims").insert(claim_data).execute()
            claims_inserted += 1
            claim_id = result.data[0]["id"] if result.data else None

            # Add fraud flags
            if claim_id:
                flag_types = random.sample(
                    ["gps_mismatch", "zone_correlation", "timing_anomaly", "duplicate_event"],
                    k=random.randint(1, 3),
                )
                for ft in flag_types:
                    try:
                        supabase.table("fraud_flags").insert({
                            "claim_id": claim_id,
                            "flag_type": ft,
                            "severity": random.choice(["medium", "high"]),
                            "details_json": {"source": "seed_script"},
                        }).execute()
                        flags_inserted += 1
                    except Exception:
                        pass
        except Exception as e:
            print(f"  Suspicious claim {i} failed: {e}")

    print(f"Done. {claims_inserted} claims inserted, {flags_inserted} fraud flags inserted.")


if __name__ == "__main__":
    seed_claims()
