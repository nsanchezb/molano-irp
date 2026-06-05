import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSurvey } from '../context/SurveyContext.jsx'
import { useEntidades } from '../hooks/useEntidades.js'
import PageLayout from '../components/PageLayout.jsx'
import Spinner from '../components/Spinner.jsx'
import styles from './Seleccion.module.css'

export default function EntidadTerritorial() {
  const navigate = useNavigate()
  const { set } = useSurvey()
  const { data, loading, error } = useEntidades()
  const [dep, setDep] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [busquedaDep, setBusquedaDep] = useState('')

  if (loading) return <PageLayout paso={3} titulo="Selecciona la entidad"><Spinner /></PageLayout>
  if (error) return <PageLayout paso={3} titulo="Error"><p className={styles.error}>{error}</p></PageLayout>

  const departamentos = data.deps

  // Paso 1: elegir departamento
  if (!dep) {
    const filtrados = departamentos.filter((d) =>
      d.d.toLowerCase().includes(busquedaDep.toLowerCase())
    )
    return (
      <PageLayout paso={3} titulo="¿En qué departamento?" subtitulo="Selecciona el departamento de la entidad.">
        <input
          className={styles.buscador}
          type="search"
          placeholder="Buscar departamento..."
          value={busquedaDep}
          onChange={(e) => setBusquedaDep(e.target.value)}
        />
        <div className={styles.lista}>
          {filtrados.map((d) => (
            <button key={d.d} className={styles.item} onClick={() => { setDep(d); setBusqueda('') }}>
              <span className={styles.itemNombre}>{d.d}</span>
              <span className={styles.itemCount}>{d.e.length}</span>
              <svg className={styles.chevron} width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </PageLayout>
    )
  }

  // Paso 2: listado de entidades del departamento
  const filtradas = dep.e.filter((e) =>
    e.n.toLowerCase().includes(busqueda.toLowerCase())
  )

  function elegirEntidad(e) {
    set({ entityId: e.i, entityName: e.n, department: dep.d })
    navigate('/entidad/confirmar')
  }

  return (
    <PageLayout paso={3} titulo="Selecciona la entidad" subtitulo={dep.d}
      onBack={() => { setDep(null); setBusqueda('') }}>
      <input
        className={styles.buscador}
        type="search"
        placeholder="Buscar entidad..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        autoFocus
      />
      <div className={styles.lista}>
        {filtradas.length === 0 && (
          <p className={styles.vacio}>Sin resultados para "{busqueda}"</p>
        )}
        {filtradas.map((e) => (
          <button key={e.i} className={styles.item} onClick={() => elegirEntidad(e)}>
            <span className={styles.itemNombre}>{e.n}</span>
            {e.m && <span className={styles.itemMuni}>{e.m}</span>}
            <svg className={styles.chevron} width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </PageLayout>
  )
}
