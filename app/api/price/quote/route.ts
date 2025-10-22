import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { normalizeSymbol } from '@/lib/normalizeSymbol'
import { AssetType } from '@/lib/types/database.types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * ⚡ Optimize Edilmiş Fiyat API
 * 
 * ÖZELLİKLER:
 * - ✅ Kimlik doğrulama (authenticated users only)
 * - ✅ Rate limiting (200 req/saat/kullanıcı)
 * - ✅ Akıllı önbellekleme (15dk cache)
 * - ✅ Otomatik yenileme
 * - ✅ Hata yönetimi
 * 
 * CACHE STRATEJISI:
 * - İlk istek: Dış API'den çek, cache'e kaydet (15dk TTL)
 * - Sonraki istekler: Cache'den sun (15dk boyunca)
 * - Cache expire: Otomatik yenile
 */
export async function GET(request: Request) {
  try {
    // 1. KİMLİK DOĞRULAMA (GÜVENLİK)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Lütfen giriş yapın.' },
        { status: 401 }
      )
    }

    // 2. PARAMETRE KONTROLÜ VE NORMALİZASYON
    const { searchParams } = new URL(request.url)
    const rawSymbol = searchParams.get('symbol')
    const assetType = searchParams.get('asset_type') as AssetType

    if (!rawSymbol || !assetType) {
      return NextResponse.json(
        { error: 'Symbol ve asset_type gerekli' },
        { status: 400 }
      )
    }

    // ✨ Sembolü normalize et (tutarlılık için)
    let normalizedData
    try {
      normalizedData = normalizeSymbol(rawSymbol, assetType)
    } catch (normalizeErr) {
      return NextResponse.json(
        { error: normalizeErr instanceof Error ? normalizeErr.message : 'Geçersiz sembol' },
        { status: 400 }
      )
    }

    const symbol = normalizedData.normalized

    // 3. RATE LIMIT KONTROLÜ (SPAM ÖNLEME) - Optional (migration yoksa skip)
    try {
      const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
        p_user_id: user.id,
        p_endpoint: '/api/price/quote',
        p_max_requests: 200, // Saatte 200 istek (artırıldı)
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

    // 4. CACHE KONTROLÜ (PERFORMANS) - Optional
    try {
      const { data: cachedPrice, error: cacheError } = await supabase
        .from('price_cache')
        .select('*')
        .eq('symbol', symbol)
        .eq('asset_type', assetType)
        .gt('expires_at', new Date().toISOString())
        .single()

      // Cache'de varsa ve geçerliyse, direkt dön
      if (!cacheError && cachedPrice) {
        return NextResponse.json({
          success: true,
          data: {
            symbol: cachedPrice.symbol,
            name: cachedPrice.name,
            price: parseFloat(cachedPrice.price),
            currency: cachedPrice.currency,
            timestamp: cachedPrice.updated_at,
            cached: true,
          },
        })
      }
    } catch (cacheErr) {
      console.warn('Cache check skipped:', cacheErr)
    }

    let price = null
    let currency = 'USD' // Varsayılan USD
    let name = normalizedData.displayName // Display name kullan (BTC, ASELS, AAPL)

    try {
      if (assetType === 'CASH') {
        // 💰 Nakit ve Değerli Madenler için fiyat
        currency = 'TRY' // CASH için TRY bazında göster
        
        if (symbol === 'TRY') {
          // TRY referans değeri
          price = 1
          name = 'Türk Lirası'
        } else if (symbol === 'USD') {
          // USD/TRY kuru
          const response = await fetch(
            'https://query1.finance.yahoo.com/v8/finance/chart/USDTRY=X',
            { next: { revalidate: 300 } } // 5 dakika cache
          )
          if (response.ok) {
            const data = await response.json()
            const result = data.chart?.result?.[0]
            if (result) {
              price = result.meta.regularMarketPrice || result.meta.previousClose
              name = 'Amerikan Doları'
            }
          }
        } else if (symbol === 'EUR') {
          // EUR/TRY kuru
          const response = await fetch(
            'https://query1.finance.yahoo.com/v8/finance/chart/EURTRY=X',
            { next: { revalidate: 300 } }
          )
          if (response.ok) {
            const data = await response.json()
            const result = data.chart?.result?.[0]
            if (result) {
              price = result.meta.regularMarketPrice || result.meta.previousClose
              name = 'Euro'
            }
          }
        } else if (symbol === 'GOLD') {
          // Gram Altın - Ons altından gram'a çevirerek hesapla
          // 1. Ons Altın fiyatını al (USD)
          const goldResponse = await fetch(
            'https://query1.finance.yahoo.com/v8/finance/chart/GC=F',
            { next: { revalidate: 300 } }
          )
          if (goldResponse.ok) {
            const goldData = await goldResponse.json()
            const goldResult = goldData.chart?.result?.[0]
            if (goldResult) {
              const goldOzUSD = goldResult.meta.regularMarketPrice || goldResult.meta.previousClose
              
              // 2. USD/TRY kurunu al
              const usdTryResponse = await fetch(
                'https://query1.finance.yahoo.com/v8/finance/chart/USDTRY=X',
                { next: { revalidate: 300 } }
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
        } else if (symbol === 'SILVER') {
          // Gram Gümüş - Ons gümüşten gram'a çevirerek hesapla
          // 1. Ons Gümüş fiyatını al (USD)
          const silverResponse = await fetch(
            'https://query1.finance.yahoo.com/v8/finance/chart/SI=F',
            { next: { revalidate: 300 } }
          )
          if (silverResponse.ok) {
            const silverData = await silverResponse.json()
            const silverResult = silverData.chart?.result?.[0]
            if (silverResult) {
              const silverOzUSD = silverResult.meta.regularMarketPrice || silverResult.meta.previousClose
              
              // 2. USD/TRY kurunu al
              const usdTryResponse = await fetch(
                'https://query1.finance.yahoo.com/v8/finance/chart/USDTRY=X',
                { next: { revalidate: 300 } }
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
        }
      } else if (assetType === 'CRYPTO') {
        // ✨ Artık normalize edilmiş sembol kullanıyoruz (örn: BTCUSDT)
        let ok = false
        
        // 1. Önce Binance'den dene (USDT pair)
        try {
          const response = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(symbol)}`,
            { next: { revalidate: 60 } }
          )
          if (response.ok) {
            const data = await response.json()
            price = parseFloat(data.price)
            currency = 'USD'
            name = normalizedData.displayName // Base sembol göster (BTC, ETH)
            ok = true
          }
        } catch {}

        // 2. Binance başarısız olursa Yahoo Finance'e fallback
        if (!ok) {
          const yahooSymbol = `${normalizedData.base}-USD`
          const yres = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`,
            { next: { revalidate: 60 } }
          )
          if (yres.ok) {
            const ydata = await yres.json()
            const result = ydata.chart?.result?.[0]
            if (result) {
              const meta = result.meta
              price = meta.regularMarketPrice || meta.previousClose
              currency = 'USD'
              name = normalizedData.displayName // Base sembol göster
            }
          }
        }
      } else if (assetType === 'TR_STOCK' || assetType === 'US_STOCK') {
        // ✨ Yahoo Finance Query API kullan - normalize edilmiş sembol zaten doğru formatta
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`,
          { next: { revalidate: 60 } }
        )

        if (response.ok) {
          const data = await response.json()
          const result = data.chart?.result?.[0]
          
          if (result) {
            const meta = result.meta
            price = meta.regularMarketPrice || meta.previousClose
            
            // TR hisse için TRY olarak bırak
            if (meta.currency === 'TRY') {
              currency = 'TRY'
            } else {
              currency = 'USD'
            }
            
            name = normalizedData.displayName // Base sembol göster (ASELS, AAPL)
          }
        }
      }

      if (price) {
        // 5. CACHE'E KAYDET (15 dakika TTL)
        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + 15)
        
        const source = assetType === 'CRYPTO' ? 'binance/yahoo' : 'yahoo'
        
        // Upsert: Varsa güncelle, yoksa ekle (migration yoksa skip)
        try {
          await supabase
            .from('price_cache')
            .upsert({
              symbol,
              asset_type: assetType,
              price: price, // Tam hassasiyetle kaydet
              currency,
              name,
              source,
              updated_at: new Date().toISOString(),
              expires_at: expiresAt.toISOString(),
            }, {
              onConflict: 'symbol,asset_type'
            })
        } catch (upsertErr) {
          console.warn('Cache save skipped:', upsertErr)
        }
        
        return NextResponse.json({
          success: true,
          data: {
            symbol,
            name,
            price: price, // Tam hassasiyetle döndür
            currency,
            timestamp: new Date().toISOString(),
            cached: false,
          },
        })
      }

      // Fiyat bulunamadı
      return NextResponse.json(
        {
          error: 'Fiyat bilgisi bulunamadı. Lütfen sembolü kontrol edin.',
          symbol,
        },
        { status: 404 }
      )
    } catch (fetchError) {
      console.error('Fiyat çekme hatası:', fetchError)
      return NextResponse.json(
        {
          error: 'Fiyat bilgisi alınamadı. Lütfen daha sonra tekrar deneyin.',
        },
        { status: 503 }
      )
    }
  } catch (error: unknown) {
    console.error('Price quote error:', error)
    const message = error instanceof Error ? error.message : 'Bir hata oluştu'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

