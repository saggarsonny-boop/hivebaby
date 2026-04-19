export interface SearchFilters {
  rawQuery: string
  dateAfter?: string
  dateBefore?: string
  objects?: string[]
  scenes?: string[]
  emotions?: string[]
  actions?: string[]
  locationName?: string
  personNames?: string[]
  dominantColor?: string
  cameraModel?: string
  takenAtConfidence?: 'exif' | 'filename' | 'upload'
}

export interface SearchResult {
  photoId: string
  relevanceScore: number
  matchedFields: string[]
}

export interface ParsedSearchQuery {
  filters: SearchFilters
  fallbackTextQuery: string | null
  parseConfidence: 'high' | 'medium' | 'low' | 'fallback'
}
