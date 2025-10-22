-- Cache'deki eski yuvarlanmış fiyatları temizle
-- Yeni tam hassasiyetli fiyatlar tekrar çekilecek

DELETE FROM price_cache;

-- Yorum ekle
COMMENT ON TABLE price_cache IS 'Fiyat cache tablosu - Tam hassasiyetle (DECIMAL 20,8) saklanır. Formatlamalar frontend tarafında yapılır.';
