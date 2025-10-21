import Navigation from '@/components/Navigation'
import { Bell } from 'lucide-react'
import AlertsList from '@/components/AlertsList'
import AddAlertButton from '@/components/AddAlertButton'
import { MOCK_USER_ID, getMockPortfolio } from '@/lib/mock-data'

export default async function AlertsPage() {
  // DEMO MODE: Mock veriler kullanılıyor
  const userId = MOCK_USER_ID
  const { data: portfolio } = await getMockPortfolio()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Bell className="w-8 h-8 mr-3 text-blue-600" />
              Uyarılar
            </h1>
            <p className="text-gray-600 mt-2">
              Hedef fiyat ve portföy değişim uyarılarınızı yönetin
            </p>
          </div>
          <AddAlertButton userId={userId} portfolioId={portfolio?.id} />
        </div>

        <AlertsList userId={userId} />
      </main>
    </div>
  )
}
