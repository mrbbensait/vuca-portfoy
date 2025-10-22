-- Price Cache Sistemi
-- Binlerce kullanıcı için optimize edilmiş fiyat önbellekleme

-- 1. Fiyat önbellek tablosu
CREATE TABLE IF NOT EXISTS price_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  currency TEXT DEFAULT 'USD',
  name TEXT,
  source TEXT, -- 'binance', 'yahoo', vb.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Aynı sembol için tek kayıt
  CONSTRAINT unique_symbol_asset UNIQUE(symbol, asset_type)
);

-- 2. İndeksler (hızlı sorgulama için)
CREATE INDEX IF NOT EXISTS idx_price_cache_symbol ON price_cache(symbol);
CREATE INDEX IF NOT EXISTS idx_price_cache_expires ON price_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_price_cache_updated ON price_cache(updated_at DESC);

-- 3. Rate limiting tablosu (güvenlik)
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_endpoint UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user ON api_rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON api_rate_limits(window_start);

-- 4. Otomatik temizleme (eski cache kayıtlarını sil)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM price_cache
  WHERE expires_at < NOW();
END;
$$;

-- 5. Rate limit kontrolü fonksiyonu
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  -- Pencere başlangıcını hesapla
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Mevcut kaydı kontrol et
  SELECT request_count, window_start INTO v_count, v_window_start
  FROM api_rate_limits
  WHERE user_id = p_user_id AND endpoint = p_endpoint;
  
  -- Kayıt yoksa oluştur
  IF NOT FOUND THEN
    INSERT INTO api_rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, NOW());
    RETURN TRUE;
  END IF;
  
  -- Pencere süresi dolmuşsa sıfırla
  IF v_window_start < NOW() - (p_window_minutes || ' minutes')::INTERVAL THEN
    UPDATE api_rate_limits
    SET request_count = 1, window_start = NOW()
    WHERE user_id = p_user_id AND endpoint = p_endpoint;
    RETURN TRUE;
  END IF;
  
  -- Limit aşılmış mı kontrol et
  IF v_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Sayacı artır
  UPDATE api_rate_limits
  SET request_count = request_count + 1
  WHERE user_id = p_user_id AND endpoint = p_endpoint;
  
  RETURN TRUE;
END;
$$;

-- 6. RLS Politikaları
ALTER TABLE price_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Herkes cache'i okuyabilir (ama sadece authenticated kullanıcılar)
CREATE POLICY "Authenticated users can read price cache"
  ON price_cache FOR SELECT
  TO authenticated
  USING (true);

-- Rate limits sadece kendi kayıtlarını görebilir
CREATE POLICY "Users can view own rate limits"
  ON api_rate_limits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. Yorum ekle
COMMENT ON TABLE price_cache IS 'Dış API''lerden alınan fiyat verilerinin önbelleği. Expires_at ile otomatik yenilenir.';
COMMENT ON TABLE api_rate_limits IS 'API endpoint''leri için kullanıcı bazlı rate limiting.';
COMMENT ON FUNCTION check_rate_limit IS 'Kullanıcının belirli bir endpoint için rate limitini kontrol eder.';
COMMENT ON FUNCTION cleanup_expired_cache IS 'Süresi dolmuş cache kayıtlarını temizler. Cron job ile çalıştırılmalı.';
