import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import styles from './Bienvenida.module.css'

export default function Bienvenida() {
  const navigate = useNavigate()
  const [aceptado, setAceptado] = useState(false)

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <span className={styles.badge}>Por Vencejo Consultores</span>
          <h1 className={styles.titulo}>IRP</h1>
          <p className={styles.subtitulo}>Índice de Reputación Pública</p>
        </header>

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
            onChange={(e) => setAceptado(e.target.checked)}
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
