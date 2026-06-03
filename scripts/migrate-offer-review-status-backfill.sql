-- Yalnızca bir kez çalıştırın: sütun eklendikten sonra eski yorumları yayına alır.
UPDATE provider_offer_reviews
SET status = 'approved', moderated_at = created_at
WHERE status = 'pending' AND moderated_at IS NULL;
