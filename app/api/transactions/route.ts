import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { symbol, asset_type, side, quantity, price, fee, date, note, portfolio_id, user_id } = body

    if (!symbol || !asset_type || !side || !quantity || !price || !portfolio_id || !user_id) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 })
    }

    const supabase = await createClient()

    // ✅ 1. ÖNCE VALİDASYON: Satış işlemi için holding kontrolü
    if (side === 'SELL') {
      const { data: existingHolding } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', portfolio_id)
        .eq('symbol', symbol)
        .single()

      if (!existingHolding) {
        return NextResponse.json(
          { error: `${symbol} sembolü portföyünüzde bulunmuyor. Önce satın almanız gerekiyor.` },
          { status: 400 }
        )
      }
      
      if (existingHolding.quantity < parseFloat(quantity)) {
        return NextResponse.json(
          { error: `Yetersiz miktar! ${symbol} için portföyünüzde ${existingHolding.quantity} adet var, ${quantity} adet satmaya çalışıyorsunuz.` },
          { status: 400 }
        )
      }
    }

    // ✅ 2. Validasyondan sonra Transaction ekle
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        symbol,
        asset_type,
        side,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        fee: parseFloat(fee || '0'),
        date: new Date(date).toISOString(),
        note: note || null,
        portfolio_id,
        user_id,
      })
      .select()
      .single()

    if (txError) throw txError

    // ✅ 3. Holding'i güncelle veya oluştur
    const { data: existingHolding } = await supabase
      .from('holdings')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .eq('symbol', symbol)
      .single()

    if (existingHolding) {
      // Mevcut holding'i güncelle
      let newQuantity = existingHolding.quantity
      let newAvgPrice = existingHolding.avg_price

      if (side === 'BUY') {
        // Alış işleminde: Miktar artır ve ortalama fiyat hesapla
        const totalCost = (existingHolding.quantity * existingHolding.avg_price) + (parseFloat(quantity) * parseFloat(price))
        newQuantity = existingHolding.quantity + parseFloat(quantity)
        newAvgPrice = totalCost / newQuantity
      } else {
        // Satış işleminde: Miktar azalt
        newQuantity = existingHolding.quantity - parseFloat(quantity)
      }

      if (newQuantity <= 0) {
        // Tüm varlık satıldıysa holding'i sil
        await supabase
          .from('holdings')
          .delete()
          .eq('id', existingHolding.id)
      } else {
        // Holding'i güncelle
        await supabase
          .from('holdings')
          .update({
            quantity: newQuantity,
            avg_price: newAvgPrice,
          })
          .eq('id', existingHolding.id)
      }
    } else if (side === 'BUY') {
      // Yeni holding oluştur (sadece alış işleminde)
      await supabase
        .from('holdings')
        .insert({
          symbol,
          asset_type,
          quantity: parseFloat(quantity),
          avg_price: parseFloat(price),
          portfolio_id,
          user_id,
        })
    }

    // ✅ 4. Activity kaydı yaz + Telegram bildirimi (sadece public portföyler için)
    try {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('is_public, name, slug')
        .eq('id', portfolio_id)
        .single()

      if (portfolio?.is_public) {
        const sideLabel = side === 'BUY' ? 'Alış' : 'Satış'
        const holdingClosed = side === 'SELL' && existingHolding && (existingHolding.quantity - parseFloat(quantity)) <= 0

        await supabase.from('portfolio_activities').insert({
          portfolio_id,
          actor_id: user_id,
          type: holdingClosed ? 'HOLDING_CLOSED' : 'NEW_TRADE',
          title: `${sideLabel}: ${quantity} ${symbol}`,
          metadata: { symbol, side, quantity: parseFloat(quantity), price: parseFloat(price), asset_type },
        })

        // ✅ 5. Telegram bildirimi (doğrudan Telegram API'ye)
        const botToken = process.env.TELEGRAM_BOT_TOKEN
        const channelId = process.env.TELEGRAM_CHANNEL_ID
        if (botToken && channelId) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          const isBuy = side === 'BUY'
          const sideStr = isBuy ? 'alış' : 'satış'
          const assetLabels: Record<string, string> = { TR_STOCK: 'hisse', US_STOCK: 'hisse', CRYPTO: 'kripto', CASH: 'nakit' }
          const assetLabel = assetLabels[asset_type] || 'varlık'
          const now = new Date()
          const dateStr = now.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
          const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

          let text = `📢 "<b>${portfolio.name}</b>" portföyüne yeni bir ${assetLabel} ${sideStr} işlemi eklendi, bilginize.\n\n`
          text += `📅 ${dateStr} · ${timeStr}\n`
          text += `📌 ${symbol}\n\n`
          text += `━━━━━━━━━━━━━━━\n\n`
          text += `<i>Portföy Röntgeni uygulaması VUCA'nın ücretsiz sunduğu bir uygulamadır. `
          text += `Piyasada tüm varlıklarımızı takip edebileceğimiz tek bir platformun olmamasından dolayı böyle bir uygulama geliştirilmiştir.\n\n`
          text += `Herkes kendi portföyünü oluşturabilir, bu portföyü özel ya da keşfet sayfasına düşecek şekilde halka açık yayınlayabilir.\n\n`
          text += `Halka açık portföyleri incelemek isterseniz web uygulamasına ücretsiz şekilde üye olmanız yeterli olacaktır.\n\n`
          text += `Detaylı bilgi için web uygulamasını ziyaret edebilirsiniz.</i>`

          // Inline keyboard butonları
          const buttons: { text: string; url: string }[][] = []
          if (portfolio.slug) {
            buttons.push([{ text: '📊 Portföyü İncele', url: `${appUrl}/p/${portfolio.slug}` }])
          }
          buttons.push([{ text: '🌐 Web Uygulamasını Ziyaret Et', url: appUrl }])

          const telegramBody: Record<string, unknown> = {
            chat_id: channelId,
            text,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }
          // Telegram inline butonlar sadece https URL kabul eder (localhost çalışmaz)
          if (!appUrl.includes('localhost')) {
            telegramBody.reply_markup = { inline_keyboard: buttons }
          }

          try {
            const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(telegramBody),
            })
            if (!tgRes.ok) {
              const errBody = await tgRes.json().catch(() => ({}))
              console.error('[Telegram Error]', errBody)
            }
          } catch (tgErr) {
            console.error('[Telegram Fetch Error]', tgErr)
          }
        }
      }
    } catch (activityError) {
      // Activity/Telegram yazılamasa bile işlem başarılı sayılır
      console.error('Activity insert error (non-blocking):', activityError)
    }

    return NextResponse.json({ success: true, data: transaction })
  } catch (error: unknown) {
    console.error('Transaction POST error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'İşlem ID gerekli' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Silinecek işlemi bul
    const { data: tx, error: fetchErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !tx) {
      return NextResponse.json({ error: 'İşlem bulunamadı' }, { status: 404 })
    }

    // 2. Holding etkisini geri al
    const { data: holding } = await supabase
      .from('holdings')
      .select('*')
      .eq('portfolio_id', tx.portfolio_id)
      .eq('symbol', tx.symbol)
      .single()

    if (tx.side === 'BUY') {
      // Alış siliniyor → holding'den miktarı düş
      if (holding) {
        const newQuantity = holding.quantity - tx.quantity
        if (newQuantity <= 0) {
          await supabase.from('holdings').delete().eq('id', holding.id)
        } else {
          // Ortalama fiyatı yeniden hesapla
          const totalCost = (holding.quantity * holding.avg_price) - (tx.quantity * tx.price)
          const newAvgPrice = totalCost / newQuantity
          await supabase
            .from('holdings')
            .update({ quantity: newQuantity, avg_price: Math.max(0, newAvgPrice) })
            .eq('id', holding.id)
        }
      }
    } else {
      // Satış siliniyor → holding'e miktarı geri ekle
      if (holding) {
        const newQuantity = holding.quantity + tx.quantity
        await supabase
          .from('holdings')
          .update({ quantity: newQuantity })
          .eq('id', holding.id)
      } else {
        // Holding yoksa yeniden oluştur (tamamı satılmıştı)
        await supabase.from('holdings').insert({
          symbol: tx.symbol,
          asset_type: tx.asset_type,
          quantity: tx.quantity,
          avg_price: tx.price,
          portfolio_id: tx.portfolio_id,
          user_id: tx.user_id,
        })
      }
    }

    // 3. İşlemi sil
    const { error: delErr } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (delErr) throw delErr

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Transaction DELETE error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
