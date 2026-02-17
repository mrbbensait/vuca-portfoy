'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Shield,
  Briefcase,
  ArrowLeftRight,
  Package,
  ArrowUpDown,
} from 'lucide-react'

interface UserRow {
  id: string
  display_name: string | null
  base_currency: string
  bio: string | null
  is_profile_public: boolean
  created_at: string
  portfolio_count: number
  holding_count: number
  transaction_count: number
  roles: { slug: string; name: string }[]
}

interface UsersResponse {
  users: UserRow[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sort: sortBy,
        dir: sortDir,
      })
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error('Kullanıcılar yüklenemedi')
      const json = await res.json()
      setData(json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page, sortBy, sortDir, debouncedSearch])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  function handleSort(field: string) {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortDir('desc')
    }
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Başlık + Arama */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Kullanıcı Yönetimi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {data ? `Toplam ${data.total} kullanıcı` : 'Yükleniyor...'}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="İsim ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-72"
          />
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  <button
                    onClick={() => handleSort('display_name')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Kullanıcı
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">
                  <span className="flex items-center justify-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" /> Portföy
                  </span>
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">
                  <span className="flex items-center justify-center gap-1">
                    <Package className="w-3.5 h-3.5" /> Holding
                  </span>
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">
                  <span className="flex items-center justify-center gap-1">
                    <ArrowLeftRight className="w-3.5 h-3.5" /> İşlem
                  </span>
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Profil</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Kayıt Tarihi
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                  </td>
                </tr>
              ) : data && data.users.length > 0 ? (
                data.users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {user.display_name || 'İsimsiz'}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {user.roles.length > 0 ? (
                        user.roles.map((r) => (
                          <span
                            key={r.slug}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 rounded-full"
                          >
                            <Shield className="w-3 h-3" />
                            {r.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">user</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      {user.portfolio_count}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      {user.holding_count}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      {user.transaction_count}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                          user.is_profile_public
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {user.is_profile_public ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(user.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Kullanıcı bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">
              {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} / {data.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                {page} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
