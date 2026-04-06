import httpx

BASE_URL = "http://127.0.0.1:8000"


def fire_trigger() -> None:
    print("=========================================")
    print(" GOTTAGO MANUAL DEMO TRIGGER ")
    print("=========================================")

    cities = ["Mumbai", "Delhi", "Bengaluru"]
    print("\nSelect City:")
    for i, city in enumerate(cities, start=1):
        print(f"{i}. {city}")

    city_idx = int(input("Choice (1-3): ")) - 1
    city = cities[city_idx]

    triggers = [
        "heavy_rainfall",
        "extreme_heat",
        "severe_aqi",
        "government_bandh",
        "compound_disruption",
    ]
    print("\nSelect Trigger Type:")
    for i, trigger in enumerate(triggers, start=1):
        print(f"{i}. {trigger.replace('_', ' ').title()}")

    trigger_idx = int(input("Choice (1-5): ")) - 1
    trigger_type = triggers[trigger_idx]

    print(f"\nFiring {trigger_type} in {city}...")

    try:
        response = httpx.post(
            f"{BASE_URL}/api/v1/triggers/fire",
            json={"city": city, "trigger_type": trigger_type},
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()

        print("\nTrigger complete.")
        if data.get("message"):
            print(f"Message: {data['message']}")
        print(f"Workers affected: {data.get('workers_affected', 0)}")
        print(f"Claims created: {data.get('claims_created', 0)}")
        print(f"Claims skipped: {data.get('claims_skipped', 0)}")
        print(f"Event hash: {data.get('event_hash', '-')}")
    except httpx.ConnectError:
        print(
            "\nError: backend is not running. Start it with "
            "`uvicorn main:app --reload --port 8000`."
        )
    except Exception as exc:
        print(f"\nError: {exc}")


if __name__ == "__main__":
    fire_trigger()
