import os
import logging

import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "fraud_isolation_forest.pkl")


class FraudDetector:
    """Isolation Forest-based anomaly detector for claims fraud scoring.

    Features expected: [payout_amount, flag_count, hours_since_trigger,
    earnings_ratio, rating].
    """

    def __init__(self) -> None:
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.1,
            random_state=42,
        )
        self.scaler = StandardScaler()
        self._fitted = False
        self._load_model()

    def _load_model(self) -> None:
        if os.path.exists(MODEL_PATH):
            try:
                saved = joblib.load(MODEL_PATH)
                self.model = saved["model"]
                self.scaler = saved["scaler"]
                self._fitted = True
                logger.info("Loaded fraud model from %s", MODEL_PATH)
            except Exception as exc:
                logger.warning("Failed to load fraud model: %s", exc)

    def fit(self, claims_features: list[list[float]]) -> None:
        """Train on historical claims features. Needs at least 10 samples."""
        if len(claims_features) < 10:
            logger.info("Not enough samples (%d) to fit fraud model", len(claims_features))
            return
        arr = np.array(claims_features)
        scaled = self.scaler.fit_transform(arr)
        self.model.fit(scaled)
        self._fitted = True
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump({"model": self.model, "scaler": self.scaler}, MODEL_PATH)
        logger.info("Fraud model trained on %d samples, saved to %s", len(claims_features), MODEL_PATH)

    def score(self, features: list[float]) -> float:
        """Return a fraud probability score between 0 (safe) and 1 (fraudulent).

        If the model is not fitted, returns a conservative default of 0.15.
        """
        if not self._fitted:
            return 0.15
        scaled = self.scaler.transform([features])
        raw = self.model.decision_function(scaled)[0]
        # Convert decision_function (negative = anomaly) to 0-1 probability
        return round(max(0, min(1, 0.5 - raw)), 2)


_detector: FraudDetector | None = None


def get_fraud_detector() -> FraudDetector:
    global _detector
    if _detector is None:
        _detector = FraudDetector()
    return _detector
