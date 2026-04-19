export const GrapplerHook = {
  engine: 'HivePhoto',
  governanceRule: 'Photos are never deleted due to tier changes and are always downloadable.',
  lockedPolicies: {
    noHostageData: true,
    downgradeUploadBlockOnly: true,
    premiumFeaturesSuspendOnly: true,
  },
} as const
