-- Disruption Zones Seed Data
-- Run AFTER schema.sql in Supabase SQL Editor

insert into public.disruption_zones (city, zone_name, lat, lon, flood_risk_score, aqi_risk_score) values
  -- Mumbai (monsoon city — high flood risk)
  ('Mumbai', 'Dharavi',   19.0388, 72.8554, 0.90, 0.50),
  ('Mumbai', 'Kurla',     19.0728, 72.8826, 0.80, 0.60),
  ('Mumbai', 'Andheri',   19.1136, 72.8697, 0.40, 0.40),
  ('Mumbai', 'Dadar',     19.0178, 72.8478, 0.70, 0.50),
  ('Mumbai', 'Bandra',    19.0596, 72.8295, 0.30, 0.30),

  -- Delhi (severe winter AQI, seasonal flooding)
  ('Delhi', 'Connaught Place', 28.6315, 77.2167, 0.20, 0.90),
  ('Delhi', 'Rohini',          28.7041, 77.1025, 0.50, 0.80),
  ('Delhi', 'Dwarka',          28.5921, 77.0460, 0.60, 0.70),
  ('Delhi', 'Lajpat Nagar',    28.5672, 77.2373, 0.30, 0.80),
  ('Delhi', 'Sadar Bazaar',    28.6580, 77.2014, 0.40, 0.90),

  -- Bengaluru (medium risk, lake flooding in some areas)
  ('Bengaluru', 'Koramangala', 12.9279, 77.6271, 0.30, 0.40),
  ('Bengaluru', 'HSR Layout',  12.9116, 77.6389, 0.20, 0.30),
  ('Bengaluru', 'Whitefield',  12.9698, 77.7499, 0.40, 0.50),
  ('Bengaluru', 'Majestic',    12.9757, 77.5713, 0.50, 0.60),
  ('Bengaluru', 'Hebbal',      13.0358, 77.5970, 0.60, 0.40)

on conflict (city, zone_name) do update
  set flood_risk_score = excluded.flood_risk_score,
      aqi_risk_score   = excluded.aqi_risk_score,
      lat              = excluded.lat,
      lon              = excluded.lon;
