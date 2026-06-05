import { useNavigate } from 'react-router-dom'
import styles from './PageLayout.module.css'

export default function PageLayout({ paso, total = 4, titulo, subtitulo, onBack, children }) {
  const navigate = useNavigate()
  const pct = Math.round((paso / total) * 100)

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <button className={styles.back} onClick={onBack ?? (() => navigate(-1))}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M16 10H4M9 5l-5 5 5 5" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver
        </button>

        <div className={styles.progreso}>
          <div className={styles.progresoBar} style={{ width: `${pct}%` }} />
        </div>

        <header className={styles.header}>
          <span className={styles.paso}>Paso {paso} de {total}</span>
          <h2 className={styles.titulo}>{titulo}</h2>
          {subtitulo && <p className={styles.sub}>{subtitulo}</p>}
        </header>

        {children}
      </div>
    </div>
  )
}
