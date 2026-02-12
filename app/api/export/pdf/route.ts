import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface PriceInfo {
  symbol: string
  name: string
  price: number
  currency: string
  timestamp: string
  cached: boolean
}

interface HoldingRow {
  id: string
  portfolio_id: string
  user_id: string
  symbol: string
  asset_type: string
  quantity: number
  avg_price: number
  note: string | null
  created_at: string
  updated_at: string
  portfolios: { name: string } | null
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const portfolioId = searchParams.get('portfolio_id')

    if (!userId) {
      return NextResponse.json({ error: 'user_id parametresi gerekli' }, { status: 400 })
    }

    const supabase = await createClient()

    // Kullanıcı doğrulama
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    // Holdings çek
    const holdingsQuery = portfolioId
      ? supabase.from('holdings').select('*, portfolios:portfolio_id(name)').eq('user_id', userId).eq('portfolio_id', portfolioId).order('created_at', { ascending: true })
      : supabase.from('holdings').select('*, portfolios:portfolio_id(name)').eq('user_id', userId).order('created_at', { ascending: true })

    const { data: holdingsRaw, error: holdingsErr } = await holdingsQuery
    const holdings = (holdingsRaw || []) as unknown as HoldingRow[]
    if (holdingsErr) throw holdingsErr

    if (!holdings || holdings.length === 0) {
      return NextResponse.json({ error: 'Portföyde varlık bulunamadı' }, { status: 404 })
    }

    // Fiyatları batch olarak çek
    // Internal batch price fetch via Supabase price_cache + external APIs
    const symbols = holdings.map((h: HoldingRow) => h.symbol)
    let cachedPrices: Array<{
      symbol: string
      asset_type: string
      price: string
      currency: string
      name: string
      updated_at: string
    }> = []

    try {
      const { data, error } = await supabase
        .from('price_cache')
        .select('*')
        .in('symbol', symbols)
        .gt('expires_at', new Date().toISOString())

      if (!error && data) {
        cachedPrices = data
      }
    } catch (cacheErr) {
      console.warn('Cache check skipped:', cacheErr)
    }

    const priceMap: Record<string, PriceInfo> = {}
    const cachedKeys = new Set<string>()

    if (cachedPrices) {
      cachedPrices.forEach(cached => {
        const key = `${cached.symbol}_${cached.asset_type}`
        priceMap[cached.symbol] = {
          symbol: cached.symbol,
          name: cached.name,
          price: parseFloat(cached.price),
          currency: cached.currency,
          timestamp: cached.updated_at,
          cached: true,
        }
        cachedKeys.add(key)
      })
    }

    // Eksik fiyatları dış API'lerden çek
    const missingHoldings = holdings.filter((h: HoldingRow) => {
      const key = `${h.symbol}_${h.asset_type}`
      return !cachedKeys.has(key)
    })

