import { withAdminAuth } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return withAdminAuth(async () => {
    const admin = createAdminClient()
    const { searchParams } = request.nextUrl

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '30', 10)
    const actionFilter = searchParams.get('action') || ''
    const targetTypeFilter = searchParams.get('target_type') || ''

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = admin
      .from('admin_audit_log')
      .select('*', { count: 'exact' })

    if (actionFilter) query = query.eq('action', actionFilter)
    if (targetTypeFilter) query = query.eq('target_type', targetTypeFilter)

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data: logs, count, error } = await query

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Admin isimlerini ekle
    const adminIds = [...new Set((logs || []).map((l) => l.admin_id))]
    const adminNames: Record<string, string> = {}

    if (adminIds.length > 0) {
      const { data: profiles } = await admin
        .from('users_public')
        .select('id, display_name')
        .in('id', adminIds)

      if (profiles) {
        for (const p of profiles) {
          adminNames[p.id] = p.display_name || 'İsimsiz'
        }
      }
    }

    const enrichedLogs = (logs || []).map((log) => ({
      ...log,
      admin_name: adminNames[log.admin_id] || 'İsimsiz',
    }))

    return Response.json({
      logs: enrichedLogs,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  })
}
