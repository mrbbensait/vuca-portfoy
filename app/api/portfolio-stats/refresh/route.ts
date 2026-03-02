import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { calculateTransactionProfitLoss } from '@/lib/calculations'

/**
 * POST /api/portfolio-stats/refresh
 * 
 * Background refresh endpoint for portfolio stats
 * Used by:
 * - Transaction triggers (after adding/editing transactions)
 * - Public page visitors (when cache is older than 24 hours)
 * 
 * This endpoint is public (no auth required) but only works for public portfolios
 */
export async function POST(request: NextRequest) {
  try {
    const { portfolio_id } = await request.json()

    if (!portfolio_id) {
      return NextResponse.json({ error: 'portfolio_id is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Verify portfolio exists and is public
    const { data: portfolio, error: portError } = await supabase
      .from('portfolios')
      .select('id, is_public')
      .eq('id', portfolio_id)
      .single()

    if (portError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    if (!portfolio.is_public) {
      return NextResponse.json({ error: 'Portfolio is not public' }, { status: 403 })
    }

    // 2. Check cache age (throttling: skip if updated < 5 minutes ago)
    const { data: existing } = await supabase
      .from('portfolio_stats_cache')
      .select('updated_at')
      .eq('portfolio_id', portfolio_id)
      .single()

    if (existing) {
      const ageMinutes = (Date.now() - new Date(existing.updated_at).getTime()) / 1000 / 60
      if (ageMinutes < 5) {
        return NextResponse.json({ 
          success: true, 
          skipped: true, 
          reason: 'Cache is fresh (< 5 minutes)',
          age_minutes: Math.round(ageMinutes)
        })
      }
    }

    // 3. Fetch holdings
    const { data: holdings, error: holdingsError } = await supabase
      .from('holdings')
      .select('*')
      .eq('portfolio_id', portfolio_id)

    if (holdingsError) {
      throw new Error('Failed to fetch holdings')
    }

    // 4. Fetch transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .order('date', { ascending: true })

    if (txError) {
      throw new Error('Failed to fetch transactions')
    }

    // 5. Fetch current prices for unrealized P&L calculation
    const symbols = holdings?.map(h => h.symbol) || []
    let prices: Record<string, { price: number; currency: string }> = {}
    
    if (symbols.length > 0) {
      const { data: priceData } = await supabase
        .from('price_cache')
        .select('symbol, price, currency')
        .in('symbol', symbols)
        .gt('expires_at', new Date().toISOString())

      if (priceData) {
        priceData.forEach(p => {
          prices[p.symbol] = { price: parseFloat(p.price), currency: p.currency }
        })
      }
    }

    // 6. Get USD/TRY rate
    const { data: usdTryData } = await supabase
      .from('price_cache')
      .select('price')
      .eq('symbol', 'USDTRY')
      .gt('expires_at', new Date().toISOString())
      .single()

    const usdTryRate = usdTryData ? parseFloat(usdTryData.price) : 34.5 // fallback

    // 7. Calculate stats (same logic as ProfitLossSection)
    if (!transactions || transactions.length === 0 || !holdings) {
      return NextResponse.json({ 
        success: true, 
        skipped: true,
        reason: 'No transactions or holdings to calculate'
      })
    }

    const allProfitLoss = calculateTransactionProfitLoss(transactions)
    const sellTx = transactions.filter(tx => tx.side === 'SELL')
    
    let realizedPL = 0
    let realizedGrossProfit = 0
    let realizedGrossLoss = 0
    let winCount = 0
    let lossCount = 0
    let bestTradeData: { symbol: string; pl: number; plPct: number } | null = null
    let worstTradeData: { symbol: string; pl: number; plPct: number } | null = null
    let totalFees = 0

    sellTx.forEach(tx => {
      const plInfo = allProfitLoss.get(tx.id)
      if (!plInfo || plInfo.profit_loss === null) return

      const pl = plInfo.profit_loss
      const plPct = plInfo.profit_loss_percent || 0
      realizedPL += pl

      if (pl >= 0) {
        realizedGrossProfit += pl
        winCount++
      } else {
        realizedGrossLoss += Math.abs(pl)
        lossCount++
      }

      if (!bestTradeData || pl > bestTradeData.pl) {
        bestTradeData = { symbol: tx.symbol, pl, plPct }
      }
      if (!worstTradeData || pl < worstTradeData.pl) {
        worstTradeData = { symbol: tx.symbol, pl, plPct }
      }
    })

    transactions.forEach(tx => {
      totalFees += tx.fee || 0
    })

    // Unrealized P&L
    let unrealizedPL = 0
    let totalCurrentValue = 0
    let totalCostBasis = 0

    holdings.forEach(h => {
      const pd = prices[h.symbol]
      if (!pd) return

      let currentValueTry = 0
      let costTry = 0

      if (pd.currency === 'TRY') {
        currentValueTry = h.quantity * pd.price
        costTry = h.quantity * h.avg_price
      } else if (pd.currency === 'USD') {
        currentValueTry = h.quantity * pd.price * usdTryRate
        costTry = h.quantity * h.avg_price * usdTryRate
      }

      totalCurrentValue += currentValueTry
      totalCostBasis += costTry
    })

    unrealizedPL = totalCurrentValue - totalCostBasis

    // Derived metrics
    const totalTrades = sellTx.length
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0
    const profitFactor = realizedGrossLoss > 0 ? realizedGrossProfit / realizedGrossLoss : realizedGrossProfit > 0 ? Infinity : 0
    const avgWin = winCount > 0 ? realizedGrossProfit / winCount : 0
    const avgLoss = lossCount > 0 ? realizedGrossLoss / lossCount : 0
    const expectancy = totalTrades > 0 ? realizedPL / totalTrades : 0
    const totalPL = realizedPL + unrealizedPL
    const realizedPLPct = totalCostBasis > 0 ? (realizedPL / totalCostBasis) * 100 : 0
    const unrealizedPLPct = totalCostBasis > 0 ? (unrealizedPL / totalCostBasis) * 100 : 0
    const totalPLPct = totalCostBasis > 0 ? (totalPL / totalCostBasis) * 100 : 0

    const buyTx = transactions.filter(tx => tx.side === 'BUY')
    const totalInvested = buyTx.reduce((sum, tx) => sum + (tx.quantity * tx.price), 0)
    const totalSold = sellTx.reduce((sum, tx) => sum + (tx.quantity * tx.price), 0)

    // All-time totals with currency conversion
    let allTimeInvested = 0
    let allTimeSold = 0
    
    buyTx.forEach(tx => {
      const pd = prices[tx.symbol]
      if (!pd) {
        allTimeInvested += tx.quantity * tx.price
        return
      }
      
      if (pd.currency === 'TRY') {
        allTimeInvested += tx.quantity * tx.price
      } else if (pd.currency === 'USD') {
        allTimeInvested += (tx.quantity * tx.price) * usdTryRate
      }
    })
    
    sellTx.forEach(tx => {
      const pd = prices[tx.symbol]
      if (!pd) {
        allTimeSold += tx.quantity * tx.price
        return
      }
      
      if (pd.currency === 'TRY') {
        allTimeSold += tx.quantity * tx.price
      } else if (pd.currency === 'USD') {
        allTimeSold += (tx.quantity * tx.price) * usdTryRate
      }
    })

    // 8. Save to cache
    const stats_data = {
      realizedPL,
      unrealizedPL,
      totalPL,
      realizedPLPct,
      unrealizedPLPct,
      totalPLPct,
      realizedGrossProfit,
      realizedGrossLoss,
      winCount,
      lossCount,
      totalTrades,
      winRate,
      profitFactor: profitFactor === Infinity ? 999999 : profitFactor,
      avgWin,
      avgLoss,
      expectancy,
      bestTrade: bestTradeData,
      worstTrade: worstTradeData,
      totalFees,
      totalInvested,
      totalSold,
      totalCurrentValue,
      totalCostBasis,
      allTimeInvested,
      allTimeSold,
    }

    const { error: cacheError } = await supabase
      .from('portfolio_stats_cache')
      .upsert({
        portfolio_id,
        stats_data,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'portfolio_id',
      })

    if (cacheError) {
      throw cacheError
    }

    return NextResponse.json({ 
      success: true,
      message: 'Stats refreshed successfully'
    })
  } catch (error: unknown) {
    console.error('POST portfolio-stats/refresh error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
