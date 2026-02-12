import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { user_id, confirmation } = body

    if (!user_id || !confirmation) {
      return NextResponse.json(
        { error: 'user_id ve onay e-postası gerekli' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Kullanıcı doğrulama
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== user_id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    // E-posta eşleşme kontrolü
    if (user.email !== confirmation) {
      return NextResponse.json({ error: 'E-posta eşleşmiyor' }, { status: 400 })
    }

    // 1. Kullanıcının tüm verilerini sil (cascade ile otomatik silinecek ama explicit yapalım)
    // Notları sil
    await supabase.from('notes').delete().eq('user_id', user_id)

    // İşlemleri sil
    await supabase.from('transactions').delete().eq('user_id', user_id)

    // Holding'leri sil
    await supabase.from('holdings').delete().eq('user_id', user_id)

    // Portföyleri sil
    await supabase.from('portfolios').delete().eq('user_id', user_id)

    // Profili sil
    await supabase.from('users_public').delete().eq('id', user_id)

    // 2. Oturumu kapat
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Delete account error:', error)
    const message = error instanceof Error ? error.message : 'Bir hata oluştu'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
