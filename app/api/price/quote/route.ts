import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // 2. PARAMETRE KONTROLÜ
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const assetType = searchParams.get('asset_type')

    if (!symbol || !assetType) {
      return NextResponse.json(
        { error: 'Symbol ve asset_type gerekli' },
        { status: 400 }
      )
    }

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
    let name = symbol

    try {
      if (assetType === 'CRYPTO') {
        let ok = false
        try {
          const response = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(symbol)}`,
            { next: { revalidate: 60 } }
          )
          if (response.ok) {
            const data = await response.json()
            price = parseFloat(data.price)
            currency = 'USD'
            ok = true
          }
        } catch {}

        if (!ok) {
          const base = symbol.replace(/(USDT|BUSD|USDC|USD)$/i, '')
          const yahooSymbol = `${base}-USD`
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
              name = meta.symbol || symbol
            }
          }
        }
      } else if (assetType === 'TR_STOCK' || assetType === 'US_STOCK') {
        // Yahoo Finance Query API kullan
        const yahooSymbol = assetType === 'TR_STOCK' 
          ? (symbol.endsWith('.IS') ? symbol : `${symbol}.IS`)
          : symbol

        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`,
          { next: { revalidate: 60 } }
        )

        if (response.ok) {
          const data = await response.json()
          const result = data.chart?.result?.[0]
          
          if (result) {
            const meta = result.meta
            price = meta.regularMarketPrice || meta.previousClose
            
            // TR hisse için USD olarak al
            // Yahoo Finance TR hisseleri TRY'den veriyor, ama biz USD istiyoruz
            // Eğer TRY ise yaklaşık kur ile USD'ye çevir
            if (meta.currency === 'TRY') {
              const usdTryRate = 34.5
              price = price / usdTryRate // TRY'den USD'ye çevir
              currency = 'USD'
            } else {
              currency = 'USD'
            }
            
            name = meta.symbol || symbol
          }
        }
      }

      if (price) {
        // Kripto için 4 hane, diğerleri için 2 hane hassasiyet
        const decimals = assetType === 'CRYPTO' ? 4 : 2
        const roundedPrice = parseFloat(price.toFixed(decimals))
        
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
              price: roundedPrice,
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
            price: roundedPrice,
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

