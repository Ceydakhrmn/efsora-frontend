import api from './axios'
import type { User, Asset } from '@/types'

export interface GlobalSearchResult {
  users: User[]
  assets: Asset[]
}

export const searchApi = {
  search: (q: string) => api.get<GlobalSearchResult>('/search', { params: { q } }),
}
