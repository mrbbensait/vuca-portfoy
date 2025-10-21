import Navigation from '@/components/Navigation'
import { getMockHoldings, getMockPriceHistory, getMockTransactions, getMockPortfolio } from '@/lib/mock-data'
import { 
  calculateAssetPerformance, 
  calculateDistribution,
  calculateReturns,
  calculatePortfolioScore,
  calculateVolatility,
  calculateDiversificationScore,
  getCurrentPrice 
} from '@/lib/calculations'
import { FileText } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import PDFDownloadButton from '@/components/PDFDownloadButton'

export default async function ReportsPage() {
  // DEMO MODE: Mock veriler kullanılıyor
  const { data: portfolio } = await getMockPortfolio()
  const { data: holdings } = await getMockHoldings()
  const { data: priceHistory } = await getMockPriceHistory()
  const { data: transactions } = await getMockTransactions()

  if (!holdings || holdings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Rapor oluşturmak için veri bulunmuyor.</p>
          </div>
        </main>
      </div>
    )
  }

  // Hesaplamalar
  const performances = holdings.map(h =>
    calculateAssetPerformance(h, getCurrentPrice(h.symbol, priceHistory || []))
  )

  const totalValue = performances.reduce((sum, p) => sum + p.current_value, 0)
  const totalCost = performances.reduce((sum, p) => sum + p.cost_basis, 0)
  const totalProfitLoss = totalValue - totalCost

  const distribution = calculateDistribution(performances)
  const returns = calculateReturns(priceHistory || [], holdings)
  const volatility = calculateVolatility(priceHistory || [], holdings)
  const diversificationScore = calculateDiversificationScore(performances)
  const portfolioScore = calculatePortfolioScore(returns.monthly, volatility, diversificationScore)

  const reportData = {
    date: format(new Date(), 'dd MMMM yyyy', { locale: tr }),
    portfolioName: portfolio?.name || 'Portföy',
    totalValue,
    totalCost,
    totalProfitLoss,
    profitLossPercent: totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0,
    returns,
    volatility,
    diversificationScore,
    portfolioScore,
    distribution,
    holdings: performances,
    recentTransactions: transactions || [],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-blue-600" />
              Aylık Portföy Raporu
            </h1>
            <p className="text-gray-600 mt-2">
              {reportData.date} • {reportData.portfolioName}
            </p>
          </div>
          <PDFDownloadButton reportData={reportData} />
        </div>

        <div className="space-y-6">
          {/* Özet Kartlar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Toplam Portföy Değeri</h3>
              <p className="text-3xl font-bold text-gray-900">
                ₺{totalValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Toplam Kar/Zarar</h3>
              <p className={`text-3xl font-bold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfitLoss >= 0 ? '+' : ''}₺{totalProfitLoss.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </p>
              <p className={`text-sm mt-1 ${reportData.profitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reportData.profitLossPercent >= 0 ? '+' : ''}{reportData.profitLossPercent.toFixed(2)}%
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">Portföy Sağlık Skoru</h3>
              <p className="text-3xl font-bold">
                {portfolioScore.total}/100
              </p>
            </div>
          </div>

          {/* Performans Özeti */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Performans Özeti</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Günlük Getiri</p>
                <p className={`text-xl font-bold ${returns.daily >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {returns.daily >= 0 ? '+' : ''}{returns.daily.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Haftalık Getiri</p>
                <p className={`text-xl font-bold ${returns.weekly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {returns.weekly >= 0 ? '+' : ''}{returns.weekly.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Aylık Getiri</p>
                <p className={`text-xl font-bold ${returns.monthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {returns.monthly >= 0 ? '+' : ''}{returns.monthly.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Volatilite</p>
                <p className="text-xl font-bold text-gray-900">{volatility.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          {/* Varlık Dağılımı */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Varlık Dağılımı</h2>
            <div className="space-y-3">
              {distribution.map(d => (
                <div key={d.asset_type} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <span className="font-medium text-gray-900 w-32">
                      {d.asset_type === 'TR_STOCK' ? 'TR Hisse' :
                       d.asset_type === 'US_STOCK' ? 'ABD Hisse' :
                       d.asset_type === 'CRYPTO' ? 'Kripto' : 'Nakit'}
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-600 h-4 rounded-full"
                          style={{ width: `${d.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right w-40">
                    <span className="font-bold text-gray-900">{d.percentage.toFixed(1)}%</span>
                    <span className="text-sm text-gray-500 ml-2">
                      (₺{d.value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* En İyi Performans Gösteren Varlıklar */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Varlık Detayları</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sembol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tür</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Miktar</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Değer</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Kar/Zarar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {performances.map(p => (
                    <tr key={p.symbol}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.symbol}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.asset_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{p.quantity.toLocaleString('tr-TR')}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        ₺{p.current_value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium text-right ${
                        p.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {p.profit_loss >= 0 ? '+' : ''}₺{p.profit_loss.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                        <span className="text-xs ml-1">
                          ({p.profit_loss_percent >= 0 ? '+' : ''}{p.profit_loss_percent.toFixed(2)}%)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Son İşlemler */}
          {transactions && transactions.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Son İşlemler</h2>
              <div className="space-y-2">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <span className="font-medium text-gray-900">{tx.symbol}</span>
                      <span className={`ml-2 text-sm ${tx.side === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.side === 'BUY' ? 'ALIŞ' : 'SATIŞ'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">{tx.quantity} × ₺{tx.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(tx.date), 'dd MMM yyyy', { locale: tr })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
