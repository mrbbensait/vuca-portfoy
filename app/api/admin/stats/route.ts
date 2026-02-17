import { withAdminAuth } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  return withAdminAuth(async () => {
    const admin = createAdminClient()

    // Paralel sorgular — performans için
    const [
      usersResult,
      portfoliosResult,
      holdingsResult,
      transactionsResult,
      publicPortfoliosResult,
      followsResult,
      recentUsersResult,
      recentTransactionsResult,
      allHoldingsResult,
      allTransactionsResult,
      dailySignupsResult,
    ] = await Promise.all([
      // Toplam kullanıcı sayısı
      admin.from('users_public').select('id', { count: 'exact', head: true }),

      // Toplam portföy sayısı
      admin.from('portfolios').select('id', { count: 'exact', head: true }),

      // Toplam holding sayısı (aktif)
      admin.from('holdings').select('id', { count: 'exact', head: true }).gt('quantity', 0),

      // Toplam işlem sayısı
      admin.from('transactions').select('id', { count: 'exact', head: true }),

      // Public portföy sayısı
      admin.from('portfolios').select('id', { count: 'exact', head: true }).eq('is_public', true),

      // Toplam takip sayısı
      admin.from('portfolio_follows').select('id', { count: 'exact', head: true }),

      // Son 7 günde kayıt olan kullanıcılar
      admin
        .from('users_public')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

      // Son 7 günde yapılan işlemler
      admin
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

      // Tüm aktif holdings — sembol analizi + değer hesabı için
      admin
        .from('holdings')
        .select('symbol, asset_type, quantity, avg_price')
        .gt('quantity', 0),

      // Tüm işlemler — hacim hesabı için
      admin
        .from('transactions')
        .select('quantity, price, side, asset_type'),

      // Son 30 gün günlük kayıt sayıları
      admin
        .from('users_public')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true }),
    ])

    // Güncel fiyatları çek (price_cache tablosundan)
    const { data: priceData } = await admin
      .from('price_cache')
      .select('symbol, asset_type, price')

    const priceMap: Record<string, number> = {}
    if (priceData) {
      for (const p of priceData) {
        priceMap[`${p.symbol}_${p.asset_type}`] = Number(p.price)
      }
    }

    // USD/TRY kuru — ABD hisseleri ve kripto dönüşümü için
    const usdTryRate = priceMap['USD_CASH'] || 1

    // Varlık tipine göre TRY çarpanı
    // TR_STOCK ve CASH: fiyatlar zaten TRY cinsinden
    // US_STOCK: fiyatlar USD cinsinden → USD/TRY ile çarp
    // CRYPTO: fiyatlar USDT (≈USD) cinsinden → USD/TRY ile çarp
    function tryMultiplier(assetType: string): number {
      if (assetType === 'US_STOCK' || assetType === 'CRYPTO') return usdTryRate
      return 1
    }

    // === FİNANSAL METRİKLER ===

    // 1. Toplam işlem hacmi (TRY cinsinden)
    let totalTradeVolume = 0
    let totalBuyVolume = 0
    let totalSellVolume = 0
    if (allTransactionsResult.data) {
      for (const t of allTransactionsResult.data) {
        const vol = Number(t.quantity) * Number(t.price)
        const multiplier = tryMultiplier(t.asset_type)
        totalTradeVolume += vol * multiplier
        if (t.side === 'BUY') totalBuyVolume += vol * multiplier
        else totalSellVolume += vol * multiplier
      }
    }

    // 2. Toplam yatırım maliyeti + güncel değer + varlık tipi dağılımı (TRY cinsinden)
    let totalInvestmentCost = 0
    let totalCurrentValue = 0
    const assetTypeCost: Record<string, number> = {}
    const assetTypeValue: Record<string, number> = {}
    const assetTypeCount: Record<string, number> = {}

    // En popüler semboller
    const symbolData: Record<string, { count: number; asset_type: string; costValue: number; currentValue: number }> = {}

    if (allHoldingsResult.data) {
      for (const h of allHoldingsResult.data) {
        const qty = Number(h.quantity)
        const avgP = Number(h.avg_price)
        const currentPrice = priceMap[`${h.symbol}_${h.asset_type}`] ?? avgP
        const multiplier = tryMultiplier(h.asset_type)

        const cost = qty * avgP * multiplier
        const current = qty * currentPrice * multiplier

        totalInvestmentCost += cost
        totalCurrentValue += current

        // Varlık tipi dağılımı (değer bazlı — TRY)
        assetTypeCost[h.asset_type] = (assetTypeCost[h.asset_type] || 0) + cost
        assetTypeValue[h.asset_type] = (assetTypeValue[h.asset_type] || 0) + current
        assetTypeCount[h.asset_type] = (assetTypeCount[h.asset_type] || 0) + 1

        // Sembol bazlı
        if (!symbolData[h.symbol]) {
          symbolData[h.symbol] = { count: 0, asset_type: h.asset_type, costValue: 0, currentValue: 0 }
        }
        symbolData[h.symbol].count++
        symbolData[h.symbol].costValue += cost
        symbolData[h.symbol].currentValue += current
      }
    }

    // Top semboller (güncel değer bazlı sıralı)
    const topSymbols = Object.entries(symbolData)
      .sort(([, a], [, b]) => b.currentValue - a.currentValue)
      .slice(0, 10)
      .map(([symbol, data]) => ({
        symbol,
        count: data.count,
        asset_type: data.asset_type,
        costValue: Math.round(data.costValue * 100) / 100,
        currentValue: Math.round(data.currentValue * 100) / 100,
      }))

    // Varlık tipi dağılımı (değer bazlı)
    const ASSET_TYPE_LABELS: Record<string, string> = {
      TR_STOCK: 'BIST Hisse',
      US_STOCK: 'ABD Hisse',
      CRYPTO: 'Kripto',
      CASH: 'Nakit / Emtia',
    }

    const assetTypeDistribution = Object.entries(assetTypeValue)
      .sort(([, a], [, b]) => b - a)
      .map(([type, value]) => ({
        type,
        label: ASSET_TYPE_LABELS[type] || type,
        currentValue: Math.round(value * 100) / 100,
        costValue: Math.round((assetTypeCost[type] || 0) * 100) / 100,
        holdingCount: assetTypeCount[type] || 0,
      }))

    // Toplam kâr/zarar
    const totalPnL = totalCurrentValue - totalInvestmentCost
    const totalPnLPercent = totalInvestmentCost > 0 ? (totalPnL / totalInvestmentCost) * 100 : 0

    // Günlük kayıt sayıları (son 30 gün)
    const dailySignups: Record<string, number> = {}
    if (dailySignupsResult.data) {
      for (const u of dailySignupsResult.data) {
        const day = new Date(u.created_at).toISOString().split('T')[0]
        dailySignups[day] = (dailySignups[day] || 0) + 1
      }
    }

    const dailySignupsArray: { date: string; count: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split('T')[0]
      dailySignupsArray.push({ date: dateStr, count: dailySignups[dateStr] || 0 })
    }

    return Response.json({
      overview: {
        totalUsers: usersResult.count || 0,
        totalPortfolios: portfoliosResult.count || 0,
        totalHoldings: holdingsResult.count || 0,
        totalTransactions: transactionsResult.count || 0,
        publicPortfolios: publicPortfoliosResult.count || 0,
        totalFollows: followsResult.count || 0,
        newUsersLast7Days: recentUsersResult.count || 0,
        newTransactionsLast7Days: recentTransactionsResult.count || 0,
      },
      financials: {
        totalTradeVolume: Math.round(totalTradeVolume * 100) / 100,
        totalBuyVolume: Math.round(totalBuyVolume * 100) / 100,
        totalSellVolume: Math.round(totalSellVolume * 100) / 100,
        totalInvestmentCost: Math.round(totalInvestmentCost * 100) / 100,
        totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
        totalPnL: Math.round(totalPnL * 100) / 100,
        totalPnLPercent: Math.round(totalPnLPercent * 100) / 100,
      },
      topSymbols,
      assetTypeDistribution,
      dailySignups: dailySignupsArray,
    })
  })
}
