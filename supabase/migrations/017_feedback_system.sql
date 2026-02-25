-- Feedback System Migration
-- Beta testi için kullanıcı geri bildirim sistemi

-- Feedback tipi enum
CREATE TYPE feedback_type AS ENUM ('bug', 'feature_request', 'improvement', 'other');

-- Feedback durumu enum
CREATE TYPE feedback_status AS ENUM ('new', 'in_review', 'planned', 'in_progress', 'resolved', 'wont_fix');

-- Feedback önceliği enum
CREATE TYPE feedback_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Feedback tablosu
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type feedback_type NOT NULL DEFAULT 'other',
  category TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  priority feedback_priority NOT NULL DEFAULT 'medium',
  status feedback_status NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  page_url TEXT,
  user_agent TEXT,
  user_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index'ler
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_type ON feedback(type);
CREATE INDEX idx_feedback_priority ON feedback(priority);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);

-- Updated_at trigger
CREATE TRIGGER set_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Politikaları
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi feedback'lerini okuyabilir
CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Herkes feedback oluşturabilir (anonim bile)
CREATE POLICY "Anyone can create feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

-- Kullanıcılar kendi feedback'lerini güncelleyebilir (sadece belirli alanlar)
CREATE POLICY "Users can update own feedback title and description"
  ON feedback FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin view için policy (service_role kullanacağız ama yine de ekleyelim)
CREATE POLICY "Service role can do everything on feedback"
  ON feedback
  USING (true)
  WITH CHECK (true);

-- Stats view (admin dashboard için)
CREATE OR REPLACE VIEW feedback_stats AS
SELECT
  COUNT(*) FILTER (WHERE status IN ('new', 'in_review')) as unresolved_count,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7_days_count,
  COUNT(*) FILTER (WHERE priority = 'critical' AND status IN ('new', 'in_review')) as critical_count,
  COUNT(*) as total_count,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users
FROM feedback;

-- Realtime için publication
ALTER PUBLICATION supabase_realtime ADD TABLE feedback;

COMMENT ON TABLE feedback IS 'Beta kullanıcılarından gelen geri bildirimler';
COMMENT ON COLUMN feedback.user_id IS 'Kullanıcı ID (anonim için NULL olabilir)';
COMMENT ON COLUMN feedback.user_email IS 'Anonim kullanıcılar için e-posta';
COMMENT ON COLUMN feedback.page_url IS 'Geri bildirimin gönderildiği sayfa URL';
COMMENT ON COLUMN feedback.user_agent IS 'Browser bilgisi (debug için)';
