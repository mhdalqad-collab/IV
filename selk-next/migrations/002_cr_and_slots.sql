-- 002: Commercial register number for hosts + slots per listing

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS commercial_register_number TEXT;

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS slots INT NOT NULL DEFAULT 1 CHECK (slots >= 1);

CREATE INDEX IF NOT EXISTS idx_listings_slots ON listings(slots);
