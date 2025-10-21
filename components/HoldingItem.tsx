'use client'

import { Holding } from '@/lib/types/database.types'
import { Trash2 } from 'lucide-react'

const ASSET_TYPE_LABELS: Record<string, string> = {
  TR_STOCK: 'TR Hisse',
  US_STOCK: 'ABD Hisse',
  CRYPTO: 'Kripto',
  CASH: 'Nakit',
}

interface HoldingItemProps {
  holding: Holding
  userId: string
  portfolioId: string
}

export default function HoldingItem({ holding }: HoldingItemProps) {

  const handleDelete = async () => {
    if (!confirm(`${holding.symbol} varlığını silmek istediğinizden emin misiniz?`)) {
      return
    }

    // DEMO MODE: Sadece UI göster
    alert('🗑️ Varlık silindi! (Demo Mode - Sayfa yenilenince geri gelecek)')
  }

  const totalValue = holding.quantity * holding.avg_price

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{holding.symbol}</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
              {ASSET_TYPE_LABELS[holding.asset_type]}
            </span>
          </div>
          
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Miktar</p>
              <p className="font-medium text-gray-900">{holding.quantity.toLocaleString('tr-TR')}</p>
            </div>
            <div>
              <p className="text-gray-500">Ort. Fiyat</p>
              <p className="font-medium text-gray-900">₺{holding.avg_price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-gray-500">Toplam Değer</p>
              <p className="font-medium text-gray-900">₺{totalValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</p>
            </div>
            <div>
              <p className="text-gray-500">Not</p>
              <p className="font-medium text-gray-900 truncate">{holding.note || '-'}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
