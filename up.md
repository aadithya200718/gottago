# GottaGO: 10-Layered Verification System Upgrade Plan

## Executive Summary

This document outlines the implementation plan to upgrade GottaGO from its current **4-layer verification system** to a comprehensive **10-layer verification system** that addresses GPS spoofing, identity fraud, syndicate attacks, and platform activity verification without requiring direct Swiggy/Zomato API integration.

---

## Current State: 4 Layers

### Layer 1: Input Validation
- Pydantic model validation
- Format checks (phone, worker_id, rating, hours, earnings)

### Layer 2: Business Rule Validation
- Weekly payout caps (max 2 claims/week)
- 55% earnings ceiling
- Duplicate trigger prevention

### Layer 3: Basic Fraud Detection (4 Signals)
- GPS zone validation (string match)
- Multi-worker zone correlation
- Timing anomaly detection
- Duplicate event prevention (hash)

### Layer 4: ML Scoring
- Isolation Forest (untrained)
- Combined fraud score

---

## Target State: 10 Layers

### Layer 1: Identity Verification (NEW)
**Purpose**: Verify worker is a real person with valid identity

**Implementation**:
- Aadhaar eKYC integration via DigiLocker API
- Phone OTP verification (Twilio/MSG91)
- Selfie + Aadhaar photo match (AWS Rekognition or Face++)
- PAN card verification (optional, for tax compliance)

**Fraud Prevention**: Prevents fake accounts, duplicate registrations

---

### Layer 2: Platform Authentication (NEW)
**Purpose**: Verify worker is actually registered with Swiggy/Zomato

**Implementation** (Without Official API):
- **Option A**: Email verification
  - Worker forwards weekly earnings email from Swiggy/Zomato
  - Parse email headers (SPF/DKIM validation)
  - Extract earnings, worker_id, zone from email body
  
- **Option B**: Bank statement verification
  - Worker connects bank account via Account Aggregator (RBI-approved)
  - Verify Swiggy/Zomato deposits match claimed earnings
  - Check deposit frequency (weekly pattern)

- **Option C**: Screenshot + metadata verification
  - Worker uploads screenshot of Swiggy partner app
  - Extract EXIF metadata (timestamp, GPS, device)
  - OCR to extract worker_id, earnings, rating
  - Cross-check with registration data

**Fraud Prevention**: Prevents non-platform workers from registering

---

### Layer 3: GPS Trajectory Analysis (NEW)
**Purpose**: Detect GPS spoofing via movement pattern analysis

**Implementation**:
- Collect GPS pings every 5 minutes during active hours
- Store trajectory: `[(timestamp, lat, lon, speed, accuracy), ...]`
- Analyze patterns:
  - **Velocity check**: Flag if speed >150 km/h (impossible for two-wheeler)
  - **Acceleration check**: Flag if acceleration >5 m/s² (unrealistic)
  - **Micro-drift check**: Real GPS has 3-5m natural drift, spoofed GPS is static
  - **Route plausibility**: Check if path follows roads (Google Maps Roads API)

**Fraud Prevention**: Catches GPS spoofing apps (FakeGPS, Fly GPS)

---

### Layer 4: Cell Tower Triangulation (NEW)
**Purpose**: Cross-verify GPS location with cell tower data

**Implementation**:
- Collect cell tower IDs via Android TelephonyManager API
- Query cell tower location database (OpenCelliD, Mozilla Location Service)
- Compare cell tower location with claimed GPS location
- Flag if distance >3km (indicates GPS spoofing)

**Fraud Prevention**: GPS spoofers cannot fake cell tower connections

---

### Layer 5: Wi-Fi BSSID Environment Check (NEW)
**Purpose**: Verify worker is in commercial delivery zone, not residential area

**Implementation**:
- Scan visible Wi-Fi BSSIDs (MAC addresses) at trigger time
- Query Wi-Fi geolocation database (Google Geolocation API, WiGLE)
- Classify environment:
  - **Commercial**: Multiple SSIDs (restaurants, malls, offices)
  - **Residential**: Few SSIDs (home routers like "Jio-Fiber-XXXX")
- Flag if residential environment during claimed delivery hours

**Fraud Prevention**: Catches workers claiming from home

---

### Layer 6: Motion Sensor Verification (NEW)
**Purpose**: Verify worker is actually riding/moving, not stationary

