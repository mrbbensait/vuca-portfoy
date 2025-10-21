import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, display_name } = body

    if (!user_id) {
      return NextResponse.json({ error: 'user_id gerekli' }, { status: 400 })
    }

    const supabase = await createClient()

    // Önce mevcut profili kontrol et
    const { data: existing } = await supabase
      .from('users_public')
      .select('*')
      .eq('id', user_id)
      .single()

    if (existing) {
      // Güncelle
      const { error } = await supabase
        .from('users_public')
        .update({ display_name })
        .eq('id', user_id)

      if (error) throw error
    } else {
      // Yeni oluştur
      const { error } = await supabase
        .from('users_public')
        .insert({
          id: user_id,
          display_name,
          base_currency: 'TRY',
        })

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Profile POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
