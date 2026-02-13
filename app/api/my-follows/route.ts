import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — Takip ettiğim portföyleri listele
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 })
    }

    // Takip edilen portföyleri getir (portföy + sahip bilgisi ile)
    const { data: follows, error } = await supabase
      .from('portfolio_follows')
      .select(`
        id, created_at,
        portfolios!portfolio_follows_portfolio_id_fkey(
          id, name, slug, description, follower_count, is_public, created_at, user_id,
          users_public!portfolios_user_id_fkey(display_name, avatar_url)
        )
      `)
      .eq('follower_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Portföy ID'lerini topla (holding sayısı için)
    const portfolioIds = (follows || [])
      .map(f => {
        const p = Array.isArray(f.portfolios) ? f.portfolios[0] : f.portfolios
        return p?.id
      })
      .filter(Boolean) as string[]

    let holdingCounts: Record<string, number> = {}
    if (portfolioIds.length > 0) {
      const { data: counts } = await supabase
        .from('holdings')
        .select('portfolio_id')
        .in('portfolio_id', portfolioIds)

      if (counts) {
        holdingCounts = counts.reduce((acc: Record<string, number>, h: { portfolio_id: string }) => {
          acc[h.portfolio_id] = (acc[h.portfolio_id] || 0) + 1
          return acc
        }, {})
      }
    }

    // Sonuçları zenginleştir
    const enriched = (follows || []).map(f => {
      const portfolio = Array.isArray(f.portfolios) ? f.portfolios[0] : f.portfolios
      if (!portfolio) return null

      const profile = Array.isArray(portfolio.users_public)
        ? portfolio.users_public[0]
        : portfolio.users_public

      return {
        follow_id: f.id,
        followed_at: f.created_at,
        portfolio: {
          ...portfolio,
          owner_name: profile?.display_name || 'Anonim',
          owner_avatar: profile?.avatar_url || null,
          holding_count: holdingCounts[portfolio.id] || 0,
        },
      }
    }).filter(Boolean)

    return NextResponse.json({
      success: true,
      data: enriched,
      total: enriched.length,
    })
  } catch (error: unknown) {
    console.error('GET my-follows error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
