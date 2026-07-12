-- Add video media support to listings.
-- Mirrors the existing images TEXT[] column. Idempotent and additive.

ALTER TABLE listings ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';
