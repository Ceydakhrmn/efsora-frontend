import { useNotifications } from '@/contexts/NotificationContext'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function NotificationCenter() {
  const { notifications, removeNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 space-y-2 max-w-sm">
      {notifications.slice(0, 3).map((notification) => (
        <div
          key={notification.id}
          className={`rounded-lg border p-4 shadow-lg flex items-start gap-3 ${
            notification.severity === 'success'
              ? 'bg-green-50 border-green-200'
              : notification.severity === 'error'
                ? 'bg-red-50 border-red-200'
                : notification.severity === 'warning'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(notification.severity)}</div>
          <div className="flex-grow min-w-0">
            <p className="font-semibold text-sm">{notification.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="flex-shrink-0"
            onClick={() => removeNotification(notification.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      {notifications.length > 3 && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full"
        >
          +{notifications.length - 3} more
        </Button>
      )}
    </div>
  )
}
