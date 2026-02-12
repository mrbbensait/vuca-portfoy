'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface DataExportProps {
  userId: string
}

interface HoldingData {
  portfolioName: string
  symbol: string
  assetType: string
  quantity: number
  avgPrice: number
  currentPrice: number
  currency: string
  currencySymbol: string
  costBasis: number
  currentTotal: number
  profitLoss: number
  profitLossPercent: number
  valueTry: number
  costTry: number
  createdAt: string
}

interface PdfApiResponse {
  success: boolean
  error?: string
  data: {
    holdings: HoldingData[]
    summary: {
      totalTry: number
      totalUsd: number
      totalCostTry: number
      totalCostUsd: number
      totalPL: number
      totalPLPercent: number
      holdingCount: number
    }
    usdTryRate: number
  }
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  TR_STOCK: 'BIST',
  US_STOCK: 'ABD',
  CRYPTO: 'Kripto',
  CASH: 'Nakit',
}

const CASH_SYMBOL_NAMES: Record<string, string> = {
  TRY: 'Turk Lirasi',
  USD: 'Amerikan Dolari',
  EUR: 'Euro',
  GOLD: 'Gram Altin',
  SILVER: 'Gram Gumus',
}

function formatNum(num: number): string {
  return num.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function formatNumUSD(num: number): string {
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function formatPriceVal(price: number): string {
  const abs = Math.abs(price)
  if (abs < 0.01 && abs > 0) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })
  if (abs < 1) return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
  if (abs < 10000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// jsPDF Helvetica does not support ₺ — use "TL" instead
function pdfCurrency(currency: string): string {
  return currency === 'TRY' ? 'TL' : '$'
}

function generateHoldingsPDF(apiData: PdfApiResponse['data']) {
  const { holdings, summary, usdTryRate } = apiData
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // -- HEADER --
  doc.setFillColor(30, 41, 59) // slate-800
  doc.rect(0, 0, pageWidth, 28, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text('Portfoy Varliklari Raporu', 14, 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(203, 213, 225) // slate-300
  doc.text('VUCA Portfoy Rontgeni', 14, 20)

  // Tarih & saat sag ust
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const dateTimeStr = `${day}.${month}.${year} ${hour}:${minute}`

  doc.setFontSize(9)
  doc.setTextColor(203, 213, 225)
  doc.text(dateTimeStr, pageWidth - 14, 13, { align: 'right' })

  doc.setFontSize(7)
  doc.setTextColor(148, 163, 184) // slate-400
  doc.text('USD/TRY: ' + usdTryRate.toFixed(4), pageWidth - 14, 20, { align: 'right' })

  // -- SUMMARY BOXES --
  const boxY = 34
  const boxH = 22
  const boxGap = 5
  const boxCount = 4
  const totalBoxWidth = pageWidth - 28
  const boxW = (totalBoxWidth - (boxCount - 1) * boxGap) / boxCount
  const boxes = [
    {
      label: 'Toplam Deger (TRY)',
      value: 'TL ' + formatNum(summary.totalTry),
      sub: summary.holdingCount + ' varlik',
      bgColor: [30, 41, 59] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      subColor: [148, 163, 184] as [number, number, number],
    },
    {
      label: 'Toplam Deger (USD)',
      value: '$' + formatNumUSD(summary.totalUsd),
      sub: summary.holdingCount + ' varlik',
      bgColor: [37, 99, 235] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      subColor: [191, 219, 254] as [number, number, number],
    },
    {
      label: 'Realize Edilmemis K/Z',
      value: (summary.totalPL >= 0 ? '+' : '-') + 'TL ' + formatNum(Math.abs(summary.totalPL)),
      sub: (summary.totalPLPercent >= 0 ? '+' : '') + summary.totalPLPercent.toFixed(2) + '%',
      bgColor: summary.totalPL >= 0 ? [16, 185, 129] as [number, number, number] : [239, 68, 68] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      subColor: [255, 255, 255] as [number, number, number],
    },
    {
      label: 'Toplam Yatirim',
      value: 'TL ' + formatNum(summary.totalCostTry),
      sub: '$' + formatNumUSD(summary.totalCostUsd),
      bgColor: [147, 51, 234] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      subColor: [233, 213, 255] as [number, number, number],
    },
  ]

  boxes.forEach((box, i) => {
    const x = 14 + i * (boxW + boxGap)
    doc.setFillColor(box.bgColor[0], box.bgColor[1], box.bgColor[2])
    doc.roundedRect(x, boxY, boxW, boxH, 2, 2, 'F')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(box.subColor[0], box.subColor[1], box.subColor[2])
    doc.text(box.label, x + 4, boxY + 6)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(box.textColor[0], box.textColor[1], box.textColor[2])
    doc.text(box.value, x + 4, boxY + 14)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(box.subColor[0], box.subColor[1], box.subColor[2])
    doc.text(box.sub, x + 4, boxY + 19)
  })

  // -- TABLE --
  // Group holdings by asset type (same order as portfolio page)
  const bistHoldings = holdings.filter(h => h.assetType === 'TR_STOCK')
  const abdHoldings = holdings.filter(h => h.assetType === 'US_STOCK')
  const cryptoHoldings = holdings.filter(h => h.assetType === 'CRYPTO')
  const bottomSymbols = ['USD', 'EUR', 'GOLD', 'SILVER', 'TRY']
  const bottomOrder: Record<string, number> = { USD: 0, EUR: 1, GOLD: 2, SILVER: 3, TRY: 4 }
  const bottomHoldings = holdings
    .filter(h => bottomSymbols.includes(h.symbol))
    .sort((a, b) => (bottomOrder[a.symbol] ?? 99) - (bottomOrder[b.symbol] ?? 99))
  const mainHoldings = [...bistHoldings, ...abdHoldings, ...cryptoHoldings]
    .filter(h => !bottomSymbols.includes(h.symbol))

  const orderedHoldings = [...mainHoldings, ...bottomHoldings]

  const tableHeaders = [
    ['Sembol', 'Tip', 'Miktar', 'Maliyet', 'Guncel Fiyat', 'Toplam Alis', 'Guncel Toplam', '% K/Z', 'Kar/Zarar', 'Eklenme']
  ]

  const tableBody = orderedHoldings.map(h => {
    const displayName = (h.assetType === 'CASH' && CASH_SYMBOL_NAMES[h.symbol])
      ? CASH_SYMBOL_NAMES[h.symbol]
      : h.symbol
    const cs = pdfCurrency(h.currency) + ' '
    const plSign = h.profitLoss >= 0 ? '+' : ''
    const plPctSign = h.profitLossPercent >= 0 ? '+' : ''

    return [
      displayName,
      ASSET_TYPE_LABELS[h.assetType] || h.assetType,
      h.quantity.toLocaleString('en-US'),
      cs + formatPriceVal(h.avgPrice),
      cs + formatPriceVal(h.currentPrice),
      cs + formatNum(h.costBasis),
      cs + formatNum(h.currentTotal),
      plPctSign + h.profitLossPercent.toFixed(2) + '%',
      plSign + cs + formatNum(Math.abs(h.profitLoss)),
      h.createdAt,
    ]
  })

  const tableStartY = boxY + boxH + 8

  autoTable(doc, {
    startY: tableStartY,
    head: tableHeaders,
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      lineColor: [229, 231, 235],
      lineWidth: 0.3,
      textColor: [31, 41, 55],
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [55, 65, 81],
      fontStyle: 'bold',
      fontSize: 6.5,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 30 },
      1: { halign: 'center', cellWidth: 14 },
      2: { halign: 'right', cellWidth: 22 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 30 },
      5: { halign: 'right', cellWidth: 30 },
      6: { halign: 'right', cellWidth: 30 },
      7: { halign: 'right', cellWidth: 18 },
      8: { halign: 'right', cellWidth: 30 },
      9: { halign: 'center', cellWidth: 22 },
    },
    bodyStyles: {
      halign: 'right',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const cellText = String(data.cell.raw)
        // Color the K/Z % and Kar/Zarar columns
        if (data.column.index === 7 || data.column.index === 8) {
          if (cellText.startsWith('+')) {
            data.cell.styles.textColor = [5, 150, 105] // emerald-600
            data.cell.styles.fontStyle = 'bold'
          } else if (cellText.startsWith('-')) {
            data.cell.styles.textColor = [220, 38, 38] // red-600
            data.cell.styles.fontStyle = 'bold'
          }
        }
        // Color asset type badges
        if (data.column.index === 1) {
          if (cellText === 'BIST') { data.cell.styles.textColor = [185, 28, 28] }
          else if (cellText === 'ABD') { data.cell.styles.textColor = [29, 78, 216] }
          else if (cellText === 'Kripto') { data.cell.styles.textColor = [180, 83, 9] }
          else if (cellText === 'Nakit') { data.cell.styles.textColor = [75, 85, 99] }
        }
      }
    },
    margin: { left: 14, right: 14 },
  })

  // -- FOOTER --
  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || (pageHeight - 20)
  const footerY = Math.min(finalY + 8, pageHeight - 12)

  doc.setFontSize(6.5)
  doc.setTextColor(156, 163, 175) // gray-400
  doc.text(
    'Not: ABD ve BIST hisse fiyatlari piyasa acikken 15 dakika gecikmeli olarak guncellenir. Kripto fiyatlar anlik olarak alinir.',
    14,
    footerY
  )
  doc.text(
    'Bu rapor bilgilendirme amaclidir, yatirim tavsiyesi degildir. | VUCA Portfoy Rontgeni',
    14,
    footerY + 4
  )

  // Save
  const dateStr = now.toISOString().split('T')[0]
  doc.save(`portfoy-varliklari-${dateStr}.pdf`)
}

export default function DataExport({ userId }: DataExportProps) {
  const { activePortfolio } = usePortfolio()
  const [loadingType, setLoadingType] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleExportCSV = async (exportType: 'transactions' | 'full') => {
    setLoadingType(exportType)
    setMessage(null)

    try {
      const response = await fetch(`/api/export?type=${exportType}&user_id=${userId}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Disa aktarma basarisiz')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      const dateStr = new Date().toISOString().split('T')[0]
      const fileNames: Record<string, string> = {
        transactions: `islem-gecmisi-${dateStr}.csv`,
        full: `portfoy-rapor-${dateStr}.csv`,
      }

      a.download = fileNames[exportType]
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setMessage({ type: 'success', text: 'Dosya başarıyla indirildi' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bir hata oluştu'
      setMessage({ type: 'error', text: msg })
    } finally {
      setLoadingType(null)
    }
  }

  const handleExportPDF = async () => {
    setLoadingType('holdings')
    setMessage(null)

    try {
      const portfolioParam = activePortfolio ? `&portfolio_id=${activePortfolio.id}` : ''
      const response = await fetch(`/api/export/pdf?user_id=${userId}${portfolioParam}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'PDF oluşturulamadı')
      }

      const result: PdfApiResponse = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'PDF verisi alınamadı')
      }

      generateHoldingsPDF(result.data)

      setMessage({ type: 'success', text: 'PDF başarıyla indirildi' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bir hata oluştu'
      setMessage({ type: 'error', text: msg })
    } finally {
      setLoadingType(null)
    }
  }

  const exportOptions = [
    {
      type: 'holdings' as const,
      icon: FileSpreadsheet,
      title: 'Portföy Varlıkları',
      description: 'Varlık tablosu, özet kutular ve güncel fiyat bilgileri ile PDF raporu',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      format: 'PDF',
    },
    {
      type: 'transactions' as const,
      icon: FileText,
      title: 'İşlem Geçmişi',
      description: 'Tüm alış/satış işlemleriniz, tarih ve fiyat bilgileriyle',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      format: 'CSV',
    },
    {
      type: 'full' as const,
      icon: Download,
      title: 'Tam Portföy Raporu',
      description: 'Varlıklar + işlem geçmişi + portföy özeti tek dosyada',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      format: 'CSV',
    },
  ]

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exportOptions.map((option) => {
          const Icon = option.icon
          const isLoading = loadingType === option.type

          return (
            <button
              key={option.type}
              onClick={() => option.type === 'holdings' ? handleExportPDF() : handleExportCSV(option.type)}
              disabled={loadingType !== null}
              className={`${option.bgColor} border ${option.borderColor} rounded-lg p-4 text-left hover:shadow-md transition-all disabled:opacity-50 group`}
            >
              <div className="flex items-center gap-2 mb-2">
                {isLoading ? (
                  <Loader2 className={`w-5 h-5 ${option.color} animate-spin`} />
                ) : (
                  <Icon className={`w-5 h-5 ${option.color}`} />
                )}
                <h4 className={`font-semibold text-sm ${option.color}`}>
                  {option.title}
                </h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {option.description}
              </p>
              <div className={`mt-3 text-xs font-medium ${option.color} group-hover:underline`}>
                {isLoading ? 'Hazırlanıyor...' : `${option.format} olarak indir →`}
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-500">
        Portföy varlıkları PDF formatında, diğer dosyalar CSV formatında indirilir.
      </p>
    </div>
  )
}
