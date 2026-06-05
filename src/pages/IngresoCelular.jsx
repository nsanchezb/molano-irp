import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSurvey } from '../context/SurveyContext.jsx'
import { sendOtp } from '../api/otp.js'
import PageLayout from '../components/PageLayout.jsx'
import styles from './IngresoCelular.module.css'

export default function IngresoCelular() {
  const navigate = useNavigate()
  const { survey, set } = useSurvey()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!survey.entityId) {
    navigate('/', { replace: true })
    return null
  }

  const valido = /^3\d{9}$/.test(phone)

  async function handleEnviar(e) {
    e.preventDefault()
    if (!valido || loading) return
    setLoading(true)
    setError(null)
    try {
      await sendOtp(phone)
      set({ phone })
      navigate('/verificar/codigo')
    } catch (err) {
      if (err.status === 429) {
        setError(`Espera ${err.retryAfter ?? 120} segundos antes de solicitar otro código.`)
      } else {
        setError('No pudimos enviar el SMS. Inténtalo de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(val)
    setError(null)
  }

  return (
    <PageLayout paso={4} titulo="Verifica tu celular"
      subtitulo="Ingresa tu número para recibir un código de confirmación por SMS.">

      <form onSubmit={handleEnviar} noValidate className={styles.form}>
        <label className={styles.label} htmlFor="phone">Número de celular</label>

        <div className={styles.inputWrap}>
          <span className={styles.prefix}>+57</span>
          <input
            id="phone"
            className={styles.input}
            type="tel"
            inputMode="numeric"
            placeholder="3XX XXX XXXX"
            value={phone}
            onChange={handleChange}
            autoFocus
            autoComplete="tel-national"
          />
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <p className={styles.aviso}>
          Te enviaremos un código de 6 dígitos válido por 5 minutos.
          Pueden aplicar tarifas de tu operador.
        </p>

        <button
          type="submit"
          className={styles.btn}
          disabled={!valido || loading}
          aria-busy={loading}
        >
          {loading ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : (
            <>
              Enviar código SMS
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
      </form>

      <p className={styles.privacidad}>
        Tu número <strong>no se almacena</strong> en texto plano. Solo se usa
        para confirmar que eres una persona real.
      </p>
    </PageLayout>
  )
}
