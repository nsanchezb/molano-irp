import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useSurvey } from '../context/SurveyContext.jsx'
import { useEntidades } from '../hooks/useEntidades.js'
import styles from './Bienvenida.module.css'

function lookupEntity(entData, entityId) {
  const id = String(entityId)
  for (const rama of entData.ramas ?? []) {
    if (rama.t === 's') {
      for (const sector of rama.d ?? []) {
        const e = sector.e?.find((x) => String(x.i) === id)
        if (e) return { id: e.i, name: e.n, department: null }
      }
    } else {
      const e = rama.d?.find((x) => String(x.i) === id)
      if (e) return { id: e.i, name: e.n, department: null }
    }
  }
  for (const dep of entData.deps ?? []) {
    const e = dep.e?.find((x) => String(x.i) === id)
    if (e) return { id: e.i, name: e.n, department: dep.d }
  }
  return null
}

export default function Bienvenida() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { set, reset } = useSurvey()
  const [aceptado, setAceptado] = useState(false)
  const entityParam = searchParams.get('entity')
  const { data: entData } = useEntidades()
  const [entityInfo, setEntityInfo] = useState(null)

  useEffect(() => {
    reset()
  }, [])

  useEffect(() => {
    if (!entityParam || !entData) return
    const info = lookupEntity(entData, entityParam)
    if (info) {
      setEntityInfo(info)
      set({ entityId: info.id, entityName: info.name, department: info.department ?? null })
    }
  }, [entityParam, entData])

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <span className={styles.badge}>Por Vencejo Consultores</span>
          <h1 className={styles.titulo}>IRP</h1>
          <p className={styles.subtitulo}>Índice de Reputación Pública</p>
        </header>

        {entityInfo && (
          <div className={styles.entityBanner}>
            <span className={styles.entityBannerLabel}>Vas a evaluar</span>
            <span className={styles.entityBannerName}>{entityInfo.name}</span>
            {entityInfo.department && (
              <span className={styles.entityBannerDep}>{entityInfo.department}</span>
            )}
          </div>
        )}

        <div className={styles.separador} />

        <section className={styles.intro}>
          <p>
            Nos complace que estés aquí. A diferencia del sector privado —donde priman los
            resultados financieros o la calidad comercial—, en lo público la reputación se
            cimienta en el <strong>cumplimiento misional</strong>, la <strong>integridad</strong>{' '}
            y el <strong>impacto real en la ciudadanía</strong>.
          </p>
          <p>
            Por primera vez se ha diseñado un instrumento totalmente independiente, sin
            injerencia de la administración pública. El objetivo: conocer la percepción real
            de ciudadanos/as y servidores públicos frente a la gestión de las entidades que
            prestan los servicios del Estado.
          </p>
          <p className={styles.cierre}>
            Porque la confianza pública comienza por escucharnos, <strong>bienvenidos</strong>.
          </p>
        </section>

        <div className={styles.escala}>
          <p className={styles.escalaLabel}>Escala de evaluación</p>
          <div className={styles.escalaItems}>
            {[
              { val: 1, label: 'Muy bajo' },
              { val: 2, label: 'Bajo' },
              { val: 3, label: 'Medio' },
              { val: 4, label: 'Alto' },
              { val: 5, label: 'Muy alto' },
            ].map(({ val, label }) => (
              <div key={val} className={styles.escalaItem}>
                <span className={styles.escalaNum}>{val}</span>
                <span className={styles.escalaText}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <label className={styles.checkWrap}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={aceptado}
            onChange={(e) => {
              setAceptado(e.target.checked)
              if (e.target.checked) set({ consentAt: Math.floor(Date.now() / 1000) })
            }}
          />
          <span className={styles.checkText}>
            He leído y acepto la{' '}
            <Link to="/politica-datos" className={styles.checkLink} onClick={(e) => e.stopPropagation()}>
              Política de Tratamiento de Datos Personales
            </Link>
            {' '}y autorizo el tratamiento de mis datos conforme a ella.
          </span>
        </label>

        <button
          className={styles.cta}
          onClick={() => navigate('/perfil')}
          disabled={!aceptado}
          aria-label="Comenzar la evaluación"
        >
          Comenzar evaluación
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <footer className={styles.footer}>
          <p>Instrumento independiente · Sin injerencia gubernamental</p>
        </footer>
      </div>
    </div>
  )
}
