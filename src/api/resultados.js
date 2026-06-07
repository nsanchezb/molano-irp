import { fetchWithTimeout } from './fetchWithTimeout.js'

const BASE = 'https://indicereputacionpublica.co/prod'

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

// Valida la contraseña contra el backend y retorna un token efímero (8h).
// La contraseña nunca se almacena en el cliente después de esta llamada.
export async function loginAdmin(password) {
  const res = await fetchWithTimeout(`${BASE}/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': password,
    },
    body: JSON.stringify({ action: 'check' }),
  }, 5000)
  const data = await res.json()
  if (!res.ok) throw new Error('unauthorized')
  return data.token
}

export async function updateConfig(enabled, token) {
  const res = await fetchWithTimeout(`${BASE}/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': token,
    },
    body: JSON.stringify({ enabled }),
  }, 5000)
  const data = await res.json()
  if (!res.ok) throw data
  return data
}
