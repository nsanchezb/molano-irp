import styles from './TimelineChart.module.css'

const W = 800
const H = 120
const PAD = { top: 16, right: 20, bottom: 32, left: 36 }
const INNER_W = W - PAD.left - PAD.right
const INNER_H = H - PAD.top - PAD.bottom

export default function TimelineChart({ dailyCounts = [] }) {
  if (dailyCounts.length === 0) return null

  // Fill gaps: build a continuous day range
  const filled = fillDays(dailyCounts)

  const maxCount = Math.max(...filled.map((d) => d.count), 1)
  const n = filled.length

  function x(i) { return PAD.left + (i / Math.max(n - 1, 1)) * INNER_W }
  function y(v) { return PAD.top + INNER_H - (v / maxCount) * INNER_H }

  const points = filled.map((d, i) => `${x(i)},${y(d.count)}`).join(' ')
  const area = [
    `M${x(0)},${y(0)}`,
    ...filled.map((d, i) => `L${x(i)},${y(d.count)}`),
    `L${x(n - 1)},${y(0)}`,
    'Z',
  ].join(' ')

  // X-axis labels: show ~6 evenly spaced dates
  const labelIndices = getEvenIndices(n, 6)

  return (
    <div className={styles.wrap}>
      <span className={styles.titulo}>Respuestas por día</span>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const yv = PAD.top + INNER_H * (1 - t)
          const label = Math.round(maxCount * t)
          return (
            <g key={t}>
              <line x1={PAD.left} x2={PAD.left + INNER_W} y1={yv} y2={yv} stroke="#e2e8f0" strokeWidth="1" />
              {t > 0 && (
                <text x={PAD.left - 4} y={yv + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{label}</text>
              )}
            </g>
          )
        })}

        {/* Area fill */}
        <path d={area} fill="url(#grad)" opacity="0.3" />

        {/* Line */}
        <polyline points={points} fill="none" stroke="#1a3c5e" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Dots at peaks */}
        {filled.map((d, i) => d.count === maxCount ? (
          <circle key={i} cx={x(i)} cy={y(d.count)} r="3.5" fill="#1a3c5e" />
        ) : null)}

        {/* X labels */}
        {labelIndices.map((i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#94a3b8">
            {formatDate(filled[i].date)}
          </text>
        ))}

        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a3c5e" />
            <stop offset="100%" stopColor="#1a3c5e" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function fillDays(data) {
  if (data.length === 0) return []
  const map = Object.fromEntries(data.map((d) => [d.date, d.count]))
  // Use noon UTC so toISOString() never drifts to adjacent day regardless of browser timezone
  const start = new Date(data[0].date + 'T12:00:00Z')
  const end   = new Date(data[data.length - 1].date + 'T12:00:00Z')
  const result = []
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = d.toISOString().slice(0, 10)
    result.push({ date: key, count: map[key] ?? 0 })
  }
  return result
}

function getEvenIndices(n, max) {
  if (n <= max) return Array.from({ length: n }, (_, i) => i)
  const step = (n - 1) / (max - 1)
  return Array.from({ length: max }, (_, i) => Math.round(i * step))
}

function formatDate(iso) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}
