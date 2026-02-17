import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — Okunmamış bildirim sayısı (last_seen_at bazlı)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Kullanıcının takip ettiği portföyler ve en eski last_seen_at
    const { data: follows, error: fError } = await supabase
      .from('portfolio_follows')
      .select('portfolio_id, last_seen_at')
      .eq('follower_id', user.id)

    if (fError) throw fError
    if (!follows || follows.length === 0) {
      return NextResponse.json({ success: true, count: 0 })
    }

    const portfolioIds = follows.map(f => f.portfolio_id)

    // En eski last_seen_at'i bul (null olanlar hiç okumamış = tüm aktiviteler okunmamış)
    const hasNullSeen = follows.some(f => !f.last_seen_at)
    const oldestSeen = hasNullSeen
      ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      : follows.reduce((oldest, f) => {
          if (!oldest || (f.last_seen_at && f.last_seen_at < oldest)) return f.last_seen_at!
          return oldest
        }, '' as string)

    // Tek sorgu: Takip edilen portföylerin okunmamış aktiviteleri
    const { count, error: cError } = await supabase
      .from('portfolio_activities')
      .select('*', { count: 'exact', head: true })
      .in('portfolio_id', portfolioIds)
      .gt('created_at', oldestSeen)

    if (cError) throw cError

    return NextResponse.json({ success: true, count: count || 0 })
  } catch (error: unknown) {
    console.error('GET unread-count error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
