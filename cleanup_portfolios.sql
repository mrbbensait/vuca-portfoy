-- =====================================================
-- PORTFÖY TEMİZLEME - TEST V1 Hariç Tüm Portföyler
-- =====================================================
-- KULLANIM: Supabase Dashboard → SQL Editor'da çalıştırın
-- =====================================================

-- =====================================================
-- 1. ADIM: ARTIK VERİ KONTROLÜ (Orphan Records)
-- =====================================================

DO $$
DECLARE
  orphan_count INTEGER := 0;
BEGIN
  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE '1. ARTIK VERİ KONTROLÜ (Orphan Records)';
  RAISE NOTICE '══════════════════════════════════════════════════════';
  
  -- Kullanıcısı olmayan portföyler
  SELECT COUNT(*) INTO orphan_count
  FROM portfolios p
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.user_id);
  RAISE NOTICE 'Orphan Portfolios: %', orphan_count;
  
  -- Kullanıcısı olmayan holdings
  SELECT COUNT(*) INTO orphan_count
  FROM holdings h
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = h.user_id);
  RAISE NOTICE 'Orphan Holdings: %', orphan_count;
  
  -- Kullanıcısı olmayan transactions
  SELECT COUNT(*) INTO orphan_count
  FROM transactions t
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = t.user_id);
  RAISE NOTICE 'Orphan Transactions: %', orphan_count;
  
  -- Kullanıcısı olmayan notes
  SELECT COUNT(*) INTO orphan_count
  FROM notes n
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = n.user_id);
  RAISE NOTICE 'Orphan Notes: %', orphan_count;
  
  -- Kullanıcısı olmayan activities
  SELECT COUNT(*) INTO orphan_count
  FROM portfolio_activities pa
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = pa.actor_id);
  RAISE NOTICE 'Orphan Activities: %', orphan_count;
  
  -- Kullanıcısı olmayan announcements
  SELECT COUNT(*) INTO orphan_count
  FROM portfolio_announcements pa
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = pa.user_id);
  RAISE NOTICE 'Orphan Announcements: %', orphan_count;
  
  -- Kullanıcısı olmayan feedback
  SELECT COUNT(*) INTO orphan_count
  FROM feedback f
  WHERE f.user_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = f.user_id);
  RAISE NOTICE 'Orphan Feedback: %', orphan_count;
  
  -- Kullanıcısı olmayan user_roles
  SELECT COUNT(*) INTO orphan_count
  FROM user_roles ur
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = ur.user_id);
  RAISE NOTICE 'Orphan User Roles: %', orphan_count;
  
  RAISE NOTICE '';
END $$;

-- =====================================================
-- 2. ADIM: SUPERADMIN'İN PORTFÖY LİSTESİ
-- =====================================================

DO $$
DECLARE
  superadmin_id UUID;
  portfolio_record RECORD;
BEGIN
  -- Superadmin ID'sini bul
  SELECT id INTO superadmin_id
  FROM auth.users
  WHERE email = 'saitarslan7@gmail.com';
  
  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE '2. SUPERADMIN PORTFÖY LİSTESİ';
  RAISE NOTICE '══════════════════════════════════════════════════════';
  
  FOR portfolio_record IN
    SELECT 
      p.id,
      p.name,
      p.is_public,
      p.created_at,
      COUNT(DISTINCT h.id) as holding_count,
      COUNT(DISTINCT t.id) as transaction_count,
      COUNT(DISTINCT n.id) as note_count,
      COUNT(DISTINCT pa.id) as announcement_count,
      COUNT(DISTINCT pac.id) as activity_count
    FROM portfolios p
    LEFT JOIN holdings h ON h.portfolio_id = p.id
    LEFT JOIN transactions t ON t.portfolio_id = p.id
    LEFT JOIN notes n ON n.portfolio_id = p.id
    LEFT JOIN portfolio_announcements pa ON pa.portfolio_id = p.id
    LEFT JOIN portfolio_activities pac ON pac.portfolio_id = p.id
    WHERE p.user_id = superadmin_id
    GROUP BY p.id, p.name, p.is_public, p.created_at
    ORDER BY p.created_at
  LOOP
    RAISE NOTICE '';
    RAISE NOTICE 'Portföy: %', portfolio_record.name;
    RAISE NOTICE '  ID: %', portfolio_record.id;
    RAISE NOTICE '  Public: %', portfolio_record.is_public;
    RAISE NOTICE '  Holding: %', portfolio_record.holding_count;
    RAISE NOTICE '  İşlem: %', portfolio_record.transaction_count;
    RAISE NOTICE '  Not: %', portfolio_record.note_count;
    RAISE NOTICE '  Duyuru: %', portfolio_record.announcement_count;
    RAISE NOTICE '  Aktivite: %', portfolio_record.activity_count;
    RAISE NOTICE '  Oluşturulma: %', portfolio_record.created_at;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- =====================================================
