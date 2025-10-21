-- =====================================================
-- AUTO CREATE USER PROFILE TRIGGER
-- =====================================================
-- Bu trigger, yeni kullanıcı kaydolduğunda otomatik olarak
-- users_public tablosuna profil oluşturur
-- =====================================================

-- Trigger fonksiyonu oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_public (id, display_name, base_currency)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name', 'TRY');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Mevcut kullanıcılar için profil oluştur (eğer yoksa)
INSERT INTO public.users_public (id, display_name, base_currency)
SELECT id, raw_user_meta_data->>'display_name', 'TRY'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users_public)
ON CONFLICT (id) DO NOTHING;
