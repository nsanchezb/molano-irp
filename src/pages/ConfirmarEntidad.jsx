import { useNavigate } from 'react-router-dom'
import { useSurvey } from '../context/SurveyContext.jsx'
import PageLayout from '../components/PageLayout.jsx'
import styles from './ConfirmarEntidad.module.css'

const PERFIL_LABEL = { ciudadania: 'Ciudadano / Ciudadana', funcionario: 'Funcionario / Contratista' }
const NIVEL_LABEL  = { nacional: 'Nacional', territorial: 'Territorial' }

export default function ConfirmarEntidad() {
  const navigate = useNavigate()
  const { survey, set } = useSurvey()
  const { surveyType, level, entityName, department } = survey

  if (!entityName) {
    navigate('/', { replace: true })
    return null
  }

  function cambiarEntidad() {
    set({ entityId: null, entityName: null, department: null })
    navigate(level === 'nacional' ? '/entidad/rama' : '/entidad/territorial')
  }

  return (
    <PageLayout paso={3} total={4} titulo="Confirma tu selección"
      subtitulo="Verifica que la entidad sea correcta antes de continuar.">

      <div className={styles.resumen}>
        <div className={styles.fila}>
          <span className={styles.etiqueta}>Perfil</span>
          <span className={styles.valor}>{PERFIL_LABEL[surveyType]}</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.fila}>
          <span className={styles.etiqueta}>Nivel</span>
          <span className={styles.valor}>{NIVEL_LABEL[level]}</span>
        </div>
        {department && (
          <>
            <div className={styles.divider} />
            <div className={styles.fila}>
              <span className={styles.etiqueta}>Departamento</span>
              <span className={styles.valor}>{department}</span>
            </div>
          </>
        )}
        <div className={styles.divider} />
        <div className={styles.filaEntidad}>
          <span className={styles.etiqueta}>Entidad a evaluar</span>
          <span className={styles.entidadNombre}>{entityName}</span>
        </div>
      </div>

      <button className={styles.cambiar} onClick={cambiarEntidad}>
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Cambiar entidad
      </button>

      <button className={styles.continuar} onClick={() => navigate('/verificar')}>
        Continuar a verificación
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <p className={styles.nota}>
        A continuación confirmaremos tu número de celular con un código SMS.
      </p>
    </PageLayout>
  )
}
