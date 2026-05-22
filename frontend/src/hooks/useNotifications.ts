import { useState, useCallback, useEffect, useRef } from 'react'
import { notificationsApi, type NotificationItem } from '@/api/notifications'
import { webSocketService, type WebSocketNotification } from '@/lib/websocket'

export type { NotificationItem as Notification }

export function useNotifications() {
  const [backendNotifications, setBackendNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const upsertNotification = useCallback((incoming: NotificationItem) => {
    setBackendNotifications(prev => {
      const exists = prev.some(n => n.id === incoming.id)

      if (!exists && !incoming.read) {
        setUnreadCount(count => count + 1)
      }

      if (exists) {
        return prev.map(n => (n.id === incoming.id ? incoming : n))
      }
      return [incoming, ...prev]
    })
  }, [])

  const mapWebSocketToNotificationItem = useCallback((n: WebSocketNotification): NotificationItem => {
    const parsedId = Number.parseInt(n.id, 10)
    return {
      id: Number.isNaN(parsedId) ? Date.now() : parsedId,
      type: n.severity,
      message: n.message,
      userEmail: '',
      read: n.read,
      createdAt: n.timestamp,
    }
  }, [])

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
    const initialSync = setTimeout(() => {
      void fetchNotifications()
    }, 0)

    webSocketService.connect().catch(() => {
      // Keep silent here; periodic polling remains as fallback.
    })
    const unsubscribe = webSocketService.subscribe((message) => {
      upsertNotification(mapWebSocketToNotificationItem(message))
    })

    // Fallback sync in case of missed socket events.
    intervalRef.current = setInterval(fetchNotifications, 60000)

    return () => {
      clearTimeout(initialSync)
      unsubscribe()
      if (intervalRef.current) clearInterval(intervalRef.current)
      webSocketService.disconnect()
    }
  }, [fetchNotifications, mapWebSocketToNotificationItem, upsertNotification])

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
