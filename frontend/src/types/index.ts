export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  department: string
  registrationDate: string
  active: boolean
  lastLoginDate?: string
  profilePhoto?: string
  role?: string
}

export interface UserRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  department: string
  role?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
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
  lastLoginDate?: string
  profilePhoto?: string
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

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface MessageResponse {
  message: string
}

export interface ErrorResponse {
  message: string
  status?: number
}

export type AssetCategory = 'HARDWARE' | 'SOFTWARE_LICENSE' | 'API_SUBSCRIPTION' | 'SAAS_TOOL' | 'OFFICE_EQUIPMENT'
export type AssetStatus = 'ACTIVE' | 'MAINTENANCE' | 'EXPIRED' | 'RETIRED'

export interface Asset {
  id: number
  name: string
  category: AssetCategory
  brand?: string
  model?: string
  serialNumber?: string
  vendor?: string
  purchaseDate?: string
  purchasePrice?: number
  renewalDate?: string
  warrantyExpiryDate?: string
  status: AssetStatus
  seatCount?: number
  assignedUserId?: number
  assignedUserName?: string
  assignedDepartment?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AssetRequest {
  name: string
  category: AssetCategory
  brand?: string
  model?: string
  serialNumber?: string
  vendor?: string
  purchaseDate?: string
  purchasePrice?: number
  renewalDate?: string
  warrantyExpiryDate?: string
  status: AssetStatus
  seatCount?: number
  assignedUserId?: number
  assignedDepartment?: string
  notes?: string
}