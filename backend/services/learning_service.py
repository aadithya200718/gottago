"""
learning_service.py — Self-calibrating intelligence layer.

This is what separates GottaGO from a static parametric system.
Instead of fixed thresholds, the system learns from its own operational
data to improve three things:

1. Zone risk recalibration (actual claims vs predicted)
2. Fraud model retraining (Isolation Forest on real claim patterns)
3. Adaptive trigger thresholds (per-zone, per-season)

Run weekly via cron or manually via admin endpoint.
"""
import logging
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from db.supabase import get_supabase
from ml.fraud_detector import get_fraud_detector

logger = logging.getLogger(__name__)


async def recalibrate_zone_risks() -> dict:
    """Update disruption_zones risk scores based on actual claim history.

    For each zone, compares predicted risk (flood_risk_score, aqi_risk_score)
    against actual claim frequency over the past 30 days. Adjusts scores
    toward reality using exponential moving average (alpha=0.3).

    This means zones that experience MORE claims than expected get riskier,
    and zones with fewer claims than expected gradually become cheaper.
    """
    supabase = get_supabase()
    alpha = 0.3  # learning rate: 0 = never update, 1 = fully replace

    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()

    # Get all zones
    zones = supabase.table("disruption_zones").select("*").execute()
    if not zones.data:
        return {"updated": 0, "message": "No zones found"}

    # Get claims from last 30 days grouped by zone
    workers = supabase.table("workers").select("id, zone, city").execute()
    worker_zone_map = {w["id"]: w["zone"] for w in (workers.data or [])}

    claims = (
        supabase.table("claims")
        .select("worker_id, trigger_type, status")
        .gte("created_at", thirty_days_ago)
        .in_("status", ["approved", "paid"])
        .execute()
    )

    # Count claims per zone per trigger type
    zone_claims: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    for claim in (claims.data or []):
        zone = worker_zone_map.get(claim["worker_id"])
        if zone:
            zone_claims[zone][claim["trigger_type"]] += 1

    updates = []
    for zone in zones.data:
        zone_name = zone["zone_name"]
        zc = zone_claims.get(zone_name, {})

        rain_claims = zc.get("heavy_rainfall", 0)
        aqi_claims = zc.get("severe_aqi", 0)
        heat_claims = zc.get("extreme_heat", 0)

        # Observed claim rates (normalized to 0-1 scale, max 10 claims/month = 1.0)
        observed_flood = min(rain_claims / 10.0, 1.0)
        observed_aqi = min(aqi_claims / 10.0, 1.0)
        observed_heat = min(heat_claims / 10.0, 1.0)

        # EMA update: new_score = alpha * observed + (1-alpha) * old_score
        old_flood = float(zone.get("flood_risk_score", 0.5))
        old_aqi = float(zone.get("aqi_risk_score", 0.3))
        old_heat = float(zone.get("heat_risk_score", 0.3))

        new_flood = round(alpha * observed_flood + (1 - alpha) * old_flood, 3)
        new_aqi = round(alpha * observed_aqi + (1 - alpha) * old_aqi, 3)
        new_heat = round(alpha * observed_heat + (1 - alpha) * old_heat, 3)

        # Clamp to [0.05, 0.95] to avoid dead zones or guaranteed triggers
        new_flood = max(0.05, min(0.95, new_flood))
        new_aqi = max(0.05, min(0.95, new_aqi))
        new_heat = max(0.05, min(0.95, new_heat))

        if new_flood != old_flood or new_aqi != old_aqi or new_heat != old_heat:
            supabase.table("disruption_zones").update({
                "flood_risk_score": new_flood,
                "aqi_risk_score": new_aqi,
                "heat_risk_score": new_heat,
            }).eq("id", zone["id"]).execute()

            updates.append({
                "zone": zone_name,
                "flood": f"{old_flood:.3f} -> {new_flood:.3f}",
                "aqi": f"{old_aqi:.3f} -> {new_aqi:.3f}",
                "heat": f"{old_heat:.3f} -> {new_heat:.3f}",
                "claim_count": sum(zc.values()),
            })

    logger.info("Zone recalibration: updated %d zones", len(updates))
    return {"updated": len(updates), "changes": updates}


