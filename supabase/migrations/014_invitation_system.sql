-- =====================================================
-- 014 — DAVET SİSTEMİ (ADMIN-ONLY)
-- =====================================================
-- Bu migration aşağıdaki tabloları oluşturur:
--   1. invitations     (admin tarafından oluşturulan davet linkleri)
--   2. invitation_uses (hangi kullanıcılar hangi davetle kaydoldu)
-- =====================================================

-- =====================================================
-- 1. INVITATIONS TABLOSU
-- =====================================================

CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(32) UNIQUE NOT NULL, -- benzersiz davet kodu (URL parametresi)
  label TEXT, -- admin için açıklama/etiket (örn: "Instagram - Ahmet", "Beta Testers")
  max_uses INTEGER, -- null = sınırsız, sayı = sınırlı kullanım
  current_uses INTEGER DEFAULT 0 NOT NULL, -- şu ana kadar kaç kez kullanıldı
  expires_at TIMESTAMPTZ, -- null = süresiz, tarih = son kullanma tarihi
  is_active BOOLEAN DEFAULT TRUE NOT NULL, -- admin daveti iptal edebilir
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT invitations_code_format CHECK (length(code) >= 8),
  CONSTRAINT invitations_max_uses_positive CHECK (max_uses IS NULL OR max_uses > 0),
  CONSTRAINT invitations_current_uses_nonnegative CHECK (current_uses >= 0)
);

COMMENT ON TABLE invitations IS 'Admin tarafından oluşturulan davet linkleri. Kayıt için zorunlu.';
COMMENT ON COLUMN invitations.code IS 'URL parametresi olarak kullanılan benzersiz kod (örn: ?invite=ABC123XYZ)';
COMMENT ON COLUMN invitations.label IS 'Admin için açıklama/etiket. Hangi kanal/kişi için oluşturuldu.';
COMMENT ON COLUMN invitations.max_uses IS 'null = sınırsız kullanım, sayı = maksimum kaç kişi kullanabilir';
COMMENT ON COLUMN invitations.current_uses IS 'Şu ana kadar kaç kullanıcı bu davetle kayıt oldu (cache)';
COMMENT ON COLUMN invitations.is_active IS 'false yapılırsa davet artık kullanılamaz (soft delete)';

-- =====================================================
-- 2. INVITATION_USES TABLOSU
-- =====================================================

CREATE TABLE IF NOT EXISTS invitation_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT invitation_uses_unique_user UNIQUE(user_id)
);

COMMENT ON TABLE invitation_uses IS 'Hangi kullanıcı hangi davet koduyla kayıt oldu. Bir kullanıcı sadece bir davetle kayıt olabilir.';

-- =====================================================
-- 3. İNDEXLER
-- =====================================================

-- Davet kodu ile hızlı arama (validation için)
CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(code) WHERE is_active = true;

-- Kim tarafından oluşturuldu
CREATE INDEX IF NOT EXISTS idx_invitations_created_by ON invitations(created_by);

-- Aktif davetleri listeleme
CREATE INDEX IF NOT EXISTS idx_invitations_active ON invitations(is_active, created_at DESC);

-- Davet bazında kullanıcıları görme
CREATE INDEX IF NOT EXISTS idx_invitation_uses_invitation ON invitation_uses(invitation_id, used_at DESC);

-- Kullanıcının hangi davetle geldiğini bulma
CREATE INDEX IF NOT EXISTS idx_invitation_uses_user ON invitation_uses(user_id);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_uses ENABLE ROW LEVEL SECURITY;

-- Invitations: Sadece service_role erişebilir (admin paneli API üzerinden)
-- Public kullanıcılar davet kodunu validate etmek için API kullanacak

-- Invitation Uses: Sadece service_role erişebilir
-- Kullanıcılar kendi davet bilgilerini görmeyecek

-- =====================================================
-- 5. FONKSIYON: Davet Kodu Oluşturma
-- =====================================================

CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- karışabilecek karakterler hariç (0,O,1,I)
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_invitation_code IS 'Okunabilir, benzersiz 12 karakterli davet kodu oluşturur';

-- =====================================================
-- 6. TRIGGER: updated_at otomatik güncelleme
-- =====================================================

CREATE OR REPLACE FUNCTION update_invitation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_invitation_updated_at();

-- =====================================================
-- MİGRATION TAMAMLANDI — 014_invitation_system
-- =====================================================
