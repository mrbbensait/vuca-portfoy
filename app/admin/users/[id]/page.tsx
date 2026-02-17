'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Shield,
  Briefcase,
  Package,
  ArrowLeftRight,
  Calendar,
  Clock,
  Globe,
  Lock,
  Loader2,
  Plus,
  X,
} from 'lucide-react'

interface UserDetail {
  profile: {
    id: string
    display_name: string | null
    base_currency: string
    bio: string | null
    is_profile_public: boolean
    created_at: string
  }
  email: string | null
  lastSignIn: string | null
  portfolios: {
    id: string
    name: string
    is_public: boolean
    slug: string | null
    follower_count: number
    created_at: string
  }[]
  holdings: {
    id: string
    symbol: string
    asset_type: string
    quantity: number
    avg_price: number
    updated_at: string
  }[]
  transactions: {
    id: string
    symbol: string
    asset_type: string
    side: string
    quantity: number
    price: number
    fee: number | null
    date: string
    note: string | null
  }[]
  roles: {
    id: string
    slug: string
    name: string
    assigned_at: string
  }[]
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  TR_STOCK: 'BIST',
  US_STOCK: 'ABD',
  CRYPTO: 'Kripto',
  CASH: 'Nakit',
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [data, setData] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'portfolios' | 'holdings' | 'transactions'>('portfolios')
  const [roleAction, setRoleAction] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/admin/users/${id}`)
        if (!res.ok) throw new Error('Kullanıcı bulunamadı')
        setData(await res.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Hata')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id])

  async function handleRoleAction(action: 'assign_role' | 'remove_role', roleSlug: string) {
    setRoleAction(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, roleSlug }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Hata oluştu')
        return
      }
      // Sayfayı yenile
      const refreshRes = await fetch(`/api/admin/users/${id}`)
      if (refreshRes.ok) setData(await refreshRes.json())
    } finally {
      setRoleAction(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href="/admin/users" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Kullanıcılara Dön
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Kullanıcı bulunamadı'}
        </div>
      </div>
    )
  }

  const { profile, email, lastSignIn, portfolios, holdings, transactions, roles } = data

  const tabs = [
    { key: 'portfolios' as const, label: 'Portföyler', count: portfolios.length, icon: Briefcase },
    { key: 'holdings' as const, label: 'Holdings', count: holdings.length, icon: Package },
    { key: 'transactions' as const, label: 'İşlemler', count: transactions.length, icon: ArrowLeftRight },
  ]

  return (
    <div className="space-y-6">
      {/* Geri butonu */}
      <Link href="/admin/users" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Kullanıcılara Dön
      </Link>

      {/* Profil Kartı */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {profile.display_name || 'İsimsiz'}
              </h1>
              {email && <p className="text-sm text-gray-500">{email}</p>}
              {profile.bio && (
                <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Kayıt: {new Date(profile.created_at).toLocaleDateString('tr-TR')}
                </span>
                {lastSignIn && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Son giriş: {new Date(lastSignIn).toLocaleDateString('tr-TR')}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  {profile.is_profile_public ? (
                    <><Globe className="w-3.5 h-3.5 text-green-500" /> Public</>
                  ) : (
                    <><Lock className="w-3.5 h-3.5" /> Private</>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Roller */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap gap-1">
              {roles.length > 0 ? (
                roles.map((r) => (
                  <span
                    key={r.slug}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-full"
                  >
                    <Shield className="w-3 h-3" />
                    {r.name}
                    <button
                      onClick={() => handleRoleAction('remove_role', r.slug)}
                      disabled={roleAction}
                      className="ml-1 hover:text-red-900"
                      title="Rolü kaldır"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">Normal kullanıcı</span>
              )}
            </div>
            <button
              onClick={() => handleRoleAction('assign_role', 'super_admin')}
              disabled={roleAction || roles.some((r) => r.slug === 'super_admin')}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {roleAction ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Plus className="w-3 h-3" />
              )}
              Super Admin Yap
            </button>
          </div>
        </div>

        {/* İstatistik Mini Kartlar */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{portfolios.length}</p>
            <p className="text-xs text-gray-500">Portföy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{holdings.length}</p>
            <p className="text-xs text-gray-500">Aktif Holding</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            <p className="text-xs text-gray-500">İşlem</p>
          </div>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-4">
          {activeTab === 'portfolios' && (
            <div className="space-y-2">
              {portfolios.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Portföy yok</p>
              ) : (
                portfolios.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400">
                        {p.slug && `/${p.slug} · `}
                        {new Date(p.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.is_public ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {p.is_public ? 'Public' : 'Private'}
                      </span>
                      {p.follower_count > 0 && (
                        <span className="text-xs text-gray-400">{p.follower_count} takipçi</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'holdings' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 text-xs uppercase tracking-wider">
                    <th className="pb-2 font-medium">Sembol</th>
                    <th className="pb-2 font-medium">Tip</th>
                    <th className="pb-2 font-medium text-right">Miktar</th>
                    <th className="pb-2 font-medium text-right">Ort. Fiyat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {holdings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400">
                        Holding yok
                      </td>
                    </tr>
                  ) : (
                    holdings.map((h) => (
                      <tr key={h.id}>
                        <td className="py-2 font-medium text-gray-900">{h.symbol}</td>
                        <td className="py-2">
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                            {ASSET_TYPE_LABELS[h.asset_type] || h.asset_type}
                          </span>
                        </td>
                        <td className="py-2 text-right text-gray-700">
                          {h.quantity.toLocaleString('tr-TR')}
                        </td>
                        <td className="py-2 text-right text-gray-700">
                          {h.avg_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 text-xs uppercase tracking-wider">
                    <th className="pb-2 font-medium">Tarih</th>
                    <th className="pb-2 font-medium">Sembol</th>
                    <th className="pb-2 font-medium">İşlem</th>
                    <th className="pb-2 font-medium text-right">Miktar</th>
                    <th className="pb-2 font-medium text-right">Fiyat</th>
                    <th className="pb-2 font-medium text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">
                        İşlem yok
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr key={t.id}>
                        <td className="py-2 text-gray-500 text-xs">
                          {new Date(t.date).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-2 font-medium text-gray-900">{t.symbol}</td>
                        <td className="py-2">
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                            t.side === 'BUY'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {t.side === 'BUY' ? 'ALIŞ' : 'SATIŞ'}
                          </span>
                        </td>
                        <td className="py-2 text-right text-gray-700">
                          {t.quantity.toLocaleString('tr-TR')}
                        </td>
                        <td className="py-2 text-right text-gray-700">
                          {t.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 text-right font-medium text-gray-900">
                          {(t.quantity * t.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
