# GottaGO — Verification System Demo Guide

> **Zero-cost, 14-layer fraud prevention for India's gig worker income protection platform.**

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Quick Start](#quick-start)
3. [Running the Demo](#running-the-demo)
4. [Layer-by-Layer Walkthrough](#layer-by-layer-walkthrough)
5. [Demo Scenarios](#demo-scenarios)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Architecture Diagram](#architecture-diagram)

---

## System Overview

GottaGO uses a **14-layer verification framework** organized into 5 tiers to validate claims before automatic payouts. Every layer runs on **free-tier or open-source tools**, saving ₹1,53,000/month compared to commercial APIs.

| Tier | Layers | Purpose |
|------|--------|---------|
| **Tier 1**: Identity & Registration | L1–L3 | Aadhaar XML, OTP, Face Match |
| **Tier 2**: Location & Activity | L4–L7 | GPS, Cell Tower, Wi-Fi, Motion Sensor |
| **Tier 3**: Platform & Activity | L8–L9 | Bank OCR, Email DKIM |
| **Tier 4**: Fraud Detection | L10–L11 | Syndicate Detection, Weather Cross-Check |
| **Tier 5**: Claim-Specific | L12–L14 | Video Proof, Multi-Sig, Device Fingerprint |

---

## Quick Start

### Prerequisites

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Environment Setup

Copy the example environment file and fill in API keys:

```bash
cp backend/.env.example backend/.env
```

Required keys for the verification system:

```env
# Zero-cost verification layer keys
MSG91_API_KEY=msg-506532ApfUFsw3g69d45f24P1
OPENCELLID_API_KEY=pk.bfef3fbc943585540db1a0c431437d97
WIGLE_API_KEY=94c04842f5157b2cbce4df4cdddfc2ac
ADMIN_HMAC_SECRET=your-secure-random-string
```

### Start Services
```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## Running the Demo

### Option 1: Frontend Visual Demo

1. Open `http://localhost:3000` in your browser
2. Scroll to the **"13-Layer Verification Framework"** section
3. Each tier is displayed with its constituent layers, technologies, and cost savings

### Option 2: API Demo (Interactive)

#### List All Layers

```bash
curl http://localhost:8000/api/v1/verification/layers | python -m json.tool
```

**Response:**
```json
{
  "total_layers": 14,
  "monthly_cost": "₹0",
  "monthly_savings_vs_paid": "₹153,000",
  "layers": [
    {
      "layer": 1,
      "tier": 1,
      "name": "Aadhaar Offline XML",
      "tech": "pyaadhaar + lxml",
      "cost": "Free",
      "description": "UIDAI XML signature verification with 3-day expiry check."
    }
    // ... 13 more layers
  ]
}
```

#### Run Full Verification (Normal Claim)

```bash
curl -X POST http://localhost:8000/api/v1/verification/demo \
  -H "Content-Type: application/json" \
  -d '{
    "worker_id": "demo_worker_001",
    "city": "Mumbai",
    "trigger_type": "heavy_rainfall",
    "gps_lat": 19.0760,
    "gps_lon": 72.8777,
    "simulate_fraud": false
  }' | python -m json.tool
```

**Expected response:** All active layers show `"status": "pass"`, recommendation is `"approve"`.

#### Run Full Verification (Simulated Fraud)

```bash
curl -X POST http://localhost:8000/api/v1/verification/demo \
  -H "Content-Type: application/json" \
  -d '{
    "worker_id": "demo_worker_001",
    "city": "Mumbai",
    "trigger_type": "heavy_rainfall",
    "simulate_fraud": true
  }' | python -m json.tool
```

**Expected response:** Face Match (L3) fails, Weather Cross-Validation (L11) shows disagreement, Syndicate Detection (L10) flags coordinated connections, recommendation is `"reject"`.

---

## Layer-by-Layer Walkthrough

### Tier 1: Identity & Registration

#### Layer 1 — Aadhaar Offline XML

**What it does:**  
Validates the UIDAI-issued Offline XML document.

**How it works:**
1. Worker uploads their Aadhaar Offline XML (downloaded from `resident.uidai.gov.in`)
2. System verifies the digital signature using `pyaadhaar` 
3. **Fallback:** If `pyaadhaar` fails, `lxml` parses against UIDAI's published XSD schema
4. **Freshness check:** XML must be ≤3 days old (prevents replay attacks)

**Demo command:**
```bash
curl http://localhost:8000/api/v1/verification/layers
# Layer 1 in the response shows the verification method
```

---

#### Layer 2 — Firebase OTP + MSG91 Fallback

**What it does:**  
Verifies phone number ownership via one-time password.

**How it works:**
1. Firebase Auth sends OTP (free tier: 100 SMS/day)
2. If Firebase limit is hit → falls back to MSG91 (free tier: 100 OTP/month)
3. Phone number is stored as verified in the worker profile

---

#### Layer 3 — Face Match (Selfie vs Aadhaar)

**What it does:**  
Compares a live selfie with the Aadhaar photo.

**How it works:**
1. Worker takes a selfie using the phone camera
2. `face-api.js` runs entirely in-browser (no server upload needed)
3. **Pre-check:** `detectSingleFace()` must return confidence > 0.7
4. **Match:** Euclidean distance between 128-d descriptors must be ≤ 0.5
5. The 0.5 threshold is optimized for the Indian demographic

---

### Tier 2: Location & Activity

#### Layer 4 — GPS Geofence

**What it does:**  
Validates the worker's GPS coordinates against their registered delivery zone.

**How it works:**
1. Browser Geolocation API provides lat/lon
2. Haversine formula calculates distance to zone center
3. Must be within configured radius (default: 5 km)

**Test it directly:**
```bash
# Within zone (Mumbai center)
curl "http://localhost:8000/api/v1/verification/test/gps?lat=19.076&lon=72.877"

# Outside zone (Delhi coordinates for Mumbai zone)
curl "http://localhost:8000/api/v1/verification/test/gps?lat=28.613&lon=77.209"
```

---

#### Layer 5 — Cell Tower Triangulation

**What it does:**  
Cross-checks location using cell tower data (MCC, MNC, LAC, CID).

**How it works:**
1. Phone reports connected cell tower identifiers
2. System queries **OpenCelliD** (primary) + **Mozilla Location Services** (supplement)
3. MCC 404/405 = India, MNC identifies the carrier
4. Database refreshed monthly via background cron job

---

#### Layer 6 — Wi-Fi Fingerprint

**What it does:**  
Validates location using surrounding Wi-Fi access points.

**How it works:**
1. Phone scans nearby BSSIDs (Wi-Fi MAC addresses)
2. Matched against a pre-downloaded WiGLE database
3. WiGLE CSV is refreshed quarterly for commercial zone coverage
4. Chennai, Mumbai, Delhi have the best WiGLE coverage

---

#### Layer 7 — Motion Sensor CNN

**What it does:**  
Classifies worker activity (riding, walking, stationary) from phone sensors.

**How it works:**
1. Accelerometer + gyroscope data is collected via phone sensors
2. TF-Lite model classifies into: `riding`, `walking`, `stationary`
3. Training data: 50–100 real rides from beta workers (not synthetic)
4. Minimum 10 sensor samples required for classification

---

### Tier 3: Platform & Activity

#### Layer 8 — Bank Statement OCR

**What it does:**  
Parses bank statements to verify Swiggy/Zomato payment credits.

**How it works:**
1. Worker uploads bank statement PDF
2. `pikepdf` handles password-protected PDFs (common with Indian banks)
3. `Camelot` extracts tabular data (much better than raw Tesseract for banks)
4. Regex patterns match UPI credits:
   - `swiggy.*upi` / `zomato.*upi`
   - `phonepe.*swiggy` / `gpay.*zomato`

---

#### Layer 9 — Email DKIM Validation

**What it does:**  
Verifies platform onboarding emails (e.g., "Welcome to Swiggy").

**How it works:**
1. Check `DKIM-Signature` header for cryptographic validity
2. If DKIM fails (common with Gmail/Yahoo forwarding) → **SPF fallback**
3. SPF-only gives 75% confidence vs DKIM's 95%

---

### Tier 4: Fraud Detection

#### Layer 10 — Syndicate Detection (NetworkX)

**What it does:**  
Detects coordinated fraud rings using graph analysis.

**How it works:**
1. Worker relationships are modeled as a graph (NetworkX)
2. **Louvain algorithm** detects communities
3. **Temporal edge weighting:** connections created within 6 hours carry **3× weight**
4. Coordinated fraud rings activate simultaneously during weather events
5. Community size ≥ 5 → `fail` (syndicate detected)

---

#### Layer 11 — Multi-Source Weather Validation

**What it does:**  
Cross-validates weather data across multiple free sources.

**How it works:**
1. **Primary:** Open-Meteo (unlimited, free, no API key needed)
2. **Validator:** Indian Meteorological Department (IMD ground truth)
3. **Check:** If `|OpenWeatherMap − Open-Meteo| > 2mm/hr` → manual review flag
4. This prevents workers from exploiting localized weather discrepancies

**Test it directly:**
```bash
# Agreeing sources
curl "http://localhost:8000/api/v1/verification/test/weather?owm_rain=33&ometeo_rain=34.5"

# Disagreeing sources (triggers review)
curl "http://localhost:8000/api/v1/verification/test/weather?owm_rain=33&ometeo_rain=10"
```

---

### Tier 5: Claim-Specific Verification ⭐

#### Layer 12 — Video Proof with GPS Watermark

**What it does:**  
Records a 15-second video as tamper-resistant claim evidence.

**How it works:**
1. `MediaRecorder` API captures 15-second WebM video
2. GPS coordinates burned into metadata (cross-checked with Layer 4)
3. Server timestamp used (not client) to prevent time manipulation
4. Device fingerprint prevents video replay across devices
5. Stored on Supabase Storage (free: 500MB → ~250 videos at 2MB each)
6. Auto-deleted after 30 days via Supabase edge function

**Metadata watermark structure:**
```json
{
  "server_timestamp": "2026-04-07T07:18:00+05:30",
  "gps": { "lat": 19.076, "lon": 72.877 },
  "device_id": "fp_abc123def456"
}
```

---

#### Layer 13 — Multi-Sig Admin Approval

**What it does:**  
Requires multiple admin signatures for high-value claim payouts.

**How it works:**
1. Each admin has a per-admin secret key (stored in environment variables ONLY)
2. Admin signs: `HMAC-SHA256(claim_id:admin_id, secret)`
3. System verifies using `hmac.compare_digest()` (timing-safe)
4. Default requirement: 2 valid signatures to approve

---

#### Layer 14 — Device Fingerprinting (NEW)

**What it does:**  
Prevents multi-account fraud and factory-reset exploits.

**How it works:**
1. FingerprintJS (Open Source) generates browser/device hash
2. Hash tracked per worker account
3. Maximum 3 devices per account
4. Exceeding the limit → `fail` (possible multi-account fraud)
5. Common exploit in India's gig platforms: factory-reset phone → new account

---

## Demo Scenarios

### Scenario 1: Legitimate Heavy Rainfall Claim (Mumbai)

```bash
curl -X POST http://localhost:8000/api/v1/verification/demo \
  -H "Content-Type: application/json" \
  -d '{
    "worker_id": "demo_worker_001",
    "city": "Mumbai",
    "trigger_type": "heavy_rainfall",
    "gps_lat": 19.0760,
    "gps_lon": 72.8777,
    "simulate_fraud": false
  }'
```

**Expected:** 
- Layers L2, L3, L4, L5, L6, L7, L9, L10, L11, L12, L14 → `pass`
- L1, L8, L13 → `skip` (no Aadhaar XML, bank PDF, or signatures in demo)
- Recommendation: `approve`

### Scenario 2: Fraudulent Claim (Spoofed Location, Fake Face)

```bash
curl -X POST http://localhost:8000/api/v1/verification/demo \
  -H "Content-Type: application/json" \
  -d '{
    "worker_id": "demo_worker_001",
    "city": "Mumbai",
    "trigger_type": "heavy_rainfall",
    "simulate_fraud": true
  }'
```

**Expected:**
- L3 (Face Match): `fail` — Euclidean distance exceeds 0.5
- L11 (Weather): `warn` — Sources disagree by >2mm
- L10 (Syndicate): `fail` — 10 coordinated connections detected
- Recommendation: `reject`

### Scenario 3: GPS Boundary Test

```bash
# Just inside zone (4.9 km away)
curl "http://localhost:8000/api/v1/verification/test/gps?lat=19.12&lon=72.92"

# Far outside zone (1200+ km away)
curl "http://localhost:8000/api/v1/verification/test/gps?lat=28.61&lon=77.20"
```

### Scenario 4: Weather Source Disagreement

```bash
# Sources agree (both ~33mm) → pass
curl "http://localhost:8000/api/v1/verification/test/weather?owm_rain=33&ometeo_rain=34"

# Sources disagree (23mm gap) → flag for manual review
curl "http://localhost:8000/api/v1/verification/test/weather?owm_rain=33&ometeo_rain=10"
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/verification/layers` | List all 14 layers with metadata |
| `POST` | `/api/v1/verification/demo` | Run full 14-layer demo verification |
| `GET` | `/api/v1/verification/test/gps` | Test GPS geofence layer individually |
| `GET` | `/api/v1/verification/test/weather` | Test weather cross-validation individually |
| `GET` | `/api/v1/verification/config/status` | Check which API keys are configured |

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     WORKER REGISTRATION                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ L1:      │  │ L2:      │  │ L3:      │                      │
│  │ Aadhaar  │→ │ OTP      │→ │ Face     │ → ✅ Identity OK     │
│  │ XML      │  │ Firebase │  │ Match    │                      │
│  └──────────┘  │ +MSG91   │  │ ≤0.5 ED  │                      │
│                └──────────┘  └──────────┘                      │
├──────────────────────────────────────────────────────────────────┤
│                     CLAIM SUBMISSION                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ L4: GPS  │  │ L5: Cell │  │ L6: WiFi │  │ L7:Motion│       │
│  │ Geofence │→ │ Tower    │→ │ BSSID    │→ │ CNN      │       │
│  │ Haversine│  │ OpenCell │  │ WiGLE    │  │ TF-Lite  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│               ↓                                                  │
│  ┌──────────┐  ┌──────────┐                                    │
│  │ L8: Bank │  │ L9: Email│                                    │
│  │ OCR      │→ │ DKIM/SPF │ → ✅ Activity Verified             │
│  │ Camelot  │  │ dkimpy   │                                    │
│  └──────────┘  └──────────┘                                    │
├──────────────────────────────────────────────────────────────────┤
│                     FRAUD ANALYSIS                               │
│  ┌──────────┐  ┌──────────┐                                    │
│  │ L10:     │  │ L11:     │                                    │
│  │ Syndicate│→ │ Weather  │ → 🔍 Fraud Score                   │
│  │ NetworkX │  │ 3-Source │                                    │
│  └──────────┘  └──────────┘                                    │
├──────────────────────────────────────────────────────────────────┤
│                     PAYOUT VERIFICATION                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ L12:     │  │ L13:     │  │ L14:     │                     │
│  │ Video    │→ │ Multi-Sig│→ │ Device   │ → 💰 Payout          │
│  │ GPS+Time │  │ HMAC-256 │  │ FPrintJS │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
└──────────────────────────────────────────────────────────────────┘

Cost: ₹0/month    Savings: ₹1,53,000/month vs paid APIs
```

---

## Cash Flow Protection

### Weekly Cap (IST Timezone Fix)

The payout weekly cap resets at **00:00 IST Monday**, not UTC:

```python
from zoneinfo import ZoneInfo
IST = ZoneInfo("Asia/Kolkata")
week_start = datetime.now(tz=IST).replace(hour=0, minute=0, second=0, microsecond=0)
```

### Per-Claim Escrow

Fraud reversals operate **per-claim**, not per-worker-account:
- 3 legitimate claims + 1 fraudulent → only the 1 fraudulent is reversed
- Worker keeps the 3 legitimate payouts

---

## Deployment Notes

| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase storage exhaustion (1GB) | Video verification breaks | Auto-delete videos >30 days; compress to 720p |
| Firebase SMS India rate limits | OTP layer fails at scale | MSG91 fallback (free 100/month) |
| OpenCelliD data staleness | False location rejections | Monthly refresh via cron |
| face-api.js model load (~3MB) | Poor UX on 2G | Lazy-load models, cache in IndexedDB |
| WiGLE bulk download ToS | Legal/API issues | Pre-download quarterly, self-host |
