# GottaGO Phase 2 - Requirements Document

## Project Overview

**Project Name:** GottaGO - Weekly Income Protection for Food Delivery Partners  
**Hackathon:** Guidewire DEVTrails 2026  
**Deadline:** April 4, 2026  
**Phase 2 Theme:** "Protect Your Worker"

GottaGO is a weekly income protection product for food delivery partners (Swiggy/Zomato). It automatically pays workers when verified external disruptions (heavy rain, extreme heat, severe AQI, government bandh) destroy their earning day. Zero paperwork, zero claim forms.

## Phase 2 Mandatory Deliverables

1. Registration Process
2. Insurance Policy Management
3. Dynamic Premium Calculation (with AI/ML)
4. Claims Management

## Technology Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + Shadcn UI
- **Backend:** Python FastAPI
- **Database:** PostgreSQL via Supabase (free tier)
- **ML:** XGBoost (premium pricing), scikit-learn Isolation Forest (fraud detection)
- **Maps:** Leaflet.js + OpenStreetMap (free, no API key)
- **Hosting:** Vercel (free tier)

## External Integrations

### Real APIs (Actual External Calls)
- **[REAL API]** OpenWeatherMap One Call 3.0 (rain, temperature, feels_like) - free tier 1000 calls/day
- **[REAL API]** WAQI API from aqicn.org (AQI data) - free tier
- **[REAL API]** Razorpay Sandbox (payment simulation) - free test mode
- **[REAL API]** Supabase (database) - free tier

### Mocked/Simulated Integrations
- **[MOCK/SIMULATED]** Guidewire InsuranceSuite (PolicyCenter, ClaimCenter, BillingCenter) - simulated with database tables, maps to Guidewire APIs in production
- **[MOCK/SIMULATED]** Swiggy/Zomato partner API (worker GPS, order count, earnings) - realistic fake worker data stored in database
- **[MOCK/SIMULATED]** NDMA/Government bandh alerts - seeded disruption events with admin trigger button
- **[MOCK/SIMULATED]** Worker GPS location - workers select city+zone from dropdown, zone lat/lon used for trigger matching
- **[MOCK/SIMULATED]** UPI payout - Razorpay Sandbox test mode, no real money transfer

## User Roles

### 1. Delivery Worker (Primary User)
- Registers for insurance coverage
- Views policy details and coverage
- Sees premium breakdown with contributing factors
- Receives automatic payouts when triggers fire
- Gets SmartShift advisories for risk-prone time windows

### 2. Insurance Admin (Secondary User)
- Views claims dashboard with analytics
- Monitors fraud heatmap
- Reviews predictive claims forecast
- Receives reserve recommendations

## Functional Requirements

### 1. Registration Process

#### FR-1.1: Worker Registration Form
**Priority:** P0 (Must Have)

**User Story:**  
As a delivery worker, I want to register for GottaGO coverage by providing my basic details, so that I can protect my weekly income from disruptions.

**Acceptance Criteria:**
- Form collects: full name, phone number, platform (Swiggy/Zomato), city, zone, worker ID, platform rating (1-5), average weekly hours, baseline weekly earnings
- **[MOCK/SIMULATED]** City and zone selection from predefined dropdown (Mumbai, Delhi, Bengaluru with zones)
- Phone number validation (10 digits, Indian format)
- Worker ID validation (alphanumeric, 6-12 characters)
- Platform rating validation (1.0 to 5.0)
- Weekly hours validation (10-80 hours)
- Baseline earnings validation (Rs.1000-Rs.15000)
- Form submission creates worker record and auto-generates policy
- Success message displays calculated weekly premium
- Mobile-responsive design with large touch targets

**Data Requirements:**
- `workers` table: id, name, phone, platform, city, zone, worker_id, rating, avg_weekly_hours, baseline_weekly_earnings, created_at, updated_at

**API Endpoint:**
- `POST /api/v1/workers/register`
- Request: `{ name, phone, platform, city, zone, worker_id, rating, avg_weekly_hours, baseline_weekly_earnings }`
- Response: `{ worker_id, policy_id, weekly_premium, status: "success" }`

#### FR-1.2: Zone Risk Data Seeding
**Priority:** P0 (Must Have)

