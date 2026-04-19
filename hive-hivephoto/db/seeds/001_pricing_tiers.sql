INSERT INTO pricing_tiers (
  id, display_name, tier_class, billing_interval,
  price_cents, original_price_cents, storage_bytes,
  is_founding, founding_slots_total, founding_slots_used,
  is_founding_open, stripe_price_id, features
) VALUES
(
  'free','Hive Free','free',NULL,
  0,NULL,53687091200,
  FALSE,NULL,0,FALSE,NULL,
  '{"smartAlbums":false,"autoFaceClustering":false,"familyVault":false,
    "apiAccess":false,"prioritySupport":false,"sharedAlbums":false,
    "collaborativeAlbums":false,"aiMemoryReports":false,
    "migrationTools":false,"rawVault":false,
    "maxVideoSizeBytes":2147483648,"sharedAlbumMaxMembers":0,
    "savedSearches":false,"priorityProcessing":false}'
),
(
  'founding_patron_monthly','Founding Patron','patron','monthly',
  399,499,2199023255552,
  TRUE,1000,0,TRUE,NULL,
  '{"smartAlbums":true,"autoFaceClustering":true,"familyVault":false,
    "apiAccess":false,"prioritySupport":false,"sharedAlbums":true,
    "collaborativeAlbums":false,"aiMemoryReports":false,
    "migrationTools":false,"rawVault":false,
    "maxVideoSizeBytes":10737418240,"sharedAlbumMaxMembers":5,
    "savedSearches":false,"priorityProcessing":true}'
),
(
  'patron_monthly','Hive Patron','patron','monthly',
  499,NULL,2199023255552,
  FALSE,NULL,0,FALSE,NULL,
  '{"smartAlbums":true,"autoFaceClustering":true,"familyVault":false,
    "apiAccess":false,"prioritySupport":false,"sharedAlbums":true,
    "collaborativeAlbums":false,"aiMemoryReports":false,
    "migrationTools":false,"rawVault":false,
    "maxVideoSizeBytes":10737418240,"sharedAlbumMaxMembers":5,
    "savedSearches":false,"priorityProcessing":true}'
),
(
  'patron_annual','Hive Patron','patron','annual',
  399,NULL,2199023255552,
  FALSE,NULL,0,FALSE,NULL,
  '{"smartAlbums":true,"autoFaceClustering":true,"familyVault":false,
    "apiAccess":false,"prioritySupport":false,"sharedAlbums":true,
    "collaborativeAlbums":false,"aiMemoryReports":false,
    "migrationTools":false,"rawVault":false,
    "maxVideoSizeBytes":10737418240,"sharedAlbumMaxMembers":5,
    "savedSearches":false,"priorityProcessing":true}'
),
(
  'founding_sovereign_monthly','Founding Sovereign','sovereign','monthly',
  999,1299,-1,
  TRUE,500,0,TRUE,NULL,
  '{"smartAlbums":true,"autoFaceClustering":true,"familyVault":true,
    "apiAccess":true,"prioritySupport":true,"sharedAlbums":true,
    "collaborativeAlbums":true,"aiMemoryReports":true,
    "migrationTools":true,"rawVault":true,
    "maxVideoSizeBytes":-1,"sharedAlbumMaxMembers":20,
    "savedSearches":true,"priorityProcessing":true}'
),
(
  'sovereign_monthly','Hive Sovereign','sovereign','monthly',
  1299,NULL,-1,
  FALSE,NULL,0,FALSE,NULL,
  '{"smartAlbums":true,"autoFaceClustering":true,"familyVault":true,
    "apiAccess":true,"prioritySupport":true,"sharedAlbums":true,
    "collaborativeAlbums":true,"aiMemoryReports":true,
    "migrationTools":true,"rawVault":true,
    "maxVideoSizeBytes":-1,"sharedAlbumMaxMembers":20,
    "savedSearches":true,"priorityProcessing":true}'
),
(
  'sovereign_annual','Hive Sovereign','sovereign','annual',
  974,NULL,-1,
  FALSE,NULL,0,FALSE,NULL,
  '{"smartAlbums":true,"autoFaceClustering":true,"familyVault":true,
    "apiAccess":true,"prioritySupport":true,"sharedAlbums":true,
    "collaborativeAlbums":true,"aiMemoryReports":true,
    "migrationTools":true,"rawVault":true,
    "maxVideoSizeBytes":-1,"sharedAlbumMaxMembers":20,
    "savedSearches":true,"priorityProcessing":true}'
);
