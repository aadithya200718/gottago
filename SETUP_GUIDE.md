# Complete Setup Guide

## 1. API keys you need (free tiers)

| Service | Sign Up URL | Key Name in .env | Free Tier |
|---------|------------|-------------------|-----------|
| Supabase | https://supabase.com/dashboard | `SUPABASE_URL`, `SUPABASE_KEY` | 500MB database, 2 projects |
| OpenWeatherMap | https://openweathermap.org/api | `OPENWEATHERMAP_API_KEY` | 1,000 calls/day (Current Weather is free) |
| WAQI (Air Quality) | https://aqicn.org/data-platform/token | `WAQI_TOKEN` | Unlimited (just register email) |
| RazorpayX (optional) | https://dashboard.razorpay.com | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Test mode is free, skip for hackathon |
| Guidewire (optional) | internal / partner endpoint | `GUIDEWIRE_ENV`, `GUIDEWIRE_BASE_URL`, `GUIDEWIRE_AUTH_TOKEN` | Use `mock` for demo |

---

## 2. Supabase setup (one-time)

### Step A: Create project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: `gottago` (or anything)
4. Database password: save this somewhere
5. Region: pick closest (e.g. Mumbai `ap-south-1`)
6. Wait for project to provision (about 1 minute)

### Step B: Get your keys

1. Go to Project Settings (gear icon) > API
2. Copy **Project URL** (e.g. `https://abcdef.supabase.co`) into `SUPABASE_URL`
3. Copy **service_role key** (not the anon key) into `SUPABASE_KEY`

### Step C: Create database tables

Go to SQL Editor in your Supabase dashboard and run this SQL:

```sql
-- Workers table
CREATE TABLE IF NOT EXISTS workers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone_hash TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('swiggy', 'zomato', 'both')),
  city TEXT NOT NULL,
  zone TEXT NOT NULL,
  rating NUMERIC(3,2) DEFAULT 4.0,
  avg_weekly_hours NUMERIC(5,1) DEFAULT 40,
  baseline_weekly_earnings NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Disruption zones
CREATE TABLE IF NOT EXISTS disruption_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL,
  zone_name TEXT NOT NULL,
  flood_risk_score NUMERIC(3,2) DEFAULT 0.5,
  aqi_risk_score NUMERIC(3,2) DEFAULT 0.3,
  aqi_baseline INTEGER DEFAULT 150,
  bandh_frequency NUMERIC(3,2) DEFAULT 0.1,
  heat_risk_score NUMERIC(3,2) DEFAULT 0.3,
  lat NUMERIC(10,6),
  lon NUMERIC(10,6),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Policies
CREATE TABLE IF NOT EXISTS policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES workers(id),
  policy_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired', 'cancelled')),
  weekly_premium NUMERIC(10,2) NOT NULL,
  coverage_amount NUMERIC(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Claims (columns match routers/claims.py inserts)
CREATE TABLE IF NOT EXISTS claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_number TEXT UNIQUE NOT NULL,
  worker_id UUID REFERENCES workers(id),
  policy_id UUID REFERENCES policies(id),
  trigger_type TEXT NOT NULL,
  trigger_event_id UUID,
  trigger_timestamp TIMESTAMPTZ,
  payout_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected', 'flagged', 'error', 'payout_failed')),
  fraud_score NUMERIC(5,4) DEFAULT 0,
  transaction_id TEXT,
  guidewire_claim_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fraud flags (columns match services/fraud_service.py inserts)
CREATE TABLE IF NOT EXISTS fraud_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID REFERENCES claims(id),
  flag_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  details_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger events (columns match routers/triggers.py inserts)
CREATE TABLE IF NOT EXISTS trigger_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_type TEXT NOT NULL,
  city TEXT NOT NULL,
  zone_id UUID,
  timestamp TIMESTAMPTZ NOT NULL,
  duration_hours INTEGER DEFAULT 3,
  intensity_value NUMERIC(10,2) DEFAULT 1.0,
  source_api TEXT DEFAULT 'Manual/Admin',
  event_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Premium history (columns match routers/workers.py inserts)
CREATE TABLE IF NOT EXISTS premium_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES workers(id),
  policy_id UUID REFERENCES policies(id),
  calculated_premium NUMERIC(10,2) NOT NULL,
  base_premium NUMERIC(10,2) DEFAULT 159,
  multiplier NUMERIC(5,3),
  features_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit log (columns match services/payout_service.py inserts)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID REFERENCES claims(id),
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_claims_worker_trigger ON claims(worker_id, trigger_type, created_at);
CREATE INDEX IF NOT EXISTS idx_policies_worker_status ON policies(worker_id, status);
CREATE INDEX IF NOT EXISTS idx_trigger_events_hash ON trigger_events(event_hash);
CREATE INDEX IF NOT EXISTS idx_workers_city ON workers(city);

-- Enable Row Level Security (but allow service role full access)
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE disruption_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Service role bypass policies (so your backend can read/write everything)
DROP POLICY IF EXISTS "Service role full access" ON workers;
CREATE POLICY "Service role full access" ON workers FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access" ON policies;
CREATE POLICY "Service role full access" ON policies FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access" ON claims;
CREATE POLICY "Service role full access" ON claims FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access" ON fraud_flags;
CREATE POLICY "Service role full access" ON fraud_flags FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access" ON trigger_events;
CREATE POLICY "Service role full access" ON trigger_events FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access" ON premium_history;
CREATE POLICY "Service role full access" ON premium_history FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access" ON disruption_zones;
CREATE POLICY "Service role full access" ON disruption_zones FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access" ON audit_log;
CREATE POLICY "Service role full access" ON audit_log FOR ALL USING (true);

-- Seed disruption zones (lat/lon are approximate city-center coords)
INSERT INTO disruption_zones (zone_id, city, zone_name, flood_risk_score, aqi_risk_score, aqi_baseline, bandh_frequency, heat_risk_score, lat, lon) VALUES
  ('MUM-DHR', 'mumbai', 'Dharavi', 0.85, 0.60, 180, 0.15, 0.4, 19.0440, 72.8527),
  ('MUM-AND', 'mumbai', 'Andheri', 0.65, 0.50, 160, 0.12, 0.35, 19.1136, 72.8697),
  ('MUM-BAN', 'mumbai', 'Bandra', 0.55, 0.45, 150, 0.10, 0.30, 19.0544, 72.8406),
  ('MUM-DAD', 'mumbai', 'Dadar', 0.70, 0.55, 170, 0.13, 0.38, 19.0178, 72.8478),
  ('MUM-KUR', 'mumbai', 'Kurla', 0.75, 0.58, 175, 0.14, 0.42, 19.0726, 72.8845),
  ('DEL-CON', 'delhi', 'Connaught Place', 0.30, 0.80, 280, 0.20, 0.70, 28.6315, 77.2167),
  ('DEL-DWR', 'delhi', 'Dwarka', 0.35, 0.75, 260, 0.18, 0.65, 28.5921, 77.0460),
  ('DEL-RKP', 'delhi', 'RK Puram', 0.40, 0.82, 290, 0.22, 0.72, 28.5672, 77.1754),
  ('DEL-LJP', 'delhi', 'Lajpat Nagar', 0.38, 0.78, 270, 0.19, 0.68, 28.5700, 77.2373),
  ('BLR-KOR', 'bengaluru', 'Koramangala', 0.50, 0.35, 120, 0.08, 0.45, 12.9352, 77.6245),
  ('BLR-WHT', 'bengaluru', 'Whitefield', 0.60, 0.40, 130, 0.09, 0.40, 12.9698, 77.7500),
  ('BLR-INR', 'bengaluru', 'Indiranagar', 0.45, 0.32, 115, 0.07, 0.38, 12.9784, 77.6408),
  ('BLR-HSR', 'bengaluru', 'HSR Layout', 0.55, 0.38, 125, 0.08, 0.42, 12.9116, 77.6474),
  ('BLR-JAY', 'bengaluru', 'Jayanagar', 0.40, 0.30, 110, 0.06, 0.35, 12.9308, 77.5838)
ON CONFLICT (zone_id) DO NOTHING;
```

