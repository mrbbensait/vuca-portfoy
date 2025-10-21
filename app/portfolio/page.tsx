import Navigation from '@/components/Navigation'
import HoldingsList from '@/components/HoldingsList'
import TransactionsList from '@/components/TransactionsList'
import NotesList from '@/components/NotesList'
import { MOCK_USER_ID } from '@/lib/mock-data'

export default async function PortfolioPage() {
  // DEMO MODE: Sabit kullanıcı ID'si
  const userId = MOCK_USER_ID

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Portföyüm</h1>
          <p className="text-gray-600 mt-2">
            Varlıklarınızı yönetin, işlem geçmişinizi görüntüleyin ve notlarınızı ekleyin.
          </p>
        </div>

        <div className="space-y-8">
          {/* Varlıklar */}
          <HoldingsList userId={userId} />

          {/* İşlem Geçmişi */}
          <TransactionsList userId={userId} />

          {/* Notlar */}
          <NotesList userId={userId} />
        </div>
      </main>
    </div>
  )
}
