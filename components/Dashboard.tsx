import { 
  calculateAssetPerformance, 
  calculateDistribution, 
  calculateReturns, 
  calculatePortfolioScore,
  calculateDiversificationScore,
  calculateVolatility,
  getCurrentPrice 
} from '@/lib/calculations'
import { TrendingUp, TrendingDown, PieChart, Award } from 'lucide-react'
import DistributionChart from './DistributionChart'
import { getMockHoldings, getMockPriceHistory } from '@/lib/mock-data'

interface DashboardProps {
  userId: string
}

export default async function Dashboard({}: DashboardProps) {
  // DEMO MODE: Mock veriler kullanılıyor
  const { data: holdings } = await getMockHoldings()
  const { data: priceHistory } = await getMockPriceHistory()

  // Hesaplamalar
  const performances = holdings.map(h => 
    calculateAssetPerformance(h, getCurrentPrice(h.symbol, priceHistory || []))
  )

  const totalValue = performances.reduce((sum, p) => sum + p.current_value, 0)
  const totalCost = performances.reduce((sum, p) => sum + p.cost_basis, 0)
  const totalProfitLoss = totalValue - totalCost
  const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0

  const returns = calculateReturns(priceHistory || [], holdings)
  const distribution = calculateDistribution(performances)
  const volatility = calculateVolatility(priceHistory || [], holdings)
  const diversificationScore = calculateDiversificationScore(performances)
  const portfolioScore = calculatePortfolioScore(returns.monthly, volatility, diversificationScore)

  // En iyi ve en kötü 5 varlık
  const sortedByPerformance = [...performances].sort((a, b) => 
    b.profit_loss_percent - a.profit_loss_percent
  )
  const top5 = sortedByPerformance.slice(0, 5)
  const bottom5 = sortedByPerformance.slice(-5).reverse()

  return (
    <div className="space-y-6">
      {/* Üst Başlık */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Ana Panel</h1>
        <div className="text-sm text-gray-500 px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
          🎯 DEMO MODE - Örnek Veriler
        </div>
      </div>

      {/* Portföy Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Toplam Değer */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Toplam Portföy Değeri</h3>
          <p className="text-3xl font-bold text-gray-900">
            ₺{totalValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
          </p>
          <div className={`flex items-center mt-2 ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalProfitLoss >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            <span className="text-sm font-medium">
              {totalProfitLossPercent >= 0 ? '+' : ''}
              {totalProfitLossPercent.toFixed(2)}% 
              (₺{totalProfitLoss.toLocaleString('tr-TR', { maximumFractionDigits: 0 })})
            </span>
          </div>
        </div>

        {/* Günlük Getiri */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Günlük Getiri</h3>
          <p className={`text-3xl font-bold ${returns.daily >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {returns.daily >= 0 ? '+' : ''}{returns.daily.toFixed(2)}%
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>Haftalık: {returns.weekly >= 0 ? '+' : ''}{returns.weekly.toFixed(2)}%</span>
          </div>
        </div>

        {/* Aylık Getiri */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Aylık Getiri</h3>
          <p className={`text-3xl font-bold ${returns.monthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {returns.monthly >= 0 ? '+' : ''}{returns.monthly.toFixed(2)}%
          </p>
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <span>Volatilite: {volatility.toFixed(2)}%</span>
          </div>
        </div>

        {/* Portföy Sağlık Skoru */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2 flex items-center">
            <Award className="w-4 h-4 mr-1" />
            Portföy Sağlık Skoru
          </h3>
          <p className="text-4xl font-bold">
            {portfolioScore.total}/100
          </p>
          <div className="mt-2 text-xs opacity-90">
            Getiri: {portfolioScore.return_score}/40 • 
            Çeşitlilik: {portfolioScore.diversification_score}/30 • 
            Risk: {portfolioScore.volatility_score}/30
          </div>
        </div>
      </div>

      {/* Dağılım ve Performans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dağılım Grafiği */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Varlık Dağılımı
          </h3>
          <DistributionChart distribution={distribution} />
        </div>

        {/* En İyi 5 Varlık */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center text-green-600">
            <TrendingUp className="w-5 h-5 mr-2" />
            En İyi 5 Varlık
          </h3>
          <div className="space-y-3">
            {top5.map(asset => (
              <div key={asset.symbol} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{asset.symbol}</p>
                  <p className="text-xs text-gray-500">{asset.asset_type}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    +{asset.profit_loss_percent.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    ₺{asset.current_value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* En Zayıf 5 Varlık */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center text-red-600">
          <TrendingDown className="w-5 h-5 mr-2" />
          En Zayıf 5 Varlık
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {bottom5.map(asset => (
            <div key={asset.symbol} className="border border-gray-200 rounded-lg p-4">
              <p className="font-medium text-gray-900 mb-1">{asset.symbol}</p>
              <p className="text-xs text-gray-500 mb-2">{asset.asset_type}</p>
              <p className="font-semibold text-red-600">
                {asset.profit_loss_percent.toFixed(2)}%
              </p>
              <p className="text-xs text-gray-500">
                ₺{asset.current_value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
