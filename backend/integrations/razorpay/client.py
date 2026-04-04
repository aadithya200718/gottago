import logging
import uuid
from typing import Any

import httpx

from config import settings

logger = logging.getLogger(__name__)

RAZORPAY_BASE_URL = "https://api.razorpay.com/v1"


class RazorpayXClient:
    """Client for RazorpayX payouts API.

    Handles fund account creation and UPI payout disbursement.
    Uses RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from environment.
    """

    def __init__(self) -> None:
        self.key_id = settings.razorpay_key_id
        self.key_secret = settings.razorpay_key_secret
        if not self.key_id or not self.key_secret:
            logger.warning(
                "Razorpay credentials not configured. "
                "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env"
            )

    def _auth(self) -> tuple[str, str]:
        return (self.key_id, self.key_secret)

    async def create_fund_account(
        self,
        rider_id: str,
        upi_id: str,
    ) -> dict[str, Any]:
        """Create a RazorpayX fund account for UPI payouts.

        Args:
            rider_id: Internal worker/rider identifier.
            upi_id: UPI VPA (e.g. rider@upi).

        Returns:
            Dict with fund_account_id and status.
        """
        idempotency_key = f"fa-{rider_id}-{uuid.uuid4().hex[:8]}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{RAZORPAY_BASE_URL}/fund_accounts",
                auth=self._auth(),
                json={
                    "contact_id": rider_id,
                    "account_type": "vpa",
                    "vpa": {"address": upi_id},
                },
                headers={
                    "X-Payout-Idempotency": idempotency_key,
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()
            data = response.json()

        logger.info(
            "RazorpayX: created fund account %s for rider %s",
            data.get("id"),
            rider_id,
        )
        return {
            "fund_account_id": data["id"],
            "contact_id": rider_id,
            "upi_id": upi_id,
            "status": data.get("active", True),
        }

    async def disburse_payout(
        self,
        rider_id: str,
        amount_paise: int,
        claim_id: str,
        fund_account_id: str | None = None,
    ) -> dict[str, Any]:
        """Disburse payout via RazorpayX.

        Args:
            rider_id: Internal worker/rider identifier.
            amount_paise: Payout amount in paise (100 paise = 1 INR).
            claim_id: Associated claim ID for reference.
            fund_account_id: RazorpayX fund account ID. If not provided,
                uses rider_id as a fallback reference.

        Returns:
            Dict with payout_id, status, and UTR.
        """
        idempotency_key = f"po-{claim_id}-{uuid.uuid4().hex[:8]}"
        account_id = fund_account_id or rider_id

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{RAZORPAY_BASE_URL}/payouts",
                auth=self._auth(),
                json={
                    "fund_account_id": account_id,
                    "amount": amount_paise,
                    "currency": "INR",
                    "mode": "UPI",
                    "purpose": "payout",
                    "queue_if_low_balance": True,
                    "reference_id": claim_id,
                    "narration": f"Claim payout {claim_id}",
                },
                headers={
                    "X-Payout-Idempotency": idempotency_key,
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()
            data = response.json()

        logger.info(
            "RazorpayX: disbursed %d paise to rider %s for claim %s, payout_id=%s",
            amount_paise,
            rider_id,
            claim_id,
            data.get("id"),
        )
        return {
            "payout_id": data["id"],
            "status": data.get("status", "processing"),
            "utr": data.get("utr"),
            "amount_paise": amount_paise,
            "claim_id": claim_id,
        }
