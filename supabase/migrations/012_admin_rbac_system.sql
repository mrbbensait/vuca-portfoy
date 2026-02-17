-- =====================================================
-- 012 — ADMIN RBAC SİSTEMİ
-- =====================================================
-- Bu migration aşağıdaki tabloları oluşturur:
--   1. roles           (rol tanımları + JSONB permissions)
--   2. user_roles      (kullanıcı-rol ilişkisi)
--   3. admin_audit_log (admin aksiyonlarının kaydı)
-- Seed: super_admin rolü (is_system = true, silinemez)
-- =====================================================

-- =====================================================
-- 1. ROLES TABLOSU
-- =====================================================

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}' NOT NULL,
  is_system BOOLEAN DEFAULT FALSE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT roles_name_unique UNIQUE(name),
  CONSTRAINT roles_slug_unique UNIQUE(slug)
);

COMMENT ON TABLE roles IS 'Admin rol tanımları. Super admin silinemez (is_system=true).';
COMMENT ON COLUMN roles.permissions IS 'JSONB permission map. {"*": true} = tam yetki. {"users.read": true, ...} = granüler.';
COMMENT ON COLUMN roles.is_system IS 'true olan roller UI üzerinden silinemez veya düzenlenemez.';

-- =====================================================
-- 2. USER_ROLES TABLOSU
-- =====================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT user_roles_unique UNIQUE(user_id, role_id)
);

COMMENT ON TABLE user_roles IS 'Kullanıcı-rol ilişkisi. Bir kullanıcı birden fazla role sahip olabilir.';

-- =====================================================
-- 3. ADMIN_AUDIT_LOG TABLOSU
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE admin_audit_log IS 'Admin aksiyonlarının kronolojik kaydı. Kim, ne zaman, ne yaptı.';
COMMENT ON COLUMN admin_audit_log.action IS 'Aksiyon kodu: user_role_changed, user_banned, cache_cleared, vb.';
COMMENT ON COLUMN admin_audit_log.target_type IS 'Hedef tipi: user, portfolio, system, role';
COMMENT ON COLUMN admin_audit_log.target_id IS 'Hedef kaydın UUID si (varsa)';

-- =====================================================
-- 4. İNDEXLER
-- =====================================================

-- Roles
CREATE INDEX IF NOT EXISTS idx_roles_slug ON roles(slug);

-- User Roles: kullanıcının rollerini hızlı bulmak
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- User Roles: bir role sahip kullanıcıları bulmak
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- Audit Log: tarih bazlı sorgulama (en yeni üstte)
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at DESC);

-- Audit Log: admin bazlı filtreleme
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON admin_audit_log(admin_id);

-- Audit Log: hedef tipi bazlı filtreleme
CREATE INDEX IF NOT EXISTS idx_audit_log_target_type ON admin_audit_log(target_type);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Roles: Herkes okuyabilir (rol listesi gizli değil)
-- Yazma işlemleri sadece service_role ile yapılır (API route üzerinden)
CREATE POLICY "Authenticated users can view roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- User Roles: Kullanıcı kendi rollerini görebilir
-- Admin tüm user_roles'ları service_role ile okur
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Audit Log: Sadece service_role ile okunur/yazılır
-- Normal kullanıcılar audit log göremez
-- (Admin panelinde service_role client kullanılacak)

-- =====================================================
-- 6. SUPER_ADMIN ROL SEED
-- =====================================================

INSERT INTO roles (name, slug, description, permissions, is_system)
VALUES (
  'Super Admin',
  'super_admin',
  'Tüm yetkilere sahip sistem rolü. Silinemez ve düzenlenemez.',
  '{"*": true}',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- MİGRATION TAMAMLANDI — 012_admin_rbac_system
-- =====================================================
