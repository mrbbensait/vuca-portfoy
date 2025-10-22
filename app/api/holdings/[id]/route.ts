import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * DELETE: Holding silme
 * ⚠️ Bu işlem geri alınamaz!
 * ✅ Holding ile birlikte ilgili tüm transaction'lar da silinir
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // 1. Önce holding bilgilerini al (transaction'ları silmek için gerekli)
    const { data: holding, error: fetchError } = await supabase
      .from('holdings')
      .select('portfolio_id, symbol, asset_type')
      .eq('id', id)
      .single()

    if (fetchError || !holding) {
      return NextResponse.json(
        { error: 'Varlık bulunamadı' },
        { status: 404 }
      )
    }

    // 2. Bu varlığa ait tüm transaction'ları sil
    const { error: txDeleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('portfolio_id', holding.portfolio_id)
      .eq('symbol', holding.symbol)
      .eq('asset_type', holding.asset_type)

    if (txDeleteError) {
      console.error('Transaction silme hatası:', txDeleteError)
      // Transaction silme başarısız olsa bile devam et
    }

    // 3. Bu varlığa ait notları sil (scope='POSITION' olan)
    const { error: notesDeleteError } = await supabase
      .from('notes')
      .delete()
      .eq('portfolio_id', holding.portfolio_id)
      .eq('symbol', holding.symbol)
      .eq('scope', 'POSITION')

    if (notesDeleteError) {
      console.error('Notes silme hatası:', notesDeleteError)
      // Notes silme başarısız olsa bile devam et
    }

    // 4. Bu varlığa ait alertleri sil (payload içinde sembol olanlar)
    // Not: Bu basit bir yaklaşım, daha gelişmiş JSONB query yapılabilir
    const { data: alerts } = await supabase
      .from('alerts')
      .select('id, payload')
      .eq('portfolio_id', holding.portfolio_id)

    if (alerts && alerts.length > 0) {
      const alertIdsToDelete = alerts
        .filter(alert => {
          const payload = alert.payload as { symbol?: string }
          return payload.symbol === holding.symbol
        })
        .map(alert => alert.id)

      if (alertIdsToDelete.length > 0) {
        await supabase
          .from('alerts')
          .delete()
          .in('id', alertIdsToDelete)
      }
    }

    // 5. Holding'i sil
    const { error: holdingDeleteError } = await supabase
      .from('holdings')
      .delete()
      .eq('id', id)

    if (holdingDeleteError) throw holdingDeleteError

    return NextResponse.json({ 
      success: true,
      message: 'Varlık ve ilgili tüm veriler silindi'
    })
  } catch (error: unknown) {
    console.error('Holdings DELETE error:', error)
    const message = error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
