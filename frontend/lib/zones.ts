export const ZONES_BY_CITY: Record<string, string[]> = {
  Mumbai: ['Dharavi', 'Kurla', 'Andheri', 'Dadar', 'Bandra'],
  Delhi: ['Connaught Place', 'Rohini', 'Dwarka', 'Lajpat Nagar', 'Sadar Bazaar'],
  Bengaluru: ['Koramangala', 'HSR Layout', 'Whitefield', 'Majestic', 'Hebbal'],
}

export const CITIES = Object.keys(ZONES_BY_CITY)

export const PLATFORMS = ['Swiggy', 'Zomato', 'Both'] as const

export type Platform = (typeof PLATFORMS)[number]
export type City = keyof typeof ZONES_BY_CITY

// Zone risk scores (mirrors database disruption_zones table)
export const ZONE_RISK_SCORES: Record<string, { flood: number; aqi: number }> = {
  'Mumbai-Dharavi': { flood: 0.9, aqi: 0.5 },
  'Mumbai-Kurla': { flood: 0.8, aqi: 0.6 },
  'Mumbai-Andheri': { flood: 0.4, aqi: 0.4 },
  'Mumbai-Dadar': { flood: 0.7, aqi: 0.5 },
  'Mumbai-Bandra': { flood: 0.3, aqi: 0.3 },
  'Delhi-Connaught Place': { flood: 0.2, aqi: 0.9 },
  'Delhi-Rohini': { flood: 0.5, aqi: 0.8 },
  'Delhi-Dwarka': { flood: 0.6, aqi: 0.7 },
  'Delhi-Lajpat Nagar': { flood: 0.3, aqi: 0.8 },
  'Delhi-Sadar Bazaar': { flood: 0.4, aqi: 0.9 },
  'Bengaluru-Koramangala': { flood: 0.3, aqi: 0.4 },
  'Bengaluru-HSR Layout': { flood: 0.2, aqi: 0.3 },
  'Bengaluru-Whitefield': { flood: 0.4, aqi: 0.5 },
  'Bengaluru-Majestic': { flood: 0.5, aqi: 0.6 },
  'Bengaluru-Hebbal': { flood: 0.6, aqi: 0.4 },
}

export function getZoneKey(city: string, zone: string) {
  return `${city}-${zone}`
}
