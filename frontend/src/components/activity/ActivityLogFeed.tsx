import { Activity, User, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { ActivityLog } from '@/api/activityLogs'
import type { Translations } from '@/i18n'

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

interface ActivityLogFeedProps {
  logs: ActivityLog[]
  loading: boolean
  t: Translations
}

export function ActivityLogFeed({ logs, loading, t }: ActivityLogFeedProps) {
  if (loading) {
    return (
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
    )
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Activity className="h-12 w-12 mb-2 opacity-50" />
        <p>{t.activityLog.noActivity}</p>
      </div>
    )
  }

  return (
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
  )
}

export { formatDate }
