-- =====================================================
-- PUBLIC VERİLERE ERİŞİM: SADECE GİRİŞ YAPMIŞ KULLANICILAR
-- =====================================================
-- Mevcut RLS politikaları is_public=true olan verileri anonim
-- kullanıcılara da gösteriyordu. Bu migration, public verilerin
-- sadece giriş yapmış (auth.uid() IS NOT NULL) kullanıcılara
-- görünmesini sağlar.
-- =====================================================

-- ----- portfolios -----
DROP POLICY IF EXISTS "Users can view own or public portfolios" ON portfolios;
CREATE POLICY "Users can view own or public portfolios"
  ON portfolios FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id
    OR (auth.uid() IS NOT NULL AND is_public = true)
  );

-- ----- holdings -----
DROP POLICY IF EXISTS "Users can view own or public holdings" ON holdings;
CREATE POLICY "Users can view own or public holdings"
  ON holdings FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id
    OR (auth.uid() IS NOT NULL AND portfolio_id IN (SELECT id FROM portfolios WHERE is_public = true))
  );

-- ----- transactions -----
DROP POLICY IF EXISTS "Users can view own or public transactions" ON transactions;
CREATE POLICY "Users can view own or public transactions"
  ON transactions FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id
    OR (auth.uid() IS NOT NULL AND portfolio_id IN (SELECT id FROM portfolios WHERE is_public = true))
  );

-- ----- users_public -----
DROP POLICY IF EXISTS "Users can view own or public profiles" ON users_public;
CREATE POLICY "Users can view own or public profiles"
  ON users_public FOR SELECT
  USING (
    (SELECT auth.uid()) = id
    OR (auth.uid() IS NOT NULL AND is_profile_public = true)
    OR (auth.uid() IS NOT NULL AND id IN (
      SELECT DISTINCT user_id FROM portfolios WHERE is_public = true
    ))
  );

-- ----- portfolio_follows -----
-- Follow politikaları zaten auth.uid() = follower_id kontrolü yapıyor,
-- bu yüzden anonim kullanıcılar zaten erişemiyor. Değişiklik gerekmez.
