import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081'

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`,
          refreshToken ? { refreshToken } : {},
          { withCredentials: true }
        )
        localStorage.setItem('token', data.token)
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken)
        }
        originalRequest.headers.Authorization = `Bearer ${data.token}`
        return api(originalRequest)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/auth'
      }
    }
    return Promise.reject(error)
  }
)

export default api