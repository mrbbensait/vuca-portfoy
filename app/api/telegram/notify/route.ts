import { NextRequest, NextResponse } from 'next/server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://xportfoy.com'

// POST — Telegram kanalına bildirim gönder (fire-and-forget, internal API)
export async function POST(request: NextRequest) {
  try {
    // Token yoksa sessizce çık
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
      return NextResponse.json({ success: false, reason: 'Telegram not configured' })
    }

    const body = await request.json()
    const { actor_name, portfolio_name, portfolio_slug, side, symbol, asset_type, quantity, price } = body

    if (!actor_name || !portfolio_name || !symbol) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const sideLabel = side === 'BUY' ? 'alış' : 'satış'
    const assetLabel = getAssetLabel(asset_type)
    const portfolioUrl = portfolio_slug ? `${APP_URL}/p/${portfolio_slug}` : null
    const priceFormatted = price ? Number(price).toLocaleString('tr-TR') : ''

    // Telegram mesaj metni (MarkdownV2 kullanmıyoruz, parse_mode=HTML)
    let text = `📊 <b>Yeni İşlem</b> | XPortfoy\n\n`
    text += `<b>${escapeHtml(actor_name)}</b>, "<b>${escapeHtml(portfolio_name)}</b>" portföyüne `
    text += `bir ${assetLabel} ${sideLabel} işlemi ekledi.\n\n`
    text += `💰 ${quantity} adet <b>${escapeHtml(symbol)}</b>`
    if (priceFormatted) text += ` — birim fiyat: ${priceFormatted}`
    text += `\n`

    if (portfolioUrl) {
      text += `\n🔗 <a href="${portfolioUrl}">Portföyü İncele</a>\n`
    }

    text += `\n<i>XPortfoy'da ücretsiz takip edin →</i>\n`
    text += `<a href="${APP_URL}/explore">Keşfet</a>`

    // Telegram Bot API çağrısı
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    const res = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      console.error('Telegram API error:', errData)
      return NextResponse.json({ success: false, reason: 'Telegram API error' })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Telegram notify error:', error)
    return NextResponse.json({ success: false, reason: 'Internal error' })
  }
}

function getAssetLabel(assetType?: string): string {
  const labels: Record<string, string> = {
    TR_STOCK: 'TR Hisse',
    US_STOCK: 'ABD Hisse',
    CRYPTO: 'Kripto',
    CASH: 'Nakit',
  }
  return labels[assetType || ''] || assetType || 'varlık'
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
