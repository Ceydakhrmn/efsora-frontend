
import api from './axios'
import type { User, UserRequest, ChangePasswordRequest, MessageResponse, AuthResponse, PagedResponse } from '@/types'

export interface UsersQueryParams {
  page?: number
  size?: number
  department?: string
  role?: string
  active?: boolean
  search?: string
}

export const usersApi = {
    // Çoklu silme
    deleteBulk: (ids: number[]) =>
      api.post('/kullanicilar/bulk-delete', ids, {
        headers: { 'Content-Type': 'application/json' }
      }),
  getAll: (params: UsersQueryParams) =>
    api.get<PagedResponse<User>>('/kullanicilar', { params }),

  getById: (id: number) =>
    api.get<User>(`/kullanicilar/${id}`),

  getActive: () =>
    api.get<User[]>('/kullanicilar/active'),

  getByDepartment: (department: string) =>
    api.get<User[]>(`/kullanicilar/departman/${department}`),

  getByEmail: (email: string) =>
    api.get<User>(`/kullanicilar/email/${email}`),

  create: (data: UserRequest) =>
    api.post<User>('/kullanicilar', data),

  update: (id: number, data: UserRequest) =>
    api.put<User>(`/kullanicilar/${id}`, data),

  deactivate: (id: number) =>
    api.delete(`/kullanicilar/${id}`),

  deletePermanent: (id: number) =>
    api.delete(`/kullanicilar/${id}/permanent`),

  changePassword: (data: ChangePasswordRequest) =>
    api.post<MessageResponse>('/kullanicilar/change-password', data),
  uploadPhoto: (id: number, photo: string) =>
    api.post<User>(`/kullanicilar/${id}/photo`, { photo }),

  impersonate: (id: number) =>
    api.post<AuthResponse>(`/kullanicilar/${id}/impersonate`),

  bulkImport: (users: UserRequest[]) =>
    api.post<{ total: number; success: number; failed: number; results: Array<{ row: number; email: string; status: string; message?: string }> }>('/kullanicilar/bulk-import', users),
}
