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

    return NextResponse.json({ success: true, data: transaction })
  } catch (error: unknown) {
    console.error('Transaction POST error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
