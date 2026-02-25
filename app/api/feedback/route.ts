import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { type, category, title, description, screenshot_url, user_email, page_url } = body

    if (!title || !description || !type) {
      return NextResponse.json(
        { error: 'Başlık, açıklama ve tip zorunludur' },
        { status: 400 }
      )
    }

    const { data: { user } } = await supabase.auth.getUser()

    const userAgent = request.headers.get('user-agent') || ''

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: user?.id || null,
        type,
        category: category || null,
        title,
        description,
        screenshot_url: screenshot_url || null,
        user_email: user_email || null,
        page_url: page_url || null,
        user_agent: userAgent,
        priority: type === 'bug' ? 'high' : 'medium',
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      console.error('Feedback insert error:', error)
      return NextResponse.json(
        { error: 'Geri bildirim kaydedilemedi' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Feedback fetch error:', error)
      return NextResponse.json(
        { error: 'Geri bildirimler yüklenemedi' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Feedback GET error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
