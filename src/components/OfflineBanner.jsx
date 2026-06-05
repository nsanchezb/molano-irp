import { useOnline } from '../hooks/useOnline.js'
import styles from './OfflineBanner.module.css'

export default function OfflineBanner() {
  const online = useOnline()
  if (online) return null
  return (
    <div className={styles.banner} role="alert" aria-live="assertive">
      <span className={styles.dot} aria-hidden="true" />
      Sin conexión — reconectando…
    </div>
  )
}
