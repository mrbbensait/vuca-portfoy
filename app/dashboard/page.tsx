import Navigation from '@/components/Navigation'
import Dashboard from '@/components/Dashboard'
import { PortfolioProvider } from '@/lib/contexts/PortfolioContext'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: userProfile } = await supabase
    .from('users_public')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const displayName = userProfile?.display_name || user.email?.split('@')[0] || 'Kullanıcı'

  return (
    <PortfolioProvider userId={user.id}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Dashboard userId={user.id} displayName={displayName} />
        </main>
      </div>
    </PortfolioProvider>
  )
}
