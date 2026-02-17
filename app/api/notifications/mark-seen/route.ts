import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH — Tüm takiplerin last_seen_at'ini güncelle (bildirimleri okundu olarak işaretle)
export async function PATCH() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date().toISOString()

    const { error } = await supabase
      .from('portfolio_follows')
      .update({ last_seen_at: now })
      .eq('follower_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true, last_seen_at: now })
  } catch (error: unknown) {
    console.error('PATCH mark-seen error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
