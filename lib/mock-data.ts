// Mock veriler - Supabase olmadan çalışmak için
import { Holding, Transaction, Note, Alert, Portfolio, PriceHistory } from './types/database.types'

export const MOCK_USER_ID = 'demo-user-12345'

export const MOCK_PORTFOLIO: Portfolio = {
  id: 'portfolio-1',
  user_id: MOCK_USER_ID,
  name: 'Örnek Portföy',
  created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
}

export const MOCK_HOLDINGS: Holding[] = [
  {
    id: '1',
    portfolio_id: 'portfolio-1',
    user_id: MOCK_USER_ID,
    symbol: 'ASELS.IS',
    asset_type: 'TR_STOCK',
    quantity: 100,
    avg_price: 85.50,
    note: 'Savunma sektöründe güçlü pozisyon',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    portfolio_id: 'portfolio-1',
    user_id: MOCK_USER_ID,
    symbol: 'THYAO.IS',
    asset_type: 'TR_STOCK',
    quantity: 500,
    avg_price: 320.75,
    note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    portfolio_id: 'portfolio-1',
    user_id: MOCK_USER_ID,
    symbol: 'AAPL',
    asset_type: 'US_STOCK',
    quantity: 10,
    avg_price: 2800,
    note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    portfolio_id: 'portfolio-1',
    user_id: MOCK_USER_ID,
    symbol: 'NVDA',
    asset_type: 'US_STOCK',
    quantity: 5,
    avg_price: 4200,
    note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    portfolio_id: 'portfolio-1',
    user_id: MOCK_USER_ID,
    symbol: 'BTCUSDT',
    asset_type: 'CRYPTO',
    quantity: 0.05,
    avg_price: 2900000,
    note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    portfolio_id: 'portfolio-1',
    user_id: MOCK_USER_ID,
    symbol: 'ETHUSDT',
    asset_type: 'CRYPTO',
    quantity: 0.5,
    avg_price: 110000,
    note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    portfolio_id: 'portfolio-1',
    user_id: MOCK_USER_ID,
    symbol: 'TRY',
    asset_type: 'CASH',
    quantity: 50000,
    avg_price: 1,
    note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    portfolio_id: 'portfolio-1',
    user_id: MOCK_USER_ID,
    symbol: 'ASELS.IS',
    asset_type: 'TR_STOCK',
    side: 'BUY',
    quantity: 100,
    price: 85.50,
    fee: 0,
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    note: null,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    portfolio_id: 'portfolio-1',
    user_id: MOCK_USER_ID,
    symbol: 'THYAO.IS',
    asset_type: 'TR_STOCK',
    side: 'BUY',
    quantity: 500,
    price: 320.75,
    fee: 0,
    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    note: null,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    portfolio_id: 'portfolio-1',
    user_id: MOCK_USER_ID,
    symbol: 'AAPL',
    asset_type: 'US_STOCK',
    side: 'BUY',
    quantity: 10,
    price: 2800,
    fee: 0,
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    note: null,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    portfolio_id: 'portfolio-1',
    user_id: MOCK_USER_ID,
    symbol: 'NVDA',
    asset_type: 'US_STOCK',
    side: 'BUY',
    quantity: 5,
    price: 4200,
    fee: 0,
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    note: null,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    portfolio_id: 'portfolio-1',
    user_id: MOCK_USER_ID,
    symbol: 'BTCUSDT',
    asset_type: 'CRYPTO',
    side: 'BUY',
    quantity: 0.05,
    price: 2900000,
    fee: 0,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    note: null,
    created_at: new Date().toISOString(),
  },
]

function generatePriceHistory(symbol: string, basePrice: number, currency: string, days: number = 60): PriceHistory[] {
  const prices: PriceHistory[] = []
  const today = new Date()
  let currentPrice = basePrice

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    const change = (Math.random() - 0.5) * 0.06
    currentPrice = currentPrice * (1 + change)
    
    prices.push({
      id: `${symbol}-${date.toISOString().split('T')[0]}`,
      symbol,
      date: date.toISOString().split('T')[0],
      close: parseFloat(currentPrice.toFixed(2)),
      currency,
    })
  }

  return prices
}

export const MOCK_PRICE_HISTORY: PriceHistory[] = [
  ...generatePriceHistory('ASELS.IS', 82, 'TRY', 60),
  ...generatePriceHistory('THYAO.IS', 310, 'TRY', 60),
  ...generatePriceHistory('AAPL', 170, 'USD', 60),
  ...generatePriceHistory('NVDA', 265, 'USD', 60),
  ...generatePriceHistory('BTCUSDT', 82000, 'USD', 60),
  ...generatePriceHistory('ETHUSDT', 3100, 'USD', 60),
]

export const MOCK_NOTES: Note[] = [
  {
    id: '1',
    portfolio_id: 'portfolio-1',
    user_id: MOCK_USER_ID,
    scope: 'POSITION',
    symbol: 'ASELS.IS',
    content: 'Savunma sektöründe güçlü pozisyon. Devlet siparişleri artıyor.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    portfolio_id: 'portfolio-1',
    user_id: MOCK_USER_ID,
    scope: 'WEEKLY',
    symbol: null,
    content: 'Bu hafta teknoloji hisseleri güçlü performans gösterdi.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    portfolio_id: 'portfolio-1',
    user_id: MOCK_USER_ID,
    scope: 'GENERAL',
    symbol: null,
    content: 'Portföyde çeşitlendirme oranını artırmayı düşünüyorum.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    portfolio_id: 'portfolio-1',
    user_id: MOCK_USER_ID,
    type: 'TARGET_PRICE',
    payload: { symbol: 'ASELS.IS', target: 95 },
    is_active: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    portfolio_id: 'portfolio-1',
    user_id: MOCK_USER_ID,
    type: 'PORTFOLIO_CHANGE',
    payload: { threshold: 5 },
    is_active: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const MOCK_USER_PROFILE = {
  id: MOCK_USER_ID,
  display_name: 'Demo Kullanıcı',
  base_currency: 'TRY',
  created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
}

// Mock data getirme fonksiyonları
export async function getMockHoldings() {
  return { data: MOCK_HOLDINGS, error: null }
}

export async function getMockTransactions() {
  return { data: MOCK_TRANSACTIONS, error: null }
}

export async function getMockPriceHistory() {
  return { data: MOCK_PRICE_HISTORY, error: null }
}

export async function getMockNotes() {
  return { data: MOCK_NOTES, error: null }
}

export async function getMockAlerts() {
  return { data: MOCK_ALERTS, error: null }
}

export async function getMockPortfolio() {
  return { data: MOCK_PORTFOLIO, error: null }
}

export async function getMockUserProfile() {
  return { data: MOCK_USER_PROFILE, error: null }
}
