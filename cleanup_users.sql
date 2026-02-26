-- =====================================================
-- DATABASE TEMİZLEME - Superadmin Hariç Tüm Kullanıcılar
-- =====================================================
-- KULLANIM: Supabase Dashboard → SQL Editor'da çalıştırın
-- =====================================================

DO $$
DECLARE
  superadmin_id UUID;
  deleted_count INTEGER;
  user_record RECORD;
BEGIN
  -- 1. Superadmin kullanıcı ID'sini bul
  SELECT id INTO superadmin_id
  FROM auth.users
  WHERE email = 'saitarslan7@gmail.com';
  
  IF superadmin_id IS NULL THEN
    RAISE EXCEPTION 'HATA: saitarslan7@gmail.com kullanıcısı bulunamadı! İşlem iptal edildi.';
  END IF;
  
  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE 'Superadmin bulundu: saitarslan7@gmail.com';
  RAISE NOTICE 'ID: %', superadmin_id;
  RAISE NOTICE '══════════════════════════════════════════════════════';
  
  -- 2. Silinecek kullanıcıları listele
  RAISE NOTICE 'Silinecek kullanıcılar:';
  FOR user_record IN 
    SELECT email, created_at 
    FROM auth.users 
    WHERE id != superadmin_id 
    ORDER BY created_at
  LOOP
    RAISE NOTICE '  - % (Kayıt: %)', user_record.email, user_record.created_at;
  END LOOP;
  
  -- 3. Silinecek kullanıcı sayısını say
  SELECT COUNT(*) INTO deleted_count
  FROM auth.users
  WHERE id != superadmin_id;
  
  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE 'TOPLAM SİLİNECEK KULLANICI: %', deleted_count;
  RAISE NOTICE '══════════════════════════════════════════════════════';
  
  -- 4. Superadmin hariç tüm kullanıcıları sil
  -- CASCADE delete ile otomatik olarak şunlar silinir:
  --   - portfolios
  --   - holdings
  --   - transactions
  --   - notes
  --   - alerts
  --   - portfolio_follows
  --   - portfolio_activities
  --   - portfolio_announcements
  --   - user_roles
  --   - invitation_uses
  --   - feedback
  --   - user_consents
  DELETE FROM auth.users
  WHERE id != superadmin_id;
  
  RAISE NOTICE '';
  RAISE NOTICE '✓ TEMİZLEME TAMAMLANDI!';
  RAISE NOTICE '✓ % kullanıcı silindi', deleted_count;
  RAISE NOTICE '✓ Superadmin korundu';
  RAISE NOTICE '';
  
END $$;

-- =====================================================
-- DOĞRULAMA SORULARI
-- =====================================================

-- Kalan kullanıcılar (sadece 1 olmalı: saitarslan7@gmail.com)
SELECT 'KALAN KULLANICILAR' as durum;
SELECT email, created_at FROM auth.users ORDER BY created_at;

-- Kalan veri sayıları
SELECT 'VERİ İSTATİSTİKLERİ' as durum;
SELECT 
  (SELECT COUNT(*) FROM auth.users) as kullanici_sayisi,
  (SELECT COUNT(*) FROM portfolios) as portfolio_sayisi,
  (SELECT COUNT(*) FROM transactions) as islem_sayisi,
  (SELECT COUNT(*) FROM holdings) as holding_sayisi,
  (SELECT COUNT(*) FROM notes) as not_sayisi,
  (SELECT COUNT(*) FROM portfolio_announcements) as duyuru_sayisi,
  (SELECT COUNT(*) FROM feedback) as feedback_sayisi,
  (SELECT COUNT(*) FROM price_history) as fiyat_gecmisi_sayisi;
