import { useCallback, useEffect, useState } from 'react'
import { Activity, User, Package, Filter, Download, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { activityLogsApi, type ActivityLog, type PageResponse } from '@/api/activityLogs'
import { useI18n } from '@/i18n'
import { exportToExcel } from '@/lib/exportExcel'
import { exportToPdf } from '@/lib/exportPdf'
import { Skeleton } from '@/components/ui/skeleton'

const PAGE_SIZE = 20

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

function getPresetRange(preset: string): { start: string; end: string } {
  const today = new Date()
  const end = toDateStr(today)
  if (preset === 'today') return { start: end, end }
  if (preset === 'week') {
    const start = new Date(today)
    start.setDate(today.getDate() - today.getDay())
    return { start: toDateStr(start), end }
  }
  if (preset === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    return { start: toDateStr(start), end }
  }
  return { start: '', end: '' }
}

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  BULK_DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  PERMANENT_DELETE: 'bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-200',
}

const entityIcons: Record<string, React.ElementType> = {
  USER: User,
  ASSET: Package,
}

interface SavedActivityFilter {
  id: string
  name: string
  entityFilter: string
  actionFilter: string
  datePreset: string
  startDate: string
  endDate: string
  userFilter: string
  userInput: string
}

const SAVED_FILTERS_STORAGE_KEY = 'activity_log_saved_filters'

