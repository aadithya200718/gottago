from abc import ABC, abstractmethod
from typing import Any


class GuidewireClient(ABC):
    """Abstract base class for Guidewire PolicyCenter/ClaimCenter integration.

    Production implementations call the Guidewire Cloud REST API.
    Mock implementations return realistic fake responses for development.
    """

    @abstractmethod
    async def create_policy(
        self,
        worker_id: str,
        policy_number: str,
        coverage_amount: int,
        weekly_premium: int,
    ) -> dict[str, Any]:
        """Register a new policy in Guidewire PolicyCenter.

        Returns a dict with at minimum:
        - guidewire_policy_id: str
        - status: str
        - effective_date: str (ISO 8601)
        """

    @abstractmethod
    async def file_claim(
        self,
        policy_id: str,
        claim_number: str,
        trigger_type: str,
        payout_amount: int,
    ) -> dict[str, Any]:
        """File a claim in Guidewire ClaimCenter.

        Returns a dict with at minimum:
        - guidewire_claim_id: str
        - status: str
        - filed_at: str (ISO 8601)
        """

    @abstractmethod
    async def close_claim(
        self,
        guidewire_claim_id: str,
        resolution: str = "paid",
    ) -> dict[str, Any]:
        """Close/settle a claim in Guidewire ClaimCenter.

        Returns a dict with at minimum:
        - guidewire_claim_id: str
        - status: str
        - closed_at: str (ISO 8601)
        """
