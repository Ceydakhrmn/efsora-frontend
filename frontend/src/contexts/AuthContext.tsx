import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi } from '@/api/auth'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types'

interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  department: string
  profilePhoto?: string
  role?: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isImpersonating: boolean
  passwordExpired: boolean
  login: (data: LoginRequest) => Promise<AuthResponse>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: AuthUser) => void
  startImpersonation: (data: AuthResponse) => void
  stopImpersonation: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [passwordExpired, setPasswordExpired] = useState(false)
  // Impersonation öncesi admin verileri
  const [originalAuth, setOriginalAuth] = useState<{ token: string; user: AuthUser; refreshToken: string } | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    const savedImpersonating = localStorage.getItem('isImpersonating')
    if (savedToken && savedUser) {
      setToken(savedToken)
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('user')
      }
    }
    if (savedImpersonating === 'true') {
      setIsImpersonating(true)
      const orig = localStorage.getItem('originalAuth')
      if (orig) {
        try { setOriginalAuth(JSON.parse(orig)) } catch { /* ignore */ }
      }
    }
    setIsLoading(false)
  }, [])

  const handleAuthResponse = (data: AuthResponse) => {
    const authUser: AuthUser = {
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      department: data.department,
      role: data.role || 'USER',
    }
    setToken(data.token)
    setUser(authUser)
    localStorage.setItem('token', data.token)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(authUser))
  }

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data)
    handleAuthResponse(response.data)
    if (response.data.passwordExpired) {
      setPasswordExpired(true)
    }
    return response.data
  }

  const register = async (data: RegisterRequest) => {
    const response = await authApi.register(data)
    handleAuthResponse(response.data)
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // ignore logout errors
      }
    }
    setUser(null)
    setToken(null)
    setIsImpersonating(false)
    setOriginalAuth(null)
    setPasswordExpired(false)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('isImpersonating')
    localStorage.removeItem('originalAuth')
  }

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const startImpersonation = (data: AuthResponse) => {
    // Mevcut admin verilerini sakla
    const currentToken = localStorage.getItem('token')!
    const currentRefreshToken = localStorage.getItem('refreshToken')!
    const currentUser = user!
    setOriginalAuth({ token: currentToken, user: currentUser, refreshToken: currentRefreshToken })
    localStorage.setItem('originalAuth', JSON.stringify({ token: currentToken, user: currentUser, refreshToken: currentRefreshToken }))

    // Impersonate edilen kullanıcıya geç
    const impUser: AuthUser = {
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      department: data.department,
      role: data.role || 'USER',
    }
    setToken(data.token)
    setUser(impUser)
    setIsImpersonating(true)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(impUser))
    localStorage.setItem('isImpersonating', 'true')
  }

  const stopImpersonation = () => {
    if (originalAuth) {
      setToken(originalAuth.token)
      setUser(originalAuth.user)
      localStorage.setItem('token', originalAuth.token)
      localStorage.setItem('refreshToken', originalAuth.refreshToken)
      localStorage.setItem('user', JSON.stringify(originalAuth.user))
    }
    setIsImpersonating(false)
    setOriginalAuth(null)
    localStorage.removeItem('isImpersonating')
    localStorage.removeItem('originalAuth')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isImpersonating,
        passwordExpired,
        login,
        register,
        logout,
        updateUser,
        startImpersonation,
        stopImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
