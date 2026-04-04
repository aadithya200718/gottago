import random
import string
from datetime import date, timedelta


CITY_CODES = {"Mumbai": "MUM", "Delhi": "DEL", "Bengaluru": "BLR"}


def generate_policy_number(city: str) -> str:
    """Generate policy number in format: GTG-2026-MUM-123456."""
    year = date.today().year
    city_code = CITY_CODES.get(city, "IND")
    suffix = "".join(random.choices(string.digits, k=6))
    return f"GTG-{year}-{city_code}-{suffix}"


async def create_policy_for_worker(
    worker_id: str,
    worker_city: str,
    weekly_premium: int,
    coverage_amount: int,
    supabase,
) -> dict:
    """Auto-create policy on worker registration.

    In production, policy lifecycle events are forwarded to the
    claims processing API via the integrations layer.
    """
    today = date.today()
    policy_data = {
        "policy_number": generate_policy_number(worker_city),
        "worker_id": worker_id,
        "start_date": today.isoformat(),
        "end_date": (today + timedelta(days=7)).isoformat(),
        "status": "active",
        "weekly_premium": weekly_premium,
        "coverage_amount": coverage_amount,
    }
    result = supabase.table("policies").insert(policy_data).execute()
    if not result.data:
        raise RuntimeError("Supabase policy insert returned no data")
    return result.data[0]
