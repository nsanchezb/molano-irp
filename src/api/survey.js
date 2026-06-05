import { fetchWithTimeout } from './fetchWithTimeout.js'

const BASE = 'https://n36ig3n8n4.execute-api.us-east-1.amazonaws.com/prod'
const DRAFT_KEY = 'irp_draft_answers'

export function saveDraft({ surveyType, entityId, answers }) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ surveyType, entityId, answers, savedAt: Date.now() }))
  } catch { /* storage llena o bloqueada */ }
}

export function loadDraft({ surveyType, entityId }) {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw)
    if (draft.surveyType !== surveyType || draft.entityId !== entityId) return null
    return draft.answers
  } catch { return null }
}

export function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY) } catch { /* noop */ }
}

export async function submitSurvey({ token, answers }) {
  const res = await fetchWithTimeout(`${BASE}/submit-survey`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ answers }),
  })
  const data = await res.json()
  if (!res.ok) throw { status: res.status, ...data }
  return data
}
