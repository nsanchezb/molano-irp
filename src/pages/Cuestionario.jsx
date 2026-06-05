import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSurvey } from '../context/SurveyContext.jsx'
import { getCuestionario, flattenAnswers } from '../data/cuestionarios.js'
import { submitSurvey } from '../api/survey.js'
import styles from './Cuestionario.module.css'

const ESCALA_MIN = 'Muy bajo'
const ESCALA_MAX = 'Muy alto'

export default function Cuestionario() {
  const navigate = useNavigate()
  const { survey, set } = useSurvey()
  const { surveyType, token } = survey

  const cuestionario = surveyType ? getCuestionario(surveyType) : null
  const dims = cuestionario?.dimensiones ?? []

  const [dimIdx, setDimIdx] = useState(0)
  const [answers, setAnswers] = useState([])
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
    setSubmitting(true)
    setError(null)
    try {
      const flat = flattenAnswers(cuestionario, answers)
      await submitSurvey({ token, answers: flat })
      set({ answers: flat })
      navigate('/gracias', { replace: true })
    } catch {
      setError('No pudimos enviar tus respuestas. Verifica tu conexión e inténtalo de nuevo.')
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
      </div>

      <div className={styles.footer}>
        {error && <p className={styles.error}>{error}</p>}
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
