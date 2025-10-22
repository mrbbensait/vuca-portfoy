import Navigation from '@/components/Navigation'
import Dashboard from '@/components/Dashboard'
import { PortfolioProvider } from '@/lib/contexts/PortfolioContext'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <PortfolioProvider userId={user.id}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Dashboard userId={user.id} />
        </main>
      </div>
    </PortfolioProvider>
  )
}
