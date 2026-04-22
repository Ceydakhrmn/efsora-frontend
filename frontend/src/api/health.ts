import { axiosInstance } from './axios'

export const healthApi = {
  ping: async () => {
    try {
      const response = await axiosInstance.get('/health/ping')
      return response.data
    } catch (error) {
      console.warn('Backend warmup failed:', error)
      // Don't throw - this is optional
      return null
    }
  }
}
