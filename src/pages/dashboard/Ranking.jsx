import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { isAuthenticated, logout } from '../../hooks/useDashboardAuth.js'
import { getResultados } from '../../api/resultados.js'
import { useEntidades } from '../../hooks/useEntidades.js'
import styles from './Ranking.module.css'

function chipClass(v) {
  if (v == null) return styles.chipNA
  if (v >= 3.5) return styles.chipAlto
  if (v >= 2.5) return styles.chipMedio
  return styles.chipBajo
}

function colorClass(v) {
  if (v == null) return styles.colorNA
  if (v >= 3.5) return styles.colorAlto
  if (v >= 2.5) return styles.colorMedio
  return styles.colorBajo
}

function bgClass(v) {
  if (v == null) return ''
  if (v >= 3.5) return styles.bgAlto
  if (v >= 2.5) return styles.bgMedio
  return styles.bgBajo
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
  const [filtroTipo, setFiltroTipo] = useState('')   // '' | 'nacional' | 'territorial'
  const [filtroRama, setFiltroRama] = useState('')
  const [filtroSector, setFiltroSector] = useState('')
  const [filtroDep, setFiltroDep] = useState('')
  const [filtroMun, setFiltroMun] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/dashboard/login', { replace: true }); return }
    getResultados()
      .then((d) => setResultados(d))
      .catch(() => setError('No se pudieron cargar los resultados. Verifica tu conexión.'))
      .finally(() => setLoading(false))
  }, [navigate])

  // Build lookup: entityId → { tipo, rama, sector, dep }
  const entityMeta = useMemo(() => {
    if (!entData) return {}
    const map = {}
    for (const rama of entData.ramas ?? []) {
      if (rama.t === 's') {
        for (const sector of rama.d ?? []) {
          for (const e of sector.e ?? []) {
            map[String(e.i)] = { tipo: 'nacional', rama: rama.r, sector: sector.s, dep: null }
          }
        }
      } else {
        for (const e of rama.d ?? []) {
          map[String(e.i)] = { tipo: 'nacional', rama: rama.r, sector: null, dep: null }
        }
      }
    }
    for (const dep of entData.deps ?? []) {
      for (const e of dep.e ?? []) {
        map[String(e.i)] = { tipo: 'territorial', rama: null, sector: null, dep: dep.d, mun: e.m ?? null }
      }
    }
    return map
  }, [entData])

  function getEntityName(entityId) {
    if (!entData) return entityId
    for (const rama of entData.ramas ?? []) {
      if (rama.t === 's') {
        for (const sector of rama.d ?? []) {
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

  // Filter options derived from entData
  const ramasOpts = useMemo(() => entData?.ramas?.map((r) => r.r) ?? [], [entData])
  const ramaSelObj = useMemo(() => entData?.ramas?.find((r) => r.r === filtroRama), [entData, filtroRama])
  const sectoresOpts = useMemo(() => ramaSelObj?.t === 's' ? ramaSelObj.d.map((s) => s.s) : [], [ramaSelObj])
  const depsOpts = useMemo(() => entData?.deps?.map((d) => d.d) ?? [], [entData])
  const munOpts = useMemo(() => {
    if (!filtroDep || !entData) return []
    const dep = entData.deps?.find((d) => d.d === filtroDep)
    if (!dep) return []
    const set = new Set(dep.e.map((e) => e.m).filter(Boolean))
    return [...set].sort(new Intl.Collator('es').compare)
  }, [filtroDep, entData])

  const entities = resultados?.entities ?? []

  const filtradas = useMemo(() => {
    return entities.filter((e) => {
      const meta = entityMeta[String(e.entityId)]
      const name = getEntityName(e.entityId)

      if (busqueda && !name.toLowerCase().includes(busqueda.toLowerCase())) return false
      if (filtroTipo && meta?.tipo !== filtroTipo) return false
      if (filtroRama && meta?.rama !== filtroRama) return false
      if (filtroSector && meta?.sector !== filtroSector) return false
      if (filtroDep && meta?.dep !== filtroDep) return false
      if (filtroMun && meta?.mun !== filtroMun) return false
      return true
    })
  }, [entities, entityMeta, busqueda, filtroTipo, filtroRama, filtroSector, filtroDep, filtroMun])

  const totalResp = filtradas.reduce((s, e) => s + (e.ciudadania?.n ?? 0) + (e.funcionario?.n ?? 0), 0)
  const irpProm = filtradas.length > 0
    ? (filtradas.reduce((s, e) => s + (e.irpGlobal ?? 0), 0) / filtradas.length).toFixed(2)
    : '—'

  const maxIrp = entities.length > 0 ? Math.max(...entities.map((e) => e.irpGlobal ?? 0)) : 5

  function clearFiltros() {
    setFiltroTipo(''); setFiltroRama(''); setFiltroSector(''); setFiltroDep(''); setFiltroMun('')
  }
  const hayFiltros = filtroTipo || filtroRama || filtroSector || filtroDep || filtroMun

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logoRow}>
            <span className={styles.logoBadge}>IRP</span>
            <span className={styles.headerTitle}>Índice de Reputación Pública</span>
          </div>
          <span className={styles.headerSub}>Dashboard de Resultados · {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })}</span>
        </div>
        <button className={styles.btnLogout} onClick={handleLogout}>Cerrar sesión</button>
      </div>

      <div className={styles.body}>
        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🏛️</div>
            <div className={styles.statVal}>{filtradas.length}</div>
            <div className={styles.statLabel}>{hayFiltros ? 'Entidades filtradas' : 'Entidades evaluadas'}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📋</div>
            <div className={styles.statVal}>{totalResp}</div>
            <div className={styles.statLabel}>Respuestas totales</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⭐</div>
            <div className={styles.statVal}>{irpProm}</div>
            <div className={styles.statLabel}>IRP promedio</div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtros}>
          <div className={styles.filtrosRow}>
            <select
              className={styles.selectFiltro}
              value={filtroTipo}
              onChange={(e) => { setFiltroTipo(e.target.value); setFiltroRama(''); setFiltroSector(''); setFiltroDep('') }}
            >
              <option value="">Todos los tipos</option>
              <option value="nacional">Nacional</option>
              <option value="territorial">Territorial</option>
            </select>

            {filtroTipo === 'nacional' && (
              <select
                className={styles.selectFiltro}
                value={filtroRama}
                onChange={(e) => { setFiltroRama(e.target.value); setFiltroSector('') }}
              >
                <option value="">Todas las ramas</option>
                {ramasOpts.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            )}

            {filtroTipo === 'nacional' && sectoresOpts.length > 0 && (
              <select
                className={styles.selectFiltro}
                value={filtroSector}
                onChange={(e) => setFiltroSector(e.target.value)}
              >
                <option value="">Todos los sectores</option>
                {sectoresOpts.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}

            {filtroTipo === 'territorial' && (
              <select
                className={styles.selectFiltro}
                value={filtroDep}
                onChange={(e) => { setFiltroDep(e.target.value); setFiltroMun('') }}
              >
                <option value="">Todos los departamentos</option>
                {depsOpts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            )}

            {filtroTipo === 'territorial' && filtroDep && munOpts.length > 0 && (
              <select
                className={styles.selectFiltro}
                value={filtroMun}
                onChange={(e) => setFiltroMun(e.target.value)}
              >
                <option value="">Todos los municipios</option>
                {munOpts.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            )}

            {hayFiltros && (
              <button className={styles.btnLimpiar} onClick={clearFiltros}>✕ Limpiar</button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.buscadorWrap}>
            <svg className={styles.buscadorIcon} width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              className={styles.buscador}
              type="search"
              placeholder="Buscar entidad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          {entities.length > 0 && (
            <button className={styles.btnExportar} onClick={() => exportCSV(filtradas, getEntityName)}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M10 3v10M6 9l4 4 4-4M4 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Exportar CSV
            </button>
          )}
        </div>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Cargando resultados…</span>
          </div>
        )}
        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && (
          <div className={styles.tabla}>
            <div className={styles.filaHeader}>
              <span>#</span>
              <span>Entidad</span>
              <span>IRP Global</span>
              <span>Ciudadanía</span>
              <span>Funcionario</span>
              <span>Resp.</span>
            </div>

            {filtradas.length === 0 && (
              <div className={styles.vacio}>
                {busqueda || hayFiltros
                  ? 'Sin entidades que coincidan con los filtros aplicados.'
                  : 'No hay entidades con suficientes respuestas aún.'}
              </div>
            )}

            {filtradas.map((e, idx) => {
              const irpPct = maxIrp > 0 ? ((e.irpGlobal ?? 0) / maxIrp) * 100 : 0
              const totalN = (e.ciudadania?.n ?? 0) + (e.funcionario?.n ?? 0)
              return (
                <Link key={e.entityId} className={styles.fila} to={`/dashboard/entidad/${e.entityId}`}>
                  <span className={`${styles.pos} ${idx < 3 ? styles.posTop : ''}`}>{idx + 1}</span>
                  <span className={styles.nombre}>{getEntityName(e.entityId)}</span>

                  {/* IRP Global con barra */}
                  <div className={styles.scoreWrap}>
                    <div className={styles.scoreRow}>
                      <span className={`${styles.scoreNum} ${colorClass(e.irpGlobal)}`}>
                        {e.irpGlobal?.toFixed(2) ?? '—'}
                      </span>
                    </div>
                    <div className={styles.scoreMiniBar}>
                      <div className={`${styles.scoreMiniBarFill} ${bgClass(e.irpGlobal)}`} style={{ width: `${irpPct}%` }} />
                    </div>
                  </div>

                  <span className={`${styles.scoreChip} ${chipClass(e.ciudadania?.total)}`}>
                    {e.ciudadania?.total?.toFixed(2) ?? '—'}
                  </span>
                  <span className={`${styles.scoreChip} ${chipClass(e.funcionario?.total)}`}>
                    {e.funcionario?.total?.toFixed(2) ?? '—'}
                  </span>

                  <div className={styles.nResp}>
                    <span className={styles.nRespTotal}>{totalN}</span>
                    <span className={styles.nRespSub}>
                      {e.ciudadania?.n ? `C:${e.ciudadania.n}` : ''}
                      {e.ciudadania?.n && e.funcionario?.n ? ' ' : ''}
                      {e.funcionario?.n ? `F:${e.funcionario.n}` : ''}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {resultados?.updatedAt && (
          <div className={styles.updatedAt}>Actualizado: {new Date(resultados.updatedAt * 1000).toLocaleString('es-CO')}</div>
        )}
      </div>
    </div>
  )
}
