export interface SearchFilters {
  dateFrom?: string
  dateTo?: string
  objects?: string[]
  scenes?: string[]
  emotions?: string[]
  actions?: string[]
  location?: string
  personName?: string
  freeText?: string
}

export interface SearchRequest {
  query: string
  page?: number
  limit?: number
}

export interface SearchResponse {
  filters: SearchFilters
  photos: import('./photo').Photo[]
  total: number
  page: number
  limit: number
}
