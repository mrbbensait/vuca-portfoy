import Navigation from '@/components/Navigation'
import Dashboard from '@/components/Dashboard'

export default async function Home() {
  // DEMO MODE: Sabit demo kullanıcı ID'si
  const demoUserId = 'demo-user-12345'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard userId={demoUserId} />
      </main>
    </div>
  )
}
