import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSurvey } from '../context/SurveyContext.jsx'
import { getCuestionario, flattenPreguntas, ESCALA } from '../data/cuestionarios.js'
import { submitSurvey } from '../api/survey.js'
import styles from './Cuestionario.module.css'

export default function Cuestionario() {
  const navigate = useNavigate()
  const { survey, set } = useSurvey()
  const { surveyType, token } = survey

  const [preguntas] = useState(() => {
    if (!surveyType) return []
    return flattenPreguntas(getCuestionario(surveyType))
  })

  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!surveyType || !token) navigate('/', { replace: true })
  }, [surveyType, token, navigate])

  if (!surveyType || !token) return null

  const total = preguntas.length
  const pregunta = preguntas[idx]
  const selected = answers[idx] ?? null
  const pct = Math.round(((idx + (selected ? 1 : 0)) / total) * 100)
  const esUltima = idx === total - 1

  const seleccionar = useCallback((value) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[idx] = value
      return next
    })
    setError(null)

    if (!esUltima) {
      setTimeout(() => setIdx((i) => i + 1), 280)
    }
  }, [idx, esUltima])

  const handleBack = () => {
    if (idx === 0) navigate(-1)
    else setIdx((i) => i - 1)
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await submitSurvey({ token, answers })
      set({ answers })
      navigate('/gracias', { replace: true })
    } catch {
      setError('No pudimos enviar tus respuestas. Verifica tu conexión e inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const puedeAvanzar = selected !== null

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
          <span className={styles.contador}>{idx + 1} / {total}</span>
        </div>

        <div className={styles.barraWrap}>
          <div
            className={styles.barra}
            style={{ width: `${pct}%`, background: pregunta.dimColor }}
          />
        </div>

        <span
          className={styles.dimBadge}
          style={{ background: pregunta.dimColor }}
        >
          {pregunta.dimNombre}
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.preguntaWrap}>
          <p className={styles.pregunta}>{pregunta.texto}</p>
          {pregunta.invertida && (
            <span className={styles.invertidaTag}>Pregunta inversa</span>
          )}
        </div>

        <div className={styles.opciones}>
          {ESCALA.map((op) => {
            const isSelected = selected === op.value
            return (
              <button
                key={op.value}
                className={`${styles.opcion} ${isSelected ? styles.opcionSeleccionada : ''}`}
                style={isSelected ? { color: pregunta.dimColor } : {}}
                onClick={() => seleccionar(op.value)}
                disabled={submitting}
              >
                <span className={styles.opcionNum}>{op.value}</span>
                <span className={styles.opcionLabel}>{op.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.footer}>
        {error && <p className={styles.error}>{error}</p>}
        {esUltima && (
          <button
            className={styles.btnSiguiente}
            onClick={handleSubmit}
            disabled={!puedeAvanzar || submitting}
          >
            {submitting
              ? <span className={styles.spinner} aria-hidden="true" />
              : 'Enviar respuestas'}
          </button>
        )}
        {!esUltima && (
          <button
            className={styles.btnSiguiente}
            onClick={() => setIdx((i) => i + 1)}
            disabled={!puedeAvanzar || submitting}
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  )
}
