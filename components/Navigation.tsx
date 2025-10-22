'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PortfolioSelector from './PortfolioSelector'
import { 
  Home, 
  Briefcase, 
  BarChart3,
  Settings, 
  LogOut 
} from 'lucide-react'

const navigation = [
  { name: 'Ana Panel', href: '/', icon: Home },
  { name: 'Portföyüm', href: '/portfolio', icon: Briefcase },
  { name: 'Analiz', href: '/analysis', icon: BarChart3 },
  { name: 'Ayarlar', href: '/settings', icon: Settings },
]

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    // PRODUCTION MODE: Gerçek çıkış
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">
                Portföy Röntgeni
              </h1>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Portfolio Seçici */}
            <PortfolioSelector />
            
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış
            </button>
          </div>
        </div>
      </div>

      {/* Mobil menü */}
      <div className="sm:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
