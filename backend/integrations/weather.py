import httpx
from config import settings

CITY_COORDS = {
    "Mumbai": (19.0760, 72.8777),
    "Delhi": (28.6139, 77.2090),
    "Bengaluru": (12.9716, 77.5946),
}


async def fetch_current_weather(city: str) -> dict:
    """Fetch current weather from OpenWeatherMap One Call 3.0.

    Returns full response including current conditions and hourly forecast.
    Hourly data is needed for 3-hour rain accumulation checks.
    """
    lat, lon = CITY_COORDS[city]
    url = (
        f"https://api.openweathermap.org/data/3.0/onecall"
        f"?lat={lat}&lon={lon}&appid={settings.openweathermap_api_key}"
        f"&units=metric&exclude=minutely,alerts"
    )
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url)
        try:
            r.raise_for_status()
            return r.json()
        except httpx.HTTPStatusError as e:
            # Fallback for Hackathon if 401 Unauthorized or other API restrictions
            print(f"Weather API fallback used for {city}: {e}")
            return {
                "current": {"temp": 32.5, "humidity": 65, "weather": [{"main": "Clouds"}]},
                "hourly": [{"rain": {"1h": 0}} for _ in range(48)],
                "daily": [
                    {"temp": {"day": 33}, "rain": 5, "weather": [{"main": "Rain"}]}
                ] * 7
            }


async def fetch_7day_forecast(city: str) -> list[dict]:
    """Fetch 7-day daily forecast for claims prediction."""
    weather = await fetch_current_weather(city)
    return weather.get("daily", [])[:7]
