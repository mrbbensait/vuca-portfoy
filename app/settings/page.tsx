import Navigation from '@/components/Navigation'
import { Settings as SettingsIcon, User, DollarSign } from 'lucide-react'
import ProfileSettings from '@/components/ProfileSettings'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: userProfile } = await supabase
    .from('users_public')
    .select('*')
    .eq('id', user.id)
    .single()

  const userEmail = user.email || 'email@example.com'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="w-6 h-6 mr-2 text-blue-600" />
            Ayarlar
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Profil ve tercihlerinizi yönetin
          </p>
        </div>

        <div className="space-y-6">
          {/* Profil Bilgileri */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Profil Bilgileri
            </h2>
            <ProfileSettings userId={user.id} userProfile={userProfile} userEmail={userEmail} />
          </div>

          {/* Para Birimi Ayarları */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Para Birimi
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Varsayılan Para Birimi
                </label>
                <select
                  disabled
                  value="TRY"
                  className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                >
                  <option value="TRY">TRY (₺)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  V1 sürümünde sadece TRY desteklenmektedir
                </p>
              </div>
            </div>
          </div>

          {/* Hesap Bilgileri */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hesap Bilgileri</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">E-posta:</span>
                <span className="font-medium text-gray-900">{userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hesap ID:</span>
                <span className="font-mono text-xs text-gray-900">{user.id}</span>
              </div>
            </div>
          </div>

          {/* Uygulama Bilgileri */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Portföy Röntgeni V1</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Özellikler:</strong> TR hisse, ABD hisse ve kripto varlıklarınızı tek yerden yönetin
              </p>
              <p>
                <strong>Analizler:</strong> Getiri, risk, volatilite, çeşitlilik ve korelasyon analizleri
              </p>
              <p>
                <strong>Raporlar:</strong> Aylık portföy raporları ve PDF çıktısı
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
