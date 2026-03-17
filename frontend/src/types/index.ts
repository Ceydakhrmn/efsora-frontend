export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  department: string
  registrationDate: string
  active: boolean
}

export interface AuthResponse {
  token: string
  type: string
  refreshToken: string
  id: number
  email: string
  firstName: string
  lastName: string
  department: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  department: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface MessageResponse {
  message: string
  timestamp: string
}

export interface ErrorResponse {
  message: string
  status: number
  timestamp: string
  errors?: Record<string, string>
}

export interface UserRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  department: string
}
