import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { decryptToken, isEncrypted } from '@/lib/telegram/encryption'

// POST — telegram bağlantısını test et
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const body = await request.json()
    const { portfolio_id, bot_token, channel_id } = body

    if (!bot_token || !channel_id) {
      return NextResponse.json({ error: 'Bot token ve kanal ID gerekli' }, { status: 400 })
    }

    // Eğer portfolio_id verilmişse portföyün bu kullanıcıya ait olduğunu doğrula
    if (portfolio_id) {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('user_id')
        .eq('id', portfolio_id)
        .single()

      if (!portfolio || portfolio.user_id !== user.id) {
        return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
      }
    }

    // Token'ı çöz (şifreli gelebilir)
    let resolvedToken = bot_token.trim()
    if (isEncrypted(resolvedToken)) {
      resolvedToken = decryptToken(resolvedToken)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://xportfoy.com'

    const testText =
      `✅  <b>Bağlantı Başarılı!</b>\n\n` +
      `XPortfoy'u Telegram kanalınıza başarıyla bağladınız.\n\n` +
      `Artık portföyünüzdeki işlemler ve duyurular bu kanala otomatik olarak iletilecek.\n\n` +
      `<i>Bu bir test mesajıdır.</i>`

    // Private kanal ID düzeltmesi: Telegram Bot API -100XXXXXXXXXX formatı bekler
    // Kullanıcı -XXXXXXXXXX girerse otomatik -100 prefix ekle
    let normalizedChannelId = channel_id.trim()
    if (/^-\d+$/.test(normalizedChannelId) && !normalizedChannelId.startsWith('-100')) {
      normalizedChannelId = '-100' + normalizedChannelId.slice(1)
    }

    const telegramBody: Record<string, unknown> = {
      chat_id: normalizedChannelId,
      text: testText,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }

    if (!appUrl.includes('localhost')) {
      telegramBody.reply_markup = {
        inline_keyboard: [[{ text: '🌐  XPortfoy', url: appUrl }]],
      }
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${resolvedToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telegramBody),
    })

    const tgData = await tgRes.json().catch(() => ({}))

    if (!tgRes.ok) {
      const errorCode = (tgData as { error_code?: number }).error_code
      const description = (tgData as { description?: string }).description || ''

      let userMessage = 'Test mesajı gönderilemedi.'
      if (errorCode === 401) userMessage = 'Bot token geçersiz. BotFather&#39;dan aldığınız token&#39;ı kontrol edin.'
      else if (errorCode === 400 && description.includes('chat not found')) {
        userMessage = 'Kanal bulunamadı. '
          + 'Private kanal kullanıyorsanız ID&#39;yi -100XXXXXXXXXX formatında girin '
          + '(örn: -3563386613 → -1003563386613). '
          + 'Ayrıca bot&#39;u kanala admin olarak eklediğinizden emin olun.'
      }
      else if (errorCode === 403) userMessage = 'Bot kanalda mesaj gönderme yetkisine sahip değil. Bot&#39;u kanala admin olarak ekleyin.'
      else if (description) userMessage = description

      return NextResponse.json({ success: false, error: userMessage }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Telegram Test]', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
