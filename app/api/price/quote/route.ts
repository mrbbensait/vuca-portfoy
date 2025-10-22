import { NextResponse } from 'next/server'

/**
 * Gerçek zamanlı fiyat bilgisi çeker
 * TR Hisse: Yahoo Finance
 * US Hisse: Yahoo Finance
 * Kripto: Binance Public API
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
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`,
          { 
            cache: 'no-store',
            headers: {
              'Accept': 'application/json',
            }
          }
        )

        if (!response.ok) {
          console.error(`Binance API error: ${response.status} ${response.statusText}`)
          throw new Error(`Binance API returned ${response.status}`)
        }

        const data = await response.json()
        
        if (data.price) {
          price = parseFloat(data.price)
          currency = 'USD' // USDT paritesi olduğu için USD
        } else {
          throw new Error('Invalid response from Binance API')
        }
      } else if (assetType === 'TR_STOCK' || assetType === 'US_STOCK') {
        // Yahoo Finance Query API kullan
        const yahooSymbol = assetType === 'TR_STOCK' 
          ? (symbol.endsWith('.IS') ? symbol : `${symbol}.IS`)
          : symbol

        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`,
          { 
            cache: 'no-store',
            headers: {
              'Accept': 'application/json',
            }
          }
        )

        if (!response.ok) {
          console.error(`Yahoo Finance API error: ${response.status} ${response.statusText}`)
          throw new Error(`Yahoo Finance API returned ${response.status}`)
        }

        const data = await response.json()
        const result = data.chart?.result?.[0]
        
        if (!result || !result.meta) {
          throw new Error('Invalid response from Yahoo Finance API')
        }

        const meta = result.meta
        price = meta.regularMarketPrice || meta.previousClose
        
        if (!price) {
          throw new Error('No price data available from Yahoo Finance')
        }
        
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
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error'
      console.error('Fiyat çekme hatası:', {
        error: errorMessage,
        symbol,
        assetType,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json(
        {
          error: `Fiyat bilgisi alınamadı: ${errorMessage}`,
          details: assetType === 'CRYPTO' 
            ? 'Binance API bağlantı sorunu. Sembol doğru mu kontrol edin (örn: BTCUSDT, ETHUSDT)'
            : 'Yahoo Finance API bağlantı sorunu. Sembol doğru mu kontrol edin.'
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
