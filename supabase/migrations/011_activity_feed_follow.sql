-- =====================================================
-- 011 — TAKİP SİSTEMİ + AKTİVİTE AKIŞI (ACTIVITY FEED)
-- =====================================================
-- Bu migration aşağıdaki tabloları oluşturur:
--   1. portfolio_follows  (takip ilişkisi)
--   2. portfolio_activities (işlem aktiviteleri — her işlem 1 satır)
-- Trigger KULLANILMAZ (fan-out problemi önlenir).
-- Activity yazma uygulama seviyesinde yapılır.
-- =====================================================

-- =====================================================
-- 1. PORTFOLIO_FOLLOWS TABLOSU
-- =====================================================

CREATE TABLE IF NOT EXISTS portfolio_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMPTZ,          -- okundu takibi (son görülme zamanı)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(follower_id, portfolio_id)
);

COMMENT ON TABLE portfolio_follows IS 'Kullanıcıların public portföyleri takip etme ilişkisi';
COMMENT ON COLUMN portfolio_follows.last_seen_at IS 'Kullanıcının bu portföyün aktivitelerini en son gördüğü zaman';

-- =====================================================
-- 2. PORTFOLIO_ACTIVITIES TABLOSU
-- =====================================================

CREATE TABLE IF NOT EXISTS portfolio_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL,               -- işlemi yapan kişi (user_id)
  type TEXT NOT NULL CHECK (type IN ('NEW_TRADE', 'HOLDING_CLOSED', 'PORTFOLIO_UPDATED')),
  title TEXT NOT NULL,                   -- "Alış: 100 ASELS.IS"
  metadata JSONB DEFAULT '{}' NOT NULL,  -- {symbol, side, quantity, price, asset_type}
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE portfolio_activities IS 'Public portföylerdeki işlem aktiviteleri. Her işlem 1 satır. Fan-out yok.';
COMMENT ON COLUMN portfolio_activities.metadata IS 'İşlem detayları: symbol, side, quantity, price, asset_type vb.';

-- =====================================================
-- 3. İNDEXLER
-- =====================================================

-- Follows: Kullanıcının takip ettiklerini hızlı bulmak için
CREATE INDEX IF NOT EXISTS idx_follows_follower ON portfolio_follows(follower_id);

-- Follows: Bir portföyün takipçilerini bulmak için
CREATE INDEX IF NOT EXISTS idx_follows_portfolio ON portfolio_follows(portfolio_id);

-- Activities: Portföy bazlı + tarih sıralamalı (feed sorgusu için kritik)
CREATE INDEX IF NOT EXISTS idx_activities_portfolio_created
  ON portfolio_activities(portfolio_id, created_at DESC);

-- Activities: Tarih bazlı temizlik ve sorgulama için
CREATE INDEX IF NOT EXISTS idx_activities_created
  ON portfolio_activities(created_at DESC);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- ----- portfolio_follows -----
ALTER TABLE portfolio_follows ENABLE ROW LEVEL SECURITY;

-- Kendi takiplerini görüntüleyebilir
DROP POLICY IF EXISTS "Users can view own follows" ON portfolio_follows;
CREATE POLICY "Users can view own follows"
  ON portfolio_follows FOR SELECT
  USING ((SELECT auth.uid()) = follower_id);

-- Sadece public portföyleri takip edebilir
DROP POLICY IF EXISTS "Users can follow public portfolios" ON portfolio_follows;
CREATE POLICY "Users can follow public portfolios"
  ON portfolio_follows FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = follower_id
    AND portfolio_id IN (SELECT id FROM portfolios WHERE is_public = true)
  );

-- Kendi takibini güncelleyebilir (last_seen_at için)
DROP POLICY IF EXISTS "Users can update own follows" ON portfolio_follows;
CREATE POLICY "Users can update own follows"
  ON portfolio_follows FOR UPDATE
  USING ((SELECT auth.uid()) = follower_id)
  WITH CHECK ((SELECT auth.uid()) = follower_id);

-- Kendi takibini kaldırabilir
DROP POLICY IF EXISTS "Users can unfollow" ON portfolio_follows;
CREATE POLICY "Users can unfollow"
  ON portfolio_follows FOR DELETE
  USING ((SELECT auth.uid()) = follower_id);

-- ----- portfolio_activities -----
ALTER TABLE portfolio_activities ENABLE ROW LEVEL SECURITY;

-- Herkes public portföylerin aktivitelerini görebilir
DROP POLICY IF EXISTS "Anyone can view public portfolio activities" ON portfolio_activities;
CREATE POLICY "Anyone can view public portfolio activities"
  ON portfolio_activities FOR SELECT
  USING (
    portfolio_id IN (SELECT id FROM portfolios WHERE is_public = true)
  );

-- Sadece kendi portföyü için activity ekleyebilir (uygulama seviyesinde yapılır)
DROP POLICY IF EXISTS "Users can insert own portfolio activities" ON portfolio_activities;
CREATE POLICY "Users can insert own portfolio activities"
  ON portfolio_activities FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = actor_id
    AND portfolio_id IN (SELECT id FROM portfolios WHERE user_id = (SELECT auth.uid()))
  );

-- =====================================================
-- MİGRATION TAMAMLANDI — 011_activity_feed_follow
-- =====================================================
