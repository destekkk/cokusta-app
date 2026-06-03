-- Müşteri değerlendirme onayı: pending | approved | rejected
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OfferReviewStatus') THEN
    CREATE TYPE "OfferReviewStatus" AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

ALTER TABLE provider_offer_reviews
  ADD COLUMN IF NOT EXISTS status "OfferReviewStatus" NOT NULL DEFAULT 'pending';

ALTER TABLE provider_offer_reviews
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

-- Tek seferlik (mevcut yorumlar): psql ... -f scripts/migrate-offer-review-status-backfill.sql

CREATE INDEX IF NOT EXISTS provider_offer_reviews_status_created_at_idx
  ON provider_offer_reviews (status, created_at DESC);
