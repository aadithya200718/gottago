def calculate_disruption_score(
    rain_mm: float, temp_c: float, aqi: float, traffic_delay: float = 1.0
) -> float:
    """Calculate compound disruption score per requirements spec.

    Formula: weighted sum of normalized rain, temperature, AQI, and traffic
    factors, scaled to 0-10. Cross-factor amplification applied when
    multiple factors are elevated simultaneously.

    Threshold: score >= 7.0 for 2+ hours triggers compound payout of Rs.300.
    """
    rain_norm = min(rain_mm / 30.0, 1.0) * 10
    temp_norm = max(0, (temp_c - 35) / 10) * 10
    aqi_norm = min(aqi / 400.0, 1.0) * 10
    traffic_norm = min(traffic_delay / 3.0, 1.0) * 10

    score = (
        rain_norm * 2.5 + temp_norm * 1.8 + aqi_norm * 2.0 + traffic_norm * 1.5
    ) / 10

    # Cross-factor amplification
    if rain_norm > 3 and traffic_norm > 3:
        score *= 1.2
    if temp_norm > 5 and aqi_norm > 5:
        score *= 1.15

    return round(min(score, 10.0), 2)
