import Navigation from '@/components/Navigation'
import PortfolioAnalysis from '@/components/PortfolioAnalysis'
import { PortfolioProvider } from '@/lib/contexts/PortfolioContext'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AnalysisPage() {
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Portföy Röntgeni</h1>
            <p className="text-sm text-gray-500 mt-1">
              Portföyünüzün detaylı analizi: değer, dağılım, performans, risk ve çeşitlendirme metrikleri.
            </p>
          </div>

          <PortfolioAnalysis userId={user.id} />
        </main>
      </div>
    </PortfolioProvider>
  )
}
