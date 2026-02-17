// Supabase Veritabanı Tipleri
// Bu tipler SQL migration'a göre tanımlanmıştır

export type AssetType = 'TR_STOCK' | 'US_STOCK' | 'CRYPTO' | 'CASH'
export type TransactionSide = 'BUY' | 'SELL'
export type NoteScope = 'POSITION' | 'WEEKLY' | 'GENERAL'
export type ActivityType = 'NEW_TRADE' | 'HOLDING_CLOSED' | 'PORTFOLIO_UPDATED'

export interface UsersPublic {
  id: string // uuid (auth.uid ile aynı)
  display_name: string | null
  base_currency: string // default 'TRY'
  avatar_url: string | null
  bio: string | null
  is_profile_public: boolean
  created_at: string
}

export interface Portfolio {
  id: string
  user_id: string
  name: string
  is_public: boolean
  slug: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface Holding {
  id: string
  portfolio_id: string
  user_id: string
  symbol: string // "ASELS.IS", "AAPL", "BTCUSDT"
  asset_type: AssetType
  quantity: number
  avg_price: number // TRY bazında
  note: string | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  portfolio_id: string
  user_id: string
  symbol: string
  asset_type: AssetType
  side: TransactionSide
  quantity: number
  price: number
  fee: number | null
  date: string
  note: string | null
  created_at: string
}

export interface PriceHistory {
  id: string
  symbol: string
  date: string
  close: number
  currency: string // "TRY" veya "USD"
}

export interface Note {
  id: string
  portfolio_id: string
  user_id: string
  scope: NoteScope
  symbol: string | null
  content: string
  created_at: string
  updated_at: string
}


export interface PortfolioFollow {
  id: string
  follower_id: string
  portfolio_id: string
  last_seen_at: string | null
  created_at: string
}

export interface PortfolioActivity {
  id: string
  portfolio_id: string
  actor_id: string
  type: ActivityType
  title: string
  metadata: Record<string, unknown>
  created_at: string
}

// Hesaplama sonuçları için yardımcı tipler
export interface PortfolioValue {
  total: number
  cash: number
  investments: number
  daily_change: number
  daily_change_percent: number
  weekly_change_percent: number
  monthly_change_percent: number
}

export interface AssetPerformance {
  symbol: string
  asset_type: AssetType
  current_value: number
  cost_basis: number
  profit_loss: number
  profit_loss_percent: number
  quantity: number
  avg_price: number
  current_price: number
}

export interface PortfolioDistribution {
  asset_type: AssetType
  value: number
  percentage: number
  count: number
}

export interface PortfolioScore {
  total: number // 0-100
  return_score: number // 0-40
  diversification_score: number // 0-30
  volatility_score: number // 0-30
}

