import { withAdminAuth } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return withAdminAuth(async () => {
    const admin = createAdminClient()
    const { searchParams } = request.nextUrl

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '30', 10)
    const symbol = searchParams.get('symbol') || ''
    const side = searchParams.get('side') || '' // BUY, SELL
    const assetType = searchParams.get('asset_type') || ''

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = admin
      .from('transactions')
      .select('*', { count: 'exact' })

    if (symbol) query = query.ilike('symbol', `%${symbol}%`)
    if (side === 'BUY' || side === 'SELL') query = query.eq('side', side)
    if (['TR_STOCK', 'US_STOCK', 'CRYPTO', 'CASH'].includes(assetType)) {
      query = query.eq('asset_type', assetType)
    }

    query = query.order('date', { ascending: false }).range(from, to)

    const { data: transactions, count, error } = await query

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Kullanıcı isimlerini toplu çek
    const userIds = [...new Set((transactions || []).map((t) => t.user_id))]
    const ownerMap: Record<string, string> = {}
    if (userIds.length > 0) {
      const { data: profiles } = await admin
        .from('users_public')
        .select('id, display_name')
        .in('id', userIds)
      if (profiles) {
        for (const p of profiles) {
          ownerMap[p.id] = p.display_name || 'İsimsiz'
        }
      }
    }

    // Owner bilgisi ekle
    const enrichedTransactions = (transactions || []).map((t) => ({
      ...t,
      owner: { display_name: ownerMap[t.user_id] || 'İsimsiz' },
    }))

    // Quick stats
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [todayRes, weekRes] = await Promise.all([
      admin.from('transactions').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
      admin.from('transactions').select('id', { count: 'exact', head: true }).gte('created_at', weekStart),
    ])

    return Response.json({
      transactions: enrichedTransactions,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      quickStats: {
        todayCount: todayRes.count || 0,
        weekCount: weekRes.count || 0,
      },
    })
  })
}
