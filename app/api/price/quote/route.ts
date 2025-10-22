import { NextResponse } from 'next/server'

/**
 * Gerçek zamanlı fiyat bilgisi çeker
 * TR Hisse: Yahoo Finance
 * US Hisse: Yahoo Finance
 * Kripto: Binance Public API
 * 
 * NOT: Bu endpoint public'tir - authentication gerektirmez (middleware'de tanımlı)
 * Sadece harici API'lerden genel piyasa verisi çeker
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const assetType = searchParams.get('asset_type')

    if (!symbol || !assetType) {
      return NextResponse.json(
        { error: 'Symbol ve asset_type gerekli' },
        { status: 400 }
      )
    }

    let price = null
    let currency = 'USD' // Varsayılan USD
    let name = symbol

    try {
      if (assetType === 'CRYPTO') {
        // Binance Public API kullan - USD olarak
        const binanceUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`
        console.log('[CRYPTO] Binance API isteği:', binanceUrl)
        
        const response = await fetch(binanceUrl, {
          next: { revalidate: 60 }, // 1 dakika cache
          headers: {
            'Accept': 'application/json',
          }
        })

        console.log('[CRYPTO] Binance API yanıt status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('[CRYPTO] Binance API veri:', data)
          price = parseFloat(data.price)
          currency = 'USD' // USDT paritesi olduğu için USD
        } else {
          const errorText = await response.text()
          console.error('[CRYPTO] Binance API hatası:', response.status, errorText)
        }
      } else if (assetType === 'TR_STOCK' || assetType === 'US_STOCK') {
        // Yahoo Finance Query API kullan
        const yahooSymbol = assetType === 'TR_STOCK' 
          ? (symbol.endsWith('.IS') ? symbol : `${symbol}.IS`)
          : symbol

        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`,
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
        
        return NextResponse.json({
          success: true,
          data: {
            symbol,
            name,
            price: parseFloat(price.toFixed(decimals)),
            currency,
            timestamp: new Date().toISOString(),
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
