from typing import Any

from integrations.guidewire.base import GuidewireClient


class RealGuidewireClient(GuidewireClient):
    """Production Guidewire Cloud REST API client.

    Not implemented. Switch to this via GUIDEWIRE_ENV=production.
    Requires Guidewire Cloud API credentials and endpoint configuration.
    """

    def __init__(self, base_url: str, auth_token: str) -> None:
        self.base_url = base_url
        self.auth_token = auth_token

    async def create_policy(
        self,
        worker_id: str,
        policy_number: str,
        coverage_amount: int,
        weekly_premium: int,
    ) -> dict[str, Any]:
        raise NotImplementedError(
            "RealGuidewireClient.create_policy requires Guidewire Cloud API access. "
            "Set GUIDEWIRE_ENV=mock for development."
        )

    async def file_claim(
        self,
        policy_id: str,
        claim_number: str,
        trigger_type: str,
        payout_amount: int,
    ) -> dict[str, Any]:
        raise NotImplementedError(
            "RealGuidewireClient.file_claim requires Guidewire Cloud API access. "
            "Set GUIDEWIRE_ENV=mock for development."
        )

    async def close_claim(
        self,
        guidewire_claim_id: str,
        resolution: str = "paid",
    ) -> dict[str, Any]:
        raise NotImplementedError(
            "RealGuidewireClient.close_claim requires Guidewire Cloud API access. "
            "Set GUIDEWIRE_ENV=mock for development."
        )
