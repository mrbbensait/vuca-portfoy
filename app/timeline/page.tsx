import Navigation from '@/components/Navigation'
import PortfolioValueChart from '@/components/PortfolioValueChart'
import { Clock } from 'lucide-react'
import { getMockHoldings, getMockPriceHistory } from '@/lib/mock-data'

export default async function TimelinePage() {
  const { data: holdings } = await getMockHoldings()
  const { data: priceHistory } = await getMockPriceHistory()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Clock className="w-8 h-8 mr-3 text-blue-600" />
            Zaman Çizelgesi
          </h1>
          <p className="text-gray-600 mt-2">
            Portföy değerinizin zaman içindeki değişimini görüntüleyin
          </p>
        </div>

        {!holdings || holdings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Zaman çizelgesi için veri bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <PortfolioValueChart 
              holdings={holdings} 
              priceHistory={priceHistory || []} 
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Bilgi</h3>
              <p className="text-sm text-blue-800">
                Grafik, portföyünüzdeki mevcut varlıkların geçmiş fiyat hareketlerine göre 
                hesaplanmıştır. Geçmişte satılan veya eklenmeyen varlıklar dikkate alınmamıştır.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
