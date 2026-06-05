import { fetchWithTimeout } from './fetchWithTimeout.js'

const BASE = 'https://n36ig3n8n4.execute-api.us-east-1.amazonaws.com/prod'

export async function sendOtp(phone) {
  const res = await fetchWithTimeout(`${BASE}/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  })
  const data = await res.json()
  if (!res.ok) throw { status: res.status, ...data }
  return data
}

export async function verifyOtp({ phone, code, entityId, surveyType }) {
  const res = await fetchWithTimeout(`${BASE}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code, entityId, surveyType }),
  })
  const data = await res.json()
  if (!res.ok) throw { status: res.status, ...data }
  return data
}