**Implementation**:
- Collect 30-second accelerometer + gyroscope burst at trigger time
- Analyze motion signature:
  - **Riding pattern**: Continuous vibration (engine), tilt changes (turns)
  - **Stationary pattern**: Flat readings, no vibration
- Train CNN classifier on labeled motion data
- Flag if motion signature is "stationary" during claimed active hours

**Fraud Prevention**: Catches workers claiming while sitting at home

---

### Layer 7: Platform Activity Correlation (NEW)
**Purpose**: Verify worker was actually working during trigger window

**Implementation** (Without Official API):
- **Option A**: Order completion timestamps
  - Worker uploads screenshots of completed orders
  - Extract timestamps, order IDs, delivery addresses
  - Verify timestamps overlap with trigger window
  
- **Option B**: Earnings pattern analysis
  - Compare claimed earnings with historical baseline
  - Flag if earnings spike only on trigger days (gaming the system)
  - Check if earnings drop on non-trigger days (suspicious)

- **Option C**: Peer verification
  - Cross-check with other workers in same zone
  - If 10 workers claim trigger but 1 worker shows normal earnings, flag the 1

**Fraud Prevention**: Prevents claiming without actual work

---

### Layer 8: Syndicate Detection (NEW)
**Purpose**: Detect coordinated fraud rings

**Implementation**:
- **Temporal clustering**: Flag if 50+ claims arrive within 15-minute burst
- **Device fingerprinting**: Flag if 5+ workers share same device model + OS build
- **IP clustering**: Flag if 3+ workers share same IP subnet
- **Social graph analysis**: Build co-claim adjacency graph, detect communities
  - Use Louvain algorithm to find tightly connected groups
  - Flag if same 10+ workers co-claim in 3+ separate events (Jaccard >0.7)
- **Onboarding velocity**: Flag if 50+ registrations in same zone within 48 hours
- **Payout destination clustering**: Flag if 3+ workers route to same UPI ID

**Fraud Prevention**: Catches organized fraud rings (Telegram groups)

---

### Layer 9: Multi-Source Weather Validation (NEW)
**Purpose**: Prevent false triggers from single API errors

**Implementation**:
- Query 3 independent weather sources:
  - **Source 1**: OpenWeatherMap (current)
  - **Source 2**: IMD (India Meteorological Department) gridded data
  - **Source 3**: Open-Meteo (free, no API key)
- Require 2-of-3 consensus for trigger activation
- Flag if sources disagree by >20% (API error or localized event)

**Fraud Prevention**: Prevents false triggers, reduces payout errors

---

### Layer 10: Behavioral Anomaly Detection (NEW)
**Purpose**: Catch sophisticated fraud patterns ML models miss

**Implementation**:
- Track per-worker behavioral metrics:
  - Claim frequency vs zone average
  - Claim timing (always during peak hours? suspicious)
  - Earnings volatility (stable baseline but spikes on trigger days?)
  - Registration recency (new accounts claiming immediately?)
  - Device changes (switching devices frequently?)
- Train Isolation Forest on 20+ behavioral features
- Flag if anomaly score >0.85
- Human review for flagged cases

**Fraud Prevention**: Catches adaptive fraud (workers who learn to bypass rules)

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- **Week 1**: Identity verification (Aadhaar eKYC + OTP)
- **Week 2**: Platform authentication (email/bank statement)
- **Week 3**: GPS trajectory analysis
- **Week 4**: Cell tower triangulation

**Deliverable**: Layers 1-4 operational

---

### Phase 2: Advanced Sensors (Weeks 5-8)
- **Week 5**: Wi-Fi BSSID environment check
- **Week 6**: Motion sensor verification (CNN training)
- **Week 7**: Platform activity correlation
- **Week 8**: Integration testing

**Deliverable**: Layers 5-7 operational

---

### Phase 3: Syndicate Defense (Weeks 9-12)
- **Week 9**: Syndicate detection (graph analysis)
- **Week 10**: Multi-source weather validation
- **Week 11**: Behavioral anomaly detection
- **Week 12**: Full system testing + tuning

**Deliverable**: Layers 8-10 operational, full 10-layer system live

---

## Technical Architecture

