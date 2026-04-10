import api from './axios'

export interface ActivityLog {
  id: number
  action: string
  entityType: string
  entityId: number | null
  details: string
  userEmail: string
  userName: string
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export const activityLogsApi = {
  getRecent: () => api.get<ActivityLog[]>('/activity-logs'),
  getPage: (page: number, size: number) =>
    api.get<PageResponse<ActivityLog>>(`/activity-logs/page?page=${page}&size=${size}`),
  getByUser: (email: string) => api.get<ActivityLog[]>(`/activity-logs/user/${encodeURIComponent(email)}`),
  getByEntityType: (type: string) => api.get<ActivityLog[]>(`/activity-logs/entity/${encodeURIComponent(type)}`),
  getSecurityStats: () => api.get<SecurityStats>('/activity-logs/security-stats'),
}

export interface SecurityStats {
  failedLogins24h: number
  accountLocks24h: number
  successLogins24h: number
  blockedLogins24h: number
  suspiciousIps: string[]
  recentSecurityEvents: ActivityLog[]
}
