import api from './axios'
import type { AuthResponse, LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest, MessageResponse } from '@/types'

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),

  logout: (refreshToken: string) =>
    api.post<MessageResponse>('/auth/logout', { refreshToken }),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<MessageResponse>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<MessageResponse>('/auth/reset-password', data),
}
