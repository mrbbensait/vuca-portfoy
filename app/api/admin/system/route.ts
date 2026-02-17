import { withAdminAuth } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  return withAdminAuth(async () => {
    const admin = createAdminClient()

    const [
      // Price cache stats
      totalCacheRes,
      expiredCacheRes,
      latestCacheRes,

      // Rate limits
      topRateLimitUsersRes,

      // Table row counts
      usersCountRes,
      portfoliosCountRes,
      holdingsCountRes,
      transactionsCountRes,
      notesCountRes,
      alertsCountRes,
      followsCountRes,
      activitiesCountRes,
      rolesCountRes,
      userRolesCountRes,
      auditLogCountRes,
    ] = await Promise.all([
      // Price cache
      admin.from('price_cache').select('id', { count: 'exact', head: true }),
      admin.from('price_cache').select('id', { count: 'exact', head: true }).lt('expires_at', new Date().toISOString()),
      admin.from('price_cache').select('symbol, updated_at, expires_at, source').order('updated_at', { ascending: false }).limit(5),

      // Rate limits — en çok istek atan kullanıcılar
      admin.from('api_rate_limits').select('user_id, endpoint, request_count, window_start').order('request_count', { ascending: false }).limit(10),

      // Table counts
      admin.from('users_public').select('id', { count: 'exact', head: true }),
      admin.from('portfolios').select('id', { count: 'exact', head: true }),
      admin.from('holdings').select('id', { count: 'exact', head: true }),
      admin.from('transactions').select('id', { count: 'exact', head: true }),
      admin.from('notes').select('id', { count: 'exact', head: true }),
      admin.from('alerts').select('id', { count: 'exact', head: true }),
      admin.from('portfolio_follows').select('id', { count: 'exact', head: true }),
      admin.from('portfolio_activities').select('id', { count: 'exact', head: true }),
      admin.from('roles').select('id', { count: 'exact', head: true }),
      admin.from('user_roles').select('id', { count: 'exact', head: true }),
      admin.from('admin_audit_log').select('id', { count: 'exact', head: true }),
    ])

    // Rate limit kullanıcılarına isim ekle
    const rateLimitUsers = topRateLimitUsersRes.data || []
    const enrichedRateLimits = await Promise.all(
      rateLimitUsers.map(async (rl) => {
        const { data: profile } = await admin
          .from('users_public')
          .select('display_name')
          .eq('id', rl.user_id)
          .single()
        return {
          ...rl,
          display_name: profile?.display_name || 'İsimsiz',
        }
      })
    )

    return Response.json({
      priceCache: {
        totalCached: totalCacheRes.count || 0,
        expiredCount: expiredCacheRes.count || 0,
        activeCached: (totalCacheRes.count || 0) - (expiredCacheRes.count || 0),
        latestEntries: latestCacheRes.data || [],
      },
      rateLimits: enrichedRateLimits,
      tableCounts: [
        { table: 'users_public', count: usersCountRes.count || 0 },
        { table: 'portfolios', count: portfoliosCountRes.count || 0 },
        { table: 'holdings', count: holdingsCountRes.count || 0 },
        { table: 'transactions', count: transactionsCountRes.count || 0 },
        { table: 'notes', count: notesCountRes.count || 0 },
        { table: 'alerts', count: alertsCountRes.count || 0 },
        { table: 'portfolio_follows', count: followsCountRes.count || 0 },
        { table: 'portfolio_activities', count: activitiesCountRes.count || 0 },
        { table: 'price_cache', count: totalCacheRes.count || 0 },
        { table: 'roles', count: rolesCountRes.count || 0 },
        { table: 'user_roles', count: userRolesCountRes.count || 0 },
        { table: 'admin_audit_log', count: auditLogCountRes.count || 0 },
      ],
    })
  })
}
