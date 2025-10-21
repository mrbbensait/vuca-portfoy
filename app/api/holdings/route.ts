import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { symbol, asset_type, quantity, avg_price, note, portfolio_id, user_id } = body

    if (!symbol || !asset_type || !quantity || !avg_price || !portfolio_id || !user_id) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('holdings')
      .insert({
        symbol,
        asset_type,
        quantity: parseFloat(quantity),
        avg_price: parseFloat(avg_price),
        note: note || null,
        portfolio_id,
        user_id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    console.error('Holdings POST error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
