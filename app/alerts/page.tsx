import Navigation from '@/components/Navigation'
import { Bell } from 'lucide-react'
import AlertsList from '@/components/AlertsList'
import AddAlertButton from '@/components/AddAlertButton'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AlertsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', user.id)
    .single()

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
          <AddAlertButton userId={user.id} portfolioId={portfolio?.id} />
        </div>

        <AlertsList userId={user.id} />
      </main>
    </div>
  )
}
