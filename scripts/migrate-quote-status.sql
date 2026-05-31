-- Neon SQL Editor'da ÇALIŞTIRIN (prisma db push ÖNCESİ)
-- Eski QuoteStatus: pending, matched, completed, cancelled
-- Yeni QuoteStatus: awaiting_review, open, accepted, completed, cancelled

-- Başarısız db push kalıntısı
DROP TYPE IF EXISTS "QuoteStatus_new";

-- Varsayılanı kaldır
ALTER TABLE quote_requests ALTER COLUMN status DROP DEFAULT;

-- Enum → text (pending/matched değerleri korunur)
ALTER TABLE quote_requests
  ALTER COLUMN status TYPE TEXT USING status::TEXT;

-- Eski değerleri yeni isimlere çevir
UPDATE quote_requests SET status = 'open'      WHERE status = 'pending';
UPDATE quote_requests SET status = 'accepted'  WHERE status = 'matched';

-- Eski enum'u sil (Prisma db push yenisini oluşturur)
DROP TYPE IF EXISTS "QuoteStatus";

-- Kontrol (beklenen: pending/matched satır sayısı 0)
-- SELECT status, COUNT(*) FROM quote_requests GROUP BY status ORDER BY status;