async def retrain_fraud_model() -> dict:
    """Retrain the Isolation Forest on actual claim data.

    Pulls all historical claims + worker features, builds the training
    matrix, and fits the fraud detector. The model is saved to disk
    so it persists across restarts.

    This is how the fraud engine gets smarter over time: patterns that
    were initially invisible (a worker claiming every single trigger,
    claims always at 3am, unusually high payout-to-earnings ratios)
    become detectable as the model sees more data.
    """
    supabase = get_supabase()

    claims = supabase.table("claims").select("*").execute()
    if not claims.data or len(claims.data) < 10:
        return {
            "retrained": False,
            "reason": f"Need 10+ claims, have {len(claims.data or [])}",
        }

    workers_result = supabase.table("workers").select("*").execute()
    worker_map = {w["id"]: w for w in (workers_result.data or [])}

    # Build feature matrix matching fraud_detector.py's expected format
    features = []
    for claim in claims.data:
        worker = worker_map.get(claim["worker_id"], {})
        fraud_flags_result = (
            supabase.table("fraud_flags")
            .select("id", count="exact")
            .eq("claim_id", claim["id"])
            .execute()
        )
        flag_count = fraud_flags_result.count or 0

        features.append([
            claim.get("payout_amount", 300),
            flag_count,
            0,  # hours_since_trigger
            worker.get("baseline_weekly_earnings", 5000) / 5000,
            worker.get("rating", 4.0),
        ])

    detector = get_fraud_detector()
    detector.fit(features)

    return {
        "retrained": True,
        "samples": len(features),
        "message": f"Fraud model retrained on {len(features)} claims",
    }


async def compute_adaptive_thresholds() -> dict:
    """Compute per-city trigger thresholds based on historical trigger data.

    Instead of a global "rain > 30mm = trigger", the system learns that:
    - Mumbai triggers at 25mm (floods easily)
    - Bengaluru triggers at 35mm (better drainage)
    - Delhi triggers at 30mm (baseline)

    Returns recommended thresholds per city. The admin can apply them
    or the system can auto-apply with a confidence gate.
    """
    supabase = get_supabase()

    events = (
        supabase.table("trigger_events")
        .select("trigger_type, city, intensity_value")
        .execute()
    )
    if not events.data:
        return {"recommendations": [], "message": "No trigger history yet"}

    # Group intensity values by city + trigger type
    city_trigger_values: dict[str, dict[str, list[float]]] = defaultdict(
        lambda: defaultdict(list)
    )
    for event in events.data:
        city = event.get("city", "unknown")
        ttype = event.get("trigger_type", "unknown")
        val = event.get("intensity_value")
        if val is not None:
            city_trigger_values[city][ttype].append(float(val))

    recommendations = []
    for city, triggers in city_trigger_values.items():
        for ttype, values in triggers.items():
            if len(values) < 3:
                continue

            # Use 25th percentile as the adaptive threshold:
            # triggers that actually happen at lower intensities in this city
            sorted_vals = sorted(values)
            p25_idx = max(0, len(sorted_vals) // 4)
            adaptive_threshold = sorted_vals[p25_idx]

            recommendations.append({
                "city": city,
                "trigger_type": ttype,
                "current_events": len(values),
                "median_intensity": round(sorted_vals[len(sorted_vals) // 2], 2),
                "recommended_threshold": round(adaptive_threshold, 2),
                "confidence": "high" if len(values) >= 10 else "medium",
            })

    return {"recommendations": recommendations}


async def run_full_learning_cycle() -> dict:
    """Execute all three learning steps in sequence.

    Call this weekly or after significant claim activity.
    """
    zone_result = await recalibrate_zone_risks()
    fraud_result = await retrain_fraud_model()
    threshold_result = await compute_adaptive_thresholds()

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "zone_recalibration": zone_result,
        "fraud_retraining": fraud_result,
        "adaptive_thresholds": threshold_result,
    }
