-- =====================================================
-- AUTO CREATE USER PROFILE & DEFAULT PORTFOLIO TRIGGER
-- =====================================================
-- Bu trigger, yeni kullanıcı kaydolduğunda otomatik olarak:
-- 1. users_public tablosuna profil oluşturur
-- 2. Varsayılan bir portföy oluşturur
-- =====================================================

-- Trigger fonksiyonu oluştur
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Mevcut kullanıcılar için profil ve portföy oluştur (eğer yoksa)
DO $$
DECLARE
  v_user RECORD;
  v_display_name TEXT;
BEGIN
  FOR v_user IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
    -- Display name'i belirle
    v_display_name := COALESCE(
      v_user.raw_user_meta_data->>'display_name',
      SPLIT_PART(v_user.email, '@', 1)
    );

    -- Profil oluştur
    INSERT INTO public.users_public (id, display_name, base_currency)
    VALUES (v_user.id, v_display_name, 'TRY')
    ON CONFLICT (id) DO NOTHING;

    -- Varsayılan portföy oluştur
    INSERT INTO public.portfolios (user_id, name)
    VALUES (v_user.id, 'Varsayılan Portföy')
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