### Data Collection Layer
```python
# backend/services/verification_service.py

class VerificationDataCollector:
    async def collect_identity_data(self, worker_id: str) -> dict:
        """Layer 1: Aadhaar, OTP, selfie"""
        
    async def collect_platform_data(self, worker_id: str) -> dict:
        """Layer 2: Email, bank statement, screenshots"""
        
    async def collect_gps_trajectory(self, worker_id: str, duration_mins: int) -> list:
        """Layer 3: GPS pings with speed, accuracy"""
        
    async def collect_cell_tower_data(self, worker_id: str) -> dict:
        """Layer 4: Cell tower IDs and locations"""
        
    async def collect_wifi_bssids(self, worker_id: str) -> list:
        """Layer 5: Visible Wi-Fi networks"""
        
    async def collect_motion_data(self, worker_id: str, duration_secs: int) -> dict:
        """Layer 6: Accelerometer + gyroscope readings"""
        
    async def collect_activity_data(self, worker_id: str) -> dict:
        """Layer 7: Order timestamps, earnings pattern"""
```

### Verification Engine
```python
# backend/services/verification_engine.py

class TenLayerVerificationEngine:
    async def verify_claim(self, claim_id: str) -> dict:
        """Run all 10 verification layers"""
        results = {}
        
        # Layer 1: Identity
        results['identity'] = await self.verify_identity(claim_id)
        
        # Layer 2: Platform
        results['platform'] = await self.verify_platform_auth(claim_id)
        
        # Layer 3: GPS Trajectory
        results['gps_trajectory'] = await self.verify_gps_trajectory(claim_id)
        
        # Layer 4: Cell Tower
        results['cell_tower'] = await self.verify_cell_tower(claim_id)
        
        # Layer 5: Wi-Fi BSSID
        results['wifi_environment'] = await self.verify_wifi_environment(claim_id)
        
        # Layer 6: Motion Sensor
        results['motion_signature'] = await self.verify_motion_signature(claim_id)
        
        # Layer 7: Platform Activity
        results['platform_activity'] = await self.verify_platform_activity(claim_id)
        
        # Layer 8: Syndicate Detection
        results['syndicate_check'] = await self.detect_syndicate(claim_id)
        
        # Layer 9: Multi-Source Weather
        results['weather_consensus'] = await self.verify_weather_consensus(claim_id)
        
        # Layer 10: Behavioral Anomaly
        results['behavioral_anomaly'] = await self.detect_behavioral_anomaly(claim_id)
        
        # Aggregate score
        confidence_score = self.calculate_confidence(results)
        recommendation = self.get_recommendation(confidence_score)
        
        return {
            'claim_id': claim_id,
            'confidence_score': confidence_score,
            'recommendation': recommendation,  # approve, review, reject
            'layer_results': results,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
```

---

## Database Schema Updates

### New Tables

```sql
-- GPS trajectory storage
CREATE TABLE gps_trajectories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id),
  timestamp TIMESTAMPTZ NOT NULL,
  lat NUMERIC(10,6) NOT NULL,
  lon NUMERIC(10,6) NOT NULL,
  speed_kmh NUMERIC(5,2),
  accuracy_meters NUMERIC(5,2),
  altitude_meters NUMERIC(6,2),
  bearing_degrees NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gps_worker_time ON gps_trajectories(worker_id, timestamp);

-- Cell tower data
CREATE TABLE cell_tower_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id),
  timestamp TIMESTAMPTZ NOT NULL,
  cell_id TEXT NOT NULL,
  lac TEXT,
  mcc TEXT,
  mnc TEXT,
  signal_strength INTEGER,
  tower_lat NUMERIC(10,6),
  tower_lon NUMERIC(10,6),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Wi-Fi BSSID scans
CREATE TABLE wifi_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id),
  timestamp TIMESTAMPTZ NOT NULL,
  bssid TEXT NOT NULL,
  ssid TEXT,
  signal_strength INTEGER,
  frequency_mhz INTEGER,
  environment_type TEXT, -- 'commercial', 'residential', 'unknown'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Motion sensor data
CREATE TABLE motion_sensor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id),
  timestamp TIMESTAMPTZ NOT NULL,
  accelerometer_x NUMERIC(8,4),
  accelerometer_y NUMERIC(8,4),
  accelerometer_z NUMERIC(8,4),
  gyroscope_x NUMERIC(8,4),
  gyroscope_y NUMERIC(8,4),
  gyroscope_z NUMERIC(8,4),
  motion_classification TEXT, -- 'riding', 'walking', 'stationary'
  confidence_score NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Identity verification
CREATE TABLE identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id),
  aadhaar_hash TEXT, -- hashed Aadhaar number
  aadhaar_verified BOOLEAN DEFAULT false,
  aadhaar_verified_at TIMESTAMPTZ,
  phone_verified BOOLEAN DEFAULT false,
  phone_verified_at TIMESTAMPTZ,
  selfie_match_score NUMERIC(3,2), -- face match confidence
  pan_verified BOOLEAN DEFAULT false,
  verification_status TEXT, -- 'pending', 'verified', 'rejected'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Platform authentication
CREATE TABLE platform_authentications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id),
  auth_method TEXT, -- 'email', 'bank_statement', 'screenshot'
  platform TEXT, -- 'swiggy', 'zomato'
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verification_data JSONB, -- stores parsed email/statement data
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Syndicate detection
CREATE TABLE syndicate_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_type TEXT NOT NULL, -- 'temporal_cluster', 'device_cluster', 'ip_cluster', 'social_graph'
  worker_ids UUID[] NOT NULL,
  severity TEXT, -- 'low', 'medium', 'high', 'critical'
  details_json JSONB,
  flagged_at TIMESTAMPTZ DEFAULT now()
);

-- Verification audit log
CREATE TABLE verification_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id),
  layer_number INTEGER NOT NULL, -- 1-10
  layer_name TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  confidence_score NUMERIC(3,2),
  details_json JSONB,
  checked_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Mobile App Changes

### Android SDK Requirements

```kotlin
// Required permissions in AndroidManifest.xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />

