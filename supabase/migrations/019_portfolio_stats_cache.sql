-- Portfolio stats cache table
-- Stores pre-computed P&L statistics for shared portfolio pages
CREATE TABLE IF NOT EXISTS portfolio_stats_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id uuid NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  stats_data jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(portfolio_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_portfolio_stats_cache_portfolio_id 
  ON portfolio_stats_cache(portfolio_id);

-- RLS
ALTER TABLE portfolio_stats_cache ENABLE ROW LEVEL SECURITY;

-- Portfolio owner can insert/update their own stats
CREATE POLICY "Owner can upsert own portfolio stats"
  ON portfolio_stats_cache
  FOR ALL
  USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

-- Anyone authenticated can read stats for public portfolios
CREATE POLICY "Authenticated users can read public portfolio stats"
  ON portfolio_stats_cache
  FOR SELECT
  USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE is_public = true
    )
  );
