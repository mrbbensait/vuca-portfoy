-- =====================================================
-- 013 — PORTFOLIO ANNOUNCEMENTS (DUYURU SİSTEMİ)
-- =====================================================
-- Public portföy sahipleri takipçilerine duyuru/analiz paylaşabilir
-- Link paylaşma, pin özelliği, Telegram entegrasyonu
-- Fan-out yok: 1 duyuru = 1 satır (scalable)
-- =====================================================

-- =====================================================
-- 1. PORTFOLIO_ANNOUNCEMENTS TABLOSU
-- =====================================================

CREATE TABLE IF NOT EXISTS portfolio_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  links JSONB DEFAULT '[]'::jsonb NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE portfolio_announcements IS 'Public portföy sahiplerinin takipçilerine paylaştığı duyurular ve analizler';
COMMENT ON COLUMN portfolio_announcements.title IS 'Duyuru başlığı';
COMMENT ON COLUMN portfolio_announcements.content IS 'Duyuru içeriği (metin)';
COMMENT ON COLUMN portfolio_announcements.links IS 'Dışarı linklər: [{url: string, label: string}]';
COMMENT ON COLUMN portfolio_announcements.is_pinned IS 'true ise duyuru üstte sabitlenir';

-- =====================================================
-- 2. İNDEXLER
-- =====================================================

-- Portföy bazlı sıralama (feed sorguları için kritik)
CREATE INDEX IF NOT EXISTS idx_announcements_portfolio_created
  ON portfolio_announcements(portfolio_id, created_at DESC);

-- Pinned announcements hızlı sorgusu
CREATE INDEX IF NOT EXISTS idx_announcements_pinned
  ON portfolio_announcements(is_pinned, created_at DESC)
  WHERE is_pinned = true;

-- User bazlı sıralama (kullanıcının kendi duyuruları)
CREATE INDEX IF NOT EXISTS idx_announcements_user
  ON portfolio_announcements(user_id, created_at DESC);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE portfolio_announcements ENABLE ROW LEVEL SECURITY;

-- Herkes public portföylerin duyurularını görebilir
DROP POLICY IF EXISTS "Anyone can view public portfolio announcements" ON portfolio_announcements;
CREATE POLICY "Anyone can view public portfolio announcements"
  ON portfolio_announcements FOR SELECT
  USING (
    portfolio_id IN (SELECT id FROM portfolios WHERE is_public = true)
  );

-- Sadece portföy sahibi kendi portföyüne duyuru ekleyebilir
DROP POLICY IF EXISTS "Users can insert own portfolio announcements" ON portfolio_announcements;
CREATE POLICY "Users can insert own portfolio announcements"
  ON portfolio_announcements FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND portfolio_id IN (SELECT id FROM portfolios WHERE user_id = (SELECT auth.uid()))
  );

-- Sadece portföy sahibi kendi duyurularını güncelleyebilir
DROP POLICY IF EXISTS "Users can update own announcements" ON portfolio_announcements;
CREATE POLICY "Users can update own announcements"
  ON portfolio_announcements FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Sadece portföy sahibi kendi duyurularını silebilir
DROP POLICY IF EXISTS "Users can delete own announcements" ON portfolio_announcements;
CREATE POLICY "Users can delete own announcements"
  ON portfolio_announcements FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 4. UPDATED_AT TRİGGER
-- =====================================================

-- Mevcut update_updated_at_column fonksiyonu kullanılır
DROP TRIGGER IF EXISTS update_announcements_updated_at ON portfolio_announcements;
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON portfolio_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MİGRATION TAMAMLANDI — 013_portfolio_announcements
-- =====================================================
