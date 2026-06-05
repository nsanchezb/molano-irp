import styles from './Spinner.module.css'

export default function Spinner({ texto = 'Cargando...' }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.ring} />
      <p className={styles.texto}>{texto}</p>
    </div>
  )
}
