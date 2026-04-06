"""Seed 15 mock workers across 3 cities (5 per city).

Run: cd backend && python -m seeds.mock_workers
"""
import asyncio
import hashlib

from db.supabase import get_supabase
from services.policy_service import create_policy_for_worker

WORKERS = [
    # Mumbai
    {"name": "Rahul Sharma", "phone_raw": "9876543210", "platform": "Swiggy", "city": "Mumbai", "zone": "Dharavi", "worker_id": "SWG-MUM-001", "rating": 4.2, "avg_weekly_hours": 45, "baseline_weekly_earnings": 6000},
    {"name": "Priya Patel", "phone_raw": "9876543211", "platform": "Zomato", "city": "Mumbai", "zone": "Andheri West", "worker_id": "ZMT-MUM-002", "rating": 4.5, "avg_weekly_hours": 50, "baseline_weekly_earnings": 7500},
    {"name": "Deepak Gupta", "phone_raw": "9876543212", "platform": "Swiggy", "city": "Mumbai", "zone": "Bandra", "worker_id": "SWG-MUM-003", "rating": 3.8, "avg_weekly_hours": 35, "baseline_weekly_earnings": 4500},
    {"name": "Anita Deshmukh", "phone_raw": "9876543213", "platform": "Zomato", "city": "Mumbai", "zone": "Kurla", "worker_id": "ZMT-MUM-004", "rating": 4.7, "avg_weekly_hours": 55, "baseline_weekly_earnings": 8000},
    {"name": "Suresh Patil", "phone_raw": "9876543214", "platform": "Swiggy", "city": "Mumbai", "zone": "Worli", "worker_id": "SWG-MUM-005", "rating": 3.5, "avg_weekly_hours": 30, "baseline_weekly_earnings": 3500},

    # Delhi
    {"name": "Amit Kumar", "phone_raw": "9876543220", "platform": "Swiggy", "city": "Delhi", "zone": "Connaught Place", "worker_id": "SWG-DEL-001", "rating": 4.3, "avg_weekly_hours": 48, "baseline_weekly_earnings": 7000},
    {"name": "Neha Singh", "phone_raw": "9876543221", "platform": "Zomato", "city": "Delhi", "zone": "Dwarka", "worker_id": "ZMT-DEL-002", "rating": 4.1, "avg_weekly_hours": 42, "baseline_weekly_earnings": 5500},
    {"name": "Vikram Yadav", "phone_raw": "9876543222", "platform": "Swiggy", "city": "Delhi", "zone": "Rohini", "worker_id": "SWG-DEL-003", "rating": 3.9, "avg_weekly_hours": 38, "baseline_weekly_earnings": 4800},
    {"name": "Sunita Verma", "phone_raw": "9876543223", "platform": "Zomato", "city": "Delhi", "zone": "Karol Bagh", "worker_id": "ZMT-DEL-004", "rating": 4.8, "avg_weekly_hours": 60, "baseline_weekly_earnings": 10000},
    {"name": "Rajesh Mehra", "phone_raw": "9876543224", "platform": "Swiggy", "city": "Delhi", "zone": "Lajpat Nagar", "worker_id": "SWG-DEL-005", "rating": 4.0, "avg_weekly_hours": 40, "baseline_weekly_earnings": 5000},

    # Bengaluru
    {"name": "Karthik Reddy", "phone_raw": "9876543230", "platform": "Swiggy", "city": "Bengaluru", "zone": "Koramangala", "worker_id": "SWG-BLR-001", "rating": 4.6, "avg_weekly_hours": 52, "baseline_weekly_earnings": 8500},
    {"name": "Lakshmi Nair", "phone_raw": "9876543231", "platform": "Zomato", "city": "Bengaluru", "zone": "Whitefield", "worker_id": "ZMT-BLR-002", "rating": 4.4, "avg_weekly_hours": 46, "baseline_weekly_earnings": 6500},
    {"name": "Arjun Hegde", "phone_raw": "9876543232", "platform": "Swiggy", "city": "Bengaluru", "zone": "Indiranagar", "worker_id": "SWG-BLR-003", "rating": 3.6, "avg_weekly_hours": 28, "baseline_weekly_earnings": 3200},
    {"name": "Meena Iyer", "phone_raw": "9876543233", "platform": "Zomato", "city": "Bengaluru", "zone": "HSR Layout", "worker_id": "ZMT-BLR-004", "rating": 4.9, "avg_weekly_hours": 65, "baseline_weekly_earnings": 12000},
    {"name": "Prakash Gowda", "phone_raw": "9876543234", "platform": "Swiggy", "city": "Bengaluru", "zone": "Jayanagar", "worker_id": "SWG-BLR-005", "rating": 3.4, "avg_weekly_hours": 25, "baseline_weekly_earnings": 3000},
]


def _phone_hash(phone: str) -> str:
    return hashlib.sha256(phone.encode()).hexdigest()


async def seed_workers():
    supabase = get_supabase()

    for w in WORKERS:
        existing = supabase.table("workers").select("id").eq("worker_id", w["worker_id"]).execute()
        if existing.data:
            print(f"  Skip (exists): {w['worker_id']}")
            continue

        worker_data = {
            "name": w["name"],
            "phone_hash": _phone_hash(w["phone_raw"]),
            "platform": w["platform"].lower(),
            "city": w["city"],
            "zone": w["zone"],
            "worker_id": w["worker_id"],
            "rating": w["rating"],
            "avg_weekly_hours": w["avg_weekly_hours"],
            "baseline_weekly_earnings": w["baseline_weekly_earnings"],
        }
        result = supabase.table("workers").insert(worker_data).execute()
        if not result.data:
            print(f"  FAILED: {w['worker_id']}")
            continue

        worker_uuid = result.data[0]["id"]
        print(f"  Created: {w['worker_id']} -> {worker_uuid}")

        # Create policy
        premium = int(w["baseline_weekly_earnings"] * 0.025)
        coverage = int(w["baseline_weekly_earnings"] * 0.55)
        try:
            policy = await create_policy_for_worker(
                worker_id=worker_uuid,
                worker_city=w["city"],
                weekly_premium=premium,
                coverage_amount=coverage,
                supabase=supabase,
            )
            print(f"    Policy: {policy['policy_number']}")
        except Exception as e:
            print(f"    Policy FAILED: {e}")

    print(f"\nDone. {len(WORKERS)} workers processed.")


if __name__ == "__main__":
    asyncio.run(seed_workers())
