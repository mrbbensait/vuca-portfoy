-- =====================================================
-- SOSYAL PORTFÖY — VERİTABANI MİGRATIONU
-- =====================================================
-- Bu migration şunları ekler:
-- 1. portfolios tablosuna sosyal alanlar (is_public, slug, description, follower_count)
-- 2. users_public tablosuna profil alanları (avatar_url, bio, is_profile_public)
-- 3. portfolio_follows tablosu (takip sistemi)
-- 4. Follower count trigger
-- 5. RLS politika güncellemeleri (public portföylerin görünmesi)
-- =====================================================

-- =====================================================
-- 1. PORTFOLIOS TABLOSUNA SOSYAL ALANLAR
-- =====================================================

ALTER TABLE portfolios
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0 NOT NULL;

-- Slug benzersiz olmalı (sadece dolu olanlar için)
CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolios_slug_unique
  ON portfolios(slug) WHERE slug IS NOT NULL;

-- Public portföyleri hızlı sorgulamak için partial index
CREATE INDEX IF NOT EXISTS idx_portfolios_is_public
  ON portfolios(is_public) WHERE is_public = true;

-- Follower count'a göre sıralama için
CREATE INDEX IF NOT EXISTS idx_portfolios_follower_count
  ON portfolios(follower_count DESC) WHERE is_public = true;

-- =====================================================
-- 2. USERS_PUBLIC TABLOSUNA PROFİL ALANLARI
-- =====================================================

ALTER TABLE users_public
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN DEFAULT FALSE NOT NULL;

-- =====================================================
-- 3. PORTFOLIO_FOLLOWS TABLOSU (TAKİP SİSTEMİ)
-- =====================================================

CREATE TABLE IF NOT EXISTS portfolio_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(follower_id, portfolio_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON portfolio_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_portfolio ON portfolio_follows(portfolio_id);

-- =====================================================
-- 4. FOLLOWER COUNT TRIGGER
-- =====================================================
-- Follow/unfollow işlemlerinde portfolios.follower_count otomatik güncellenir

CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE portfolios SET follower_count = follower_count + 1 WHERE id = NEW.portfolio_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE portfolios SET follower_count = follower_count - 1 WHERE id = OLD.portfolio_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

DROP TRIGGER IF EXISTS trg_follower_count ON portfolio_follows;
CREATE TRIGGER trg_follower_count
  AFTER INSERT OR DELETE ON portfolio_follows
  FOR EACH ROW EXECUTE FUNCTION update_follower_count();

-- =====================================================
-- 5. RLS POLİTİKA GÜNCELLEMELERİ
-- =====================================================
-- Mevcut "sadece kendim görebilirim" politikalarını
-- "kendim + public olanlar" şeklinde genişletiyoruz.
-- Write (INSERT/UPDATE/DELETE) politikaları DEĞİŞMİYOR.

-- ----- portfolios -----
DROP POLICY IF EXISTS "Users can view own portfolios" ON portfolios;
DROP POLICY IF EXISTS "Users can view own or public portfolios" ON portfolios;
CREATE POLICY "Users can view own or public portfolios"
  ON portfolios FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id
    OR is_public = true
  );

-- ----- holdings -----
DROP POLICY IF EXISTS "Users can view own holdings" ON holdings;
DROP POLICY IF EXISTS "Users can view own or public holdings" ON holdings;
CREATE POLICY "Users can view own or public holdings"
  ON holdings FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id
    OR portfolio_id IN (SELECT id FROM portfolios WHERE is_public = true)
  );

-- ----- transactions -----
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own or public transactions" ON transactions;
CREATE POLICY "Users can view own or public transactions"
  ON transactions FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id
    OR portfolio_id IN (SELECT id FROM portfolios WHERE is_public = true)
  );

-- ----- users_public -----
DROP POLICY IF EXISTS "Users can view own profile" ON users_public;
DROP POLICY IF EXISTS "Users can view own or public profiles" ON users_public;
CREATE POLICY "Users can view own or public profiles"
  ON users_public FOR SELECT
  USING (
    (SELECT auth.uid()) = id
    OR is_profile_public = true
  );

-- ----- portfolio_follows -----
ALTER TABLE portfolio_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own follows" ON portfolio_follows;
CREATE POLICY "Users can view own follows"
  ON portfolio_follows FOR SELECT
  USING ((SELECT auth.uid()) = follower_id);

DROP POLICY IF EXISTS "Users can follow public portfolios" ON portfolio_follows;
CREATE POLICY "Users can follow public portfolios"
  ON portfolio_follows FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = follower_id
    AND portfolio_id IN (SELECT id FROM portfolios WHERE is_public = true)
  );

DROP POLICY IF EXISTS "Users can unfollow" ON portfolio_follows;
CREATE POLICY "Users can unfollow"
  ON portfolio_follows FOR DELETE
  USING ((SELECT auth.uid()) = follower_id);

-- =====================================================
-- 6. COMMENTS
-- =====================================================

COMMENT ON COLUMN portfolios.is_public IS 'true ise portföy herkese açık';
COMMENT ON COLUMN portfolios.slug IS 'SEO-friendly URL parçası, benzersiz';
COMMENT ON COLUMN portfolios.description IS 'Portföy kısa açıklaması';
COMMENT ON COLUMN portfolios.follower_count IS 'Denormalize takipçi sayısı (trigger ile güncellenir)';
COMMENT ON TABLE portfolio_follows IS 'Kullanıcıların public portföyleri takip etmesi';
COMMENT ON COLUMN users_public.avatar_url IS 'Kullanıcı profil resmi URL';
COMMENT ON COLUMN users_public.bio IS 'Kullanıcı hakkında kısa bilgi';
COMMENT ON COLUMN users_public.is_profile_public IS 'true ise profil herkese açık';
