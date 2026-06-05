import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { isAuthenticated, logout } from '../../hooks/useDashboardAuth.js'
import { getResultados, getConfig, updateConfig } from '../../api/resultados.js'
import { useEntidades } from '../../hooks/useEntidades.js'
import TimelineChart from '../../components/TimelineChart.jsx'
import QRModal from '../../components/QRModal.jsx'
import { CIUDADANIA, FUNCIONARIO } from '../../data/cuestionarios.js'
import styles from './Ranking.module.css'

function flatQuestions(cuestionario) {
  return cuestionario.dimensiones.flatMap((dim) =>
    dim.preguntas.map((p) => ({ label: p.label, dimNombre: dim.nombre, dimColor: dim.color }))
  )
}

function ReaccionesList({ questions, data }) {
  const max = Math.max(...data.map((d) => d.likes + d.dislikes), 1)
  return (
    <div className={styles.reaccionesList}>
      {questions.map((q, i) => {
        const d = data[i] ?? { likes: 0, dislikes: 0 }
        const total = d.likes + d.dislikes
        const likesPct  = total > 0 ? (d.likes / max) * 100 : 0
        const dislikesPct = total > 0 ? (d.dislikes / max) * 100 : 0
        return (
          <div key={i} className={styles.reaccionRow}>
            <div className={styles.reaccionInfo}>
              <span className={styles.reaccionDim} style={{ color: q.dimColor }}>
                {q.dimNombre}
              </span>
              <span className={styles.reaccionLabel}>{q.label}</span>
            </div>
            <div className={styles.reaccionBars}>
              <div className={styles.reaccionBarWrap}>
                <span className={styles.reaccionCount} style={{ color: '#15803d' }}>👍 {d.likes}</span>
                <div className={styles.reaccionBarBg}>
                  <div className={styles.reaccionBarLike} style={{ width: `${likesPct}%` }} />
                </div>
              </div>
              <div className={styles.reaccionBarWrap}>
                <span className={styles.reaccionCount} style={{ color: '#dc2626' }}>👎 {d.dislikes}</span>
                <div className={styles.reaccionBarBg}>
                  <div className={styles.reaccionBarDislike} style={{ width: `${dislikesPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

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

async function exportXLSX(entities, getEntityName) {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  const fecha = new Date().toLocaleString('es-CO')
  const totalResp = entities.reduce((s, e) => s + (e.ciudadania?.n ?? 0) + (e.funcionario?.n ?? 0), 0)
  const irpVals = entities.map((e) => e.irpGlobal).filter((v) => v != null)
  const irpProm = irpVals.length ? (irpVals.reduce((a, b) => a + b, 0) / irpVals.length) : null

  // ── Hoja 1: Resumen ──
  const resumenData = [
    ['IRP — Índice de Reputación Pública'],
    ['Generado el', fecha],
    [],
    ['RESUMEN GENERAL'],
    ['Entidades evaluadas', entities.length],
    ['Total respuestas', totalResp],
    ['IRP promedio', irpProm != null ? +irpProm.toFixed(2) : '—'],
    ['IRP máximo', irpVals.length ? +Math.max(...irpVals).toFixed(2) : '—'],
    ['IRP mínimo', irpVals.length ? +Math.min(...irpVals).toFixed(2) : '—'],
    [],
    ['TOP 5 ENTIDADES'],
    ['#', 'Entidad', 'IRP Global'],
    ...entities.slice(0, 5).map((e, i) => [
      i + 1,
      getEntityName(e.entityId),
      e.irpGlobal != null ? +e.irpGlobal.toFixed(2) : '—',
    ]),
  ]
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData)
  wsResumen['!cols'] = [{ wch: 28 }, { wch: 36 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')

  // ── Hoja 2: Resultados individuales ──
  const headers = [
    'Posición', 'Entidad',
    'IRP Global',
    'IRP Ciudadanía', 'Confianza e Integridad', 'Gestión e Impacto Social',
    'Transparencia Percibida', 'Comunicación y Pedagogía',
    'Identidad y Conexión Emocional', 'Estratégica', 'Resp. Ciudadanía',
    'IRP Funcionario', 'Compensación y Equidad', 'Desarrollo Profesional',
    'Gobernanza y Liderazgo', 'Innovación Pública', 'Blindaje Institucional', 'Resp. Funcionario',
    'Total Respuestas',
  ]
  const rows = entities.map((e, i) => {
    const c = e.ciudadania
    const f = e.funcionario
    const n = (c?.n ?? 0) + (f?.n ?? 0)
    return [
      i + 1,
      getEntityName(e.entityId),
      e.irpGlobal != null ? +e.irpGlobal.toFixed(2) : '',
      c?.total != null ? +c.total.toFixed(2) : '',
      c?.dims?.confianza     != null ? +c.dims.confianza.toFixed(2)     : '',
      c?.dims?.gestion       != null ? +c.dims.gestion.toFixed(2)       : '',
      c?.dims?.transparencia != null ? +c.dims.transparencia.toFixed(2) : '',
      c?.dims?.comunicacion  != null ? +c.dims.comunicacion.toFixed(2)  : '',
      c?.dims?.identidad     != null ? +c.dims.identidad.toFixed(2)     : '',
      c?.dims?.estrategica   != null ? +c.dims.estrategica.toFixed(2)   : '',
      c?.n ?? '',
      f?.total != null ? +f.total.toFixed(2) : '',
      f?.dims?.compensacion  != null ? +f.dims.compensacion.toFixed(2)  : '',
      f?.dims?.desarrollo    != null ? +f.dims.desarrollo.toFixed(2)    : '',
      f?.dims?.gobernanza    != null ? +f.dims.gobernanza.toFixed(2)    : '',
      f?.dims?.innovacion    != null ? +f.dims.innovacion.toFixed(2)    : '',
      f?.dims?.blindaje      != null ? +f.dims.blindaje.toFixed(2)      : '',
      f?.n ?? '',
      n,
    ]
  })
  const wsResultados = XLSX.utils.aoa_to_sheet([headers, ...rows])
  wsResultados['!cols'] = [
    { wch: 9 }, { wch: 40 }, { wch: 11 },
    { wch: 15 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 24 }, { wch: 28 }, { wch: 13 }, { wch: 16 },
    { wch: 16 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 18 }, { wch: 22 }, { wch: 17 },
    { wch: 16 },
  ]
  XLSX.utils.book_append_sheet(wb, wsResultados, 'Resultados')

  XLSX.writeFile(wb, `irp-resultados-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export default function Ranking() {
  const navigate = useNavigate()
  const { data: entData } = useEntidades()
  const [resultados, setResultados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [qrEntity, setQrEntity] = useState(null) // { id, name }
  const [reactionsEnabled, setReactionsEnabled] = useState(false)
  const [togglingReactions, setTogglingReactions] = useState(false)
  const [reaccionesTab, setReaccionesTab] = useState('ciudadania')
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
    getConfig().then((d) => setReactionsEnabled(!!d.reactionsEnabled)).catch(() => {})
  }, [navigate])

  async function handleToggleReactions() {
    const newVal = !reactionsEnabled
    setTogglingReactions(true)
    try {
      const hash = sessionStorage.getItem('irp_dash_auth') || ''
      await updateConfig(newVal, hash)
      setReactionsEnabled(newVal)
    } catch { /* ignore toggle errors silently */ }
    finally { setTogglingReactions(false) }
  }

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
        {/* QR row */}
        <div className={styles.qrRow}>
          <div className={styles.toggleReacciones}>
            <span className={styles.toggleLabel}>Reacciones por pregunta</span>
            <button
              className={`${styles.toggleBtn} ${reactionsEnabled ? styles.toggleBtnOn : ''}`}
              onClick={handleToggleReactions}
              disabled={togglingReactions}
              title={reactionsEnabled ? 'Desactivar reacciones' : 'Activar reacciones'}
            >
              <span className={styles.toggleThumb} />
            </button>
            <span className={`${styles.toggleStatus} ${reactionsEnabled ? styles.toggleStatusOn : ''}`}>
              {reactionsEnabled ? 'Activadas' : 'Desactivadas'}
            </span>
          </div>
          <button
            className={styles.btnQRPrincipal}
            onClick={() => setQrEntity({ id: null, name: null })}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
              <rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
              <rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
              <rect x="11" y="11" width="3" height="3" rx="0.5" fill="currentColor" />
              <rect x="16" y="11" width="2" height="2" rx="0.5" fill="currentColor" />
              <rect x="11" y="16" width="2" height="2" rx="0.5" fill="currentColor" />
              <rect x="15" y="15" width="3" height="3" rx="0.5" fill="currentColor" />
            </svg>
            Generar QR
          </button>
        </div>

        {/* Timeline */}
        {!loading && resultados?.dailyCounts?.length > 0 && (
          <TimelineChart dailyCounts={resultados.dailyCounts} />
        )}

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
            <button className={styles.btnExportar} onClick={() => exportXLSX(filtradas, getEntityName)}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M10 3v10M6 9l4 4 4-4M4 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Exportar Excel
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
              const name = getEntityName(e.entityId)
              return (
                <div key={e.entityId} className={styles.filaWrap}>
                  <Link className={styles.fila} to={`/dashboard/entidad/${e.entityId}`}>
                    <span className={`${styles.pos} ${idx < 3 ? styles.posTop : ''}`}>{idx + 1}</span>
                    <span className={styles.nombre}>{name}</span>

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
                  <button
                    className={styles.btnQR}
                    onClick={() => setQrEntity({ id: e.entityId, name })}
                    aria-label={`Generar QR para ${name}`}
                    title="Generar QR"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
                      <rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
                      <rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
                      <rect x="11" y="11" width="3" height="3" rx="0.5" fill="currentColor" />
                      <rect x="16" y="11" width="2" height="2" rx="0.5" fill="currentColor" />
                      <rect x="11" y="16" width="2" height="2" rx="0.5" fill="currentColor" />
                      <rect x="15" y="15" width="3" height="3" rx="0.5" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Reactions section */}
        {!loading && resultados?.reactions && (
          <div className={styles.reaccionesCard}>
            <div className={styles.reaccionesHeader}>
              <span className={styles.reaccionesTitulo}>Reacciones por pregunta</span>
              <div className={styles.reaccionesTabs}>
                <button
                  className={`${styles.tabBtn} ${reaccionesTab === 'ciudadania' ? styles.tabBtnActivo : ''}`}
                  onClick={() => setReaccionesTab('ciudadania')}
                >Ciudadanía</button>
                <button
                  className={`${styles.tabBtn} ${reaccionesTab === 'funcionario' ? styles.tabBtnActivo : ''}`}
                  onClick={() => setReaccionesTab('funcionario')}
                >Funcionario</button>
              </div>
            </div>
            <ReaccionesList
              questions={flatQuestions(reaccionesTab === 'ciudadania' ? CIUDADANIA : FUNCIONARIO)}
              data={resultados.reactions[reaccionesTab] ?? []}
            />
          </div>
        )}

        {resultados?.updatedAt && (
          <div className={styles.updatedAt}>Actualizado: {new Date(resultados.updatedAt).toLocaleString('es-CO')}</div>
        )}
      </div>

      {qrEntity && (
        <QRModal
          entityName={qrEntity.name}
          entityId={qrEntity.id}
          onClose={() => setQrEntity(null)}
        />
      )}
    </div>
  )
}
