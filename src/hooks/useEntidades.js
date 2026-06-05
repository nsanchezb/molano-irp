import { useState, useEffect } from 'react'

const col = new Intl.Collator('es', { sensitivity: 'base' })

function sortData(json) {
  // Ramas nacionales ordenadas alfabéticamente
  json.ramas.sort((a, b) => col.compare(a.r, b.r))
  for (const rama of json.ramas) {
    if (rama.t === 's') {
      // Rama ejecutiva: sectores y entidades dentro de cada sector
      rama.d.sort((a, b) => col.compare(a.s, b.s))
      for (const sector of rama.d) {
        if (!Array.isArray(sector.e)) sector.e = sector.e ? [sector.e] : []
        sector.e.sort((a, b) => col.compare(a.n, b.n))
      }
    } else {
      // Otras ramas: lista plana de entidades
      rama.d.sort((a, b) => col.compare(a.n, b.n))
    }
  }
  // Departamentos y entidades territoriales
  json.deps.sort((a, b) => col.compare(a.d, b.d))
  for (const dep of json.deps) dep.e.sort((a, b) => col.compare(a.n, b.n))
  return json
}

let cache = null

export function useEntidades() {
  const [data, setData] = useState(cache)
  const [loading, setLoading] = useState(!cache)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cache) return
    fetch('/data/entities.json')
      .then((r) => r.json())
      .then((json) => {
        cache = sortData(json)
        setData(cache)
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudo cargar el catálogo de entidades.')
        setLoading(false)
      })
  }, [])

  return { data, loading, error }
}
