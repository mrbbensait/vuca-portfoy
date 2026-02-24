import Navigation from '@/components/Navigation'
import HoldingsList from '@/components/HoldingsList'
import InvestmentDistribution from '@/components/InvestmentDistribution'
import TransactionsList from '@/components/TransactionsList'
import NotesList from '@/components/NotesList'
import PortfolioAnnouncements from '@/components/PortfolioAnnouncements'
import { PortfolioProvider } from '@/lib/contexts/PortfolioContext'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PortfolioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <PortfolioProvider userId={user.id}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-3">
            <p className="text-sm text-gray-600">
              Varlıklarınızı yönetin, işlem geçmişinizi görüntüleyin ve notlarınızı ekleyin.
            </p>
          </div>

          <div className="space-y-6">
            {/* Varlıklar */}
            <HoldingsList userId={user.id} />

            {/* Yatırım Dağılımı */}
            <InvestmentDistribution userId={user.id} />

            {/* İşlem Geçmişi */}
            <TransactionsList userId={user.id} />

            {/* Notlar */}
            <NotesList userId={user.id} />

            {/* Duyurular (Sadece Public Portföyler) - En Alta */}
            <PortfolioAnnouncements userId={user.id} />
          </div>
        </main>
      </div>
    </PortfolioProvider>
  )
}
