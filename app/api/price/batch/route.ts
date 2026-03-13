import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 🚀 BATCH Price API
 * 
 * Birden fazla varlığın fiyatını TEK istekte getirir.
 * 
 * ÖZELLİKLER:
 * - ✅ N+1 sorunu önleme (10 varlık = 1 istek)
 * - ✅ Akıllı cache kullanımı
 * - ✅ Paralel dış API çağrıları
 * - ✅ Rate limiting
 * - ✅ Güvenlik
 * 
 * KULLANIM:
 * POST /api/price/batch
 * Body: { holdings: [{ symbol: 'AAPL', asset_type: 'US_STOCK' }, ...] }
 * 
 * RESPONSE:
 * { success: true, data: { 'AAPL': { price: 150.23, ... }, ... }, errors: [] }
 */
export async function POST(request: Request) {
  try {
    // 1. KİMLİK DOĞRULAMA
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Lütfen giriş yapın.' },
        { status: 401 }
      )
    }

    // 2. RATE LIMIT (Batch için daha yüksek limit) - Optional
    try {
      const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
        p_user_id: user.id,
        p_endpoint: '/api/price/batch',
        p_max_requests: 100, // Saatte 100 batch istek
        p_window_minutes: 60
      })

      if (!rateLimitError && !rateLimitOk) {
        return NextResponse.json(
          { error: 'Çok fazla istek. Lütfen bir süre bekleyin.' },
          { status: 429 }
        )
      }
    } catch (rateLimitErr) {
      // Migration yoksa rate limit skip et
      console.warn('Rate limit check skipped:', rateLimitErr)
    }

    // 3. REQUEST BODY KONTROLÜ
    const body = await request.json()
    const { holdings } = body

    if (!holdings || !Array.isArray(holdings) || holdings.length === 0) {
      return NextResponse.json(
        { error: 'holdings array gerekli' },
        { status: 400 }
      )
    }

    // 4. CACHE'DEN FİYATLARI ÇEK (Toplu sorgu) - Optional
    let cachedPrices: Array<{
      symbol: string
      asset_type: string
      price: string
      currency: string
      name: string
      updated_at: string
    }> = []
    try {
      const symbols = holdings.map(h => h.symbol)
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

    // Cache'deki fiyatları map'e çevir
    const priceMap: Record<string, {
      symbol: string
      name: string
      price: number
      currency: string
      timestamp: string
      cached: boolean
    }> = {}
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

    // 5. CACHE'DE OLMAYAN VE SÜRESİ DOLMUŞ FİYATLARI BUL
    const missingHoldings = holdings.filter(h => {
      const key = `${h.symbol}_${h.asset_type}`
      return !cachedKeys.has(key)
    })

    // 6. EKSİK FİYATLARI DIŞ API'LERDEN ÇEK (Paralel) - Direkt fetch yerine Supabase client kullan
    const fetchPromises = missingHoldings.map(async (holding) => {
      try {
        let price = null
        let currency = 'USD'
        let name = holding.symbol

        // Nakit ve Değerli Madenler için
        if (holding.asset_type === 'CASH') {
          currency = 'TRY' // CASH için TRY bazında göster
          
          if (holding.symbol === 'TRY') {
            // TRY referans değeri
            price = 1
            name = 'Türk Lirası'
          } else if (holding.symbol === 'USD') {
            // USD/TRY kuru
            try {
              const response = await fetch(
                'https://query1.finance.yahoo.com/v8/finance/chart/USDTRY=X'
              )
              if (response.ok) {
                const data = await response.json()
                const result = data.chart?.result?.[0]
                if (result) {
                  price = result.meta.regularMarketPrice || result.meta.previousClose
                  name = 'Amerikan Doları'
                }
              }
            } catch {}
          } else if (holding.symbol === 'EUR') {
            // EUR/TRY kuru
            try {
              const response = await fetch(
                'https://query1.finance.yahoo.com/v8/finance/chart/EURTRY=X'
              )
              if (response.ok) {
                const data = await response.json()
                const result = data.chart?.result?.[0]
                if (result) {
                  price = result.meta.regularMarketPrice || result.meta.previousClose
                  name = 'Euro'
                }
              }
            } catch {}
          } else if (holding.symbol === 'GOLD') {
            // Gram Altın - Ons altından gram'a çevirerek hesapla
            try {
              // 1. Ons Altın fiyatını al (USD)
              const goldResponse = await fetch(
                'https://query1.finance.yahoo.com/v8/finance/chart/GC=F'
              )
              if (goldResponse.ok) {
                const goldData = await goldResponse.json()
                const goldResult = goldData.chart?.result?.[0]
                if (goldResult) {
                  const goldOzUSD = goldResult.meta.regularMarketPrice || goldResult.meta.previousClose
                  
                  // 2. USD/TRY kurunu al
                  const usdTryResponse = await fetch(
                    'https://query1.finance.yahoo.com/v8/finance/chart/USDTRY=X'
                  )
                  if (usdTryResponse.ok) {
                    const usdTryData = await usdTryResponse.json()
                    const usdTryResult = usdTryData.chart?.result?.[0]
                    if (usdTryResult) {
                      const usdtry = usdTryResult.meta.regularMarketPrice || usdTryResult.meta.previousClose
                      // 1 oz = 31.1035 gram
                      const goldGramTRY = (goldOzUSD * usdtry) / 31.1035
                      price = goldGramTRY
                      name = 'Gram Altın'
                    }
                  }
                }
              }
            } catch {}
          } else if (holding.symbol === 'SILVER') {
            // Gram Gümüş - Ons gümüşten gram'a çevirerek hesapla
            try {
              // 1. Ons Gümüş fiyatını al (USD)
              const silverResponse = await fetch(
                'https://query1.finance.yahoo.com/v8/finance/chart/SI=F'
              )
              if (silverResponse.ok) {
                const silverData = await silverResponse.json()
                const silverResult = silverData.chart?.result?.[0]
                if (silverResult) {
                  const silverOzUSD = silverResult.meta.regularMarketPrice || silverResult.meta.previousClose
                  
                  // 2. USD/TRY kurunu al
                  const usdTryResponse = await fetch(
                    'https://query1.finance.yahoo.com/v8/finance/chart/USDTRY=X'
                  )
                  if (usdTryResponse.ok) {
                    const usdTryData = await usdTryResponse.json()
                    const usdTryResult = usdTryData.chart?.result?.[0]
                    if (usdTryResult) {
                      const usdtry = usdTryResult.meta.regularMarketPrice || usdTryResult.meta.previousClose
                      // 1 oz = 31.1035 gram
                      const silverGramTRY = (silverOzUSD * usdtry) / 31.1035
                      price = silverGramTRY
                      name = 'Gram Gümüş'
                    }
                  }
                }
              }
            } catch {}
          }
        }
        // Kripto için
        else if (holding.asset_type === 'CRYPTO') {
          try {
            const response = await fetch(
              `https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(holding.symbol)}`
            )
            if (response.ok) {
              const data = await response.json()
              price = parseFloat(data.price)
            }
          } catch {}

          // Binance başarısız olduysa Yahoo'ya git
          if (!price) {
            const base = holding.symbol.replace(/(USDT|BUSD|USDC|USD)$/i, '')
            const yahooSymbol = `${base}-USD`
            try {
              const yres = await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`
              )
              if (yres.ok) {
                const ydata = await yres.json()
                const result = ydata.chart?.result?.[0]
                if (result) {
                  price = result.meta.regularMarketPrice || result.meta.previousClose
                  name = result.meta.symbol || holding.symbol
                }
              }
            } catch {}
          }
        } 
        // Hisse için
        else if (holding.asset_type === 'TR_STOCK' || holding.asset_type === 'US_STOCK') {
          const yahooSymbol = holding.asset_type === 'TR_STOCK' 
            ? (holding.symbol.endsWith('.IS') ? holding.symbol : `${holding.symbol}.IS`)
            : holding.symbol

          try {
            const response = await fetch(
              `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`
            )
            if (response.ok) {
              const data = await response.json()
              const result = data.chart?.result?.[0]
              if (result) {
                const meta = result.meta
                price = meta.regularMarketPrice || meta.previousClose
                
                // TR hisse TRY olarak bırak
                if (meta.currency === 'TRY') {
                  currency = 'TRY'
                }
                name = meta.symbol || holding.symbol
              }
            }
          } catch {}
        }

        // Fiyat bulunduysa cache'e kaydet ve map'e ekle
        if (price) {
          const expiresAt = new Date()
          expiresAt.setMinutes(expiresAt.getMinutes() + 15)
          
          // Cache'e kaydet (service_role ile - RLS bypass)
          try {
            // Source'u asset type'a göre belirle
            let source = 'yahoo'
            if (holding.asset_type === 'CRYPTO') {
              source = 'binance/yahoo'
            } else if (holding.asset_type === 'CASH') {
              source = holding.symbol === 'TRY' ? 'static' : 'yahoo'
            }
            
            const adminClient = createAdminClient()
            const { error: cacheError } = await adminClient
              .from('price_cache')
              .upsert({
                symbol: holding.symbol,
                asset_type: holding.asset_type,
                price: price, // Tam hassasiyetle kaydet
                currency,
                name,
                source,
                updated_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString(),
              }, {
                onConflict: 'symbol,asset_type'
              })
            
            if (cacheError) {
              console.error(`❌ Cache save FAILED for ${holding.symbol}:`, cacheError)
            } else {
              const currencySymbol = currency === 'TRY' ? '₺' : currency === 'USD' ? '$' : currency
              console.log(`✅ Cache saved: ${holding.symbol} = ${currencySymbol}${price.toFixed(2)}`)
            }
          } catch (cacheErr) {
            console.error('❌ Cache save exception:', cacheErr)
          }

          priceMap[holding.symbol] = {
            symbol: holding.symbol,
            name,
            price: price, // Tam hassasiyetle döndür
            currency,
            timestamp: new Date().toISOString(),
            cached: false,
          }
        }
      } catch (error) {
        console.error(`Batch fetch error for ${holding.symbol}:`, error)
      }
    })

    // Tüm eksik fiyatları paralel olarak çek
    await Promise.allSettled(fetchPromises)

    // 7. SONUÇLARI DÖNÜŞ
    const errors: string[] = []
    holdings.forEach(h => {
      if (!priceMap[h.symbol]) {
        errors.push(`${h.symbol} için fiyat bulunamadı`)
      }
    })

    return NextResponse.json({
      success: true,
      data: priceMap,
      errors,
      stats: {
        total: holdings.length,
        cached: cachedKeys.size,
        fetched: missingHoldings.length,
        failed: errors.length,
      },
    })

  } catch (error: unknown) {
    console.error('Batch price error:', error)
    const message = error instanceof Error ? error.message : 'Bir hata oluştu'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
