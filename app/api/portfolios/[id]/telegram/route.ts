import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { encryptToken, decryptToken, isEncrypted } from '@/lib/telegram/encryption'

// GET — mevcut telegram ayarlarını getir (token maskeli)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: portfolioId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select('id, user_id, telegram_enabled, telegram_bot_token, telegram_channel_id')
      .eq('id', portfolioId)
      .single()

    if (error || !portfolio) return NextResponse.json({ error: 'Portföy bulunamadı' }, { status: 404 })
    if (portfolio.user_id !== user.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })

    return NextResponse.json({
      telegram_enabled: portfolio.telegram_enabled,
      telegram_channel_id: portfolio.telegram_channel_id || '',
      // Token'ı asla plain text dönme, sadece dolu mu değil mi bilgisini ver
      telegram_bot_token_set: !!portfolio.telegram_bot_token,
    })
  } catch (err) {
    console.error('[Telegram GET]', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT — telegram ayarlarını kaydet
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: portfolioId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('id, user_id, telegram_bot_token')
      .eq('id', portfolioId)
      .single()

    if (!portfolio) return NextResponse.json({ error: 'Portföy bulunamadı' }, { status: 404 })
    if (portfolio.user_id !== user.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })

    const body = await request.json()
    const { telegram_enabled, telegram_bot_token, telegram_channel_id } = body

    const updateData: Record<string, unknown> = {
      telegram_enabled: !!telegram_enabled,
      telegram_channel_id: telegram_channel_id?.trim() || null,
    }

    // Token güncelleme: boş geldiyse mevcut token korunur, yeni geldiyse şifrele
    if (telegram_bot_token && telegram_bot_token.trim()) {
      const trimmed = telegram_bot_token.trim()
      // Zaten şifreli mi? (kullanıcı değiştirmediyse frontend masked string gönderebilir)
      if (!isEncrypted(trimmed)) {
        // Basit bot token format validasyonu: sayı:alfanümerik
        const tokenRegex = /^\d+:[A-Za-z0-9_-]{35,}$/
        if (!tokenRegex.test(trimmed)) {
          return NextResponse.json({ error: 'Geçersiz bot token formatı. Telegram BotFather\'dan aldığınız token\'ı girin.' }, { status: 400 })
        }
        updateData.telegram_bot_token = encryptToken(trimmed)
      }
      // Şifreli haldeyse hiçbir şey yapma (zaten kayıtlı)
    } else if (telegram_bot_token === '') {
      // Boş string → token'ı sil
      updateData.telegram_bot_token = null
    }

    const { error } = await supabase
      .from('portfolios')
      .update(updateData)
      .eq('id', portfolioId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Telegram PUT]', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE — telegram entegrasyonunu kaldır
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: portfolioId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('id, user_id')
      .eq('id', portfolioId)
      .single()

    if (!portfolio) return NextResponse.json({ error: 'Portföy bulunamadı' }, { status: 404 })
    if (portfolio.user_id !== user.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })

    const { error } = await supabase
      .from('portfolios')
      .update({
        telegram_enabled: false,
        telegram_bot_token: null,
        telegram_channel_id: null,
      })
      .eq('id', portfolioId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Telegram DELETE]', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
