import api from './axios'
import type { Asset, AssetRequest, AssetAttachment, PagedResponse, DepreciationInfo, DepreciationSummary } from '@/types'

export interface AssetAssignmentHistory {
  id: number
  assetId: number
  assetName: string
  action: 'ASSIGNED' | 'UNASSIGNED' | 'REASSIGNED'
  fromUserId?: number
  fromUserName?: string
  toUserId?: number
  toUserName?: string
  fromDepartment?: string
  toDepartment?: string
  performedBy: string
  createdAt: string
}

export const assetsApi = {
  getAll: (page: number = 0, size: number = 10) => api.get<PagedResponse<Asset>>('/assets', { params: { page, size } }),
  getById: (id: number) => api.get<Asset>(`/assets/${id}`),
  create: (data: AssetRequest) => api.post<Asset>('/assets', data),
  update: (id: number, data: AssetRequest) => api.put<Asset>(`/assets/${id}`, data),
  delete: (id: number) => api.delete(`/assets/${id}`),
  getExpiringSoon: () => api.get<Asset[]>('/assets/expiring-soon'),
  search: (q: string) => api.get<Asset[]>(`/assets/search?q=${encodeURIComponent(q)}`),
  getStats: () => api.get<AssetStats>('/assets/stats'),

  // Attachments
  getAttachments: (assetId: number) => api.get<AssetAttachment[]>(`/assets/${assetId}/attachments`),
  uploadAttachment: (assetId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<AssetAttachment>(`/assets/${assetId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  downloadAttachment: (attachmentId: number) =>
    api.get(`/assets/attachments/${attachmentId}/download`, { responseType: 'blob' }),
  deleteAttachment: (attachmentId: number) => api.delete(`/assets/attachments/${attachmentId}`),

  // Assignment history
  getAssignmentHistory: (assetId: number) =>
    api.get<AssetAssignmentHistory[]>(`/assets/${assetId}/assignment-history`),

  transfer: (assetId: number, userId: number) =>
    api.post<Asset>(`/assets/${assetId}/transfer`, { userId }),

  returnAsset: (assetId: number) =>
    api.post<Asset>(`/assets/${assetId}/return`, {}),

  bulkDelete: (ids: number[]) =>
    api.delete('/assets/bulk', { data: { ids } }),

  bulkUpdateStatus: (ids: number[], status: string) =>
    api.patch('/assets/bulk-status', { ids, status }),

  bulkImport: (assets: Partial<import('@/types').AssetRequest>[]) =>
    api.post<{ total: number; success: number; failed: number; results: { row: number; name: string; status: string; message?: string }[] }>('/assets/bulk-import', assets),

  getDepreciation: (id: number) => api.get<DepreciationInfo>(`/assets/${id}/depreciation`),
  getDepreciationSummary: () => api.get<DepreciationSummary>('/assets/depreciation-summary'),

  getAllTags: () => api.get<string[]>('/assets/tags'),
  getByTag: (tag: string) => api.get<Asset[]>(`/assets/by-tag?tag=${encodeURIComponent(tag)}`),
}

export interface AssetStats {
  total: number
  active: number
  maintenance: number
  expired: number
  retired: number
  expiringSoon: number
  totalValue: number
  byCategory: Record<string, number>
}
