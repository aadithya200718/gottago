import { ZONE_RISK_SCORES, getZoneKey } from './zones'

const BASE_PREMIUM = 159

/**
 * Client-side XGBoost premium estimate.
 * Used for live preview in registration form before the real API is available.
 * The actual XGBoost model runs on the backend and is more accurate.
 */
export function estimatePremium(
  city: string,
  zone: string,
  rating: number,
  hours: number,
  earnings: number
): number {
  const zoneKey = getZoneKey(city, zone)
  const risks = ZONE_RISK_SCORES[zoneKey] ?? { flood: 0.5, aqi: 0.5 }
  const month = new Date().getMonth() + 1

  const cityMultiplier =
    city === 'Mumbai' ? 0.15 : city === 'Delhi' ? 0.1 : 0.0
  const floodImpact = risks.flood * 0.6
  const aqiImpact = risks.aqi * 0.4
  const ratingDiscount = -((rating - 3.0) / 2.0) * 0.15
  const seasonImpact =
    month >= 6 && month <= 9 ? 0.2 : month >= 4 && month <= 6 ? 0.15 : 0.0

  const multiplier = Math.max(
    0.5,
    Math.min(
      2.0,
      1.0 + cityMultiplier + floodImpact + aqiImpact + ratingDiscount + seasonImpact
    )
  )

  const rawPremium = Math.round(BASE_PREMIUM * multiplier)
  const affordabilityCap = Math.round(earnings * 0.03)
  const finalPremium = Math.min(rawPremium, affordabilityCap)

  return Math.max(80, finalPremium)
}

export function estimateCoverage(earnings: number): number {
  return Math.min(Math.round(earnings * 4 * 0.55), 4800)
}
