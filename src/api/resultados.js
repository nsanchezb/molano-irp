import { fetchWithTimeout } from './fetchWithTimeout.js'

const BASE = 'https://n36ig3n8n4.execute-api.us-east-1.amazonaws.com/prod'

export async function getResultados(entityId) {
  const url = entityId
    ? `${BASE}/resultados?entityId=${encodeURIComponent(entityId)}`
    : `${BASE}/resultados`
  const res = await fetchWithTimeout(url, {}, 15000)
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function getConfig() {
  const res = await fetchWithTimeout(`${BASE}/config`, {}, 5000)
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function updateConfig(enabled, adminHash) {
  const res = await fetchWithTimeout(`${BASE}/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': adminHash,
    },
    body: JSON.stringify({ enabled }),
  }, 5000)
  const data = await res.json()
  if (!res.ok) throw data
  return data
}
