import { withAdminAuth } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return withAdminAuth(async () => {
    const admin = createAdminClient()
    const { searchParams } = request.nextUrl

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const filter = searchParams.get('filter') || 'all'
    const sortBy = searchParams.get('sort') || 'created_at'
    const sortDir = searchParams.get('dir') === 'asc'

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = admin
      .from('portfolios')
      .select('*', { count: 'exact' })

    if (filter === 'public') query = query.eq('is_public', true)
    if (filter === 'private') query = query.eq('is_public', false)

    if (['created_at', 'follower_count', 'name'].includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortDir })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    query = query.range(from, to)

    const { data: portfolios, count, error } = await query

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Kullanıcı isimlerini toplu çek
    const userIds = [...new Set((portfolios || []).map((p) => p.user_id))]
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

    // Her portföy için holding + işlem sayısı + owner name
    const enriched = await Promise.all(
      (portfolios || []).map(async (p) => {
        const [holdingRes, txRes] = await Promise.all([
          admin
            .from('holdings')
            .select('id', { count: 'exact', head: true })
            .eq('portfolio_id', p.id)
            .gt('quantity', 0),
          admin
            .from('transactions')
            .select('id', { count: 'exact', head: true })
            .eq('portfolio_id', p.id),
        ])

        return {
          ...p,
          owner: { display_name: ownerMap[p.user_id] || 'İsimsiz' },
          holding_count: holdingRes.count || 0,
          transaction_count: txRes.count || 0,
        }
      })
    )

    // Quick stats
    const [totalRes, publicRes, topFollowedRes] = await Promise.all([
      admin.from('portfolios').select('id', { count: 'exact', head: true }),
      admin.from('portfolios').select('id', { count: 'exact', head: true }).eq('is_public', true),
      admin
        .from('portfolios')
        .select('name, slug, follower_count, user_id')
        .eq('is_public', true)
        .order('follower_count', { ascending: false })
        .limit(3),
    ])

    // Top followed portföylere owner name ekle
    const topFollowed = (topFollowedRes.data || []).map((p) => ({
      ...p,
      owner: { display_name: ownerMap[p.user_id] || 'İsimsiz' },
    }))

    return Response.json({
      portfolios: enriched,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      quickStats: {
        totalPortfolios: totalRes.count || 0,
        publicPortfolios: publicRes.count || 0,
        topFollowed,
      },
    })
  })
}