    const fetchPromises = missingHoldings.map(async (holding: HoldingRow) => {
      try {
        let price: number | null = null
        let currency = 'USD'
        let name = holding.symbol

        if (holding.asset_type === 'CASH') {
          currency = 'TRY'
          if (holding.symbol === 'TRY') {
            price = 1; name = 'Türk Lirası'
          } else if (holding.symbol === 'USD') {
            try {
              const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/USDTRY=X')
              if (response.ok) {
                const data = await response.json()
                const result = data.chart?.result?.[0]
                if (result) { price = result.meta.regularMarketPrice || result.meta.previousClose; name = 'Amerikan Doları' }
              }
            } catch {}
          } else if (holding.symbol === 'EUR') {
            try {
              const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/EURTRY=X')
              if (response.ok) {
                const data = await response.json()
                const result = data.chart?.result?.[0]
                if (result) { price = result.meta.regularMarketPrice || result.meta.previousClose; name = 'Euro' }
              }
            } catch {}
          } else if (holding.symbol === 'GOLD') {
            try {
              const goldResponse = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F')
              if (goldResponse.ok) {
                const goldData = await goldResponse.json()
                const goldResult = goldData.chart?.result?.[0]
                if (goldResult) {
                  const goldOzUSD = goldResult.meta.regularMarketPrice || goldResult.meta.previousClose
                  const usdTryResponse = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/USDTRY=X')
                  if (usdTryResponse.ok) {
                    const usdTryData = await usdTryResponse.json()
                    const usdTryResult = usdTryData.chart?.result?.[0]
                    if (usdTryResult) {
                      const usdtry = usdTryResult.meta.regularMarketPrice || usdTryResult.meta.previousClose
                      price = (goldOzUSD * usdtry) / 31.1035; name = 'Gram Altın'
                    }
                  }
                }
              }
            } catch {}
          } else if (holding.symbol === 'SILVER') {
            try {
              const silverResponse = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/SI=F')
              if (silverResponse.ok) {
                const silverData = await silverResponse.json()
                const silverResult = silverData.chart?.result?.[0]
                if (silverResult) {
                  const silverOzUSD = silverResult.meta.regularMarketPrice || silverResult.meta.previousClose
                  const usdTryResponse = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/USDTRY=X')
                  if (usdTryResponse.ok) {
                    const usdTryData = await usdTryResponse.json()
                    const usdTryResult = usdTryData.chart?.result?.[0]
                    if (usdTryResult) {
                      const usdtry = usdTryResult.meta.regularMarketPrice || usdTryResult.meta.previousClose
                      price = (silverOzUSD * usdtry) / 31.1035; name = 'Gram Gümüş'
                    }
                  }
                }
              }
            } catch {}
          }
        } else if (holding.asset_type === 'CRYPTO') {
          try {
            const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(holding.symbol)}`)
            if (response.ok) { const data = await response.json(); price = parseFloat(data.price) }
          } catch {}
          if (!price) {
            const base = holding.symbol.replace(/(USDT|BUSD|USDC|USD)$/i, '')
            try {
              const yres = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(base + '-USD')}`)
              if (yres.ok) {
                const ydata = await yres.json()
                const result = ydata.chart?.result?.[0]
                if (result) { price = result.meta.regularMarketPrice || result.meta.previousClose; name = result.meta.symbol || holding.symbol }
              }
            } catch {}
          }
        } else if (holding.asset_type === 'TR_STOCK' || holding.asset_type === 'US_STOCK') {
          const yahooSymbol = holding.asset_type === 'TR_STOCK'
            ? (holding.symbol.endsWith('.IS') ? holding.symbol : `${holding.symbol}.IS`)
            : holding.symbol
          try {
            const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`)
            if (response.ok) {
              const data = await response.json()
              const result = data.chart?.result?.[0]
              if (result) {
                price = result.meta.regularMarketPrice || result.meta.previousClose
                if (result.meta.currency === 'TRY') currency = 'TRY'
                name = result.meta.symbol || holding.symbol
              }
            }
          } catch {}
        }

        if (price) {
          priceMap[holding.symbol] = {
            symbol: holding.symbol,
            name,
            price,
            currency,
            timestamp: new Date().toISOString(),
            cached: false,
          }
        }
      } catch (error) {
        console.error(`PDF export price fetch error for ${holding.symbol}:`, error)
      }
    })

    await Promise.allSettled(fetchPromises)

    // USD/TRY kuru
    let usdTryRate = 0
    if (priceMap['USD']) {
      usdTryRate = priceMap['USD'].price
    } else {
      try {
        const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/USDTRY=X')
        if (response.ok) {
          const data = await response.json()
          const result = data.chart?.result?.[0]
          if (result) { usdTryRate = result.meta.regularMarketPrice || result.meta.previousClose }
        }
      } catch {}
    }

    // Hesaplamalar
    let totalTry = 0, totalUsd = 0, totalCostTry = 0, totalCostUsd = 0

    const holdingsData = holdings.map((h: HoldingRow) => {
      const pd = priceMap[h.symbol]
      const portfolio = h.portfolios as { name: string } | null
      const currentPrice = pd?.price || 0
      const currency = pd?.currency || 'USD'
      const currencySymbol = currency === 'TRY' ? '₺' : '$'
      const costBasis = h.quantity * h.avg_price
      const currentTotal = h.quantity * currentPrice
      let profitLoss = 0
      let profitLossPercent = 0
      let valTry = 0, costTry = 0

      if (pd) {
        if (currency === 'TRY') {
          valTry = currentTotal; costTry = costBasis
          totalTry += currentTotal; totalUsd += usdTryRate > 0 ? currentTotal / usdTryRate : 0
          totalCostTry += costBasis; totalCostUsd += usdTryRate > 0 ? costBasis / usdTryRate : 0
        } else if (currency === 'USD') {
          valTry = currentTotal * usdTryRate; costTry = costBasis * usdTryRate
          totalTry += valTry; totalUsd += currentTotal
          totalCostTry += costTry; totalCostUsd += costBasis
        }
        profitLoss = valTry - costTry
        profitLossPercent = costTry > 0 ? (profitLoss / costTry) * 100 : 0
      }

      return {
        portfolioName: portfolio?.name || '-',
        symbol: h.symbol,
        assetType: h.asset_type,
        quantity: h.quantity,
        avgPrice: h.avg_price,
        currentPrice,
        currency,
        currencySymbol,
        costBasis,
        currentTotal,
        profitLoss,
        profitLossPercent,
        valueTry: valTry,
        costTry,
        createdAt: h.created_at ? new Date(h.created_at).toLocaleDateString('tr-TR') : '',
      }
    })

    const totalPL = totalTry - totalCostTry
    const totalPLPercent = totalCostTry > 0 ? (totalPL / totalCostTry) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        holdings: holdingsData,
        summary: {
          totalTry,
          totalUsd,
          totalCostTry,
          totalCostUsd,
          totalPL,
          totalPLPercent,
          holdingCount: holdings.length,
        },
        usdTryRate,
      },
    })
  } catch (error: unknown) {
    console.error('PDF export data error:', error)
    const message = error instanceof Error ? error.message : 'Bir hata oluştu'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
