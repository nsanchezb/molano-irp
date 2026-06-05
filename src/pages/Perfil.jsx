import { useNavigate } from 'react-router-dom'
import { useSurvey } from '../context/SurveyContext.jsx'
import styles from './Perfil.module.css'

const PERFILES = [
  {
    tipo: 'ciudadania',
    titulo: 'Ciudadano / Ciudadana',
    descripcion:
      'Evalúa la entidad pública desde tu experiencia como usuario de sus servicios, trámites y programas.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="10" r="5" stroke="currentColor" strokeWidth="2.2" />
        <path d="M6 28c0-5.523 4.477-10 10-10s10 4.477 10 10"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    tipo: 'funcionario',
    titulo: 'Funcionario / Contratista',
    descripcion:
      'Evalúa la entidad en la que trabajas desde adentro: liderazgo, meritocracia, innovación y blindaje institucional.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="6" y="14" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2.2" />
        <path d="M11 14V10a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="16" cy="21" r="2" fill="currentColor" />
      </svg>
    ),
  },
]

export default function Perfil() {
  const navigate = useNavigate()
  const { set } = useSurvey()

  function elegir(tipo) {
    set({ surveyType: tipo })
    navigate('/nivel')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <button className={styles.back} onClick={() => navigate('/')} aria-label="Volver">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M16 10H4M9 5l-5 5 5 5" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver
        </button>

        <header className={styles.header}>
          <span className={styles.paso}>Paso 1 de 4</span>
          <h2 className={styles.titulo}>¿Cómo participas?</h2>
          <p className={styles.sub}>
            Selecciona tu perfil para ver el cuestionario correspondiente.
          </p>
        </header>

        <div className={styles.opciones}>
          {PERFILES.map(({ tipo, titulo, descripcion, icon }) => (
            <button
              key={tipo}
              className={styles.opcion}
              onClick={() => elegir(tipo)}
              aria-label={`Participar como ${titulo}`}
            >
              <span className={styles.icono}>{icon}</span>
              <span className={styles.opcionTexto}>
                <span className={styles.opcionTitulo}>{titulo}</span>
                <span className={styles.opcionDesc}>{descripcion}</span>
              </span>
              <svg className={styles.chevron} width="18" height="18" viewBox="0 0 20 20"
                fill="none" aria-hidden="true">
                <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>

        <p className={styles.nota}>
          Tu respuesta es <strong>anónima</strong>. Solo se usará tu número de celular para
          confirmar que eres una persona real.
        </p>
      </div>
    </div>
  )
}
