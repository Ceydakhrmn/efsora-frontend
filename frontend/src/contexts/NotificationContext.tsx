import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { webSocketService } from '@/lib/websocket'
import type { WebSocketNotification } from '@/lib/websocket'

interface NotificationContextType {
  notifications: WebSocketNotification[]
  addNotification: (notification: WebSocketNotification) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  unreadCount: number
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<WebSocketNotification[]>([])

  const addNotification = useCallback((notification: WebSocketNotification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 50)) // Keep last 50
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  // Connect to WebSocket on mount
  useEffect(() => {
    webSocketService.connect()
      .catch((err) => console.error('WebSocket connection failed:', err))

    // Subscribe to notifications
    const unsubscribe = webSocketService.subscribe(addNotification)

    return () => {
      unsubscribe()
      webSocketService.disconnect()
    }
  }, [addNotification])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}