**User Story:**  
As the system, I need pre-seeded zone risk data, so that premium calculations can factor in hyper-local flood and AQI risk scores.

**Acceptance Criteria:**
- **[MOCK/SIMULATED]** Database contains zone records for Mumbai, Delhi, Bengaluru
- Each zone has: zone_id, city, zone_name, lat, lon, flood_risk_score (0-1), aqi_risk_score (0-1)
- Flood risk based on historical monsoon data patterns
- AQI risk based on seasonal pollution patterns
- Minimum 5 zones per city

**Data Requirements:**
- `disruption_zones` table: id, city, zone_name, lat, lon, flood_risk_score, aqi_risk_score

### 2. Insurance Policy Management

#### FR-2.1: Auto-Policy Creation
**Priority:** P0 (Must Have)

**User Story:**  
As a delivery worker, I want my insurance policy to be automatically created when I register, so that I don't have to fill out additional forms.

**Acceptance Criteria:**
- Policy auto-created immediately after worker registration
- Policy includes: policy_number (unique), worker_id, start_date (today), end_date (7 days), status (active), weekly_premium, coverage_amount
- **[MOCK/SIMULATED]** Maps to Guidewire PolicyCenter policy lifecycle
- Coverage amount = 55% of worker's 4-week rolling baseline earnings
- Policy number format: GS-{YEAR}-{CITY_CODE}-{6_DIGIT_RANDOM}

**Data Requirements:**
- `policies` table: id, policy_number, worker_id, start_date, end_date, status, weekly_premium, coverage_amount, created_at, updated_at

**API Endpoint:**
- `POST /api/v1/policies/create`
- Request: `{ worker_id, weekly_premium, coverage_amount }`
- Response: `{ policy_id, policy_number, start_date, end_date, status }`

#### FR-2.2: Policy Dashboard View
**Priority:** P0 (Must Have)

**User Story:**  
As a delivery worker, I want to view my current policy details on a dashboard, so that I understand my coverage and premium.

**Acceptance Criteria:**
- Dashboard displays: policy number, coverage period, weekly premium, coverage amount, status
- Shows next renewal date
- Displays active claims count and total payout received
- **[MOCK/SIMULATED]** Shows "Guidewire Integration" badge indicating PolicyCenter mapping
- Mobile-first responsive design
- Dark theme by default

**API Endpoint:**
- `GET /api/v1/policies/{worker_id}`
- Response: `{ policy_number, start_date, end_date, weekly_premium, coverage_amount, status, active_claims_count, total_payout }`

#### FR-2.3: Policy Renewal
**Priority:** P1 (Should Have)

**User Story:**  
As a delivery worker, I want my policy to auto-renew weekly, so that I maintain continuous coverage.

**Acceptance Criteria:**
- Policy auto-renews 24 hours before expiry
- New premium calculated based on updated risk factors
- Worker receives notification of renewal and new premium
- **[MOCK/SIMULATED]** Renewal triggers Guidewire BillingCenter premium collection simulation
- Worker can pause/resume policy from dashboard

**API Endpoint:**
- `POST /api/v1/policies/{policy_id}/renew`
- Response: `{ policy_id, new_end_date, new_premium, status }`

### 3. Dynamic Premium Calculation (with AI/ML)

#### FR-3.1: XGBoost Premium Model
**Priority:** P0 (Must Have)

**User Story:**  
As the system, I need to calculate personalized weekly premiums using ML, so that pricing reflects hyper-local risk factors.

**Acceptance Criteria:**
- XGBoost model trained on synthetic data initially
- 7 input features: city (one-hot encoded), month (1-12), worker_weekly_baseline_inr, zone_flood_risk_score (0-1), zone_aqi_risk_score (0-1), platform_rating (1-5), avg_weekly_hours_logged
- Output: multiplier (0.5 to 2.0) applied to base premium (Rs.159/week)
- Result range: Rs.80 to Rs.318/week
- Affordability ceiling: premium must stay below 3% of worker's weekly earnings
- Model retrained weekly as real claims data accumulates
- Model artifacts stored in `/backend/ml/models/`

**Data Requirements:**
- `premium_history` table: id, worker_id, policy_id, calculated_premium, base_premium, multiplier, features_json, calculated_at

