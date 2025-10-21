import Navigation from '@/components/Navigation'
import { getMockHoldings, getMockPriceHistory } from '@/lib/mock-data'
import {
  calculateAssetPerformance,
  calculateVolatility,
  calculateDiversificationScore,
  calculateReturns,
  calculatePortfolioScore,
  calculateCorrelationMatrix,
  calculateCashRatio,
  calculateRiskLevel,
  getCurrentPrice,
} from '@/lib/calculations'
import { Activity, PieChart, TrendingUp, Target, Shield } from 'lucide-react'
import CorrelationHeatmap from '@/components/CorrelationHeatmap'

export default async function AnalysisPage() {
  // DEMO MODE: Mock veriler kullanılıyor
  const { data: holdings } = await getMockHoldings()
  const { data: priceHistory } = await getMockPriceHistory()

  if (!holdings || holdings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Analiz için veri bulunmuyor. Önce portföyünüze varlık ekleyin.</p>
          </div>
        </main>
      </div>
    )
  }

  // Hesaplamalar
  const performances = holdings.map(h =>
    calculateAssetPerformance(h, getCurrentPrice(h.symbol, priceHistory || []))
  )

  const volatility = calculateVolatility(priceHistory || [], holdings)
  const diversificationScore = calculateDiversificationScore(performances)
  const returns = calculateReturns(priceHistory || [], holdings)
  const portfolioScore = calculatePortfolioScore(returns.monthly, volatility, diversificationScore)
  const cashRatio = calculateCashRatio(performances)
  const riskLevel = calculateRiskLevel(volatility, cashRatio)

  const symbols = [...new Set(holdings.map(h => h.symbol))]
  const correlationMatrix = calculateCorrelationMatrix(priceHistory || [], symbols)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Portföy Analizi</h1>
          <p className="text-gray-600 mt-2">
            Portföyünüzün risk, getiri ve çeşitlilik analizleri
          </p>
        </div>

        <div className="space-y-6">
          {/* Portföy Puanı Kartı */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Portföy Sağlık Skoru</h2>
                <p className="text-blue-100 text-sm">
                  Getiri, çeşitlilik ve risk faktörlerine göre hesaplanmıştır
                </p>
              </div>
              <div className="text-6xl font-bold">
                {portfolioScore.total}
                <span className="text-2xl">/100</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-sm opacity-90">Getiri Puanı</p>
                <p className="text-2xl font-bold">{portfolioScore.return_score}/40</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-sm opacity-90">Çeşitlilik Puanı</p>
                <p className="text-2xl font-bold">{portfolioScore.diversification_score}/30</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-sm opacity-90">Risk Puanı</p>
                <p className="text-2xl font-bold">{portfolioScore.volatility_score}/30</p>
              </div>
            </div>
          </div>

          {/* Detaylı Metrikler */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Volatilite */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Volatilite</h3>
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{volatility.toFixed(2)}%</p>
              <p className="text-xs text-gray-600 mt-2">
                Günlük fiyat değişimlerinin standart sapması
              </p>
            </div>

            {/* Çeşitlilik */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Çeşitlilik Skoru</h3>
                <PieChart className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{diversificationScore.toFixed(0)}/100</p>
              <p className="text-xs text-gray-600 mt-2">
                Varlık sayısı, dağılım dengesi ve tür çeşitliliği
              </p>
            </div>

            {/* Nakit Oranı */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Nakit Oranı</h3>
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{cashRatio.toFixed(1)}%</p>
              <p className="text-xs text-gray-600 mt-2">
                Portföydeki nakit pozisyon oranı
              </p>
            </div>

            {/* Risk Seviyesi */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Risk Düzeyi</h3>
                <Shield className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{riskLevel}</p>
              <p className="text-xs text-gray-600 mt-2">
                Volatilite ve nakit oranına göre
              </p>
            </div>
          </div>

          {/* Getiri İstikrarı */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Getiri İstikrarı
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Günlük Getiri</p>
                <p className={`text-2xl font-bold ${returns.daily >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {returns.daily >= 0 ? '+' : ''}{returns.daily.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Haftalık Getiri</p>
                <p className={`text-2xl font-bold ${returns.weekly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {returns.weekly >= 0 ? '+' : ''}{returns.weekly.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Aylık Getiri</p>
                <p className={`text-2xl font-bold ${returns.monthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {returns.monthly >= 0 ? '+' : ''}{returns.monthly.toFixed(2)}%
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Açıklama:</strong> Getiri istikrarı, portföyünüzün farklı zaman dilimlerinde 
                gösterdiği performansı ölçer. İstikrarlı getiri, uzun vadeli başarı için önemlidir.
              </p>
            </div>
          </div>

          {/* Korelasyon Isı Haritası */}
          {symbols.length >= 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Varlık Korelasyon Haritası
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Varlıklarınızın birbirleriyle olan ilişkisini gösterir. 
                Düşük korelasyon (mavi) daha iyi çeşitlendirme anlamına gelir.
              </p>
              <CorrelationHeatmap matrix={correlationMatrix} symbols={symbols} />
            </div>
          )}

          {/* Öneriler */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Portföy Önerileri</h3>
            <div className="space-y-3">
              {volatility > 5 && (
                <div className="flex items-start">
                  <div className="bg-orange-100 rounded-full p-2 mr-3">
                    <Activity className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Yüksek Volatilite</p>
                    <p className="text-sm text-gray-600">
                      Portföyünüz yüksek volatiliteye sahip. Daha stabil varlıklar ekleyerek riski azaltabilirsiniz.
                    </p>
                  </div>
                </div>
              )}
              
              {diversificationScore < 50 && (
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <PieChart className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Düşük Çeşitlilik</p>
                    <p className="text-sm text-gray-600">
                      Portföyünüz yeterince çeşitlendirilmemiş. Farklı sektör ve varlık türlerinden eklemeler yapabilirsiniz.
                    </p>
                  </div>
                </div>
              )}

              {cashRatio < 10 && (
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <Target className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Düşük Nakit Oranı</p>
                    <p className="text-sm text-gray-600">
                      Nakit pozisyonunuz düşük. Ani fırsatları değerlendirmek için nakit rezervi bulundurmanız önerilir.
                    </p>
                  </div>
                </div>
              )}

              {portfolioScore.total >= 80 && (
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Güçlü Portföy</p>
                    <p className="text-sm text-gray-600">
                      Portföyünüz sağlıklı bir yapıya sahip. Mevcut dengeyi korumaya devam edin.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
