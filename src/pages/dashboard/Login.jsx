import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../hooks/useDashboardAuth.js'
import styles from './Login.module.css'

export default function DashboardLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(password)
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Contraseña incorrecta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoText}>IRP</span>
          <span className={styles.logoSub}>Dashboard de Resultados</span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div>
            <label className={styles.label} htmlFor="pwd">Contraseña</label>
            <input
              id="pwd"
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
              autoFocus
              autoComplete="current-password"
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.btn} type="submit" disabled={!password || loading}>
            {loading ? <span className={styles.spinner} /> : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
