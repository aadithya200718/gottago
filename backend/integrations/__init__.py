import logging
import os
from typing import Any

from integrations.guidewire.base import GuidewireClient
from integrations.guidewire.mock_client import MockGuidewireClient
from integrations.guidewire.real_client import RealGuidewireClient

logger = logging.getLogger(__name__)


def get_guidewire_client() -> GuidewireClient:
    """Factory that returns the appropriate Guidewire client based on GUIDEWIRE_ENV.

    - "mock" (default): MockGuidewireClient with fake responses
    - "production": RealGuidewireClient (requires API credentials)
    """
    env = os.getenv("GUIDEWIRE_ENV", "mock").lower()

    if env == "production":
        base_url = os.getenv("GUIDEWIRE_BASE_URL", "")
        auth_token = os.getenv("GUIDEWIRE_AUTH_TOKEN", "")
        if not base_url or not auth_token:
            raise RuntimeError(
                "GUIDEWIRE_BASE_URL and GUIDEWIRE_AUTH_TOKEN must be set "
                "when GUIDEWIRE_ENV=production"
            )
        logger.info("Using RealGuidewireClient at %s", base_url)
        return RealGuidewireClient(base_url=base_url, auth_token=auth_token)

    logger.info("Using MockGuidewireClient (GUIDEWIRE_ENV=%s)", env)
    return MockGuidewireClient()
