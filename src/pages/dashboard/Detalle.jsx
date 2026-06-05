import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { isAuthenticated } from '../../hooks/useDashboardAuth.js'
import { getResultados } from '../../api/resultados.js'
import { useEntidades } from '../../hooks/useEntidades.js'
import RadarChart from '../../components/RadarChart.jsx'
import styles from './Detalle.module.css'

const DIMS_CIUDADANIA = [
  { id: 'confianza',     nombre: 'Confianza e Integridad' },
  { id: 'gestion',       nombre: 'Gestión e Impacto Social' },
  { id: 'transparencia', nombre: 'Transparencia Percibida' },
  { id: 'comunicacion',  nombre: 'Comunicación y Pedagogía' },
  { id: 'identidad',     nombre: 'Identidad Emocional' },
  { id: 'estrategica',   nombre: 'Estratégica' },
]

const DIMS_FUNCIONARIO = [
  { id: 'compensacion',  nombre: 'Compensación y Equidad' },
  { id: 'desarrollo',    nombre: 'Desarrollo Profesional' },
  { id: 'gobernanza',    nombre: 'Gobernanza y Liderazgo' },
  { id: 'innovacion',    nombre: 'Innovación Pública' },
  { id: 'blindaje',      nombre: 'Blindaje Institucional' },
]

function scoreColor(v) {
  if (v == null) return styles.colorNA
  if (v >= 3.5) return styles.colorAlto
  if (v >= 2.5) return styles.colorMedio
  return styles.colorBajo
}

function BarDims({ dims, scores, color }) {
  if (!scores) return <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sin datos suficientes</p>
  return dims.map((d) => {
    const val = scores[d.id]
    const pct = val != null ? ((val - 1) / 4) * 100 : 0
    return (
      <div key={d.id} className={styles.dimRow}>
        <div className={styles.dimRowInner}>
          <div className={styles.dimBar} style={{ flex: 1 }}>
            <div className={styles.dimBarFill} style={{ width: `${pct}%`, background: color }} />
          </div>
          <span className={styles.dimScore}>{val?.toFixed(2) ?? '—'}</span>
        </div>
        <span className={styles.dimNombre}>{d.nombre}</span>
      </div>
    )
  })
}

export default function Detalle() {
  const navigate = useNavigate()
  const { entityId } = useParams()
  const { data: entData } = useEntidades()
  const [entity, setEntity] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/dashboard/login', { replace: true }); return }
    getResultados(entityId)
      .then((d) => setEntity(d.entities?.[0] ?? null))
      .finally(() => setLoading(false))
  }, [entityId, navigate])

  function getEntityName() {
    if (!entData || !entityId) return entityId
    for (const rama of entData.ramas) {
      if (rama.t === 's') {
        for (const sector of rama.d) {
          const e = sector.e.find((x) => String(x.i) === String(entityId))
          if (e) return e.n
        }
      } else {
        const e = rama.d.find((x) => String(x.i) === String(entityId))
        if (e) return e.n
      }
    }
    for (const dep of entData.deps ?? []) {
      const e = dep.e.find((x) => String(x.i) === String(entityId))
      if (e) return e.n
    }
    return entityId
  }

  const entityName = getEntityName()

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/dashboard')}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M16 10H4M9 5l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Ranking
        </button>
        <span className={styles.headerTitle}>{entityName}</span>
      </div>

      <div className={styles.body}>
        {loading && <div className={styles.loading}>Cargando…</div>}

        {!loading && !entity && (
          <div className={styles.loading}>No hay suficientes respuestas para esta entidad.</div>
        )}

        {!loading && entity && (
          <>
            <div className={styles.hero}>
              <span className={styles.heroNombre}>{entityName}</span>
              <div className={styles.heroScores}>
                {[
                  { label: 'IRP Global', val: entity.irpGlobal },
                  { label: 'Ciudadanía', val: entity.ciudadania?.total },
                  { label: 'Funcionario', val: entity.funcionario?.total },
                ].map(({ label, val }) => (
                  <div key={label} className={styles.heroScore}>
                    <span className={`${styles.heroScoreVal} ${scoreColor(val)}`}>
                      {val?.toFixed(2) ?? '—'}
                    </span>
                    <span className={styles.heroScoreLabel}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                {entity.ciudadania && <span>Ciudadanía: {entity.ciudadania.n} respuestas</span>}
                {entity.funcionario && <span>Funcionario: {entity.funcionario.n} respuestas</span>}
              </div>
            </div>

            {/* Radar chart */}
            <div className={styles.card}>
              <span className={styles.cardTitle}>Radar por dimensión</span>
              <div className={styles.leyenda}>
                <span><span className={styles.leyendaDot} style={{ background: '#1a3c5e' }} /> Ciudadanía</span>
                <span><span className={styles.leyendaDot} style={{ background: '#0f766e' }} /> Funcionario</span>
              </div>
              <RadarChart
                dims={DIMS_CIUDADANIA}
                ciudadania={entity.ciudadania?.dims}
                funcionario={null}
              />
              {entity.funcionario && (
                <RadarChart
                  dims={DIMS_FUNCIONARIO}
                  ciudadania={null}
                  funcionario={entity.funcionario?.dims}
                />
              )}
            </div>

            <div className={styles.grid}>
              <div className={styles.card}>
                <span className={styles.cardTitle} style={{ color: '#1a3c5e' }}>● Ciudadanía</span>
                <BarDims dims={DIMS_CIUDADANIA} scores={entity.ciudadania?.dims} color="#1a3c5e" />
                {entity.ciudadania && <span className={styles.nResp}>n = {entity.ciudadania.n}</span>}
              </div>
              <div className={styles.card}>
                <span className={styles.cardTitle} style={{ color: '#0f766e' }}>● Funcionario</span>
                <BarDims dims={DIMS_FUNCIONARIO} scores={entity.funcionario?.dims} color="#0f766e" />
                {entity.funcionario && <span className={styles.nResp}>n = {entity.funcionario.n}</span>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
