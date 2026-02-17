import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — Takip edilen portföylerin aktivite akışı (pull-based)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Takip edilen portföy ID'lerini al
    const { data: followedIds } = await supabase
      .from('portfolio_follows')
      .select('portfolio_id')
      .eq('follower_id', user.id)

    if (!followedIds || followedIds.length === 0) {
      return NextResponse.json({ success: true, data: [], hasMore: false })
    }

    const portfolioIds = followedIds.map(f => f.portfolio_id)

    // Son 30 günlük aktiviteleri çek
    const { data: acts, error: actError } = await supabase
      .from('portfolio_activities')
      .select('*')
      .in('portfolio_id', portfolioIds)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (actError) throw actError

    // Portföy ve sahip bilgilerini zenginleştir
    const enriched = await enrichActivities(supabase, acts || [])

    return NextResponse.json({
      success: true,
      data: enriched,
      hasMore: (acts || []).length === limit,
    })
  } catch (error: unknown) {
    console.error('GET notifications error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Aktivitelere portföy ve sahip bilgilerini ekle
async function enrichActivities(
  supabase: Awaited<ReturnType<typeof createClient>>,
  activities: Array<{
    id: string
    portfolio_id: string
    actor_id: string
    type: string
    title: string
    metadata: Record<string, unknown>
    created_at: string
  }>
) {
  if (activities.length === 0) return []

  // Benzersiz portföy ve kullanıcı ID'leri
  const portfolioIds = [...new Set(activities.map(a => a.portfolio_id))]
  const actorIds = [...new Set(activities.map(a => a.actor_id))]

  // Portföy bilgileri
  const portfolioMap: Record<string, { name: string; slug: string | null }> = {}
  if (portfolioIds.length > 0) {
    const { data: portfolios } = await supabase
      .from('portfolios')
      .select('id, name, slug')
      .in('id', portfolioIds)

    if (portfolios) {
      portfolios.forEach(p => {
        portfolioMap[p.id] = { name: p.name, slug: p.slug }
      })
    }
  }

  // Sahip profilleri
  const actorMap: Record<string, { display_name: string | null; avatar_url: string | null }> = {}
  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('users_public')
      .select('id, display_name, avatar_url')
      .in('id', actorIds)

    if (profiles) {
      profiles.forEach(p => {
        actorMap[p.id] = { display_name: p.display_name, avatar_url: p.avatar_url }
      })
    }
  }

  return activities.map(a => ({
    ...a,
    portfolio_name: portfolioMap[a.portfolio_id]?.name || 'Bilinmeyen Portföy',
    portfolio_slug: portfolioMap[a.portfolio_id]?.slug || null,
    actor_name: actorMap[a.actor_id]?.display_name || 'Anonim',
    actor_avatar: actorMap[a.actor_id]?.avatar_url || null,
  }))
}
