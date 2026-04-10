import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, User, Package, X } from 'lucide-react'
import { searchApi, type GlobalSearchResult } from '@/api/search'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GlobalSearchResult | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null)
      return
    }
    setLoading(true)
    try {
      const { data } = await searchApi.search(q)
      setResults(data)
    } catch {
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, doSearch])

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const hasResults = results && (results.users.length > 0 || results.assets.length > 0)

  const handleSelect = (type: 'user' | 'asset', id: number) => {
    setOpen(false)
    setQuery('')
    setResults(null)
    if (type === 'user') navigate(`/users/${id}`)
    else navigate('/assets')
  }

  return (
    <div className="relative">
      <div className={cn(
        "flex items-center gap-2 rounded-lg border bg-muted px-3 py-1.5 transition-all",
        open ? "w-64 border-primary ring-1 ring-primary/20" : "w-48"
      )}>
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Ara... (Ctrl+K)"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults(null) }} className="cursor-pointer text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-10 z-40 w-80 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                Aranıyor...
              </div>
            ) : !hasResults ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                Sonuç bulunamadı
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {results!.users.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                      Kullanıcılar
                    </div>
                    {results!.users.map((u) => (
                      <button
                        key={`user-${u.id}`}
                        onClick={() => handleSelect('user', u.id)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer text-left"
                      >
                        <User className="h-4 w-4 text-blue-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                        {u.department && (
                          <span className="text-xs text-muted-foreground shrink-0">{u.department}</span>
                        )}
                      </button>
                    ))}
                  </>
                )}
                {results!.assets.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                      Envanterler
                    </div>
                    {results!.assets.map((a) => (
                      <button
                        key={`asset-${a.id}`}
                        onClick={() => handleSelect('asset', a.id)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer text-left"
                      >
                        <Package className="h-4 w-4 text-green-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {a.brand} {a.serialNumber ? `· ${a.serialNumber}` : ''}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{a.category}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
