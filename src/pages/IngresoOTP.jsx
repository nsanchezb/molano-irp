import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSurvey } from '../context/SurveyContext.jsx'
import { sendOtp, verifyOtp } from '../api/otp.js'
import PageLayout from '../components/PageLayout.jsx'
import styles from './IngresoOTP.module.css'

const DIGITS = 6
const OTP_TTL = 300 // 5 min en segundos

export default function IngresoOTP() {
  const navigate = useNavigate()
  const { survey, set } = useSurvey()
  const { phone, entityId, surveyType } = survey

  const [digits, setDigits] = useState(Array(DIGITS).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [locked, setLocked] = useState(false)
  const [segundos, setSegundos] = useState(OTP_TTL)
  const [cooldownReenvio, setCooldownReenvio] = useState(60)
  const refs = useRef([])

  useEffect(() => {
    if (!phone) { navigate('/', { replace: true }); return }
    const timer = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) { clearInterval(timer); return 0 }
        return s - 1
      })
    }, 1000)
    const reenvioTimer = setInterval(() => {
      setCooldownReenvio((c) => (c > 0 ? c - 1 : 0))
    }, 1000)
    return () => { clearInterval(timer); clearInterval(reenvioTimer) }
  }, [phone, navigate])

  if (!phone) return null

  const codigo = digits.join('')
  const completo = codigo.length === DIGITS

  function handleDigit(i, val) {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = v
    setDigits(next)
    setError(null)
    if (v && i < DIGITS - 1) refs.current[i + 1]?.focus()
    if (next.every((d) => d !== '') && v) handleVerificar(next.join(''))
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, DIGITS)
    if (!text) return
    const next = Array(DIGITS).fill('')
    text.split('').forEach((c, i) => { next[i] = c })
    setDigits(next)
    refs.current[Math.min(text.length, DIGITS - 1)]?.focus()
    if (text.length === DIGITS) handleVerificar(text)
  }

  async function handleVerificar(code = codigo) {
    if (loading || locked) return
    setLoading(true)
    setError(null)
    try {
      const { token } = await verifyOtp({ phone, code, entityId, surveyType })
      set({ token })
      navigate('/cuestionario')
    } catch (err) {
      if (err.error === 'locked') {
        setLocked(true)
        setError('Demasiados intentos. Solicita un nuevo código.')
      } else if (err.error === 'expired') {
        setError('El código expiró. Solicita uno nuevo.')
      } else if (err.attemptsLeft !== undefined) {
        setError(`Código incorrecto. Te quedan ${err.attemptsLeft} intento${err.attemptsLeft !== 1 ? 's' : ''}.`)
      } else {
        setError('Error al verificar. Inténtalo de nuevo.')
      }
      setDigits(Array(DIGITS).fill(''))
      refs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  async function handleReenviar() {
    if (cooldownReenvio > 0) return
    try {
      await sendOtp(phone)
      setDigits(Array(DIGITS).fill(''))
      setError(null)
      setLocked(false)
      setSegundos(OTP_TTL)
      setCooldownReenvio(60)
      refs.current[0]?.focus()
    } catch {
      setError('No pudimos reenviar el código. Inténtalo de nuevo.')
    }
  }

  const mm = String(Math.floor(segundos / 60)).padStart(2, '0')
  const ss = String(segundos % 60).padStart(2, '0')
  const phoneDisplay = `+57 ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8)}`

  return (
    <PageLayout paso={4} titulo="Ingresa el código"
      subtitulo={`Enviamos un código de 6 dígitos al ${phoneDisplay}`}>

      <div className={styles.cajasWrap} onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            className={`${styles.caja} ${error ? styles.cajaError : ''}`}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={loading || locked}
            aria-label={`Dígito ${i + 1}`}
            autoFocus={i === 0}
          />
        ))}
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <div className={styles.timers}>
        {segundos > 0 ? (
          <span className={styles.expira}>Expira en {mm}:{ss}</span>
        ) : (
          <span className={styles.expirado}>Código expirado</span>
        )}
        <button
          className={styles.reenviar}
          onClick={handleReenviar}
          disabled={cooldownReenvio > 0}
        >
          {cooldownReenvio > 0 ? `Reenviar en ${cooldownReenvio}s` : 'Reenviar código'}
        </button>
      </div>

      <button
        className={styles.btn}
        onClick={() => handleVerificar()}
        disabled={!completo || loading || locked}
        aria-busy={loading}
      >
        {loading
          ? <span className={styles.spinner} aria-hidden="true" />
          : 'Verificar código'}
      </button>
    </PageLayout>
  )
}
