-- =====================================================
-- YASAL UYUMLULUK SİSTEMİ (SPK + KVKK)
-- =====================================================
-- Kullanıcı onayları, çerez tercihleri ve KVKK uyumluluğu
-- =====================================================

-- 1. Kullanıcı Onayları Tablosu
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- SPK Onayları
  spk_disclaimer_accepted BOOLEAN DEFAULT false NOT NULL,
  spk_disclaimer_accepted_at TIMESTAMPTZ,
  spk_risk_disclosure_accepted BOOLEAN DEFAULT false NOT NULL,
  spk_risk_disclosure_accepted_at TIMESTAMPTZ,
  
  -- KVKK Onayları
  kvkk_accepted BOOLEAN DEFAULT false NOT NULL,
  kvkk_accepted_at TIMESTAMPTZ,
  
  -- Kullanım Şartları
  terms_accepted BOOLEAN DEFAULT false NOT NULL,
  terms_accepted_at TIMESTAMPTZ,
  
  -- Çerez Onayları (JSONB: necessary, analytics, marketing)
  cookie_consent JSONB DEFAULT '{"necessary": true, "analytics": false, "marketing": false}'::jsonb,
  cookie_consent_at TIMESTAMPTZ,
  
  -- Yasal Kayıt Bilgileri
  ip_address TEXT,
  user_agent TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Her kullanıcı için tek bir kayıt
  UNIQUE(user_id)
);

-- 2. RLS Politikaları
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi kayıtlarını görebilir
CREATE POLICY "Users can view own consents"
  ON user_consents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Kullanıcılar kendi kayıtlarını oluşturabilir
CREATE POLICY "Users can insert own consents"
  ON user_consents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi kayıtlarını güncelleyebilir
CREATE POLICY "Users can update own consents"
  ON user_consents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin'ler tüm kayıtları görebilir (RBAC için)
CREATE POLICY "Admins can view all consents"
  ON user_consents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'super_admin'
    )
  );

-- 3. İndeksler
CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX idx_user_consents_all_accepted ON user_consents(user_id) 
  WHERE spk_disclaimer_accepted = true 
  AND spk_risk_disclosure_accepted = true 
  AND kvkk_accepted = true 
  AND terms_accepted = true;

-- 4. Updated_at Trigger
CREATE OR REPLACE FUNCTION update_user_consents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_consents_updated_at
  BEFORE UPDATE ON user_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_user_consents_updated_at();

-- 5. Yardımcı Fonksiyon: Tüm onaylar alındı mı?
CREATE OR REPLACE FUNCTION check_all_consents_given(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_consents
    WHERE user_id = p_user_id
    AND spk_disclaimer_accepted = true
    AND spk_risk_disclosure_accepted = true
    AND kvkk_accepted = true
    AND terms_accepted = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Audit Log için ekleme (varsa)
COMMENT ON TABLE user_consents IS 'Kullanıcı yasal onayları (SPK, KVKK, Terms, Cookies)';
COMMENT ON COLUMN user_consents.spk_disclaimer_accepted IS 'SPK yatırım tavsiyesi reddi onayı';
COMMENT ON COLUMN user_consents.spk_risk_disclosure_accepted IS 'SPK risk bildirimi onayı';
COMMENT ON COLUMN user_consents.kvkk_accepted IS 'KVKK aydınlatma metni onayı';
COMMENT ON COLUMN user_consents.terms_accepted IS 'Kullanım şartları onayı';
COMMENT ON COLUMN user_consents.cookie_consent IS 'Çerez tercihleri (necessary, analytics, marketing)';
COMMENT ON COLUMN user_consents.ip_address IS 'Onay sırasındaki IP adresi (yasal kayıt)';
COMMENT ON COLUMN user_consents.user_agent IS 'Onay sırasındaki user agent (yasal kayıt)';
