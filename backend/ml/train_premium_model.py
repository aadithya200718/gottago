"""
train_premium_model.py — Train and save XGBoost premium pricing model.
Run from backend/ directory: python ml/train_premium_model.py
"""
from pathlib import Path
import xgboost as xgb
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

# Add parent to path so we can import sibling module
import sys
sys.path.insert(0, str(Path(__file__).parent))
from generate_synthetic_data import generate_training_data

FEATURES = [
    "city_mumbai",
    "city_delhi",
    "city_bengaluru",
    "month",
    "worker_weekly_baseline_inr",
    "zone_flood_risk_score",
    "zone_aqi_risk_score",
    "platform_rating",
    "avg_weekly_hours_logged",
]
BASE_PREMIUM = 159


def train() -> xgb.XGBRegressor:
    model_dir = Path(__file__).parent / "models"
    model_dir.mkdir(exist_ok=True)

    df = generate_training_data(1500)
    X = df[FEATURES]
    y = df["multiplier"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = xgb.XGBRegressor(
        max_depth=5,
        learning_rate=0.1,
        n_estimators=150,
        objective="reg:squarederror",
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=0,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"Test MAE (multiplier): {mae:.4f}")
    print(f"Test MAE (Rs.):        Rs.{mae * BASE_PREMIUM:.2f}")

    # Save model
    model_path = model_dir / "premium_xgboost.json"
    model.save_model(str(model_path))
    print(f"Model saved: {model_path}")

    # Save feature importance
    importance = dict(zip(FEATURES, model.feature_importances_.tolist()))
    pd.Series(importance).sort_values(ascending=False).to_json(str(model_dir / "feature_importance.json"))
    print("Feature importance saved.")

    return model


if __name__ == "__main__":
    train()
