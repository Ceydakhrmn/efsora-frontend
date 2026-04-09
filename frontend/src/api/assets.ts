import api from './axios'
import type { Asset, AssetRequest } from '@/types'

export const assetsApi = {
  getAll: () => api.get<Asset[]>('/assets'),
  getById: (id: number) => api.get<Asset>(`/assets/${id}`),
  create: (data: AssetRequest) => api.post<Asset>('/assets', data),
  update: (id: number, data: AssetRequest) => api.put<Asset>(`/assets/${id}`, data),
  delete: (id: number) => api.delete(`/assets/${id}`),
  getExpiringSoon: () => api.get<Asset[]>('/assets/expiring-soon'),
  search: (q: string) => api.get<Asset[]>(`/assets/search?q=${encodeURIComponent(q)}`),
}
