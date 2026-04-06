import httpx
from config import settings

CITY_SLUGS = {"Mumbai": "mumbai", "Delhi": "delhi", "Bengaluru": "bangalore"}


async def fetch_aqi(city: str) -> float:
    """Fetch real-time AQI from WAQI API.

    Returns AQI value as float. Falls back to 50.0 if the API is unreachable.
    """
    slug = CITY_SLUGS.get(city, city.lower())
    url = f"https://api.waqi.info/feed/{slug}/?token={settings.waqi_token}"
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url)
        data = r.json()
        if data.get("status") == "ok":
            return float(data["data"]["aqi"])
    return 50.0
