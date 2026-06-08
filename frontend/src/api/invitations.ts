import api from './axios'
import type { AuthResponse } from '@/types'

export const invitationsApi = {
  create: (email: string, role: string) =>
    api.post<{ token: string; email: string; expiresAt: string; inviteLink: string }>(
      '/invitations',
      { email, role }
    ),

  verify: (token: string) =>
    api.get<{ email: string; role: string; valid: boolean }>(
      `/invitations/verify/${token}`
    ),

  accept: (token: string, data: { firstName: string; lastName: string; password: string }) =>
    api.post<AuthResponse>(`/invitations/accept/${token}`, data),
}
