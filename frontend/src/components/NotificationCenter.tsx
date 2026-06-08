import { useNotifications } from '@/hooks/useNotifications'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'

const typeStyles: Record<string, string> = {
  success: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
  error: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
  warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
}

const defaultStyle = 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'

function getIcon(type: string) {
  switch (type) {
    case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />
    case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />
    case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    default: return <Info className="h-5 w-5 text-blue-500" />
  }
}

export function NotificationCenter() {
  const { notifications, markAsRead } = useNotifications()
  const { t } = useI18n()

  const unread = notifications.filter(n => !n.read)
  if (unread.length === 0) return null

  const visible = unread.slice(0, 3)
  const remaining = unread.length - visible.length

  return (
    <div className="fixed bottom-4 right-4 space-y-2 max-w-sm z-50">
      {visible.map((notification) => (
        <div
          key={notification.id}
          className={`rounded-lg border p-4 shadow-lg flex items-start gap-3 ${typeStyles[notification.type] ?? defaultStyle}`}
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
          <div className="flex-grow min-w-0">
            <p className="text-xs text-foreground mt-1">{notification.message}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="flex-shrink-0 -mt-1 -mr-1"
            onClick={() => markAsRead(notification.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {remaining > 0 && (
        <p className="text-xs text-center text-muted-foreground">
          +{remaining} {t.common.notifications}
        </p>
      )}
    </div>
  )
}
