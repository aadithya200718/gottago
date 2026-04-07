"""
Verification API Router
========================
Exposes the 14-layer verification system as REST endpoints.
Used for both production verification and demo walkthroughs.
"""

from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.verification_service import (
    run_full_verification,
    verify_aadhaar_xml,
    verify_otp,
    verify_face_match,
    verify_gps_geofence,
    verify_cell_tower,
    verify_wifi_fingerprint,
    verify_motion_sensor,
    verify_bank_statement,
    verify_email_dkim,
    detect_syndicate,
    verify_weather_cross_source,
    verify_video_proof,
    verify_multi_sig,
    verify_device_fingerprint,
    get_ist_week_start,
)

router = APIRouter()


# ─────────────────────────────────────────────
#  Demo / Documentation Endpoint
# ─────────────────────────────────────────────

@router.get("/layers")
async def list_verification_layers():
    """List all 14 verification layers with metadata.

    Used by the frontend to display the verification architecture.
    """
    layers = [
        {
            "layer": 1,
            "tier": 1,
            "name": "Aadhaar Offline XML",
            "tier_name": "Identity & Registration",
            "tech": "pyaadhaar + lxml",
            "cost": "Free",
            "description": "UIDAI XML signature verification with 3-day expiry check.",
        },
        {
            "layer": 2,
            "tier": 1,
            "name": "Firebase OTP + MSG91",
            "tier_name": "Identity & Registration",
            "tech": "Firebase Auth + MSG91",
            "cost": "Free",
            "description": "Phone OTP with MSG91 fallback for Firebase rate limits.",
        },
        {
            "layer": 3,
            "tier": 1,
            "name": "Face Match",
            "tier_name": "Identity & Registration",
            "tech": "face-api.js",
            "cost": "Free",
            "description": "Selfie vs Aadhaar photo matching with ≤0.5 distance threshold.",
        },
        {
            "layer": 4,
            "tier": 2,
            "name": "GPS Geofence",
            "tier_name": "Location & Activity",
            "tech": "Browser Geolocation API",
            "cost": "Free",
            "description": "Haversine distance validation against registered zones.",
        },
        {
            "layer": 5,
            "tier": 2,
            "name": "Cell Tower Triangulation",
            "tier_name": "Location & Activity",
            "tech": "OpenCelliD + MLS",
            "cost": "Free",
            "description": "Tower-based position cross-check with monthly DB refresh.",
        },
        {
            "layer": 6,
            "tier": 2,
            "name": "Wi-Fi Fingerprint",
            "tier_name": "Location & Activity",
            "tech": "WiGLE Database",
            "cost": "Free",
            "description": "BSSID matching against quarterly pre-downloaded WiGLE data.",
        },
        {
            "layer": 7,
            "tier": 2,
            "name": "Motion Sensor CNN",
            "tier_name": "Location & Activity",
            "tech": "TensorFlow Lite",
            "cost": "Free",
            "description": "Accelerometer/gyroscope pattern classification.",
        },
        {
            "layer": 8,
            "tier": 3,
            "name": "Bank Statement OCR",
            "tier_name": "Platform & Activity",
            "tech": "Camelot + pikepdf",
            "cost": "Free",
            "description": "PDF table extraction for Swiggy/Zomato UPI verification.",
        },
        {
            "layer": 9,
            "tier": 3,
            "name": "Email DKIM Validation",
            "tier_name": "Platform & Activity",
            "tech": "dkimpy + SPF",
            "cost": "Free",
            "description": "Platform email signature verification with SPF fallback.",
        },
        {
            "layer": 10,
            "tier": 4,
            "name": "Syndicate Detection",
            "tier_name": "Fraud Detection",
            "tech": "NetworkX + Louvain",
            "cost": "Free",
            "description": "Graph-based community analysis with temporal edge weighting.",
        },
        {
            "layer": 11,
            "tier": 4,
            "name": "Weather Cross-Validation",
            "tier_name": "Fraud Detection",
            "tech": "Open-Meteo + IMD",
            "cost": "Free",
            "description": "Multi-source rainfall verification with >2mm disagreement flag.",
        },
        {
            "layer": 12,
            "tier": 5,
            "name": "Video Proof",
            "tier_name": "Claim-Specific",
            "tech": "MediaRecorder + Supabase",
            "cost": "Free",
            "description": "15s WebM with GPS/timestamp/device watermark.",
        },
        {
            "layer": 13,
            "tier": 5,
            "name": "Multi-Sig Approval",
            "tier_name": "Claim-Specific",
            "tech": "HMAC-SHA256",
            "cost": "Free",
            "description": "Per-admin cryptographic signature verification.",
        },
        {
            "layer": 14,
            "tier": 5,
            "name": "Device Fingerprint",
            "tier_name": "Claim-Specific",
            "tech": "FingerprintJS OSS",
            "cost": "Free",
            "description": "Factory-reset and multi-account fraud detection.",
        },
    ]
    return {
        "total_layers": 14,
        "monthly_cost": "₹0",
        "monthly_savings_vs_paid": "₹153,000",
        "layers": layers,
    }


