"""Seed 3 government bandh trigger events.

Run: cd backend && python -m seeds.mock_bandh
"""
import hashlib
from datetime import datetime, timedelta, timezone

from db.supabase import get_supabase

BANDH_EVENTS = [
    {
        "city": "Mumbai",
        "description": "Political protest bandh",
        "days_ago": 2,
        "duration_hours": 8,
        "intensity": 1.0,
    },
    {
        "city": "Delhi",
        "description": "Transport strike bandh",
        "days_ago": 5,
        "duration_hours": 12,
        "intensity": 1.0,
    },
    {
        "city": "Bengaluru",
        "description": "State holiday bandh",
        "days_ago": 10,
        "duration_hours": 6,
        "intensity": 0.8,
    },
]


def seed_bandh():
    supabase = get_supabase()
    now = datetime.now(timezone.utc)

    for event in BANDH_EVENTS:
        ts = (now - timedelta(days=event["days_ago"])).isoformat()
        event_hash = hashlib.sha256(
            f"government_bandh:{event['city']}:{ts[:10]}".encode()
        ).hexdigest()[:16]

        existing = supabase.table("trigger_events").select("id").eq("event_hash", event_hash).execute()
        if existing.data:
            print(f"  Skip (exists): {event['city']} bandh")
            continue

        # Count workers in city
        workers_result = (
            supabase.table("workers")
            .select("id", count="exact")
            .eq("city", event["city"])
            .execute()
        )

        event_data = {
            "trigger_type": "government_bandh",
            "city": event["city"],
            "zone_id": None,
            "timestamp": ts,
            "duration_hours": event["duration_hours"],
            "intensity_value": event["intensity"],
            "source_api": "NDMA_Mock",
            "event_hash": event_hash,
            "affected_workers_count": workers_result.count or 0,
        }

        try:
            result = supabase.table("trigger_events").insert(event_data).execute()
            if result.data:
                print(f"  Created: {event['city']} bandh ({event['description']})")
        except Exception as e:
            print(f"  FAILED: {event['city']} bandh - {e}")

    print("Done. 3 bandh events processed.")


if __name__ == "__main__":
    seed_bandh()