**API Endpoint:**
- `POST /api/v1/premiums/calculate`
- Request: `{ worker_id, city, month, baseline_earnings, zone_flood_risk, zone_aqi_risk, rating, avg_hours }`
- Response: `{ weekly_premium, base_premium, multiplier, breakdown }`

#### FR-3.2: Premium Breakdown Visualization
**Priority:** P0 (Must Have)

**User Story:**  
As a delivery worker, I want to see how each factor affects my premium, so that I understand why I'm paying a certain amount.

**Acceptance Criteria:**
- Visual breakdown shows contribution of each factor: city risk, seasonal risk, zone flood risk, zone AQI risk, worker rating, hours logged
- Each factor displayed as a horizontal bar or slider
- Color-coded: green (reduces premium), yellow (neutral), red (increases premium)
- Shows base premium and final premium with multiplier applied
- Mobile-friendly touch interactions

**API Endpoint:**
- `GET /api/v1/premiums/{worker_id}/breakdown`
- Response: `{ base_premium, final_premium, multiplier, factors: [{ name, contribution, color }] }`

### 4. Claims Management

#### FR-4.1: Parametric Trigger Detection
**Priority:** P0 (Must Have)

**User Story:**  
As the system, I need to continuously monitor weather and AQI conditions, so that I can automatically detect disruption events and trigger claims.

**Acceptance Criteria:**
- System polls APIs every 15 minutes during peak hours (6am-11pm)
- **[REAL API]** OpenWeatherMap One Call 3.0 for rain and temperature data
- **[REAL API]** WAQI API for AQI data
- **[MOCK/SIMULATED]** Government bandh events seeded in database with admin trigger button

**5 Parametric Triggers:**

1. **Heavy Rainfall Trigger**
   - Condition: >30mm cumulative rainfall in 3 hours in worker's zone
   - Source: **[REAL API]** OpenWeatherMap
   - Payout: Rs.300
   - Validation: Worker must be in affected zone (4km tolerance)

2. **Extreme Heat Trigger**
   - Condition: feels_like >43°C for 3+ consecutive hours between 11am-4pm
   - Source: **[REAL API]** OpenWeatherMap
   - Payout: Rs.360
   - Validation: Worker must be active during trigger window

3. **Severe AQI Trigger**
   - Condition: AQI >400 for 4+ consecutive hours, 2+ monitoring stations
   - Source: **[REAL API]** WAQI API
   - Payout: Rs.240
   - Validation: Worker's zone must have affected stations

4. **Government Bandh Trigger**
   - Condition: State/district curfew covering worker's city for 3+ hours
   - Source: **[MOCK/SIMULATED]** Seeded disruption events
   - Payout: Rs.480
   - Validation: Worker's city must match bandh location

5. **Compound Disruption Score Trigger**
   - Condition: Combined score >7.0 for 2+ hours when no single trigger fires
   - Source: Composite calculation (weather + AQI + traffic factors)
   - Payout: Rs.300
   - Calculation: `score = (rain_intensity * 2.5) + (temp_deviation * 1.8) + (aqi_level * 2.0) + (traffic_index * 1.5)`

**Data Requirements:**
- `trigger_events` table: id, trigger_type, zone_id, timestamp, duration_hours, intensity_value, source_api, affected_workers_count, created_at

**API Endpoints:**
- `GET /api/v1/triggers/check` - Check current conditions for all zones
- `POST /api/v1/triggers/fire` - Manually fire a trigger (admin/testing)
- `GET /api/v1/triggers/history` - Get trigger history

#### FR-4.2: Auto-Claims Pipeline
**Priority:** P0 (Must Have)

**User Story:**  
As a delivery worker, I want claims to be automatically created and processed when a trigger fires, so that I receive payouts without filing paperwork.

**Acceptance Criteria:**
- Claim auto-created within 5 minutes of trigger confirmation
- Claim includes: claim_number, worker_id, policy_id, trigger_type, trigger_timestamp, payout_amount, status (pending/approved/rejected/paid)
- **[MOCK/SIMULATED]** Maps to Guidewire ClaimCenter adjudication workflow
- Fraud checks run automatically before approval
- Approved claims trigger payout simulation within 2 hours
- Claim number format: CL-{YEAR}-{TRIGGER_CODE}-{8_DIGIT_RANDOM}

