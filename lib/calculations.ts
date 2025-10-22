// Portföy hesaplama fonksiyonları
// Tüm formüller basit ve şeffaf tutulmuştur

import { Holding, PriceHistory, AssetPerformance, PortfolioDistribution, PortfolioScore, AssetType, Transaction } from './types/database.types'

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

/**
 * İşlem kar/zarar bilgisi
 */
export interface TransactionProfitLoss {
  transaction_id: string
  cost_basis: number | null // Satışta, alış maliyeti
  profit_loss: number | null // Realize olan kar/zarar
  profit_loss_percent: number | null // Kar/zarar yüzdesi
  avg_cost_price: number | null // İşlem anındaki ortalama maliyet
}

/**
 * İşlemler için kar/zarar hesapla (FIFO metodu)
 * Bu fonksiyon tüm işlemleri kronolojik sırada işler ve her satış için realize olan kar/zararı hesaplar
 * 
 * @param transactions - Tüm işlemler (kronolojik sırada)
 * @returns Her transaction için kar/zarar bilgisi
 */
export function calculateTransactionProfitLoss(transactions: Transaction[]): Map<string, TransactionProfitLoss> {
  const profitLossMap = new Map<string, TransactionProfitLoss>()
  
  // Her sembol için FIFO kuyruğu (alış işlemleri)
  const fifoQueues = new Map<string, Array<{ quantity: number; price: number }>>()
  
  // İşlemleri tarih sırasına göre işle
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  sortedTransactions.forEach(tx => {
    const queue = fifoQueues.get(tx.symbol) || []
    
    if (tx.side === 'BUY') {
      // Alış işlemi - kuyruğa ekle
      queue.push({
        quantity: tx.quantity,
        price: tx.price
      })
      fifoQueues.set(tx.symbol, queue)
      
      profitLossMap.set(tx.id, {
        transaction_id: tx.id,
        cost_basis: null,
        profit_loss: null,
        profit_loss_percent: null,
        avg_cost_price: null
      })
    } else {
      // Satış işlemi - FIFO ile maliyet hesapla
      let remainingQuantity = tx.quantity
      let totalCost = 0
      let totalQuantityUsed = 0
      
      while (remainingQuantity > 0 && queue.length > 0) {
        const oldest = queue[0]
        
        if (oldest.quantity <= remainingQuantity) {
          // Tüm lot satıldı
          totalCost += oldest.quantity * oldest.price
          totalQuantityUsed += oldest.quantity
          remainingQuantity -= oldest.quantity
          queue.shift()
        } else {
          // Kısmi satış
          totalCost += remainingQuantity * oldest.price
          totalQuantityUsed += remainingQuantity
          oldest.quantity -= remainingQuantity
          remainingQuantity = 0
        }
      }
      
      fifoQueues.set(tx.symbol, queue)
      
      // Kar/zarar hesapla
      const saleProceeds = tx.quantity * tx.price
      const profitLoss = saleProceeds - totalCost
      const avgCostPrice = totalQuantityUsed > 0 ? totalCost / totalQuantityUsed : 0
      const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0
      
      profitLossMap.set(tx.id, {
        transaction_id: tx.id,
        cost_basis: totalCost,
        profit_loss: profitLoss,
        profit_loss_percent: profitLossPercent,
        avg_cost_price: avgCostPrice
      })
    }
  })
  
  return profitLossMap
}

/**
 * Realize olmuş kar/zarar istatistikleri
 */
export interface RealizedProfitLossStats {
  total_realized_profit: number // Toplam realize kar
  total_realized_loss: number // Toplam realize zarar
  net_realized: number // Net realize (kar - zarar)
  winning_trades: number // Karlı işlem sayısı
  losing_trades: number // Zararlı işlem sayısı
  total_trades: number // Toplam satış işlem sayısı
  win_rate: number // Kazanma oranı (%)
  avg_profit_per_trade: number // İşlem başına ortalama kar
  biggest_win: number // En büyük kazanç
  biggest_loss: number // En büyük kayıp
  profit_factor: number // Kar faktörü (toplam kar / toplam zarar)
}

/**
 * Realize olmuş kar/zarar istatistiklerini hesapla
 * @param transactions - Tüm işlemler
 * @returns İstatistikler
 */
