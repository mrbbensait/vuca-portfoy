'use client'

import { useState } from 'react'
import { Holding } from '@/lib/types/database.types'
import { Trash2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { useHoldingPrice } from './PriceProvider'
import { formatPrice, formatLargeNumber } from '@/lib/formatPrice'
import Blur from './PrivacyBlur'

const ASSET_TYPE_LABELS: Record<string, string> = {
  TR_STOCK: 'BIST',
  US_STOCK: 'ABD',
  CRYPTO: 'Kripto',
  CASH: 'Nakit',
}

const CASH_SYMBOL_NAMES: Record<string, string> = {
  TRY: 'Türk Lirası',
  USD: 'Amerikan Doları',
  EUR: 'Euro',
  GOLD: 'Gram Altın',
  SILVER: 'Gram Gümüş',
}

const ASSET_TYPE_COLORS: Record<string, string> = {
  CRYPTO: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-100',
  TR_STOCK: 'bg-red-50 hover:bg-red-100 border-red-100',
  US_STOCK: 'bg-blue-50 hover:bg-blue-100 border-blue-100',
  CASH: 'bg-gray-50 hover:bg-gray-100 border-gray-100',
}

const ASSET_TYPE_BADGE_COLORS: Record<string, string> = {
  CRYPTO: 'bg-yellow-200 text-yellow-800',
  TR_STOCK: 'bg-red-200 text-red-800',
  US_STOCK: 'bg-blue-200 text-blue-800',
  CASH: 'bg-gray-200 text-gray-800',
}

interface HoldingItemProps {
  holding: Holding
  userId: string
  portfolioId: string
}

export default function HoldingItem({ holding }: HoldingItemProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // ⚡ Merkezi fiyat sistemi - tüm varlıklar tek seferde çekilir
  const { price: priceData, loading: loadingPrice } = useHoldingPrice(holding.symbol)
  const currentPrice = priceData?.price || null
  const currency = priceData?.currency || 'USD'
  const currencySymbol = currency === 'TRY' ? '₺' : '$'

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/holdings/${holding.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Silme işlemi başarısız')
      }

      // Sayfayı yenile
      window.location.reload()
    } catch (error) {
      console.error('Silme hatası:', error)
      alert('❌ Varlık silinemedi. Lütfen tekrar deneyin.')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  // Hesaplamalar
  const costBasis = holding.quantity * holding.avg_price // Toplam Alış
  const currentTotal = currentPrice ? holding.quantity * currentPrice : null // Güncel Toplam
  const profitLoss = currentTotal ? currentTotal - costBasis : null // Kar/Zarar miktarı
  const profitLossPercent = profitLoss ? (profitLoss / costBasis) * 100 : null // % Kar/Zarar

  // Tarihi formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  const rowColorClass = ASSET_TYPE_COLORS[holding.asset_type] || ASSET_TYPE_COLORS.CASH
  const badgeColorClass = ASSET_TYPE_BADGE_COLORS[holding.asset_type] || ASSET_TYPE_BADGE_COLORS.CASH

  return (
    <>
      {/* Desktop View - Table Row Style */}
      <div className={`hidden lg:grid lg:grid-cols-10 gap-3 px-4 py-2.5 items-center border-b transition-colors ${rowColorClass}`}>
        {/* Symbol & Type */}
        <div className="col-span-1">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-gray-900">
              {holding.asset_type === 'CASH' && CASH_SYMBOL_NAMES[holding.symbol]
                ? CASH_SYMBOL_NAMES[holding.symbol]
                : holding.symbol}
            </h3>
            <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded w-fit ${badgeColorClass}`}>
              {ASSET_TYPE_LABELS[holding.asset_type]}
            </span>
          </div>
        </div>
        
        {/* Miktar */}
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900"><Blur>{holding.quantity.toLocaleString('en-US')}</Blur></p>
        </div>
        
        {/* Maliyet */}
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900"><Blur>{currencySymbol}{formatPrice(holding.avg_price)}</Blur></p>
        </div>
        
        {/* Güncel Fiyat */}
        <div className="text-right">
          {loadingPrice ? (
            <p className="text-xs text-gray-400">...</p>
          ) : currentPrice ? (
            <p className="text-sm font-medium text-gray-900"><Blur>{currencySymbol}{formatPrice(currentPrice)}</Blur></p>
          ) : (
            <p className="text-xs text-gray-400">N/A</p>
          )}
        </div>
        
        {/* Toplam Alış */}
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900"><Blur>{currencySymbol}{formatLargeNumber(costBasis)}</Blur></p>
        </div>
        
        {/* Güncel Toplam */}
        <div className="text-right">
          {currentTotal ? (
            <p className="text-sm font-medium text-gray-900"><Blur>{currencySymbol}{formatLargeNumber(currentTotal)}</Blur></p>
          ) : (
            <p className="text-xs text-gray-400">N/A</p>
          )}
        </div>
        
        {/* Kar/Zarar % */}
        <div className="text-right">
          {profitLossPercent !== null ? (
            <div className="flex items-center justify-end gap-1">
              {profitLossPercent >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <p className={`text-sm font-bold ${profitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400">N/A</p>
          )}
        </div>
        
        {/* Kar/Zarar $ */}
        <div className="text-right">
          {profitLoss !== null ? (
            <p className={`text-sm font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <Blur>{profitLoss >= 0 ? '+' : ''}{currencySymbol}{formatLargeNumber(Math.abs(profitLoss))}</Blur>
            </p>
          ) : (
            <p className="text-xs text-gray-400">N/A</p>
          )}
        </div>
        
        {/* Eklenme Tarihi */}
        <div className="text-right">
          <p className="text-xs text-gray-600">{formatDate(holding.created_at)}</p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-1 justify-end">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-1.5 text-red-600 hover:bg-red-200 rounded transition-colors"
            title="Sil"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tablet View - Compact Cards */}
      <div className={`hidden md:block lg:hidden border-b transition-colors ${rowColorClass}`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">
                {holding.asset_type === 'CASH' && CASH_SYMBOL_NAMES[holding.symbol]
                  ? CASH_SYMBOL_NAMES[holding.symbol]
                  : holding.symbol}
              </h3>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded ${badgeColorClass}`}>
                {ASSET_TYPE_LABELS[holding.asset_type]}
              </span>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-1.5 text-red-600 hover:bg-red-200 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Miktar</p>
              <p className="font-medium text-gray-900"><Blur>{holding.quantity.toLocaleString('en-US')}</Blur></p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Maliyet</p>
              <p className="font-medium text-gray-900"><Blur>{currencySymbol}{formatPrice(holding.avg_price)}</Blur></p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Güncel</p>
              {loadingPrice ? (
                <p className="text-xs text-gray-400">...</p>
              ) : currentPrice ? (
                <p className="font-medium text-gray-900"><Blur>{currencySymbol}{formatPrice(currentPrice)}</Blur></p>
              ) : (
                <p className="text-xs text-gray-400">N/A</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Tarih</p>
              <p className="text-xs font-medium text-gray-700">{formatDate(holding.created_at)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3 text-sm mt-2">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Toplam Alış</p>
              <p className="font-medium text-gray-900"><Blur>{currencySymbol}{formatLargeNumber(costBasis)}</Blur></p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Güncel Toplam</p>
              {currentTotal ? (
                <p className="font-medium text-gray-900"><Blur>{currencySymbol}{formatLargeNumber(currentTotal)}</Blur></p>
              ) : (
                <p className="text-xs text-gray-400">N/A</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">% K/Z</p>
              {profitLossPercent !== null ? (
                <div className="flex items-center gap-1">
                  {profitLossPercent >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                  <p className={`text-sm font-bold ${profitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-400">N/A</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">K/Z</p>
              {profitLoss !== null ? (
                <p className={`text-sm font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <Blur>{profitLoss >= 0 ? '+' : ''}{currencySymbol}{formatLargeNumber(Math.abs(profitLoss))}</Blur>
                </p>
              ) : (
                <p className="text-xs text-gray-400">N/A</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View - Stacked Cards */}
      <div className={`md:hidden border-b transition-colors ${rowColorClass}`}>
        <div className="px-3 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-gray-900">
                {holding.asset_type === 'CASH' && CASH_SYMBOL_NAMES[holding.symbol]
                  ? CASH_SYMBOL_NAMES[holding.symbol]
                  : holding.symbol}
              </h3>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded w-fit ${badgeColorClass}`}>
                {ASSET_TYPE_LABELS[holding.asset_type]}
              </span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-1.5 text-red-600 hover:bg-red-200 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Miktar:</span>
              <span className="font-medium text-gray-900"><Blur>{holding.quantity.toLocaleString('en-US')}</Blur></span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Maliyet:</span>
              <span className="font-medium text-gray-900"><Blur>{currencySymbol}{formatPrice(holding.avg_price)}</Blur></span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Güncel:</span>
              {loadingPrice ? (
                <span className="text-xs text-gray-400">Yükleniyor...</span>
              ) : currentPrice ? (
                <span className="font-medium text-gray-900"><Blur>{currencySymbol}{formatPrice(currentPrice)}</Blur></span>
              ) : (
                <span className="text-xs text-gray-400">N/A</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Toplam Alış:</span>
              <span className="font-medium text-gray-900"><Blur>{currencySymbol}{formatLargeNumber(costBasis)}</Blur></span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Güncel Toplam:</span>
              {currentTotal ? (
                <span className="font-medium text-gray-900"><Blur>{currencySymbol}{formatLargeNumber(currentTotal)}</Blur></span>
              ) : (
                <span className="text-xs text-gray-400">N/A</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Kar/Zarar:</span>
              {profitLossPercent !== null && profitLoss !== null ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {profitLossPercent >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <span className={`text-sm font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <Blur>{profitLoss >= 0 ? '+' : ''}{currencySymbol}{formatLargeNumber(Math.abs(profitLoss))}</Blur>
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ({profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%)
                  </span>
                </div>
              ) : (
                <span className="text-xs text-gray-400">N/A</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Eklenme:</span>
              <span className="text-xs font-medium text-gray-700">{formatDate(holding.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Silme Onay Modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Varlığı Sil
              </h3>
              
              <p className="text-gray-600 mb-1">
                <strong>{holding.symbol}</strong> varlığını silmek istediğinizden emin misiniz?
              </p>
              
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg w-full">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Bu işlem geri alınamaz!
                </p>
                <p className="text-xs text-red-700 mt-2 leading-relaxed">
                  Bu varlık silindiğinde:
                </p>
                <ul className="text-xs text-red-700 mt-1 space-y-0.5 list-disc list-inside">
                  <li>Varlık kaydı silinecek</li>
                  <li><strong>Bu varlığa ait tüm işlem geçmişi silinecek</strong></li>
                  <li>İlgili notlar silinecek</li>
                </ul>
              </div>
              
              <div className="flex gap-3 mt-6 w-full">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Siliniyor...' : 'Evet, Sil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
