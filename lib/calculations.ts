// Portföy hesaplama fonksiyonları
// Tüm formüller basit ve şeffaf tutulmuştur

import { Holding, PriceHistory, Transaction, AssetPerformance, PortfolioDistribution, PortfolioScore, AssetType } from './types/database.types'

/**
 * Güncel fiyatı al (mock - gerçekte API'den gelecek)
 * @param symbol - Sembol (ör: "ASELS.IS", "AAPL", "BTCUSDT")
 * @param priceHistory - Fiyat geçmişi
 * @returns Güncel fiyat (TRY bazında)
 */
export function getCurrentPrice(symbol: string, priceHistory: PriceHistory[]): number {
  const prices = priceHistory.filter(p => p.symbol === symbol).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  if (prices.length === 0) return 0
  
  const latestPrice = prices[0]
  // USD için basit TRY çevirimi (mock - gerçekte güncel kur kullanılacak)
  const mockUSDTRY = 34.50
  
  return latestPrice.currency === 'USD' ? latestPrice.close * mockUSDTRY : latestPrice.close
}

/**
 * Varlık performansını hesapla
 * @param holding - Holding bilgisi
 * @param currentPrice - Güncel fiyat (TRY bazında)
 */
export function calculateAssetPerformance(holding: Holding, currentPrice: number): AssetPerformance {
  const currentValue = holding.quantity * currentPrice
  const costBasis = holding.quantity * holding.avg_price
  const profitLoss = currentValue - costBasis
  const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0

  return {
    symbol: holding.symbol,
    asset_type: holding.asset_type,
    current_value: currentValue,
    cost_basis: costBasis,
    profit_loss: profitLoss,
    profit_loss_percent: profitLossPercent,
    quantity: holding.quantity,
    avg_price: holding.avg_price,
    current_price: currentPrice,
  }
}

/**
 * Portföy dağılımını hesapla (Kripto, TR Hisse, ABD Hisse, Nakit)
 * @param performances - Varlık performansları
 */
export function calculateDistribution(performances: AssetPerformance[]): PortfolioDistribution[] {
  const totalValue = performances.reduce((sum, p) => sum + p.current_value, 0)
  
  const grouped = performances.reduce((acc, p) => {
    if (!acc[p.asset_type]) {
      acc[p.asset_type] = { value: 0, count: 0 }
    }
    acc[p.asset_type].value += p.current_value
    acc[p.asset_type].count += 1
    return acc
  }, {} as Record<string, { value: number; count: number }>)

  return Object.entries(grouped).map(([asset_type, data]) => ({
    asset_type: asset_type as AssetType,
    value: data.value,
    percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
    count: data.count,
  }))
}

/**
 * Portföy getirilerini hesapla (günlük, haftalık, aylık)
 * @param priceHistory - Tüm fiyat geçmişi
 * @param holdings - Mevcut pozisyonlar
 * @returns { daily, weekly, monthly } yüzde değişimler
 */
export function calculateReturns(priceHistory: PriceHistory[], holdings: Holding[]): {
  daily: number
  weekly: number
  monthly: number
} {
  // Basitleştirilmiş hesaplama
  // Gerçek uygulamada her gün için portföy değerini hesaplayıp zaman serisinden getiri hesaplanır
  
  const mockUSDTRY = 34.50
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const getPortfolioValue = (targetDate: Date): number => {
    return holdings.reduce((total, h) => {
      const prices = priceHistory
        .filter(p => p.symbol === h.symbol && new Date(p.date) <= targetDate)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      if (prices.length === 0) return total
      
      const price = prices[0].currency === 'USD' ? prices[0].close * mockUSDTRY : prices[0].close
      return total + (h.quantity * price)
    }, 0)
  }

  const currentValue = getPortfolioValue(now)
  const valueDayAgo = getPortfolioValue(oneDayAgo)
  const valueWeekAgo = getPortfolioValue(oneWeekAgo)
  const valueMonthAgo = getPortfolioValue(oneMonthAgo)

  return {
    daily: valueDayAgo > 0 ? ((currentValue - valueDayAgo) / valueDayAgo) * 100 : 0,
    weekly: valueWeekAgo > 0 ? ((currentValue - valueWeekAgo) / valueWeekAgo) * 100 : 0,
    monthly: valueMonthAgo > 0 ? ((currentValue - valueMonthAgo) / valueMonthAgo) * 100 : 0,
  }
}

/**
 * Volatilite hesapla (günlük getirilerin standart sapması)
 * @param priceHistory - Fiyat geçmişi
 * @param holdings - Pozisyonlar
 * @returns Volatilite (%)
 */
export function calculateVolatility(priceHistory: PriceHistory[], holdings: Holding[]): number {
  // Günlük portföy değerlerini hesapla
  const mockUSDTRY = 34.50
  const dates = [...new Set(priceHistory.map(p => p.date))].sort()
  
  if (dates.length < 2) return 0

  const dailyValues = dates.map(date => {
    return holdings.reduce((total, h) => {
      const price = priceHistory.find(p => p.symbol === h.symbol && p.date === date)
      if (!price) return total
      const priceInTRY = price.currency === 'USD' ? price.close * mockUSDTRY : price.close
      return total + (h.quantity * priceInTRY)
    }, 0)
  }).filter(v => v > 0)

  if (dailyValues.length < 2) return 0

  // Günlük getirileri hesapla
  const returns = []
  for (let i = 1; i < dailyValues.length; i++) {
    const ret = ((dailyValues[i] - dailyValues[i - 1]) / dailyValues[i - 1]) * 100
    returns.push(ret)
  }

  // Standart sapma
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
  
  return Math.sqrt(variance)
}

