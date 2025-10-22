-- Kullanıcıların portföylerini kontrol et
SELECT 
  u.id as user_id,
  u.email,
  p.id as portfolio_id,
  p.name as portfolio_name,
  p.created_at
FROM auth.users u
LEFT JOIN portfolios p ON p.user_id = u.id
ORDER BY u.created_at DESC;

-- Eğer portföy yoksa, manuel olarak oluştur
-- (Aşağıdaki komutu kendi user_id'nizle değiştirin)
-- INSERT INTO portfolios (user_id, name)
-- VALUES ('YOUR_USER_ID_HERE', 'Varsayılan Portföy');
