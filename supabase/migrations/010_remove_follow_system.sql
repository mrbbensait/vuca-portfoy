-- =====================================================
-- TAKİP SİSTEMİNİ KALDIR
-- =====================================================
-- portfolio_follows tablosu, follower_count alanı,
-- trigger ve ilgili RLS politikaları kaldırılıyor.
-- =====================================================

-- 1. Trigger'ı kaldır
DROP TRIGGER IF EXISTS trg_follower_count ON portfolio_follows;
DROP FUNCTION IF EXISTS update_follower_count();

-- 2. portfolio_follows RLS politikalarını kaldır
DROP POLICY IF EXISTS "Users can view own follows" ON portfolio_follows;
DROP POLICY IF EXISTS "Users can follow public portfolios" ON portfolio_follows;
DROP POLICY IF EXISTS "Users can unfollow" ON portfolio_follows;

-- 3. portfolio_follows tablosunu kaldır
DROP TABLE IF EXISTS portfolio_follows;

-- 4. portfolios tablosundan follower_count alanını kaldır
ALTER TABLE portfolios DROP COLUMN IF EXISTS follower_count;

-- 5. follower_count indexlerini kaldır (tablo alanı kalktığında otomatik kalkar ama güvenlik için)
DROP INDEX IF EXISTS idx_portfolios_follower_count;