-- 3. ADIM: TEST V1 HARİÇ DİĞER PORTFÖYLERI SİL
-- =====================================================

DO $$
DECLARE
  superadmin_id UUID;
  test_v1_id UUID;
  deleted_count INTEGER;
  portfolio_record RECORD;
BEGIN
  -- Superadmin ID'sini bul
  SELECT id INTO superadmin_id
  FROM auth.users
  WHERE email = 'saitarslan7@gmail.com';
  
  IF superadmin_id IS NULL THEN
    RAISE EXCEPTION 'Superadmin bulunamadı!';
  END IF;
  
  -- TEST V1 portföy ID'sini bul
  SELECT id INTO test_v1_id
  FROM portfolios
  WHERE user_id = superadmin_id
    AND name = 'TEST V1';
  
  IF test_v1_id IS NULL THEN
    RAISE NOTICE 'UYARI: TEST V1 portföyü bulunamadı. Tüm portföyler korunacak.';
    RETURN;
  END IF;
  
  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE '3. PORTFÖY TEMİZLEME';
  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE 'Korunacak portföy: TEST V1 (ID: %)', test_v1_id;
  RAISE NOTICE '';
  RAISE NOTICE 'Silinecek portföyler:';
  
  -- Silinecek portföyleri listele
  FOR portfolio_record IN
    SELECT id, name, is_public, created_at
    FROM portfolios
    WHERE user_id = superadmin_id
      AND id != test_v1_id
    ORDER BY created_at
  LOOP
    RAISE NOTICE '  - % (ID: %)', portfolio_record.name, portfolio_record.id;
  END LOOP;
  
  -- Silinecek portföy sayısı
  SELECT COUNT(*) INTO deleted_count
  FROM portfolios
  WHERE user_id = superadmin_id
    AND id != test_v1_id;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Silinecek portföy sayısı: %', deleted_count;
  
  -- CASCADE DELETE ile sil
  -- Otomatik olarak şunlar da silinir:
  --   - holdings
  --   - transactions
  --   - notes
  --   - alerts
  --   - portfolio_follows
  --   - portfolio_activities
  --   - portfolio_announcements
  DELETE FROM portfolios
  WHERE user_id = superadmin_id
    AND id != test_v1_id;
  
  RAISE NOTICE '';
  RAISE NOTICE '✓ TEMİZLEME TAMAMLANDI!';
  RAISE NOTICE '✓ % portföy silindi', deleted_count;
  RAISE NOTICE '✓ TEST V1 portföyü korundu';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- 4. ADIM: DOĞRULAMA
-- =====================================================

DO $$
DECLARE
  superadmin_id UUID;
BEGIN
  SELECT id INTO superadmin_id
  FROM auth.users
  WHERE email = 'saitarslan7@gmail.com';
  
  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE '4. DOĞRULAMA - KALAN VERİLER';
  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE 'Toplam kullanıcı: %', (SELECT COUNT(*) FROM auth.users);
  RAISE NOTICE 'Toplam portföy: %', (SELECT COUNT(*) FROM portfolios);
  RAISE NOTICE 'Superadmin portföy: %', (SELECT COUNT(*) FROM portfolios WHERE user_id = superadmin_id);
  RAISE NOTICE 'Toplam holding: %', (SELECT COUNT(*) FROM holdings);
  RAISE NOTICE 'Toplam işlem: %', (SELECT COUNT(*) FROM transactions);
  RAISE NOTICE 'Toplam not: %', (SELECT COUNT(*) FROM notes);
  RAISE NOTICE 'Toplam duyuru: %', (SELECT COUNT(*) FROM portfolio_announcements);
  RAISE NOTICE 'Toplam aktivite: %', (SELECT COUNT(*) FROM portfolio_activities);
  RAISE NOTICE 'Toplam feedback: %', (SELECT COUNT(*) FROM feedback);
  RAISE NOTICE '══════════════════════════════════════════════════════';
END $$;

-- Kalan portföyleri listele
SELECT 
  p.name as portfoy_adi,
  p.is_public as public_mi,
  COUNT(DISTINCT h.id) as holding,
  COUNT(DISTINCT t.id) as islem,
  COUNT(DISTINCT n.id) as not_sayisi,
  COUNT(DISTINCT pa.id) as duyuru,
  p.created_at as olusturulma
FROM portfolios p
LEFT JOIN holdings h ON h.portfolio_id = p.id
LEFT JOIN transactions t ON t.portfolio_id = p.id
LEFT JOIN notes n ON n.portfolio_id = p.id
LEFT JOIN portfolio_announcements pa ON pa.portfolio_id = p.id
WHERE p.user_id = (SELECT id FROM auth.users WHERE email = 'saitarslan7@gmail.com')
GROUP BY p.id, p.name, p.is_public, p.created_at
ORDER BY p.created_at;
