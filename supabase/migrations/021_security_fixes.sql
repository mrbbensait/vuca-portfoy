-- =====================================================
-- 021 — SECURITY ADVISOR DÜZELTMELERİ
-- =====================================================
-- Supabase Security Advisor bulgularının tamamı giderildi:
--
-- ERROR  (1): feedback_stats view → SECURITY INVOKER
-- WARNING(8): Function Search Path Mutable → SET search_path = ''
-- WARNING(2): price_cache RLS Always True → write politikaları silindi
--             (API route'ları artık service_role client kullanıyor)
-- INFO   (3): RLS Enabled No Policy → USING(false) politikası eklendi
-- =====================================================

-- =====================================================
-- 1. HATA DÜZELTMESİ: feedback_stats view → SECURITY INVOKER
-- =====================================================
-- Eski view SECURITY DEFINER davranışıyla çalışıyordu (RLS bypass).
-- security_invoker = on ile view, sorgulayan kullanıcının yetkisiyle çalışır.
-- Admin API'si service_role kullandığından davranış değişmez.

DROP VIEW IF EXISTS public.feedback_stats;

CREATE VIEW public.feedback_stats
  WITH (security_invoker = on)
AS
SELECT
  COUNT(*) FILTER (WHERE status IN ('new', 'in_review'))                        AS unresolved_count,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')                AS last_7_days_count,
  COUNT(*) FILTER (WHERE priority = 'critical' AND status IN ('new','in_review')) AS critical_count,
  COUNT(*)                                                                        AS total_count,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL)                     AS unique_users
FROM public.feedback;

-- =====================================================
-- 2. UYARI DÜZELTMESİ: Function Search Path Mutable (8 fonksiyon)
-- =====================================================
-- SET search_path = '' → search_path injection saldırılarını önler.
-- Tablo referansları olan fonksiyonlarda "public." prefix eklendi.

-- 2a. generate_invitation_code (tablo referansı yok)
CREATE OR REPLACE FUNCTION public.generate_invitation_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  chars  TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i      INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- 2b. update_invitation_updated_at (tablo referansı yok)
CREATE OR REPLACE FUNCTION public.update_invitation_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2c. update_feedback_updated_at (canlı DB'de mevcut, migrations'da eksik)
CREATE OR REPLACE FUNCTION public.update_feedback_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2d. update_user_consents_updated_at (tablo referansı yok)
CREATE OR REPLACE FUNCTION public.update_user_consents_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2e. check_all_consents_given (public.user_consents ile tam nitelendirme)
CREATE OR REPLACE FUNCTION public.check_all_consents_given(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_consents
    WHERE user_id = p_user_id
      AND spk_disclaimer_accepted     = true
      AND spk_risk_disclosure_accepted = true
      AND kvkk_accepted               = true
      AND terms_accepted              = true
  );
END;
$$;

-- 2f. handle_new_user (zaten public. prefix'i var, search_path eklendi)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_display_name TEXT;
BEGIN
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  INSERT INTO public.users_public (id, display_name, base_currency)
  VALUES (NEW.id, v_display_name, 'TRY')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.portfolios (user_id, name)
  VALUES (NEW.id, 'Varsayılan Portföy')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- 2g. cleanup_expired_cache (public.price_cache ile tam nitelendirme)
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.price_cache
  WHERE expires_at < NOW();
END;
$$;

-- 2h. check_rate_limit (public.api_rate_limits ile tam nitelendirme)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id        UUID,
  p_endpoint       TEXT,
  p_max_requests   INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count        INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;

  SELECT request_count, window_start
    INTO v_count, v_window_start
    FROM public.api_rate_limits
   WHERE user_id = p_user_id AND endpoint = p_endpoint;

  IF NOT FOUND THEN
    INSERT INTO public.api_rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, NOW());
    RETURN TRUE;
  END IF;

  IF v_window_start < NOW() - (p_window_minutes || ' minutes')::INTERVAL THEN
    UPDATE public.api_rate_limits
       SET request_count = 1, window_start = NOW()
     WHERE user_id = p_user_id AND endpoint = p_endpoint;
    RETURN TRUE;
  END IF;

  IF v_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;

  UPDATE public.api_rate_limits
     SET request_count = request_count + 1
   WHERE user_id = p_user_id AND endpoint = p_endpoint;

  RETURN TRUE;
END;
$$;

-- =====================================================
-- 3. UYARI DÜZELTMESİ: price_cache RLS Always True
-- =====================================================
-- API route'ları (/api/price/quote, /api/price/batch) artık
-- cache upsert için service_role client kullanıyor.
-- Authenticated write politikaları artık gerekli değil.

DROP POLICY IF EXISTS "Authenticated users can write price cache"  ON public.price_cache;
DROP POLICY IF EXISTS "Authenticated users can update price cache" ON public.price_cache;

-- SELECT politikası olduğu gibi kalıyor (authenticated okuma güvenli).

-- =====================================================
-- 4. BİLGİ ÖNERİSİ: RLS Enabled No Policy (3 tablo)
-- =====================================================
-- Bu tablolar kasıtlı olarak sadece service_role üzerinden erişilebilir.
-- USING(false) politikaları bu niyeti belgelemenin standart yoludur.
-- Service_role RLS'yi bypass ettiğinden admin işlemleri etkilenmez.

CREATE POLICY "No direct user access to admin_audit_log"
  ON public.admin_audit_log
  FOR ALL
  USING (false);

CREATE POLICY "No direct user access to invitation_uses"
  ON public.invitation_uses
  FOR ALL
  USING (false);

CREATE POLICY "No direct user access to invitations"
  ON public.invitations
  FOR ALL
  USING (false);

-- =====================================================
-- NOT: Leaked Password Protection
-- =====================================================
-- Bu ayar SQL ile değil, Supabase Dashboard üzerinden yapılır:
-- Authentication → Settings → Password Protection →
-- "Enable leaked password protection" seçeneğini aktif et.
-- =====================================================
-- MİGRATION TAMAMLANDI — 021_security_fixes
-- =====================================================
