import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { isAuthenticated, logout } from '../../hooks/useDashboardAuth.js'
import { getResultados } from '../../api/resultados.js'
import { useEntidades } from '../../hooks/useEntidades.js'
import styles from './Ranking.module.css'

function scoreClass(v) {
  if (v == null) return styles.scoreNA
  if (v >= 3.5) return styles.scoreAlto
  if (v >= 2.5) return styles.scoreMedio
  return styles.scoreBajo
}

function exportCSV(entities, getEntityName) {
  const header = 'entityId,entidad,irpGlobal,irpCiudadania,nCiudadania,irpFuncionario,nFuncionario'
  const rows = entities.map((e) => [
    e.entityId,
    `"${getEntityName(e.entityId)}"`,
    e.irpGlobal ?? '',
    e.ciudadania?.total ?? '',
    e.ciudadania?.n ?? '',
    e.funcionario?.total ?? '',
    e.funcionario?.n ?? '',
  ].join(','))
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `irp-resultados-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Ranking() {
  const navigate = useNavigate()
  const { data: entData } = useEntidades()
  const [resultados, setResultados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/dashboard/login', { replace: true }); return }
    getResultados()
      .then((d) => setResultados(d))
      .catch(() => setError('No se pudieron cargar los resultados. Verifica tu conexión.'))
      .finally(() => setLoading(false))
  }, [navigate])

  function getEntityName(entityId) {
    if (!entData) return entityId
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

  function handleLogout() { logout(); navigate('/dashboard/login', { replace: true }) }

  const entities = resultados?.entities ?? []
  const filtradas = busqueda
    ? entities.filter((e) => getEntityName(e.entityId).toLowerCase().includes(busqueda.toLowerCase()))
    : entities

  const totalResp = entities.reduce((s, e) => s + (e.ciudadania?.n ?? 0) + (e.funcionario?.n ?? 0), 0)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logoText}>IRP</span>
          <span className={styles.headerSub}>Dashboard de Resultados</span>
        </div>
        <button className={styles.btnLogout} onClick={handleLogout}>Cerrar sesión</button>
      </div>

      <div className={styles.body}>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statVal}>{entities.length}</div>
            <div className={styles.statLabel}>Entidades evaluadas</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statVal}>{totalResp}</div>
            <div className={styles.statLabel}>Respuestas totales</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statVal}>
              {entities.length > 0 ? (entities.reduce((s, e) => s + e.irpGlobal, 0) / entities.length).toFixed(2) : '—'}
            </div>
            <div className={styles.statLabel}>IRP promedio</div>
          </div>
        </div>

        <div className={styles.topBar}>
          <input
            className={styles.buscador}
            type="search"
            placeholder="Buscar entidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {entities.length > 0 && (
            <button className={styles.btnExportar} onClick={() => exportCSV(filtradas, getEntityName)}>
              ↓ CSV
            </button>
          )}
        </div>

        {loading && <div className={styles.loading}>Cargando resultados…</div>}
        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && (
          <div className={styles.tabla}>
            <div className={styles.filaHeader}>
              <span>#</span>
              <span>Entidad</span>
              <span style={{ textAlign: 'center' }}>IRP Global</span>
              <span style={{ textAlign: 'center' }}>Ciudadanía</span>
              <span style={{ textAlign: 'center' }}>Funcionario</span>
              <span style={{ textAlign: 'center' }}>Respuestas</span>
            </div>

            {filtradas.length === 0 && (
              <div className={styles.vacio}>
                {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay entidades con suficientes respuestas aún.'}
              </div>
            )}

            {filtradas.map((e, idx) => (
              <Link key={e.entityId} className={styles.fila} to={`/dashboard/entidad/${e.entityId}`}>
                <span className={styles.pos}>{idx + 1}</span>
                <span className={styles.nombre}>{getEntityName(e.entityId)}</span>
                <span className={`${styles.score} ${scoreClass(e.irpGlobal)}`}>
                  {e.irpGlobal?.toFixed(2) ?? '—'}
                </span>
                <span className={`${styles.score} ${scoreClass(e.ciudadania?.total)}`}>
                  {e.ciudadania?.total?.toFixed(2) ?? '—'}
                </span>
                <span className={`${styles.score} ${scoreClass(e.funcionario?.total)}`}>
                  {e.funcionario?.total?.toFixed(2) ?? '—'}
                </span>
                <span className={styles.n}>
                  {(e.ciudadania?.n ?? 0) + (e.funcionario?.n ?? 0)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
