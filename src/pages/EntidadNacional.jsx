import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSurvey } from '../context/SurveyContext.jsx'
import { useEntidades } from '../hooks/useEntidades.js'
import PageLayout from '../components/PageLayout.jsx'
import Spinner from '../components/Spinner.jsx'
import styles from './Seleccion.module.css'

export default function EntidadNacional() {
  const navigate = useNavigate()
  const { set } = useSurvey()
  const { data, loading, error } = useEntidades()
  const [rama, setRama] = useState(null)
  const [sector, setSector] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  if (loading) return <PageLayout paso={3} titulo="Selecciona la entidad"><Spinner /></PageLayout>
  if (error) return <PageLayout paso={3} titulo="Error"><p className={styles.error}>{error}</p></PageLayout>

  const ramas = data.ramas

  // Paso 1: elegir rama
  if (!rama) {
    return (
      <PageLayout paso={3} titulo="¿A qué rama pertenece?" subtitulo="Selecciona la rama del poder público.">
        <div className={styles.lista}>
          {ramas.map((r) => (
            <button key={r.r} className={styles.item} onClick={() => { setRama(r); setBusqueda('') }}>
              <span className={styles.itemNombre}>{r.r}</span>
              <svg className={styles.chevron} width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </PageLayout>
    )
  }

  // Paso 2 (solo Rama Ejecutiva): elegir sector
  if (rama.t === 's' && !sector) {
    return (
      <PageLayout paso={3} titulo="¿Cuál es el sector?" subtitulo={`Rama: ${rama.r}`}
        onBack={() => { setRama(null); setBusqueda('') }}>
        <div className={styles.lista}>
          {rama.d.map((s) => (
            <button key={s.s} className={styles.item} onClick={() => { setSector(s); setBusqueda('') }}>
              <span className={styles.itemNombre}>{s.s}</span>
              <span className={styles.itemCount}>{s.e.length}</span>
              <svg className={styles.chevron} width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </PageLayout>
    )
  }

  // Paso final: listado de entidades
  const entidades = rama.t === 's' ? sector.e : rama.d
  const filtradas = entidades.filter((e) =>
    e.n.toLowerCase().includes(busqueda.toLowerCase())
  )
  const subTitulo = rama.t === 's' ? `${rama.r} › ${sector.s}` : rama.r

  function elegirEntidad(e) {
    set({ entityId: e.i, entityName: e.n })
    navigate('/entidad/confirmar')
  }

  return (
    <PageLayout paso={3} titulo="Selecciona la entidad" subtitulo={subTitulo}
      onBack={() => rama.t === 's' ? setSector(null) : setRama(null)}>
      <input
        className={styles.buscador}
        type="search"
        placeholder="Buscar entidad..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <div className={styles.lista}>
        {filtradas.length === 0 && (
          <p className={styles.vacio}>Sin resultados para "{busqueda}"</p>
        )}
        {filtradas.map((e) => (
          <button key={e.i} className={styles.item} onClick={() => elegirEntidad(e)}>
            <span className={styles.itemNombre}>{e.n}</span>
            <svg className={styles.chevron} width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </PageLayout>
  )
}
