const API_BASE = typeof window === 'undefined'
  ? (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')
  : ''

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.detail || `API error ${res.status}`)
  }
  return data
}

// Workers
export const workersApi = {
  register: (body: Record<string, unknown>) =>
    apiFetch('/api/v1/workers/register', { method: 'POST', body: JSON.stringify(body) }),
  getWorker: (workerId: string) =>
    apiFetch(`/api/v1/workers/${workerId}`),
}

// Policies
export const policiesApi = {
  getPolicy: (workerId: string) =>
    apiFetch(`/api/v1/policies/${workerId}`),
  renew: (policyId: string) =>
    apiFetch(`/api/v1/policies/${policyId}/renew`, { method: 'POST' }),
  pause: (policyId: string) =>
    apiFetch(`/api/v1/policies/${policyId}/pause`, { method: 'POST' }),
  resume: (policyId: string) =>
    apiFetch(`/api/v1/policies/${policyId}/resume`, { method: 'POST' }),
}

// Premiums
export const premiumsApi = {
  calculate: (body: Record<string, unknown>) =>
    apiFetch('/api/v1/premiums/calculate', { method: 'POST', body: JSON.stringify(body) }),
  getBreakdown: (workerId: string) =>
    apiFetch(`/api/v1/premiums/${workerId}/breakdown`),
}

// Claims
export const claimsApi = {
  getClaims: (workerId: string) =>
    apiFetch(`/api/v1/claims/${workerId}`),
  getClaimDetail: (claimId: string) =>
    apiFetch(`/api/v1/claims/${claimId}/detail`),
  createManualClaim: (body: Record<string, unknown>) =>
    apiFetch('/api/v1/claims/manual', { method: 'POST', body: JSON.stringify(body) }),
  rerunFraudCheck: (claimId: string) =>
    apiFetch(`/api/v1/claims/${claimId}/fraud-check`, { method: 'POST' }),
  processPayout: (claimId: string) =>
    apiFetch(`/api/v1/claims/${claimId}/payout`, { method: 'POST' }),
}

// Triggers
export const triggersApi = {
  checkTriggers: () => apiFetch('/api/v1/triggers/check'),
  fireTrigger: (body: Record<string, unknown>) =>
    apiFetch('/api/v1/triggers/fire', { method: 'POST', body: JSON.stringify(body) }),
  getHistory: (zoneId?: string) =>
    apiFetch(`/api/v1/triggers/history${zoneId ? `?zone_id=${zoneId}` : ''}`),
}

// Admin
export const adminApi = {
  getClaimsForecast: () => apiFetch('/api/v1/admin/claims-forecast'),
  getFraudHeatmap: () => apiFetch('/api/v1/admin/fraud-heatmap'),
  getReserves: () => apiFetch('/api/v1/admin/reserves'),
}