**Cap Rules:**
- Max 2 trigger payouts per worker per week
- Weekly payout ceiling: 55% of worker's 4-week rolling earnings baseline
- Overlapping triggers: only higher-value trigger fires
- Activity requirement: worker must have been active in 2 hours before trigger

**Data Requirements:**
- `claims` table: id, claim_number, worker_id, policy_id, trigger_type, trigger_timestamp, payout_amount, status, fraud_flags, approved_at, paid_at, created_at

**API Endpoints:**
- `POST /api/v1/claims/auto-create` - Auto-create claim from trigger
- `GET /api/v1/claims/{worker_id}` - Get worker's claims
- `GET /api/v1/claims/{claim_id}/detail` - Get claim details

#### FR-4.3: Fraud Detection System
**Priority:** P0 (Must Have)

**User Story:**  
As the insurance admin, I need automated fraud detection, so that only legitimate claims are paid out.

**Acceptance Criteria:**
- 4 fraud detection signals run before every payout:

1. **GPS Zone Validation**
   - Worker's registered zone must overlap with trigger zone
   - 4km tolerance radius
   - Flag if worker is outside affected area

2. **Multi-Worker Zone Correlation**
   - If only 1 of N workers in a zone claims but others show normal order activity, flag it
   - Requires minimum 3 workers in zone for correlation
   - **[MOCK/SIMULATED]** Order activity data generated from worker baseline

3. **Timing Anomaly Detection**
   - Claims filed >3 hours after trigger window closes are flagged
   - Claims filed before trigger starts are flagged
   - Timestamp validation against trigger event

4. **Duplicate Event Prevention**
   - SHA256 hash of (trigger_type + zone_id + timestamp_window)
   - One payout per hash per worker
   - Prevents double-claiming same event

**Data Requirements:**
- `fraud_flags` table: id, claim_id, flag_type, severity (low/medium/high), details_json, flagged_at

**API Endpoint:**
- `POST /api/v1/claims/{claim_id}/fraud-check`
- Response: `{ claim_id, fraud_score, flags: [{ type, severity, details }], recommendation: "approve/review/reject" }`

#### FR-4.4: Payout Simulation
**Priority:** P0 (Must Have)

**User Story:**  
As a delivery worker, I want to receive my payout quickly after a claim is approved, so that I can cover my lost income.

**Acceptance Criteria:**
- **[MOCK/SIMULATED]** Razorpay Sandbox integration for UPI payout simulation
- Payout triggered within 2 hours of claim approval
- Worker receives notification with payout amount and transaction ID
- Payout status tracked: initiated, processing, completed, failed
- Failed payouts retry 3 times with exponential backoff

**API Endpoint:**
- `POST /api/v1/claims/{claim_id}/payout`
- Request: `{ claim_id, amount, worker_phone }`
- Response: `{ transaction_id, status, timestamp }`

#### FR-4.5: Claims Timeline UI
**Priority:** P0 (Must Have)

**User Story:**  
As a delivery worker, I want to see the status of my claims in a timeline view, so that I know when to expect my payout.

**Acceptance Criteria:**
- WhatsApp-style notification cards for each claim
- Timeline shows: trigger detected → claim created → fraud checks → approved → payout initiated → payout completed
- Each stage has timestamp and status icon
- Shows trigger reason with weather/AQI data snapshot
- Shows payout amount prominently
- Mobile-responsive with smooth transitions

### 5. Admin Dashboard Features

#### FR-5.1: Predictive Claims Forecast
**Priority:** P1 (Should Have)

**User Story:**  
As an insurance admin, I want to see a forecast of expected claims for the next 7 days, so that I can prepare reserves.

**Acceptance Criteria:**
- **[REAL API]** Uses OpenWeatherMap 7-day forecast
- Predicts trigger probability for each day
- Estimates potential claims count and payout amount
- Shows confidence intervals
- Updates every 6 hours

**API Endpoint:**
- `GET /api/v1/admin/claims-forecast`
- Response: `{ forecast: [{ date, rain_trigger_prob, heat_trigger_prob, aqi_trigger_prob, estimated_claims, estimated_payout }] }`

