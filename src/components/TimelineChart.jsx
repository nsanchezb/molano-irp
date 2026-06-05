import { useState, useRef, useMemo } from 'react'
import styles from './TimelineChart.module.css'

const W = 800
const H = 130
const PAD = { top: 16, right: 20, bottom: 32, left: 36 }
const INNER_W = W - PAD.left - PAD.right
const INNER_H = H - PAD.top - PAD.bottom

const TIP_W = 82
const TIP_H = 40

const PERIODS = [
  { key: '30d',  label: 'Último mes',       days: 30  },
  { key: '6m',   label: 'Últimos 6 meses',  days: 180 },
  { key: '1y',   label: 'Último año',       days: 365 },
]

export default function TimelineChart({ dailyCounts = [] }) {
  const svgRef = useRef(null)
  const [period, setPeriod] = useState('30d')
  const [hovered, setHovered] = useState(null)

  const { startStr, endStr } = useMemo(() => {
    const days = PERIODS.find((p) => p.key === period).days
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days + 1)
    return {
      startStr: start.toISOString().slice(0, 10),
      endStr:   end.toISOString().slice(0, 10),
    }
  }, [period])

  if (dailyCounts.length === 0) return null

  const filled = fillDays(dailyCounts, startStr, endStr)
  const maxCount = Math.max(...filled.map((d) => d.count), 1)
  const n = filled.length

  function x(i) { return PAD.left + (i / Math.max(n - 1, 1)) * INNER_W }
  function y(v)  { return PAD.top + INNER_H - (v / maxCount) * INNER_H }

  const points = filled.map((d, i) => `${x(i)},${y(d.count)}`).join(' ')
  const area = [
    `M${x(0)},${y(0)}`,
    ...filled.map((d, i) => `L${x(i)},${y(d.count)}`),
    `L${x(n - 1)},${y(0)}`,
    'Z',
  ].join(' ')

  const labelIndices = getEvenIndices(n, 6)

  function handleMouseMove(e) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * W
    let minDist = Infinity, nearest = -1
    filled.forEach((_, i) => {
      const d = Math.abs(x(i) - mx)
      if (d < minDist) { minDist = d; nearest = i }
    })
    const threshold = n > 1 ? (INNER_W / (n - 1)) * 0.6 : INNER_W
    if (nearest >= 0 && minDist < threshold) {
      setHovered({ i: nearest, svgX: x(nearest), svgY: y(filled[nearest].count), date: filled[nearest].date, count: filled[nearest].count })
    } else {
      setHovered(null)
    }
  }

  const tipX = hovered
    ? (hovered.svgX + TIP_W + 10 > W - PAD.right ? hovered.svgX - TIP_W - 8 : hovered.svgX + 8)
    : 0
  const tipY = hovered
    ? Math.max(PAD.top, Math.min(hovered.svgY - TIP_H / 2, H - PAD.bottom - TIP_H))
    : 0

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.titulo}>Respuestas por día</span>
        <select
          className={styles.periodSelect}
          value={period}
          onChange={(e) => { setPeriod(e.target.value); setHovered(null) }}
        >
          {PERIODS.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>

      <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className={styles.svg}
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a3c5e" />
              <stop offset="100%" stopColor="#1a3c5e" stopOpacity="0" />
            </linearGradient>
          </defs>

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

          <path d={area} fill="url(#grad)" opacity="0.3" />
          <polyline points={points} fill="none" stroke="#1a3c5e" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {filled.map((d, i) => d.count === maxCount ? (
            <circle key={i} cx={x(i)} cy={y(d.count)} r="3.5" fill="#1a3c5e" />
          ) : null)}

          <rect
            x={PAD.left} y={PAD.top}
            width={INNER_W} height={INNER_H + PAD.bottom}
            fill="transparent"
            style={{ cursor: 'crosshair' }}
          />

          {hovered && (
            <g>
              <line
                x1={hovered.svgX} x2={hovered.svgX}
                y1={PAD.top} y2={y(0)}
                stroke="#1a3c5e" strokeWidth="1" strokeDasharray="3,2" opacity="0.4"
              />
              <circle cx={hovered.svgX} cy={hovered.svgY} r="9" fill="#1a3c5e" fillOpacity="0.12" />
              <circle cx={hovered.svgX} cy={hovered.svgY} r="5" fill="#1a3c5e" />
              <rect x={tipX} y={tipY} width={TIP_W} height={TIP_H} rx="6" fill="#0f2540" />
              <text x={tipX + TIP_W / 2} y={tipY + 13} textAnchor="middle" fontSize="9" fill="#94a3b8">
                {formatDateFull(hovered.date)}
              </text>
              <text x={tipX + TIP_W / 2} y={tipY + 30} textAnchor="middle" fontSize="14" fontWeight="700" fill="white">
                {hovered.count} resp.
              </text>
            </g>
          )}

          {labelIndices.map((i) => (
            <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#94a3b8">
              {formatDate(filled[i].date)}
            </text>
          ))}
        </svg>
    </div>
  )
}

function fillDays(data, startStr, endStr) {
  const map = Object.fromEntries(data.map((d) => [d.date, d.count]))
  const start = new Date(startStr + 'T12:00:00Z')
  const end   = new Date(endStr   + 'T12:00:00Z')
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

function formatDateFull(iso) {
  const [, m, d] = iso.split('-')
  const meses = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${parseInt(d)} ${meses[parseInt(m)]}`
}
