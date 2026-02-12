import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function arrayToCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerLine = headers.map(escapeCSV).join(',')
  const dataLines = rows.map(row => row.map(escapeCSV).join(','))
  return [headerLine, ...dataLines].join('\n')
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const exportType = searchParams.get('type')
    const userId = searchParams.get('user_id')

    if (!exportType || !userId) {
      return NextResponse.json(
        { error: 'type ve user_id parametreleri gerekli' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Kullanıcı doğrulama
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    let csvContent = ''
    const dateStr = new Date().toISOString().split('T')[0]

    if (exportType === 'holdings' || exportType === 'full') {
      const { data: holdings, error: holdingsErr } = await supabase
        .from('holdings')
        .select('*, portfolios:portfolio_id(name)')
        .eq('user_id', userId)
        .order('symbol')

      if (holdingsErr) throw holdingsErr

      const holdingsHeaders = ['Portföy', 'Sembol', 'Varlık Tipi', 'Miktar', 'Ortalama Maliyet (TRY)', 'Toplam Maliyet (TRY)', 'Not', 'Eklenme Tarihi']
      const holdingsRows = (holdings || []).map(h => {
        const portfolio = h.portfolios as { name: string } | null
        return [
          portfolio?.name || '-',
          h.symbol,
          h.asset_type,
          h.quantity,
          h.avg_price,
          (h.quantity * h.avg_price).toFixed(2),
          h.note,
          h.created_at ? new Date(h.created_at).toLocaleDateString('tr-TR') : '',
        ]
      })

      if (exportType === 'holdings') {
        csvContent = arrayToCSV(holdingsHeaders, holdingsRows)
      } else {
        csvContent += '=== VARLIKLAR ===\n'
        csvContent += arrayToCSV(holdingsHeaders, holdingsRows)
        csvContent += '\n\n'
      }
    }

    if (exportType === 'transactions' || exportType === 'full') {
      const { data: transactions, error: txErr } = await supabase
        .from('transactions')
        .select('*, portfolios:portfolio_id(name)')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (txErr) throw txErr

      const txHeaders = ['Portföy', 'Tarih', 'Sembol', 'Varlık Tipi', 'İşlem', 'Miktar', 'Fiyat (TRY)', 'Toplam (TRY)', 'Komisyon (TRY)', 'Not']
      const txRows = (transactions || []).map(t => {
        const portfolio = t.portfolios as { name: string } | null
        return [
          portfolio?.name || '-',
          t.date ? new Date(t.date).toLocaleDateString('tr-TR') : '',
          t.symbol,
          t.asset_type,
          t.side === 'BUY' ? 'ALIŞ' : 'SATIŞ',
          t.quantity,
          t.price,
          (t.quantity * t.price).toFixed(2),
          t.fee || 0,
          t.note,
        ]
      })

      if (exportType === 'transactions') {
        csvContent = arrayToCSV(txHeaders, txRows)
      } else {
        csvContent += '=== İŞLEM GEÇMİŞİ ===\n'
        csvContent += arrayToCSV(txHeaders, txRows)
        csvContent += '\n\n'

        // Rapor özeti
        const totalBuy = (transactions || [])
          .filter(t => t.side === 'BUY')
          .reduce((sum, t) => sum + (t.quantity * t.price), 0)
        const totalSell = (transactions || [])
          .filter(t => t.side === 'SELL')
          .reduce((sum, t) => sum + (t.quantity * t.price), 0)

        csvContent += '=== ÖZET ===\n'
        csvContent += `Rapor Tarihi,${dateStr}\n`
        csvContent += `Toplam Alış Tutarı (TRY),${totalBuy.toFixed(2)}\n`
        csvContent += `Toplam Satış Tutarı (TRY),${totalSell.toFixed(2)}\n`
        csvContent += `Toplam İşlem Sayısı,${(transactions || []).length}\n`
      }
    }

    // BOM ekleyerek Türkçe karakterleri Excel'de doğru göster
    const bom = '\uFEFF'
    const finalContent = bom + csvContent

    return new NextResponse(finalContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="export-${exportType}-${dateStr}.csv"`,
      },
    })
  } catch (error: unknown) {
    console.error('Export error:', error)
    const message = error instanceof Error ? error.message : 'Bir hata oluştu'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