export function calculateRealizedProfitLossStats(transactions: Transaction[]): RealizedProfitLossStats {
  const profitLossMap = calculateTransactionProfitLoss(transactions)
  
  let totalProfit = 0
  let totalLoss = 0
  let winningTrades = 0
  let losingTrades = 0
  let biggestWin = 0
  let biggestLoss = 0
  
  profitLossMap.forEach(pl => {
    if (pl.profit_loss !== null && pl.profit_loss !== 0) {
      if (pl.profit_loss > 0) {
        totalProfit += pl.profit_loss
        winningTrades++
        if (pl.profit_loss > biggestWin) biggestWin = pl.profit_loss
      } else {
        totalLoss += Math.abs(pl.profit_loss)
        losingTrades++
        if (Math.abs(pl.profit_loss) > biggestLoss) biggestLoss = Math.abs(pl.profit_loss)
      }
    }
  })
  
  const totalTrades = winningTrades + losingTrades
  const netRealized = totalProfit - totalLoss
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
  const avgProfitPerTrade = totalTrades > 0 ? netRealized / totalTrades : 0
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0
  
  return {
    total_realized_profit: totalProfit,
    total_realized_loss: totalLoss,
    net_realized: netRealized,
    winning_trades: winningTrades,
    losing_trades: losingTrades,
    total_trades: totalTrades,
    win_rate: winRate,
    avg_profit_per_trade: avgProfitPerTrade,
    biggest_win: biggestWin,
    biggest_loss: biggestLoss,
    profit_factor: profitFactor
  }
}

/**
 * Sembol bazında kar/zarar analizi
 */
export interface SymbolProfitLoss {
  symbol: string
  total_realized: number
  trade_count: number
  win_count: number
  loss_count: number
  win_rate: number
  avg_profit_per_trade: number
}

/**
 * Sembol bazında kar/zarar istatistiklerini hesapla
 * @param transactions - Tüm işlemler
 * @returns Sembol bazında istatistikler
 */
export function calculateProfitLossBySymbol(transactions: Transaction[]): SymbolProfitLoss[] {
  const profitLossMap = calculateTransactionProfitLoss(transactions)
  const symbolStats = new Map<string, {
    total: number
    trades: number
    wins: number
    losses: number
  }>()
  
  transactions.forEach(tx => {
    if (tx.side === 'SELL') {
      const pl = profitLossMap.get(tx.id)
      if (pl && pl.profit_loss !== null) {
        const stats = symbolStats.get(tx.symbol) || { total: 0, trades: 0, wins: 0, losses: 0 }
        stats.total += pl.profit_loss
        stats.trades++
        if (pl.profit_loss > 0) stats.wins++
        else if (pl.profit_loss < 0) stats.losses++
        symbolStats.set(tx.symbol, stats)
      }
    }
  })
  
  return Array.from(symbolStats.entries()).map(([symbol, stats]) => ({
    symbol,
    total_realized: stats.total,
    trade_count: stats.trades,
    win_count: stats.wins,
    loss_count: stats.losses,
    win_rate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0,
    avg_profit_per_trade: stats.trades > 0 ? stats.total / stats.trades : 0
  })).sort((a, b) => b.total_realized - a.total_realized)
}

/**
 * Aylık kar/zarar trendi
 */
export interface MonthlyProfitLoss {
  year: number
  month: number
  month_label: string // "2024-01"
  realized_profit: number
  trade_count: number
}

/**
 * Aylık kar/zarar trendini hesapla
 * @param transactions - Tüm işlemler
 * @returns Aylık istatistikler
 */
export function calculateMonthlyProfitLoss(transactions: Transaction[]): MonthlyProfitLoss[] {
  const profitLossMap = calculateTransactionProfitLoss(transactions)
  const monthlyStats = new Map<string, { profit: number; count: number; year: number; month: number }>()
  
  transactions.forEach(tx => {
    if (tx.side === 'SELL') {
      const pl = profitLossMap.get(tx.id)
      if (pl && pl.profit_loss !== null) {
        const date = new Date(tx.date)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const key = `${year}-${String(month).padStart(2, '0')}`
        
        const stats = monthlyStats.get(key) || { profit: 0, count: 0, year, month }
        stats.profit += pl.profit_loss
        stats.count++
        monthlyStats.set(key, stats)
      }
    }
  })
  
  return Array.from(monthlyStats.entries())
    .map(([key, stats]) => ({
      year: stats.year,
      month: stats.month,
      month_label: key,
      realized_profit: stats.profit,
      trade_count: stats.count
    }))
    .sort((a, b) => a.month_label.localeCompare(b.month_label))
}
