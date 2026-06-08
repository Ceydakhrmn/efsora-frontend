import { useState, useCallback, useEffect } from 'react'

interface UseFetchOptions {
  onError?: (error: unknown) => void
}

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: unknown
  refetch: () => Promise<void>
}

export function useFetch<T>(
  fetcher: () => Promise<T>,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  deps: readonly unknown[],
  options?: UseFetchOptions
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (e) {
      setError(e)
      options?.onError?.(e)
    } finally {
      setLoading(false)
    }
    // The caller controls re-run frequency via deps, not by re-creating fetcher
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { run() }, [run])

  return { data, loading, error, refetch: run }
}
