import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { AnnouncementLink } from '@/lib/types/database.types'

// GET — Bir portföyün duyurularını getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get('portfolio_id')

    if (!portfolioId) {
      return NextResponse.json({ error: 'portfolio_id gerekli' }, { status: 400 })
    }

    const supabase = await createClient()

    // Duyuruları çek (pinned önce, sonra tarih sıralı)
    const { data: announcements, error } = await supabase
      .from('portfolio_announcements')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data: announcements || [] })
  } catch (error: unknown) {
    console.error('GET announcements error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST — Yeni duyuru ekle
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      portfolio_id, 
      user_id, 
      title, 
      content, 
      links = [],
      is_pinned = false,
      send_to_telegram = false 
    } = body

    if (!portfolio_id || !user_id || !title || !content) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Portföyün public olduğunu doğrula
    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('is_public, name, slug, user_id')
      .eq('id', portfolio_id)
      .single()

    if (!portfolio || !portfolio.is_public) {
      return NextResponse.json({ error: 'Sadece public portföylere duyuru eklenebilir' }, { status: 403 })
    }

    if (portfolio.user_id !== user_id) {
      return NextResponse.json({ error: 'Bu portföye duyuru ekleme yetkiniz yok' }, { status: 403 })
    }

    // 2. Duyuruyu kaydet
    const { data: announcement, error: announcementError } = await supabase
      .from('portfolio_announcements')
      .insert({
        portfolio_id,
        user_id,
        title,
        content,
        links: links as AnnouncementLink[],
        is_pinned,
      })
      .select()
      .single()

    if (announcementError) throw announcementError

    // 3. Activity feed'e ekle
    try {
      await supabase.from('portfolio_activities').insert({
        portfolio_id,
        actor_id: user_id,
        type: 'NEW_ANNOUNCEMENT',
        title: `Yeni Duyuru: ${title}`,
        metadata: { 
          announcement_id: announcement.id,
          title,
          content_preview: content.substring(0, 100)
        },
      })
    } catch (activityError) {
      console.error('Activity insert error (non-blocking):', activityError)
    }

    // 4. Telegram bildirimi (opsiyonel)
    if (send_to_telegram) {
      try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN
        const channelId = process.env.TELEGRAM_CHANNEL_ID
        
        if (botToken && channelId) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          
          // Telegram mesaj formatı
          let text = `📢  <b>Yeni Duyuru</b>\n\n`
          text += `"<b>${portfolio.name}</b>" portföyünden yeni bir duyuru yayınlandı:\n\n`
          text += `<b>${title}</b>\n\n`
          text += `${content.substring(0, 200)}${content.length > 200 ? '...' : ''}\n\n`
          
          if (links && links.length > 0) {
            text += `🔗 ${links.length} link paylaşıldı\n\n`
          }
          
          text += `━━━━━━━━━━━━━━━━━━━━━\n\n`
          text += `Detaylar ve linkler için portföyü ziyaret edin.`

          // Inline keyboard butonları
          const buttons: { text: string; url: string }[][] = []
          if (portfolio.slug) {
            buttons.push([{ text: '📢  Duyuruyu Gör', url: `${appUrl}/p/${portfolio.slug}?tab=announcements#announcement-${announcement.id}` }])
            buttons.push([{ text: '📊  Portföyü İncele', url: `${appUrl}/p/${portfolio.slug}` }])
          }

          const telegramBody: Record<string, unknown> = {
            chat_id: channelId,
            text,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }

          // Telegram inline butonlar sadece https URL kabul eder
          if (!appUrl.includes('localhost')) {
            telegramBody.reply_markup = { inline_keyboard: buttons }
          }

          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(telegramBody),
          })

          if (!tgRes.ok) {
            const errBody = await tgRes.json().catch(() => ({}))
            console.error('[Telegram Error]', errBody)
          }
        }
      } catch (tgErr) {
        console.error('[Telegram Send Error (non-blocking)]', tgErr)
      }
    }

    return NextResponse.json({ success: true, data: announcement })
  } catch (error: unknown) {
    console.error('POST announcement error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
