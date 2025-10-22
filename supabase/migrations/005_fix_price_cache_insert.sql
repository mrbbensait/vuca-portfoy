-- Price Cache INSERT Politikası Ekleme
-- API'nin cache'e yazabilmesi için

-- 1. Eski politikayı güncelle (sadece SELECT yerine tüm işlemler)
DROP POLICY IF EXISTS "Authenticated users can read price cache" ON price_cache;

-- 2. Yeni politika: Authenticated kullanıcılar okuyabilir
CREATE POLICY "Authenticated users can read price cache"
  ON price_cache FOR SELECT
  TO authenticated
  USING (true);

-- 3. YENİ: API authenticated kullanıcılar adına INSERT/UPDATE yapabilir
CREATE POLICY "Authenticated users can write price cache"
  ON price_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update price cache"
  ON price_cache FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Yorum ekle
COMMENT ON POLICY "Authenticated users can write price cache" ON price_cache 
  IS 'API authenticated kullanıcılar adına cache''e fiyat yazabilir (global paylaşımlı cache)';
