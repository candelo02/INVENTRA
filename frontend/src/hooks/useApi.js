import { useCallback, useEffect, useState } from 'react'

/**
 * Hook genérico para llamadas a la API.
 * @param {Function} apiFn - Función que retorna una Promise (axios call)
 * @param {boolean} immediate - Si debe ejecutarse al montar
 */
export function useApi(apiFn, immediate = true) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError]     = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFn(...args)
      setData(res.data.data ?? res.data)
      return res.data.data ?? res.data
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error desconocido'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFn])

  useEffect(() => {
    if (immediate) execute()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, execute, setData }
}
