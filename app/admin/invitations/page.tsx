'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Mail,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Trash2,
  Eye,
  X,
} from 'lucide-react'

interface Invitation {
  id: string
  code: string
  label: string | null
  max_uses: number | null
  current_uses: number
  expires_at: string | null
  is_active: boolean
  created_at: string
  creator?: {
    email: string
    display_name: string | null
  }
}

interface InvitationsResponse {
  invitations: Invitation[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: {
    total_invitations: number
    active_invitations: number
    total_uses: number
    available_slots: number
  }
}

export default function AdminInvitationsPage() {
  const [data, setData] = useState<InvitationsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null)
  const [invitationToDelete, setInvitationToDelete] = useState<Invitation | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const fetchInvitations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/admin/invitations?${params}`)
      if (!res.ok) throw new Error('Davetler yüklenemedi')
      const json = await res.json()
      setData(json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, debouncedSearch])

  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations])

  const copyToClipboard = (code: string) => {
    const url = `${window.location.origin}/auth/register?invite=${code}`
    navigator.clipboard.writeText(url)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const confirmDelete = (invitation: Invitation) => {
    setInvitationToDelete(invitation)
    setShowDeleteModal(true)
  }

  const deleteInvitation = async () => {
    if (!invitationToDelete) return

    try {
      const res = await fetch(`/api/admin/invitations/${invitationToDelete.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('İptal işlemi başarısız')
      setShowDeleteModal(false)
      setInvitationToDelete(null)
      fetchInvitations()
    } catch (error) {
      alert('Davet iptal edilemedi')
    }
  }

  const getStatusBadge = (invitation: Invitation) => {
    if (!invitation.is_active) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
          <XCircle className="w-3 h-3" />
          İptal Edildi
        </span>
      )
    }

    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
          <Clock className="w-3 h-3" />
          Süresi Doldu
        </span>
      )
    }

    if (invitation.max_uses !== null && invitation.current_uses >= invitation.max_uses) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
          <CheckCircle className="w-3 h-3" />
          Dolu
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
        <CheckCircle className="w-3 h-3" />
        Aktif
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-600" />
            Davet Yönetimi
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Kayıt için gerekli davet linklerini oluşturun ve yönetin
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Yeni Davet Oluştur
        </button>
      </div>

      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Davet</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.total_invitations}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktif Davet</p>
                <p className="text-2xl font-bold text-green-600">{data.stats.active_invitations}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Kayıt</p>
                <p className="text-2xl font-bold text-purple-600">{data.stats.total_uses}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Boş Slot</p>
                <p className="text-2xl font-bold text-orange-600">
                  {data.stats.available_slots === -1 ? '∞' : data.stats.available_slots}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Etiket veya kod ara..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Tüm Davetler</option>
            <option value="active">Aktif</option>
            <option value="inactive">İptal Edilmiş</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : !data?.invitations.length ? (
          <div className="p-12 text-center text-gray-500">
            Davet bulunamadı
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Etiket/Kod
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kullanım
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Durum
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Oluşturan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tarih
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.invitations.map((invitation) => (
                    <tr key={invitation.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          {invitation.label && (
                            <div className="text-sm font-medium text-gray-900">
                              {invitation.label}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 font-mono">
                            {invitation.code}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="text-sm text-gray-900">
                              {invitation.current_uses} / {invitation.max_uses ?? '∞'}
                            </div>
                            {invitation.max_uses !== null && (
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full"
                                  style={{
                                    width: `${Math.min(100, (invitation.current_uses / invitation.max_uses) * 100)}%`,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(invitation)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {invitation.creator?.display_name || invitation.creator?.email || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">
                          {new Date(invitation.created_at).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedInvitationId(invitation.id)
                              setShowDetailModal(true)
                            }}
                            className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded"
                            title="Detayları görüntüle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(invitation.code)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Linki kopyala"
                          >
                            {copiedCode === invitation.code ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          {invitation.is_active && (
                            <button
                              onClick={() => confirmDelete(invitation)}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                              title="İptal et"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {data.pagination.total} davetten {((page - 1) * 20) + 1}-
                  {Math.min(page * 20, data.pagination.total)} arası gösteriliyor
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Sayfa {page} / {data.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showCreateModal && (
        <CreateInvitationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchInvitations()
          }}
        />
      )}

      {showDetailModal && selectedInvitationId && (
        <InvitationDetailModal
          invitationId={selectedInvitationId}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedInvitationId(null)
          }}
        />
      )}

      {showDeleteModal && invitationToDelete && (
        <DeleteConfirmModal
          invitation={invitationToDelete}
          onConfirm={deleteInvitation}
          onCancel={() => {
            setShowDeleteModal(false)
            setInvitationToDelete(null)
          }}
        />
      )}
    </div>
  )
}

function CreateInvitationModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [label, setLabel] = useState('')
  const [maxUses, setMaxUses] = useState<'1' | '10' | '50' | 'unlimited'>('1')
  const [expiresAt, setExpiresAt] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdInvitation, setCreatedInvitation] = useState<Invitation | null>(null)

  const handleCreate = async () => {
    setCreating(true)
    setError(null)

    try {
      const body: any = { label }
      
      if (maxUses !== 'unlimited') {
        body.max_uses = parseInt(maxUses)
      }
      
      if (expiresAt) {
        body.expires_at = new Date(expiresAt).toISOString()
      }

      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Davet oluşturulamadı')
      }

      setCreatedInvitation(data.invitation)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const copyLink = () => {
    if (createdInvitation) {
      const url = `${window.location.origin}/auth/register?invite=${createdInvitation.code}`
      navigator.clipboard.writeText(url)
    }
  }

  if (createdInvitation) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Davet Oluşturuldu!</h3>
            <p className="text-sm text-gray-600 mt-1">
              Aşağıdaki linki paylaşabilirsiniz
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <div className="text-xs text-gray-600 mb-1">Davet Linki:</div>
            <div className="text-sm font-mono text-gray-900 break-all">
              {window.location.origin}/auth/register?invite={createdInvitation.code}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Linki Kopyala
            </button>
            <button
              onClick={onSuccess}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Yeni Davet Oluştur</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Etiket (Opsiyonel)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Örn: Instagram - Influencer Ahmet"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Bu daveti tanımlamak için bir not ekleyin
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kullanım Limiti
            </label>
            <select
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="1">1 Kişilik</option>
              <option value="10">10 Kişilik</option>
              <option value="50">50 Kişilik</option>
              <option value="unlimited">Sınırsız</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Son Kullanma Tarihi (Opsiyonel)
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Oluşturuluyor...' : 'Oluştur'}
          </button>
          <button
            onClick={onClose}
            disabled={creating}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmModal({
  invitation,
  onConfirm,
  onCancel,
}: {
  invitation: Invitation
  onConfirm: () => void
  onCancel: () => void
}) {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    setDeleting(true)
    await onConfirm()
    setDeleting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Daveti İptal Et</h3>
            <p className="text-sm text-gray-600">Bu işlem geri alınamaz</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 mb-3">
            Aşağıdaki daveti iptal etmek istediğinizden emin misiniz?
          </p>
          <div className="space-y-2 text-sm">
            {invitation.label && (
              <div>
                <span className="text-gray-600">Etiket:</span>
                <span className="font-medium text-gray-900 ml-2">{invitation.label}</span>
              </div>
            )}
            <div>
              <span className="text-gray-600">Kod:</span>
              <span className="font-mono font-medium text-gray-900 ml-2">{invitation.code}</span>
            </div>
            <div>
              <span className="text-gray-600">Kullanım:</span>
              <span className="font-medium text-gray-900 ml-2">
                {invitation.current_uses} / {invitation.max_uses ?? '∞'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>Not:</strong> Davet iptal edilecek ve artık kullanılamayacak. 
            Ancak daha önce bu davetle kayıt olanlar etkilenmeyecek.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Vazgeç
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'İptal Ediliyor...' : 'Evet, İptal Et'}
          </button>
        </div>
      </div>
    </div>
  )
}

function InvitationDetailModal({
  invitationId,
  onClose,
}: {
  invitationId: string
  onClose: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    invitation: Invitation & { creator: { email: string; display_name: string | null } | null }
    uses: Array<{
      id: string
      used_at: string
      user: {
        id: string
        email: string | null
        display_name: string | null
        created_at: string | null
      }
    }>
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/admin/invitations/${invitationId}`)
        if (!res.ok) throw new Error('Detaylar yüklenemedi')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [invitationId])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Davet Detayları</h3>
              <p className="text-sm text-gray-500">Bu davetle kayıt olan kullanıcılar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {data && (
            <div className="space-y-6">
              {/* Davet Bilgileri */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Davet Bilgileri</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Etiket:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {data.invitation.label || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Kod:</span>
                    <p className="font-mono font-medium text-gray-900 mt-1">
                      {data.invitation.code}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Kullanım:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {data.invitation.current_uses} / {data.invitation.max_uses ?? '∞'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Durum:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {data.invitation.is_active ? 'Aktif' : 'İptal Edildi'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Oluşturan:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {data.invitation.creator?.display_name || data.invitation.creator?.email || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Oluşturma Tarihi:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {new Date(data.invitation.created_at).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Kullanıcı Listesi */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Kayıt Olan Kullanıcılar ({data.uses.length})
                </h4>
                
                {data.uses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Henüz bu davetle kimse kayıt olmamış</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Kullanıcı
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            E-posta
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Kayıt Tarihi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {data.uses.map((use) => (
                          <tr key={use.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {use.user.display_name || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {use.user.email || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(use.used_at).toLocaleString('tr-TR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}
