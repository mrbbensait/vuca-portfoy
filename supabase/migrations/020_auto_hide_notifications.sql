-- =====================================================
-- 020 — AUTO-HIDE INACTIVE PORTFOLIOS + USER NOTIFICATIONS
-- =====================================================

-- 1. portfolios tablosuna auto-hide sütunları ekle
ALTER TABLE portfolios
  ADD COLUMN IF NOT EXISTS auto_hidden_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auto_hidden_reason TEXT;

COMMENT ON COLUMN portfolios.auto_hidden_at IS '14 günlük inaktivite veya admin kararıyla gizlenme zamanı';
COMMENT ON COLUMN portfolios.auto_hidden_reason IS 'inactivity_14_days | admin_action';

-- 2. user_notifications tablosu
CREATE TABLE IF NOT EXISTS user_notifications (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL,
  title       TEXT        NOT NULL,
  message     TEXT        NOT NULL,
  metadata    JSONB       NOT NULL DEFAULT '{}'::jsonb,
  is_read     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_notifications IS 'Kullanıcıya gönderilen sistem bildirimleri';
COMMENT ON COLUMN user_notifications.type IS 'portfolio_auto_hidden | admin_portfolio_hidden';

-- 3. İndeksler
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_unread
  ON user_notifications(user_id, created_at DESC)
  WHERE is_read = FALSE;

-- 4. RLS
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON user_notifications;
CREATE POLICY "Users can view own notifications"
  ON user_notifications FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can mark own notifications read" ON user_notifications;
CREATE POLICY "Users can mark own notifications read"
  ON user_notifications FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Service role (cron/admin) için INSERT izni
-- Service role bypasses RLS by default, bu yeterli
