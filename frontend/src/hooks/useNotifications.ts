import { useState, useCallback, useEffect, useRef } from 'react'
import { notificationsApi, type NotificationItem } from '@/api/notifications'

export type { NotificationItem as Notification }

// Re-export for backwards compatibility with notify.ts (local-only quick notifications)
export type LocalNotification = {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  timestamp: Date
}

const localNotifications: LocalNotification[] = []
const listeners: Array<(n: LocalNotification[]) => void> = []

const notifyLocal = (ls: Array<(n: LocalNotification[]) => void>, ns: LocalNotification[]) => {
  ls.forEach(l => l([...ns]))
}

export const addNotification = (type: LocalNotification['type'], message: string) => {
  const n: LocalNotification = {
    id: crypto.randomUUID(),
    type,
    message,
    timestamp: new Date(),
  }
  localNotifications.unshift(n)
  if (localNotifications.length > 20) localNotifications.pop()
  notifyLocal(listeners, localNotifications)
}

export function useNotifications() {
  const [backendNotifications, setBackendNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const { data } = await notificationsApi.getAll()
      setBackendNotifications(data)
      setUnreadCount(data.filter(n => !n.read).length)
    } catch {
      // silently fail - user might not be logged in
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    intervalRef.current = setInterval(fetchNotifications, 30000) // poll every 30s
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchNotifications])

  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationsApi.markAsRead(id)
      setBackendNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch { /* ignore */ }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead()
      setBackendNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch { /* ignore */ }
  }, [])

  const clearAll = useCallback(async () => {
    try {
      await notificationsApi.deleteAll()
      setBackendNotifications([])
      setUnreadCount(0)
    } catch { /* ignore */ }
  }, [])

  return {
    notifications: backendNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clear: clearAll,
    refresh: fetchNotifications,
  }
}

