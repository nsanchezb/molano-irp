const SIZE = 220
const CX = SIZE / 2
const CY = SIZE / 2
const R = 80

function polar(idx, total, value) {
  const angle = (Math.PI * 2 * idx) / total - Math.PI / 2
  const r = R * Math.max(0, (value - 1) / 4)
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) }
}

function labelPos(idx, total) {
  const angle = (Math.PI * 2 * idx) / total - Math.PI / 2
  const r = R + 22
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) }
}

function toPoints(dims, scores) {
  return dims.map((d, i) => polar(i, dims.length, scores?.[d.id] ?? 1))
}

function toPolygon(pts) {
  return pts.map((p) => `${p.x},${p.y}`).join(' ')
}

export default function RadarChart({ dims, ciudadania, funcionario }) {
  const n = dims.length
  const gridLevels = [1, 2, 3, 4, 5]

  const ciudPts = toPoints(dims, ciudadania)
  const funcPts = toPoints(dims, funcionario)

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width: '100%', maxWidth: 280, display: 'block', margin: '0 auto' }}>
      {/* Grid */}
      {gridLevels.map((level) => (
        <polygon key={level}
          points={dims.map((_, i) => { const p = polar(i, n, level); return `${p.x},${p.y}` }).join(' ')}
          fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
      ))}
      {/* Axes */}
      {dims.map((_, i) => {
        const p = polar(i, n, 5)
        return <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="0.8" />
      })}
      {/* Ciudadanía */}
      {ciudadania && (
        <polygon points={toPolygon(ciudPts)}
          fill="rgba(26,60,94,0.15)" stroke="#1a3c5e" strokeWidth="2" strokeLinejoin="round" />
      )}
      {/* Funcionario */}
      {funcionario && (
        <polygon points={toPolygon(funcPts)}
          fill="rgba(15,118,110,0.15)" stroke="#0f766e" strokeWidth="2" strokeLinejoin="round" />
      )}
      {/* Labels */}
      {dims.map((d, i) => {
        const lp = labelPos(i, n)
        const words = d.nombre.split(' ').slice(0, 2)
        return (
          <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
            fontSize="7.5" fill="#64748b" fontFamily="inherit">
            {words.map((w, wi) => (
              <tspan key={wi} x={lp.x} dy={wi === 0 ? 0 : 9}>{w}</tspan>
            ))}
          </text>
        )
      })}
      {/* Score labels on axes */}
      {[1,3,5].map((level) => (
        <text key={level} x={CX + 2} y={CY - R * (level - 1) / 4}
          fontSize="6" fill="#cbd5e1" textAnchor="start" dominantBaseline="middle">
          {level}
        </text>
      ))}
    </svg>
  )
}