export function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const [datePreset, setDatePreset] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [userInput, setUserInput] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [savedFilters, setSavedFilters] = useState<SavedActivityFilter[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_FILTERS_STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as SavedActivityFilter[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [selectedSavedFilterId, setSelectedSavedFilterId] = useState<string>('none')
  const { t } = useI18n()

  const visibleLogs = actionFilter === 'all'
    ? logs
    : logs.filter((log) => log.action === actionFilter)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      if (userFilter) {
        const res = await activityLogsApi.getByUser(userFilter)
        setLogs(res.data)
        setTotalPages(1)
      } else if (entityFilter !== 'all') {
        const res = await activityLogsApi.getByEntityType(entityFilter)
        setLogs(res.data)
        setTotalPages(1)
      } else {
        const res = await activityLogsApi.getPage(page, PAGE_SIZE, startDate || undefined, endDate || undefined)
        const data = res.data as PageResponse<ActivityLog>
        setLogs(data.content)
        setTotalPages(data.totalPages)
      }
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [page, entityFilter, startDate, endDate, userFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    localStorage.setItem(SAVED_FILTERS_STORAGE_KEY, JSON.stringify(savedFilters))
  }, [savedFilters])

  const applyPreset = (preset: string) => {
    setDatePreset(preset)
    setPage(0)
    if (preset === 'all') {
      setStartDate('')
      setEndDate('')
    } else if (preset !== 'custom') {
      const range = getPresetRange(preset)
      setStartDate(range.start)
      setEndDate(range.end)
    }
  }

  const clearDateFilter = () => {
    setDatePreset('all')
    setStartDate('')
    setEndDate('')
    setPage(0)
  }

  const saveCurrentFilter = () => {
    const suggestedName = [
      entityFilter !== 'all' ? entityFilter : null,
      actionFilter !== 'all' ? actionFilter : null,
      userFilter ? userFilter : null,
      datePreset !== 'all' ? datePreset : null,
    ].filter(Boolean).join(' · ') || t.activityLog.savedFilterDefaultName

    const name = window.prompt(t.activityLog.savedFilterPrompt, suggestedName)
    if (!name || !name.trim()) return

    const next: SavedActivityFilter = {
      id: crypto.randomUUID(),
      name: name.trim(),
      entityFilter,
      actionFilter,
      datePreset,
      startDate,
      endDate,
      userFilter,
      userInput,
    }

    setSavedFilters((prev) => [next, ...prev].slice(0, 10))
    setSelectedSavedFilterId(next.id)
  }

  const applySavedFilter = (id: string) => {
    if (id === 'none') {
      setSelectedSavedFilterId('none')
      return
    }

    const selected = savedFilters.find((f) => f.id === id)
    if (!selected) return

    setEntityFilter(selected.entityFilter)
    setActionFilter(selected.actionFilter)
    setDatePreset(selected.datePreset)
    setStartDate(selected.startDate)
    setEndDate(selected.endDate)
    setUserFilter(selected.userFilter)
    setUserInput(selected.userInput)
    setPage(0)
    setSelectedSavedFilterId(selected.id)
  }

  const deleteSelectedSavedFilter = () => {
    if (selectedSavedFilterId === 'none') return
    setSavedFilters((prev) => prev.filter((f) => f.id !== selectedSavedFilterId))
    setSelectedSavedFilterId('none')
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleExport = () => {
    const rows = visibleLogs.map((log) => ({
      ID: log.id,
      [t.activityLog.actionColumn]: t.activityLog.actions[log.action] || log.action,
      [t.activityLog.entityColumn]: log.entityType === 'USER' ? t.activityLog.entityUser : t.activityLog.entityAsset,
      [t.activityLog.detailColumn]: log.details,
      [t.activityLog.userColumn]: log.userName || log.userEmail,
      [t.activityLog.ipColumn]: log.ipAddress || '',
      [t.activityLog.dateColumn]: formatDate(log.createdAt),
    }))
    exportToExcel(rows, 'activity_log', t.activityLog.title)
  }

  const handleExportPdf = () => {
    const cols = ['ID', t.activityLog.actionColumn, t.activityLog.entityColumn, t.activityLog.detailColumn, t.activityLog.userColumn, t.activityLog.ipColumn, t.activityLog.dateColumn]
    const rows = visibleLogs.map((log) => [
      log.id, t.activityLog.actions[log.action] || log.action,
      log.entityType === 'USER' ? t.activityLog.entityUser : t.activityLog.entityAsset,
      log.details, log.userName || log.userEmail, log.ipAddress || '', formatDate(log.createdAt),
    ])
    exportToPdf(cols, rows, 'activity_log', t.activityLog.title)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.activityLog.title}</h1>
          <p className="text-muted-foreground">{t.activityLog.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={visibleLogs.length === 0}>
            <Download className="h-4 w-4 mr-1" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={visibleLogs.length === 0}>
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(0) }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all}</SelectItem>
              <SelectItem value="USER">{t.activityLog.entityUser}</SelectItem>
              <SelectItem value="ASSET">{t.activityLog.entityAsset}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={(v) => setActionFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.activityLog.allActions}</SelectItem>
              {Object.keys(t.activityLog.actions).map((action) => (
                <SelectItem key={action} value={action}>{t.activityLog.actions[action] || action}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={saveCurrentFilter}>
            {t.activityLog.saveFilter}
          </Button>
          <Select value={selectedSavedFilterId} onValueChange={applySavedFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t.activityLog.savedFilters}</SelectItem>
              {savedFilters.map((saved) => (
                <SelectItem key={saved.id} value={saved.id}>{saved.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={deleteSelectedSavedFilter}
            disabled={selectedSavedFilterId === 'none'}
          >
            {t.common.delete}
          </Button>
        </div>
      </div>

      {/* User filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">{t.activityLog.filterByUser}:</span>
        <div className="flex items-center gap-1">
          <Input
            placeholder={t.activityLog.userFilterPlaceholder}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { setUserFilter(userInput.trim()); setPage(0) }
            }}
            className="h-8 w-[220px] text-sm"
          />
          <Button size="sm" variant="default" className="h-8 px-3" onClick={() => { setUserFilter(userInput.trim()); setPage(0) }}>
            <Filter className="h-3 w-3" />
          </Button>
          {userFilter && (
            <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => { setUserFilter(''); setUserInput(''); setPage(0) }}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Date range filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">{t.activityLog.dateFilter}:</span>
        {(['all', 'today', 'week', 'month', 'custom'] as const).map((preset) => {
          const labels: Record<string, string> = {
            all: t.common.all,
            today: t.activityLog.today,
            week: t.activityLog.thisWeek,
            month: t.activityLog.thisMonth,
            custom: t.activityLog.customRange,
          }
          return (
            <Button
              key={preset}
              size="sm"
              variant={datePreset === preset ? 'default' : 'outline'}
              onClick={() => applyPreset(preset)}
            >
              {labels[preset]}
            </Button>
          )
        })}
        {datePreset === 'custom' && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="h-8 w-[140px] text-sm"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(0) }}
            />
            <span className="text-muted-foreground text-sm">–</span>
            <Input
              type="date"
              className="h-8 w-[140px] text-sm"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(0) }}
            />
          </div>
        )}
        {(startDate || endDate) && datePreset !== 'all' && (
          <Button size="sm" variant="ghost" onClick={clearDateFilter}>
            <X className="h-3 w-3 mr-1" />
            {t.activityLog.clearFilter}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-40 rounded" />
                </div>
                <Skeleton className="h-3 w-32 rounded" />
              </div>
              <Skeleton className="h-4 w-28 rounded flex-shrink-0" />
            </div>
          ))}
        </div>
      ) : visibleLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Activity className="h-12 w-12 mb-2 opacity-50" />
          <p>{t.activityLog.noActivity}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleLogs.map((log) => {
            const Icon = entityIcons[log.entityType] || Activity
            return (
              <div
                key={log.id}
                className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="mt-0.5 rounded-full bg-muted p-2">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={actionColors[log.action] || ''}>
                      {t.activityLog.actions[log.action] || log.action}
                    </Badge>
                    <Badge variant="secondary">
                      {log.entityType === 'USER' ? t.activityLog.entityUser : t.activityLog.entityAsset}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm">{log.details}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {log.userName || log.userEmail} &middot; {formatDate(log.createdAt)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {entityFilter === 'all' && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            {t.activityLog.prev}
          </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            {t.activityLog.next}
          </Button>
        </div>
      )}
    </div>
  )
}