---

## 3. Backend .env file

Create `backend/.env`:

```
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_KEY=eyJhbGci...YOUR_SERVICE_ROLE_KEY
OPENWEATHERMAP_API_KEY=your_owm_key_here
WAQI_TOKEN=your_waqi_token_here
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
GUIDEWIRE_ENV=mock
GUIDEWIRE_BASE_URL=
GUIDEWIRE_AUTH_TOKEN=
```

---

## 4. Run backend locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Visit http://localhost:8000/health to verify.

Seed data (after backend is running):
```bash
python -m seeds.mock_workers
python -m seeds.mock_claims
python -m seeds.mock_bandh
```

---

## 5. Frontend .env.local

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6. Run frontend locally

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

---

## 7. Deploy to Render (backend)

1. Go to https://render.com and sign in with GitHub
2. Click "New +" > "Web Service"
3. Connect your GitHub repo
4. Configure:
   - Name: `gottago-api`
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Instance type: Free
5. Add environment variables:
   - Required: `SUPABASE_URL`
   - Required: `SUPABASE_KEY`
   - Recommended for live weather checks: `OPENWEATHERMAP_API_KEY`
   - Recommended for live AQI checks: `WAQI_TOKEN`
   - Optional payout integration: `RAZORPAY_KEY_ID`
   - Optional payout integration: `RAZORPAY_KEY_SECRET`
   - Set `GUIDEWIRE_ENV=mock` for the demo
   - Only if using a real Guidewire environment: `GUIDEWIRE_BASE_URL`, `GUIDEWIRE_AUTH_TOKEN`
6. Click "Create Web Service"
7. Wait for deploy (takes 3-5 minutes on free tier)
8. Copy your URL: `https://gottago-api.onrender.com`

---

## 8. Deploy to Vercel (frontend)

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New" > "Project"
3. Import your repo
4. Configure:
   - Framework: Next.js
   - Root directory: `frontend`
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://gottago-api.onrender.com` (your Render URL)
   - `NEXT_PUBLIC_APP_URL` = your Vercel app URL
6. Click "Deploy"
7. Your app will be live at `https://your-project.vercel.app`

---

## 9. After deployment checklist

- [ ] Backend /health endpoint returns `{"status": "ok"}`
- [ ] Frontend loads at Vercel URL
- [ ] Registration form submits and creates worker
- [ ] Dashboard shows policy after registration
- [ ] Admin page loads forecast/heatmap/reserves
