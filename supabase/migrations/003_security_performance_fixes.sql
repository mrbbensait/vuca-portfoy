-- =====================================================
-- SECURITY & PERFORMANCE FIXES
-- =====================================================
-- Bu migration güvenlik ve performans iyileştirmeleri içerir:
-- 1. Function search_path güvenlik açığını kapatır
-- 2. RLS politikalarını optimize eder (auth.uid() -> select auth.uid())
-- 3. Eksik foreign key indexlerini ekler
-- =====================================================

-- =====================================================
-- 1. FUNCTION SECURITY FIXES
-- =====================================================

-- update_updated_at_column fonksiyonunu güvenli hale getir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- handle_new_user fonksiyonunu güvenli hale getir
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_display_name TEXT;
BEGIN
  -- Display name'i metadata'dan al, yoksa email'den oluştur
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- 1. Kullanıcı profilini oluştur
  INSERT INTO public.users_public (id, display_name, base_currency)
  VALUES (NEW.id, v_display_name, 'TRY')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Varsayılan portföyü oluştur
  INSERT INTO public.portfolios (user_id, name)
  VALUES (NEW.id, 'Varsayılan Portföy')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- =====================================================
-- 2. RLS POLICY OPTIMIZATION
-- =====================================================

-- users_public politikalarını optimize et
DROP POLICY IF EXISTS "Users can view own profile" ON users_public;
CREATE POLICY "Users can view own profile"
  ON users_public FOR SELECT
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users_public;
CREATE POLICY "Users can insert own profile"
  ON users_public FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users_public;
CREATE POLICY "Users can update own profile"
  ON users_public FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- portfolios politikalarını optimize et
DROP POLICY IF EXISTS "Users can view own portfolios" ON portfolios;
CREATE POLICY "Users can view own portfolios"
  ON portfolios FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own portfolios" ON portfolios;
CREATE POLICY "Users can insert own portfolios"
  ON portfolios FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own portfolios" ON portfolios;
CREATE POLICY "Users can update own portfolios"
  ON portfolios FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own portfolios" ON portfolios;
CREATE POLICY "Users can delete own portfolios"
  ON portfolios FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- holdings politikalarını optimize et
DROP POLICY IF EXISTS "Users can view own holdings" ON holdings;
CREATE POLICY "Users can view own holdings"
  ON holdings FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own holdings" ON holdings;
CREATE POLICY "Users can insert own holdings"
  ON holdings FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own holdings" ON holdings;
CREATE POLICY "Users can update own holdings"
  ON holdings FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own holdings" ON holdings;
CREATE POLICY "Users can delete own holdings"
  ON holdings FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- transactions politikalarını optimize et
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- notes politikalarını optimize et
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON notes;
CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- alerts politikalarını optimize et
DROP POLICY IF EXISTS "Users can view own alerts" ON alerts;
CREATE POLICY "Users can view own alerts"
  ON alerts FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own alerts" ON alerts;
CREATE POLICY "Users can insert own alerts"
  ON alerts FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own alerts" ON alerts;
CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own alerts" ON alerts;
CREATE POLICY "Users can delete own alerts"
  ON alerts FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 3. MISSING FOREIGN KEY INDEXES
-- =====================================================

-- alerts tablosu için user_id index'i
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);

-- notes tablosu için user_id index'i
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

-- =====================================================
-- MIGRATION TAMAMLANDI
-- =====================================================
