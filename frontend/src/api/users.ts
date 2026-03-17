import api from './axios'
import type { User, UserRequest, ChangePasswordRequest, MessageResponse } from '@/types'

export const usersApi = {
  getAll: () =>
    api.get<User[]>('/kullanicilar'),

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
}
