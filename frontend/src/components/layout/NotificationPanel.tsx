import { useState } from 'react'
import type { ReactElement } from 'react'
import { Bell, X, CheckCircle, AlertCircle, Info, AlertTriangle, Trash2 } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'
import type { Notification } from '@/hooks/useNotifications'

const iconMap: Record<Notification['type'], ReactElement> = {
  success: <CheckCircle className="h-4 w-4 text-green-500" />,
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-orange-500" />,
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const { notifications, clear } = useNotifications()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
      >
        <Bell className="h-4 w-4 text-foreground" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-40 w-80 rounded-xl border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button onClick={clear} className="cursor-pointer text-muted-foreground hover:text-foreground">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="cursor-pointer text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-3 border-b border-border px-4 py-3 last:border-0',
                      'hover:bg-muted/50 transition-colors'
                    )}
                  >
                    <div className="mt-0.5">{iconMap[n.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {n.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}