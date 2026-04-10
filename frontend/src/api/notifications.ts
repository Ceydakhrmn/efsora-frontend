import api from './axios'

export interface NotificationItem {
  id: number
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  userEmail: string
  read: boolean
  createdAt: string
}

export const notificationsApi = {
  getAll: () => api.get<NotificationItem[]>('/notifications'),
  getUnread: () => api.get<NotificationItem[]>('/notifications/unread'),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  markAsRead: (id: number) => api.put<NotificationItem>(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteAll: () => api.delete('/notifications'),
}
