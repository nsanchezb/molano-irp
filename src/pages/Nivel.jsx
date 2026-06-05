import { useNavigate } from 'react-router-dom'
import { useSurvey } from '../context/SurveyContext.jsx'
import PageLayout from '../components/PageLayout.jsx'
import styles from './Seleccion.module.css'

const NIVELES = [
  {
    nivel: 'nacional',
    titulo: 'Entidad Nacional',
    descripcion: 'Ministerios, entidades del gobierno central, instituciones que operan en todo el país.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="2.2" />
        <path d="M3 14h22M14 3c-3 4-4 7-4 11s1 7 4 11M14 3c3 4 4 7 4 11s-1 7-4 11"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    nivel: 'territorial',
    titulo: 'Entidad Territorial',
    descripcion: 'Gobernaciones, alcaldías, secretarías departamentales o municipales.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M14 3C9.582 3 6 6.582 6 11c0 6.627 8 15 8 15s8-8.373 8-15c0-4.418-3.582-8-8-8z"
          stroke="currentColor" strokeWidth="2.2" />
        <circle cx="14" cy="11" r="3" stroke="currentColor" strokeWidth="2.2" />
      </svg>
    ),
  },
]

export default function Nivel() {
  const navigate = useNavigate()
  const { set } = useSurvey()

  function elegir(nivel) {
    set({ level: nivel })
    navigate(nivel === 'nacional' ? '/entidad/rama' : '/entidad/territorial')
  }

  return (
    <PageLayout paso={2} titulo="¿Qué tipo de entidad vas a evaluar?"
      subtitulo="Selecciona el nivel de la entidad pública.">
      <div className={styles.opciones}>
        {NIVELES.map(({ nivel, titulo, descripcion, icon }) => (
          <button key={nivel} className={styles.opcion} onClick={() => elegir(nivel)}>
            <span className={styles.icono}>{icon}</span>
            <span className={styles.opcionTexto}>
              <span className={styles.opcionTitulo}>{titulo}</span>
              <span className={styles.opcionDesc}>{descripcion}</span>
            </span>
            <svg className={styles.chevron} width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </PageLayout>
  )
}
