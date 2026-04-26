<div align="center">
.
# GottaGO

### GottaGO: Weekly Income Protection for Food Delivery Partners

_Personalised earnings velocity collapse protection for Swiggy and Zomato delivery workers_

**Weekly income protection for Swiggy and Zomato delivery partners that pays automatically when verified external disruptions wipe out their earning day, with zero paperwork.** 

![Built With](https://img.shields.io/badge/Built%20With-Python%20%2B%20FastAPI-orange?style=flat-square)
![Insurance](https://img.shields.io/badge/Platform-Guidewire%20InsuranceSuite-green?style=flat-square)
![Payments](https://img.shields.io/badge/Payments-Razorpay%20UPI-purple?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
![Data Sources](https://img.shields.io/badge/Data-OpenWeatherMap%20%7C%20CPCB%20%7C%20NDMA-blue?style=flat-square)

---

</div>

## Table of Contents :

1. [The Problem](#1-the-problem)
2. [Market Gap Analysis](#2-market-gap-analysis)
3. [Competitive Moat](#3-competitive-moat)
4. [Parametric Triggers](#4-parametric-triggers)
5. [Weekly Premium Model](#5-weekly-premium-model)
6. [AI/ML Integration](#6-aiml-integration)
7. [Fraud Detection](#7-fraud-detection)
8. [SmartShift Advisor](#8-smartshift-advisor)
9. [Insurer Admin Dashboard](#9-insurer-admin-dashboard)
10. [Guidewire Platform Integration](#10-guidewire-platform-integration)
11. [Reinsurance Strategy](#11-reinsurance-strategy)
12. [System Architecture](#12-system-architecture)
13. [Trigger-to-Payout Workflow](#13-trigger-to-payout-workflow)
14. [Tech Stack](#14-tech-stack)
15. [Adversarial Defense & Anti-Spoofing Strategy](#15-adversarial-defense--anti-spoofing-strategy)

---

## 1. The Problem

### Meet Rajan

Rajan is 27 years old and works as a Swiggy delivery partner out of the HSR Layout zone in Bengaluru. Under normal conditions he earns approximately ₹23,000 per month, roughly ₹800 per day across 29 working days. His effective active hourly rate during delivery windows is ₹120/hr, which is consistent with Zomato CEO Deepinder Goyal's published average of ₹102/hr across all logged hours: active delivery windows yield a higher rate because idle and waiting time is excluded.

Rajan's per-order economics break down as follows: ₹18 base pay per order, plus ₹2 per kilometre distance charge, plus a ₹100 daily bonus if he completes 20 orders. On a good day he finishes 22 to 24 orders. On a rainy day he manages 9 to 11 orders and misses the bonus entirely, losing both the per-order income and the ₹100 bonus in a single stroke.

His financial reality leaves no room for disruption. He sends ₹8,000 per month to his family. He pays ₹5,500 for shared accommodation in Bengaluru. After fuel (₹3,000), phone data (₹500), and bike maintenance (₹1,500), he has ₹2,500 remaining for emergencies. There is no savings buffer beyond two weeks. A single week of weather-disrupted earnings puts him behind on rent.

Swiggy provides Rajan with basic accidental injury coverage of ₹2 lakh through its platform insurance partner. This covers hospitalisation from road accidents. It covers zero rupees of income lost because delivery zones became unserviceable during heavy rain, because the AQI crossed hazardous thresholds, or because a government bandh shut down platform operations for an entire day.

GottaGO exists to fill that gap. It covers income loss only from external disruptions: weather, pollution, and social disruptions such as government-imposed curfews. It strictly excludes health, life, accidents, and vehicle repairs. Those risks are already addressed by existing products. The income gap is not.

# Scenario A: Mumbai Monsoon

**Arjun, 24, Zomato partner, Dharavi zone, Mumbai.**

July 18, 2:00 PM. Rainfall in Dharavi crosses 30mm in three hours. Arjun has completed 12 of his 20-order target at 2 PM and is on pace for an ₹820 day. Zomato marks the Dharavi zone as reduced serviceability. Order flow drops to near zero. Arjun finishes the day at 15 orders, missing his ₹100 daily bonus. He earns ₹480 instead of ₹800, a loss of ₹320.On rain days, riders accept shorter-distance orders to avoid flooded roads. Arjun's average order distance drops from 8.5km to 7km. He finishes at 15 orders earning ₹480 (15 × ₹32), missing his ₹100 bonus. Loss: ₹320.

GottaGO detects the rainfall trigger at 2:15 PM via the OpenWeatherMap API (`hourly.rain.1h` field exceeding 10mm/hr across three consecutive readings in Arjun's GPS zone). The system confirms Arjun's GPS was active in the affected zone at trigger time. By 4:00 PM, ₹300 (2.5 hours at ₹120/hr) lands in Arjun's UPI account. No app interaction was required from Arjun. No claim form. No phone call. The payout is calculated, validated, and disbursed entirely by the system.

### Scenario B: Delhi AQI Crisis

**Priya, 30, Swiggy partner, Dwarka, Delhi.**

November 6. At 11:00 AM, the AQI in Dwarka crosses 420. The Delhi government issues an outdoor activity advisory under GRAP Stage IV. Priya stops working at noon after completing 8 orders. Her entire afternoon earning window, typically worth ₹400 to ₹500, is eliminated.

GottaGO detects the CPCB AQI reading crossing the 400 threshold, sustained for four consecutive hours across at least two monitoring stations in the Delhi zone. The system confirms Priya's GPS was active in the affected city zone during the trigger window. By 3:00 PM, ₹240 (2 hours at ₹120/hr) is in Priya's UPI account.

### Scenario C: Bengaluru Bandh

**Rajan, 27, Swiggy partner, HSR Layout, Bengaluru.**

A Tuesday morning. An unexpected bandh is called at 8:00 AM. All delivery platforms suspend operations across Bengaluru. Rajan loses a full working day worth ₹800.

GottaGO detects the state-issued public advisory from the Karnataka government alert feed. The system cross-verifies against NDMA advisory data. A full-day payout of ₹480 (4 hours at ₹120/hr, capped per single-trigger rules) is released to Rajan's UPI. This is the trigger no other insurance product in India currently covers. Weather disruptions at least have seasonal predictability. A bandh has none.

---

## 2. Market Gap Analysis

### Existing Products and Their Gaps

| Product              | What It Covers                                                                                                                                          | Income Loss from Weather? | Income Loss from AQI? | Income Loss from Curfew/Bandh? | Weekly Premium?         | Parametric Triggers?   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | --------------------- | ------------------------------ | ----------------------- | ---------------------- |
| **Onsurity**         | Group health insurance for SMEs and startups. Monthly plans from ₹145/month. Requires employer-based payroll enrolment.                                 | No                        | No                    | No                             | No                      | No                     |
| **Toffee Insurance** | "Salary Protect Plan" (Kamai Bachao Yojana): ₹1,000/day income protection, but triggered only by hospitalisation. ₹449/year.                            | No                        | No                    | No                             | No                      | No (indemnity-based)   |
| **Acko**             | Accident and medical coverage for Swiggy/Zomato partners through platform partnerships. ₹10 lakh accidental death/disability. 11,000+ hospital network. | No                        | No                    | No                             | No (pay-per-day option) | No                     |
| **Digit Insurance**  | Parametric weather insurance settled for farmers (moisture index, 500+ farmers, January 2025). Not extended to gig workers.                             | No (farmers only)         | No                    | No                             | No                      | Yes (agriculture only) |
| **GottaGO**        | **Income loss from weather, pollution, and social disruptions for food delivery workers**                                                               | **Yes**                   | **Yes**               | **Yes**                        | **Yes (₹159/week)**     | **Yes (5 triggers)**   |

**The confirmed gap:** After searching IRDAI product filings, insurance aggregator catalogues (PolicyBazaar, Coverfox), and all four companies listed above, no insurer in India has filed a parametric income loss product for gig workers triggered by environmental or social disruptions. Toffee's "Salary Protect" comes closest but covers income loss only from hospitalisation, not from rain, heat, pollution, or curfews. The gap is real, documented, and unoccupied.

### Regulatory Fit

GottaGO operates within a regulatory framework that actively encourages this product category:

- **IRDAI (Insurance Products) Regulations 2024** explicitly encourage innovative parametric product design and have removed the separate micro-insurance product filing process, streamlining approval for novel low-premium products.
- **IRDAI Regulatory Sandbox Regulations 2025** provide the formal pathway for testing novel parametric products with a limited customer base over a 6-to-12-month period, with relaxed regulatory requirements during the sandbox phase.
- **Precedent exists.** Go Digit General Insurance settled India's first parametric weather insurance claim in January 2025 using a moisture index trigger, paying out to over 500 farmers across 30 villages. This proves IRDAI accepts parametric triggers based on objective, independently verifiable data sources.
- **No regulatory blocker exists** for extending parametric triggers from agriculture to gig-worker income protection. The product falls under general (non-life) insurance, not health or life, avoiding those regulators entirely.

---

# 3. Competitive Moat

Saying "no one does this today" is not a moat. Here are three structural reasons why Acko or Digit cannot replicate GottaGO within six months, even with unlimited budget.

### 3.1 Data Network Effects

Every payout GottaGO makes creates a labelled training record: the specific trigger event, GPS coordinates, trigger duration, actual income loss verified against zone peer order-completion rates, and claim outcome (approved, flagged, or rejected). After six months of operation with 10,000 active workers, GottaGO holds the most accurate zone-level income-loss-versus-disruption dataset in India. No public dataset provides this correlation. A competitor starting today begins with zero labelled records and must operate for six or more months to accumulate comparable data. GottaGO's XGBoost premium model and Disruption Score engine improve with every weekly refit. The accuracy gap between GottaGO and a new entrant widens over time, it does not narrow.

## 3.2 Worker Lock-In via Personalised Pricing

Workers with 12 or more weeks of claims history in GottaGO receive the most personalised premium, reflecting their actual zone risk exposure and individual claim frequency. Claim-free workers accumulate a cumulative discount (5% at week 12, increasing with continued clean history) that resets to zero if they switch to a competitor. A worker paying ₹97/week after 20 weeks of history would restart at ₹159/week with a new provider. The longer a worker stays, the cheaper their premium becomes. This is a structural retention mechanism that money alone cannot replicate.

### 3.3 Regulatory First-Mover Advantage

IRDAI sandbox approval takes 6 to 12 months from filing to operational clearance. Filing first occupies the regulatory slot for parametric gig-worker income protection. Neither Digit nor Acko has filed this product category as of March 2026. A six-to-twelve-month regulatory head start cannot be shortened by engineering speed or marketing budget. During that window, GottaGO accumulates workers, data, and premium history that define market pricing for the category.

---

## 4. Parametric Triggers

GottaGO defines five parametric triggers. Each trigger has an objective, independently verifiable data source, a specific threshold based on government or international definitions, and a payout calculated as a function of the worker's effective hourly rate of ₹120/hr.

### Trigger Summary

| #   | Trigger                   | Threshold                                                                                                                   | Source (API + field)                                                                                                 | Payout                   | Justification                                                                                                                                                                                                                                                                     |
| --- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Heavy Rainfall            | >30mm cumulative in 3 consecutive hours, within worker's 5km GPS zone                                                       | OpenWeatherMap One Call API, `hourly.rain.1h` field, polled every 30 min per active zone                             | ₹300 (2.5 hrs x ₹120/hr) | IMD defines 30mm/3hr as the lower bound of heavy rain requiring public advisories. Below 30mm deliveries slow but continue. At 30mm+ platforms mark zones as reduced serviceability. This is the operational inflection point.                                                    |
| 2   | Extreme Heat              | `feels_like` >43°C for 3+ consecutive hours within 11am-4pm                                                                 | OpenWeatherMap current weather endpoint, `feels_like` field, polled hourly per city                                  | ₹360 (3 hrs x ₹120/hr)   | ILO defines 43°C wet-bulb equivalent as dangerous heat stress for outdoor workers. NDMA issued India's first gig worker heat advisory (July 2025) using this threshold. The 11am-4pm window targets the lunch surge; losing this window eliminates the day's second income spike. |
| 3   | Severe AQI                | AQI >400 (CPCB Severe) for 4+ consecutive hours, confirmed by at least 2 monitoring stations                                | CPCB AQI API via data.gov.in (free, hourly, station-level) + WAQI API as fallback                                    | ₹240 (2 hrs x ₹120/hr)   | Below 400 riders operate with discomfort. Above 400 GRAP Stage IV activates in Delhi NCR with vehicle restrictions and outdoor activity advisories. 2-station confirmation prevents a single faulty sensor from triggering payouts across a zone.                                 |
| 4   | Government Curfew / Bandh | State or district confirmed curfew, Section 144 order, or bandh advisory covering worker's city for 3+ hours during 8am-9pm | State government alert portals (Karnataka, Maharashtra, UP, Bihar, Telangana) + NDMA advisory API cross-verification | ₹480 (4 hrs x ₹120/hr)   | Platforms halt operations during confirmed Section 144 orders. Government advisory is objective, auditable, and public. Fraud on this trigger is structurally impossible because a worker cannot create or fake a government order.                                               |
| 5   | Compound Disruption Score | Disruption Score >7.0 sustained for 2+ hours, even if no single trigger above crosses its individual threshold              | Composite: OpenWeatherMap (rain, temp, wind) + CPCB AQI + Google Maps Routes API (traffic delay index)               | ₹300                     | 10mm/hr rain + AQI 350 + 2x traffic congestion = 60-70% earnings drop even though no single trigger fires. This is how income loss actually works for delivery workers. No other insurance product models compound disruption.                                                    |

**Compound Disruption Score formula:**

```
DS = w1 × R(rain) + w2 × T(temp) + w3 × A(aqi) + w4 × C(congestion) + interaction_terms
```

Each factor is normalised on a 0-10 scale. Weights `w1` through `w4` are learned via Gradient Boosted Trees trained on historical earnings-versus-conditions data. The `interaction_terms` capture compounding effects: rain multiplied by congestion produces a super-linear impact on earnings because flooded roads with existing traffic create multiplicative delays rather than additive ones.

### Cap Rules

| Rule                         | Detail                                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Maximum payouts per week** | 2 trigger payouts per worker per week                                                                                      |
| **Weekly payout ceiling**    | Total weekly payout capped at 55% of the worker's 4-week rolling earnings baseline                                         |
| **Overlapping triggers**     | If two triggers overlap in the same time window, only the higher-value trigger fires                                       |
| **Payout timing**            | Released within 2 hours of trigger confirmation, via UPI                                                                   |
| **Activity requirement**     | Worker must have been active on the delivery platform in the 2 hours preceding the trigger, verified via GPS activity logs |

---

## 5. Weekly Premium Model

### Base Premium: ₹159/week

The base premium is derived actuarially. Every number below is shown in full.

**Step 1: Events per year (India-wide weighted average per worker)**

Not every worker faces every trigger. AQI is heavily concentrated in Delhi NCR and parts of North India. Extreme heat above 43°C is specific to the north and central belt (Delhi, UP, Rajasthan, Bihar, MP, Nagpur), while coastal and southern metros rarely cross this threshold. The averages below reflect geographic concentration.

| Trigger                   | Events/year (weighted avg) |
| ------------------------- | -------------------------- |
| Heavy Rainfall            | 4                          |
| Extreme Heat              | 3                          |
| Severe AQI                | 2 (Delhi-weighted)         |
| Government Curfew/Bandh   | 1                          |
| Compound Disruption Score | 3                          |
| **Total**                 | **13 events/year**         |

**Step 2: Expected weekly loss**

```
Events per week     = 13 events/year ÷ 52 weeks = 0.25/week
Avg payout per event = (₹300 + ₹360 + ₹240 + ₹480 + ₹300) ÷ 5 = ₹336/event
Expected weekly loss = 0.25 × ₹336 = ₹84/week
```

**Step 3: Premium build-up**

```
Expected weekly loss  = ₹84
At 65% loss ratio     = ₹84 ÷ 0.65 = ₹129.23/week
Add 23% operating load = ₹129.23 × 1.23 = ₹158.96/week
Rounded for market     = ₹159/week
```

**Affordability check:** The ₹159 base rate applies before XGBoost personalisation. At ₹7,200/week (typical for a full-time worker in Mumbai or Delhi), ₹159 is 2.2% of gross income, below the 3% micro-insurance affordability ceiling. Rajan earns ₹5,750/week (₹23,000 ÷ 4). After XGBoost adjustment for Bengaluru and a low-disruption month, his personalised premium would be ₹97–₹120/week which is 1.7% to 2.1% of his earnings, well within the threshold. The model ensures no worker is priced above their affordability band.

---

### Worked Example A: Vikram (High Risk)

**Vikram, 26, Zomato partner, Andheri East, Mumbai. Month: July (peak monsoon).**

Earnings baseline: ₹8,400/week (₹1,200/day x 7 active days). Rating: 4.7. Zone flood risk score: 0.82 (Andheri East historically floods 6-8 times per year per BMC/MCGM data). Weekly hours: 62.

| Adjustment Factor                 | Value  | Multiplier | Running Premium |
| --------------------------------- | ------ | ---------- | --------------- |
| Base premium                      | -      | -          | ₹159            |
| City risk (Mumbai = High)         | High   | ×1.20      | ₹191            |
| Season (July = peak monsoon)      | Peak   | ×1.25      | ₹239            |
| Zone flood risk score             | 0.82   | ×1.10      | ₹262            |
| Platform rating                   | 4.7    | ×0.95      | ₹249            |
| Weekly hours (62 = high exposure) | 62 hrs | ×1.05      | ₹262            |
| Claims history (0 prior)          | 0      | ×0.92      | **₹241**        |

**Vikram's weekly premium: ₹240** (rounded). This is 2.9% of his ₹8,400 weekly earnings, below the 3% affordability ceiling.

---

### Worked Example B: Suresh (Low Risk)

**Suresh, 31, Swiggy partner, Secunderabad, Hyderabad. Month: February (dry season).**

Earnings baseline: ₹4,800/week (₹800/day x 6 active days). Rating: 3.8. Zone flood risk score: 0.21. Weekly hours: 36.

| Adjustment Factor                  | Value  | Multiplier | Running Premium |
| ---------------------------------- | ------ | ---------- | --------------- |
| Base premium                       | -      | -          | ₹159            |
| City risk (Hyderabad = Medium)     | Medium | ×0.90      | ₹143            |
| Season (February = dry/low risk)   | Low    | ×0.80      | ₹114            |
| Zone flood risk score              | 0.21   | ×0.92      | ₹105            |
| Platform rating                    | 3.8    | ×1.00      | ₹105            |
| Weekly hours (36 = lower exposure) | 36 hrs | ×0.95      | ₹100            |
| Claims history (0 prior)           | 0      | ×0.97      | **₹97**         |

**Suresh's weekly premium: ₹97.** This is 2.0% of his ₹4,800 weekly earnings.

**Vikram pays ₹240. Suresh pays ₹97.** Both premiums fall below 3% of weekly earnings. The ₹143 spread between them reflects genuine differences in city risk, seasonal exposure, zone flooding history, and logged hours, not arbitrary tiers.

---

## 6. AI/ML Integration

GottaGO uses four distinct machine learning models, each with a named purpose, specific input features, and a defined retraining schedule.

### Model 1: XGBoost Gradient Boosted Trees for Dynamic Premium Engine

**Purpose:** Calculates the premium multiplier applied to the ₹159 base for each worker.

**Input features (7):**

| Feature                      | Type                        | Source                                                    |
| ---------------------------- | --------------------------- | --------------------------------------------------------- |
| `city`                       | One-hot encoded categorical | Worker onboarding form                                    |
| `month`                      | Integer 1-12                | System date                                               |
| `worker_weekly_baseline_inr` | Float                       | 4-week exponentially weighted rolling average of earnings |
| `zone_flood_risk_score`      | Float 0-1                   | GIS flood risk data (BMC/MCGM, BBMP, MCD sources)         |
| `zone_aqi_risk_score`        | Float 0-1                   | Historical CPCB AQI frequency data for the zone           |
| `platform_rating`            | Float 1-5                   | Swiggy/Zomato partner rating (self-reported, validated)   |
| `avg_weekly_hours_logged`    | Integer                     | Platform activity data                                    |

**Output:** Premium multiplier (float, bounded 0.5 to 2.0) applied to ₹159 base.

**Why XGBoost:** Handles tabular mixed-type data natively. Feature importance is interpretable via SHAP scores, meaning judges (and regulators) can see exactly what drives each worker's premium. Trains reliably on datasets as small as 500 records, which matters in week 1 of deployment when labelled data is scarce.

**Refit schedule:** Every Sunday night. Updated premiums apply to the following week's policy cycle.

---

### Model 2: Isolation Forest for Fraud Detection

**Purpose:** Flags workers whose claim patterns deviate from zone peers, without requiring labelled fraud examples.

**How it works:** Constructs an ensemble of random isolation trees on features including claim frequency, average hours between claims, payout amounts, and GPS movement variance. Workers whose feature vectors require fewer splits to isolate (anomaly score > 0.85 deviation) are flagged for manual review.

**Retrains weekly** as new claims data accumulates.

---

### Model 3: Gradient Boosted Trees for Disruption Score Engine

**Purpose:** Calculates the real-time Compound Disruption Score that powers Trigger 5 and the SmartShift Advisor.

**Input features:** Rain intensity (normalised 0-10), temperature deviation from comfort zone (normalised 0-10), AQI severity (normalised 0-10), traffic delay ratio versus baseline (normalised 0-10), plus learned interaction terms (rain x congestion, heat x AQI).

**Training data:** Historical zone-level earnings (from platform activity proxies) correlated with simultaneous weather, AQI, and traffic conditions.

**Dual use:** The same model powers both real-time trigger detection (fed current data) and SmartShift 48-hour forecasting (fed forecast data).

---

### Model 4: LSTM for SmartShift Shift Quality Forecast

**Purpose:** Predicts disruption probability per 4-hour shift block over the next 48 hours.

**Input:** Sequences of 48-hour weather forecasts (temperature, rainfall probability, wind speed) and AQI forecasts from CPCB predictive data.

**Output:** Per-shift disruption probability (0-1) that feeds daily worker notifications (see [SmartShift Advisor](#8-smartshift-advisor)).

---

### Feedback Loop

The models are not static. Accuracy improves structurally over time:

| Phase                | Timeline  | What Changes                                                                                                                                                                     |
| -------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cold start           | Week 1-4  | Community-rated pricing using city + season only. No individual history available.                                                                                               |
| Pattern recognition  | Week 5-12 | Individual claim history incorporated into XGBoost features. Claim-free workers receive 5% discount. Workers with 2+ claims flagged for fraud review.                            |
| Full personalisation | Month 4+  | Model retrains monthly on actual trigger frequency versus predicted frequency, claim-to-trigger ratio (fraud signal), and worker churn data (are premiums too high?).            |
| Continuous           | Ongoing   | Bayesian updating of zone risk scores using real claims frequency. A zone scored 0.40 that triggers 8 payouts in 6 weeks automatically updates to 0.71 at the next Sunday refit. |

---

## 7. Fraud Detection

GottaGO implements four fraud detection signals, each with specific parameters. Every claim passes through all four checks before payout.

### Signal 1: GPS Zone Validation

The worker's GPS position at trigger time must overlap with the zone where the trigger was detected. Radius tolerance is 4km. If the worker's last GPS ping before the trigger was in a non-disrupted zone more than 4km away, the claim is flagged for manual review. This catches workers who are outside the disrupted area but attempt to claim a zone-based payout.

### Signal 2: Multi-Worker Zone Correlation

If only 1 out of all workers active in a zone during a trigger window claims a payout, but the remaining active workers show normal order-completion rates, the single claim goes to manual review. Genuine weather suppresses orders for all workers in a zone. If orders were flowing normally for 17 workers, the triggering condition could not have caused income loss for the 18th.

### Signal 3: Timing Anomaly via Isolation Forest

Claims submitted more than 3 hours after the trigger window closes are flagged. Genuine income loss occurs during the event. Delayed claims suggest the worker learned about the trigger after the fact and is retroactively attempting to claim. The Isolation Forest model (Model 2) incorporates timing deviation as a key feature in its anomaly scoring.

### Signal 4: Duplicate Event Prevention

Each trigger event is hashed as `SHA256(trigger_type + zone_id + timestamp_window)`. One payout per unique hash per worker. This prevents double-claiming for the same event. The hash is deterministic: two workers in the same zone during the same trigger window produce the same event hash, ensuring consistent deduplication.

### Fraud Detection Code

```python
def detect_gps_spoofing(worker_id, claimed_gps, timestamp):
    last_gps = get_last_known_location(worker_id)
    distance = haversine_distance(last_gps, claimed_gps)
    time_diff = timestamp - last_gps['timestamp']
    velocity = distance / time_diff  # km/hour
    if velocity > 150:  # Faster than physically possible for a two-wheeler in urban India
        return False, "Unrealistic velocity detected"
    return True, "GPS validated"


def validate_weather_trigger(lat, lon, trigger_type):
    sources = {
        'openweathermap': get_owm_weather(lat, lon),
        'open_meteo': get_openmeteo_weather(lat, lon),
        'imd': get_imd_gridded_data(lat, lon)
    }
    confirmations = sum(1 for s in sources.values()
                       if check_trigger_condition(s, trigger_type))
    return confirmations >= 2  # 2 of 3 sources must confirm
```

---

## 8. SmartShift Advisor

GottaGO does not just pay out after disruptions. It actively helps workers avoid them.

The SmartShift Advisor runs the Disruption Score model (Model 3) on 48-hour weather and AQI forecast data and sends each worker a daily shift advisory notification, colour-coded by predicted disruption risk:

| Colour     | Meaning                                            | Recommendation        |
| ---------- | -------------------------------------------------- | --------------------- |
| **GREEN**  | High earnings expected, low disruption probability | Work this shift       |
| **YELLOW** | Moderate disruption risk, earnings may be reduced  | Your call             |
| **RED**    | Disruption payout likely (>70% probability)        | Consider staying home |

**Example notification (WhatsApp or push):**

> Tomorrow 6AM-10AM is GREEN (predicted earnings ₹400-480). 2PM-6PM is RED (heavy rain + AQI spike predicted, 78% payout probability). Recommendation: work morning, skip afternoon.

**Strategic value for the insurer:** SmartShift reduces GottaGO's claim payouts by approximately 15% because workers proactively avoid disrupted shifts. The insurer saves money on claims. The worker earns more by reallocating hours to non-disrupted windows. No insurance product has ever told its policyholder how to avoid needing a claim. No parametric income product in India currently provides proactive disruption avoidance advisories to its policyholders. GottaGO does.

---

## 9. Insurer Admin Dashboard

The GottaGO admin dashboard provides four capabilities for the insurance carrier, all powered by the same ML models that serve workers.

### 9.1 Predictive Claims Forecast

The Disruption Score engine (Model 3) runs on 7-day weather and AQI forecasts to predict next week's payout liability by city and trigger type.

**Example output:**

> _Next week: 340 rain trigger payouts expected in Mumbai (monsoon forecast), 12 AQI trigger payouts in Delhi, and 120 Compound Disruption Score payouts across both cities. Estimated total payout liability: ₹1,42,000._

This allows the carrier to pre-position liquidity rather than reacting to claims after the fact.

### 9.2 Dynamic Reserve Recommendation

Based on the predictive claims forecast plus a safety margin:

> _Recommended reserve for next week: ₹1,85,000 (includes 30% safety margin above forecast liability)._

The 30% margin accounts for forecast error and potential compound trigger scenarios not captured by individual trigger predictions.

### 9.3 Fraud Risk Heatmap

A city-level map where each zone is coloured by deviation between actual claim rates and expected disruption frequency. Zones where claim rates significantly exceed predicted trigger rates are flagged red. The heatmap updates weekly after the Isolation Forest model run, giving the fraud team a visual prioritisation tool rather than a flat list of alerts.

### 9.4 Worker-Facing Earnings Forecast

Each worker sees a weekly value summary, delivered via WhatsApp or the app dashboard:

> _This week you were protected against ₹1,050 in potential income loss. You earned ₹5,250 instead of ₹4,200. Since joining GottaGO 8 weeks ago: ₹4,800 protected total. ₹776 paid in premiums. GottaGO ROI: 6.2x._

This makes the product's value visible every week, even in weeks with zero claims. Workers who see a 6.2x return on their premium do not lapse.

---

## 10. Guidewire Platform Integration

GottaGO is designed to run natively on Guidewire InsuranceSuite, mapping each component of the product lifecycle to a specific Guidewire system.

### PolicyCenter: Policy Lifecycle Management

- **Worker onboarding:** New workers register through the GottaGO frontend. PolicyCenter creates a weekly policy with coverage terms specifying all 5 triggers, weekly payout caps (55% of 4-week rolling earnings baseline), and the earnings baseline tracking interval.
- **Premium engine integration:** The XGBoost premium model (Model 1) is integrated into PolicyCenter's rating algorithm. Every Sunday night the model refits, and updated premiums are applied to the following week's policy cycle. Workers are notified of premium changes (upward or downward) before the new week begins.
- **Policy states:** Active, Paused (missed payment), Needs Review (low-confidence claim pending), Suspended (fraud flag active).
- **Coverage terms stored per worker:** 5 trigger definitions, individual premium multiplier, 4-week rolling earnings baseline, zone assignment, and cumulative claim history.

### ClaimCenter: Trigger-to-Payout Automation

- **Auto-initiation:** When a parametric trigger fires, ClaimCenter auto-initiates the claim with zero human intervention on the intake step. The trigger event data (type, zone, timestamp, duration, API source readings) is attached to the claim record automatically.
- **Fraud validation layer:** Before ClaimCenter adjudication, the four fraud signals run in sequence: GPS check, zone correlation, timing check, duplicate hash. Each signal returns a confidence contribution.
- **Auto-approve threshold:** If the Isolation Forest composite confidence score exceeds 0.85, the claim proceeds to straight-through processing and payout. No human adjuster touches the claim.
- **Manual review threshold:** If the confidence score falls below 0.85, the claim routes to the adjuster queue with fraud signal details attached for review.
- **Target:** 95% of legitimate claims on straight-through processing.
- **Average clean claim processing time:** Under 2 hours from trigger detection to UPI payout.

### BillingCenter: Weekly Premium Collection

- **Weekly UPI autopay:** Premium collection aligned to gig worker payout cycles (most platforms pay workers weekly). Workers authorise UPI autopay during onboarding.
- **Premium adjustment notifications:** When the XGBoost model updates a worker's risk profile, BillingCenter sends a notification explaining the premium change (up or down) with the contributing factors.
- **Lapse management:** A missed payment pauses coverage but does not cancel the policy. Coverage resumes automatically on the next successful payment. No penalty for pausing. This reduces lapse-driven churn, which is the primary cause of micro-insurance policy failure in India (50-70% lapse rates within 6 months for traditional micro-insurance products).

**Core advantage for the carrier:** By building natively on Guidewire InsuranceSuite, the insurance carrier gets a production-ready parametric product with zero legacy system integration work. The trigger-to-payout automation runs entirely within Guidewire's existing claims workflow. PolicyCenter, ClaimCenter, and BillingCenter handle policy lifecycle, adjudication, and billing respectively, exactly as they were designed to, with GottaGO's parametric logic layered on top.

---

## 11. Reinsurance Strategy

### The Catastrophic Risk Scenario

Three consecutive days of heavy rainfall across all of Mumbai during peak monsoon. 50,000 active GottaGO workers simultaneously trigger Trigger 1. Estimated liability: 50,000 workers x ₹300/payout = ₹1.5 crore in 72 hours.

No primary insurer can absorb this exposure concentration without reinsurance support.

### Reinsurance Structure

| Layer                                   | Coverage                                                     | Detail                                                                                       |
| --------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| **Retention**                           | First ₹50 lakhs per event                                    | Primary insurer retains this layer from operating reserves                                   |
| **Catastrophe excess-of-loss (Cat XL)** | ₹50 lakhs to ₹5 crore per event                              | Reinsurer covers this layer, triggered when aggregate event payouts exceed ₹50 lakhs         |
| **Aggregate stop-loss**                 | Annual total payouts capped at 150% of annual premium income | Protects the carrier against a year with abnormally high trigger frequency across all cities |

This three-layer structure is standard for parametric weather products globally. Swiss Re, Munich Re, and SCOR all offer Cat XL capacity for parametric triggers with objective data sources, and India's own GIC Re has reinsured weather-index agricultural products under similar structures.

Guidewire InsuranceSuite supports reinsurance accounting natively, including treaty attachment points, recovery calculations, and aggregate tracking. Catastrophe event management, from trigger aggregation to reinsurance recovery reporting, operates within the existing Guidewire workflow without custom integration.

---

## 12. System Architecture

```mermaid
graph TD
    subgraph External["External Data Sources"]
        OWM["OpenWeatherMap API"]
        CPCB["CPCB AQI API"]
        NDMA["NDMA / State Alerts"]
    end

    subgraph Core["GottaGO Core Engine"]
        TE["Trigger Engine"]
        DS["Disruption Score Model"]
        XGB["XGBoost Premium Engine"]
    end

    subgraph GW["Guidewire InsuranceSuite"]
        PC["PolicyCenter"]
        CC["ClaimCenter"]
        BC["BillingCenter"]
    end

    subgraph Output["Output Layer"]
        UPI["UPI Payout Gateway"]
        NOTIF["Worker Notifications"]
        DASH["Admin Dashboard"]
    end

    OWM -->|"rain, temp, wind"| TE
    CPCB -->|"hourly AQI"| TE
    NDMA -->|"curfew/bandh alerts"| TE

    TE -->|"trigger event"| DS
    DS -->|"disruption score"| CC
    XGB -->|"premium multiplier"| PC

    PC -->|"policy terms"| CC
    CC -->|"approved claim"| UPI
    CC -->|"claim status"| NOTIF
    BC -->|"premium collection"| PC
    BC -->|"payment status"| NOTIF

    TE -->|"zone risk data"| XGB
    CC -->|"claim history"| XGB
    DS -->|"forecast data"| DASH
    CC -->|"claims analytics"| DASH
    UPI -->|"payout confirmation"| NOTIF

    style OWM fill:#1e88e5,stroke:#1565c0,color:#fff
    style CPCB fill:#1e88e5,stroke:#1565c0,color:#fff
    style NDMA fill:#1e88e5,stroke:#1565c0,color:#fff

    style TE fill:#f4511e,stroke:#d84315,color:#fff
    style DS fill:#f4511e,stroke:#d84315,color:#fff
    style XGB fill:#f4511e,stroke:#d84315,color:#fff

    style PC fill:#2e7d32,stroke:#1b5e20,color:#fff
    style CC fill:#2e7d32,stroke:#1b5e20,color:#fff
    style BC fill:#2e7d32,stroke:#1b5e20,color:#fff

    style UPI fill:#7b1fa2,stroke:#6a1b9a,color:#fff
    style NOTIF fill:#7b1fa2,stroke:#6a1b9a,color:#fff
    style DASH fill:#7b1fa2,stroke:#6a1b9a,color:#fff
```

---

## 13. Trigger-to-Payout Workflow

```mermaid
sequenceDiagram
    box rgb(30, 136, 229) External
        participant API as WeatherAPI
    end
    box rgb(244, 81, 30) Core Engine
        participant TE as TriggerEngine
        participant FC as FraudCheck
    end
    box rgb(46, 125, 50) Guidewire
        participant CC as ClaimCenter
    end
    box rgb(123, 31, 162) Output
        participant UPI as UPIGateway
        participant W as Worker
    end

    Note over API,TE: Every 30 minutes
    API->>TE: Rain/temp/AQI data
    TE->>TE: Check thresholds
    Note over TE: T+0: Threshold breach detected
    TE->>FC: Worker GPS + trigger event
    FC->>FC: GPS validation (4km radius)
    FC->>FC: Zone correlation (17/18 check)
    FC->>FC: Timing check (within 3hr)
    FC->>FC: Duplicate hash check
    Note over FC: T+5min: Validation complete
    FC->>CC: Confidence score
    alt Score > 0.85
        CC->>CC: Auto-approve claim
    else Score <= 0.85
        CC->>CC: Route to adjuster queue
    end
    CC->>UPI: Initiate payout
    UPI->>W: ₹300 to UPI account
    Note over UPI,W: T+120min: Payout received
    CC->>W: Push notification sent
```

---

## 14. Tech Stack

| Layer                    | Technology                            | Rationale                                                                         |
| ------------------------ | ------------------------------------- | --------------------------------------------------------------------------------- |
| **Backend**              | Python + FastAPI                      | Async-first, native ML model serving, fast prototyping                            |
| **Frontend**             | Next.js + Tailwind CSS                | Responsive PWA, SSR for SEO, no app install required for delivery workers         |
| **ML: Premium pricing**  | XGBoost via `xgboost` library         | Tabular data native, interpretable via SHAP, trains on small datasets             |
| **ML: Fraud detection**  | scikit-learn Isolation Forest         | Unsupervised, no labelled fraud data needed at launch                             |
| **ML: Disruption Score** | Gradient Boosted Trees (`xgboost`)    | Same library as pricing, captures non-linear interaction terms                    |
| **ML: Shift forecast**   | TensorFlow/Keras LSTM                 | Sequence model on 48-hour forecast windows, predicting disruption probability per shift block                                  |
| **Weather API**          | OpenWeatherMap One Call 3.0           | Free tier: 1,000 calls/day, hourly granularity, `rain.1h` and `feels_like` fields |
| **AQI API**              | CPCB via data.gov.in + WAQI fallback  | Free, hourly, station-level. 300+ monitoring stations across India                |
| **Social disruption**    | State government alert feeds + NDMA   | NDMA public API + state government advisory portals (Karnataka, Maharashtra, UP, Bihar, Telangana). Web scraping used where REST APIs are unavailable.
| **Platform APIs**        | Swiggy/Zomato mock API (simulated)    | Worker GPS activity, order count, and platform rating from simulated platform API |
| **Payment simulation**   | Razorpay Sandbox                      | Free test mode, UPI simulation for demo                                           |
| **Database**             | PostgreSQL via Supabase               | Free tier, ACID compliant, relational schema for policies/claims/workers          |
| **Maps**                 | Leaflet.js + OpenStreetMap            | Free, no API key for base maps. Zone risk heatmap overlay.                        |
| **Hosting**              | Vercel (frontend) + Vercel (backend) | Free tiers, one-click deploy, suitable for hackathon demo                         |
| **Insurance platform**   | Guidewire InsuranceSuite              | PolicyCenter, ClaimCenter, BillingCenter for production-grade policy lifecycle    |

**Total estimated cost for hackathon build: ₹0.** All APIs and hosting operate on free tiers.

---

## 15. Adversarial Defense & Anti-Spoofing Strategy

Section 7 covers GottaGO's four baseline fraud signals. This section addresses a more sophisticated threat: **coordinated GPS-spoofing syndicates** that use apps like FakeGPS, Fly GPS, or iTools to fabricate their location inside a severe-weather zone while sitting safely at home. GPS spoofing apps like FakeGPS and iTools allow badactors to fake their location inside a severe-weather zone while sitting at home. Simple GPS coordinate verification alone cannot detect this. GottaGO's architecture prevents this attack across three layers: differentiation, data, and UX balance. GottaGO's architecture prevents this attack across three layers: differentiation, data, and UX balance.

### 15.1 The Differentiation: Genuine Stranded vs. GPS Spoofer

A genuinely stranded delivery worker and a GPS spoofer both show a GPS coordinate inside the affected zone. The difference is in the **behavioral fingerprint around that coordinate.** GottaGO uses a multi-signal authenticity model that no single spoofing app can defeat, because it checks signals the spoofing app does not control.

| Signal | Genuine Worker | GPS Spoofer | Detection Method |
| --- | --- | --- | --- |
| **GPS trajectory continuity** | Smooth movement trail of 50-200 GPS pings over the preceding 2 hours, speeds of 10-40 km/h (two-wheeler in traffic), with acceleration/deceleration patterns consistent with stop-and-go delivery | Sudden teleportation from a residential location to the red-zone. GPS trail shows a jump of 5-15 km in under 60 seconds, or a perfectly static coordinate with zero micro-drift | Trajectory analysis over a sliding 2-hour window. Flag if the largest single-step displacement exceeds 2 km in under 2 minutes without a highway corridor match |
| **Cell tower triangulation** | Phone connects to 3-5 cell towers consistent with the GPS zone. Tower IDs shift as the worker moves through the delivery radius | Phone connects to cell towers near the worker's actual (home) location, 8-20 km from the spoofed GPS coordinate. Tower IDs do not change because the worker is stationary | Cross-reference device cell tower data (available via Android TelephonyManager API) against the claimed GPS zone. Flag if the nearest cell tower is more than 3 km from the GPS coordinate |
| **Wi-Fi BSSID environment** | Device detects commercial Wi-Fi networks (restaurants, malls, co-working spaces) consistent with a commercial delivery zone | Device detects residential Wi-Fi networks (home routers with default SSIDs like "Jio-Fiber-XXXX", "ACT-XXXX") inconsistent with a delivery zone | Scan visible Wi-Fi BSSIDs at trigger time. Compare the BSSID environment against a zone-type classifier trained on commercial vs. residential Wi-Fi density patterns |
| **Accelerometer and gyroscope data** | Continuous micro-vibrations from motorcycle engine, frequent tilt changes from mounting/dismounting, step patterns during walk-ups to delivery addresses | Flat accelerometer readings consistent with a phone resting on a table or held by a stationary person. No engine vibration signature, no tilt changes | Collect 30-second sensor burst at trigger time. Run through a lightweight CNN classifier trained on "riding" vs. "stationary" motion profiles |
| **Platform activity correlation** | Order completion timestamps from the platform API show active deliveries in the zone within 30 minutes of the trigger. The worker was demonstrably working | No order completions in the zone. The platform's own records show the worker was offline, or their last completed order was in a different zone hours earlier | Cross-reference the worker's last 3 order completion timestamps and GPS coordinates from the platform API (Swiggy/Zomato partner data) against the trigger zone and time window |

**The key insight:** A spoofing app controls one signal (GPS coordinates). GottaGO checks five independent signals that the spoofer cannot simultaneously fake without physically being in the zone, at which point they are no longer spoofing.

### 15.2 The Data: Detecting Coordinated Fraud Rings Beyond GPS

Individual spoofers are a nuisance. Coordinated syndicates (like the 500-worker Telegram ring) are an existential threat. GottaGO detects syndicate patterns using data points that individual-level fraud checks miss entirely.

**Ring Detection Signals:**

| Data Point | What It Reveals | Threshold |
| --- | --- | --- |
| **Temporal claim clustering** | 50+ claims from the same zone within a 15-minute window. Genuine weather events produce claims spread over 1-3 hours as workers gradually stop working. A syndicate acts on a Telegram signal simultaneously | Flag if more than 30% of zone claims arrive within a 15-minute burst AND the zone's historical claim-spread standard deviation is more than 2x narrower than the city average |
| **Device fingerprint clustering** | Multiple accounts operating from devices with identical hardware profiles (same phone model, same OS build, same installed app set) or sharing the same IP subnet. Syndicate members often use bulk-purchased phones | Flag if 5+ claimants in the same trigger window share 3+ device fingerprint attributes, or if 3+ claimants share the same IP /24 subnet |
| **Social graph analysis** | Workers who always claim together across multiple trigger events form a statistical cluster. Genuine weather affects all workers in a zone randomly. Syndicate members claim in the same subset every time | Build a co-claim adjacency graph. Run community detection (Louvain algorithm). Flag communities where the same group of 10+ workers co-claim in 3+ separate trigger events with a Jaccard similarity above 0.7 |
| **Onboarding velocity** | 50 new accounts registered in the same city within 48 hours, all selecting the highest-risk zone. Syndicate recruitment produces onboarding spikes that organic growth does not | Flag if zone-level new registrations exceed 3x the 4-week rolling average for that zone, especially if clustered in high-payout zones |
| **Earnings baseline manipulation** | Workers who inflate their reported earnings baseline in the weeks before a predictable seasonal trigger (monsoon onset, Diwali AQI spike) to maximize their payout ceiling | Compare self-reported earnings against platform API order-count data. Flag if the declared baseline exceeds the platform-verified order count by more than 20%, or if baseline jumps more than 40% in the 2 weeks preceding a historically high-trigger period |
| **Payout destination clustering** | Multiple worker accounts routing payouts to the same UPI ID or to UPI IDs that transact with the same merchant account within 24 hours of payout | Flag if 3+ worker accounts share the same payout UPI handle, or if graph analysis of UPI transaction flows reveals a common aggregation point |

**Syndicate Confidence Score:** Each ring detection signal produces a 0-1 score. The signals are combined using a weighted ensemble (weights learned from the Isolation Forest anomaly model). A composite syndicate score above 0.80 triggers automatic hold on all claims from the identified cluster. A score between 0.50 and 0.80 routes the cluster to the fraud investigation queue with all evidence attached.

### 15.3 The UX Balance: Protecting Honest Workers from False Flags

The worst outcome is not a spoofer getting paid. It is an honest worker, stuck in genuine rain with a dying phone and a weak cell signal, getting their claim rejected because the system flagged a cell tower mismatch caused by network congestion during the storm. GottaGO's anti-spoofing system is designed with an explicit **asymmetric error policy: false negatives (paying a spoofer) are cheaper than false positives (rejecting a genuine worker).** The graduated response below scores exclusively on the 5 anti-spoofing signals from Section 15.1, not the 4 baseline fraud signals from Section 7.

**Graduated Response Workflow:**

| Confidence Level | System Action | Worker Experience |
| --- | --- | --- |
| **High confidence genuine** (4+ of 5 signals pass) | Auto-approve. Payout within 2 hours via standard flow | Worker receives payout notification. No friction. Identical to a clean claim |
| **Moderate confidence** (3 of 5 signals pass) | Auto-approve with flag. Claim is paid immediately but tagged for post-payout audit. No delay to the worker | Worker receives payout normally. In the background, the fraud team reviews the flagged signals within 48 hours. If the audit clears, the flag is removed. If not, the worker's next claim enters enhanced review |
| **Low confidence** (2 of 5 signals pass) | Soft hold. Payout is delayed by 4 hours (not denied). Worker receives a push notification: "Your payout is being verified. Expected by [time]. No action needed from you." During the hold, the system runs secondary verification: check if other workers in the zone also experienced disruption, check platform order-flow data for the zone | Worker waits 4 hours instead of 2. If secondary verification confirms the disruption was real and zone-wide, the payout releases automatically. If not, it routes to manual review |
| **Very low confidence** (0-1 of 5 signals pass) | Hard flag. Claim routes to manual adjuster queue. Worker is notified: "Your claim is under review. A support agent will contact you within 24 hours." The worker is NOT auto-rejected. A human reviews the evidence | Worker speaks to a human. If the adjuster finds a legitimate explanation (phone hardware issue, cell tower outage in the storm area, worker was using a secondary device), the claim is approved manually. The false-positive is logged and fed back into the model as a training correction |

**Why this works for honest workers in bad weather:**

- **Cell tower mismatches during storms are expected.** Heavy rain degrades cellular signal quality. Towers in flood-prone areas go offline. The system accounts for this: if 3+ cell towers in the trigger zone report degraded signal strength during the trigger window (data available from public TRAI tower status feeds), the cell tower signal weight is reduced from 1.0 to 0.3 in the confidence calculation. The system adapts its own detection thresholds to the conditions that caused the trigger.
- **GPS drift during storms is expected.** Heavy cloud cover and rain reduce GPS accuracy from 3-5 meters to 15-30 meters. The trajectory analysis threshold expands from 2 km displacement to 4 km during active severe weather events.
- **Low battery and phone shutdowns are expected.** If a worker's sensor data stream stops mid-trigger because their phone died, the system does not penalize the missing data. It scores only the signals it received before the cutoff and applies the "moderate confidence" tier, paying out immediately with a post-payout audit.
- **The feedback loop matters.** Every false positive that a human adjuster overrides is logged as a corrective training example. The confidence model retrains weekly. Over time, the false positive rate decreases specifically for the edge cases that storms produce (tower outages, GPS drift, battery deaths). The model learns that these patterns correlate with genuine claims in bad weather, not with spoofing.

**The bottom line:** A spoofer who fakes GPS but cannot fake cell towers, Wi-Fi environment, accelerometer data, and platform order history simultaneously will be caught. An honest worker who loses cell signal in a storm will still get paid, either instantly or within 4 hours, and will never be auto-rejected without human review.

---

<div align="center">

**Team Synapse** | **GottaGO** | Guidewire DEVTrails 2026

</div>
