import uuid
import logging
from datetime import datetime, timezone
from typing import Any

from integrations.guidewire.base import GuidewireClient

logger = logging.getLogger(__name__)


def _gw_id(prefix: str) -> str:
    """Generate a Guidewire-style ID: prefix + 8 uppercase hex chars."""
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"


class MockGuidewireClient(GuidewireClient):
    """Simulates Guidewire PolicyCenter/ClaimCenter responses.

    Returns realistic payloads with deterministic structure but random IDs.
    Latency is zero; use this for development and testing.
    """

    async def create_policy(
        self,
        worker_id: str,
        policy_number: str,
        coverage_amount: int,
        weekly_premium: int,
    ) -> dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        gw_id = _gw_id("GTG-POL")
        logger.info(
            "MockGuidewire: created policy %s for worker %s", gw_id, worker_id
        )
        return {
            "guidewire_policy_id": gw_id,
            "policy_number": policy_number,
            "worker_id": worker_id,
            "status": "in_force",
            "effective_date": now,
            "coverage_amount": coverage_amount,
            "weekly_premium": weekly_premium,
            "product_code": "PARAM_GOTTAGO_WK",
            "underwriting_result": "auto_approved",
        }

    async def file_claim(
        self,
        policy_id: str,
        claim_number: str,
        trigger_type: str,
        payout_amount: int,
    ) -> dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        gw_id = _gw_id("GTG-CLM")
        logger.info(
            "MockGuidewire: filed claim %s on policy %s, trigger=%s, amount=%d",
            gw_id,
            policy_id,
            trigger_type,
            payout_amount,
        )
        return {
            "guidewire_claim_id": gw_id,
            "policy_id": policy_id,
            "claim_number": claim_number,
            "trigger_type": trigger_type,
            "payout_amount": payout_amount,
            "status": "open",
            "filed_at": now,
            "loss_type": f"parametric_{trigger_type}",
            "adjuster_assigned": False,
        }

    async def close_claim(
        self,
        guidewire_claim_id: str,
        resolution: str = "paid",
    ) -> dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        logger.info(
            "MockGuidewire: closing claim %s with resolution=%s",
            guidewire_claim_id,
            resolution,
        )
        return {
            "guidewire_claim_id": guidewire_claim_id,
            "status": "closed",
            "resolution": resolution,
            "closed_at": now,
            "settlement_method": "razorpay_upi",
        }
