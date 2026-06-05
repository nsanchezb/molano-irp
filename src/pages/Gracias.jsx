import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSurvey } from '../context/SurveyContext.jsx'
import styles from './Gracias.module.css'

export default function Gracias() {
  const navigate = useNavigate()
  const { survey, reset } = useSurvey()
  const { entityName, surveyType } = survey

  useEffect(() => {
    if (!entityName) navigate('/', { replace: true })
  }, [entityName, navigate])

  if (!entityName) return null

  const tipoLabel = surveyType === 'funcionario' ? 'Servidor público' : 'Ciudadano'

  function handleNueva() {
    reset()
    navigate('/', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icono}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className={styles.titulo}>¡Gracias por participar!</h1>

        <p className={styles.subtitulo}>
          Tu evaluación como <strong>{tipoLabel}</strong> ha sido registrada exitosamente.
          Tu voz contribuye a mejorar la gestión pública en Colombia.
        </p>

        <div className={styles.entidad}>{entityName}</div>

        <div className={styles.divider} />

        <p className={styles.mensaje}>
          Tus respuestas son anónimas y serán procesadas para construir el
          Índice de Reputación Pública — IRP.
        </p>

        <button className={styles.btnNuevo} onClick={handleNueva}>
          Evaluar otra entidad
        </button>
      </div>
    </div>
  )
}