#### FR-5.2: Fraud Risk Heatmap
**Priority:** P1 (Should Have)

**User Story:**  
As an insurance admin, I want to see a geographic heatmap of fraud risk, so that I can identify high-risk zones.

**Acceptance Criteria:**
- Leaflet.js map with OpenStreetMap tiles (no API key required)
- Zones color-coded by fraud score: green (low), yellow (medium), red (high)
- Click zone to see fraud details: flagged claims count, fraud types, worker list
- Isolation Forest model calculates zone-level fraud scores
- Updates daily

**API Endpoint:**
- `GET /api/v1/admin/fraud-heatmap`
- Response: `{ zones: [{ zone_id, lat, lon, fraud_score, flagged_claims_count, details }] }`

#### FR-5.3: Reserve Recommendations
**Priority:** P1 (Should Have)

**User Story:**  
As an insurance admin, I want reserve recommendations based on predicted claims, so that I maintain adequate capital.

**Acceptance Criteria:**
- Calculates required reserves: (predicted_claims * avg_payout * 1.2 safety_margin)
- Shows current reserve balance vs required
- Traffic-light indicator: green (sufficient), yellow (borderline), red (insufficient)
- Recommendations update daily

**API Endpoint:**
- `GET /api/v1/admin/reserves`
- Response: `{ current_balance, required_reserves, safety_margin, status, recommendation }`

## Non-Functional Requirements

### NFR-1: Performance
- API response time <500ms for 95th percentile
- Premium calculation <200ms
- Trigger detection cycle completes in <60 seconds
- Database queries optimized with indexes on worker_id, policy_id, zone_id, timestamp
- Frontend initial load <3 seconds on 3G connection

### NFR-2: Security
- All API endpoints require authentication (JWT tokens)
- Worker phone numbers hashed in database
- Razorpay API keys stored in environment variables, never committed
- HTTPS only in production
- Rate limiting: 100 requests/minute per IP
- SQL injection prevention via parameterized queries

### NFR-3: Accessibility
- WCAG 2.1 AA compliance target (manual testing required for full validation)
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Touch targets minimum 44x44px
- Hindi + English language toggle

### NFR-4: Scalability
- Supabase free tier supports up to 500MB database
- Vercel free tier supports 100GB bandwidth/month
- OpenWeatherMap free tier: 1000 calls/day (sufficient for 15-min polling of 3 cities)
- WAQI free tier: unlimited calls with rate limiting
- Architecture supports horizontal scaling for production

### NFR-5: Reliability
- 99% uptime target for hackathon demo period
- Graceful degradation if external APIs fail (use cached data)
- Retry logic for failed API calls (3 retries with exponential backoff)
- Database backups via Supabase automatic backups

### NFR-6: Usability
- Mobile-first design (80% of users on mobile)
- Dark theme by default (reduces eye strain for night deliveries)
- Large touch targets (workers wear gloves, have wet hands)
- Minimal text input (use dropdowns and sliders)
- WhatsApp-style familiar UI patterns
- Loading states for all async operations

## Data Model Requirements

### Database Schema

#### Table: `workers`
```sql
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL UNIQUE, -- hashed
  platform VARCHAR(50) NOT NULL, -- 'Swiggy' or 'Zomato'
  city VARCHAR(100) NOT NULL,
  zone VARCHAR(100) NOT NULL,
  worker_id VARCHAR(50) NOT NULL UNIQUE,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
  avg_weekly_hours INTEGER NOT NULL CHECK (avg_weekly_hours >= 10 AND avg_weekly_hours <= 80),
  baseline_weekly_earnings INTEGER NOT NULL CHECK (baseline_weekly_earnings >= 1000 AND baseline_weekly_earnings <= 15000),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workers_zone ON workers(zone);
CREATE INDEX idx_workers_city ON workers(city);
```

#### Table: `policies`
```sql
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_number VARCHAR(50) NOT NULL UNIQUE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'paused', 'expired'
  weekly_premium INTEGER NOT NULL,
  coverage_amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_policies_worker ON policies(worker_id);
CREATE INDEX idx_policies_status ON policies(status);
```

