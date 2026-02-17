import { withAdminAuth } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return withAdminAuth(async () => {
    const admin = createAdminClient()
    const { searchParams } = request.nextUrl

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sort') || 'created_at'
    const sortDir = searchParams.get('dir') === 'asc' ? true : false

    const from = (page - 1) * limit
    const to = from + limit - 1

    // Kullanıcı listesi sorgusu
    let query = admin
      .from('users_public')
      .select('*', { count: 'exact' })

    // Arama filtresi
    if (search) {
      query = query.or(`display_name.ilike.%${search}%`)
    }

    // Sıralama
    if (['created_at', 'display_name'].includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortDir })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Pagination
    query = query.range(from, to)

    const { data: users, count, error } = await query

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Her kullanıcı için ek istatistikler (portföy, holding, işlem sayıları)
    const enrichedUsers = await Promise.all(
      (users || []).map(async (user) => {
        const [portfolioRes, holdingRes, transactionRes, roleRes] = await Promise.all([
          admin
            .from('portfolios')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          admin
            .from('holdings')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gt('quantity', 0),
          admin
            .from('transactions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          admin
            .from('user_roles')
            .select('role:roles(slug, name)')
            .eq('user_id', user.id),
        ])

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const roles = (roleRes.data || []).map((r: any) => r.role).filter(Boolean)

        return {
          ...user,
          portfolio_count: portfolioRes.count || 0,
          holding_count: holdingRes.count || 0,
          transaction_count: transactionRes.count || 0,
          roles,
        }
      })
    )

    return Response.json({
      users: enrichedUsers,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  })
}
