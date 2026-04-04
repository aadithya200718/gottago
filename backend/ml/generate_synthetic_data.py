"""
generate_synthetic_data.py — Generate training data for XGBoost premium model.
Run: python generate_synthetic_data.py
"""
import numpy as np
import pandas as pd


def generate_training_data(n_samples: int = 1500) -> pd.DataFrame:
    """
    Generate realistic synthetic training data for premium multiplier prediction.

    Ground truth logic:
    - High flood risk + summer/monsoon month = higher multiplier
    - High AQI (Delhi winter) = higher multiplier
    - Good rating = discount (lower multiplier)
    - Mumbai monsoon premium
    """
    rng = np.random.default_rng(42)

    cities = rng.choice(["Mumbai", "Delhi", "Bengaluru"], n_samples, p=[0.4, 0.35, 0.25])
    months = rng.integers(1, 13, n_samples)
    baseline_earnings = rng.integers(3000, 12001, n_samples)
    flood_risk = rng.beta(2, 3, n_samples)      # skewed lower
    aqi_risk = rng.beta(2, 2, n_samples)
    rating = rng.uniform(3.0, 5.0, n_samples)
    weekly_hours = rng.integers(20, 71, n_samples)

    monsoon_months = np.isin(months, [6, 7, 8, 9]).astype(float)
    summer_months = np.isin(months, [4, 5]).astype(float)
    winter_months = np.isin(months, [11, 12, 1]).astype(float)

    is_mumbai = (cities == "Mumbai").astype(float)
    is_delhi = (cities == "Delhi").astype(float)

    multiplier = (
        1.0
        + (flood_risk * 0.6)
        + (aqi_risk * 0.4)
        + (is_mumbai * 0.15)
        + (is_delhi * 0.1)
        + (monsoon_months * 0.2)
        + (summer_months * 0.15)
        + (winter_months * is_delhi * 0.1)     # Delhi winter AQI
        - ((rating - 3.0) / 2.0 * 0.15)
        + rng.normal(0, 0.05, n_samples)
    ).clip(0.5, 2.0)

    return pd.DataFrame({
        "city_mumbai": is_mumbai.astype(int),
        "city_delhi": is_delhi.astype(int),
        "city_bengaluru": (cities == "Bengaluru").astype(int),
        "month": months,
        "worker_weekly_baseline_inr": baseline_earnings,
        "zone_flood_risk_score": flood_risk,
        "zone_aqi_risk_score": aqi_risk,
        "platform_rating": rating,
        "avg_weekly_hours_logged": weekly_hours,
        "multiplier": multiplier,
    })


if __name__ == "__main__":
    df = generate_training_data()
    df.to_csv("training_data.csv", index=False)
    print(f"Generated {len(df)} samples")
    print(df["multiplier"].describe())
