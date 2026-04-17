import api from './axios'

export interface DepartmentSummary {
  department: string
  totalUsers: number
  activeUsers: number
  totalAssets: number
  activeAssets: number
  maintenanceAssets: number
  expiredAssets: number
  totalValue: number
  byCategory: Record<string, number>
}

export interface AssetOverview {
  total: number
  byStatus: Record<string, number>
  byCategory: Record<string, number>
  assigned: number
  unassigned: number
  expiringSoon: number
  totalValue: number
  monthlyAcquisition: Record<string, number>
}

export interface UserOverview {
  total: number
  active: number
  inactive: number
  byDepartment: Record<string, number>
  byRole: Record<string, number>
}

export const reportsApi = {
  getDepartmentSummary: () => api.get<DepartmentSummary[]>('/reports/department-summary'),
  getAssetOverview: () => api.get<AssetOverview>('/reports/asset-overview'),
  getUserOverview: () => api.get<UserOverview>('/reports/user-overview'),
}
