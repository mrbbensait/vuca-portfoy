import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — Public portföyleri listele (keşfet sayfası)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const sort = searchParams.get('sort') || 'newest' // newest | name
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit

    const supabase = await createClient()
    
    // Get current user for follow status
    const { data: { user } } = await supabase.auth.getUser()

    // Base query: public portföyler
    let query = supabase
      .from('portfolios')
      .select('id, name, slug, description, is_public, created_at, user_id', { count: 'exact' })
      .eq('is_public', true)

    // Arama - include owner name if search term provided
    if (search.trim()) {
      // First get matching user IDs by display_name
      const { data: matchingUsers } = await supabase
        .from('users_public')
        .select('id')
        .ilike('display_name', `%${search}%`)
      
      const matchingUserIds = matchingUsers?.map(u => u.id) || []
      
      // Build search query: portfolio name OR description OR owner name
      if (matchingUserIds.length > 0) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,user_id.in.(${matchingUserIds.join(',')})`)
      } else {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }
    }

    // Sıralama
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'name':
        query = query.order('name', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Sayfalama
    query = query.range(offset, offset + limit - 1)

    const { data: portfolios, count, error } = await query

    if (error) throw error

    // Sahip profilleri (ayrı sorgu — FK yok)
    const userIds = [...new Set((portfolios || []).map(p => p.user_id))]
    const profileMap: Record<string, { display_name: string | null; avatar_url: string | null }> = {}

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('users_public')
        .select('id, display_name, avatar_url')
        .in('id', userIds)

      if (profiles) {
        profiles.forEach(p => {
          profileMap[p.id] = { display_name: p.display_name, avatar_url: p.avatar_url }
        })
      }
    }

    // Holding sayıları
    const portfolioIds = (portfolios || []).map(p => p.id)
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

    // Get follow status for current user
    let followedPortfolioIds: Set<string> = new Set()
    if (user && portfolioIds.length > 0) {
      const { data: follows } = await supabase
        .from('portfolio_follows')
        .select('portfolio_id')
        .eq('follower_id', user.id)
        .in('portfolio_id', portfolioIds)
      
      if (follows) {
        followedPortfolioIds = new Set(follows.map(f => f.portfolio_id))
      }
    }

    // Sonuçları zenginleştir
    const enriched = (portfolios || []).map(p => {
      const profile = profileMap[p.user_id]
      return {
        ...p,
        owner_name: profile?.display_name || 'Anonim',
        owner_avatar: profile?.avatar_url || null,
        holding_count: holdingCounts[p.id] || 0,
        is_following: followedPortfolioIds.has(p.id),
      }
    })

    return NextResponse.json({
      success: true,
      data: enriched,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: unknown) {
    console.error('GET explore error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
