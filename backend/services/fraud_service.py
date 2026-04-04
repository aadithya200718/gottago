import hashlib
import logging
from datetime import datetime, timedelta, timezone

from db.supabase import get_supabase
from ml.fraud_detector import get_fraud_detector

logger = logging.getLogger(__name__)


async def run_fraud_checks(
    claim_data: dict, worker: dict, policy: dict
) -> dict:
    """Run all 4 fraud detection signals and ML scoring.

    Returns dict with fraud_score, flags list, recommendation, and ml_score.
    """
    flags = []

    # Signal 1: GPS Zone Validation
    zone_flag = _check_zone_match(worker, claim_data.get("trigger_zone"))
    if zone_flag:
        flags.append(zone_flag)

    # Signal 2: Multi-Worker Zone Correlation
    corr_flag = await _check_zone_correlation(worker, claim_data["trigger_type"])
    if corr_flag:
        flags.append(corr_flag)

    # Signal 3: Timing Anomaly Detection
    timing_flag = _check_timing_anomaly(claim_data)
    if timing_flag:
        flags.append(timing_flag)

    # Signal 4: Duplicate Event Prevention
    dup_flag = await _check_duplicate(claim_data, worker["id"])
    if dup_flag:
        flags.append(dup_flag)

    # ML score from Isolation Forest
    detector = get_fraud_detector()
    ml_features = _extract_features(claim_data, worker, len(flags))
    ml_score = detector.score(ml_features)

    # Combined score: weight ML score + rule-based flags
    rule_score = min(len(flags) * 0.2, 0.8)
    fraud_score = round(0.4 * ml_score + 0.6 * rule_score, 2)

    if fraud_score < 0.3:
        recommendation = "approve"
    elif fraud_score < 0.7:
        recommendation = "review"
    else:
        recommendation = "reject"

    return {
        "fraud_score": fraud_score,
        "flags": flags,
        "recommendation": recommendation,
        "ml_score": ml_score,
    }


def _check_zone_match(worker: dict, trigger_zone: str | None) -> dict | None:
    if not trigger_zone:
        return None
    if worker.get("zone") != trigger_zone:
        return {
            "flag_type": "gps_mismatch",
            "severity": "medium",
            "details_json": {
                "worker_zone": worker.get("zone"),
                "trigger_zone": trigger_zone,
            },
        }
    return None


async def _check_zone_correlation(worker: dict, trigger_type: str) -> dict | None:
    """Flag if only 1 worker in a zone of 3+ is claiming for this trigger."""
    supabase = get_supabase()
    zone_workers = (
        supabase.table("workers")
        .select("id", count="exact")
        .eq("zone", worker.get("zone"))
        .execute()
    )
    total_in_zone = zone_workers.count or 0
    if total_in_zone < 3:
        return None

    six_hours_ago = (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat()
    zone_claims = (
        supabase.table("claims")
        .select("worker_id", count="exact")
        .eq("trigger_type", trigger_type)
        .gte("created_at", six_hours_ago)
        .execute()
    )
    claiming_count = zone_claims.count or 0
    if claiming_count == 1 and total_in_zone >= 3:
        return {
            "flag_type": "zone_correlation",
            "severity": "high",
            "details_json": {
                "zone_workers": total_in_zone,
                "zone_claimants": claiming_count,
            },
        }
    return None


def _check_timing_anomaly(claim_data: dict) -> dict | None:
    """Flag claims submitted more than 3 hours after the trigger event."""
    trigger_ts = claim_data.get("trigger_timestamp")
    if not trigger_ts:
        return None
    try:
        trigger_time = datetime.fromisoformat(str(trigger_ts).replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        hours_after = (now - trigger_time).total_seconds() / 3600
        if hours_after > 3:
            return {
                "flag_type": "timing_anomaly",
                "severity": "medium",
                "details_json": {"hours_after_trigger": round(hours_after, 1)},
            }
    except (ValueError, TypeError):
        pass
    return None


async def _check_duplicate(claim_data: dict, worker_id: str) -> dict | None:
    """Flag duplicate claims for the same trigger type on the same day."""
    event_hash = hashlib.sha256(
        f"{claim_data['trigger_type']}:{worker_id}:{datetime.now(timezone.utc).date()}".encode()
    ).hexdigest()[:16]

    supabase = get_supabase()
    today_str = datetime.now(timezone.utc).date().isoformat()
    existing = (
        supabase.table("claims")
        .select("id")
        .eq("worker_id", worker_id)
        .eq("trigger_type", claim_data["trigger_type"])
        .gte("created_at", today_str)
        .execute()
    )
    if existing.data:
        return {
            "flag_type": "duplicate_event",
            "severity": "high",
            "details_json": {"event_hash": event_hash},
        }
    return None


def _extract_features(claim_data: dict, worker: dict, flag_count: int) -> list[float]:
    """Extract feature vector for the Isolation Forest model."""
    return [
        claim_data.get("payout_amount", 300),
        flag_count,
        0,  # hours_since_trigger (populated at scoring time)
        worker.get("baseline_weekly_earnings", 5000) / 5000,
        worker.get("rating", 4.0),
    ]
