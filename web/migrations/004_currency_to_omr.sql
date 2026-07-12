-- 004: Switch the stored base currency from EUR to OMR (Omani Rial).
-- Owners now enter prices in OMR; renters still see EUR/USD via display-time conversion.
-- Conversion rate used: 1 EUR = 0.42 OMR  (so stored_EUR * 0.42 = stored_OMR).
--
-- WARNING: NOT idempotent. Run EXACTLY ONCE. Running it again double-converts.
-- The only stored monetary columns are listings.price_sqm and bookings.total_price.

BEGIN;

-- Widen scale so OMR's 3 decimal places (baisa) are representable.
ALTER TABLE listings ALTER COLUMN price_sqm   TYPE NUMERIC(10,3);
ALTER TABLE bookings ALTER COLUMN total_price TYPE NUMERIC(12,3);

-- Convert existing EUR amounts to OMR.
UPDATE listings SET price_sqm   = ROUND(price_sqm   * 0.42, 3), currency = 'OMR';
UPDATE bookings SET total_price = ROUND(total_price * 0.42, 3);

-- New listings default to OMR.
ALTER TABLE listings ALTER COLUMN currency SET DEFAULT 'OMR';

COMMIT;
