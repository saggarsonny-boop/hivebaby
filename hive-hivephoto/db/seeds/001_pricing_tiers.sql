-- Seed pricing tiers for HivePhoto
INSERT INTO pricing_tiers (name, display_name, price_cents, price_interval, storage_bytes, is_founding, founding_slots_total, sort_order) VALUES
  ('free',                     'Free',                    0,     NULL,    53687091200,  FALSE, NULL, 0),
  ('founding_patron_monthly',  'Founding Patron',         399,   'month', 2199023255552, TRUE, 1000, 1),
  ('patron_monthly',           'Patron',                  499,   'month', 2199023255552, FALSE, NULL, 2),
  ('patron_annual',            'Patron (Annual)',         4788,  'year',  2199023255552, FALSE, NULL, 3),
  ('founding_sovereign_monthly','Founding Sovereign',     999,   'month', -1,           TRUE,  500,  4),
  ('sovereign_monthly',        'Sovereign',               1299,  'month', -1,           FALSE, NULL, 5),
  ('sovereign_annual',         'Sovereign (Annual)',      11688, 'year',  -1,           FALSE, NULL, 6)
ON CONFLICT (name) DO NOTHING;
