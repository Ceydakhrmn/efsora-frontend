import api from './axios'
import type { AuthResponse, LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest, MessageResponse } from '@/types'

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),

  logout: (refreshToken?: string) =>
    api.post<MessageResponse>('/auth/logout', refreshToken ? { refreshToken } : {}),

  refresh: (refreshToken?: string) =>
    api.post<AuthResponse>('/auth/refresh', refreshToken ? { refreshToken } : {}),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<MessageResponse>('/kullanicilar/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<MessageResponse>('/auth/reset-password', data),
  
  verifyMfa: (data: { userId: number; code: string }) =>
    api.post<AuthResponse>('/auth/verify-mfa', data),

  startMfaSetup: () =>
    api.post<{ secret: string; qr: string }>('/kullanicilar/mfa/enable', {}),

  verifyMfaSetup: (data: { code: string }) =>
    api.post('/kullanicilar/mfa/verify', data),

  disableMfa: () =>
    api.post('/kullanicilar/mfa/disable', {}),

  loginWithTotp: (data: { email: string; code: string }) =>
    api.post<AuthResponse>('/auth/login-totp', data),

  getTotpQr: (email: string) =>
    api.post<{ qr: string }>('/auth/totp-qr', { email }),
}
