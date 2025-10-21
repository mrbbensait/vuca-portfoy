import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Mock fiyat verisi oluşturma
function generatePriceHistory(symbol: string, basePrice: number, currency: string, days: number = 60) {
  const prices = []
  const today = new Date()
  let currentPrice = basePrice

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Rastgele %±3 değişim
    const change = (Math.random() - 0.5) * 0.06
    currentPrice = currentPrice * (1 + change)
    
    prices.push({
      symbol,
      date: date.toISOString().split('T')[0],
      close: parseFloat(currentPrice.toFixed(2)),
      currency,
    })
  }

  return prices
}

export async function POST(request: Request) {
  try {
    const { userId, portfolioId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId gerekli' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Portföy oluştur veya mevcut olanı kullan
    let portfolio
    if (portfolioId) {
      const { data } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', portfolioId)
        .single()
      portfolio = data
    }

    if (!portfolio) {
      const { data, error } = await supabase
        .from('portfolios')
        .insert({
          user_id: userId,
          name: 'Varsayılan Portföy',
        })
        .select()
        .single()

      if (error) throw error
      portfolio = data
    }

    // 2. Örnek holdings ekle
    const sampleHoldings = [
      { symbol: 'ASELS.IS', asset_type: 'TR_STOCK', quantity: 100, avg_price: 85.50 },
      { symbol: 'THYAO.IS', asset_type: 'TR_STOCK', quantity: 500, avg_price: 320.75 },
      { symbol: 'AAPL', asset_type: 'US_STOCK', quantity: 10, avg_price: 2800 }, // ~$175 * 16 TRY
      { symbol: 'NVDA', asset_type: 'US_STOCK', quantity: 5, avg_price: 4200 }, // ~$270 * 15.5 TRY
      { symbol: 'BTCUSDT', asset_type: 'CRYPTO', quantity: 0.05, avg_price: 2900000 }, // ~$84k * 34.5
      { symbol: 'ETHUSDT', asset_type: 'CRYPTO', quantity: 0.5, avg_price: 110000 }, // ~$3.2k * 34.5
      { symbol: 'TRY', asset_type: 'CASH', quantity: 50000, avg_price: 1 },
    ]

    const { error: holdingsError } = await supabase
      .from('holdings')
      .insert(
        sampleHoldings.map(h => ({
          ...h,
          portfolio_id: portfolio.id,
          user_id: userId,
          note: null,
        }))
      )

    if (holdingsError) throw holdingsError

    // 3. Örnek transactions ekle
    const sampleTransactions = [
      { symbol: 'ASELS.IS', asset_type: 'TR_STOCK', side: 'BUY', quantity: 100, price: 85.50, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { symbol: 'THYAO.IS', asset_type: 'TR_STOCK', side: 'BUY', quantity: 500, price: 320.75, date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
      { symbol: 'AAPL', asset_type: 'US_STOCK', side: 'BUY', quantity: 10, price: 2800, date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
      { symbol: 'NVDA', asset_type: 'US_STOCK', side: 'BUY', quantity: 5, price: 4200, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
      { symbol: 'BTCUSDT', asset_type: 'CRYPTO', side: 'BUY', quantity: 0.05, price: 2900000, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { symbol: 'ETHUSDT', asset_type: 'CRYPTO', side: 'BUY', quantity: 0.5, price: 110000, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    ]

    const { error: transactionsError } = await supabase
      .from('transactions')
      .insert(
        sampleTransactions.map(t => ({
          ...t,
          portfolio_id: portfolio.id,
          user_id: userId,
          date: t.date.toISOString(),
          fee: 0,
          note: null,
        }))
      )

    if (transactionsError) throw transactionsError

    // 4. Price history ekle (60 günlük)
    const priceHistoryData = [
      ...generatePriceHistory('ASELS.IS', 82, 'TRY', 60),
      ...generatePriceHistory('THYAO.IS', 310, 'TRY', 60),
      ...generatePriceHistory('AAPL', 170, 'USD', 60),
      ...generatePriceHistory('NVDA', 265, 'USD', 60),
      ...generatePriceHistory('BTCUSDT', 82000, 'USD', 60),
      ...generatePriceHistory('ETHUSDT', 3100, 'USD', 60),
    ]

    // Price history'yi batch olarak ekle
    const { error: priceError } = await supabase
      .from('price_history')
      .upsert(priceHistoryData, { onConflict: 'symbol,date' })

    if (priceError) throw priceError

    // 5. Örnek notlar ekle
    const sampleNotes = [
      {
        portfolio_id: portfolio.id,
        user_id: userId,
        scope: 'POSITION',
        symbol: 'ASELS.IS',
        content: 'Savunma sektöründe güçlü pozisyon. Devlet siparişleri artıyor.',
      },
      {
        portfolio_id: portfolio.id,
        user_id: userId,
        scope: 'WEEKLY',
        symbol: null,
        content: 'Bu hafta teknoloji hisseleri güçlü performans gösterdi.',
      },
      {
        portfolio_id: portfolio.id,
        user_id: userId,
        scope: 'GENERAL',
        symbol: null,
        content: 'Portföyde çeşitlendirme oranını artırmayı düşünüyorum.',
      },
    ]

    const { error: notesError } = await supabase
      .from('notes')
      .insert(sampleNotes)

    if (notesError) throw notesError

    // 6. Örnek alert ekle
    const sampleAlerts = [
      {
        portfolio_id: portfolio.id,
        user_id: userId,
        type: 'TARGET_PRICE',
        payload: { symbol: 'ASELS.IS', target: 95 },
        is_active: true,
      },
      {
        portfolio_id: portfolio.id,
        user_id: userId,
        type: 'PORTFOLIO_CHANGE',
        payload: { threshold: 5 },
        is_active: true,
      },
    ]

    const { error: alertsError } = await supabase
      .from('alerts')
      .insert(sampleAlerts)

    if (alertsError) throw alertsError

    return NextResponse.json({ 
      success: true, 
      message: 'Örnek veriler başarıyla yüklendi',
      portfolio_id: portfolio.id 
    })

  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ 
      error: error.message || 'Seed işlemi başarısız' 
    }, { status: 500 })
  }
}
