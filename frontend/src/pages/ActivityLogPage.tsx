import { useEffect, useState } from 'react'
import { Activity, User, Package, Filter, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { activityLogsApi, type ActivityLog, type PageResponse } from '@/api/activityLogs'
import { useI18n } from '@/i18n'
import { exportToExcel } from '@/lib/exportExcel'

const PAGE_SIZE = 20

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

export function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const { t } = useI18n()

  const fetchLogs = async () => {
    setLoading(true)
    try {
      if (entityFilter !== 'all') {
        const res = await activityLogsApi.getByEntityType(entityFilter)
        setLogs(res.data)
        setTotalPages(1)
      } else {
        const res = await activityLogsApi.getPage(page, PAGE_SIZE)
        const data = res.data as PageResponse<ActivityLog>
        setLogs(data.content)
        setTotalPages(data.totalPages)
      }
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, entityFilter])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleExport = () => {
    const rows = logs.map((log) => ({
      ID: log.id,
      'İşlem': t.activityLog.actions[log.action] || log.action,
      'Varlık Tipi': log.entityType === 'USER' ? t.activityLog.entityUser : t.activityLog.entityAsset,
      'Detay': log.details,
      'Kullanıcı': log.userName || log.userEmail,
      'IP Adresi': log.ipAddress || '',
      'Tarih': formatDate(log.createdAt),
    }))
    exportToExcel(rows, 'aktivite_gunlugu', 'Aktivite Günlüğü')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.activityLog.title}</h1>
          <p className="text-muted-foreground">{t.activityLog.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={logs.length === 0}>
            <Download className="h-4 w-4 mr-1" />
            {t.users.export}
          </Button>
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(0) }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all}</SelectItem>
              <SelectItem value="USER">{t.activityLog.entityUser}</SelectItem>
              <SelectItem value="ASSET">{t.activityLog.entityAsset}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Activity className="h-12 w-12 mb-2 opacity-50" />
          <p>{t.activityLog.noActivity}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
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
