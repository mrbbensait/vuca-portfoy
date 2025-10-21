import Navigation from '@/components/Navigation'
import HoldingsList from '@/components/HoldingsList'
import TransactionsList from '@/components/TransactionsList'
import NotesList from '@/components/NotesList'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PortfolioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

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
          <HoldingsList userId={user.id} />

          {/* İşlem Geçmişi */}
          <TransactionsList userId={user.id} />

          {/* Notlar */}
          <NotesList userId={user.id} />
        </div>
      </main>
    </div>
  )
}
