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
