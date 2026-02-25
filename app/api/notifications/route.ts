import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — Sadece okunmamış bildirimleri getir (last_seen_at bazlı)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    // Takip edilen portföyleri ve last_seen_at'leri al
    const { data: follows, error: fError } = await supabase
      .from('portfolio_follows')
      .select('portfolio_id, last_seen_at')
      .eq('follower_id', user.id)

    if (fError) throw fError
    if (!follows || follows.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const portfolioIds = follows.map(f => f.portfolio_id)

    // En eski last_seen_at'i bul
    const hasNullSeen = follows.some(f => !f.last_seen_at)
    const oldestSeen = hasNullSeen
      ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      : follows.reduce((oldest, f) => {
          if (!oldest || (f.last_seen_at && f.last_seen_at < oldest)) return f.last_seen_at!
          return oldest
        }, '' as string)

    // Sadece okunmamış aktiviteleri çek (last_seen_at'ten sonraki)
    const { data: acts, error: actError } = await supabase
      .from('portfolio_activities')
      .select('*')
      .in('portfolio_id', portfolioIds)
      .gt('created_at', oldestSeen)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (actError) throw actError

    // Portföy ve sahip bilgilerini zenginleştir
    const enriched = await enrichActivities(supabase, acts || [])

    return NextResponse.json({
      success: true,
      data: enriched,
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
