'use client'

import { useState, useEffect } from 'react'
import {
  MessageSquare,
  Loader2,
  Filter,
  ChevronDown,
  ExternalLink,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Trash2,
} from 'lucide-react'

interface Feedback {
  id: string
  user_id: string | null
  type: 'bug' | 'feature_request' | 'improvement' | 'other'
  category: string | null
  title: string
  description: string
  screenshot_url: string | null
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'in_review' | 'planned' | 'in_progress' | 'resolved' | 'wont_fix'
  admin_notes: string | null
  page_url: string | null
  user_agent: string | null
  user_email: string | null
  created_at: string
  updated_at: string
  user?: {
    id: string
    display_name: string | null
    email: string | null
  }
}

interface Stats {
  unresolved_count: number
  last_7_days_count: number
  critical_count: number
  total_count: number
  unique_users: number
}

const TYPE_LABELS = {
  bug: '🐛 Hata',
  feature_request: '✨ Özellik',
  improvement: '📈 İyileştirme',
  other: '💬 Diğer',
}

const STATUS_LABELS = {
  new: 'Yeni',
  in_review: 'İnceleniyor',
  planned: 'Planlandı',
  in_progress: 'Devam Ediyor',
  resolved: 'Çözüldü',
  wont_fix: 'Yapılmayacak',
}

const PRIORITY_LABELS = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  critical: 'Kritik',
}

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

const STATUS_COLORS = {
  new: 'bg-purple-100 text-purple-700',
  in_review: 'bg-blue-100 text-blue-700',
  planned: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  wont_fix: 'bg-gray-100 text-gray-700',
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [filterPriority, setFilterPriority] = useState<string>('')
  const [updating, setUpdating] = useState(false)

  const fetchFeedbacks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.append('status', filterStatus)
      if (filterType) params.append('type', filterType)
      if (filterPriority) params.append('priority', filterPriority)

      const res = await fetch(`/api/admin/feedback?${params}`)
      if (!res.ok) throw new Error('Yükleme başarısız')
      const data = await res.json()
      setFeedbacks(data.data || [])
      setStats(data.stats)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedbacks()
  }, [filterStatus, filterType, filterPriority])

  const handleUpdateFeedback = async (id: string, updates: Partial<Feedback>) => {
    setUpdating(true)
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })

      if (!res.ok) throw new Error('Güncelleme başarısız')

      await fetchFeedbacks()
      if (selectedFeedback?.id === id) {
        setSelectedFeedback((prev) => (prev ? { ...prev, ...updates } : null))
      }
    } catch (error) {
      console.error('Update error:', error)
      alert('Güncelleme başarısız')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu geri bildirimi silmek istediğinizden emin misiniz?')) return

    try {
      const res = await fetch(`/api/admin/feedback?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Silme başarısız')
      await fetchFeedbacks()
      if (selectedFeedback?.id === id) {
        setSelectedFeedback(null)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Silme başarısız')
    }
  }

  if (loading && feedbacks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Geri Bildirimler</h1>
        <p className="text-sm text-gray-500 mt-1">Beta kullanıcı geri bildirimleri</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <StatCard icon={MessageSquare} label="Toplam" value={stats.total_count} color="blue" />
          <StatCard icon={Clock} label="Çözülmemiş" value={stats.unresolved_count} color="orange" />
          <StatCard icon={AlertTriangle} label="Kritik" value={stats.critical_count} color="red" />
          <StatCard icon={Calendar} label="Son 7 Gün" value={stats.last_7_days_count} color="purple" />
          <StatCard icon={User} label="Kullanıcı" value={stats.unique_users} color="green" />
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tüm Durumlar</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tüm Tipler</option>
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tüm Öncelikler</option>
              {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {(filterStatus || filterType || filterPriority) && (
              <button
                onClick={() => {
                  setFilterStatus('')
                  setFilterType('')
                  setFilterPriority('')
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {feedbacks.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Geri bildirim bulunamadı</div>
          ) : (
            feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                onClick={() => setSelectedFeedback(feedback)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{feedback.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[feedback.priority]}`}>
                        {PRIORITY_LABELS[feedback.priority]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{feedback.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>{TYPE_LABELS[feedback.type]}</span>
                      <span>•</span>
                      <span>{feedback.user?.display_name || feedback.user_email || 'Anonim'}</span>
                      <span>•</span>
                      <span>{new Date(feedback.created_at).toLocaleDateString('tr-TR')}</span>
                      {feedback.category && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{feedback.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[feedback.status]}`}>
                    {STATUS_LABELS[feedback.status]}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          onUpdate={handleUpdateFeedback}
          onDelete={handleDelete}
          updating={updating}
        />
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color: 'blue' | 'orange' | 'red' | 'purple' | 'green'
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <div className={`p-1.5 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function FeedbackDetailModal({
  feedback,
  onClose,
  onUpdate,
  onDelete,
  updating,
}: {
  feedback: Feedback
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Feedback>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  updating: boolean
}) {
  const [localStatus, setLocalStatus] = useState(feedback.status)
  const [localPriority, setLocalPriority] = useState(feedback.priority)
  const [localNotes, setLocalNotes] = useState(feedback.admin_notes || '')

  const handleSave = () => {
    onUpdate(feedback.id, {
      status: localStatus,
      priority: localPriority,
      admin_notes: localNotes,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Geri Bildirim Detayı</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h4 className="text-xl font-semibold text-gray-900">{feedback.title}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${PRIORITY_COLORS[feedback.priority]}`}>
                {PRIORITY_LABELS[feedback.priority]}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{feedback.description}</p>
          </div>

          {feedback.screenshot_url && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Ekran Görüntüsü</h5>
              <a
                href={feedback.screenshot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                Görüntüle
              </a>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Tip:</span>
              <span className="ml-2 font-medium">{TYPE_LABELS[feedback.type]}</span>
            </div>
            <div>
              <span className="text-gray-500">Kullanıcı:</span>
              <span className="ml-2 font-medium">{feedback.user?.display_name || feedback.user_email || 'Anonim'}</span>
            </div>
            <div>
              <span className="text-gray-500">Tarih:</span>
              <span className="ml-2 font-medium">{new Date(feedback.created_at).toLocaleString('tr-TR')}</span>
            </div>
            {feedback.page_url && (
              <div className="col-span-2">
                <span className="text-gray-500">Sayfa:</span>
                <a href={feedback.page_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline text-xs break-all">
                  {feedback.page_url}
                </a>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-4">
            <h5 className="font-semibold text-gray-900">Yönetim</h5>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                <select
                  value={localStatus}
                  onChange={(e) => setLocalStatus(e.target.value as Feedback['status'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Öncelik</label>
                <select
                  value={localPriority}
                  onChange={(e) => setLocalPriority(e.target.value as Feedback['priority'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notları</label>
              <textarea
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                rows={4}
                placeholder="İç notlarınızı buraya yazın..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => onDelete(feedback.id)}
              disabled={updating}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Sil
            </button>
            <div className="flex-1" />
            <button
              onClick={onClose}
              disabled={updating}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
