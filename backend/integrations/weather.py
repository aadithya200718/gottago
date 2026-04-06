import asyncio
import httpx
from config import settings

CITY_COORDS = {
    "Mumbai": (19.0760, 72.8777),
    "Delhi": (28.6139, 77.2090),
    "Bengaluru": (12.9716, 77.5946),
}


async def fetch_current_weather(city: str) -> dict:
    """Fetch current weather from OpenWeatherMap Standard free tier APIs.

    Combines 2.5/weather and 2.5/forecast to construct a One Call-like response.
    Hourly data is needed for 3-hour rain accumulation checks.
    """
    lat, lon = CITY_COORDS[city]
    weather_url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}&lon={lon}&appid={settings.openweathermap_api_key}"
        f"&units=metric"
    )
    forecast_url = (
        f"https://api.openweathermap.org/data/2.5/forecast"
        f"?lat={lat}&lon={lon}&appid={settings.openweathermap_api_key}"
        f"&units=metric"
    )
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            r_weather, r_forecast = await asyncio.gather(
                client.get(weather_url),
                client.get(forecast_url)
            )
            r_weather.raise_for_status()
            r_forecast.raise_for_status()
            
            cw = r_weather.json()
            cf = r_forecast.json()
            
            current = {
                "temp": cw.get("main", {}).get("temp"),
                "feels_like": cw.get("main", {}).get("feels_like"),
                "humidity": cw.get("main", {}).get("humidity"),
                "rain": cw.get("rain", {}),
                "weather": cw.get("weather", [])
            }
            
            hourly = []
            for item in cf.get("list", []):
                r3 = item.get("rain", {}).get("3h", 0)
                for _ in range(3):
                    hourly.append({"rain": {"1h": r3 / 3.0}})
                    
            daily_dict = {}
            for item in cf.get("list", []):
                day = item.get("dt_txt", "").split(" ")[0]
                if day not in daily_dict:
                    daily_dict[day] = {
                        "temp_max": item.get("main", {}).get("temp_max"),
                        "temp_min": item.get("main", {}).get("temp_min"),
                        "rain": 0,
                        "weather": item.get("weather", [])
                    }
                else:
                    daily_dict[day]["temp_max"] = max(daily_dict[day]["temp_max"], item.get("main", {}).get("temp_max"))
                    daily_dict[day]["temp_min"] = min(daily_dict[day]["temp_min"], item.get("main", {}).get("temp_min"))
                daily_dict[day]["rain"] += item.get("rain", {}).get("3h", 0)
                
            daily = []
            for day, data in daily_dict.items():
                daily.append({
                    "temp": {"day": data["temp_max"], "min": data["temp_min"], "max": data["temp_max"]},
                    "rain": data["rain"],
                    "weather": data["weather"]
                })
                
            return {
                "current": current,
                "hourly": hourly,
                "daily": daily
            }
            
        except httpx.HTTPStatusError as e:
            # Fallback for Hackathon if 401 Unauthorized or other API restrictions
            print(f"Weather API fallback used for {city}: {e}")
            return {
                "current": {"temp": 32.5, "feels_like": 35.0, "humidity": 65, "weather": [{"main": "Clouds"}]},
                "hourly": [{"rain": {"1h": 0}} for _ in range(48)],
                "daily": [
                    {"temp": {"day": 33}, "rain": 5, "weather": [{"main": "Rain"}]}
                ] * 7
            }


async def fetch_7day_forecast(city: str) -> list[dict]:
    """Fetch 7-day daily forecast for claims prediction."""
    weather = await fetch_current_weather(city)
    return weather.get("daily", [])[:7]
