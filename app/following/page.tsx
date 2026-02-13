import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PortfolioProvider } from '@/lib/contexts/PortfolioContext'
import Navigation from '@/components/Navigation'
import FollowingClient from './FollowingClient'

export default async function FollowingPage() {
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
          <FollowingClient />
        </main>
      </div>
    </PortfolioProvider>
  )
}
