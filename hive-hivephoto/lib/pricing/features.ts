import type { TierFeatures } from '@/lib/types/photo'

export const FREE_FEATURES: TierFeatures = {
  smartAlbums: false,
  autoFaceClustering: false,
  familyVault: false,
  apiAccess: false,
  prioritySupport: false,
  sharedAlbums: false,
  collaborativeAlbums: false,
  aiMemoryReports: false,
  migrationTools: false,
  rawVault: false,
  maxVideoSizeBytes: 2 * 1024 * 1024 * 1024,
  sharedAlbumMaxMembers: 0,
  savedSearches: false,
  priorityProcessing: false,
}

export const PATRON_FEATURES: TierFeatures = {
  ...FREE_FEATURES,
  smartAlbums: true,
  autoFaceClustering: true,
  sharedAlbums: true,
  sharedAlbumMaxMembers: 5,
  maxVideoSizeBytes: 10 * 1024 * 1024 * 1024,
  priorityProcessing: true,
}

export const SOVEREIGN_FEATURES: TierFeatures = {
  ...PATRON_FEATURES,
  familyVault: true,
  collaborativeAlbums: true,
  sharedAlbumMaxMembers: 20,
  aiMemoryReports: true,
  migrationTools: true,
  rawVault: true,
  apiAccess: true,
  prioritySupport: true,
  savedSearches: true,
  maxVideoSizeBytes: -1,
}
