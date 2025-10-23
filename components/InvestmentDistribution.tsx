'use client'

import { useEffect, useState } from 'react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import { createClient } from '@/lib/supabase/client'
import { usePrices } from '@/lib/hooks/usePrices'
import { formatLargeNumber, formatLargeNumberUSD } from '@/lib/formatPrice'
import type { Holding } from '@/lib/types/database.types'
import { Landmark, Globe, Bitcoin, Coins, DollarSign, RefreshCw } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface InvestmentDistributionProps {
  userId: string
}

interface UsdTryRate {
  rate: number
  timestamp: string
  cached: boolean
}

export default function InvestmentDistribution({ userId: _userId }: InvestmentDistributionProps) {
  const { activePortfolio } = usePortfolio()
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [usdTryRate, setUsdTryRate] = useState<UsdTryRate | null>(null)
  const [fetchingRate, setFetchingRate] = useState(false)
  
  const supabase = createClient()
  const { prices, loading: pricesLoading } = usePrices(holdings)

  // Holdings'i çek
  useEffect(() => {
    const fetchHoldings = async () => {
      if (!activePortfolio) {
        setLoading(false)
        return
      }

      setLoading(true)
      const { data } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', activePortfolio.id)

      setHoldings(data || [])
      setLoading(false)
    }

    fetchHoldings()
  }, [activePortfolio?.id])

  // USD/TRY kuru çek
  useEffect(() => {
    const fetchUsdTryRate = async () => {
      setFetchingRate(true)
      try {
        const response = await fetch('/api/price/quote?symbol=USD&asset_type=CASH')
        
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setUsdTryRate({
              rate: result.data.price,
              timestamp: result.data.timestamp,
              cached: result.data.cached || false
            })
          }
        }
      } catch (error) {
        console.error('USD/TRY kuru çekme hatası:', error)
      } finally {
        setFetchingRate(false)
      }
    }

    if (activePortfolio) {
      fetchUsdTryRate()
    }
  }, [activePortfolio?.id])

  // Detaylı yatırım hesaplamaları
  const calculateInvestments = () => {
    if (!holdings.length || pricesLoading || !prices || !usdTryRate) {
      return {
        bist: 0,
        nasdaq: 0,
        crypto: 0,
        gold: 0,
        silver: 0,
        cash: 0,
        bistCost: 0,
        nasdaqCost: 0,
        cryptoCost: 0,
        goldCost: 0,
        silverCost: 0,
        cashCost: 0,
        chartData: []
      }
    }

    let bist = 0
    let nasdaq = 0
    let crypto = 0
    let gold = 0
    let silver = 0
    let cash = 0

    let bistCost = 0
    let nasdaqCost = 0
    let cryptoCost = 0
    let goldCost = 0
    let silverCost = 0
    let cashCost = 0

    holdings.forEach(holding => {
      const priceData = prices[holding.symbol]
      if (!priceData) return

      const currentPrice = priceData.price
      const currency = priceData.currency
      const value = holding.quantity * currentPrice
      const costBasis = holding.quantity * holding.avg_price

      // TRY bazında değer hesapla (hem güncel hem maliyet)
      let valueInTry = 0
      let costBasisInTry = 0
      
      if (currency === 'TRY') {
        valueInTry = value
        costBasisInTry = costBasis
      } else if (currency === 'USD') {
        valueInTry = value * usdTryRate.rate
        costBasisInTry = costBasis * usdTryRate.rate
      }

      // Kategorilere ayır (hem güncel hem maliyet TRY bazında)
      if (holding.asset_type === 'TR_STOCK') {
        bist += valueInTry
        bistCost += costBasisInTry
      } else if (holding.asset_type === 'US_STOCK') {
        nasdaq += valueInTry
        nasdaqCost += costBasisInTry
      } else if (holding.asset_type === 'CRYPTO') {
        crypto += valueInTry
        cryptoCost += costBasisInTry
      } else if (holding.asset_type === 'CASH') {
        if (holding.symbol === 'GOLD') {
          gold += valueInTry
          goldCost += costBasisInTry
        } else if (holding.symbol === 'SILVER') {
          silver += valueInTry
          silverCost += costBasisInTry
        } else {
          cash += valueInTry
          cashCost += costBasisInTry
        }
      }
    })

    // Pasta grafik için data
    const chartData = []
    if (bist > 0) chartData.push({ name: 'BIST', value: bist, color: '#EF4444' })
    if (nasdaq > 0) chartData.push({ name: 'NASDAQ', value: nasdaq, color: '#3B82F6' })
    if (crypto > 0) chartData.push({ name: 'Kripto', value: crypto, color: '#F59E0B' })
    if (gold > 0) chartData.push({ name: 'Altın', value: gold, color: '#FBBF24' })
    if (silver > 0) chartData.push({ name: 'Gümüş', value: silver, color: '#9CA3AF' })
    if (cash > 0) chartData.push({ name: 'Nakit', value: cash, color: '#10B981' })

    return {
      bist,
      nasdaq,
      crypto,
      gold,
      silver,
      cash,
      bistCost,
      nasdaqCost,
      cryptoCost,
      goldCost,
      silverCost,
      cashCost,
      chartData,
      // USD karşılıkları
      bistUsd: bist / usdTryRate.rate,
      nasdaqUsd: nasdaq / usdTryRate.rate,
      cryptoUsd: crypto / usdTryRate.rate,
      goldUsd: gold / usdTryRate.rate,
      silverUsd: silver / usdTryRate.rate,
      cashUsd: cash / usdTryRate.rate,
      bistCostUsd: bistCost / usdTryRate.rate,
      nasdaqCostUsd: nasdaqCost / usdTryRate.rate,
      cryptoCostUsd: cryptoCost / usdTryRate.rate,
      goldCostUsd: goldCost / usdTryRate.rate,
      silverCostUsd: silverCost / usdTryRate.rate,
      cashCostUsd: cashCost / usdTryRate.rate
    }
  }

  const { 
    bist, nasdaq, crypto, gold, silver, cash,
    bistCost, nasdaqCost, cryptoCost, goldCost, silverCost, cashCost,
    chartData,
    bistUsd, nasdaqUsd, cryptoUsd, goldUsd, silverUsd, cashUsd,
    bistCostUsd, nasdaqCostUsd, cryptoCostUsd, goldCostUsd, silverCostUsd, cashCostUsd
  } = calculateInvestments()

  // Kar/Zarar yüzde hesaplama fonksiyonu
  const calculateProfitLoss = (current: number, cost: number) => {
    if (cost === 0) return null
    return ((current - cost) / cost) * 100
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (!activePortfolio) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Lütfen bir portföy seçin</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* USD/TRY Kur Göstergesi */}
      {usdTryRate && (
        <div className="flex justify-end">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <div className="text-sm">
              <span className="font-semibold text-blue-900">USD/TRY:</span>
              <span className="ml-2 text-blue-700">₺{usdTryRate.rate.toFixed(4)}</span>
              {fetchingRate && (
                <RefreshCw className="inline-block w-3 h-3 ml-2 animate-spin text-blue-600" />
              )}
            </div>
            {usdTryRate.cached && (
              <span className="text-xs text-blue-600">
                (Cache)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Yatırım Dağılımı Başlık */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Yatırım Dağılımı</h2>
        <p className="text-sm text-gray-600 mt-1">
          Varlıklarınızın kategorilere göre dağılımı
        </p>
      </div>

      {/* Yatırım Dağılımı Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* BIST */}
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <Landmark className="w-5 h-5 text-red-500" />
            {(() => {
              const profitLoss = calculateProfitLoss(bist, bistCost)
              return profitLoss !== null ? (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${profitLoss >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}%
                </span>
              ) : null
            })()}
          </div>
          <p className="text-sm text-gray-900 mb-2 font-semibold">BIST Yatırımı</p>
          {pricesLoading ? (
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-700 mb-1 font-medium">Güncel Değer</p>
                <p className="text-lg font-bold text-gray-900">
                  ₺{formatLargeNumber(bist)}
                </p>
                <p className="text-xs text-gray-700">
                  (${formatLargeNumberUSD(bistUsd || 0)})
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-700 mb-1 font-medium">Toplam Yatırım</p>
                <p className="text-sm font-semibold text-gray-800">
                  ₺{formatLargeNumber(bistCost)}
                </p>
                <p className="text-xs text-gray-700">
                  (${formatLargeNumberUSD(bistCostUsd || 0)})
                </p>
              </div>
            </div>
          )}
        </div>

        {/* NASDAQ */}
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <Globe className="w-5 h-5 text-blue-500" />
            {(() => {
              const profitLoss = calculateProfitLoss(nasdaq, nasdaqCost)
              return profitLoss !== null ? (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${profitLoss >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}%
                </span>
              ) : null
            })()}
          </div>
          <p className="text-sm text-gray-900 mb-2 font-semibold">NASDAQ Yatırımı</p>
          {pricesLoading ? (
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-700 mb-1 font-medium">Güncel Değer</p>
                <p className="text-lg font-bold text-gray-900">
                  ₺{formatLargeNumber(nasdaq)}
                </p>
                <p className="text-xs text-gray-700">
                  (${formatLargeNumberUSD(nasdaqUsd || 0)})
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-700 mb-1 font-medium">Toplam Yatırım</p>
                <p className="text-sm font-semibold text-gray-800">
                  ₺{formatLargeNumber(nasdaqCost)}
                </p>
                <p className="text-xs text-gray-700">
                  (${formatLargeNumberUSD(nasdaqCostUsd || 0)})
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Kripto */}
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <Bitcoin className="w-5 h-5 text-orange-500" />
            {(() => {
              const profitLoss = calculateProfitLoss(crypto, cryptoCost)
              return profitLoss !== null ? (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${profitLoss >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}%
                </span>
              ) : null
            })()}
          </div>
          <p className="text-sm text-gray-900 mb-2 font-semibold">Kripto Yatırımı</p>
          {pricesLoading ? (
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-700 mb-1 font-medium">Güncel Değer</p>
                <p className="text-lg font-bold text-gray-900">
                  ₺{formatLargeNumber(crypto)}
                </p>
                <p className="text-xs text-gray-700">
                  (${formatLargeNumberUSD(cryptoUsd || 0)})
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-700 mb-1 font-medium">Toplam Yatırım</p>
                <p className="text-sm font-semibold text-gray-800">
                  ₺{formatLargeNumber(cryptoCost)}
                </p>
                <p className="text-xs text-gray-700">
                  (${formatLargeNumberUSD(cryptoCostUsd || 0)})
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Altın */}
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            {(() => {
              const profitLoss = calculateProfitLoss(gold, goldCost)
              return profitLoss !== null ? (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${profitLoss >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}%
                </span>
              ) : null
            })()}
          </div>
          <p className="text-sm text-gray-900 mb-2 font-semibold">Altın Yatırımı</p>
          {pricesLoading ? (
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-700 mb-1 font-medium">Güncel Değer</p>
                <p className="text-lg font-bold text-gray-900">
                  ₺{formatLargeNumber(gold)}
                </p>
                <p className="text-xs text-gray-700">
                  (${formatLargeNumberUSD(goldUsd || 0)})
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-700 mb-1 font-medium">Toplam Yatırım</p>
                <p className="text-sm font-semibold text-gray-800">
                  ₺{formatLargeNumber(goldCost)}
                </p>
                <p className="text-xs text-gray-700">
                  (${formatLargeNumberUSD(goldCostUsd || 0)})
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Gümüş */}
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-gray-500">
          <div className="flex items-center justify-between mb-2">
            <Coins className="w-5 h-5 text-gray-500" />
            {(() => {
              const profitLoss = calculateProfitLoss(silver, silverCost)
              return profitLoss !== null ? (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${profitLoss >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}%
                </span>
              ) : null
            })()}
          </div>
          <p className="text-sm text-gray-900 mb-2 font-semibold">Gümüş Yatırımı</p>
          {pricesLoading ? (
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-700 mb-1 font-medium">Güncel Değer</p>
                <p className="text-lg font-bold text-gray-900">
                  ₺{formatLargeNumber(silver)}
                </p>
                <p className="text-xs text-gray-700">
                  (${formatLargeNumberUSD(silverUsd || 0)})
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-700 mb-1 font-medium">Toplam Yatırım</p>
                <p className="text-sm font-semibold text-gray-800">
                  ₺{formatLargeNumber(silverCost)}
                </p>
                <p className="text-xs text-gray-700">
                  (${formatLargeNumberUSD(silverCostUsd || 0)})
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Nakit */}
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            {(() => {
              const profitLoss = calculateProfitLoss(cash, cashCost)
              return profitLoss !== null ? (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${profitLoss >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}%
                </span>
              ) : null
            })()}
          </div>
          <p className="text-sm text-gray-900 mb-2 font-semibold">Nakit</p>
          {pricesLoading ? (
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-700 mb-1 font-medium">Güncel Değer</p>
                <p className="text-lg font-bold text-gray-900">
                  ₺{formatLargeNumber(cash)}
                </p>
                <p className="text-xs text-gray-700">
                  (${formatLargeNumberUSD(cashUsd || 0)})
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-700 mb-1 font-medium">Toplam Yatırım</p>
                <p className="text-sm font-semibold text-gray-800">
                  ₺{formatLargeNumber(cashCost)}
                </p>
                <p className="text-xs text-gray-700">
                  (${formatLargeNumberUSD(cashCostUsd || 0)})
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pasta Grafik */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dağılım Grafiği</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: unknown) => {
                  const e = entry as { name: string; percent: number }
                  return `${e.name}: ${(e.percent * 100).toFixed(1)}%`
                }}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `₺${formatLargeNumber(value)}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
