-- =====================================================
-- UNIQUE PORTFOLIO NAME PER USER
-- =====================================================
-- Aynı kullanıcı aynı isimle birden fazla portföy oluşturmasın

-- Önce mevcut duplicate kayıtları temizle (varsa)
-- Her kullanıcı için sadece en eski portföyü tut
DELETE FROM portfolios
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, name) id
  FROM portfolios
  ORDER BY user_id, name, created_at ASC
);

-- Şimdi UNIQUE constraint ekle
ALTER TABLE portfolios
ADD CONSTRAINT unique_user_portfolio_name UNIQUE (user_id, name);

-- İndex zaten var ama constraint için faydalı
CREATE INDEX IF NOT EXISTS idx_portfolios_user_name ON portfolios(user_id, name);

COMMENT ON CONSTRAINT unique_user_portfolio_name ON portfolios IS 
'Aynı kullanıcı aynı isimde birden fazla portföy oluşturamaz';
