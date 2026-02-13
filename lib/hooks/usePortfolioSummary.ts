'use client'

import { useEffect, useState, useMemo } from 'react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import { createClient } from '@/lib/supabase/client'
import { usePrices } from '@/lib/hooks/usePrices'
import type { Holding } from '@/lib/types/database.types'

export interface HoldingPerformance {
  symbol: string
  asset_type: string
  profitLossPercent: number
}

export interface PortfolioSummary {
  totalTry: number
  totalUsd: number
  totalCostTry: number
  totalCostUsd: number
  totalPL: number
  totalPLUsd: number
  totalPLPct: number
  holdingsCount: number
  holdingPerformances: HoldingPerformance[]
}

export function usePortfolioSummary() {
  const { activePortfolio } = usePortfolio()
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [usdTryRate, setUsdTryRate] = useState<number | null>(null)
  const supabase = useMemo(() => createClient(), [])
  const { prices, loading: pricesLoading } = usePrices(holdings)

  useEffect(() => {
    const fetchHoldings = async () => {
      if (!activePortfolio) { setLoading(false); return }
      setLoading(true)
      const { data } = await supabase.from('holdings').select('*').eq('portfolio_id', activePortfolio.id)
      setHoldings(data || [])
      setLoading(false)
    }
    fetchHoldings()
  }, [activePortfolio?.id, supabase])

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('/api/price/quote?symbol=USD&asset_type=CASH')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setUsdTryRate(result.data.price)
          }
        }
      } catch (error) { console.error('USD/TRY rate error:', error) }
    }
    if (activePortfolio) fetchRate()
  }, [activePortfolio?.id])

  const summary = useMemo<PortfolioSummary | null>(() => {
    if (!holdings.length || pricesLoading || !prices || !usdTryRate) return null

    let totalTry = 0, totalUsd = 0, totalCostTry = 0, totalCostUsd = 0
    const hpList: HoldingPerformance[] = []

    holdings.forEach(h => {
      const pd = prices[h.symbol]
      if (!pd) return
      const val = h.quantity * pd.price
      const cost = h.quantity * h.avg_price
      let costTry = 0, valTry = 0

      if (pd.currency === 'TRY') {
        valTry = val; costTry = cost
        totalTry += val; totalUsd += val / usdTryRate
        totalCostTry += cost; totalCostUsd += cost / usdTryRate
      } else if (pd.currency === 'USD') {
        valTry = val * usdTryRate; costTry = cost * usdTryRate
        totalTry += valTry; totalUsd += val
        totalCostTry += costTry; totalCostUsd += cost
      }

      const plPct = costTry > 0 ? ((valTry - costTry) / costTry) * 100 : 0
      hpList.push({ symbol: h.symbol, asset_type: h.asset_type, profitLossPercent: plPct })
    })

    hpList.sort((a, b) => b.profitLossPercent - a.profitLossPercent)

    const totalPL = totalTry - totalCostTry
    const totalPLUsd = totalUsd - totalCostUsd
    const totalPLPct = totalCostTry > 0 ? (totalPL / totalCostTry) * 100 : 0

    return {
      totalTry, totalUsd, totalCostTry, totalCostUsd,
      totalPL, totalPLUsd, totalPLPct,
      holdingsCount: holdings.length,
      holdingPerformances: hpList,
    }
  }, [holdings, prices, pricesLoading, usdTryRate])

  const isLoading = loading || (holdings.length > 0 && (pricesLoading || !usdTryRate))

  return { summary, loading: isLoading }
}
