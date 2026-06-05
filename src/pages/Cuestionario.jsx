import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSurvey } from '../context/SurveyContext.jsx'
import { getCuestionario, flattenAnswers } from '../data/cuestionarios.js'
import { submitSurvey, saveDraft, loadDraft, clearDraft } from '../api/survey.js'
import styles from './Cuestionario.module.css'

const ESCALA_MIN = 'Muy bajo'
const ESCALA_MAX = 'Muy alto'

function errorMsg(err) {
  if (err?.error === 'timeout') return 'La solicitud tardó demasiado. Verifica tu conexión e inténtalo de nuevo.'
  if (err?.error === 'network') return 'Sin conexión. Conéctate a internet e inténtalo de nuevo.'
  if (err?.error === 'token_expired') return 'Tu sesión expiró. Vuelve a verificar tu número de celular.'
  return 'No pudimos enviar tus respuestas. Inténtalo de nuevo.'
}

export default function Cuestionario() {
  const navigate = useNavigate()
  const { survey, set } = useSurvey()
  const { surveyType, token, entityId, consentAt } = survey

  const cuestionario = surveyType ? getCuestionario(surveyType) : null
  const dims = cuestionario?.dimensiones ?? []

  const [dimIdx, setDimIdx] = useState(0)
  const [answers, setAnswers] = useState(() => {
    if (!surveyType || !entityId) return []
    const draft = loadDraft({ surveyType, entityId })
    return draft ? rebuildAnswers2d(dims, draft) : []
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!surveyType || !token) navigate('/', { replace: true })
  }, [surveyType, token, navigate])

  if (!surveyType || !token || !dims.length) return null

  const dim = dims[dimIdx]
  const totalDims = dims.length
  const esUltima = dimIdx === totalDims - 1
  const pct = Math.round(((dimIdx + 1) / totalDims) * 100)

  const dimAnswers = answers[dimIdx] ?? []
  const todasRespondidas = dim.preguntas.every((_, qi) => dimAnswers[qi] != null)

  function seleccionar(qi, value) {
    setAnswers((prev) => {
      const next = [...prev]
      const da = [...(next[dimIdx] ?? [])]
      da[qi] = value
      next[dimIdx] = da
      return next
    })
    setError(null)
  }

  function handleBack() {
    if (dimIdx === 0) navigate(-1)
    else { setDimIdx((i) => i - 1); setError(null) }
  }

  async function handleSiguiente() {
    if (!todasRespondidas) {
      setError('Responde todas las preguntas antes de continuar.')
      return
    }
    if (!esUltima) {
      setDimIdx((i) => i + 1)
      setError(null)
      return
    }

    const flat = flattenAnswers(cuestionario, answers)
    saveDraft({ surveyType, entityId, answers: flat })

    setSubmitting(true)
    setError(null)
    try {
      await submitSurvey({ token, answers: flat, consentAt })
      clearDraft()
      set({ answers: flat })
      navigate('/gracias', { replace: true })
    } catch (err) {
      if (err?.error === 'token_expired') {
        navigate('/verificar', { replace: true })
        return
      }
      setError(errorMsg(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.nav}>
          <button className={styles.back} onClick={handleBack} disabled={submitting}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M16 10H4M9 5l-5 5 5 5" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Volver
          </button>
          <span className={styles.dimLabel}>Dimensión {dimIdx + 1} de {totalDims}</span>
        </div>

        <div className={styles.barraWrap}>
          <div className={styles.barra} style={{ width: `${pct}%`, background: dim.color }} />
        </div>

        <span className={styles.dimBadge} style={{ background: dim.color }}>
          {dim.nombre}
        </span>
      </div>

      <div className={styles.body}>
        {dim.aviso && (
          <div className={styles.aviso}>
            <span>⚠️</span>
            <span>{dim.aviso}</span>
          </div>
        )}

        {dim.preguntas.map((p, qi) => {
          const val = dimAnswers[qi] ?? null
          return (
            <div key={qi} className={styles.preguntaCard}>
              <span className={styles.preguntaLabel}>{p.label}</span>
              <p className={styles.preguntaTexto}>{p.texto}</p>

              <div className={styles.escala}>
                <div className={styles.escalaOpciones}>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const activo = val === n
                    return (
                      <button
                        key={n}
                        className={`${styles.escalaBtn} ${activo ? styles.escalaBtnActivo : ''}`}
                        style={activo ? { background: dim.color, borderColor: dim.color } : {}}
                        onClick={() => seleccionar(qi, n)}
                        disabled={submitting}
                        aria-label={`${n} de 5`}
                        aria-pressed={activo}
                      >
                        {n}
                      </button>
                    )
                  })}
                </div>
                <div className={styles.escalaLabels}>
                  <span className={styles.escalaLabelMin}>{ESCALA_MIN}</span>
                  <span className={styles.escalaLabelMax}>{ESCALA_MAX}</span>
                </div>
              </div>
            </div>
          )
        })}

        {error && <p className={styles.error} role="alert">{error}</p>}
        <button
          className={styles.btnSiguiente}
          onClick={handleSiguiente}
          disabled={submitting}
        >
          {submitting
            ? <span className={styles.spinner} aria-hidden="true" />
            : esUltima ? 'Enviar evaluación' : 'Siguiente dimensión →'}
        </button>
      </div>
    </div>
  )
}

function rebuildAnswers2d(dims, flat) {
  const result = []
  let i = 0
  for (const dim of dims) {
    const da = []
    for (let q = 0; q < dim.preguntas.length; q++) {
      da[q] = flat[i] ?? null
      i++
    }
    result.push(da)
  }
  return result
}
