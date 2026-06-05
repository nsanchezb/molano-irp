import { useEffect, useRef, useState, useMemo } from 'react'
import QRCode from 'qrcode'
import { useEntidades } from '../hooks/useEntidades.js'
import styles from './QRModal.module.css'

const SURVEY_BASE = 'https://indicereputacionpublica.co'

function buildEntityList(entData) {
  if (!entData) return []
  const list = []
  for (const rama of entData.ramas ?? []) {
    if (rama.t === 's') {
      for (const sector of rama.d ?? []) {
        for (const e of sector.e ?? []) {
          list.push({ id: String(e.i), name: e.n, sub: `${rama.r} · ${sector.s}` })
        }
      }
    } else {
      for (const e of rama.d ?? []) {
        list.push({ id: String(e.i), name: e.n, sub: rama.r })
      }
    }
  }
  for (const dep of entData.deps ?? []) {
    for (const e of dep.e ?? []) {
      list.push({ id: String(e.i), name: e.n, sub: e.m ? `${dep.d} · ${e.m}` : dep.d })
    }
  }
  return list
}

export default function QRModal({ entityName: initName, entityId: initId, onClose }) {
  const { data: entData } = useEntidades()
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [selId, setSelId]   = useState(initId   ?? null)
  const [selName, setSelName] = useState(initName ?? null)
  const [busqueda, setBusqueda] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const qrUrl = selId ? `${SURVEY_BASE}?entity=${selId}` : SURVEY_BASE

  const allEntities = useMemo(() => buildEntityList(entData), [entData])
  const filtered = useMemo(() => {
    if (!busqueda.trim()) return allEntities.slice(0, 60)
    const q = busqueda.toLowerCase()
    return allEntities.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 60)
  }, [allEntities, busqueda])

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    if (!canvasRef.current) return
    setReady(false)
    QRCode.toCanvas(canvasRef.current, qrUrl, {
      width: 260,
      margin: 2,
      color: { dark: '#0f2540', light: '#ffffff' },
    }).then(() => setReady(true))
  }, [qrUrl])

  async function handleDownload() {
    const dataUrl = await QRCode.toDataURL(qrUrl, {
      width: 1000,
      margin: 3,
      color: { dark: '#0f2540', light: '#ffffff' },
    })
    const a = document.createElement('a')
    a.href = dataUrl
    const slug = (selName ?? 'principal').toLowerCase()
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40)
    a.download = `qr-irp-${slug}.png`
    a.click()
  }

  function selectEntity(e) {
    setSelId(e.id)
    setSelName(e.name)
    setShowSearch(false)
    setBusqueda('')
  }

  function clearEntity() {
    setSelId(null)
    setSelName(null)
    setShowSearch(false)
    setBusqueda('')
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Código QR">

        <button className={styles.close} onClick={onClose} aria-label="Cerrar">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Entity selector */}
        <div className={styles.entitySelector}>
          {selId ? (
            <div className={styles.entitySelected}>
              <div className={styles.entitySelectedInfo}>
                <span className={styles.entitySelectedLabel}>Entidad</span>
                <span className={styles.entitySelectedName}>{selName}</span>
              </div>
              <div className={styles.entitySelectedActions}>
                <button className={styles.btnCambiar} onClick={() => setShowSearch(true)}>Cambiar</button>
                <button className={styles.btnQuitar} onClick={clearEntity} aria-label="Quitar entidad">×</button>
              </div>
            </div>
          ) : (
            <button
              className={styles.btnBuscarEntidad}
              onClick={() => setShowSearch(true)}
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Buscar entidad específica
            </button>
          )}

          {showSearch && (
            <div className={styles.searchPanel}>
              <input
                className={styles.searchInput}
                type="search"
                placeholder="Buscar entidad..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                autoFocus
              />
              <div className={styles.searchList}>
                {filtered.length === 0 && (
                  <p className={styles.searchEmpty}>Sin resultados</p>
                )}
                {filtered.map((e) => (
                  <button key={e.id} className={styles.searchItem} onClick={() => selectEntity(e)}>
                    <span className={styles.searchItemName}>{e.name}</span>
                    <span className={styles.searchItemSub}>{e.sub}</span>
                  </button>
                ))}
              </div>
              <button className={styles.btnCancelarBusqueda} onClick={() => { setShowSearch(false); setBusqueda('') }}>
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* QR */}
        {!showSearch && (
          <>
            <div className={styles.qrWrap}>
              <canvas ref={canvasRef} />
            </div>

            <p className={styles.url}>{qrUrl}</p>

            <p className={styles.qrSub}>
              {selId
                ? 'Quien escanee irá directo a evaluar esta entidad.'
                : 'Quien escanee llegará a la pantalla de inicio.'}
            </p>

            <div className={styles.actions}>
              <button className={styles.btnDescargar} onClick={handleDownload} disabled={!ready}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M10 3v10M6 9l4 4 4-4M4 17h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Descargar PNG (1000px)
              </button>
              <button className={styles.btnCerrar} onClick={onClose}>Cerrar</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
