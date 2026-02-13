'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  User, Calendar, Briefcase, Loader2, ArrowLeft,
  Globe, Lock, Compass
} from 'lucide-react'

interface ProfileData {
  id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

interface ProfilePortfolio {
  id: string
  name: string
  slug: string | null
  description: string | null
  is_public: boolean
  created_at: string
  holding_count: number
}

export default function ProfilePage() {
  const params = useParams()
  const userId = params.id as string

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [portfolios, setPortfolios] = useState<ProfilePortfolio[]>([])
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return
      setLoading(true)
      try {
        const res = await fetch(`/api/profile/${userId}`)
        const result = await res.json()

        if (!res.ok) {
          setError(result.error || 'Profil yüklenemedi')
          return
        }

        setProfile(result.data.profile)
        setPortfolios(result.data.portfolios)
        setIsOwnProfile(result.data.isOwnProfile)
      } catch {
        setError('Bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Profil yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">{error || 'Profil bulunamadı'}</h2>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 mt-4 text-sm text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Keşfet sayfasına dön
          </Link>
        </div>
      </div>
    )
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString('tr-TR', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/explore"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Keşfet
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/" className="text-xl font-bold text-blue-600">
                Portföy Röntgeni
              </Link>
            </div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Ana Panel
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profil Kartı */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-500" />
                  </div>
                )}
              </div>

              <div className="flex-1 pb-1">
                <h1 className="text-xl font-bold text-gray-900">
                  {profile.display_name || 'Anonim Kullanıcı'}
                </h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {memberSince}&apos;den beri üye
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {portfolios.length} public portföy
                  </span>
                </div>
              </div>

              {isOwnProfile && (
                <Link
                  href="/settings"
                  className="text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                >
                  Profili Düzenle
                </Link>
              )}
            </div>

            {profile.bio && (
              <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-2xl">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Public Portföyler */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            Public Portföyler
          </h2>
        </div>

        {portfolios.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Lock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">
              {isOwnProfile ? 'Henüz public portföyünüz yok' : 'Bu kullanıcının public portföyü yok'}
            </p>
            {isOwnProfile && (
              <p className="text-xs text-gray-400 mt-1">
                Portföy ayarlarından bir portföyü herkese açık yapabilirsiniz.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {portfolios.map(portfolio => {
              const href = portfolio.slug ? `/p/${portfolio.slug}` : '#'
              const createdDate = new Date(portfolio.created_at).toLocaleDateString('tr-TR', {
                month: 'short',
                year: 'numeric',
              })

              return (
                <Link
                  key={portfolio.id}
                  href={href}
                  className="group block bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:from-blue-600 group-hover:to-indigo-600 transition-colors" />
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {portfolio.name}
                    </h3>
                    {portfolio.description && (
                      <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{portfolio.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span className="font-medium">{portfolio.holding_count}</span> varlık
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400 ml-auto">
                        <Calendar className="w-3.5 h-3.5" />
                        {createdDate}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Keşfet CTA */}
        {!isOwnProfile && (
          <div className="mt-8 text-center">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Compass className="w-4 h-4" />
              Daha fazla portföy keşfet
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
