-- Fix: Public portföyü olan kullanıcıların profil bilgisi (ad, avatar) herkes tarafından görünür olmalı
-- Sorun: users_public RLS policy sadece is_profile_public=true kontrolü yapıyordu
-- Bu yüzden public portföy sayfaları 404 veriyordu (join başarısız oluyordu)

DROP POLICY IF EXISTS "Users can view own or public profiles" ON users_public;

CREATE POLICY "Users can view accessible profiles" ON users_public
  FOR SELECT USING (
    (( SELECT auth.uid() AS uid) = id)
    OR (is_profile_public = true)
    OR (EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.user_id = users_public.id 
      AND portfolios.is_public = true
    ))
  );
