-- =====================================================
-- REALTIME NOTIFICATIONS FIX
-- =====================================================
-- Bu migration portfolio_activities tablosunu Realtime için etkinleştirir
-- böylece kullanıcılar yeni aktiviteleri anında görebilir.

-- 1. Realtime için REPLICA IDENTITY ayarla
ALTER TABLE portfolio_activities REPLICA IDENTITY FULL;

-- 2. Realtime yayınını etkinleştir
ALTER PUBLICATION supabase_realtime ADD TABLE portfolio_activities;

-- =====================================================
-- NOT: Frontend'de artık Supabase Realtime subscription
-- kullanarak portfolio_activities tablosundaki INSERT
-- olaylarını dinleyebiliriz.
-- =====================================================
