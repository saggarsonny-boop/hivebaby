export interface TierFeatures {
  maxUploadSizeMb: number
  aiAnalysis: boolean
  naturalLanguageSearch: boolean
  duplicateDetection: boolean
  faceRecognition: boolean
  mapView: boolean
  smartAlbums: boolean
  advancedSearch: boolean
}

const FREE_FEATURES: TierFeatures = {
  maxUploadSizeMb: 50,
  aiAnalysis: true,
  naturalLanguageSearch: true,
  duplicateDetection: true,
  faceRecognition: false,
  mapView: true,
  smartAlbums: false,
  advancedSearch: false,
}

const PATRON_FEATURES: TierFeatures = {
  maxUploadSizeMb: 200,
  aiAnalysis: true,
  naturalLanguageSearch: true,
  duplicateDetection: true,
  faceRecognition: true,
  mapView: true,
  smartAlbums: false,
  advancedSearch: true,
}

const SOVEREIGN_FEATURES: TierFeatures = {
  maxUploadSizeMb: 500,
  aiAnalysis: true,
  naturalLanguageSearch: true,
  duplicateDetection: true,
  faceRecognition: true,
  mapView: true,
  smartAlbums: true,
  advancedSearch: true,
}

export function getFeaturesForTierName(tierName: string): TierFeatures {
  if (tierName.includes('sovereign')) return SOVEREIGN_FEATURES
  if (tierName.includes('patron')) return PATRON_FEATURES
  return FREE_FEATURES
}

export function getFeatureList(tierName: string): string[] {
  const f = getFeaturesForTierName(tierName)
  const list: string[] = []
  if (f.aiAnalysis) list.push('AI photo analysis')
  if (f.naturalLanguageSearch) list.push('Natural language search')
  if (f.duplicateDetection) list.push('Duplicate detection')
  if (f.faceRecognition) list.push('Face recognition & people')
  if (f.mapView) list.push('GPS map view')
  if (f.smartAlbums) list.push('Smart albums')
  if (f.advancedSearch) list.push('Advanced filters')
  list.push(`Upload up to ${f.maxUploadSizeMb}MB per photo`)
  return list
}
