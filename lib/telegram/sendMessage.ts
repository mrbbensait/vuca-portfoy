import { decryptToken, isEncrypted } from './encryption'

interface TelegramButton {
  text: string
  url: string
}

interface SendTelegramOptions {
  botToken: string
  channelId: string
  text: string
  buttons?: TelegramButton[][]
  appUrl?: string
}

export async function sendTelegramMessage(opts: SendTelegramOptions): Promise<boolean> {
  const { botToken, channelId, text, buttons, appUrl } = opts

  // Private kanal ID düzeltmesi: Telegram Bot API -100XXXXXXXXXX formatı bekler
  let normalizedChannelId = channelId
  if (/^-\d+$/.test(normalizedChannelId) && !normalizedChannelId.startsWith('-100')) {
    normalizedChannelId = '-100' + normalizedChannelId.slice(1)
  }

  const body: Record<string, unknown> = {
    chat_id: normalizedChannelId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  }

  if (buttons && buttons.length > 0 && appUrl && !appUrl.includes('localhost')) {
    body.reply_markup = { inline_keyboard: buttons }
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.ok
  } catch {
    return false
  }
}

export function resolveToken(rawValue: string): string {
  if (isEncrypted(rawValue)) {
    return decryptToken(rawValue)
  }
  return rawValue
}

// Portföy işlem bildirimi için mesaj metni oluştur
export function buildTradeMessage(params: {
  portfolioName: string
  portfolioSlug: string | null
  symbol: string
  side: string
  assetType: string
  quantity: string | number
  price: string | number
  appUrl: string
}): { text: string; buttons: TelegramButton[][] } {
  const { portfolioName, portfolioSlug, symbol, side, assetType, quantity, price, appUrl } = params
  const isBuy = side === 'BUY'
  const sideEmoji = isBuy ? '🟢' : '🔴'
  const assetCategories: Record<string, string> = {
    TR_STOCK: 'BIST',
    US_STOCK: 'Nasdaq',
    CRYPTO: 'Kripto',
    CASH: 'Döviz / Nakit',
  }
  const assetCategory = assetCategories[assetType] || 'Diğer'
  const cleanSymbol = symbol.replace(/\.IS$/i, '').replace(/USDT$/i, '')
  const now = new Date()
  const dateStr = now.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

  let text = `${sideEmoji}  <b>${assetCategory}</b>\n\n`
  text += `"<b>${portfolioName}</b>" portföyüne yeni bir işlem eklendi.\n\n`
  text += `📅  ${dateStr} · ${timeStr}\n`
  text += `📌  ${cleanSymbol}\n\n`
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`
  text += `XPortfoy, <b>VUCA</b>'nın ücretsiz sunduğu bir uygulamadır. `
  text += `Piyasada tüm varlıklarımızı takip edebileceğimiz tek bir platformun olmamasından dolayı geliştirilmiştir.\n\n`
  text += `Herkes kendi portföyünü oluşturabilir, özel ya da halka açık şekilde yayınlayabilir. `
  text += `Halka açık portföyleri incelemek için ücretsiz üye olmanız yeterlidir.\n\n`
  text += `<i>Detaylı bilgi için web uygulamasını ziyaret edebilirsiniz.</i>`

  const buttons: TelegramButton[][] = []
  if (portfolioSlug) {
    buttons.push([{ text: '📊  Portföyü İncele', url: `${appUrl}/p/${portfolioSlug}` }])
  }
  buttons.push([{ text: '🌐  XPortfoy', url: appUrl }])

  return { text, buttons }
}

// Duyuru bildirimi için mesaj metni oluştur
export function buildAnnouncementMessage(params: {
  portfolioName: string
  portfolioSlug: string | null
  title: string
  content: string
  links?: { url: string }[]
  announcementId?: string
  appUrl: string
}): { text: string; buttons: TelegramButton[][] } {
  const { portfolioName, portfolioSlug, title, content, links, announcementId, appUrl } = params

  let text = `📢  <b>Yeni Duyuru</b>\n\n`
  text += `"<b>${portfolioName}</b>" portföyünden yeni bir duyuru yayınlandı:\n\n`
  text += `<b>${title}</b>\n\n`
  text += `${content.substring(0, 200)}${content.length > 200 ? '...' : ''}\n\n`

  if (links && links.length > 0) {
    text += `🔗 ${links.length} link paylaşıldı\n\n`
  }

  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`
  text += `Detaylar ve linkler için portföyü ziyaret edin.`

  const buttons: TelegramButton[][] = []
  if (portfolioSlug) {
    const anchor = announcementId ? `#announcement-${announcementId}` : ''
    buttons.push([{ text: '📢  Duyuruyu Gör', url: `${appUrl}/p/${portfolioSlug}?tab=announcements${anchor}` }])
    buttons.push([{ text: '📊  Portföyü İncele', url: `${appUrl}/p/${portfolioSlug}` }])
  }

  return { text, buttons }
}

// Hibrit bildirim: global kanal + kullanıcının kendi kanalı
export async function sendHybridTelegramNotification(params: {
  text: string
  buttons: TelegramButton[][]
  appUrl: string
  portfolioTelegramEnabled?: boolean
  portfolioBotToken?: string | null
  portfolioChannelId?: string | null
}): Promise<void> {
  const { text, buttons, appUrl, portfolioTelegramEnabled, portfolioBotToken, portfolioChannelId } = params

  const globalBotToken = process.env.TELEGRAM_BOT_TOKEN
  const globalChannelId = process.env.TELEGRAM_CHANNEL_ID

  // 1. Kullanıcının kendi kanalına gönder (eğer aktifse ve bilgiler tamamsa)
  if (portfolioTelegramEnabled && portfolioBotToken && portfolioChannelId) {
    try {
      const resolvedToken = resolveToken(portfolioBotToken)
      await sendTelegramMessage({ botToken: resolvedToken, channelId: portfolioChannelId, text, buttons, appUrl })
    } catch (err) {
      console.error('[Telegram] User channel send error:', err)
    }
  }

  // 2. Her zaman global (ana) kanala gönder
  if (globalBotToken && globalChannelId) {
    try {
      await sendTelegramMessage({ botToken: globalBotToken, channelId: globalChannelId, text, buttons, appUrl })
    } catch (err) {
      console.error('[Telegram] Global channel send error:', err)
    }
  }
}