/**
 * Çeşitlilik puanı hesapla (0-100)
 * Kriterler: varlık sayısı, ağırlık dengesi, tür çeşitliliği
 * @param performances - Varlık performansları
 */
export function calculateDiversificationScore(performances: AssetPerformance[]): number {
  if (performances.length === 0) return 0

  const totalValue = performances.reduce((sum, p) => sum + p.current_value, 0)
  if (totalValue === 0) return 0

  // 1. Varlık sayısı puanı (0-40): daha fazla varlık = daha yüksek puan
  const assetCountScore = Math.min((performances.length / 10) * 40, 40)

  // 2. Ağırlık dengesi puanı (0-30): HHI (Herfindahl Index) kullan
  const weights = performances.map(p => p.current_value / totalValue)
  const hhi = weights.reduce((sum, w) => sum + Math.pow(w, 2), 0)
  // HHI: 0 (tam dağıtılmış) ile 1 (tek varlık) arası
  const balanceScore = (1 - hhi) * 30

  // 3. Tür çeşitliliği puanı (0-30): kaç farklı asset_type var?
  const uniqueTypes = new Set(performances.map(p => p.asset_type))
  const typeScore = (uniqueTypes.size / 4) * 30 // Maksimum 4 tür var

  return assetCountScore + balanceScore + typeScore
}

/**
 * Korelasyon matrisi hesapla
 * @param priceHistory - Fiyat geçmişi
 * @param symbols - Semboller listesi
 * @returns Korelasyon matrisi { [symbol1]: { [symbol2]: correlation } }
 */
export function calculateCorrelationMatrix(
  priceHistory: PriceHistory[],
  symbols: string[]
): Record<string, Record<string, number>> {
  const matrix: Record<string, Record<string, number>> = {}

  // Her sembol için günlük getirileri hesapla
  const returns: Record<string, number[]> = {}
  symbols.forEach(symbol => {
    const prices = priceHistory
      .filter(p => p.symbol === symbol)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (prices.length < 2) {
      returns[symbol] = []
      return
    }

    returns[symbol] = []
    for (let i = 1; i < prices.length; i++) {
      const ret = ((prices[i].close - prices[i - 1].close) / prices[i - 1].close) * 100
      returns[symbol].push(ret)
    }
  })

  // Pearson korelasyon hesapla
  symbols.forEach(s1 => {
    matrix[s1] = {}
    symbols.forEach(s2 => {
      if (s1 === s2) {
        matrix[s1][s2] = 1
        return
      }

      const r1 = returns[s1]
      const r2 = returns[s2]

      if (!r1 || !r2 || r1.length < 2 || r2.length < 2 || r1.length !== r2.length) {
        matrix[s1][s2] = 0
        return
      }

      const n = r1.length
      const mean1 = r1.reduce((sum, v) => sum + v, 0) / n
      const mean2 = r2.reduce((sum, v) => sum + v, 0) / n

      let num = 0, den1 = 0, den2 = 0
      for (let i = 0; i < n; i++) {
        const diff1 = r1[i] - mean1
        const diff2 = r2[i] - mean2
        num += diff1 * diff2
        den1 += diff1 * diff1
        den2 += diff2 * diff2
      }

      const correlation = den1 > 0 && den2 > 0 ? num / Math.sqrt(den1 * den2) : 0
      matrix[s1][s2] = correlation
    })
  })

  return matrix
}

/**
 * Portföy puanı hesapla (0-100)
 * Bileşenler: getiri (0-40), çeşitlilik (0-30), düşük volatilite (0-30)
 * @param monthlyReturn - Aylık getiri (%)
 * @param volatility - Volatilite (%)
 * @param diversificationScore - Çeşitlilik puanı (0-100)
 */
export function calculatePortfolioScore(
  monthlyReturn: number,
  volatility: number,
  diversificationScore: number
): PortfolioScore {
  // 1. Getiri puanı (0-40): %5+ aylık = 40 puan, 0-5% arası normalize
  const returnScore = Math.min((Math.max(monthlyReturn, 0) / 5) * 40, 40)

  // 2. Çeşitlilik puanı (0-30): direk normalize (çünkü zaten 0-100)
  const divScore = (diversificationScore / 100) * 30

  // 3. Volatilite puanı (0-30): düşük vol = yüksek puan
  // %2 günlük vol ve altı = 30 puan, %10+ = 0 puan
  const volScore = Math.max(30 - (volatility / 10) * 30, 0)

  return {
    total: Math.round(returnScore + divScore + volScore),
    return_score: Math.round(returnScore),
    diversification_score: Math.round(divScore),
    volatility_score: Math.round(volScore),
  }
}

/**
 * Nakit oranını hesapla
 * @param performances - Varlık performansları
 */
export function calculateCashRatio(performances: AssetPerformance[]): number {
  const totalValue = performances.reduce((sum, p) => sum + p.current_value, 0)
  const cashValue = performances
    .filter(p => p.asset_type === 'CASH')
    .reduce((sum, p) => sum + p.current_value, 0)

  return totalValue > 0 ? (cashValue / totalValue) * 100 : 0
}

/**
 * Risk seviyesi hesapla (Düşük, Orta, Yüksek)
 * Volatilite ve dağılıma göre
 */
export function calculateRiskLevel(volatility: number, cashRatio: number): string {
  if (volatility < 2 || cashRatio > 50) return 'Düşük'
  if (volatility < 5 && cashRatio > 20) return 'Orta'
  return 'Yüksek'
}
