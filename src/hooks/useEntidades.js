import { useState, useEffect } from 'react'

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
        cache = json
        setData(json)
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudo cargar el catálogo de entidades.')
        setLoading(false)
      })
  }, [])

  return { data, loading, error }
}
