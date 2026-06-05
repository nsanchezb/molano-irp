import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import styles from './QRModal.module.css'

const SURVEY_URL = 'https://indicereputacionpublica.co'

export default function QRModal({ entityName, onClose }) {
  const canvasRef = useRef(null)
  const [dataUrl, setDataUrl] = useState(null)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, SURVEY_URL, {
      width: 280,
      margin: 2,
      color: { dark: '#0f2540', light: '#ffffff' },
    }).then(() => {
      setDataUrl(canvasRef.current.toDataURL('image/png'))
    })
  }, [])

  function handleDownload() {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    const slug = entityName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40)
    a.download = `qr-irp-${slug}.png`
    a.click()
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Código QR">
        <button className={styles.close} onClick={onClose} aria-label="Cerrar">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className={styles.header}>
          <span className={styles.badge}>Código QR</span>
          <h2 className={styles.title}>{entityName}</h2>
          <p className={styles.sub}>Comparte este código para que ciudadanos y funcionarios<br />evalúen esta entidad.</p>
        </div>

        <div className={styles.qrWrap}>
          <canvas ref={canvasRef} />
        </div>

        <p className={styles.url}>{SURVEY_URL}</p>

        <div className={styles.actions}>
          <button className={styles.btnDescargar} onClick={handleDownload} disabled={!dataUrl}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 3v10M6 9l4 4 4-4M4 17h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Descargar PNG
          </button>
          <button className={styles.btnCerrar} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
