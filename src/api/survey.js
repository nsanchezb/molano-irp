const BASE = 'https://n36ig3n8n4.execute-api.us-east-1.amazonaws.com/prod'

export async function submitSurvey({ token, answers }) {
  const res = await fetch(`${BASE}/submit-survey`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ answers }),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}
