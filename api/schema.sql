-- Selk B2B Marketplace — Full Schema
-- Run: sudo -u postgres psql -d selk -f /root/selk-api/schema.sql

CREATE EXTENSION IF NOT EXISTS citext;

-- Users (already exists — included for reference)
-- CREATE TABLE users (
--   id                         BIGSERIAL PRIMARY KEY,
--   email                      CITEXT UNIQUE NOT NULL,
--   password                   TEXT NOT NULL,
--   commercial_register_number TEXT,
--   created_at                 TIMESTAMPTZ DEFAULT now()
-- );

-- Listings
CREATE TABLE IF NOT EXISTS listings (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id),
  title         TEXT NOT NULL,
  description   TEXT,
  type          TEXT NOT NULL CHECK (type IN ('warehouse','container','climate','basement','garage','outdoor')),
  city          TEXT NOT NULL,
  country       TEXT NOT NULL DEFAULT 'OM',
  address       TEXT,
  lat           NUMERIC(9,6),
  lng           NUMERIC(9,6),
  size_sqm      NUMERIC(10,2) NOT NULL,
  slots         INT NOT NULL DEFAULT 1 CHECK (slots >= 1),
  price_sqm     NUMERIC(10,2) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'EUR',
  amenities     TEXT[] DEFAULT '{}',
  images        TEXT[] DEFAULT '{}',
  rating        NUMERIC(2,1) DEFAULT 0,
  review_count  INT DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  free_cancel   BOOLEAN DEFAULT false,
  insurance     BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(type);
CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_listings_slots ON listings(slots);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id            BIGSERIAL PRIMARY KEY,
  listing_id    BIGINT NOT NULL REFERENCES listings(id),
  user_id       BIGINT NOT NULL REFERENCES users(id),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  size_sqm      NUMERIC(10,2) NOT NULL,
  total_price   NUMERIC(12,2) NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  CHECK (end_date > start_date)
);
CREATE INDEX IF NOT EXISTS idx_bookings_listing ON bookings(listing_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id            BIGSERIAL PRIMARY KEY,
  booking_id    BIGINT UNIQUE NOT NULL REFERENCES bookings(id),
  listing_id    BIGINT NOT NULL REFERENCES listings(id),
  user_id       BIGINT NOT NULL REFERENCES users(id),
  rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 10),
  comment       TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reviews_listing ON reviews(listing_id);
