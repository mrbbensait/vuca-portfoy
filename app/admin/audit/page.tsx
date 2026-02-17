'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Shield,
  User,
  Briefcase,
  Server,
} from 'lucide-react'

interface AuditLogRow {
  id: string
  admin_id: string
  admin_name: string
  action: string
  target_type: string
  target_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

interface AuditResponse {
  logs: AuditLogRow[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const ACTION_LABELS: Record<string, string> = {
  system_setup: 'Sistem Kurulumu',
  user_role_assigned: 'Rol Atandı',
  user_role_removed: 'Rol Kaldırıldı',
  user_detail_viewed: 'Kullanıcı Görüntülendi',
  user_banned: 'Kullanıcı Banlandı',
  user_unbanned: 'Ban Kaldırıldı',
  cache_cleared: 'Cache Temizlendi',
  portfolio_toggled: 'Portföy Durumu Değişti',
}

const TARGET_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  user: User,
  portfolio: Briefcase,
  system: Server,
  role: Shield,
}

export default function AdminAuditPage() {
  const [data, setData] = useState<AuditResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [targetType, setTargetType] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '30' })
      if (targetType) params.set('target_type', targetType)

      const res = await fetch(`/api/admin/audit-log?${params}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [page, targetType])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-gray-600" />
          Audit Log
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Admin aksiyonlarının kronolojik kaydı
          {data ? ` · ${data.total} kayıt` : ''}
        </p>
      </div>

      {/* Filtreler */}
      <div className="flex items-center gap-2">
        {[
          { value: '', label: 'Tümü' },
          { value: 'user', label: 'Kullanıcı' },
          { value: 'portfolio', label: 'Portföy' },
          { value: 'system', label: 'Sistem' },
          { value: 'role', label: 'Rol' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => { setTargetType(f.value); setPage(1) }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              targetType === f.value
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Log Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : data && data.logs.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {data.logs.map((log) => {
              const Icon = TARGET_TYPE_ICONS[log.target_type] || ScrollText
              const actionLabel = ACTION_LABELS[log.action] || log.action

              return (
                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{log.admin_name}</span>
                      {' · '}
                      <span className="text-gray-600">{actionLabel}</span>
                    </p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {Object.entries(log.metadata)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' · ')}
                      </p>
                    )}
                    {log.target_id && (
                      <p className="text-xs text-gray-300 font-mono mt-0.5">
                        {log.target_type}:{log.target_id.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Henüz audit log kaydı yok</p>
            <p className="text-xs mt-1">Admin aksiyonları burada görünecek</p>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">
              {(page - 1) * 30 + 1}–{Math.min(page * 30, data.total)} / {data.total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">{page} / {data.totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
