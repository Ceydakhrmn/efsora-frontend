import { useState, useCallback } from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  timestamp: Date
}

const notifications: Notification[] = []
const listeners: Array<(n: Notification[]) => void> = []

const notify = (listeners: Array<(n: Notification[]) => void>, notifications: Notification[]) => {
  listeners.forEach(l => l([...notifications]))
}

export const addNotification = (type: Notification['type'], message: string) => {
  const n: Notification = {
    id: crypto.randomUUID(),
    type,
    message,
    timestamp: new Date(),
  }
  notifications.unshift(n)
  if (notifications.length > 20) notifications.pop()
  notify(listeners, notifications)
}

export function useNotifications() {
  const [list, setList] = useState<Notification[]>([...notifications])

  const subscribe = useCallback(() => {
    listeners.push(setList)
    return () => {
      const idx = listeners.indexOf(setList)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [])

  useState(subscribe)

  const clear = useCallback(() => {
    notifications.length = 0
    notify(listeners, notifications)
  }, [])

  return { notifications: list, clear }
}