#### Table: `claims`
```sql
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number VARCHAR(50) NOT NULL UNIQUE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  trigger_type VARCHAR(50) NOT NULL, -- 'rain', 'heat', 'aqi', 'bandh', 'compound'
  trigger_timestamp TIMESTAMP NOT NULL,
  payout_amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'paid'
  fraud_score DECIMAL(3,2) DEFAULT 0.0,
  approved_at TIMESTAMP,
  paid_at TIMESTAMP,
  transaction_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_claims_worker ON claims(worker_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_trigger_timestamp ON claims(trigger_timestamp);
```

#### Table: `premium_history`
```sql
CREATE TABLE premium_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  calculated_premium INTEGER NOT NULL,
  base_premium INTEGER NOT NULL DEFAULT 159,
  multiplier DECIMAL(3,2) NOT NULL,
  features_json JSONB NOT NULL, -- stores all 7 input features
  calculated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_premium_history_worker ON premium_history(worker_id);
```

#### Table: `trigger_events`
```sql
CREATE TABLE trigger_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type VARCHAR(50) NOT NULL,
  zone_id VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  duration_hours DECIMAL(4,2) NOT NULL,
  intensity_value DECIMAL(6,2) NOT NULL, -- rain in mm, temp in C, AQI value, etc.
  source_api VARCHAR(50) NOT NULL, -- 'openweathermap', 'waqi', 'mock_bandh', 'compound'
  affected_workers_count INTEGER DEFAULT 0,
  event_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA256 for duplicate prevention
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trigger_events_zone ON trigger_events(zone_id);
CREATE INDEX idx_trigger_events_timestamp ON trigger_events(timestamp);
CREATE INDEX idx_trigger_events_hash ON trigger_events(event_hash);
```

#### Table: `disruption_zones`
```sql
CREATE TABLE disruption_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city VARCHAR(100) NOT NULL,
  zone_name VARCHAR(100) NOT NULL,
  lat DECIMAL(9,6) NOT NULL,
  lon DECIMAL(9,6) NOT NULL,
  flood_risk_score DECIMAL(3,2) NOT NULL CHECK (flood_risk_score >= 0 AND flood_risk_score <= 1),
  aqi_risk_score DECIMAL(3,2) NOT NULL CHECK (aqi_risk_score >= 0 AND aqi_risk_score <= 1),
  UNIQUE(city, zone_name)
);

CREATE INDEX idx_zones_city ON disruption_zones(city);
```

#### Table: `fraud_flags`
```sql
CREATE TABLE fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  flag_type VARCHAR(50) NOT NULL, -- 'gps_mismatch', 'zone_correlation', 'timing_anomaly', 'duplicate_event'
  severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high'
  details_json JSONB NOT NULL,
  flagged_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fraud_flags_claim ON fraud_flags(claim_id);
CREATE INDEX idx_fraud_flags_severity ON fraud_flags(severity);
```

## API Endpoint Requirements

### Worker Endpoints

#### `POST /api/v1/workers/register`
**Description:** Register a new delivery worker  
**Authentication:** None (public endpoint)  
**Request Body:**
```json
{
  "name": "string",
  "phone": "string",
  "platform": "Swiggy" | "Zomato",
  "city": "string",
  "zone": "string",
  "worker_id": "string",
  "rating": number,
  "avg_weekly_hours": number,
  "baseline_weekly_earnings": number
}
```
**Response (201):**
```json
{
  "worker_id": "uuid",
  "policy_id": "uuid",
  "weekly_premium": number,
  "status": "success"
}
```

### Policy Endpoints

#### `POST /api/v1/policies/create`
**Description:** Create insurance policy (auto-called after registration)  
**Authentication:** Required  
**Request Body:**
```json
{
  "worker_id": "uuid",
  "weekly_premium": number,
  "coverage_amount": number
}
```
**Response (201):**
```json
{
  "policy_id": "uuid",
  "policy_number": "string",
  "start_date": "date",
  "end_date": "date",
  "status": "active"
}
```

#### `GET /api/v1/policies/{worker_id}`
**Description:** Get worker's current policy  
**Authentication:** Required  
**Response (200):**
```json
{
  "policy_number": "string",
  "start_date": "date",
  "end_date": "date",
  "weekly_premium": number,
  "coverage_amount": number,
  "status": "string",
  "active_claims_count": number,
  "total_payout": number
}
```