# ─────────────────────────────────────────────
#  Demo Simulation Endpoint
# ─────────────────────────────────────────────

class DemoVerificationRequest(BaseModel):
    worker_id: str = "demo_worker_001"
    city: str = "Mumbai"
    trigger_type: str = "heavy_rainfall"
    gps_lat: float = 19.0760
    gps_lon: float = 72.8777
    simulate_fraud: bool = False


@router.post("/demo")
async def run_demo_verification(body: DemoVerificationRequest):
    """Run a simulated 14-layer verification for demo purposes.

    Shows how each layer would evaluate a real claim with sample data.
    Set simulate_fraud=true to see how fraud detection layers respond.
    """
    # Construct demo worker
    worker = {
        "id": body.worker_id,
        "phone": "+919876543210",
        "city": body.city,
        "zone": "Zone-A",
    }

    # Construct demo claim
    claim_data = {
        "claim_id": "demo_claim_001",
        "trigger_type": body.trigger_type,
        "city": body.city,
        "zone_coords": (body.gps_lat, body.gps_lon),
        "claimed_rain_mm": 35.0 if body.trigger_type == "heavy_rainfall" else 5.0,
        "owm_rain_mm": 33.0,
        "open_meteo_rain_mm": 34.5 if not body.simulate_fraud else 10.0,
        "imd_rain_mm": 32.0,
    }

    # Construct demo verification inputs
    verification_inputs = {
        "aadhaar_xml": "",  # Skipped in demo
        "share_code": "",
        "otp_code": "123456",
        "otp_provider": "firebase",
        "selfie_descriptor": [0.1] * 128,
        "aadhaar_descriptor": [0.1] * 128 if not body.simulate_fraud else [0.9] * 128,
        "detection_confidence": 0.85,
        "gps": {"lat": body.gps_lat, "lon": body.gps_lon},
        "cell_tower": {"mcc": 404, "mnc": 45, "lac": 1234, "cid": 5678},
        "bssids": ["AA:BB:CC:DD:EE:FF", "11:22:33:44:55:66"],
        "accel_data": [{"x": 0.1, "y": 0.2, "z": 9.8}] * 20,
        "email_headers": {
            "dkim-signature": "v=1; a=rsa-sha256; d=swiggy.in; demo",
        },
        "connections": (
            [
                {"connected_worker_id": f"fraud_{i}", "timestamp": datetime.now(timezone.utc).isoformat()}
                for i in range(10)
            ]
            if body.simulate_fraud
            else []
        ),
        "video_metadata": {
            "server_timestamp": datetime.now(timezone.utc).isoformat(),
            "gps": {"lat": body.gps_lat, "lon": body.gps_lon},
            "device_id": "fp_abc123def456",
        },
        "signatures": [],  # Skipped in demo
        "device_fingerprint": "fp_abc123def456",
        "known_fingerprints": ["fp_abc123def456"],
    }

    result = await run_full_verification(worker, claim_data, verification_inputs)

    return {
        "demo_mode": True,
        "worker": worker,
        "claim": claim_data,
        "fraud_simulated": body.simulate_fraud,
        "verification": result,
    }


# ─────────────────────────────────────────────
#  Individual Layer Test Endpoints
# ─────────────────────────────────────────────

@router.get("/test/gps")
async def test_gps_layer(
    lat: float = 19.0760,
    lon: float = 72.8777,
    center_lat: float = 19.0760,
    center_lon: float = 72.8777,
    radius_km: float = 5.0,
):
    """Test Layer 4 (GPS Geofence) with custom coordinates."""
    return verify_gps_geofence(lat, lon, (center_lat, center_lon), radius_km)


@router.get("/test/weather")
async def test_weather_layer(
    city: str = "Mumbai",
    owm_rain: float = 33.0,
    ometeo_rain: float = 34.5,
    imd_rain: float = 32.0,
):
    """Test Layer 11 (Weather Cross-Validation) with custom readings."""
    return verify_weather_cross_source(
        city, 0, owm_rain, ometeo_rain, imd_rain
    )


@router.get("/config/status")
async def get_config_status():
    """Check which verification layer API keys are configured."""
    from config import settings
    return {
        "msg91": bool(settings.msg91_api_key),
        "opencellid": bool(settings.opencellid_api_key),
        "wigle": bool(settings.wigle_api_key),
        "admin_hmac": bool(settings.admin_hmac_secret),
        "supabase": bool(settings.supabase_url and settings.supabase_key),
        "openweathermap": bool(settings.openweathermap_api_key),
        "waqi": bool(settings.waqi_token),
        "ist_week_start": get_ist_week_start().isoformat(),
    }