// Data collection service
class VerificationDataService {
    fun collectGPSTrajectory(): List<GPSPoint>
    fun collectCellTowerData(): CellTowerInfo
    fun collectWiFiBSSIDs(): List<WiFiNetwork>
    fun collectMotionSensorData(): MotionData
}
```

---

## Cost Estimates

### API Costs (Monthly for 10,000 workers)

| Service | Usage | Cost |
|---------|-------|------|
| DigiLocker (Aadhaar eKYC) | 10,000 verifications | ₹50,000 (₹5/verification) |
| Twilio OTP | 10,000 OTPs | ₹10,000 (₹1/OTP) |
| AWS Rekognition (Face match) | 10,000 comparisons | ₹8,000 ($0.10/comparison) |
| Google Geolocation API (Wi-Fi) | 50,000 requests | ₹20,000 ($0.005/request) |
| Google Maps Roads API (GPS) | 50,000 requests | ₹40,000 ($0.01/request) |
| Account Aggregator (Bank) | 5,000 consents | ₹25,000 (₹5/consent) |
| **Total Monthly** | | **₹153,000** |

**Per Worker Per Month**: ₹15.30

---

## Success Metrics

### Fraud Reduction Targets

| Metric | Current | Target (10 Layers) |
|--------|---------|-------------------|
| False positive rate | Unknown | <5% |
| GPS spoofing detection | 0% | >95% |
| Syndicate detection | 0% | >80% |
| Identity fraud prevention | 0% | >99% |
| Claim approval time | 2 hours | <30 minutes |
| Manual review rate | 100% | <10% |

---

## Risk Mitigation

### Privacy Concerns
- **Issue**: Collecting GPS, cell tower, Wi-Fi, motion data is invasive
- **Mitigation**: 
  - Explicit consent during onboarding
  - Data retention: 90 days only
  - Anonymization for ML training
  - DPDPA compliance audit

### False Positives
- **Issue**: Legitimate workers flagged due to edge cases
- **Mitigation**:
  - Graduated response (soft hold vs hard reject)
  - Human review for borderline cases
  - Appeal process with 24-hour SLA

### Technical Failures
- **Issue**: GPS/cell tower/Wi-Fi unavailable during storms
- **Mitigation**:
  - Adaptive thresholds (reduce weight of unavailable signals)
  - Fallback to available layers only
  - Never auto-reject on missing data

---

## Conclusion

Upgrading from 4 to 10 verification layers will:
- Reduce fraud by 80-90%
- Enable straight-through processing for 90% of legitimate claims
- Prevent GPS spoofing, identity fraud, and syndicate attacks
- Maintain <5% false positive rate
- Cost ₹15/worker/month (affordable within ₹159/week premium)

**Next Step**: Review this plan, approve budget, and begin Phase 1 implementation.

---

**Document Version**: 1.0  
**Created**: 2026-04-07  
**Author**: Kiro AI Assistant