### Premium Endpoints

#### `POST /api/v1/premiums/calculate`
**Description:** Calculate personalized weekly premium using XGBoost  
**Authentication:** Required  
**Request Body:**
```json
{
  "worker_id": "uuid",
  "city": "string",
  "month": number,
  "baseline_earnings": number,
  "zone_flood_risk": number,
  "zone_aqi_risk": number,
  "rating": number,
  "avg_hours": number
}
```
**Response (200):**
```json
{
  "weekly_premium": number,
  "base_premium": 159,
  "multiplier": number,
  "breakdown": {
    "city_factor": number,
    "seasonal_factor": number,
    "flood_risk_factor": number,
    "aqi_risk_factor": number,
    "rating_factor": number,
    "hours_factor": number
  }
}
```

### Claims Endpoints

#### `POST /api/v1/claims/auto-create`
**Description:** Auto-create claim from trigger event  
**Authentication:** System (internal)  
**Request Body:**
```json
{
  "worker_id": "uuid",
  "policy_id": "uuid",
  "trigger_type": "string",
  "trigger_timestamp": "timestamp",
  "payout_amount": number
}
```
**Response (201):**
```json
{
  "claim_id": "uuid",
  "claim_number": "string",
  "status": "pending"
}
```

#### `GET /api/v1/claims/{worker_id}`
**Description:** Get all claims for a worker  
**Authentication:** Required  
**Response (200):**
```json
{
  "claims": [
    {
      "claim_number": "string",
      "trigger_type": "string",
      "trigger_timestamp": "timestamp",
      "payout_amount": number,
      "status": "string",
      "created_at": "timestamp"
    }
  ]
}
```

### Trigger Endpoints

#### `GET /api/v1/triggers/check`
**Description:** Check current conditions for all zones  
**Authentication:** System (internal)  
**Response (200):**
```json
{
  "zones": [
    {
      "zone_id": "string",
      "rain_intensity": number,
      "temperature": number,
      "feels_like": number,
      "aqi": number,
      "triggers_fired": ["string"]
    }
  ]
}
```

### Admin Endpoints

#### `GET /api/v1/admin/claims-forecast`
**Description:** Get 7-day claims forecast  
**Authentication:** Admin required  
**Response (200):**
```json
{
  "forecast": [
    {
      "date": "date",
      "rain_trigger_prob": number,
      "heat_trigger_prob": number,
      "aqi_trigger_prob": number,
      "estimated_claims": number,
      "estimated_payout": number
    }
  ]
}
```

## Guidewire Integration Mapping

**[MOCK/SIMULATED]** The following components simulate Guidewire InsuranceSuite functionality:

### PolicyCenter Mapping
- Our `policies` table → Guidewire PolicyCenter policy lifecycle
- Policy creation, renewal, pause/resume → PolicyCenter API endpoints
- Premium calculation → PolicyCenter rating engine
- In production: Replace with Guidewire PolicyCenter REST API

### ClaimCenter Mapping
- Our `claims` table → Guidewire ClaimCenter claim adjudication
- Auto-claim creation → ClaimCenter FNOL (First Notice of Loss)
- Fraud detection → ClaimCenter fraud rules engine
- Claim approval workflow → ClaimCenter workflow automation
- In production: Replace with Guidewire ClaimCenter REST API

### BillingCenter Mapping
- Our `premium_history` table → Guidewire BillingCenter premium collection
- Weekly premium charges → BillingCenter invoice generation
- Payment tracking → BillingCenter payment processing
- In production: Replace with Guidewire BillingCenter REST API

## Success Metrics

- Worker registration completion rate >90%
- Premium calculation accuracy (within Rs.10 of expected)
- Trigger detection latency <5 minutes
- Fraud detection false positive rate <5%
- Claim payout time <2 hours from trigger
- Mobile page load time <3 seconds on 3G
- Zero critical security vulnerabilities
- Demo video completion within 2 minutes

---

**Document Version:** 1.0  
**Last Updated:** April 2, 2026  
**Status:** Final for Phase 2 Implementation
