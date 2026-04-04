import logging
from datetime import datetime, timezone
from typing import Any

from db.supabase import get_supabase
from integrations import get_guidewire_client
from integrations.razorpay.client import RazorpayXClient

logger = logging.getLogger(__name__)

FRAUD_SCORE_THRESHOLD = 0.7


class PayoutError(Exception):
    """Raised when payout orchestration fails at any step."""


async def orchestrate_payout(claim_id: str) -> dict[str, Any]:
    """End-to-end payout orchestration for a triggered claim.

    Steps:
    1. Fetch claim from Supabase
    2. Check fraud_score against threshold
    3. File claim on Guidewire (mock or real)
    4. Disburse payout via RazorpayX
    5. Update claim status in Supabase
    6. Log to audit table

    Args:
        claim_id: The claim record ID from Supabase.

    Returns:
        Dict with payout result, guidewire response, and final status.

    Raises:
        PayoutError: If any step fails (claim not found, fraud flagged, API error).
    """
    supabase = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    # Step 1: Fetch claim
    claim_result = (
        supabase.table("claims")
        .select("*")
        .eq("id", claim_id)
        .single()
        .execute()
    )
    if not claim_result.data:
        raise PayoutError(f"Claim {claim_id} not found")

    claim = claim_result.data
    logger.info("Payout: processing claim %s, type=%s", claim_id, claim.get("trigger_type"))

    # Step 2: Check fraud score
    fraud_score = claim.get("fraud_score", 0.0)
    if fraud_score >= FRAUD_SCORE_THRESHOLD:
        await _update_claim_status(supabase, claim_id, "flagged")
        await _log_audit(
            supabase,
            claim_id=claim_id,
            action="payout_blocked",
            details=f"Fraud score {fraud_score} exceeds threshold {FRAUD_SCORE_THRESHOLD}",
        )
        raise PayoutError(
            f"Claim {claim_id} flagged for fraud (score={fraud_score})"
        )

    # Step 3: File claim on Guidewire
    gw_client = get_guidewire_client()
    try:
        gw_response = await gw_client.file_claim(
            policy_id=claim.get("policy_id", ""),
            claim_number=claim.get("claim_number", ""),
            trigger_type=claim.get("trigger_type", "unknown"),
            payout_amount=claim.get("payout_amount", 0),
        )
    except Exception as exc:
        await _update_claim_status(supabase, claim_id, "error")
        await _log_audit(
            supabase,
            claim_id=claim_id,
            action="guidewire_error",
            details=str(exc),
        )
        raise PayoutError(f"Guidewire file_claim failed: {exc}") from exc

    logger.info(
        "Payout: Guidewire claim filed, gw_id=%s",
        gw_response.get("guidewire_claim_id"),
    )

    # Step 4: Disburse via RazorpayX
    razorpay = RazorpayXClient()
    payout_amount_paise = claim.get("payout_amount", 0) * 100

    try:
        payout_response = await razorpay.disburse_payout(
            rider_id=claim.get("worker_id", ""),
            amount_paise=payout_amount_paise,
            claim_id=claim_id,
        )
    except Exception as exc:
        await _update_claim_status(supabase, claim_id, "payout_failed")
        await _log_audit(
            supabase,
            claim_id=claim_id,
            action="razorpay_error",
            details=str(exc),
        )
        raise PayoutError(f"RazorpayX disbursement failed: {exc}") from exc

    logger.info(
        "Payout: disbursed %d paise, payout_id=%s",
        payout_amount_paise,
        payout_response.get("payout_id"),
    )

    # Step 5: Update claim status
    await _update_claim_status(
        supabase,
        claim_id,
        "paid",
        extra={
            "transaction_id": payout_response.get("payout_id"),
            "guidewire_claim_id": gw_response.get("guidewire_claim_id"),
            "paid_at": now,
        },
    )

    # Step 6: Audit log
    await _log_audit(
        supabase,
        claim_id=claim_id,
        action="payout_completed",
        details=(
            f"Amount: {payout_amount_paise} paise, "
            f"RazorpayX: {payout_response.get('payout_id')}, "
            f"Guidewire: {gw_response.get('guidewire_claim_id')}"
        ),
    )

    return {
        "claim_id": claim_id,
        "status": "paid",
        "guidewire": gw_response,
        "razorpay": payout_response,
    }


async def _update_claim_status(
    supabase,
    claim_id: str,
    status: str,
    extra: dict[str, Any] | None = None,
) -> None:
    """Update claim status in Supabase."""
    update_data: dict[str, Any] = {"status": status}
    if extra:
        update_data.update(extra)

    supabase.table("claims").update(update_data).eq("id", claim_id).execute()
    logger.info("Payout: claim %s status -> %s", claim_id, status)


async def _log_audit(
    supabase,
    claim_id: str,
    action: str,
    details: str,
) -> None:
    """Insert a row into the audit_log table."""
    now = datetime.now(timezone.utc).isoformat()
    try:
        supabase.table("audit_log").insert({
            "claim_id": claim_id,
            "action": action,
            "details": details,
            "created_at": now,
        }).execute()
    except Exception as exc:
        logger.error("Failed to write audit log for claim %s: %s", claim_id, exc)
